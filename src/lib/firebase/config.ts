import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Central Firebase client initialization layer.
// Sử dụng các biến môi trường có sẵn và ngăn việc khởi tạo trùng lặp.
// LƯU Ý: Firebase Auth KHÔNG được sử dụng. Xác thực PIN được xử lý thủ công bằng logic của App.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Khởi tạo Firebase an toàn (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export các dịch vụ đã khởi tạo (Chỉ có Database)
const db = getDatabase(app);

export { app, db };
