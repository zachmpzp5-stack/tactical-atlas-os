import migration001 from './001-command-core.js';
import migration002 from './002-memory-and-approvals.js';
import migration003 from './003-integration-operations.js';
import migration004 from './004-ai-brain-kernel.js';
import migration005 from './005-governance-functions.js';
import { getDatabaseStatus, query, transaction } from '../database.js';

export const MIGRATIONS = Object.freeze([migration001, migration002, migration003, migration004, migration005]);
let migrationPromise = null;

async function applyMigrations() {
  await query(`CREATE TABLE IF NOT EXISTS atlas_schema_migrations (
    version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
  )`);
  const applied = new Set((await query('SELECT version FROM atlas_schema_migrations')).map((row) => Number(row.version)));
  const completed = [];
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;
    await transaction([
      { text: "SELECT pg_advisory_xact_lock(hashtext('tactical_atlas_schema_migrations'))" },
      ...migration.statements.map((text) => ({ text })),
      { text: 'INSERT INTO atlas_schema_migrations(version,name) VALUES($1,$2) ON CONFLICT (version) DO NOTHING', params: [migration.version, migration.name] }
    ]);
    completed.push(migration.version);
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
