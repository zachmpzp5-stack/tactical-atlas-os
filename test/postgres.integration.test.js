import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { commandRepository, requireAuditIntegrityResult } from '../server/data/command.repository.js';
import { resetDatabaseForTests } from '../server/data/database.js';
import {
  ensureMigrations,
  MIGRATIONS,
  resetMigrationsForTests,
} from '../server/data/migrations/index.js';

const databaseUrl = String(process.env.ATLAS_TEST_DATABASE_URL || '').trim();
const confirmation = process.env.ATLAS_TEST_DATABASE_CONFIRM;
const skip = databaseUrl ? false : 'ATLAS_TEST_DATABASE_URL is not configured';
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

function assertDisposablePersonalNeon() {
  assert.equal(
    confirmation,
    'DISPOSABLE_PERSONAL_TACTICAL_ATLAS',
    'set ATLAS_TEST_DATABASE_CONFIRM=DISPOSABLE_PERSONAL_TACTICAL_ATLAS only for an explicitly disposable personal Tactical Atlas database'
  );
  const url = new URL(databaseUrl);
  assert.match(url.protocol, /^postgres(?:ql)?:$/);
  assert.match(url.hostname, /(^|\.)neon\.tech$/i);
}

test('disposable personal Neon validates migrations, transactions, audit, and LYRA ownership', { skip }, async () => {
  assertDisposablePersonalNeon();
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = databaseUrl;
  resetDatabaseForTests();
  resetMigrationsForTests();
  const sql = neon(databaseUrl, { fullResults: false });

  const firstMigration = await ensureMigrations();
  assert.equal(firstMigration.status, 'READY');
  assert.equal(firstMigration.currentVersion, MIGRATIONS.at(-1).version);

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
  const migrationRows = await sql.query(
    'SELECT version,count(*)::int AS count FROM atlas_schema_migrations GROUP BY version ORDER BY version'
  );
  assert.deepEqual(
    migrationRows.map((row) => [Number(row.version), Number(row.count)]),
    MIGRATIONS.map((migration) => [migration.version, 1])
  );

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

  const auditRows = await sql.query(
    'SELECT sequence,id,event_hash FROM security_audit_events WHERE actor=$1 ORDER BY sequence',
    [actor]
  );
  assert.ok(auditRows.length >= 1);
  assert.deepEqual(
    auditRows.map((event) => Number(event.sequence)),
    auditRows.map((event) => Number(event.sequence)).toSorted((a, b) => a - b)
  );
  assert.equal((await commandRepository.verifyAuditIntegrity()).valid, true);

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
