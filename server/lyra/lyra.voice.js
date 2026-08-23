export function getVoiceStatus() {
  const configured = Boolean(process.env.LYRA_VOICE_PROVIDER && process.env.LYRA_VOICE_API_KEY && process.env.LYRA_VOICE_ID && process.env.LYRA_VOICE_MODEL);
  return { provider: process.env.LYRA_VOICE_PROVIDER || 'NOT_CONFIGURED', status: configured ? 'READY' : 'NOT_CONFIGURED' };
}
export async function synthesizeVoice(text) {
  const status = getVoiceStatus();
  if (status.status !== 'READY' || status.provider.toUpperCase() !== 'ELEVENLABS') return { ...status, audio: null };
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.LYRA_VOICE_ID)}`, { method: 'POST', headers: { 'xi-api-key': process.env.LYRA_VOICE_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify({ text, model_id: process.env.LYRA_VOICE_MODEL }) });
  if (!response.ok) return { provider: status.provider, status: 'ERROR', audio: null };
  return { provider: status.provider, status: 'VERIFIED', contentType: response.headers.get('content-type') || 'audio/mpeg', audio: Buffer.from(await response.arrayBuffer()) };
}
