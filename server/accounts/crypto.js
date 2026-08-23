import crypto from 'node:crypto';

function parseKey(rawValue) {
  const raw = String(rawValue || '').trim();
  if (/^[a-f\d]{64}$/i.test(raw)) return Buffer.from(raw, 'hex');
  try {
    const decoded = Buffer.from(raw, 'base64');
    return decoded.length === 32 ? decoded : null;
  } catch {
    return null;
  }
}

export function getEncryptionKey() {
  return parseKey(process.env.ATLAS_TOKEN_ENCRYPTION_KEY);
}

function decryptionKeys(keyId) {
  const currentId = String(process.env.ATLAS_TOKEN_ENCRYPTION_KEY_ID || 'primary');
  const previousId = String(process.env.ATLAS_TOKEN_ENCRYPTION_KEY_PREVIOUS_ID || 'previous');
  const candidates = [
    { id: currentId, key: parseKey(process.env.ATLAS_TOKEN_ENCRYPTION_KEY) },
    { id: previousId, key: parseKey(process.env.ATLAS_TOKEN_ENCRYPTION_KEY_PREVIOUS) }
  ].filter((entry) => entry.key);
  return keyId ? candidates.filter((entry) => entry.id === keyId) : candidates;
}

export function encryptRecord(value, recordKey) {
  const key = getEncryptionKey();
  if (!key) throw new Error('encryption_key_unavailable');
  const keyId = String(process.env.ATLAS_TOKEN_ENCRYPTION_KEY_ID || 'primary');
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(keyId)) throw new Error('encryption_key_id_invalid');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(recordKey));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return ['v2', keyId, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptRecord(value, recordKey) {
  const parts = String(value || '').split('.');
  const version = parts[0];
  const keyId = version === 'v2' ? parts[1] : null;
  const [iv, tag, ciphertext] = version === 'v2' ? parts.slice(2) : parts.slice(1);
  if (!['v1','v2'].includes(version) || !iv || !tag || !ciphertext) throw new Error('invalid_encrypted_record');
  const keys = decryptionKeys(keyId);
  if (!keys.length) throw new Error('encryption_key_unavailable');
  for (const { key } of keys) {
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
      decipher.setAAD(Buffer.from(recordKey));
      decipher.setAuthTag(Buffer.from(tag, 'base64url'));
      return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8'));
    } catch { /* try a configured rotation key */ }
  }
  throw new Error('invalid_encrypted_record');
}

export function randomUrlSafe(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('base64url');
}
