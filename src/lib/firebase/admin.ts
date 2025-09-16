
import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";

// The service account key is securely stored as a JSON environment variable.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// This function ensures that the Firebase Admin SDK is initialized only once.
export const customInitApp = (): App => {
    if (getApps().length > 0) {
        return getApp();
    }
    
    if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side Firebase Admin SDK cannot be initialized.");
    }
    
    return initializeApp({
        credential: cert(JSON.parse(serviceAccountKey)),
    });
}
