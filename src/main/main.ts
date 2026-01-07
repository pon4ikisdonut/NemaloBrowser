import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import reloader from 'electron-reloader';

try {
  reloader(module);
} catch (_) {}

let mainWindow: BrowserWindow | null;

app.on('ready', () => {
  createWindow();
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
    const template = [
        { label: 'Reload', click: () => { event.sender.send('context-menu-command', { command: 'reload' }); } },
        { label: 'Inspect Element', click: () => { event.sender.send('context-menu-command', { command: 'inspect' }); } },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) || undefined });
});
