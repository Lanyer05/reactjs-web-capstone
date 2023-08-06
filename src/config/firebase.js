import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCP3Dfj2SBh6fC8KAaI4FpiATzgwb7McaQ",
  authDomain: "capstone-eafdd.firebaseapp.com",
  projectId: "capstone-eafdd",
  storageBucket: "capstone-eafdd.appspot.com",
  messagingSenderId: "211816054856",
  appId: "1:211816054856:web:2ae7cc44240abe1927d87d"
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const auth =firebase.auth();

export default firebase;

