
import { initializeApp, getApps, cert } from "firebase-admin/app";

// The service account key is securely stored as a JSON environment variable.
const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

// This function ensures that the Firebase Admin SDK is initialized only once.
export const customInitApp = () => {
    if (getApps().length === 0) {
        initializeApp({
            credential: cert(serviceAccount),
        });
    }
}
