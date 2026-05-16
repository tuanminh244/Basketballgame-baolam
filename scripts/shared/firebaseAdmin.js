const admin = require('firebase-admin');

// Singleton Initialization: Safe for serverless environments & GitHub Actions
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // [HARDENING PATCH] Normalize newline escape sequences from GitHub Secrets
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const adminDb = admin.database();

module.exports = { adminDb };
