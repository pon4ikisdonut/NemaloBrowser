import React, { useState } from 'react';
import { makeStyles, tokens, Title1, Input } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
    gap: '20px',
  },
  searchBar: {
    width: '50%',
    maxWidth: '500px',
  },
});

interface HomePageProps {
  handleNavigate: (url: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ handleNavigate }) => {
  const styles = useStyles();
  const [searchValue, setSearchValue] = useState<string>('');

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue) {
      let url = searchValue;
      if (!url.startsWith('http') && !url.startsWith('nemalo://')) {
         url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
      handleNavigate(url);
    }
  };

  return (
    <div className={styles.container}>
      <Title1>NemaloBrowser</Title1>
      <Input
        className={styles.searchBar}
        placeholder="Search with Google or enter address"
        value={searchValue}
        onChange={(e, data) => setSearchValue(data.value)}
        onKeyDown={handleSearchSubmit}
      />
    </div>
  );
};

