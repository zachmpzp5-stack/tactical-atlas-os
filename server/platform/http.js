import { readCommanderSession } from '../lyra/lyra.session.js';
import { applySecurityHeaders, isJsonRequest, isSameOrigin } from './security.js';

export const MAX_JSON_BODY_BYTES = 16_384;

export function prepareJsonResponse(res) {
  applySecurityHeaders(res);
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
}

export function requireCommander(req, res) {
  const session = readCommanderSession(req);
  if (!session) {
    res.status(401).json({ error: 'Commander authentication required.', code: 'COMMANDER_AUTH_REQUIRED' });
    return null;
  }
  return { ...session, actor: 'COMMANDER' };
}

export function requireJsonWrite(req, res) {
  if (!isSameOrigin(req)) { res.status(403).json({ error: 'Cross-origin request denied.', code: 'CROSS_ORIGIN_DENIED' }); return false; }
  if (!isJsonRequest(req)) { res.status(415).json({ error: 'JSON content type required.', code: 'JSON_REQUIRED' }); return false; }
  const bytes = Buffer.byteLength(JSON.stringify(req.body || {}));
  if (bytes > MAX_JSON_BODY_BYTES) { res.status(413).json({ error: 'Request body too large.', code: 'PAYLOAD_TOO_LARGE' }); return false; }
  return true;
}

export function requireIdempotencyKey(req, res) {
  const value = String(req.headers?.['idempotency-key'] || req.body?.idempotencyKey || '').trim();
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(value)) {
    res.status(400).json({ error: 'A valid Idempotency-Key is required.', code: 'IDEMPOTENCY_KEY_REQUIRED' });
    return null;
  }
  return value;
}

export function cleanText(value, { name, min = 1, max }) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < min || text.length > max) throw new Error(`invalid_${name}`);
  return text;
}
