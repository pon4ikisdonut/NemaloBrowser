import React from 'react';
import { Button, makeStyles } from '@fluentui/react-components';
import {
  Subtract24Regular,
  Maximize24Regular,
  Dismiss24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  controls: {
    display: 'flex',
    gap: '2px',
    '-webkit-app-region': 'no-drag',
  },
});

export const WindowControls: React.FC = () => {
  const styles = useStyles();

  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => window.electronAPI.maximizeWindow();
  const handleClose = () => window.electronAPI.closeWindow();

  return (
    <div className={styles.controls}>
      <Button appearance="transparent" icon={<Subtract24Regular />} onClick={handleMinimize} />
      <Button appearance="transparent" icon={<Maximize24Regular />} onClick={handleMaximize} />
      <Button appearance="transparent" icon={<Dismiss24Regular />} onClick={handleClose} />
    </div>
  );
};
