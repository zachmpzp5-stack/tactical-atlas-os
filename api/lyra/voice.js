import { determineLyraProfile } from '../../server/lyra/lyra.permissions.js';
import { synthesizeVoice } from '../../server/lyra/lyra.voice.js';
import { applySecurityHeaders, isJsonRequest, isSameOrigin } from '../../server/platform/security.js';
const MAX_TEXT_LENGTH = 1500;
export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed.' }); }
  if (!isSameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request denied.' });
  if (!isJsonRequest(req)) return res.status(415).json({ error: 'JSON content type required.' });
  if (!determineLyraProfile(req).isCommander) return res.status(403).json({ error: 'Commander voice authorization required.' });
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text || text.length > MAX_TEXT_LENGTH) return res.status(400).json({ error: `Voice text must contain 1-${MAX_TEXT_LENGTH} characters.` });
  try {
    const result = await synthesizeVoice(text);
    if (!result.audio) return res.status(result.status === 'NOT_CONFIGURED' ? 503 : 502).json({ error: `Neural voice ${result.status.toLowerCase()}.`, status: result.status });
    res.setHeader('Content-Type', result.contentType); return res.status(200).send(result.audio);
  } catch { return res.status(502).json({ error: 'Neural voice provider unavailable.', status: 'ERROR' }); }
}
