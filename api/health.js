import { getSystemSnapshot } from '../server/platform/system.status.js';
import { applySecurityHeaders } from '../server/platform/security.js';
export default function handler(_req, res) {
  applySecurityHeaders(res);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(getSystemSnapshot());
}
