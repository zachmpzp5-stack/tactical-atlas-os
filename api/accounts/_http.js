import { readCommanderSession } from '../../server/lyra/lyra.session.js';
import { applySecurityHeaders, isJsonRequest, isSameOrigin } from '../../server/platform/security.js';

export function prepareAccountResponse(res) {
  applySecurityHeaders(res);
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
}

export function requireCommander(req, res) {
  const session = readCommanderSession(req);
  if (!session) {
    res.status(401).json({ error: 'Commander authentication required.' });
    return null;
  }
  return session;
}

export function requireSameOriginJson(req, res) {
  if (!isSameOrigin(req)) { res.status(403).json({ error: 'Cross-origin request denied.' }); return false; }
  if (!isJsonRequest(req)) { res.status(415).json({ error: 'JSON content type required.' }); return false; }
  return true;
}

export function redirect(res, location) {
  res.statusCode = 303;
  res.setHeader('Location', location);
  res.end();
}
