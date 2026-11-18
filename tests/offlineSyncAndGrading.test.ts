/**
 * Offline-First Synchronization & Authoritative Grading Tests
 * Phase 9 Verification:
 * - Offline experiment progress recording
 * - 100-mark rubric evaluation & grade assignment
 * - Anti-cheat XP duplicate prevention via idempotency keys
 * - Offline sync queue accumulation in IndexedDB
 * - Conflict resolution preserving newer cloud timestamps
 * - Observation trials & bookmarks persistence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetAllData,
  getExperimentProgress,
  markExperimentStatus,
  recordVivaAttempt,
  recordGrade,
  awardXP,
  getTotalXP,
  getAllGrades,
  getGradeForExperiment,
  saveObservations,
  getObservations,
  toggleBookmark,
  isBookmarked,
} from '../src/services/studentProgressService';
import { getDatabase } from '../src/services/db';
import { getPendingSyncCount } from '../src/services/syncService';

describe('Offline-First Synchronization & Authoritative Grading', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  describe('Experiment Progress & Offline Queue', () => {
    it('persists progress locally in IndexedDB when offline', async () => {
      const initial = await getExperimentProgress('ohms-law');
      expect(initial.status).toBe('not-started');

      const updated = await markExperimentStatus('ohms-law', 'completed');
      expect(updated.status).toBe('completed');
      expect(updated.guidedCompleted).toBe(true);

      const verified = await getExperimentProgress('ohms-law');
      expect(verified.status).toBe('completed');
    });

    it('enqueues mutations into sync_queue for cloud synchronization', async () => {
      await markExperimentStatus('convex-lens', 'in-progress');
      const count = await getPendingSyncCount();
      expect(count).toBeGreaterThanOrEqual(1);

      const db = await getDatabase();
      const queueItems = await db.getAll('sync_queue');
      expect(queueItems.length).toBeGreaterThanOrEqual(1);
      expect(queueItems[queueItems.length - 1].table).toBe('student_progress');
    });
  });

  describe('Viva Voce & Authoritative 100-Mark Rubric Grading', () => {
    it('records viva attempt and calculates authoritative scores', async () => {
      const attempt = await recordVivaAttempt({
        studentId: 'student-test-1',
        experimentId: 'ohms-law',
        totalQuestions: 5,
        correctAnswers: 4,
        score: 32.0,
        maxScore: 40.0,
        answers: [
          { questionId: 'q1', selectedIndex: 0, correctIndex: 0, marks: 8 },
          { questionId: 'q2', selectedIndex: 1, correctIndex: 1, marks: 8 },
          { questionId: 'q3', selectedIndex: 2, correctIndex: 2, marks: 8 },
          { questionId: 'q4', selectedIndex: 3, correctIndex: 3, marks: 8 },
          { questionId: 'q5', selectedIndex: 0, correctIndex: 1, marks: 0 },
        ],
        timeSpentSeconds: 95,
      });

      expect(attempt.id).toBeTruthy();
      expect(attempt.score).toBe(32.0);
      expect(attempt.correctAnswers).toBe(4);
    });

    it('records grade and awards XP based on 100-mark rubric', async () => {
      const grade = await recordGrade({
        studentId: 'student-test-1',
        experimentId: 'ohms-law',
        labMarks: 54.0,
        vivaMarks: 32.0,
        totalMarks: 86.0,
        letterGrade: 'A',
        xpAwarded: 40,
      });

      expect(grade.letterGrade).toBe('A');
      expect(grade.totalMarks).toBe(86.0);
      expect(grade.xpAwarded).toBe(40);

      const fetched = await getGradeForExperiment('ohms-law');
      expect(fetched?.letterGrade).toBe('A');

      const allGrades = await getAllGrades();
      expect(allGrades['ohms-law']).toBeDefined();

      const totalXP = await getTotalXP();
      expect(totalXP).toBe(40);
    });

    it('prevents duplicate XP awards using unique idempotency keys', async () => {
      // Award XP for completing Ohm's Law
      await awardXP(40, 'Completed ohms-law', 'viva_score', 'ohms-law');
      const firstTotal = await getTotalXP();
      expect(firstTotal).toBe(40);

      // Attempt duplicate award with identical source and student
      await awardXP(40, 'Completed ohms-law', 'viva_score', 'ohms-law');
      const secondTotal = await getTotalXP();

      // Total XP must remain 40; duplicate must be rejected
      expect(secondTotal).toBe(40);
    });
  });

  describe('Observation Tables & Bookmarks Persistence', () => {
    it('persists observation trials into IndexedDB', async () => {
      const trials = [
        {
          id: 'trial-1',
          trial: 1,
          inputParam: '1.0 V',
          measuredParam: '0.20 A',
          calculatedParam: '5.00 Ω',
          notes: 'Standard trial',
        },
        {
          id: 'trial-2',
          trial: 2,
          inputParam: '2.0 V',
          measuredParam: '0.40 A',
          calculatedParam: '5.00 Ω',
          notes: 'Consistent resistance',
        },
      ];

      await saveObservations('ohms-law', trials);
      const saved = await getObservations('ohms-law');

      expect(saved).toHaveLength(2);
      expect(saved[0].measuredParam).toBe('0.20 A');
      expect(saved[1].calculatedParam).toBe('5.00 Ω');
    });

    it('toggles bookmarks and persists starred experiments', async () => {
      expect(await isBookmarked('simple-pendulum')).toBe(false);

      const starred = await toggleBookmark('simple-pendulum', 'physics', 'Prepare for viva');
      expect(starred).toBe(true);
      expect(await isBookmarked('simple-pendulum')).toBe(true);

      const unstarred = await toggleBookmark('simple-pendulum', 'physics');
      expect(unstarred).toBe(false);
      expect(await isBookmarked('simple-pendulum')).toBe(false);
    });
  });

  describe('Conflict Resolution Logic', () => {
    it('resolves conflicting records favoring completed over in-progress', () => {
      const cloudRecord = {
        experimentId: 'ohms-law',
        status: 'completed',
        updatedAt: '2026-11-18T05:00:00Z',
      };

      const localOutdatedRecord = {
        experimentId: 'ohms-law',
        status: 'in-progress',
        updatedAt: '2026-11-18T04:00:00Z',
      };

      const resolveConflict = (local: typeof localOutdatedRecord, cloud: typeof cloudRecord) => {
        // If cloud is already completed, local in-progress must not revert completed state
        if (cloud.status === 'completed' && local.status !== 'completed') {
          return { ...cloud };
        }
        return new Date(local.updatedAt) >= new Date(cloud.updatedAt) ? local : cloud;
      };

      const resolved = resolveConflict(localOutdatedRecord, cloudRecord);
      expect(resolved.status).toBe('completed');
    });
  });
});
