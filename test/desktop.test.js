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
import { createMainWindowOptions, createSplashWindowOptions } from '../desktop/window-options.js';

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
  assert.equal(packageJson.build.nsis.shortcutName, 'Tactical Atlas');
  assert.equal(packageJson.build.win.icon, 'desktop/assets/tactical-atlas.ico');
  assert.equal(packageJson.build.nsis.installerIcon, packageJson.build.win.icon);
  assert.equal(packageJson.build.nsis.uninstallerIcon, packageJson.build.win.icon);
  assert.equal(packageJson.build.nsis.installerHeaderIcon, packageJson.build.win.icon);
  assert.ok(packageJson.build.files.includes('!node_modules/@capacitor{,/**/*}'));
  assert.ok(packageJson.build.files.includes('!node_modules/react{,/**/*}'));

  const icon = await fs.readFile(packageJson.build.win.icon);
  assert.equal(icon.readUInt16LE(0), 0);
  assert.equal(icon.readUInt16LE(2), 1);
  assert.ok(icon.readUInt16LE(4) >= 7);

  const mainWindowOptions = createMainWindowOptions('atlas.png');
  const splashWindowOptions = createSplashWindowOptions('atlas.png');
  for (const options of [mainWindowOptions, splashWindowOptions]) {
    assert.equal(options.icon, 'atlas.png');
    assert.equal(options.webPreferences.contextIsolation, true);
    assert.equal(options.webPreferences.nodeIntegration, false);
    assert.equal(options.webPreferences.sandbox, true);
    assert.equal(options.webPreferences.webSecurity, true);
    assert.equal(options.webPreferences.allowRunningInsecureContent, false);
    assert.equal('preload' in options.webPreferences, false);
  }
  assert.equal(mainWindowOptions.show, false);
  assert.equal(splashWindowOptions.frame, false);
  assert.equal(splashWindowOptions.resizable, false);

  const main = await fs.readFile('desktop/main.js', 'utf8');
  assert.match(main, /setAppUserModelId\('com\.zachperryman\.tacticalatlas'\)/);
  assert.match(main, /setWindowOpenHandler/);
  assert.match(main, /will-attach-webview/);
  assert.match(main, /closeSplashWindow\(\);[\s\S]*window\.show\(\)/);
  assert.doesNotMatch(main, /preload:/);

  const splash = await fs.readFile('desktop/splash.html', 'utf8');
  assert.match(splash, /default-src 'none'/);
  assert.match(splash, /script-src 'none'/);
  assert.match(splash, /TACTICAL ATLAS/);
  assert.doesNotMatch(splash, /<script/i);
});

test('release preparation remains manual, unsigned by default, and secret-free', async () => {
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  assert.equal('publish' in packageJson.build, false);
  assert.equal('electron-updater' in packageJson.dependencies, false);
  assert.equal('electron-updater' in packageJson.devDependencies, false);
  assert.equal(JSON.stringify(packageJson).includes('CSC_LINK'), false);
  assert.equal(JSON.stringify(packageJson).includes('CSC_KEY_PASSWORD'), false);

  const readiness = await fs.readFile('RELEASE-READINESS.md', 'utf8');
  for (const requirement of [
    'WIN_CSC_LINK',
    'WIN_CSC_KEY_PASSWORD',
    'RFC 3161',
    'Get-AuthenticodeSignature',
    'signtool verify',
    'manual installer updates initially',
    'Do not add `electron-updater` yet',
    'ATLAS_TEST_DATABASE_URL',
    'ATLAS_TEST_DATABASE_CONFIRM=DISPOSABLE_PERSONAL_TACTICAL_ATLAS',
    'react-router-dom` 7.18.3',
  ]) {
    assert.match(readiness, new RegExp(requirement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }

  const workflow = await fs.readFile('.github/workflows/hardening.yml', 'utf8');
  assert.match(workflow, /NODE_OPTIONS: --throw-deprecation/);
  assert.match(workflow, /'recovery\/\*\*'/);
});
