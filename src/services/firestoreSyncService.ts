/**
 * PrayogaProof Cloud Firestore Multi-User Synchronization Engine
 *
 * Implements:
 * - Isolated student profile management in Cloud Firestore (`users/{userId}`)
 * - Bidirectional synchronization between local IndexedDB and Firestore
 * - Offline queue flush on reconnection
 * - Non-destructive guest-to-user progress migration
 * - Secure server-aligned schema without storing passwords or granting client role escalations
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './firebaseClient';
import { getDatabase, LocalObservation } from './db';
import {
  UserProfile,
  UserRole,
  ExperimentProgress,
  GradeRecord,
  VivaAttemptRecord,
  SavedWorkspace,
  XPTransaction,
  UserAchievement,
} from '../types';

export interface FirestoreUserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade: string;
  schoolName: string;
  region: string;
  avatarSeed: string;
  totalXP: number;
  completedExperiments: string[];
  offlineSyncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

/**
 * Fetch a student's profile from Cloud Firestore
 */
export async function getFirestoreProfile(userId: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured() || !userId) return null;

  try {
    const userRef = doc(firestore, 'users', userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as FirestoreUserData;
      return {
        id: userId,
        name: data.name || 'Curious Learner',
        email: data.email,
        role: data.role || 'student',
        grade: data.grade || 'Class 10 Foundation',
        schoolName: data.schoolName || 'Prayoga STEM Academy',
        region: data.region || 'Karnataka, India',
        avatarSeed: data.avatarSeed || 'scientist-1',
        offlineSyncEnabled: true,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch Firestore profile (possibly offline):', err);
    return null;
  }
}

/**
 * Create or initialize a new student profile in Firestore
 */
export async function createFirestoreProfile(
  userId: string,
  initialData: {
    name: string;
    email: string;
    grade?: string;
    schoolName?: string;
    region?: string;
  }
): Promise<UserProfile> {
  const profile: FirestoreUserData = {
    id: userId,
    name: initialData.name.trim() || 'Curious Learner',
    email: initialData.email.trim(),
    role: 'student', // Secure role isolation: users can never self-assign teacher or admin
    grade: initialData.grade || 'Class 10 Foundation',
    schoolName: initialData.schoolName?.trim() || 'Prayoga STEM Academy',
    region: initialData.region?.trim() || 'Karnataka, India',
    avatarSeed: 'scientist-1',
    totalXP: 0,
    completedExperiments: [],
    offlineSyncEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    try {
      const userRef = doc(firestore, 'users', userId);
      await setDoc(userRef, profile, { merge: true });
    } catch (err) {
      console.warn('Failed to write Firestore profile:', err);
    }
  }

  return {
    ...profile,
  };
}

/**
 * Update an existing student's profile attributes in Firestore
 */
export async function updateFirestoreProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const userRef = doc(firestore, 'users', userId);
    // Exclude security-critical fields from unprivileged client updates
    const sanitizedUpdates: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    delete sanitizedUpdates.role; // Role escalations rejected by rule & stripped here

    await updateDoc(userRef, sanitizedUpdates);
  } catch (err) {
    console.warn('Failed to update Firestore profile:', err);
  }
}

/**
 * Migrate guest progress from local IndexedDB to student's Firestore cloud account
 */
