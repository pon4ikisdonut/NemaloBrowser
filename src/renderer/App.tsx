import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  TabList,
  Tab,
  ToolbarButton,
  Input,
  makeStyles,
  tokens,
  Button,
  Image,
} from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  ArrowRight24Regular,
  ArrowClockwise24Regular,
  Add24Regular,
  Dismiss24Regular,
  Globe24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';
import { WindowControls } from './WindowControls';
import { HomePage } from './HomePage';
import { SettingsPage } from './SettingsPage';

import { AppContext } from './AppContext';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    '-webkit-app-region': 'drag',
  },
  tabsHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: '4px',
    '-webkit-app-region': 'no-drag',
  },
  tabs: {
    paddingLeft: '80px',
    overflowX: 'auto',
    flexShrink: 1,
    minWidth: 0,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  favicon: {
    width: '16px',
    height: '16px',
  },
  tabIcon: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: tokens.borderRadiusMedium,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    }
  },
  spacer: {
    flexGrow: 1,
    height: '100%',
    '-webkit-app-region': 'drag',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    padding: '5px 10px',
    '-webkit-app-region': 'no-drag',
  },
  navControls: {
    display: 'flex',
    gap: '5px',
  },
  addressBar: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    position: 'relative',
    backgroundColor: tokens.colorNeutralBackground4,
  },
  webview: {
    width: '100%',
    height: '100%',
    border: '0',
  },
});

interface BrowserTab {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
}

const generateId = () => String(Date.now() + Math.random());

