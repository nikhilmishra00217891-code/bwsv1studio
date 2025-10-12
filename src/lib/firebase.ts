
// Re-export client-side instances
export * from './firebase/client';

// NOTE: The 'auth' and 'db' instances are now primarily initialized in 'firebase/client.ts'.
// This file can be used for server-side or shared configuration if needed,
// but for client-side operations, the instances from './firebase/client' should be used.
// We re-export them here for convenience and backwards compatibility in existing files.

// Export server-safe modules for use in server components if needed, though direct import is cleaner.
import { GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
export { GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber };

// The legacy db instance is removed to prevent conflicts.
// All imports should now point to './firebase/client' for the client-side db.
