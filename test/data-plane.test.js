import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createMissionEngine } from '../server/missions/mission.engine.js';
import { createApprovalService } from '../server/approvals/approval.service.js';
import { verifyAuditChain } from '../server/security/audit.js';
import { getDatabaseStatus } from '../server/data/database.js';
import { MIGRATIONS } from '../server/data/migrations/index.js';
import commandHandler from '../api/command.js';
import { validateFunctionBudget } from '../scripts/check-vercel-functions.mjs';
import { InMemoryAtlasRepository } from './support/in-memory-atlas-repository.js';
import { setSecureRecord, setStorageFileForTests } from '../server/accounts/storage.js';
import { createIntegrationSyncService } from '../server/integrations/sync.service.js';
import { createCommanderSession } from '../server/lyra/lyra.session.js';
import {
  consumeRateLimit,
  getRateLimitStatus,
  resetRateLimiterForTests,
} from '../server/security/rate-limit.js';
import { verifyHmacWebhook } from '../server/security/webhooks.js';
import crypto from 'node:crypto';

const commander = { isCommander: true, actor: 'COMMANDER:TEST' };

function responseCapture() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      return this;
    },
  };
}

test('mission command engine is durable through engine reload, validated, audited, and idempotent', async () => {
  const repository = new InMemoryAtlasRepository();
  const firstEngine = createMissionEngine(repository);
  const created = await firstEngine.create(
    {
      title: 'Operation Durable Atlas',
      summary: 'Persistence test',
      reason: 'Commander authorization.',
    },
    commander,
    'mission-create:0001'
  );
  assert.equal(created.state, 'DRAFT');
  const secondEngine = createMissionEngine(repository);
  assert.equal(
    (await secondEngine.list()).length,
    1,
    'the durable adapter survives engine re-instantiation'
  );
  const duplicate = await secondEngine.create(
    { title: 'Ignored duplicate', reason: 'Duplicate request.' },
    commander,
    'mission-create:0001'
  );
  assert.equal(duplicate.id, created.id);
  assert.equal(duplicate.idempotent, true);
  await assert.rejects(
    () =>
      secondEngine.transition(
        created.id,
        { nextState: 'ACTIVE', reason: 'Illegal skip.' },
        commander,
        'mission-transition:bad'
      ),
    /illegal_mission_transition/
  );
  const review = await secondEngine.transition(
    created.id,
    { nextState: 'REVIEW', reason: 'Ready for review.' },
    commander,
    'mission-transition:review'
  );
  assert.equal(review.previousState, 'DRAFT');
  const objective = await secondEngine.addObjective(
    created.id,
    { title: 'Verify the PMO mission dossier', position: 0 },
    commander,
    'mission-objective:0001'
  );
  assert.equal(objective.title, 'Verify the PMO mission dossier');
  const evidence = await secondEngine.addEvidence(
    created.id,
    {
      sourceType: 'COMMANDER_SOURCE',
      sourceTitle: 'PMO verification record',
      locator: 'atlas://verification/pmo-001',
      sourceTimestamp: '2026-08-23T00:00:00.000Z',
      verificationStatus: 'UNVERIFIED',
      title: 'Mission dossier implementation',
      excerpt: 'The dossier records objectives, evidence, and state history.',
      classification: 'INTERNAL',
      confidence: 0.5,
    },
    commander,
    'mission-evidence:0001'
  );
  assert.equal(evidence.sourceVerificationStatus, 'UNVERIFIED');
  const detail = await secondEngine.detail(created.id);
  assert.equal(detail.objectives.length, 1);
  assert.equal(detail.evidence.length, 1);
  assert.equal(detail.events.length, 2);
  await assert.rejects(
    () =>
      secondEngine.create(
        { title: 'Unauthorized', reason: 'No.' },
        { isCommander: false, actor: 'OPERATOR' },
        'mission-create:deny'
      ),
    /commander_authorization_required/
  );
  assert.equal(verifyAuditChain(repository.audit).valid, true);
  repository.audit[0].payload.reason = 'tampered';
  assert.equal(verifyAuditChain(repository.audit).valid, false);
});

