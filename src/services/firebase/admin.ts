import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || '{}';
  let credential;

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (Object.keys(serviceAccount).length > 0) {
      credential = admin.credential.cert(serviceAccount);
    } else {
      credential = admin.credential.applicationDefault();
    }
  } catch (e) {
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({
    credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.database();
