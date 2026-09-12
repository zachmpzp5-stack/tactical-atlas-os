import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const repositoryUrl = new URL('../server/data/command.repository.js', import.meta.url);
import { classifyIntelligence, localReply } from '../api/lyra/chat.js';

test('LYRA fallback preserves memory verification distinctions', () => {
  const memoryData = {
    results: [
      {
        id: 'verified-memory',
        title: 'Verified status',
        memoryType: 'FACT',
        verificationStatus: 'VERIFIED',
        source: 'Authorized source',
        confidence: 1,
        evidence: { verificationStatus: 'VERIFIED', stale: false, conflicting: false },
      },
      {
        id: 'inferred-memory',
        title: 'Schedule inference',
        memoryType: 'INFERENCE',
        verificationStatus: 'UNVERIFIED',
        source: 'LYRA analysis',
        confidence: 0.4,
        evidence: { verificationStatus: 'UNVERIFIED', stale: true, conflicting: false },
      },
    ],
  };

  const intelligence = classifyIntelligence(null, memoryData, null);
  assert.deepEqual(intelligence.verifiedFacts.map((item) => item.memoryId), ['verified-memory']);
  assert.equal(intelligence.rememberedFacts.length, 2);
  assert.equal(intelligence.rememberedFacts[1].type, 'INFERENCE');
  assert.equal(intelligence.rememberedFacts[1].confidence, 0.4);
  assert.equal(intelligence.rememberedFacts[1].stale, true);
  assert.deepEqual(intelligence.inference.map((item) => item.memoryId), ['inferred-memory']);

  const reply = localReply({ isCommander: true }, { domain: 'TAIN' }, null, memoryData);
  assert.match(reply, /2 governed project-knowledge records/);
  assert.match(reply, /Verification state, confidence, freshness, and conflict metadata/);
  assert.doesNotMatch(reply, /2 verified project-knowledge records/);
});

test('persisted LYRA conversations cannot be rebound to another Commander session', async () => {
  const source = await fs.readFile(repositoryUrl, 'utf8');
  assert.match(
    source,
    /WHERE lyra_conversations\.commander_binding_hash=EXCLUDED\.commander_binding_hash/
  );
  assert.match(source, /if \(!saved\.length\) throw new Error\('conversation_binding_mismatch'\)/);
});
