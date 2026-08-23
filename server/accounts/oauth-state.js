import crypto from 'node:crypto';
import { randomUrlSafe, sha256 } from './crypto.js';
import { consumeSecureRecord, setSecureRecord } from './storage.js';

const STATE_TTL_SECONDS = 10 * 60;
const stateKey = (state) => `atlas:oauth-state:${sha256(state)}`;

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function createOAuthState(provider, sessionBinding, usePkce) {
  const state = randomUrlSafe(32);
  const verifier = usePkce ? randomUrlSafe(48) : null;
  await setSecureRecord(stateKey(state), {
    provider,
    sessionBinding,
    verifier,
    expiresAt: Date.now() + STATE_TTL_SECONDS * 1000
  }, STATE_TTL_SECONDS);
  return { state, verifier, challenge: verifier ? sha256(verifier) : null };
}

export async function consumeOAuthState(state, provider, sessionBinding) {
  if (!state) throw new Error('oauth_state_missing');
  const key = stateKey(state);
  const record = await consumeSecureRecord(key);
  if (!record) throw new Error('oauth_state_invalid_or_replayed');
  if (record.expiresAt <= Date.now()) throw new Error('oauth_state_expired');
  if (!safeEqual(record.provider, provider)) throw new Error('oauth_provider_mismatch');
  if (!safeEqual(record.sessionBinding, sessionBinding)) throw new Error('oauth_session_mismatch');
  return record;
}
