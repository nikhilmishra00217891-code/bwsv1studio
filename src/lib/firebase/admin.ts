
import { initializeApp, getApps, cert } from "firebase-admin/app";

// The service account key is securely stored as a JSON environment variable.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// This function ensures that the Firebase Admin SDK is initialized only once.
export const customInitApp = () => {
    if (getApps().length === 0 && serviceAccountKey) {
        initializeApp({
            credential: cert(JSON.parse(serviceAccountKey)),
        });
    } else if (!serviceAccountKey) {
        console.warn("Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side auth will not work.");
    }
}
