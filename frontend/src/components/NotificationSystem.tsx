// Notification System Component
// Displays toast notifications throughout the application

import React from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Stack,
  IconButton,
  Typography,
  Box,
  Slide,
  SlideProps
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNotifications } from '../contexts/AppContext';

// Transition component for animations
const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="down" />;
};

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        width: 400,
        maxWidth: '90vw'
      }}
    >
      <Stack spacing={2}>
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            severity={notification.type}
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => handleClose(notification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <AlertTitle>{notification.title}</AlertTitle>
            <Typography variant="body2">
              {notification.message}
            </Typography>
          </Alert>
        ))}
      </Stack>
    </Box>
  );
};

export default NotificationSystem;
