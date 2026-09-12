import assert from 'node:assert/strict';

export const DISPOSABLE_DATABASE_CONFIRMATION = 'DISPOSABLE_PERSONAL_TACTICAL_ATLAS';

export function validateDisposablePersonalNeon(databaseUrl, confirmation) {
  assert.equal(
    confirmation,
    DISPOSABLE_DATABASE_CONFIRMATION,
    `set ATLAS_TEST_DATABASE_CONFIRM=${DISPOSABLE_DATABASE_CONFIRMATION} only for an explicitly disposable personal Tactical Atlas database`
  );

  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    assert.fail('ATLAS_TEST_DATABASE_URL must be a valid PostgreSQL URL');
  }

  assert.match(url.protocol, /^postgres(?:ql)?:$/, 'ATLAS_TEST_DATABASE_URL must use PostgreSQL');
  assert.match(
    url.hostname,
    /(^|\.)neon\.tech$/i,
    'ATLAS_TEST_DATABASE_URL must use a Neon hostname'
  );
  assert.match(
    decodeURIComponent(url.pathname),
    /(?=.*personal)(?=.*tactical)(?=.*atlas)(?=.*(?:test|disposable))/i,
    'the database name must identify a disposable personal Tactical Atlas test database'
  );

  return Object.freeze({
    hostname: url.hostname,
    database: decodeURIComponent(url.pathname.slice(1)),
  });
}
