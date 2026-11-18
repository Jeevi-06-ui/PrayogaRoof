/**
 * PrayogaProof Firebase Authentication Service
 *
 * Implements:
 * - Email & password registration with displayName initialization
 * - Secure login with persistent session storage
 * - Password reset email dispatch
 * - Email verification flow
 * - Auth state listener
 * - Student-friendly error code mapping
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
  NextOrObserver,
} from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from './firebaseClient';

// Ensure browserLocalPersistence is configured for persistent sessions across tabs and WebViews
if (typeof window !== 'undefined') {
  setPersistence(firebaseAuth, browserLocalPersistence).catch((err) => {
    console.warn('Could not set Firebase auth persistence:', err);
  });
}

export interface AuthDiagnostic {
  code: string;
  rawMessage: string;
  provider: 'password' | 'google' | 'anonymous';
  platform: string;
  hint: string;
}

export class PrayogaAuthError extends Error {
  code: string;
  diagnostic: AuthDiagnostic;

  constructor(friendlyMessage: string, diagnostic: AuthDiagnostic) {
    super(friendlyMessage);
    this.name = 'PrayogaAuthError';
    this.code = diagnostic.code;
    this.diagnostic = diagnostic;
    Object.setPrototypeOf(this, PrayogaAuthError.prototype);
  }
}

function detectPlatform(): string {
  if (typeof window === 'undefined') return 'Node.js / Headless';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Android Capacitor WebView';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS Capacitor WKWebView';
  return 'Web Browser';
}

export function getAuthHint(errorCode: string): string {
  switch (errorCode) {
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not yet enabled. Open Firebase Console (https://console.firebase.google.com/project/prayogaroof/authentication), click "Get started", and enable "Email/Password" under Sign-in methods.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled. Open Firebase Console > Authentication > Sign-in method, click "Email/Password", and toggle to "Enabled".';
    case 'auth/api-key-not-valid':
    case 'auth/app-not-authorized':
      return 'API key is invalid or unauthorized. Verify VITE_FIREBASE_API_KEY in .env and check Authorized Domains in Firebase Authentication Settings.';
    case 'auth/network-request-failed':
      return 'Unable to reach identitytoolkit.googleapis.com. Check internet connectivity or tap "Continue in Offline Laboratory Mode (Guest)".';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Password does not match this account. Use the "Forgot Password" link to reset credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Switch to the "Sign In" tab.';
    case 'auth/weak-password':
      return 'Firebase security requires passwords to have a minimum of 6 characters.';
    default:
      return 'Review Firebase Console authentication settings or continue in Offline Laboratory mode.';
  }
}

/**
 * Maps raw Firebase error codes to human-readable explanations for students and teachers.
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid school or personal email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact your school laboratory administrator.';
    case 'auth/user-not-found':
      return 'No PrayogaProof account found with this email. Please check your email or create an account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect password or email. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too short. Please choose a password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection lost. Please check your internet connection or continue in Offline Laboratory mode.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to multiple failed login attempts. Please reset your password or wait a few minutes.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not yet activated in your Firebase project. Please click "Get started" in Firebase Console and enable Email/Password, or use Offline Guest Mode.';
    case 'auth/api-key-not-valid':
    case 'auth/app-not-authorized':
      return 'Firebase API key is invalid or unauthorized. Please verify your Firebase project credentials.';
    default:
      return 'Authentication could not be completed. Please try again or continue as Guest.';
  }
}

export function createPrayogaAuthError(err: unknown, provider: 'password' | 'google' = 'password'): PrayogaAuthError {
  const fbError = err as { code?: string; message?: string };
  const code = fbError.code || 'auth/unknown';
  const rawMessage = fbError.message || 'Unknown authentication failure';
  const platform = detectPlatform();
  const friendlyMessage = getFriendlyAuthErrorMessage(code);
  const hint = getAuthHint(code);

  return new PrayogaAuthError(friendlyMessage, {
    code,
    rawMessage,
    provider,
    platform,
    hint,
  });
}

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  grade?: string;
  schoolName?: string;
  region?: string;
}

/**
 * Register a new student account using Firebase Email & Password
 */
export async function registerWithFirebase(params: SignUpParams): Promise<{ user: User | null; error: Error | null }> {
  if (!isFirebaseConfigured()) {
    return { user: null, error: new Error('Firebase configuration missing. Please verify environment variables.') };
  }

  try {
    const cred = await createUserWithEmailAndPassword(
      firebaseAuth,
      params.email.trim(),
      params.password
    );

    // Update display name on Firebase User object
    if (params.fullName.trim()) {
      await updateProfile(cred.user, {
        displayName: params.fullName.trim(),
      });
    }

    // Attempt to send email verification (non-blocking)
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // Ignored if rate-limited or not required
    }

    return { user: cred.user, error: null };
  } catch (err: unknown) {
    const authError = createPrayogaAuthError(err, 'password');
    return { user: null, error: authError };
  }
}

/**
 * Sign in an existing student using Firebase Email & Password
 */
export async function loginWithFirebase(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
  if (!isFirebaseConfigured()) {
    return { user: null, error: new Error('Firebase configuration missing. Please verify environment variables.') };
  }

  try {
    const cred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    return { user: cred.user, error: null };
  } catch (err: unknown) {
    const authError = createPrayogaAuthError(err, 'password');
    return { user: null, error: authError };
  }
}

/**
 * Sign out current student session
 */
export async function logoutFromFirebase(): Promise<void> {
  if (isFirebaseConfigured()) {
    await fbSignOut(firebaseAuth);
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<{ error: Error | null }> {
  if (!isFirebaseConfigured()) {
    return { error: new Error('Firebase configuration missing.') };
  }

  try {
    await sendPasswordResetEmail(firebaseAuth, email.trim());
    return { error: null };
  } catch (err: unknown) {
    const authError = createPrayogaAuthError(err, 'password');
    return { error: authError };
  }
}

/**
 * Listen to Firebase Auth state changes
 */
export function onFirebaseAuthStateChange(callback: NextOrObserver<User>): () => void {
  return onAuthStateChanged(firebaseAuth, callback);
}
