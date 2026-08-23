import assert from 'node:assert/strict';
import test from 'node:test';
import { EXPEDITION_LOCATIONS } from '../src/data/mockData.js';
import {
  buildNodeFeed,
  getSituationIntelligence,
  summarizeThreats,
  THREAT_LEVELS,
} from '../src/lib/situation-wall.js';

test('every expedition location has actionable threat and node intelligence', () => {
  for (const location of EXPEDITION_LOCATIONS) {
    const intelligence = getSituationIntelligence(location);
    assert.ok(THREAT_LEVELS.includes(intelligence.threat));
    assert.match(intelligence.node, /^[A-Z]+$/);
    assert.ok(intelligence.signal >= 0 && intelligence.signal <= 100);
    assert.ok(intelligence.note.length > 10);
  }
});

test('threat summary accounts for every expedition location', () => {
  const summary = summarizeThreats(EXPEDITION_LOCATIONS);
  assert.equal(
    Object.values(summary).reduce((total, count) => total + count, 0),
    EXPEDITION_LOCATIONS.length
  );
  assert.ok(summary.HIGH > 0);
  assert.ok(summary.LOW > 0);
});

test('node feed merges live states with safe readiness defaults', () => {
  const feed = buildNodeFeed({ LEGION: 'ONLINE', ARCHIVES: 'ADAPTER READY' });
  assert.equal(feed.length, 9);
  assert.equal(feed.find((node) => node.id === 'LEGION').status, 'ONLINE');
  assert.equal(feed.find((node) => node.id === 'ARCHIVES').status, 'ADAPTER READY');
  assert.equal(feed.find((node) => node.id === 'HOTEL').status, 'READY');
});
