import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GUARDIAN_POLICY,
  PERSONAL_ATLAS_SCOPE,
  validateGuardianScope,
} from '../server/security/guardian.js';

test('Guardian accepts only the explicit personal Tactical Atlas request scope', () => {
  assert.equal(validateGuardianScope(PERSONAL_ATLAS_SCOPE).allowed, true);
  assert.equal(validateGuardianScope().allowed, false);
  assert.equal(validateGuardianScope('WORKPLACE').code, 'PERSONAL_PROJECT_SCOPE_REQUIRED');
  assert.deepEqual(GUARDIAN_POLICY, {
    scope: 'TACTICAL_ATLAS_PERSONAL',
    dataBoundary: 'PERSONAL_PROJECT_ONLY',
    executionMode: 'READ_ONLY',
    destructiveActions: 'COMMANDER_CONFIRMATION_REQUIRED',
    providerCredentials: 'SERVER_ONLY',
  });
});
