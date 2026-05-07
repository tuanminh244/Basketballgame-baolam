import { getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC9XUd8hwlgvWtiXJcbvEszyS0TJw4G43U",
  authDomain: "webapp-e3266.firebaseapp.com",
  databaseURL: "https://webapp-e3266-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webapp-e3266",
  storageBucket: "webapp-e3266.firebasestorage.app",
  messagingSenderId: "460689591719",
  appId: "1:460689591719:web:fdf9f84e9e80c808c67a82",
  measurementId: "G-NMV91QHS77"
};

const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export { app };

export const db = getDatabase(app);
