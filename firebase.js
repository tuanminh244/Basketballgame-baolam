import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDh1xUt7GHDnJ2PmA6454Hz4KBJNaVnGCQ",
  authDomain: "family-gamification.firebaseapp.com",
  projectId: "family-gamification",
  storageBucket: "family-gamification.firebasestorage.app",
  messagingSenderId: "649855761910",
  appId: "1:649855761910:web:e2e1061af47290cb1a9bd7",
  databaseURL: "https://family-gamification-default-rtdb.firebaseio.com"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
