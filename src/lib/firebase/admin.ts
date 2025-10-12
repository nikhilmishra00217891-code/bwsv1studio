
import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from './serviceAccount.json';

// This function ensures that the Firebase Admin SDK is initialized only once.
const customInitApp = (): App => {
    if (getApps().length > 0) {
        return getApp();
    }
    
    // The type assertion is necessary because the JSON file is untyped.
    const typedServiceAccount = serviceAccount as {
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_x509_cert_url: string;
        universe_domain: string;
    };
    
    const app = initializeApp({
        credential: cert(typedServiceAccount),
    });

    return app;
}

// A new getter function that guarantees initialization before returning the db instance.
export const getAdminDb = () => {
    customInitApp();
    return getFirestore();
}

// We no longer export customInitApp separately to enforce the new pattern.
