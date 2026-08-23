import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { networkStatusLabel, normalizeNetworkStatus } from '../src/lib/network-status.js';

test('mobile network state is normalized without overstating connection quality', () => {
  assert.deepEqual(normalizeNetworkStatus({ connected: true, connectionType: 'wifi' }), {
    connected: true,
    connectionType: 'wifi',
  });
  assert.deepEqual(normalizeNetworkStatus({ connected: false, connectionType: 'wifi' }), {
    connected: false,
    connectionType: 'none',
  });
  assert.deepEqual(normalizeNetworkStatus({ connected: true, connectionType: 'satellite' }), {
    connected: true,
    connectionType: 'unknown',
  });
  assert.deepEqual(normalizeNetworkStatus({}, false), {
    connected: false,
    connectionType: 'none',
  });
});

test('mobile network labels distinguish wifi, cellular, generic online, and offline states', () => {
  assert.equal(networkStatusLabel({ connected: true, connectionType: 'wifi' }), 'NETWORK WIFI');
  assert.equal(
    networkStatusLabel({ connected: true, connectionType: 'cellular' }),
    'NETWORK CELLULAR'
  );
  assert.equal(
    networkStatusLabel({ connected: true, connectionType: 'unknown' }),
    'NETWORK ONLINE'
  );
  assert.equal(networkStatusLabel({ connected: false, connectionType: 'none' }), 'OFFLINE');
});

test('native network plugin configuration remains portable across Windows and macOS', async () => {
  const iosPackage = await fs.readFile('ios/App/CapApp-SPM/Package.swift', 'utf8');
  const androidSettings = await fs.readFile('android/capacitor.settings.gradle', 'utf8');

  assert.match(iosPackage, /\.\.\/\.\.\/\.\.\/node_modules\/@capacitor\/network/);
  assert.doesNotMatch(iosPackage, /\\node_modules\\/);
  assert.match(androidSettings, /@capacitor\/network\/android/);
});
