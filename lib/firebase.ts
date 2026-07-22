import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

// Read exclusively from environment variables for zero secret exposure in source code
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize Firebase app singleton safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");
export const db = getFirestore(app);

// Google Sign-In
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Apple Sign-In
export async function signInWithApple() {
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

// Sign Out
export async function logoutUser() {
  await firebaseSignOut(auth);
}

// Save user data to Firestore
export async function saveUserData(uid: string, data: object) {
  try {
    await setDoc(doc(db, "users", uid), { data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Firestore save failed, using localStorage fallback:", e);
  }
}

// Load user data from Firestore
export async function loadUserData(uid: string): Promise<object | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data()?.data || null;
    }
  } catch (e) {
    console.warn("Firestore load failed:", e);
  }
  return null;
}

export type { User };
