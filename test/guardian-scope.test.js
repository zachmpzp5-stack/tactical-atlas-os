import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authorizeGuardianRequest,
  GUARDIAN_POLICY,
} from '../server/security/guardian.js';

test('Guardian authorization is derived from immutable server policy', () => {
  assert.equal(authorizeGuardianRequest('TACTICAL_ATLAS_PERSONAL').allowed, true);
  assert.equal(authorizeGuardianRequest('WORKPLACE').allowed, true);
  assert.deepEqual(GUARDIAN_POLICY, {
    scope: 'TACTICAL_ATLAS_PERSONAL',
    dataBoundary: 'PERSONAL_PROJECT_ONLY',
    executionMode: 'READ_ONLY',
    destructiveActions: 'COMMANDER_CONFIRMATION_REQUIRED',
    providerCredentials: 'SERVER_ONLY',
  });
  assert.equal(Object.isFrozen(GUARDIAN_POLICY), true);
});
