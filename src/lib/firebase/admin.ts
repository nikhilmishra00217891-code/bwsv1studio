
import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";
import "dotenv/config";

// This function ensures that the Firebase Admin SDK is initialized only once.
export const customInitApp = (): App => {
    if (getApps().length > 0) {
        return getApp();
    }
    
    try {
        const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountString) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
        }
        
        const serviceAccount = JSON.parse(serviceAccountString);

        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error: any) {
        console.error("Failed to initialize Firebase Admin SDK.", error);
        // This makes the error much more visible in server logs.
        throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
    }
}
