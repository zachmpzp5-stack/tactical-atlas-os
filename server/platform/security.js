export function applySecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}
export function isJsonRequest(req) {
  return String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json');
}
export function isSameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const forwardedHost = req.headers?.['x-forwarded-host'];
  const host = forwardedHost || req.headers?.host;
  if (!host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