export async function migrateGuestProgressToFirestore(userId: string): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const db = await getDatabase();
    const localProgress = await db.getAll('experiment_progress');
    const localGrades = await db.getAll('grades');
    const localViva = await db.getAll('viva_attempts');
    const localWorkspaces = await db.getAll('workspaces');
    const localObs = await db.getAll('experiment_observations');
    const localAchievements = await db.getAll('user_achievements');
    const localXP = await db.getAll('xp_transactions');

    if (
      localProgress.length === 0 &&
      localGrades.length === 0 &&
      localViva.length === 0 &&
      localWorkspaces.length === 0 &&
      localObs.length === 0 &&
      localAchievements.length === 0 &&
      localXP.length === 0
    ) {
      return;
    }

    const batch = writeBatch(firestore);
    const completedList: string[] = [];

    // 1. Push progress items
    for (const p of localProgress) {
      const progRef = doc(firestore, `users/${userId}/progress`, p.experimentId);
      batch.set(progRef, p, { merge: true });
      if (p.status === 'completed') {
        completedList.push(p.experimentId);
      }
    }

    // 2. Push grades
    for (const g of localGrades) {
      const gradeRef = doc(firestore, `users/${userId}/grades`, g.experimentId);
      batch.set(gradeRef, g, { merge: true });
    }

    // 3. Push viva attempts
    for (const v of localViva) {
      const vivaRef = doc(firestore, `users/${userId}/viva`, v.id);
      batch.set(vivaRef, v, { merge: true });
    }

    // 4. Push workspaces
    for (const w of localWorkspaces) {
      const wsRef = doc(firestore, `users/${userId}/workspaces`, w.id);
      batch.set(wsRef, w, { merge: true });
    }

    // 5. Push observations
    for (const o of localObs) {
      const obsRef = doc(firestore, `users/${userId}/observations`, o.id);
      batch.set(obsRef, o, { merge: true });
    }

    // 6. Push user achievements
    for (const a of localAchievements) {
      const achRef = doc(firestore, `users/${userId}/achievements`, a.achievementId);
      batch.set(achRef, a, { merge: true });
    }

    // 7. Push XP transactions
    let totalCalculatedXP = 0;
    for (const x of localXP) {
      const xpRef = doc(firestore, `users/${userId}/xp`, x.id);
      batch.set(xpRef, x, { merge: true });
      totalCalculatedXP += x.amount || 0;
    }

    // Update parent user document summary
    const userRef = doc(firestore, 'users', userId);
    batch.update(userRef, {
      completedExperiments: Array.from(new Set(completedList)),
      totalXP: totalCalculatedXP,
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (err) {
    console.warn('Guest migration to Firestore deferred or failed:', err);
  }
}

/**
 * Synchronize cloud records from Firestore down into local IndexedDB
 */
export async function syncFirestoreDownToLocal(userId: string): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const db = await getDatabase();

    // 1. Pull Progress subcollection
    const progSnap = await getDocs(collection(firestore, `users/${userId}/progress`));
    for (const d of progSnap.docs) {
      const cloudProg = d.data() as ExperimentProgress;
      const localProg = await db.get('experiment_progress', cloudProg.experimentId);
      // Conflict resolution: prefer completed, or cloud if newer
      if (
        !localProg ||
        cloudProg.status === 'completed' ||
        new Date(cloudProg.lastAccessedAt) > new Date(localProg.lastAccessedAt)
      ) {
        await db.put('experiment_progress', cloudProg);
      }
    }

    // 2. Pull Grades subcollection
    const gradesSnap = await getDocs(collection(firestore, `users/${userId}/grades`));
    for (const d of gradesSnap.docs) {
      const cloudGrade = d.data() as GradeRecord;
      const localGrade = await db.get('grades', cloudGrade.experimentId);
      if (!localGrade || (cloudGrade.totalMarks || 0) >= (localGrade.totalMarks || 0)) {
        await db.put('grades', cloudGrade);
      }
    }

    // 3. Pull Viva subcollection
    const vivaSnap = await getDocs(collection(firestore, `users/${userId}/viva`));
    for (const d of vivaSnap.docs) {
      const cloudViva = d.data() as VivaAttemptRecord;
      await db.put('viva_attempts', cloudViva);
    }

    // 4. Pull Workspaces subcollection
    const wsSnap = await getDocs(collection(firestore, `users/${userId}/workspaces`));
    for (const d of wsSnap.docs) {
      const cloudWs = d.data() as SavedWorkspace;
      const localWs = await db.get('workspaces', cloudWs.id);
      if (!localWs || new Date(cloudWs.updatedAt) > new Date(localWs.updatedAt)) {
        await db.put('workspaces', cloudWs);
      }
    }

    // 5. Pull Observations subcollection
    const obsSnap = await getDocs(collection(firestore, `users/${userId}/observations`));
    for (const d of obsSnap.docs) {
      const cloudObs = d.data() as LocalObservation;
      await db.put('experiment_observations', cloudObs);
    }

    // 6. Pull Achievements subcollection
    const achSnap = await getDocs(collection(firestore, `users/${userId}/achievements`));
    for (const d of achSnap.docs) {
      const cloudAch = d.data() as UserAchievement;
      await db.put('user_achievements', cloudAch);
    }

    // 7. Pull XP subcollection with idempotency check to prevent duplicate rewards
    const xpSnap = await getDocs(collection(firestore, `users/${userId}/xp`));
    for (const d of xpSnap.docs) {
      const cloudXP = d.data() as XPTransaction;
      const existing = await db.getFromIndex('xp_transactions', 'by-idempotency', cloudXP.idempotencyKey);
      if (!existing) {
        await db.put('xp_transactions', cloudXP);
      }
    }
  } catch (err) {
    console.warn('Cloud pull from Firestore encountered network limitation:', err);
  }
}

