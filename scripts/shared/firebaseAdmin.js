const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');
const { getAuth } = require('firebase-admin/auth');

// 1. Initialize Firebase Admin App singleton
let adminApp;

if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle escaped newline characters in private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined,
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
} else {
  adminApp = admin.app();
}

// 2. Initialize Admin Services
const adminDb = getDatabase(adminApp);
const adminAuth = getAuth(adminApp);

// 3. Export instances
module.exports = {
  adminApp,
  adminDb,
  adminAuth
};
