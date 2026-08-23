import { useEffect, useRef, useState } from 'react';
import { Network } from '@capacitor/network';
import { normalizeNetworkStatus } from '../lib/network-status';

function browserStatus() {
  const connected = typeof navigator === 'undefined' ? true : navigator.onLine;
  return normalizeNetworkStatus({ connected, connectionType: connected ? 'unknown' : 'none' });
}

export default function useNetworkStatus(onReconnect) {
  const initialStatus = browserStatus();
  const [status, setStatus] = useState(initialStatus);
  const connectedRef = useRef(initialStatus.connected);
  const reconnectRef = useRef(onReconnect);

  reconnectRef.current = onReconnect;

  useEffect(() => {
    let active = true;
    let pluginListener;

    const applyStatus = (nextStatus) => {
      if (!active) return;

      const normalized = normalizeNetworkStatus(nextStatus, connectedRef.current);
      const reconnected = !connectedRef.current && normalized.connected;
      connectedRef.current = normalized.connected;
      setStatus(normalized);

      if (reconnected) {
        Promise.resolve().then(() => reconnectRef.current?.());
      }
    };

    const connected = () => applyStatus({ connected: true, connectionType: 'unknown' });
    const disconnected = () => applyStatus({ connected: false, connectionType: 'none' });

    window.addEventListener('online', connected);
    window.addEventListener('offline', disconnected);

    Network.getStatus()
      .then(applyStatus)
      .catch(() => applyStatus(browserStatus()));
    Network.addListener('networkStatusChange', applyStatus)
      .then((listener) => {
        if (active) pluginListener = listener;
        else void listener.remove();
      })
      .catch(() => {});

    return () => {
      active = false;
      window.removeEventListener('online', connected);
      window.removeEventListener('offline', disconnected);
      if (pluginListener) void pluginListener.remove();
    };
  }, []);

  return status;
}
