import crypto from 'node:crypto';

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function computeAuditHash(event, previousHash = '') {
  const material = [
    previousHash,
    event.id,
    event.eventType,
    event.entityType,
    event.entityId || '',
    event.actor,
    event.action,
    canonical(event.payload || {}),
    event.createdAt
  ].join('|');
  return crypto.createHash('sha256').update(material).digest('hex');
}

export function verifyAuditChain(events) {
  let previousHash = '';
  for (const event of events) {
    if ((event.previousHash || '') !== previousHash) return { valid: false, failedEventId: event.id, reason: 'previous_hash_mismatch' };
    if (computeAuditHash(event, previousHash) !== event.eventHash) return { valid: false, failedEventId: event.id, reason: 'event_hash_mismatch' };
    previousHash = event.eventHash;
  }
  return { valid: true, count: events.length, head: previousHash || null };
}
