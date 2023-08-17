import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAOeeOeSwXgjRGHkmNlfP_tpyNgTlFMV4A",
  authDomain: "capstone-42e7f.firebaseapp.com",
  projectId: "capstone-42e7f",
  storageBucket: "capstone-42e7f.appspot.com",
  messagingSenderId: "221741818484",
  appId: "1:221741818484:web:bc3aae451e45e7708b2721"
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const auth =firebase.auth();
export const database = firebase.database();
export const messaging = firebase.messaging();

export default firebase;

