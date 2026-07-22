import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword as fbSignInWithEmail, signInWithPopup as fbSignInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword as fbCreateUser } from "firebase/auth";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForThenamERP2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thenam-crm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thenam-crm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thenam-crm.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithEmailAndPassword(_authObj: any, email: string, pass: string) {
  try {
    return await fbSignInWithEmail(auth, email, pass);
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      // Auto-create user if they don't exist
      console.log("User not found, auto-creating in Firebase...");
      return await fbCreateUser(auth, email, pass);
    }
    console.error("Firebase Email Auth Error:", error);
    throw error;
  }
}

export async function signInWithPopup(_authObj: any, provider: any) {
  try {
    return await fbSignInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Firebase Popup Auth Error:", error);
    throw error;
  }
}
