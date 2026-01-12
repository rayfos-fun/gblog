import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
// We use getApps() to avoid re-initializing if it's already running (hot reload safety)
if (!getApps().length) {
    // If GOOGLE_APPLICATION_CREDENTIALS is set, or if running in GAE, this works automatically.
    // Exception: local dev without credentials might need a service-account.json
    initializeApp();
}

export const db = getFirestore();
