// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Re-export client-side instances
export * from './firebase/client';

// NOTE: The 'auth' and 'db' instances are now primarily initialized in 'firebase/client.ts'.
// This file can be used for server-side or shared configuration if needed,
// but for client-side operations, the instances from './firebase/client' should be used.
// We re-export them here for convenience and backwards compatibility in existing files.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdXe1KoEr_JleNIUy80XJO_buL6JO_4lE",
  authDomain: "biharwalesirji-w4n4b.firebaseapp.com",
  projectId: "biharwalesirji-w4n4b",
  storageBucket: "biharwalesirji-w4n4b.appspot.com",
  messagingSenderId: "207265599257",
  appId: "1:207265599257:web:67f9753a0650f500c43f88"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export server-safe modules
export { GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber };
