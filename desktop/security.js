export function isTrustedAppUrl(value, origin) {
  try {
    return new URL(value).origin === origin;
  } catch {
    return false;
  }
}

export function isSafeExternalUrl(value) {
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function createWindowOpenHandler({ origin, openExternal }) {
  return ({ url }) => {
    if (!isTrustedAppUrl(url, origin) && isSafeExternalUrl(url)) void openExternal(url);
    return { action: 'deny' };
  };
}
