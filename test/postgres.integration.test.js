import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { commandRepository, requireAuditIntegrityResult } from '../server/data/command.repository.js';
import { resetDatabaseForTests } from '../server/data/database.js';
import { validateDisposablePersonalNeon } from './support/disposable-postgres.js';
import {
  ensureMigrations,
  MIGRATIONS,
  resetMigrationsForTests,
} from '../server/data/migrations/index.js';

const databaseUrl = String(process.env.ATLAS_TEST_DATABASE_URL || '').trim();
const confirmation = process.env.ATLAS_TEST_DATABASE_CONFIRM;
const skip =
  databaseUrl && confirmation
    ? false
    : 'ATLAS_TEST_DATABASE_URL and ATLAS_TEST_DATABASE_CONFIRM are not configured';
const actor = `COMMANDER:POSTGRES_TEST:${crypto.randomUUID()}`;

function uuid() {
  return crypto.randomUUID();
}

function missionArguments(idempotencyKey, auditId = uuid()) {
  return [
    uuid(),
    uuid(),
    auditId,
    'Disposable PostgreSQL integration mission',
    'Personal Tactical Atlas integration validation.',
    actor,
    'Validate transactional PostgreSQL behavior.',
    idempotencyKey,
  ];
}

test('disposable personal Neon validates migrations, transactions, audit, and LYRA ownership', { skip }, async () => {
  const databaseIdentity = validateDisposablePersonalNeon(databaseUrl, confirmation);
  assert.match(databaseIdentity.database, /tactical.*atlas/i);
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = databaseUrl;
  resetDatabaseForTests();
  resetMigrationsForTests();
  const sql = neon(databaseUrl, { fullResults: false });
  const existingTables = await sql.query(
    `SELECT table_schema,table_name FROM information_schema.tables
      WHERE table_schema <> 'information_schema' AND table_schema !~ '^pg_'
        AND table_type='BASE TABLE'`
  );
  assert.deepEqual(
    existingTables,
    [],
    'the dedicated personal Tactical Atlas integration database must start empty'
  );

  const runnerKey = crypto.randomUUID();
  const [runnerA, runnerB] = await Promise.all([
    import(`../server/data/migrations/index.js?runner-a=${runnerKey}`),
    import(`../server/data/migrations/index.js?runner-b=${runnerKey}`),
  ]);
  const concurrentMigrations = await Promise.all([
    runnerA.ensureMigrations(),
    runnerB.ensureMigrations(),
  ]);
  assert.ok(concurrentMigrations.every((result) => result.status === 'READY'));

  const repeatMigration = await ensureMigrations();
  assert.equal(repeatMigration.status, 'READY');
  assert.equal(repeatMigration.currentVersion, MIGRATIONS.at(-1).version);
  assert.deepEqual(repeatMigration.applied, []);
  const migrationRows = await sql.query(
    'SELECT version,count(*)::int AS count FROM atlas_schema_migrations GROUP BY version ORDER BY version'
  );
  assert.deepEqual(
    migrationRows.map((row) => [Number(row.version), Number(row.count)]),
    MIGRATIONS.map((migration) => [migration.version, 1])
  );
  assert.equal(
    Number(migrationRows.find((row) => Number(row.version) === 6)?.count),
    1,
    'migration 006 must be registered exactly once'
  );

  await assert.rejects(
    () =>
      sql.transaction([
        sql.query("SELECT pg_advisory_xact_lock(hashtext('tactical_atlas_schema_migrations'))"),
        sql.query('CREATE TABLE atlas_migration_retry_probe (id INTEGER PRIMARY KEY)'),
        sql.query('INSERT INTO atlas_migration_retry_probe(id) VALUES(1),(1)'),
      ]),
    /duplicate key|unique constraint/i
  );
  const interruptedMigration = await sql.query(
    "SELECT to_regclass('public.atlas_migration_retry_probe') AS relation"
  );
  assert.equal(interruptedMigration[0].relation, null);
  try {
    await sql.transaction([
      sql.query("SELECT pg_advisory_xact_lock(hashtext('tactical_atlas_schema_migrations'))"),
      sql.query('CREATE TABLE atlas_migration_retry_probe (id INTEGER PRIMARY KEY)'),
      sql.query('INSERT INTO atlas_migration_retry_probe(id) VALUES(1)'),
    ]);
    const retryRows = await sql.query(
      'SELECT count(*)::int AS count FROM atlas_migration_retry_probe'
    );
    assert.equal(Number(retryRows[0].count), 1);
  } finally {
    await sql.query('DROP TABLE IF EXISTS atlas_migration_retry_probe');
  }

  const idempotencyKey = `postgres:mission:${crypto.randomUUID()}`;
  const [first, replay] = await Promise.all([
    commandRepository.createMission({
      id: uuid(),
      eventId: uuid(),
      auditId: uuid(),
      title: 'Concurrent mission creation',
      summary: 'First concurrent caller.',
      actor,
      reason: 'Validate SQL idempotency.',
      idempotencyKey,
    }),
    commandRepository.createMission({
      id: uuid(),
      eventId: uuid(),
      auditId: uuid(),
      title: 'Concurrent mission replay',
      summary: 'Second concurrent caller.',
      actor,
      reason: 'Validate SQL idempotency.',
      idempotencyKey,
    }),
  ]);
  assert.equal(first.id, replay.id);
  assert.deepEqual([first.idempotent, replay.idempotent].sort(), [false, true]);
  const missionCount = await sql.query(
    'SELECT count(*)::int AS count FROM mission_events WHERE idempotency_key=$1',
    [idempotencyKey]
  );
  assert.equal(Number(missionCount[0].count), 1);

  const transitionKey = `postgres:transition:${crypto.randomUUID()}`;
  const [transition, transitionReplay] = await Promise.all([
    commandRepository.transitionMission({
      missionId: first.id,
      eventId: uuid(),
      auditId: uuid(),
      nextState: 'REVIEW',
      actor,
      reason: 'Validate transition idempotency.',
      idempotencyKey: transitionKey,
    }),
    commandRepository.transitionMission({
      missionId: first.id,
      eventId: uuid(),
      auditId: uuid(),
      nextState: 'REVIEW',
      actor,
      reason: 'Validate concurrent transition replay.',
      idempotencyKey: transitionKey,
    }),
  ]);
  assert.equal(transition.id, transitionReplay.id);
  assert.equal(transition.state, 'REVIEW');
  assert.deepEqual([transition.idempotent, transitionReplay.idempotent].sort(), [false, true]);
  assert.equal(
    Number((await sql.query(
      'SELECT count(*)::int AS count FROM mission_events WHERE idempotency_key=$1',
      [transitionKey]
    ))[0].count),
    1
  );

  const candidateId = uuid();
  await commandRepository.createMemoryCandidate({
    id: candidateId,
    memoryType: 'INFERENCE',
    subjectKey: `postgres.memory.${candidateId}`,
    title: 'Concurrent PostgreSQL memory candidate',
    content: 'This unverified inference requires Commander review.',
    normalizedHash: crypto.createHash('sha256').update(candidateId).digest('hex'),
    source: 'Disposable PostgreSQL integration test',
    provenance: { sourceKind: 'LYRA_INFERENCE' },
    sourceTimestamp: new Date().toISOString(),
    verificationStatus: 'UNVERIFIED',
    confidence: 0.5,
    sensitivity: 'INTERNAL',
    retentionPolicy: 'STANDARD',
    expiresAt: null,
    reviewAt: null,
    missionId: null,
    proposedBy: actor,
    sourceRecordRetained: false,
    status: 'PENDING_REVIEW',
    idempotencyKey: `postgres:candidate:${crypto.randomUUID()}`,
    auditId: uuid(),
  });
  const memoryKey = `postgres:memory-accept:${crypto.randomUUID()}`;
  const [memory, memoryReplay] = await Promise.all([
    commandRepository.acceptMemoryCandidate({
      candidateId,
      memoryId: uuid(),
      auditId: uuid(),
      actor,
      idempotencyKey: memoryKey,
      reason: 'Validate memory acceptance idempotency.',
    }),
    commandRepository.acceptMemoryCandidate({
      candidateId,
      memoryId: uuid(),
      auditId: uuid(),
      actor,
      idempotencyKey: memoryKey,
      reason: 'Validate concurrent memory acceptance replay.',
    }),
  ]);
  assert.equal(memory.id, memoryReplay.id);
  assert.deepEqual([memory.idempotent, memoryReplay.idempotent].sort(), [false, true]);
  assert.equal(
    Number((await sql.query(
      "SELECT count(*)::int AS count FROM tain_records WHERE provenance->>'acceptIdempotencyKey'=$1",
      [memoryKey]
    ))[0].count),
    1
  );

  const duplicateAuditId = (
    await sql.query(
      "SELECT id FROM security_audit_events WHERE actor=$1 AND event_type='MISSION_CREATED' ORDER BY sequence LIMIT 1",
      [actor]
    )
  )[0].id;
  const rollbackArguments = missionArguments(
    `postgres:rollback:${crypto.randomUUID()}`,
    duplicateAuditId
  );
  await assert.rejects(
    () => sql.query('SELECT atlas_create_mission($1,$2,$3,$4,$5,$6,$7,$8)', rollbackArguments),
    /duplicate key|unique constraint/i
  );
  assert.equal(
    Number((await sql.query('SELECT count(*)::int AS count FROM missions WHERE id=$1', [rollbackArguments[0]]))[0].count),
    0
  );
  const retryArguments = [...rollbackArguments];
  retryArguments[2] = uuid();
  const retryResult = await sql.query(
    'SELECT atlas_create_mission($1,$2,$3,$4,$5,$6,$7,$8) AS result',
    retryArguments
  );
  assert.equal(retryResult[0].result.id, rollbackArguments[0]);
  assert.equal(retryResult[0].result.idempotent, false);
  const retryReplay = await sql.query(
    'SELECT atlas_create_mission($1,$2,$3,$4,$5,$6,$7,$8) AS result',
    retryArguments
  );
  assert.equal(retryReplay[0].result.id, rollbackArguments[0]);
  assert.equal(retryReplay[0].result.idempotent, true);

  const conversationId = uuid();
  await commandRepository.saveLyraExchange({
    conversationId,
    userMessageId: uuid(),
    replyMessageId: uuid(),
    bindingHash: 'binding-a',
    clearance: 'OMEGA',
    message: 'Owner message',
    reply: 'Owner reply',
    classification: {},
    evidenceReferences: [],
  });
  await assert.rejects(
    () =>
      commandRepository.saveLyraExchange({
        conversationId,
        userMessageId: uuid(),
        replyMessageId: uuid(),
        bindingHash: 'binding-b',
        clearance: 'OMEGA',
        message: 'Rebinding attempt',
        reply: 'Must not persist',
        classification: {},
        evidenceReferences: [],
      }),
    /conversation_binding_mismatch/
  );
  const conversation = await sql.query(
    `SELECT c.commander_binding_hash,count(m.id)::int AS message_count
      FROM lyra_conversations c LEFT JOIN lyra_messages m ON m.conversation_id=c.id
      WHERE c.id=$1 GROUP BY c.commander_binding_hash`,
    [conversationId]
  );
  assert.equal(conversation[0].commander_binding_hash, 'binding-a');
  assert.equal(Number(conversation[0].message_count), 2);

  const concurrentAuditPrefix = `postgres:audit:${crypto.randomUUID()}`;
  await Promise.all(
    Array.from({ length: 5 }, (_, index) =>
      commandRepository.createMission({
        id: uuid(),
        eventId: uuid(),
        auditId: uuid(),
        title: `Concurrent audit mission ${index + 1}`,
        summary: 'Exercise advisory-locked audit appends.',
        actor,
        reason: 'Validate audit-chain ordering under concurrency.',
        idempotencyKey: `${concurrentAuditPrefix}:${index}`,
      })
    )
  );

  const auditRows = await sql.query(
    'SELECT sequence,id,previous_hash,event_hash FROM security_audit_events WHERE actor=$1 ORDER BY sequence',
    [actor]
  );
  assert.ok(auditRows.length >= 1);
  assert.deepEqual(
    auditRows.map((event) => Number(event.sequence)),
    auditRows.map((event) => Number(event.sequence)).toSorted((a, b) => a - b)
  );
  assert.equal((await commandRepository.verifyAuditIntegrity()).valid, true);
  const allAuditRows = await sql.query(
    'SELECT sequence,previous_hash,event_hash FROM security_audit_events ORDER BY sequence'
  );
  for (let index = 1; index < allAuditRows.length; index += 1) {
    assert.equal(allAuditRows[index].previous_hash, allAuditRows[index - 1].event_hash);
  }

  const target = auditRows[0];
  await assert.rejects(
    () => sql.query('UPDATE security_audit_events SET event_hash=$1 WHERE id=$2', ['0'.repeat(64), target.id]),
    /immutable/
  );
  const tamperResults = await sql.transaction([
    sql.query('ALTER TABLE security_audit_events DISABLE TRIGGER security_audit_events_immutable'),
    sql.query('UPDATE security_audit_events SET event_hash=$1 WHERE id=$2', ['0'.repeat(64), target.id]),
    sql.query('SELECT * FROM atlas_verify_audit_integrity()'),
    sql.query('UPDATE security_audit_events SET event_hash=$1 WHERE id=$2', [target.event_hash, target.id]),
    sql.query('ALTER TABLE security_audit_events ENABLE TRIGGER security_audit_events_immutable'),
  ]);
  assert.equal(tamperResults[2][0].valid, false);
  assert.match(tamperResults[2][0].reason, /hash_mismatch/);
  assert.equal((await commandRepository.verifyAuditIntegrity()).valid, true);

  const verifierStatement = MIGRATIONS.find((migration) => migration.version === 5).statements.find(
    (statement) => statement.includes('atlas_verify_audit_integrity')
  );
  const emptyResults = await sql.transaction([
    sql.query(`CREATE OR REPLACE FUNCTION atlas_verify_audit_integrity()
      RETURNS TABLE(valid BOOLEAN,failed_sequence BIGINT,reason TEXT) AS $$ BEGIN RETURN; END; $$ LANGUAGE plpgsql STABLE`),
    sql.query('SELECT * FROM atlas_verify_audit_integrity()'),
    sql.query(verifierStatement),
  ]);
  assert.throws(
    () => requireAuditIntegrityResult(emptyResults[1][0] || null),
    /audit_integrity_verifier_unavailable/
  );
  const abnormalResults = await sql.transaction([
    sql.query(`CREATE OR REPLACE FUNCTION atlas_verify_audit_integrity()
      RETURNS TABLE(valid BOOLEAN,failed_sequence BIGINT,reason TEXT) AS $$
      BEGIN RETURN QUERY SELECT NULL::boolean,NULL::bigint,'abnormal'::text; END; $$ LANGUAGE plpgsql STABLE`),
    sql.query('SELECT * FROM atlas_verify_audit_integrity()'),
    sql.query(verifierStatement),
  ]);
  assert.throws(
    () => requireAuditIntegrityResult(abnormalResults[1][0]),
    /audit_integrity_verifier_unavailable/
  );
  assert.equal((await commandRepository.verifyAuditIntegrity()).valid, true);
});