const App: React.FC = () => {
  const styles = useStyles();
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error('App component must be used within an AppContext.Provider');
  }

  const { setTheme } = appContext;
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [initializationComplete, setInitializationComplete] = useState<boolean>(false);
  const webviewRefs = useRef<{[key: string]: Electron.WebviewTag | null}>({});
  const [addressBarValue, setAddressBarValue] = useState<string>('');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [startPageSetting, setStartPageSetting] = useState<string>('nemalo://home'); // Local state for start page
  const [searchEngineSetting, setSearchEngineSetting] = useState<string>('Google');
  const [customSearchUrlSetting, setCustomSearchUrlSetting] = useState<string>('');

  useEffect(() => {
    const initializeSettings = async () => {
      const storedStartPage = await window.electronAPI.getSetting('startPage');
      setStartPageSetting(storedStartPage || 'nemalo://home');

      const storedSearchEngine = await window.electronAPI.getSetting('searchEngine');
      setSearchEngineSetting(storedSearchEngine || 'Google');
      const storedCustomSearchUrl = await window.electronAPI.getSetting('customSearchUrl');
      setCustomSearchUrlSetting(storedCustomSearchUrl || '');

      const initialTab: BrowserTab = { 
        id: generateId(), 
        url: storedStartPage || 'nemalo://home', 
        title: 'New Tab', 
        favicon: null 
      };
      setTabs([initialTab]);
      setActiveTabId(initialTab.id);
      setInitializationComplete(true);

      const storedTheme = await window.electronAPI.getSetting('theme');
      setTheme(storedTheme || 'system');
    };

    initializeSettings();
  }, [setTheme]);
  
  const handleNavigate = (url: string, tabId: string) => {
    setTabs(currentTabs => currentTabs.map(tab => tab.id === tabId ? { ...tab, url } : tab));
    window.electronAPI.navigateWebview(url, tabId);
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      setAddressBarValue(activeTab.url);
    }
  }, [activeTab]);
  
  useEffect(() => {
    const webview = webviewRefs.current[activeTabId];
    if (!webview) return;

    const handleTitleUpdate = (e: Electron.PageTitleUpdatedEvent) => setTabs(currentTabs => currentTabs.map(tab => tab.id === activeTabId ? { ...tab, title: e.title } : tab));
    const handleFaviconUpdate = (e: Electron.PageFaviconUpdatedEvent) => {
        if (e.favicons && e.favicons.length > 0) {
            setTabs(currentTabs => currentTabs.map(tab => tab.id === activeTabId ? { ...tab, favicon: e.favicons[0] } : tab));
        }
    };
    const handleUrlUpdate = (e: any) => {
      const newUrl = e.url;
      setTabs(currentTabs => currentTabs.map(tab => tab.id === activeTabId ? { ...tab, url: newUrl } : tab));
      setAddressBarValue(newUrl);
    };
    const handleContextMenu = (e: Event) => {
        e.preventDefault();
        window.electronAPI.showContextMenu();
    };

    webview.addEventListener('page-title-updated', handleTitleUpdate);
    webview.addEventListener('page-favicon-updated', handleFaviconUpdate);
    webview.addEventListener('did-navigate', handleUrlUpdate);
    webview.addEventListener('did-navigate-in-page', handleUrlUpdate);
    webview.addEventListener('will-redirect', handleUrlUpdate);
    webview.addEventListener('contextmenu', handleContextMenu);

    return () => {
      webview.removeEventListener('page-title-updated', handleTitleUpdate);
      webview.removeEventListener('page-favicon-updated', handleFaviconUpdate);
      webview.removeEventListener('did-navigate', handleUrlUpdate);
      webview.removeEventListener('did-navigate-in-page', handleUrlUpdate);
      webview.removeEventListener('will-redirect', handleUrlUpdate);
      webview.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [activeTabId]);

  useEffect(() => {
    const handleCommand = (args: { command: string }) => {
        const webview = webviewRefs.current[activeTabId];
        if (!webview) return;
        switch(args.command) {
            case 'reload': webview.reload(); break;
            case 'inspect': webview.openDevTools(); break;
        }
    };
    window.electronAPI.onContextMenuCommand(handleCommand);
  }, [activeTabId]);


  useEffect(() => {
    const tabsContainer = tabsContainerRef.current;
    if (!tabsContainer) return;
    const handleWheelScroll = (e: WheelEvent) => {
      e.preventDefault();
      tabsContainer.scrollLeft += e.deltaY;
    };
    tabsContainer.addEventListener('wheel', handleWheelScroll);
    return () => {
      tabsContainer.removeEventListener('wheel', handleWheelScroll);
    };
  }, []);

  const handleAddTab = () => {
    const newTab: BrowserTab = { id: generateId(), url: startPageSetting, title: 'New Tab', favicon: null };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (e: React.MouseEvent, tabIdToClose: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const tabIndex = tabs.findIndex(tab => tab.id === tabIdToClose);
    const newTabs = tabs.filter(tab => tab.id !== tabIdToClose);
    setTabs(newTabs);
    if (activeTabId === tabIdToClose) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const handleNav = (action: 'back' | 'forward' | 'reload') => {
    const webview = webviewRefs.current[activeTabId];
    if (webview) {
      if (action === 'back') webview.goBack();
      if (action === 'forward') webview.goForward();
      if (action === 'reload') webview.reload();
    }
  };
  
  const handleAddressBarSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let url = addressBarValue;
      if (!url.startsWith('http') && !url.startsWith('nemalo://')) {
        let searchUrl = 'https://www.google.com/search?q='; // Default to Google
        if (searchEngineSetting === 'DuckDuckGo') {
          searchUrl = 'https://duckduckgo.com/?q=';
        } else if (searchEngineSetting === 'Bing') {
          searchUrl = 'https://www.bing.com/search?q=';
        } else if (searchEngineSetting === 'Custom' && customSearchUrlSetting) {
          searchUrl = customSearchUrlSetting.replace('%s', encodeURIComponent(url));
          url = searchUrl; // If custom URL already includes %s, no further encoding is needed
        }
        if (searchEngineSetting !== 'Custom') { // For predefined search engines, encode the query
          url = searchUrl + encodeURIComponent(url);
        }
      }
      handleNavigate(url, activeTabId);
    }
  };

  if (!initializationComplete) {
    return <div>Loading...</div>; // Or a more elaborate loading spinner
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.tabsHeader}>
          <div className={styles.tabs} ref={tabsContainerRef}>
            <TabList selectedValue={activeTabId} onTabSelect={(_, data) => setActiveTabId(data.value as string)}>
              {tabs.map(tab => (
                <Tab key={tab.id} value={tab.id}>
                  <div className={styles.tab}>
                    {tab.favicon ? <Image className={styles.favicon} src={tab.favicon} /> : <Globe24Regular className={styles.favicon} />}
                    {tab.title}
                    <span className={styles.tabIcon} onClick={(e) => handleCloseTab(e, tab.id)}>
                      <Dismiss24Regular />
                    </span>
                  </div>
                </Tab>
              ))}
            </TabList>
          </div>
          <Button icon={<Add24Regular />} onClick={handleAddTab} appearance="subtle" />
          <div className={styles.spacer}></div>
          <WindowControls />
        </div>
        <div className={styles.toolbar}>
          <div className={styles.navControls}>
            <ToolbarButton icon={<ArrowLeft24Regular />} onClick={() => handleNav('back')} />
            <ToolbarButton icon={<ArrowRight24Regular />} onClick={() => handleNav('forward')} />
            <ToolbarButton icon={<ArrowClockwise24Regular />} onClick={() => handleNav('reload')} />
          </div>
          <Input
            className={styles.addressBar}
            placeholder="https://..."
            value={addressBarValue}
            onChange={(e, data) => setAddressBarValue(data.value)}
            onKeyDown={handleAddressBarSubmit}
          />
          <Button icon={<Settings24Regular />} onClick={() => handleNavigate('nemalo://settings', activeTabId)} appearance="subtle" />
        </div>
      </header>
      <main className={styles.content}>
        {tabs.map(tab => {
          const isHomePage = tab.url === 'nemalo://home';
          const isActive = tab.id === activeTabId;

          if (isHomePage) {
            return <div key={tab.id} style={{ display: isActive ? 'block' : 'none', height: '100%' }}><HomePage handleNavigate={(url: string) => handleNavigate(url, tab.id)} searchEngine={searchEngineSetting} customSearchUrl={customSearchUrlSetting} /></div>;
          } else if (tab.url === 'nemalo://settings') {
            return <div key={tab.id} style={{ display: isActive ? 'block' : 'none', height: '100%' }}><SettingsPage /></div>;
          }
          return (
            <webview
              key={tab.id}
              ref={(el: Electron.WebviewTag | null) => { webviewRefs.current[String(tab.id)] = el; }}
              src={tab.url}
              partition="persist:nemalo_session"
              className={styles.webview}
              style={{ display: isActive ? 'flex' : 'none' }}
            ></webview>
          );
        })}
      </main>
    </div>
  );
};

export default App;
