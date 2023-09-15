importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDSZkeMXvu8Jt4XUv3I0aSYxyooZXa-LhU",
  authDomain: "ecotaskreward-bd9f8.firebaseapp.com",
  projectId: "ecotaskreward-bd9f8",
  storageBucket: "ecotaskreward-bd9f8.appspot.com",
  messagingSenderId: "680499772205",
  appId: "1:680499772205:web:76e4e03dfb0b802d3cb1a4"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/ecotaskreward_logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});