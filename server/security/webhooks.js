import crypto from 'node:crypto';

export function verifyHmacWebhook({ rawBody, signature, timestamp, secret, toleranceSeconds = 300, algorithm = 'sha256' }) {
  if (!secret || !signature || !timestamp || typeof rawBody !== 'string') return { valid: false, reason: 'missing_signature_material' };
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp) || Math.abs(Date.now() / 1000 - numericTimestamp) > toleranceSeconds) {
    return { valid: false, reason: 'signature_timestamp_expired' };
  }
  const expected = crypto.createHmac(algorithm, secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const supplied = String(signature).replace(/^sha256=/i, '');
  if (expected.length !== supplied.length) return { valid: false, reason: 'signature_mismatch' };
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
    ? { valid: true }
    : { valid: false, reason: 'signature_mismatch' };
}