/**
 * Flush pending items from IndexedDB `sync_queue` to Cloud Firestore
 */
export async function flushSyncQueueToFirestore(userId: string): Promise<number> {
  if (!isFirebaseConfigured() || !userId) return 0;

  try {
    const db = await getDatabase();
    const queue = await db.getAll('sync_queue');
    if (queue.length === 0) return 0;

    let successCount = 0;
    for (const item of queue) {
      try {
        if (item.table === 'student_progress' || item.table === 'experiment_progress') {
          const expId = (item.payload.experimentId as string) || (item.payload.id as string);
          if (expId) {
            const docRef = doc(firestore, `users/${userId}/progress`, expId);
            if (item.action === 'delete') {
              await deleteDoc(docRef);
            } else {
              await setDoc(docRef, item.payload, { merge: true });
            }
          }
        } else if (item.table === 'grades') {
          const expId = item.payload.experimentId as string;
          if (expId) {
            const docRef = doc(firestore, `users/${userId}/grades`, expId);
            if (item.action === 'delete') {
              await deleteDoc(docRef);
            } else {
              await setDoc(docRef, item.payload, { merge: true });
            }
          }
        } else if (item.table === 'viva_attempts') {
          const vId = (item.payload.id as string) || `viva-${Date.now()}`;
          const docRef = doc(firestore, `users/${userId}/viva`, vId);
          if (item.action === 'delete') {
            await deleteDoc(docRef);
          } else {
            await setDoc(docRef, item.payload, { merge: true });
          }
        } else if (item.table === 'workspaces' || item.table === 'saved_workspaces') {
          const wsId = (item.payload.id as string) || (item.payload.experimentId as string);
          if (wsId) {
            const docRef = doc(firestore, `users/${userId}/workspaces`, wsId);
            if (item.action === 'delete') {
              await deleteDoc(docRef);
            } else {
              await setDoc(docRef, item.payload, { merge: true });
            }
          }
        } else if (item.table === 'experiment_observations') {
          const obsId = (item.payload.id as string) || `obs-${Date.now()}`;
          const docRef = doc(firestore, `users/${userId}/observations`, obsId);
          if (item.action === 'delete') {
            await deleteDoc(docRef);
          } else {
            await setDoc(docRef, item.payload, { merge: true });
          }
        } else if (item.table === 'user_achievements') {
          const achId = (item.payload.achievementId as string) || (item.payload.id as string);
          if (achId) {
            const docRef = doc(firestore, `users/${userId}/achievements`, achId);
            await setDoc(docRef, item.payload, { merge: true });
          }
        } else if (item.table === 'xp_transactions') {
          const xpId = (item.payload.id as string) || (item.payload.idempotencyKey as string) || `xp-${Date.now()}`;
          const docRef = doc(firestore, `users/${userId}/xp`, xpId);
          await setDoc(docRef, item.payload, { merge: true });
        }

        // Remove from queue upon successful write
        await db.delete('sync_queue', item.id);
        successCount++;
      } catch (e) {
        console.warn(`Deferred sync queue item ${item.id}:`, e);
      }
    }
    return successCount;
  } catch (err) {
    console.warn('Sync queue flush encountered an error:', err);
    return 0;
  }
}
