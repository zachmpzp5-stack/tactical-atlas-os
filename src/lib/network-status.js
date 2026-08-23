const CONNECTION_TYPES = new Set(['wifi', 'cellular', 'none', 'unknown']);

export function normalizeNetworkStatus(status, fallbackConnected = true) {
  const connected = typeof status?.connected === 'boolean' ? status.connected : fallbackConnected;
  const requestedType = String(status?.connectionType || '').toLowerCase();
  const connectionType = CONNECTION_TYPES.has(requestedType)
    ? requestedType
    : connected
      ? 'unknown'
      : 'none';

  return {
    connected,
    connectionType: connected ? (connectionType === 'none' ? 'unknown' : connectionType) : 'none',
  };
}

export function networkStatusLabel({ connected, connectionType }) {
  if (!connected) return 'OFFLINE';
  if (connectionType === 'wifi') return 'NETWORK WIFI';
  if (connectionType === 'cellular') return 'NETWORK CELLULAR';
  return 'NETWORK ONLINE';
}
