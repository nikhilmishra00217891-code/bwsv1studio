// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
