import { sha256 } from '../accounts/crypto.js';

const localWindows = new Map();

function upstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function upstash(command) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error('rate_limiter_unavailable');
  const body = await response.json();
  if (body.error) throw new Error('rate_limiter_unavailable');
  return body.result;
}

export function getRateLimitStatus() {
  if (upstashConfigured()) return { status: 'READY', backend: 'UPSTASH_REST' };
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') return { status: 'NOT_CONFIGURED', backend: null };
  return { status: 'DEVELOPMENT_ONLY', backend: 'PROCESS_LOCAL_DEVELOPMENT' };
}

export async function consumeRateLimit(identity, { limit = 20, windowSeconds = 60, action = 'write' } = {}) {
  const key = `atlas:rate:${action}:${sha256(String(identity || 'anonymous'))}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
  if (upstashConfigured()) {
    const count = Number(await upstash(['INCR', key]));
    if (count === 1) await upstash(['EXPIRE', key, windowSeconds + 1]);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), backend: 'UPSTASH_REST' };
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    return { allowed: false, remaining: 0, backend: null, status: 'NOT_CONFIGURED' };
  }
  const expiresAt = Date.now() + windowSeconds * 1000;
  const current = localWindows.get(key);
  const count = current && current.expiresAt > Date.now() ? current.count + 1 : 1;
  localWindows.set(key, { count, expiresAt });
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), backend: 'PROCESS_LOCAL_DEVELOPMENT', status: 'DEVELOPMENT_ONLY' };
}

export function resetRateLimiterForTests() {
  if (process.env.NODE_ENV !== 'test') throw new Error('rate_limiter_reset_denied');
  localWindows.clear();
}
