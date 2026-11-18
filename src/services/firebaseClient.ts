/**
 * PrayogaProof Firebase Client Configuration & Service Initialization
 *
 * Implements:
 * - Multi-user Firebase Authentication with persistent session caching
 * - Cloud Firestore synchronization for experiment progress, XP, viva, and grades
 * - Safe environment variable loading with production fallbacks
 * - Web and Capacitor mobile (Android/iOS WebView) compatibility
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || 'AIzaSyCCfZobWn3CWK_obzSrwhEUXFOW925KIhg',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || 'prayogaroof.firebaseapp.com',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'prayogaroof',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || 'prayogaroof.firebasestorage.app',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '986551196855',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || '1:986551196855:web:6c13cf2af260f6618b4132',
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || 'G-RXKT0626GE',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_firebase_api_key' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your_project_id'
  );
}

// Singleton instances
let appInstance: FirebaseApp;

if (!getApps().length) {
  appInstance = initializeApp(firebaseConfig);
} else {
  appInstance = getApp();
}

const authInstance: Auth = getAuth(appInstance);

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(appInstance, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  firestoreInstance = getFirestore(appInstance);
}
let analyticsInstance: Promise<Analytics | null>;

// Analytics only in production browser environments supporting IndexedDB
if (
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  navigator.onLine &&
  !navigator.webdriver &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  analyticsInstance = isSupported()
    .then((supported) => (supported ? getAnalytics(appInstance) : null))
    .catch(() => null);
} else {
  analyticsInstance = Promise.resolve(null);
}

export const firebaseApp = appInstance;
export const firebaseAuth = authInstance;
export const firestore = firestoreInstance;
export const firebaseAnalytics = analyticsInstance;
export { firebaseConfig };