test('LYRA can propose but cannot approve its own action', async () => {
  const repository = new InMemoryAtlasRepository();
  const approvals = createApprovalService(repository);
  const proposal = await approvals.propose(
    { title: 'Review a tool improvement', description: 'No execution is attached.' },
    { isLyra: true, actor: 'LYRA' },
    'proposal:create:1'
  );
  assert.equal(proposal.status, 'PENDING');
  assert.throws(
    () =>
      approvals.decide(
        proposal.id,
        { decision: 'APPROVED', reason: 'Self approval.' },
        { isCommander: true, actor: 'LYRA' },
        'proposal:approve:1'
      ),
    /lyra_self_approval_denied/
  );
  assert.equal((await approvals.list({ status: 'PENDING' })).length, 1);
});

test('write API rejects standard users before touching the database', async () => {
  const response = responseCapture();
  await commandHandler(
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'mission:create:unauthorized',
      },
      query: { route: 'missions' },
      body: { title: 'Forged', reason: 'Forged' },
    },
    response
  );
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.code, 'COMMANDER_AUTH_REQUIRED');
});

test('write API enforces body limits and production rate limiting fails closed when Upstash is absent', async () => {
  process.env.NODE_ENV = 'test';
  process.env.COMMANDER_SESSION_SECRET = 'commander-session-secret-for-tests';
  const token = createCommanderSession();
  const response = responseCapture();
  await commandHandler(
    {
      method: 'POST',
      headers: {
        cookie: `ta_commander_session=${token}`,
        origin: 'https://atlas.example',
        host: 'atlas.example',
        'content-type': 'application/json',
        'idempotency-key': 'mission:create:oversized',
      },
      query: { route: 'missions' },
      body: { title: 'Oversized', summary: 'x'.repeat(17_000), reason: 'Body limit test.' },
    },
    response
  );
  assert.equal(response.statusCode, 413);
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.NODE_ENV = 'production';
  assert.deepEqual(getRateLimitStatus(), { status: 'NOT_CONFIGURED', backend: null });
  assert.equal((await consumeRateLimit('commander', { action: 'test' })).allowed, false);
  process.env.NODE_ENV = 'test';
  resetRateLimiterForTests();
});

test('webhook framework rejects expired and forged signatures using constant-time verification', () => {
  const secret = 'webhook-secret-for-tests';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const rawBody = '{"event":"sync"}';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  assert.equal(verifyHmacWebhook({ rawBody, signature, timestamp, secret }).valid, true);
  assert.equal(
    verifyHmacWebhook({ rawBody, signature: '0'.repeat(64), timestamp, secret }).reason,
    'signature_mismatch'
  );
  assert.equal(
    verifyHmacWebhook({ rawBody, signature, timestamp: '1', secret }).reason,
    'signature_timestamp_expired'
  );
});

test('missing Neon configuration is truthful and migrations cover the required data plane', async () => {
  const existing = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  assert.deepEqual(getDatabaseStatus(), {
    status: 'NOT_CONFIGURED',
    configured: false,
    provider: null,
    source: 'SERVER_ENVIRONMENT',
  });
  if (existing) process.env.DATABASE_URL = existing;
  const sql = MIGRATIONS.flatMap((migration) => migration.statements).join('\n');
  for (const table of [
    'missions',
    'mission_events',
    'objectives',
    'evidence_sources',
    'evidence',
    'tain_records',
    'lyra_conversations',
    'proposed_actions',
    'commander_approvals',
    'integration_sync_runs',
    'integration_records',
    'security_audit_events',
    'memory_candidates',
    'memory_conflicts',
  ])
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  assert.match(sql, /security_audit_events are immutable/);
  assert.match(sql, /pg_advisory_xact_lock/);
  const concurrency = MIGRATIONS.find((migration) => migration.version === 6);
  assert.equal(concurrency?.name, 'concurrency_idempotency');
  for (const scope of ['mission_create', 'mission_transition', 'memory_accept']) {
    const statement = concurrency.statements.find((text) => text.includes(`${scope}:' || p_idempotency_key`));
    assert.ok(statement, `${scope} must take an idempotency-scoped advisory lock`);
    assert.ok(
      statement.indexOf('pg_advisory_xact_lock') < statement.indexOf('WHERE idempotency_key') ||
        statement.indexOf('pg_advisory_xact_lock') < statement.indexOf("provenance->>'acceptIdempotencyKey'"),
      `${scope} must lock before the check-then-act read`
    );
  }
  const runnerSource = await fs.readFile('server/data/migrations/index.js', 'utf8');
  assert.doesNotMatch(runnerSource, /atlas_apply_migration_statement|EXECUTE p_statement/);
  assert.match(sql, /atlas_verify_audit_integrity/);
  const repositorySource = await fs.readFile('server/data/command.repository.js', 'utf8');
  assert.match(repositorySource, /SELECT \* FROM atlas_verify_audit_integrity\(\)/);
});

