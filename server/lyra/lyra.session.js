import crypto from 'node:crypto';

export const COMMANDER_COOKIE = 'ta_commander_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSessionSecret() {
  return process.env.COMMANDER_SESSION_SECRET || '';
}

function sign(payload) {
  const secret = getSessionSecret();
  if (!secret) return null;

  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
}

export function createCommanderSession() {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'COMMANDER',
      clearance: 'OMEGA',
      expiresAt: Date.now() + SESSION_TTL_MS
    })
  ).toString('base64url');

  const signature = sign(payload);
  if (!signature) return null;

  return `${payload}.${signature}`;
}

export function verifyCommanderSession(token) {
  if (!token || typeof token !== 'string') return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload);
  if (!expected) return false;

  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (suppliedBuffer.length !== expectedBuffer.length) return false;

  if (!crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    return (
      session.role === 'COMMANDER' &&
      session.clearance === 'OMEGA' &&
      Number(session.expiresAt) > Date.now()
    );
  } catch {
    return false;
  }
}

export function readCommanderSession(req) {
  const cookieHeader = String(req?.headers?.cookie || '');
  const token = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COMMANDER_COOKIE}=`))
    ?.slice(COMMANDER_COOKIE.length + 1);

  if (!verifyCommanderSession(token)) return null;
  return {
    token,
    binding: crypto.createHash('sha256').update(token).digest('base64url')
  };
}
