import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB6qjSc_VkKkNBgEOoybLEwPdUIIK1OinI",
  authDomain: "capstone1-1b3d1.firebaseapp.com",
  projectId: "capstone1-1b3d1",
  storageBucket: "capstone1-1b3d1.appspot.com",
  messagingSenderId: "710765135722",
  appId: "1:710765135722:web:8d89c3a5e6623353360713"
};


firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const auth =firebase.auth();
export const database = firebase.database();

export default firebase;

