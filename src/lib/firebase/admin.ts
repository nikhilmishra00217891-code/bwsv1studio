import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
    
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error: any) {
        // Provide a more detailed error log to help debug parsing issues.
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid JSON string in your .env file.", error.message);
        throw new Error("Could not initialize Firebase Admin SDK. Service account key is malformed.");
    }
}