test('YouTube synchronization stores only real normalized read-only response data and is resumable', async (t) => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://configured-for-injected-test';
  process.env.ATLAS_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString('base64');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-youtube-sync-'));
  setStorageFileForTests(path.join(directory, 'tokens.json'));
  await setSecureRecord('atlas:account-link:youtube', {
    provider: 'youtube',
    accessToken: 'encrypted-test-access',
    refreshToken: 'encrypted-test-refresh',
    expiresAt: Date.now() + 60_000,
  });
  const repository = new InMemoryAtlasRepository();
  const candidates = [];
  const kernel = {
    async submitCandidate(input) {
      candidates.push(input);
      return { autoAccepted: true };
    },
  };
  const previousFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(String(url).startsWith('https://www.googleapis.com/youtube/v3/channels?'), true);
    assert.equal(options.headers.Authorization, 'Bearer encrypted-test-access');
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          items: [
            {
              id: 'UC_REAL_123',
              snippet: {
                title: 'Verified Atlas Channel',
                customUrl: '@atlas',
                publishedAt: '2024-01-01T00:00:00Z',
                thumbnails: { default: { url: 'https://example.invalid/thumb.jpg' } },
              },
            },
          ],
        };
      },
    };
  };
  t.after(async () => {
    global.fetch = previousFetch;
    delete process.env.DATABASE_URL;
    await fs.rm(directory, { recursive: true, force: true });
  });
  const service = createIntegrationSyncService(repository, kernel);
  const first = await service.run('youtube', 'youtube-sync:deterministic');
  assert.equal(first.status, 'SUCCEEDED');
  assert.equal(first.recordsStored, 1);
  assert.equal(repository.integrationRecords[0].externalId, 'UC_REAL_123');
  assert.deepEqual(Object.keys(repository.integrationRecords[0].normalizedData).sort(), [
    'country',
    'customUrl',
    'publishedAt',
    'thumbnailUrl',
    'title',
  ]);
  assert.equal(candidates[0].provenance.sourceKind, 'AUTHORIZED_API');
  const replay = await service.run('youtube', 'youtube-sync:deterministic');
  assert.equal(replay.idempotent, true);
});

test('route consolidation, protected output, and the 11-Function ceiling remain intact', async () => {
  const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
  assert.ok(config.routes.find((route) => route.dest === '/api/command?route=missions'));
  assert.ok(config.routes.find((route) => route.dest === '/api/command?route=audit-integrity'));
  assert.ok(
    config.routes.find((route) => route.dest === '/api/accounts?route=callback&provider=$1')
  );
  const budget = await validateFunctionBudget(path.resolve('.'));
  assert.ok(budget.count <= 11);
  assert.equal(budget.count, 8);
  const distStatus = spawnSync('git', ['status', '--short', '--', 'dist'], { encoding: 'utf8' });
  if (distStatus.error?.code !== 'EPERM') {
    assert.equal(distStatus.status, 0);
    assert.equal(distStatus.stdout.trim(), '');
  }
  const sourceAudio = await fs.readFile('public/audio/boot-sequence.mp3');
  assert.equal(
    crypto.createHash('sha256').update(sourceAudio).digest('hex'),
    '5b3bd34bf114b084b729cef0fa7069e57c5ffa026df9740bec540204dd7a609c'
  );
  try {
    const builtAudio = await fs.readFile('dist/audio/boot-sequence.mp3');
    assert.deepEqual(builtAudio, sourceAudio);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
});
