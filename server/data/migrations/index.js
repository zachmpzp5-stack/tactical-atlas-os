import migration001 from './001-command-core.js';
import migration002 from './002-memory-and-approvals.js';
import migration003 from './003-integration-operations.js';
import migration004 from './004-ai-brain-kernel.js';
import migration005 from './005-governance-functions.js';
import migration006 from './006-concurrency-idempotency.js';
import { getDatabaseStatus, transaction } from '../database.js';

export const MIGRATIONS = Object.freeze([migration001, migration002, migration003, migration004, migration005, migration006]);
let migrationPromise = null;

async function applyMigrations() {
  await transaction([
    { text: "SELECT pg_advisory_xact_lock(hashtext('tactical_atlas_schema_migrations'))" },
    { text: `CREATE TABLE IF NOT EXISTS atlas_schema_migrations (
      version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )` },
    { text: `CREATE OR REPLACE FUNCTION atlas_apply_migration_statement(
      p_version INTEGER, p_name TEXT, p_statement TEXT
    ) RETURNS BOOLEAN AS $$
      BEGIN
        IF EXISTS (SELECT 1 FROM atlas_schema_migrations WHERE version=p_version) THEN
          RETURN false;
        END IF;
        EXECUTE p_statement;
        RETURN true;
      END;
    $$ LANGUAGE plpgsql` }
  ]);
  const completed = [];
  for (const migration of MIGRATIONS) {
    const result = await transaction([
      { text: "SELECT pg_advisory_xact_lock(hashtext('tactical_atlas_schema_migrations'))" },
      {
        text: `SELECT NOT EXISTS(
          SELECT 1 FROM atlas_schema_migrations WHERE version=$1
        ) AS should_apply`,
        params: [migration.version]
      },
      ...migration.statements.map((text) => ({
        text: `SELECT atlas_apply_migration_statement($1,$2,$3) AS applied`,
        params: [migration.version, migration.name, text]
      })),
      { text: 'INSERT INTO atlas_schema_migrations(version,name) VALUES($1,$2) ON CONFLICT (version) DO NOTHING', params: [migration.version, migration.name] }
    ]);
    if (result[1]?.[0]?.should_apply) completed.push(migration.version);
  }
  return { status: 'READY', provider: 'NEON_POSTGRES', applied: completed, currentVersion: MIGRATIONS.at(-1).version };
}

export async function ensureMigrations() {
  if (!getDatabaseStatus().configured) return { status: 'NOT_CONFIGURED', provider: null, applied: [], currentVersion: 0 };
  migrationPromise ||= applyMigrations().catch((error) => {
    migrationPromise = null;
    throw error;
  });
  return migrationPromise;
}

export function resetMigrationsForTests() {
  if (process.env.NODE_ENV !== 'test') throw new Error('migration_reset_denied');
  migrationPromise = null;
}
