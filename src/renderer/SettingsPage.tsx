import React, { useContext, useEffect, useState } from 'react';
import {
  makeStyles,
  tokens,
  Title1,
  Card,
  CardHeader,
  Button,
  Field,
  RadioGroup,
  Radio,
  Input,
  Dropdown,
  Option,
  RadioGroupOnChangeData,
  webLightTheme, 
  webDarkTheme,
} from '@fluentui/react-components';
import { AppContext } from './AppContext';
import { Theme } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
    height: '100%',
    overflowY: 'auto',
  },
  card: {
    width: '80%',
    maxWidth: '800px',
    marginBottom: '20px',
  },
  settingsSection: {
    marginBottom: '20px',
  },
  settingField: {
    marginBottom: '10px',
  },
});

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

export const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error('SettingsPage component must be used within an AppContext.Provider');
  }

  const { setTheme } = appContext;
  const [currentTheme, setCurrentTheme] = useState<string>('system');
  const [startPage, setStartPage] = useState<string>('nemalo://home');
  const [searchEngine, setSearchEngine] = useState<string>('Google');
  const [customSearchUrl, setCustomSearchUrl] = useState<string>('');

  useEffect(() => {
    const fetchSettings = async () => {
      const allSettings = await window.electronAPI.getAllSettings();
      setCurrentTheme(allSettings.theme || 'system');
      setStartPage(allSettings.startPage || 'nemalo://home');
      setSearchEngine(allSettings.searchEngine || 'Google');
      if (allSettings.customSearchUrl) {
        setCustomSearchUrl(allSettings.customSearchUrl);
      }
      setTheme(getFluentTheme(allSettings.theme || 'system')); // Also update the theme in AppContext
    };
    fetchSettings();
  }, [setTheme]);

  const handleThemeChange = async (ev: React.FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => {
    const newThemeName = data.value;
    setCurrentTheme(newThemeName);
    setTheme(getFluentTheme(newThemeName));
    await window.electronAPI.setSetting('theme', newThemeName);
  };

  const handleSaveStartPage = async () => {
    await window.electronAPI.setSetting('startPage', startPage);
    alert('Start page saved!');
  };

  const handleSaveSearchEngine = async () => {
    await window.electronAPI.setSetting('searchEngine', searchEngine);
    if (searchEngine === 'Custom') {
      await window.electronAPI.setSetting('customSearchUrl', customSearchUrl);
    }
    alert('Search engine saved!');
  };

  return (
    <div className={styles.container}>
      <Title1>Settings</Title1>

      <Card className={styles.card}>
        <CardHeader header={<Title1>Appearance</Title1>} />
        <div className={styles.settingsSection}>
          <Field label="Theme" className={styles.settingField}>
            <RadioGroup value={currentTheme} onChange={handleThemeChange}>
              <Radio value="light" label="Light" />
              <Radio value="dark" label="Dark" />
              <Radio value="system" label="System" />
            </RadioGroup>
          </Field>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader header={<Title1>Start Page</Title1>} />
        <div className={styles.settingsSection}>
          <Field label="Start page URL" className={styles.settingField}>
            <Input
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              placeholder="e.g., nemalo://home or https://www.example.com"
            />
          </Field>
          <Button onClick={handleSaveStartPage}>Save Start Page</Button>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader header={<Title1>Search Engine</Title1>} />
        <div className={styles.settingsSection}>
          <Field label="Default Search Engine" className={styles.settingField}>
            <Dropdown
              value={searchEngine}
              onOptionSelect={(e, data) => setSearchEngine(data.optionText || '')}
              placeholder="Select a search engine"
            >
              <Option>Google</Option>
              <Option>DuckDuckGo</Option>
              <Option>Bing</Option>
              <Option>Custom</Option>
            </Dropdown>
          </Field>
          {searchEngine === 'Custom' && (
            <Field label="Custom Search URL" className={styles.settingField}>
              <Input value={customSearchUrl} onChange={(e) => setCustomSearchUrl(e.target.value)} placeholder="e.g., https://www.mysearch.com/search?q=%s" />
            </Field>
          )}
          <Button onClick={handleSaveSearchEngine}>Save Search Engine</Button>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader header={<Title1>About NemaloBrowser</Title1>} />
        <div className={styles.settingsSection}>
          <p><strong>Name:</strong> NemaloBrowser</p>
          <p><strong>Author:</strong> pon4ikisdonut</p>
          <p><strong>Version:</strong> 0.2.0</p>
          <p><strong>License:</strong> GPL-3.0-or-later</p>
          <p><strong>Description:</strong> A modern, beautiful, and efficient web browser.</p>
          {/* Add more info like logo, build channel etc. if available and relevant */}
        </div>
      </Card>
    </div>
  );
};
