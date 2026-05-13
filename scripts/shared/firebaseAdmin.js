// scripts/shared/firebaseAdmin.js

const admin = require('firebase-admin');

// Singleton Initialization: Safe for serverless environments
let adminApp;
if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.applicationDefault(), 
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  });
} else {
  adminApp = admin.app();
}

const adminDb = admin.database();

// Forcefully terminate Firebase Admin connection to allow process to exit
const terminate = async () => {
  try {
    adminDb.goOffline();
    await adminApp.delete();
  } catch (error) {
    console.error('[ERROR] Failed to terminate Firebase Admin app:', error);
  }
};

module.exports = { adminApp, adminDb, terminate };
