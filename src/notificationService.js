// notificationService.js

import { initializeApp, credential as _credential, firestore, messaging } from 'firebase-admin';
import serviceAccount from './config/ecotaskreward-f1a4f-firebase-adminsdk-kn9h8-41e8637bb2.json';

initializeApp({
  credential: _credential.cert(serviceAccount),
  databaseURL: 'https://ecotaskreward-f1a4f.firebaseio.com',
});

const db = firestore();
const usersRef = db.collection('users');

export async function sendNotification() {
  const fcmTokens = [];

  try {
    const querySnapshot = await usersRef.get();

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.fcmToken) {
        fcmTokens.push(userData.fcmToken);
      }
    });

    const notification = {
      notification: {
        title: 'New Message',
        body: 'You have a new message!',
      },
    };

    const promises = fcmTokens.map((recipientToken) => {
      return messaging().sendToDevice(recipientToken, notification);
    });

    const responses = await Promise.all(promises);
    console.log('Notifications sent to all mobile users:', responses);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}
