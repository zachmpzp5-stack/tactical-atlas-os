import { neon } from '@neondatabase/serverless';

let cachedConnection = null;
let cachedSql = null;

export function getDatabaseStatus() {
  const configured = Boolean(String(process.env.DATABASE_URL || '').trim());
  return {
    status: configured ? 'CONFIGURED_UNVERIFIED' : 'NOT_CONFIGURED',
    configured,
    provider: configured ? 'NEON_POSTGRES' : null,
    source: 'SERVER_ENVIRONMENT'
  };
}

export function getSql() {
  const connection = String(process.env.DATABASE_URL || '').trim();
  if (!connection) throw new Error('database_not_configured');
  if (!cachedSql || cachedConnection !== connection) {
    cachedConnection = connection;
    cachedSql = neon(connection, { fullResults: false });
  }
  return cachedSql;
}

export async function query(text, params = []) {
  return getSql().query(text, params);
}

export async function transaction(statements) {
  const sql = getSql();
  const queries = statements.map(({ text, params = [] }) => sql.query(text, params));
  return sql.transaction(queries);
}

export function resetDatabaseForTests() {
  if (process.env.NODE_ENV !== 'test') throw new Error('database_reset_denied');
  cachedConnection = null;
  cachedSql = null;
}
