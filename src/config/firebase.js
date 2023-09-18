import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/messaging';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSZkeMXvu8Jt4XUv3I0aSYxyooZXa-LhU",
  authDomain: "ecotaskreward-bd9f8.firebaseapp.com",
  projectId: "ecotaskreward-bd9f8",
  storageBucket: "ecotaskreward-bd9f8.appspot.com",
  messagingSenderId: "680499772205",
  appId: "1:680499772205:web:76e4e03dfb0b802d3cb1a4"
};

firebase.initializeApp(firebaseConfig);

export const storage = firebase.storage();
export const firestore = firebase.firestore();
export const auth = firebase.auth();
export const database = firebase.database();
export const messaging = firebase.messaging();

export default firebase;

