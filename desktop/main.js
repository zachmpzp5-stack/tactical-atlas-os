import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, shell } from 'electron';
import { startAtlasServer } from '../server/index.js';
import { createWindowOpenHandler, isTrustedAppUrl } from './security.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const icon = app.isPackaged
  ? path.join(process.resourcesPath, 'tactical-atlas-icon.png')
  : path.join(projectRoot, 'public', 'assets', 'tactical-atlas-icon.png');
let atlasServer = null;
let mainWindow = null;

function createMainWindow(origin) {
  const window = new BrowserWindow({
    title: 'Tactical Atlas',
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#020b08',
    icon,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  window.webContents.setWindowOpenHandler(
    createWindowOpenHandler({ origin, openExternal: (url) => shell.openExternal(url) })
  );
  window.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedAppUrl(url, origin)) event.preventDefault();
  });
  window.webContents.on('will-attach-webview', (event) => event.preventDefault());
  window.once('ready-to-show', () => window.show());
  window.loadURL(origin);
  return window;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    const { server, origin } = await startAtlasServer({
      port: 0,
      staticRoot: path.join(projectRoot, 'dist'),
    });
    atlasServer = server;
    mainWindow = createMainWindow(origin);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && atlasServer) {
      const address = atlasServer.address();
      mainWindow = createMainWindow(`http://127.0.0.1:${address.port}`);
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => atlasServer?.close());
}
