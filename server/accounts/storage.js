import fs from 'node:fs/promises';
import path from 'node:path';
import { decryptRecord, encryptRecord } from './crypto.js';

let dataFileOverride = null;
const dataFile = () => dataFileOverride || path.join(process.cwd(), '.data', 'account-links.json');
let localMutation = Promise.resolve();

export function setStorageFileForTests(file) {
  if (process.env.NODE_ENV !== 'test') throw new Error('test_storage_override_denied');
  dataFileOverride = file;
}

function upstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function getStorageStatus() {
  if (upstashConfigured()) return { available: true, backend: 'UPSTASH_REST' };
  if (process.env.VERCEL === '1') return { available: false, backend: 'UNAVAILABLE_ON_VERCEL' };
  return { available: true, backend: 'ENCRYPTED_LOCAL' };
}

async function upstash(command) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error('token_storage_unavailable');
  const body = await response.json();
  if (body.error) throw new Error('token_storage_unavailable');
  return body.result;
}

async function readLocal() {
  try { return JSON.parse(await fs.readFile(dataFile(), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw new Error('token_storage_unavailable'); }
}

async function writeLocal(data) {
  const target = dataFile();
  await fs.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(data), { encoding: 'utf8', mode: 0o600 });
  await fs.rename(temporary, target);
}

async function rawGet(key) {
  const status = getStorageStatus();
  if (!status.available) throw new Error('token_storage_unavailable');
  return upstashConfigured() ? upstash(['GET', key]) : (await readLocal())[key] || null;
}

async function rawSet(key, value, ttlSeconds) {
  const status = getStorageStatus();
  if (!status.available) throw new Error('token_storage_unavailable');
  if (upstashConfigured()) return upstash(ttlSeconds ? ['SET', key, value, 'EX', ttlSeconds] : ['SET', key, value]);
  const data = await readLocal();
  data[key] = value;
  await writeLocal(data);
}

async function rawDelete(key) {
  const status = getStorageStatus();
  if (!status.available) throw new Error('token_storage_unavailable');
  if (upstashConfigured()) return upstash(['DEL', key]);
  const data = await readLocal();
  delete data[key];
  await writeLocal(data);
}

async function rawConsume(key) {
  const status = getStorageStatus();
  if (!status.available) throw new Error('token_storage_unavailable');
  if (upstashConfigured()) return upstash(['GETDEL', key]);
  const operation = localMutation.then(async () => {
    const data = await readLocal();
    const value = data[key] || null;
    if (value) {
      delete data[key];
      await writeLocal(data);
    }
    return value;
  });
  localMutation = operation.catch(() => {});
  return operation;
}

export async function getSecureRecord(key) {
  const encrypted = await rawGet(key);
  return encrypted ? decryptRecord(encrypted, key) : null;
}

export async function setSecureRecord(key, value, ttlSeconds) {
  return rawSet(key, encryptRecord(value, key), ttlSeconds);
}

export async function deleteSecureRecord(key) {
  return rawDelete(key);
}

export async function consumeSecureRecord(key) {
  const encrypted = await rawConsume(key);
  return encrypted ? decryptRecord(encrypted, key) : null;
}
