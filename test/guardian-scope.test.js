import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authorizeGuardianRequest,
  GUARDIAN_POLICY,
  PERSONAL_ATLAS_SCOPE,
} from '../server/security/guardian.js';

const personalRequest = (body = {}) => ({
  headers: { origin: 'https://atlas.example', host: 'atlas.example' },
  body,
});

test('Guardian authorizes only server-verified personal Tactical Atlas requests', () => {
  assert.equal(authorizeGuardianRequest(personalRequest()).allowed, true);
  assert.equal(authorizeGuardianRequest(personalRequest({ scope: PERSONAL_ATLAS_SCOPE })).allowed, true);
});

test('Guardian denies requests that lack server-controlled context', () => {
  assert.equal(authorizeGuardianRequest().allowed, false);
  assert.equal(authorizeGuardianRequest().code, 'PERSONAL_PROJECT_REQUEST_REQUIRED');
  const missingOrigin = authorizeGuardianRequest({ headers: { host: 'atlas.example' }, body: {} });
  assert.equal(missingOrigin.allowed, false);
  assert.equal(missingOrigin.code, 'PERSONAL_PROJECT_ORIGIN_REQUIRED');
  const crossOrigin = authorizeGuardianRequest({
    headers: { origin: 'https://workplace.example', host: 'atlas.example' },
    body: { scope: PERSONAL_ATLAS_SCOPE },
  });
  assert.equal(crossOrigin.allowed, false);
  assert.equal(crossOrigin.code, 'PERSONAL_PROJECT_ORIGIN_REQUIRED');
});

test('a caller-supplied scope can never widen the personal-project boundary', () => {
  const workplace = authorizeGuardianRequest(personalRequest({ scope: 'WORKPLACE' }));
  assert.equal(workplace.allowed, false);
  assert.equal(workplace.code, 'PERSONAL_PROJECT_SCOPE_REQUIRED');
  assert.equal(workplace.policy.dataBoundary, 'PERSONAL_PROJECT_ONLY');
});

test('Guardian policy stays an immutable personal-project boundary', () => {
  assert.deepEqual(GUARDIAN_POLICY, {
    scope: 'TACTICAL_ATLAS_PERSONAL',
    dataBoundary: 'PERSONAL_PROJECT_ONLY',
    executionMode: 'READ_ONLY',
    destructiveActions: 'COMMANDER_CONFIRMATION_REQUIRED',
    providerCredentials: 'SERVER_ONLY',
  });
  assert.equal(Object.isFrozen(GUARDIAN_POLICY), true);
});
