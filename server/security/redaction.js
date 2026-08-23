const SENSITIVE_KEY = /(?:authorization|cookie|secret|token|password|credential|api[_-]?key|database[_-]?url|private[_-]?key)/i;
const BEARER = /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const URL_CREDENTIALS = /postgres(?:ql)?:\/\/[^\s/@:]+:[^\s/@]+@/gi;

export function redactSensitive(value, seen = new WeakSet()) {
  if (typeof value === 'string') return value.replace(BEARER, 'Bearer [REDACTED]').replace(URL_CREDENTIALS, 'postgresql://[REDACTED]@');
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item, seen));
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactSensitive(entry, seen)]));
}

export function safeLogError(label, error, context = {}) {
  const details = redactSensitive({
    name: error?.name || 'Error',
    message: error?.message || 'unknown_error',
    code: error?.code,
    ...context
  });
  console.error(label, details);
}
