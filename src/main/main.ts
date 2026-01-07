import { app, BrowserWindow, ipcMain, Menu, protocol, session } from 'electron';
import * as path from 'path';
import reloader from 'electron-reloader';
import Store from 'electron-store';
import { ElectronBlocker } from '@ghostery/adblocker-electron';
import fetch from 'cross-fetch';

try {
  reloader(module);
} catch (_) {}

protocol.registerSchemesAsPrivileged([
  { scheme: 'nemalo', privileges: { standard: true, secure: true, bypassCSP: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true } }
]);

const store = new Store({
  schema: {
    theme: {
      type: 'string',
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    startPage: {
      type: 'string',
      default: 'nemalo://home',
    },
    searchEngine: {
      type: 'string',
      default: 'Google',
    },
  },
});

let mainWindow: BrowserWindow | null;

app.on('ready', async () => {
  createWindow();

  protocol.registerFileProtocol('nemalo', (request, callback) => {
    const url = request.url.substr(9); // Remove "nemalo://"
    const filePath = path.join(__dirname, 'renderer', url === 'home' || url === 'settings' ? 'index.html' : url);
    callback({ path: filePath });
  });

  // Adblocker integration
  try {
    const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
    blocker.enableBlockingInSession(session.defaultSession);
    console.log('Adblocker initialized and enabled.');
  } catch (error) {
    console.error('Failed to initialize adblocker:', error);
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    icon: path.join(__dirname, '../../assets/NemaloBrowser.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false, // Temporarily disable for easier testing of custom protocols
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// --- Basic IPC Handlers ---
ipcMain.on('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow?.close();
});

ipcMain.on('show-context-menu', (event) => {
    const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
        { label: 'Back', enabled: event.sender.canGoBack(), click: () => { event.sender.goBack(); } },
        { label: 'Forward', enabled: event.sender.canGoForward(), click: () => { event.sender.goForward(); } },
        { label: 'Reload', click: () => { event.sender.reload(); } },
        { type: 'separator' },
        { label: 'Cut', enabled: event.sender.isFocused() && event.sender.hasSelection(), click: () => { event.sender.cut(); } },
        { label: 'Copy', enabled: event.sender.isFocused() && event.sender.hasSelection(), click: () => { event.sender.copy(); } },
        { label: 'Paste', enabled: event.sender.isFocused(), click: () => { event.sender.paste(); } },
        { type: 'separator' },
        { label: 'Select All', click: () => { event.sender.selectAll(); } },
        { type: 'separator' },
        { label: 'Inspect Element', click: () => { event.sender.openDevTools(); } },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) || undefined });
});

ipcMain.handle('navigate-webview', async (event, url: string, tabId: string) => {
  // In a real application, you would manage webviews here and
  // tell the correct webview to load the URL.
  // For now, we'll just log it.
  console.log(`Main process received navigation request for URL: ${url} in tab: ${tabId}`);
  // If you want to actually navigate a webview here, you'd need a way
  // to reference the specific webview associated with the tabId.
  // This usually involves storing references to webContents or BrowserWindow instances.
});

ipcMain.handle('get-setting', (event, key: string) => {
  return store.get(key);
});

ipcMain.handle('set-setting', (event, key: string, value: any) => {
  store.set(key, value);
});

ipcMain.handle('get-all-settings', () => {
  return store.store;
});
