import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import 'firebase/compat/messaging';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-Iv08ra8cU21__MfzLV40NYgsgi0qQTA",
  authDomain: "ecotaskreward-f1a4f.firebaseapp.com",
  projectId: "ecotaskreward-f1a4f",
  storageBucket: "ecotaskreward-f1a4f.appspot.com",
  messagingSenderId: "238602413554",
  appId: "1:238602413554:web:f47a1315ae7670ac09776b"
};

const app = firebase.initializeApp(firebaseConfig);
export const storage = app.storage();
export const firestore = app.firestore();
export const auth = app.auth();
export const database = app.database();
export const messaging = app.messaging();

export default app;
