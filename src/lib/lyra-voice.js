export const LYRA_BROWSER_VOICE_PROFILE = Object.freeze({
  lang: 'en-US',
  rate: 0.92,
  pitch: 1.02,
  volume: 1,
});

const preferredVoicePatterns = [
  /microsoft ava.*(?:natural|online)/i,
  /microsoft emma.*(?:natural|online)/i,
  /microsoft aria.*(?:natural|online)/i,
  /microsoft jenny.*(?:natural|online)/i,
  /microsoft sonia.*(?:natural|online)/i,
  /microsoft libby.*(?:natural|online)/i,
  /google.*(?:female|us english)/i,
  /\bava\b/i,
  /\baria\b/i,
  /\bjenny\b/i,
  /\bsonia\b/i,
  /\bsamantha\b/i,
  /\bvictoria\b/i,
  /\bkaren\b/i,
  /\bmoira\b/i,
  /\bzira\b/i,
];

const unlikelyFemaleVoicePattern = /\b(?:david|guy|mark|george|daniel|james|ryan|male)\b/i;

export function scoreLyraBrowserVoice(voice) {
  if (
    !voice ||
    !String(voice.lang || '')
      .toLowerCase()
      .startsWith('en')
  )
    return -1;

  const name = String(voice.name || '');
  const preferredIndex = preferredVoicePatterns.findIndex((pattern) => pattern.test(name));
  let score = preferredIndex === -1 ? 10 : 200 - preferredIndex * 8;

  if (/natural|neural|online/i.test(name)) score += 35;
  if (/female/i.test(name)) score += 20;
  if (String(voice.lang).toLowerCase().startsWith('en-us')) score += 8;
  if (unlikelyFemaleVoicePattern.test(name)) score -= 250;

  return score;
}

export function selectLyraBrowserVoice(voices = []) {
  return [...voices]
    .map((voice, index) => ({ voice, index, score: scoreLyraBrowserVoice(voice) }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.voice;
}

export function prepareLyraSpeech(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_#>]/g, ' ')
    .replace(/\bLYRA\b/g, 'Lyra')
    .replace(/\bTAAN\b/g, 'T A A N')
    .replace(/\bTAIM\b/g, 'T A I M')
    .replace(/\s*\/\/\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}
