import React from 'react';
import { Chip, Box } from '@mui/material';
import { Wifi, WifiOff, Sync } from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

const ConnectionStatus = () => {
  const { isConnected, connectionStatus } = useSocket();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi />,
          label: 'Connected',
          color: 'success',
        };
      case 'connecting':
        return {
          icon: <Sync />,
          label: 'Connecting...',
          color: 'warning',
        };
      case 'lost':
        return {
          icon: <WifiOff />,
          label: 'Connection Lost',
          color: 'error',
        };
      default:
        return {
          icon: <WifiOff />,
          label: 'Disconnected',
          color: 'default',
        };
    }
  };

  const statusConfig = getStatusConfig();

  if (!isConnected && connectionStatus === 'disconnected') {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', top: 70, right: 16, zIndex: 1000 }}>
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        variant="outlined"
      />
    </Box>
  );
};

export default ConnectionStatus;