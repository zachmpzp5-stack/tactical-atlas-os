import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {
  createWindowOpenHandler,
  isSafeExternalUrl,
  isTrustedAppUrl,
} from '../desktop/security.js';
import { startAtlasServer } from '../server/index.js';

function request(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () =>
          resolve({ status: response.statusCode, body, headers: response.headers })
        );
      })
      .on('error', reject);
  });
}

test('desktop navigation remains inside the app origin and external protocols are constrained', () => {
  const origin = 'http://127.0.0.1:49152';
  assert.equal(isTrustedAppUrl(`${origin}/operations`, origin), true);
  assert.equal(isTrustedAppUrl('https://example.com', origin), false);
  assert.equal(isSafeExternalUrl('https://example.com'), true);
  assert.equal(isSafeExternalUrl('file:///C:/secret.txt'), false);
  assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
  const opened = [];
  const handler = createWindowOpenHandler({ origin, openExternal: (url) => opened.push(url) });
  assert.deepEqual(handler({ url: 'https://example.com' }), { action: 'deny' });
  assert.deepEqual(opened, ['https://example.com']);
  handler({ url: 'file:///C:/secret.txt' });
  assert.deepEqual(opened, ['https://example.com']);
});

test('desktop server serves the existing app, BrowserRouter fallback, and the existing API', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tactical-atlas-desktop-'));
  await fs.writeFile(path.join(root, 'index.html'), '<div id="root">Tactical Atlas</div>');
  await fs.mkdir(path.join(root, 'assets'));
  await fs.writeFile(path.join(root, 'assets', 'app.js'), 'console.log("atlas")');
  const { server, origin } = await startAtlasServer({ port: 0, staticRoot: root });
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(root, { recursive: true, force: true });
  });
  const rootResponse = await request(origin);
  assert.equal(rootResponse.status, 200);
  assert.match(rootResponse.body, /Tactical Atlas/);
  assert.match(rootResponse.headers['content-type'], /text\/html/);
  assert.match(rootResponse.headers['content-security-policy'], /default-src 'self'/);
  assert.match(rootResponse.headers['content-security-policy'], /object-src 'none'/);
  assert.equal(rootResponse.headers['x-frame-options'], 'DENY');
  assert.equal(
    rootResponse.headers['permissions-policy'],
    'camera=(), microphone=(), geolocation=()'
  );
  const routeResponse = await request(`${origin}/operations`);
  assert.equal(routeResponse.status, 200);
  assert.match(routeResponse.body, /Tactical Atlas/);
  const assetResponse = await request(`${origin}/assets/app.js`);
  assert.equal(assetResponse.status, 200);
  assert.match(assetResponse.headers['content-type'], /text\/javascript/);
  const healthResponse = await request(`${origin}/api/health`);
  assert.equal(healthResponse.status, 200);
  const health = JSON.parse(healthResponse.body);
  assert.equal(health.service, 'tactical-atlas-os');
  assert.equal(health.executionMode, 'READ_ONLY');
  assert.equal(health.components.TAIN.status, 'NOT_CONFIGURED');
  assert.equal((await request(`${origin}/missing.js`)).status, 404);
});

test('desktop packaging uses a hardened renderer and creates Windows shortcuts', async () => {
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  assert.equal(packageJson.main, 'desktop/main.js');
  assert.equal(
    packageJson.build.win.target.some((target) => target.target === 'nsis'),
    true
  );
  assert.equal(
    packageJson.build.win.target.some((target) => target.target === 'portable'),
    true
  );
  assert.equal(
    packageJson.build.nsis.artifactName,
    'Tactical-Atlas-Setup-${version}-${arch}.${ext}'
  );
  assert.equal(
    packageJson.build.portable.artifactName,
    'Tactical-Atlas-Portable-${version}-${arch}.${ext}'
  );
  assert.equal(packageJson.build.nsis.createDesktopShortcut, true);
  assert.equal(packageJson.build.nsis.createStartMenuShortcut, true);
  assert.ok(packageJson.build.files.includes('!node_modules/@capacitor{,/**/*}'));
  assert.ok(packageJson.build.files.includes('!node_modules/react{,/**/*}'));
  const main = await fs.readFile('desktop/main.js', 'utf8');
  assert.match(main, /contextIsolation: true/);
  assert.match(main, /nodeIntegration: false/);
  assert.match(main, /sandbox: true/);
  assert.match(main, /setWindowOpenHandler/);
  assert.doesNotMatch(main, /preload:/);
});
