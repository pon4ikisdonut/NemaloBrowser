import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webLightTheme, Theme } from '@fluentui/react-components';
import App from './App';
import './styles/styles.css';
import { AppContext, IAppContext } from './AppContext';

const Root = () => {
  const [theme, setTheme] = useState<Theme>(webLightTheme);
  
  // This is a placeholder. The actual navigation logic resides in App.tsx
  // and will be provided through the context value there.
  const handleNavigate = useCallback((url: string, tabId: string) => {
    console.log('Navigate to:', url, 'in tab:', tabId);
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