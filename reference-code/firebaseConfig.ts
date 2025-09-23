import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   /* cSpell:disable */
//   apiKey: 'AIzaSyC5MvMfEeebh3XxyzYSD3qWpFR0aAAXSHM',
//   authDomain: 'expo-bca-app.firebaseapp.com',
//   databaseURL: 'https://expo-bca-app-default-rtdb.firebaseio.com',
//   projectId: 'expo-bca-app',
//   storageBucket: 'expo-bca-app.appspot.com',
//   messagingSenderId: '248104656807',
//   appId: '1:248104656807:web:853cad16b8fa38dbee2082',
//   measurementId: 'G-EL12CDVSCR',
// };
const firebaseConfig = {
  apiKey: 'AIzaSyC5MvMfEeebh3XxyzYSD3qWpFR0aAAXSHM',
  authDomain: 'expo-bca-app.firebaseapp.com',
  databaseURL: 'https://expo-bca-app-default-rtdb.firebaseio.com',
  projectId: 'expo-bca-app',
  storageBucket: 'expo-bca-app.appspot.com',
  messagingSenderId: '248104656807',
  appId: '1:248104656807:web:853cad16b8fa38dbee2082',
  measurementId: 'G-EL12CDVSCR',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
