import assert from 'node:assert/strict';
import test from 'node:test';
import { getGuardianReadiness } from '../src/lib/guardian-status.js';

test('Guardian reports protective read-only when cloud enforcement is incomplete', () => {
  const guardian = getGuardianReadiness({
    executionMode: 'READ_ONLY',
    security: {
      cors: 'SAME_ORIGIN',
      rateLimiter: { status: 'NOT_CONFIGURED' },
      auditLog: 'NOT_CONFIGURED',
    },
    components: {
      COMMANDER_AUTH: { status: 'NOT_CONFIGURED' },
      APPROVAL_QUEUE: { status: 'NOT_CONFIGURED' },
    },
  });

  assert.equal(guardian.status, 'PROTECTIVE READ-ONLY');
  assert.equal(guardian.fullyActive, false);
  assert.equal(guardian.protectiveMode, true);
});

test('Guardian reports active only when every enforcement dependency is ready', () => {
  const guardian = getGuardianReadiness({
    executionMode: 'READ_WRITE',
    security: {
      cors: 'SAME_ORIGIN',
      rateLimiter: { status: 'READY' },
      auditLog: 'IMMUTABLE_HASH_CHAIN_CONFIGURED',
    },
    components: {
      COMMANDER_AUTH: { status: 'READY' },
      APPROVAL_QUEUE: { status: 'CONFIGURED' },
    },
  });

  assert.equal(guardian.status, 'ACTIVE');
  assert.equal(guardian.fullyActive, true);
  assert.equal(guardian.protectiveMode, false);
});
