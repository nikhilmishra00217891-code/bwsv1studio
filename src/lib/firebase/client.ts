// src/lib/firebase/client.ts
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCdXe1KoEr_JleNIUy80XJO_buL6JO_4lE",
  authDomain: "biharwalesirji-w4n4b.firebaseapp.com",
  projectId: "biharwalesirji-w4n4b",
  storageBucket: "biharwalesirji-w4n4b.appspot.com",
  messagingSenderId: "207265599257",
  appId: "1:207265599257:web:67f9753a0650f500c43f88"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const messaging = () => {
    if (typeof window !== 'undefined' && getApps().length > 0) {
        return getMessaging(app);
    }
    return null;
}

export { app, auth, db, messaging };
