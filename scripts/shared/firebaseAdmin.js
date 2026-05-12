const admin = require('firebase-admin');

// Singleton Initialization: Safe for serverless environments
let adminApp;
if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.applicationDefault(), 
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
} else {
  adminApp = admin.app();
}

const adminDb = admin.database();

module.exports = { adminApp, adminDb };
