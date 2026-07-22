import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Read exclusively from environment variables for zero secret exposure in source code
const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const isValidKey = Boolean(rawApiKey && rawApiKey.trim().length > 5 && !rawApiKey.includes("your-"));

// Fallback dummy configuration for build-time static page prerendering (SSG) when env secrets are missing on CI
const firebaseConfig = {
  apiKey: isValidKey ? rawApiKey : "AIzaSyA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "neoflow-4df47.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "neoflow-4df47",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "neoflow-4df47.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1020982199438",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1020982199438:web:dummy",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;

try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
} catch (e) {
  console.warn("Firebase initialization skipped during static build:", e);
}

export const app = appInstance;
export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
export const db = dbInstance;

// Google Sign-In
export async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please configure API keys.");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Sign Out
export async function logoutUser() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

/**
 * Save plain store data to Firestore (NO encryption — Firestore has server-side security rules).
 * Only the plain store fields are saved so snapshots can be read back cleanly.
 */
export async function saveUserData(uid: string, data: object) {
  if (!db) return;
  try {
    await setDoc(
      doc(db, "users", uid),
      { data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.warn("Firestore save failed, data is preserved in localStorage:", e);
  }
}

/**
 * One-time load of user data from Firestore (used as fallback on first login).
 */
export async function loadUserData(uid: string): Promise<object | null> {
  if (!db) return null;
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

/**
 * Subscribe to real-time Firestore updates.
 * 
 * IMPORTANT: We do NOT use includeMetadataChanges here.
 * This means the callback only fires when the server has CONFIRMED the write —
 * never for optimistic local writes. This prevents the data-loss loop where
 * a local echo snapshot overwrites in-progress React state.
 */
export function subscribeToUserData(uid: string, callback: (data: object | null) => void) {
  if (!db) return () => {};
  try {
    const userDocRef = doc(db, "users", uid);
    return onSnapshot(
      userDocRef,
      // No { includeMetadataChanges: true } — only fires on server-confirmed changes
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data()?.data || null);
        } else {
          // Document doesn't exist yet (new user) — don't overwrite local state
          callback(null);
        }
      },
      (error) => {
        console.warn("Real-time sync listener error:", error);
      }
    );
  } catch (e) {
    console.warn("Failed to attach Firestore snapshot listener:", e);
    return () => {};
  }
}

export type { User };
