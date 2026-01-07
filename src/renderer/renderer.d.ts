import { WebviewTag } from 'electron';

export interface IElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  showContextMenu: () => void;
  navigateWebview: (url: string, tabId: string) => Promise<void>;
  getSetting: (key: string) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<void>;
  getAllSettings: () => Promise<Record<string, any>>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<WebviewTag>, WebviewTag>;
    }
  }

  interface HTMLElementTagNameMap {
    'webview': WebviewTag;
  }

  interface Window {
    electronAPI: IElectronAPI;
  }
}