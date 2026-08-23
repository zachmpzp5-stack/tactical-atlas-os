import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LYRA_BROWSER_VOICE_PROFILE,
  prepareLyraSpeech,
  selectLyraBrowserVoice,
} from '../src/lib/lyra-voice.js';

test('LYRA prefers a natural female command voice over generic or male voices', () => {
  const voices = [
    { name: 'Microsoft David Desktop', lang: 'en-US' },
    { name: 'Generic English', lang: 'en-US' },
    { name: 'Microsoft Ava Online (Natural)', lang: 'en-US' },
    { name: 'Microsoft Zira Desktop', lang: 'en-US' },
  ];

  assert.equal(selectLyraBrowserVoice(voices)?.name, 'Microsoft Ava Online (Natural)');
  assert.equal(LYRA_BROWSER_VOICE_PROFILE.rate, 0.92);
  assert.equal(LYRA_BROWSER_VOICE_PROFILE.pitch, 1.02);
});

test('LYRA prepares tactical text for smoother spoken delivery', () => {
  assert.equal(
    prepareLyraSpeech('**LYRA** // TAAN routes through TAIM.'),
    'Lyra. T A A N routes through T A I M.'
  );
});
