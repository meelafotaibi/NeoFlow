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
  onSnapshot,
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

export const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

export const db = dbInstance;

// Google Sign-In
export async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please configure API keys.");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Apple Sign-In with clear diagnostic handling
export async function signInWithApple() {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please configure API keys.");
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (err: any) {
    console.error("Apple Sign-In error:", err);
    if (
      err?.code === "auth/operation-not-allowed" ||
      err?.code === "auth/configuration-not-found" ||
      err?.message?.includes("operation-not-allowed")
    ) {
      throw new Error(
        "Apple Sign-In requires configuration in your Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Enable Apple with your Apple Developer Team ID."
      );
    }
    throw err;
  }
}

// Sign Out
export async function logoutUser() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

// Save user data to Firestore
export async function saveUserData(uid: string, data: object) {
  if (!db) return;
  try {
    await setDoc(doc(db, "users", uid), { data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Firestore save failed, using localStorage fallback:", e);
  }
}

// Load user data from Firestore
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

// Subscribe to real-time Cloud Firestore updates (filters out local echo writes)
export function subscribeToUserData(uid: string, callback: (data: object | null) => void) {
  if (!db) return () => {};
  try {
    const userDocRef = doc(db, "users", uid);
    return onSnapshot(
      userDocRef,
      { includeMetadataChanges: true },
      (docSnap) => {
        // Prevent local echo writes from overwriting React state during active updates
        if (docSnap.metadata.hasPendingWrites) {
          return;
        }
        if (docSnap.exists()) {
          callback(docSnap.data()?.data || null);
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
