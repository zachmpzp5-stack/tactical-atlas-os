import crypto from 'node:crypto';
import {
  COMMANDER_COOKIE,
  createCommanderSession
} from '../../server/lyra/lyra.session.js';

function safeEqual(a, b) {
  if (!a || !b) return false;

  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  if (left.length !== right.length) return false;

  return crypto.timingSafeEqual(left, right);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const configuredKey = process.env.COMMANDER_AUTH_KEY;
  const suppliedKey =
    typeof req.body?.credential === 'string'
      ? req.body.credential.trim()
      : '';

  if (
    !configuredKey ||
    !process.env.COMMANDER_SESSION_SECRET
  ) {
    return res.status(503).json({
      error: 'Commander authentication is not configured.'
    });
  }

  if (!safeEqual(suppliedKey, configuredKey)) {
    return res.status(401).json({
      authenticated: false,
      clearance: 'STANDARD'
    });
  }

  const session = createCommanderSession();

  if (!session) {
    return res.status(503).json({
      error: 'Commander session service unavailable.'
    });
  }

  const secure =
    process.env.VERCEL === '1' ||
    process.env.NODE_ENV === 'production';

  const cookie = [
    `${COMMANDER_COOKIE}=${session}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Strict',
    'Max-Age=28800',
    secure ? 'Secure' : ''
  ]
    .filter(Boolean)
    .join('; ');

  res.setHeader('Set-Cookie', cookie);

  return res.status(200).json({
    authenticated: true,
    profile: 'LYRA_COMMANDER',
    clearance: 'OMEGA',
    expiresInSeconds: 28800
  });
}
