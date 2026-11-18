/**
 * PrayogaProof Authentication Context & Provider
 * Firebase Authentication & Cloud Firestore Integration
 *
 * Implements:
 * - Persistent authentication sessions via Firebase Web SDK
 * - Real-time onAuthStateChanged state synchronization
 * - Student/Teacher sign-up, sign-in, sign-out, and password recovery
 * - Cloud Firestore profile management and guest-to-user progress migration
 * - Protected routes and role-based authorization
 * - Offline-first fallback and guest exploration mode
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  registerWithFirebase,
  loginWithFirebase,
  logoutFromFirebase,
  sendPasswordReset,
  onFirebaseAuthStateChange,
  SignUpParams,
} from '../services/firebaseAuthService';
import { isFirebaseConfigured, firebaseAuth } from '../services/firebaseClient';
import {
  getFirestoreProfile,
  createFirestoreProfile,
  migrateGuestProgressToFirestore,
  syncFirestoreDownToLocal,
} from '../services/firestoreSyncService';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_STUDENT_PROFILE } from '../services/db';

export interface AuthSession {
  user: User;
  token?: string;
}

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  profile: UserProfile | null;
  role: UserRole;
  isGuest: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (params: SignUpParams) => Promise<{ error: Error | null; needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  continueAsGuest: () => void;
  refreshProfile: () => Promise<void>;
}

const GUEST_KEY = 'prayogaproof_is_guest';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem(GUEST_KEY) === 'true';
  });

  const configured = isFirebaseConfigured();

  const loadUserProfile = useCallback(async (fbUser: User): Promise<UserProfile> => {
    let p = await getFirestoreProfile(fbUser.uid);
    if (!p) {
      // Create new profile record in Firestore
      p = await createFirestoreProfile(fbUser.uid, {
        name: fbUser.displayName || 'Curious Learner',
        email: fbUser.email || '',
      });
    }

    // Migrate any guest experiments & pull cloud updates in background
    migrateGuestProgressToFirestore(fbUser.uid).catch(console.warn);
    syncFirestoreDownToLocal(fbUser.uid).catch(console.warn);

    return p;
  }, []);

  // Initialize and observe Firebase Auth state
  useEffect(() => {
    if (!configured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = onFirebaseAuthStateChange(async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        setSession({ user: currentUser });
        setIsGuest(false);
        localStorage.removeItem(GUEST_KEY);

        try {
          const loadedProfile = await loadUserProfile(currentUser);
          if (isMounted) setProfile(loadedProfile);
        } catch (err) {
          console.warn('Error loading user profile on auth state change:', err);
          if (isMounted) {
            setProfile({
              ...DEFAULT_STUDENT_PROFILE,
              id: currentUser.uid,
              name: currentUser.displayName || 'Curious Learner',
              email: currentUser.email || undefined,
              role: 'student',
            });
          }
        }
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [configured, loadUserProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    const { user: loggedInUser, error } = await loginWithFirebase(email, password);

    if (error) {
      setIsLoading(false);
      return { error };
    }

    if (loggedInUser) {
      setUser(loggedInUser);
      setSession({ user: loggedInUser });
      setIsGuest(false);
      localStorage.removeItem(GUEST_KEY);

      try {
        const loaded = await loadUserProfile(loggedInUser);
        setProfile(loaded);
      } catch (err) {
        console.warn('Profile sync post-login deferred:', err);
      }
    }

    setIsLoading(false);
    return { error: null };
  };

  const signUp = async (params: SignUpParams): Promise<{ error: Error | null; needsEmailVerification?: boolean }> => {
    setIsLoading(true);
    const { user: registeredUser, error } = await registerWithFirebase(params);

    if (error) {
      setIsLoading(false);
      return { error };
    }

    if (registeredUser) {
      setUser(registeredUser);
      setSession({ user: registeredUser });
      setIsGuest(false);
      localStorage.removeItem(GUEST_KEY);

      // Create initial Firestore student profile
      try {
        const newProfile = await createFirestoreProfile(registeredUser.uid, {
          name: params.fullName,
          email: params.email,
          grade: params.grade,
          schoolName: params.schoolName,
          region: params.region,
        });
        setProfile(newProfile);

        // Migrate guest progress
        await migrateGuestProgressToFirestore(registeredUser.uid);
      } catch (err) {
        console.warn('Firestore initial profile creation deferred:', err);
      }
    }

    setIsLoading(false);
    return { error: null, needsEmailVerification: false };
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    await logoutFromFirebase();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsGuest(true);
    localStorage.setItem(GUEST_KEY, 'true');
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    return sendPasswordReset(email);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem(GUEST_KEY, 'true');
  };

  const refreshProfile = async () => {
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      const p = await loadUserProfile(currentUser);
      setProfile(p);
    }
  };

  const effectiveRole: UserRole = profile?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: effectiveRole,
        isGuest,
        isLoading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        continueAsGuest,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      session: null,
      profile: null,
      role: 'student',
      isGuest: true,
      isLoading: false,
      isConfigured: false,
      signIn: async () => ({ error: new Error('AuthProvider not found') }),
      signUp: async () => ({ error: new Error('AuthProvider not found') }),
      signOut: async () => {},
      resetPassword: async () => ({ error: new Error('AuthProvider not found') }),
      continueAsGuest: () => {},
      refreshProfile: async () => {},
    };
  }
  return context;
};
