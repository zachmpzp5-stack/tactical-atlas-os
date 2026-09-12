import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISPOSABLE_DATABASE_CONFIRMATION,
  validateDisposablePersonalNeon,
} from './support/disposable-postgres.js';

const credentials = ['personal-user', 'not-a-secret'].join(':');
const disposableUrl = `postgresql://${credentials}@personal-project.neon.tech/personal_tactical_atlas_disposable_test?sslmode=require`;

test('disposable PostgreSQL guard accepts only an explicitly confirmed personal Neon test database', () => {
  assert.deepEqual(
    validateDisposablePersonalNeon(disposableUrl, DISPOSABLE_DATABASE_CONFIRMATION),
    {
      hostname: 'personal-project.neon.tech',
      database: 'personal_tactical_atlas_disposable_test',
    }
  );
});

test('disposable PostgreSQL guard rejects missing or incorrect confirmation before database access', () => {
  for (const confirmation of [undefined, '', 'YES', 'PRODUCTION']) {
    assert.throws(
      () => validateDisposablePersonalNeon(disposableUrl, confirmation),
      /ATLAS_TEST_DATABASE_CONFIRM/
    );
  }
});

test('disposable PostgreSQL guard rejects non-Neon, non-PostgreSQL, and ambiguous database targets', () => {
  const rejected = [
    'https://personal-project.neon.tech/personal_tactical_atlas_disposable_test',
    `postgresql://${credentials}@example.com/personal_tactical_atlas_disposable_test`,
    `postgresql://${credentials}@personal-project.neon.tech/neondb`,
    `postgresql://${credentials}@personal-project.neon.tech/tactical_atlas`,
    `postgresql://${credentials}@personal-project.neon.tech/tactical_atlas_disposable_test`,
  ];
  for (const databaseUrl of rejected) {
    assert.throws(() =>
      validateDisposablePersonalNeon(databaseUrl, DISPOSABLE_DATABASE_CONFIRMATION)
    );
  }
});
