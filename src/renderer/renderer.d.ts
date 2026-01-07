import { WebviewTag } from 'electron';

export interface IElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  showContextMenu: () => void;
  onContextMenuCommand: (callback: (args: { command: string }) => void) => void;
  navigateWebview: (url: string, tabId: string) => Promise<void>;
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