import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/messaging';
import { Snackbar, Alert } from '@mui/material';
import React from 'react';
import logoImage from './ecotaskreward_logo.png';

const ForegroundNotificationReceiver = () => {
  const [notification, setNotification] = useState(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  useEffect(() => {
    const messaging = firebase.messaging();

    const handleForegroundNotification = (payload) => {
      if (payload?.notification?.title && payload?.notification?.body) {
        const notificationTitle = payload.notification.title;
        const notificationBody = payload.notification.body;

        setNotification({
          title: notificationTitle,
          body: notificationBody,
          open: true,
        });

        if (autoCloseTimer) {
          clearTimeout(autoCloseTimer);
        }

        const newAutoCloseTimer = setTimeout(() => {
          setNotification((prevNotification) => ({
            ...prevNotification,
            open: false,
          }));
        }, 5000);

        setAutoCloseTimer(newAutoCloseTimer);
      }
    };

    const unsubscribe = messaging.onMessage(handleForegroundNotification);

    return () => {
      unsubscribe();

      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer]);

  const handleMouseEnter = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
  };

  const handleMouseLeave = () => {
    if (!notification?.open) return; 
    const newAutoCloseTimer = setTimeout(() => {
      setNotification((prevNotification) => ({
        ...prevNotification,
        open: false,
      }));
    }, 5000);
    setAutoCloseTimer(newAutoCloseTimer);
  };

  return (
    <Snackbar
      open={notification?.open}
      autoHideDuration={null}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity="info"
        sx={{
          '& .MuiAlert-filledInfo': {
            backgroundColor: '#2196f3',
            fontSize: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          },
        }}
        icon={
          <img
            src={logoImage}
            alt="Logo"
            width="50"
            height="50"
            style={{ objectFit: 'cover' }}
          />
        }
      >
        <strong>{notification?.title}</strong>
        <br />
        {notification?.body}
      </Alert>
    </Snackbar>
  );
};

export default ForegroundNotificationReceiver;
