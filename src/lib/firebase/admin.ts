import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";
import serviceAccount from './serviceAccount.json';

// This function ensures that the Firebase Admin SDK is initialized only once.
export const customInitApp = (): App => {
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
    
    return initializeApp({
        credential: cert(typedServiceAccount),
    });
}
