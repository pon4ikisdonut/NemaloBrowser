import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webLightTheme, webDarkTheme, Theme } from '@fluentui/react-components';
import App from './App';
import './styles/styles.css';
import { AppContext, IAppContext } from './AppContext';

const getFluentTheme = (themeName: string): Theme => {
  switch (themeName) {
    case 'light': return webLightTheme;
    case 'dark': return webDarkTheme;
    // For 'system', we'll default to light for now. Real system theme detection
    // would involve IPC to the main process to check OS theme.
    case 'system': return webLightTheme; 
    default: return webLightTheme;
  }
};

const Root = () => {
  const [theme, setTheme] = useState<Theme>(webLightTheme); // Default initial theme

  useEffect(() => {
    const fetchInitialTheme = async () => {
      const storedTheme = await window.electronAPI.getSetting('theme');
      setTheme(getFluentTheme(storedTheme || 'system'));
    };
    fetchInitialTheme();
  }, []);
  
  const handleNavigate = useCallback((url: string, tabId: string) => {
    window.electronAPI.navigateWebview(url, tabId);
  }, []);

  const contextValue: IAppContext = {
    setTheme,
    handleNavigate,
  };

  return (
    <React.StrictMode>
      <AppContext.Provider value={contextValue}>
        <FluentProvider theme={theme}>
          <App />
        </FluentProvider>
      </AppContext.Provider>
    </React.StrictMode>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}