import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCommanderSession, readCommanderSession } from '../server/lyra/lyra.session.js';
import { createOAuthState, consumeOAuthState } from '../server/accounts/oauth-state.js';
import { decryptRecord, encryptRecord, sha256 } from '../server/accounts/crypto.js';
import { getSecureRecord, getStorageStatus, setSecureRecord, setStorageFileForTests } from '../server/accounts/storage.js';
import { buildAuthorizationUrl, callbackUrl, requirePublicUrl } from '../server/accounts/providers.js';
import { completeAccountLink, getAccountStatuses, startAccountLink } from '../server/accounts/service.js';
import { getProvider, providerUsesPkce } from '../server/platform/integrations.js';
import accountsHandler from '../api/accounts.js';
import { validateFunctionBudget } from '../scripts/check-vercel-functions.mjs';

function responseCapture() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; }
  };
}

test('account linking security invariants', async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.COMMANDER_SESSION_SECRET = 'commander-session-secret-for-tests';
  process.env.ATLAS_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  process.env.ATLAS_PUBLIC_URL = 'https://atlas.example';
  process.env.TWITCH_CLIENT_ID = 'client-id';
  process.env.TWITCH_CLIENT_SECRET = 'client-secret';
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-account-tests-'));
  const storageFile = path.join(directory, 'links.json');
  setStorageFileForTests(storageFile);

  await t.test('standard users and forged local OMEGA claims are rejected', async () => {
    const response = responseCapture();
    await accountsHandler({ method: 'GET', headers: {}, query: { route: 'start', provider: 'twitch' }, body: { clearance: 'OMEGA' } }, response);
    assert.equal(response.statusCode, 401);
  });

  await t.test('only a valid signed HttpOnly session produces a binding', () => {
    const token = createCommanderSession();
    assert.ok(readCommanderSession({ headers: { cookie: `ta_commander_session=${token}` } })?.binding);
    assert.equal(readCommanderSession({ headers: { cookie: 'ta_commander_session=forged.omega' } }), null);
  });

  await t.test('forged and expired state are rejected', async () => {
    await assert.rejects(() => consumeOAuthState('forged', 'twitch', 'session-a'), /oauth_state_invalid_or_replayed/);
    const expired = 'expired-state';
    await setSecureRecord(`atlas:oauth-state:${sha256(expired)}`, { provider: 'twitch', sessionBinding: 'session-a', expiresAt: Date.now() - 1 });
    await assert.rejects(() => consumeOAuthState(expired, 'twitch', 'session-a'), /oauth_state_expired/);
  });

  await t.test('provider and session mismatches are rejected', async () => {
    const providerState = await createOAuthState('twitch', 'session-a', true);
    await assert.rejects(() => consumeOAuthState(providerState.state, 'x', 'session-a'), /oauth_provider_mismatch/);
    const sessionState = await createOAuthState('twitch', 'session-a', true);
    await assert.rejects(() => consumeOAuthState(sessionState.state, 'twitch', 'session-b'), /oauth_session_mismatch/);
  });

  await t.test('consolidated callback atomically rejects routed provider mismatch', async () => {
    const token = createCommanderSession();
    const session = readCommanderSession({ headers: { cookie: `ta_commander_session=${token}` } });
    const transaction = await createOAuthState('twitch', session.binding, false);
    const response = responseCapture();
    await accountsHandler({
      method: 'GET',
      headers: { cookie: `ta_commander_session=${token}` },
      query: { route: 'callback', provider: 'x', state: transaction.state }
    }, response);
    assert.equal(response.statusCode, 303);
    assert.match(response.headers.Location, /result=oauth_provider_mismatch$/);
    await assert.rejects(
      () => consumeOAuthState(transaction.state, 'twitch', session.binding),
      /oauth_state_invalid_or_replayed/
    );
  });

  await t.test('duplicate callbacks atomically consume state once', async () => {
    const transaction = await createOAuthState('twitch', 'session-a', true);
    const results = await Promise.allSettled([
      consumeOAuthState(transaction.state, 'twitch', 'session-a'),
      consumeOAuthState(transaction.state, 'twitch', 'session-a')
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter((result) => result.status === 'rejected').length, 1);
  });

  await t.test('missing encryption key fails closed', () => {
    const key = process.env.ATLAS_TOKEN_ENCRYPTION_KEY;
    delete process.env.ATLAS_TOKEN_ENCRYPTION_KEY;
    assert.throws(() => encryptRecord({ accessToken: 'secret' }, 'record'), /encryption_key_unavailable/);
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY = key;
  });

  await t.test('token encryption supports explicit key rotation fallback', () => {
    const activeKey = process.env.ATLAS_TOKEN_ENCRYPTION_KEY;
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 3).toString('base64');
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY_ID = 'old-key';
    const encrypted = encryptRecord({ accessToken: 'rotation-secret' }, 'rotation-record');
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY_PREVIOUS = process.env.ATLAS_TOKEN_ENCRYPTION_KEY;
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY_PREVIOUS_ID = 'old-key';
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 4).toString('base64');
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY_ID = 'new-key';
    assert.equal(decryptRecord(encrypted, 'rotation-record').accessToken, 'rotation-secret');
    process.env.ATLAS_TOKEN_ENCRYPTION_KEY = activeKey;
    delete process.env.ATLAS_TOKEN_ENCRYPTION_KEY_ID;
    delete process.env.ATLAS_TOKEN_ENCRYPTION_KEY_PREVIOUS;
    delete process.env.ATLAS_TOKEN_ENCRYPTION_KEY_PREVIOUS_ID;
  });

  await t.test('tokens remain encrypted and never appear in status output', async () => {
    await setSecureRecord('atlas:account-link:twitch', { provider: 'twitch', accessToken: 'top-secret-token', expiresAt: Date.now() + 60_000 });
    const raw = await fs.readFile(storageFile, 'utf8');
    assert.equal(raw.includes('top-secret-token'), false);
    assert.equal(JSON.stringify(await getAccountStatuses()).includes('top-secret-token'), false);
    assert.notEqual((await getAccountStatuses()).providers.youtube.status, 'LINKED');
    assert.equal((await getSecureRecord('atlas:account-link:twitch')).accessToken, 'top-secret-token');
  });

  await t.test('linked accounts permit voluntary reauthorization', async () => {
    const status = await getAccountStatuses();
    assert.equal(status.providers.twitch.status, 'LINKED');
    assert.equal(status.providers.twitch.connectable, true);
    const authorizationUrl = new URL(await startAccountLink('twitch', 'session-a'));
    assert.equal(authorizationUrl.origin, 'https://id.twitch.tv');
    assert.equal((await getSecureRecord('atlas:account-link:twitch')).accessToken, 'top-secret-token');
    await consumeOAuthState(authorizationUrl.searchParams.get('state'), 'twitch', 'session-a');
  });

  await t.test('failed reauthorization preserves the existing linked token', async () => {
    const authorizationUrl = new URL(await startAccountLink('twitch', 'session-a'));
    await assert.rejects(() => completeAccountLink('twitch', {
      state: authorizationUrl.searchParams.get('state'),
      error: 'access_denied'
    }, 'session-a'), /provider_authorization_denied/);
    assert.equal((await getSecureRecord('atlas:account-link:twitch')).accessToken, 'top-secret-token');
  });

  await t.test('LinkedIn confidential web flow excludes PKCE by default', () => {
    process.env.LINKEDIN_CLIENT_ID = 'linkedin-client';
    process.env.LINKEDIN_CLIENT_SECRET = 'linkedin-secret';
    const provider = getProvider('linkedin');
    assert.equal(providerUsesPkce(provider), false);
    const authorizationUrl = new URL(buildAuthorizationUrl('linkedin', { state: 'state' }));
    assert.equal(authorizationUrl.pathname, '/oauth/v2/authorization');
    assert.equal(authorizationUrl.searchParams.has('code_challenge'), false);
    assert.equal(authorizationUrl.searchParams.has('code_challenge_method'), false);
  });

  await t.test('Discord PKCE is opt-in for an officially supported app configuration', () => {
    delete process.env.DISCORD_OAUTH_PKCE_ENABLED;
    assert.equal(providerUsesPkce(getProvider('discord')), false);
    process.env.DISCORD_OAUTH_PKCE_ENABLED = '1';
    assert.equal(providerUsesPkce(getProvider('discord')), true);
    delete process.env.DISCORD_OAUTH_PKCE_ENABLED;
  });

  await t.test('ten static callback paths route to the consolidated Function', async () => {
    const config = JSON.parse(await fs.readFile(path.resolve('vercel.json'), 'utf8'));
    const route = config.routes.find((entry) => entry.dest === '/api/accounts?route=callback&provider=$1');
    assert.ok(route);
    const matcher = new RegExp(`^${route.src}$`);
    for (const provider of ['twitch', 'youtube', 'tiktok', 'discord', 'microsoft', 'x', 'linkedin', 'facebook', 'instagram', 'steam']) {
      const match = `/api/accounts/${provider}/callback`.match(matcher);
      assert.equal(match?.[1], provider);
      assert.equal(route.dest.replace('$1', match[1]), `/api/accounts?route=callback&provider=${provider}`);
    }
  });

  await t.test('sprint Function budget is enforced at no more than eleven exposed handlers', async () => {
    const budget = await validateFunctionBudget(path.resolve('.'));
    assert.ok(budget.count <= 11);
    assert.ok(budget.files.every((file) => !path.basename(file).startsWith('_')));
  });

  await t.test('callback URLs ignore Host and unsafe public redirects are rejected', () => {
    assert.equal(callbackUrl('twitch'), 'https://atlas.example/api/accounts/twitch/callback');
    process.env.ATLAS_PUBLIC_URL = 'https://user:pass@evil.example/redirect';
    assert.throws(() => requirePublicUrl(), /atlas_public_url_invalid/);
    process.env.ATLAS_PUBLIC_URL = 'https://atlas.example';
  });

  await t.test('Vercel refuses local filesystem token storage', () => {
    process.env.VERCEL = '1';
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.deepEqual(getStorageStatus(), { available: false, backend: 'UNAVAILABLE_ON_VERCEL' });
    delete process.env.VERCEL;
  });

  await fs.rm(directory, { recursive: true, force: true });
});
