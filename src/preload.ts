import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  onContextMenuCommand: (callback: (args: { command: string }) => void) => 
    ipcRenderer.on('context-menu-command', (_event, args) => callback(args)),
  navigateWebview: (url: string, tabId: string) => ipcRenderer.invoke('navigate-webview', url, tabId),
  getSetting: (key: string) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key: string, value: any) => ipcRenderer.invoke('set-setting', key, value),
  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
});