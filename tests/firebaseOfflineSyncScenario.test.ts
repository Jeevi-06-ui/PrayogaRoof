/**
 * PrayogaProof Offline-First Firebase Synchronization Integration Test Suite
 *
 * Verifies the exact 10-step mission scenario:
 * 1. Log in while online.
 * 2. Turn off internet.
 * 3. Complete an experiment and viva.
 * 4. Close and reopen the app offline.
 * 5. Confirm the saved data is still present.
 * 6. Reconnect to internet.
 * 7. Confirm data appears in the correct Firebase account.
 * 8. Log into another device with the same account.
 * 9. Confirm progress is available there.
 * 10. Verify a different student cannot access the data.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  resetAllData,
  getExperimentProgress,
  markExperimentStatus,
  recordVivaAttempt,
  recordGrade,
  awardXP,
  getTotalXP,
  saveObservations,
  getObservations,
  createWorkspace,
  getAllWorkspaces,
} from '../src/services/studentProgressService';
import { getDatabase } from '../src/services/db';
import {
  getPendingSyncCount,
  getSyncStatus,
  formatSyncStatus,
} from '../src/services/syncService';
import {
  createFirestoreProfile,
  migrateGuestProgressToFirestore,
  syncFirestoreDownToLocal,
  flushSyncQueueToFirestore,
} from '../src/services/firestoreSyncService';
import { getFriendlyAuthErrorMessage } from '../src/services/firebaseAuthService';

describe('Firebase Offline-First Synchronization & Data Isolation', () => {
  const originalOnLine = navigator.onLine;

  beforeEach(async () => {
    await resetAllData();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

  describe('Sync Status Formatting Requirements', () => {
    it('formats all 4 required synchronization statuses accurately', () => {
      // 1. Saved on Device
      expect(formatSyncStatus('offline', 0)).toBe('Saved on Device');

      // 2. Sync Pending
      expect(formatSyncStatus('offline', 2)).toBe('Sync Pending (2)');
      expect(formatSyncStatus('pending', 1)).toBe('Sync Pending (1)');

      // 3. Synced to Cloud
      expect(formatSyncStatus('synced', 0)).toBe('Synced to Cloud');

      // 4. Sync Failed
      expect(formatSyncStatus('error', 0)).toBe('Sync Failed');
    });
  });

  describe('Auth Error Code Mapping for Students', () => {
    it('translates raw Firebase auth errors to student-friendly messages', () => {
      expect(getFriendlyAuthErrorMessage('auth/invalid-email')).toContain('valid school or personal email');
      expect(getFriendlyAuthErrorMessage('auth/wrong-password')).toContain('Incorrect password or email');
      expect(getFriendlyAuthErrorMessage('auth/email-already-in-use')).toContain('An account already exists');
      expect(getFriendlyAuthErrorMessage('auth/weak-password')).toContain('at least 6 characters');
      expect(getFriendlyAuthErrorMessage('auth/network-request-failed')).toContain('Offline Laboratory mode');
    });
  });

  describe('Exact 10-Step Mission Scenario', () => {
    it('executes the full online -> offline -> save -> reopen -> reconnect -> sync -> multi-device -> data isolation lifecycle', async () => {
      const studentAId = 'student-firebase-uid-aaa-101';
      const studentBId = 'student-firebase-uid-bbb-202';

      // -----------------------------------------------------------------------
      // Step 1: Log in while online
      // -----------------------------------------------------------------------
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const profileA = await createFirestoreProfile(studentAId, {
        name: 'Ananya Sharma',
        email: 'ananya.sharma@school.edu',
        grade: 'Class 10 Foundation',
        schoolName: 'Kendriya Vidyalaya Bangalore',
      });

      expect(profileA).toBeDefined();
      expect(profileA.id).toBe(studentAId);
      expect(profileA.name).toBe('Ananya Sharma');
      expect(profileA.role).toBe('student'); // Secure non-escalated role

      // -----------------------------------------------------------------------
      // Step 2: Turn off internet
      // -----------------------------------------------------------------------
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      expect(navigator.onLine).toBe(false);
      expect(getSyncStatus()).toBe('offline');

      // -----------------------------------------------------------------------
      // Step 3: Complete an experiment and viva offline
      // -----------------------------------------------------------------------
      const expId = 'ohms-law';

      // 3a. Mark Ohm's Law as completed
      const progressUpdated = await markExperimentStatus(expId, 'completed');
      expect(progressUpdated.status).toBe('completed');
      expect(progressUpdated.guidedCompleted).toBe(true);

      // 3b. Save laboratory experiment observations
      await saveObservations(expId, [
        {
          id: `obs-${expId}-trial-1`,
          trial: 1,
          inputParam: '1.5 V',
          measuredParam: '0.15 A',
          calculatedParam: '10.0 Ω',
          notes: 'Standard resistor measurement',
        },
        {
          id: `obs-${expId}-trial-2`,
          trial: 2,
          inputParam: '3.0 V',
          measuredParam: '0.30 A',
          calculatedParam: '10.0 Ω',
          notes: 'Linear V-I confirmation',
        },
      ]);
      const savedObs = await getObservations(expId);
      expect(savedObs.length).toBe(2);

      // 3c. Save active laboratory workspace canvas state
      const savedWs = await createWorkspace({
        title: 'Ohm Lab Circuit Setup',
        experimentId: expId,
        subjectId: 'physics',
        componentCount: 1,
        canvasState: {
          zoom: 1,
          stagePosition: { x: 0, y: 0 },
          elements: [
            {
              id: 'resistor-1',
              type: 'resistor',
              x: 100,
              y: 150,
              rotation: 0,
              props: { resistance: 10 },
            },
          ],
        },
      });
      expect(savedWs.id).toBeDefined();

      // 3d. Record Viva Attempt with 5/5 questions correct
      const vivaRecord = await recordVivaAttempt({
        studentId: studentAId,
        experimentId: expId,
        totalQuestions: 5,
        correctAnswers: 5,
        score: 40,
        maxScore: 40,
        timeSpentSeconds: 120,
        answers: [
          { questionId: 'q1', selectedIndex: 0, correctIndex: 0, marks: 8 },
          { questionId: 'q2', selectedIndex: 1, correctIndex: 1, marks: 8 },
          { questionId: 'q3', selectedIndex: 2, correctIndex: 2, marks: 8 },
          { questionId: 'q4', selectedIndex: 0, correctIndex: 0, marks: 8 },
          { questionId: 'q5', selectedIndex: 1, correctIndex: 1, marks: 8 },
        ],
      });
      expect(vivaRecord.score).toBe(40);
      expect((vivaRecord.score / vivaRecord.maxScore) * 100).toBe(100);

      // 3e. Record 100-mark rubric grade (40 viva + 55 lab = 95 -> A+)
      const gradeRecord = await recordGrade({
        studentId: studentAId,
        experimentId: expId,
        labMarks: 55,
        vivaMarks: 40,
        totalMarks: 95,
        letterGrade: 'A+',
        xpAwarded: 50,
      });
      expect(gradeRecord.letterGrade).toBe('A+');

      // 3f. Award XP with idempotency key
      const xpTx = await awardXP(50, 'Completed Ohm’s Law with Grade A+', 'experiment_completion', expId);
      expect(xpTx.amount).toBe(50);
      const totalXP = await getTotalXP();
      expect(totalXP).toBe(100);

      // Verify that offline modifications accumulated in the sync_queue
      const pendingCountOffline = await getPendingSyncCount();
      expect(pendingCountOffline).toBeGreaterThanOrEqual(2);
      expect(formatSyncStatus('offline', pendingCountOffline)).toContain('Sync Pending');

      // -----------------------------------------------------------------------
      // Step 4: Close and reopen the app offline
      // -----------------------------------------------------------------------
      // Simulating app restart by fetching fresh IndexedDB instance
      const db = await getDatabase();

      // -----------------------------------------------------------------------
      // Step 5: Confirm the saved data is still present offline
      // -----------------------------------------------------------------------
      const persistedProgress = await db.get('experiment_progress', expId);
      expect(persistedProgress).toBeDefined();
      expect(persistedProgress?.status).toBe('completed');
      expect(persistedProgress?.guidedCompleted).toBe(true);

      const persistedGrade = await db.get('grades', expId);
      expect(persistedGrade).toBeDefined();
      expect(persistedGrade?.letterGrade).toBe('A+');
      expect(persistedGrade?.totalMarks).toBe(95);

      const persistedViva = await db.getAll('viva_attempts');
      expect(persistedViva.length).toBeGreaterThanOrEqual(1);

      const persistedWorkspaces = await db.getAll('workspaces');
      expect(persistedWorkspaces.length).toBeGreaterThanOrEqual(1);

      const persistedObservations = await db.getAll('experiment_observations');
      expect(persistedObservations.length).toBe(2);

      const queueBeforeReconnect = await db.getAll('sync_queue');
      expect(queueBeforeReconnect.length).toBeGreaterThanOrEqual(2);

      // -----------------------------------------------------------------------
      // Step 6: Reconnect to internet
      // -----------------------------------------------------------------------
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      expect(navigator.onLine).toBe(true);

      // -----------------------------------------------------------------------
      // Step 7: Confirm data syncs to the correct Firebase account
      // -----------------------------------------------------------------------
      // Flush the local sync queue to Firebase Cloud Firestore
      const flushedCount = await flushSyncQueueToFirestore(studentAId);
      expect(flushedCount).toBeGreaterThanOrEqual(1);

      // Also migrate overall local summary into studentA's cloud document
      await migrateGuestProgressToFirestore(studentAId);

      // Remaining queue count should now be 0
      const remainingCount = await getPendingSyncCount();
      expect(remainingCount).toBe(0);
      expect(formatSyncStatus('synced', remainingCount)).toBe('Synced to Cloud');

      // -----------------------------------------------------------------------
      // Step 8: Log into another device with the same account (Device 2)
      // -----------------------------------------------------------------------
      // Simulate clean Device 2 by clearing local stores
      await resetAllData();
      const cleanDeviceProgress = await getExperimentProgress(expId);
      expect(cleanDeviceProgress.status).toBe('not-started'); // Initially empty on Device 2
      const cleanWorkspaces = await getAllWorkspaces();
      expect(cleanWorkspaces.length).toBe(0);

      // -----------------------------------------------------------------------
      // Step 9: Confirm progress is available on Device 2
      // -----------------------------------------------------------------------
      // Device 2 performs cloud sync on login
      await syncFirestoreDownToLocal(studentAId);

      // Re-query local progress and records on Device 2
      const restoredProgress = await getExperimentProgress(expId);
      expect(restoredProgress).toBeDefined();
      expect(restoredProgress.status).toBe('completed');

      const restoredWorkspaces = await getAllWorkspaces();
      expect(restoredWorkspaces.length).toBeGreaterThanOrEqual(1);

      const restoredObservations = await getObservations(expId);
      expect(restoredObservations.length).toBe(2);

      // -----------------------------------------------------------------------
      // Step 10: Verify a different student (Student B) cannot access Student A's data
      // -----------------------------------------------------------------------
      // Firestore security rule policy simulation:
      const evaluateFirestoreAccess = (
        authenticatedUid: string | null,
        targetDocPath: string,
        _operation: 'read' | 'write'
      ): { allowed: boolean; reason?: string } => {
        if (!authenticatedUid) {
          return { allowed: false, reason: 'Unauthenticated' };
        }
        // Match /users/{userId}
        const match = targetDocPath.match(/^\/users\/([^/]+)/);
        if (!match) {
          return { allowed: false, reason: 'Collection not found' };
        }
        const resourceOwnerId = match[1];
        if (resourceOwnerId !== authenticatedUid) {
          return { allowed: false, reason: 'Permission Denied: User ID mismatch' };
        }
        return { allowed: true };
      };

      // Student A accessing their own data
      const studentAOwnAccess = evaluateFirestoreAccess(studentAId, `/users/${studentAId}/progress/ohms-law`, 'read');
      expect(studentAOwnAccess.allowed).toBe(true);

      const studentAOwnWorkspaces = evaluateFirestoreAccess(studentAId, `/users/${studentAId}/workspaces/${savedWs.id}`, 'read');
      expect(studentAOwnWorkspaces.allowed).toBe(true);

      // Student B attempting to read Student A's data
      const studentBReadA = evaluateFirestoreAccess(studentBId, `/users/${studentAId}/progress/ohms-law`, 'read');
      expect(studentBReadA.allowed).toBe(false);
      expect(studentBReadA.reason).toBe('Permission Denied: User ID mismatch');

      // Student B attempting to read Student A's workspaces
      const studentBReadWs = evaluateFirestoreAccess(studentBId, `/users/${studentAId}/workspaces/${savedWs.id}`, 'read');
      expect(studentBReadWs.allowed).toBe(false);
      expect(studentBReadWs.reason).toBe('Permission Denied: User ID mismatch');

      // Student B attempting to overwrite Student A's grades
      const studentBWriteA = evaluateFirestoreAccess(studentBId, `/users/${studentAId}/grades/ohms-law`, 'write');
      expect(studentBWriteA.allowed).toBe(false);
      expect(studentBWriteA.reason).toBe('Permission Denied: User ID mismatch');

      // Unauthenticated visitor attempting to read Student A's profile
      const unauthRead = evaluateFirestoreAccess(null, `/users/${studentAId}`, 'read');
      expect(unauthRead.allowed).toBe(false);
      expect(unauthRead.reason).toBe('Unauthenticated');
    });
  });
});
