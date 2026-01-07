import React from 'react';
import { Theme } from '@fluentui/react-components';

export interface IAppContext {
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  handleNavigate: (url: string, tabId: string) => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);
