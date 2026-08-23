import test from 'node:test';
import assert from 'node:assert/strict';
import { runAtlasCore } from '../server/atlas-core/atlas.core.js';
import { authorizeTool } from '../server/atlas-core/tool.registry.js';
import { retrieveTain } from '../server/tain/tain.core.js';
import { isSameOrigin } from '../server/platform/security.js';
import { getSystemSnapshot } from '../server/platform/system.status.js';

test('Atlas Core remains read-only and does not elevate client identity', () => {
  const decision = runAtlasCore({ message: 'mission status', identity: { clearance: 'OMEGA', isCommander: false } });
  assert.equal(decision.executionMode, 'READ_ONLY');
  assert.equal(decision.identity.clearance, 'STANDARD');
});
test('unknown and protected tools are denied by default', () => {
  assert.equal(authorizeTool('writeMission', { isCommander: true }).allowed, false);
  assert.equal(authorizeTool('searchTAIN', { isCommander: false }).allowed, false);
  assert.equal(authorizeTool('searchTAIN', { isCommander: true }).allowed, true);
});
test('TAIN reports NOT_CONFIGURED without DATABASE_URL and fabricates no records', async () => {
  const databaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const result = await retrieveTain('Search TAIN memory for General HIIIT');
  assert.equal(result.status, 'NOT_CONFIGURED');
  assert.deepEqual(result.results, []);
  if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
});
test('same-origin enforcement rejects mismatched origins', () => {
  assert.equal(isSameOrigin({ headers: { origin: 'https://evil.example', host: 'atlas.example' } }), false);
  assert.equal(isSameOrigin({ headers: { origin: 'https://atlas.example', host: 'atlas.example' } }), true);
});
test('health snapshot exposes states but never secret values', () => {
  process.env.COMMANDER_AUTH_KEY = 'do-not-expose';
  process.env.COMMANDER_SESSION_SECRET = 'also-do-not-expose';
  const serialized = JSON.stringify(getSystemSnapshot());
  assert.equal(serialized.includes('do-not-expose'), false);
  assert.equal(serialized.includes('also-do-not-expose'), false);
  assert.equal(getSystemSnapshot().components.COMMANDER_AUTH.status, 'READY');
});
