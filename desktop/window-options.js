const secureWebPreferences = {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false,
};

export function createMainWindowOptions(icon) {
  return {
    title: 'Tactical Atlas',
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#020b08',
    icon,
    show: false,
    autoHideMenuBar: true,
    webPreferences: { ...secureWebPreferences },
  };
}

export function createSplashWindowOptions(icon) {
  return {
    width: 520,
    height: 320,
    backgroundColor: '#020b08',
    icon,
    show: true,
    frame: false,
    resizable: false,
    center: true,
    webPreferences: { ...secureWebPreferences },
  };
}
