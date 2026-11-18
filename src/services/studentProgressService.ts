import { getDatabase, DEFAULT_STUDENT_PROFILE, DEFAULT_SETTINGS, LocalObservation, LocalBookmark } from './db';
import { EXPERIMENTS } from './experimentRegistry';
import { enqueueSync } from './syncService';
import {
  ExperimentProgress,
  SavedWorkspace,
  StudentProfile,
  OverallStats,
  SubjectId,
  ProgressStatus,
  VivaAttemptRecord,
  GradeRecord,
  XPTransaction,
  UserAchievement,
} from '../types';

// In-memory fallback if IndexedDB is unavailable in non-browser/restricted envs
const MEMORY_CACHE = {
  profile: { ...DEFAULT_STUDENT_PROFILE },
  settings: { ...DEFAULT_SETTINGS },
  progress: new Map<string, ExperimentProgress>(),
  workspaces: new Map<string, SavedWorkspace>(),
  viva: new Map<string, VivaAttemptRecord>(),
  grades: new Map<string, GradeRecord>(),
  xp: new Map<string, XPTransaction>(),
  achievements: new Map<string, UserAchievement>(),
  bookmarks: new Map<string, LocalBookmark>(),
  observations: new Map<string, LocalObservation[]>(),
};

/**
 * Initialize progress entry for an experiment if not already existing
 */
function createDefaultProgress(experimentId: string, subjectId: SubjectId): ExperimentProgress {
  return {
    experimentId,
    subjectId,
    status: 'not-started',
    guidedCompleted: false,
    guidedStepIndex: 0,
    freeLabWorkspacesCount: 0,
    timeSpentSeconds: 0,
    lastAccessedAt: new Date().toISOString(),
    notes: '',
  };
}

/* =========================================================================
   STUDENT PROFILE OPERATIONS
   ========================================================================= */

export async function getStudentProfile(): Promise<StudentProfile> {
  try {
    const db = await getDatabase();
    const profile = await db.get('student_profile', 'current-student');
    if (profile) return profile;

    // Seed default if empty
    await db.put('student_profile', DEFAULT_STUDENT_PROFILE);
    return DEFAULT_STUDENT_PROFILE;
  } catch (err) {
    console.warn('IndexedDB unavailable for getStudentProfile, using fallback', err);
    const stored = localStorage.getItem('prayogaproof_student_profile');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore parse error
      }
    }
    return MEMORY_CACHE.profile;
  }
}

export async function updateStudentProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
  const current = await getStudentProfile();
  const updated: StudentProfile = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    await db.put('student_profile', updated);
  } catch (err) {
    console.warn('IndexedDB unavailable for updateStudentProfile, using fallback', err);
    MEMORY_CACHE.profile = updated;
    localStorage.setItem('prayogaproof_student_profile', JSON.stringify(updated));
  }
  return updated;
}

/* =========================================================================
   EXPERIMENT PROGRESS OPERATIONS
   ========================================================================= */

export async function getAllProgress(): Promise<Record<string, ExperimentProgress>> {
  const result: Record<string, ExperimentProgress> = {};

  try {
    const db = await getDatabase();
    const all = await db.getAll('experiment_progress');
    all.forEach((item) => {
      result[item.experimentId] = item;
    });
  } catch (err) {
    console.warn('IndexedDB unavailable for getAllProgress, using fallback', err);
    MEMORY_CACHE.progress.forEach((v, k) => {
      result[k] = v;
    });
  }

  // Ensure every active experiment in registry has at least an initialized entry
  for (const exp of EXPERIMENTS) {
    if (!result[exp.id]) {
      result[exp.id] = createDefaultProgress(exp.id, exp.subjectId);
    }
  }

  return result;
}

export async function getExperimentProgress(experimentId: string): Promise<ExperimentProgress> {
  const expMeta = EXPERIMENTS.find((e) => e.id === experimentId);
  const subjectId = expMeta?.subjectId || 'physics';

  try {
    const db = await getDatabase();
    const found = await db.get('experiment_progress', experimentId);
    if (found) return found;

    const initial = createDefaultProgress(experimentId, subjectId);
    await db.put('experiment_progress', initial);
    return initial;
  } catch (err) {
    console.warn('IndexedDB unavailable for getExperimentProgress, using fallback', err);
    if (!MEMORY_CACHE.progress.has(experimentId)) {
      MEMORY_CACHE.progress.set(experimentId, createDefaultProgress(experimentId, subjectId));
    }
    return MEMORY_CACHE.progress.get(experimentId)!;
  }
}

export async function updateExperimentProgress(
  experimentId: string,
  updates: Partial<ExperimentProgress>
): Promise<ExperimentProgress> {
  const current = await getExperimentProgress(experimentId);
  const updated: ExperimentProgress = {
    ...current,
    ...updates,
    lastAccessedAt: new Date().toISOString(),
  };

  if (updates.status === 'completed' && !current.completedAt) {
    updated.completedAt = new Date().toISOString();
  }

  try {
    const db = await getDatabase();
    await db.put('experiment_progress', updated);
  } catch (err) {
    console.warn('IndexedDB unavailable for updateExperimentProgress, using fallback', err);
    MEMORY_CACHE.progress.set(experimentId, updated);
  }

  // Enqueue for cloud sync
  enqueueSync('student_progress', 'upsert', updated as unknown as Record<string, unknown>).catch(console.warn);

  return updated;
}

export async function markExperimentStatus(
  experimentId: string,
  status: ProgressStatus
): Promise<ExperimentProgress> {
  const current = await getExperimentProgress(experimentId);
  return updateExperimentProgress(experimentId, {
    status,
    guidedCompleted: status === 'completed' ? true : current.guidedCompleted,
    completedAt: status === 'completed' ? (current.completedAt || new Date().toISOString()) : undefined,
  });
}

export async function recordExperimentTime(
  experimentId: string,
  additionalSeconds: number
): Promise<void> {
  const current = await getExperimentProgress(experimentId);
  const newTime = (current.timeSpentSeconds || 0) + additionalSeconds;
  await updateExperimentProgress(experimentId, {
    timeSpentSeconds: newTime,
    status: current.status === 'not-started' ? 'in-progress' : current.status,
  });
}

/* =========================================================================
   SAVED WORKSPACES OPERATIONS
   ========================================================================= */

export async function getAllWorkspaces(): Promise<SavedWorkspace[]> {
  try {
    const db = await getDatabase();
    return await db.getAll('workspaces');
  } catch (err) {
    console.warn('IndexedDB unavailable for getAllWorkspaces, using fallback', err);
    return Array.from(MEMORY_CACHE.workspaces.values());
  }
}

export async function getWorkspacesByExperiment(experimentId: string): Promise<SavedWorkspace[]> {
  try {
    const db = await getDatabase();
    const index = db.transaction('workspaces').store.index('by-experiment');
    return await index.getAll(experimentId);
  } catch (err) {
    console.warn('IndexedDB unavailable for getWorkspacesByExperiment, using fallback', err);
    return Array.from(MEMORY_CACHE.workspaces.values()).filter((w) => w.experimentId === experimentId);
  }
}

export async function createWorkspace(
  data: Omit<SavedWorkspace, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SavedWorkspace> {
  const newWorkspace: SavedWorkspace = {
    ...data,
    id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    await db.put('workspaces', newWorkspace);

    // Update experiment progress workspace count
    const currentProgress = await getExperimentProgress(data.experimentId);
    await updateExperimentProgress(data.experimentId, {
      freeLabWorkspacesCount: (currentProgress.freeLabWorkspacesCount || 0) + 1,
      status: currentProgress.status === 'not-started' ? 'in-progress' : currentProgress.status,
    });
  } catch (err) {
    console.warn('IndexedDB unavailable for createWorkspace, using fallback', err);
    MEMORY_CACHE.workspaces.set(newWorkspace.id, newWorkspace);
  }

  // Enqueue for cloud sync
  enqueueSync('saved_workspaces', 'upsert', newWorkspace as unknown as Record<string, unknown>).catch(console.warn);

  return newWorkspace;
}

export async function deleteWorkspace(id: string, experimentId?: string): Promise<void> {
  try {
    const db = await getDatabase();
    await db.delete('workspaces', id);

    if (experimentId) {
      const remaining = await getWorkspacesByExperiment(experimentId);
      await updateExperimentProgress(experimentId, {
        freeLabWorkspacesCount: remaining.length,
      });
    }
  } catch (err) {
    console.warn('IndexedDB unavailable for deleteWorkspace, using fallback', err);
    MEMORY_CACHE.workspaces.delete(id);
  }

  // Enqueue for cloud sync
  enqueueSync('saved_workspaces', 'delete', { id }).catch(console.warn);
}

/* =========================================================================
   VIVA, GRADES & AUTHORITATIVE XP OPERATIONS
   ========================================================================= */

export async function recordVivaAttempt(
  data: Omit<VivaAttemptRecord, 'id' | 'submittedAt'>
): Promise<VivaAttemptRecord> {
  const attempt: VivaAttemptRecord = {
    ...data,
    id: `viva-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    submittedAt: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    await db.put('viva_attempts', attempt);
  } catch (err) {
    console.warn('IndexedDB error saving viva attempt:', err);
    MEMORY_CACHE.viva.set(attempt.id, attempt);
  }

  enqueueSync('viva_attempts', 'upsert', attempt as unknown as Record<string, unknown>).catch(console.warn);
  return attempt;
}

export async function recordGrade(
  data: Omit<GradeRecord, 'id' | 'awardedAt'>
): Promise<GradeRecord> {
  const grade: GradeRecord = {
    ...data,
    id: `grade-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    awardedAt: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    await db.put('grades', grade);
  } catch (err) {
    console.warn('IndexedDB error saving grade:', err);
    MEMORY_CACHE.grades.set(grade.experimentId, grade);
  }

  enqueueSync('grades', 'upsert', grade as unknown as Record<string, unknown>).catch(console.warn);

  // Automatically award XP with idempotency key
  if (data.xpAwarded > 0) {
    await awardXP(
      data.xpAwarded,
      `Completed ${data.experimentId} with Grade ${data.letterGrade}`,
      'viva_score',
      data.experimentId
    );
  }

  return grade;
}

export async function awardXP(
  amount: number,
  reason: string,
  sourceType: XPTransaction['sourceType'],
  sourceId: string
): Promise<XPTransaction> {
  const profile = await getStudentProfile();
  const idempotencyKey = `xp:${profile.id}:${sourceType}:${sourceId}`;

  const transaction: XPTransaction = {
    id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentId: profile.id,
    amount,
    reason,
    sourceType,
    sourceId,
    idempotencyKey,
    createdAt: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    // Check if idempotency key already exists to prevent duplicate awards
    const existing = await db.getFromIndex('xp_transactions', 'by-idempotency', idempotencyKey);
    if (existing) {
      return existing;
    }
    await db.put('xp_transactions', transaction);
  } catch (err) {
    console.warn('IndexedDB error saving XP transaction:', err);
    if (MEMORY_CACHE.xp.has(idempotencyKey)) {
      return MEMORY_CACHE.xp.get(idempotencyKey)!;
    }
    MEMORY_CACHE.xp.set(idempotencyKey, transaction);
  }

  enqueueSync('xp_transactions', 'upsert', transaction as unknown as Record<string, unknown>).catch(console.warn);
  return transaction;
}

export async function getTotalXP(): Promise<number> {
  try {
    const db = await getDatabase();
    const all = await db.getAll('xp_transactions');
    return all.reduce((sum, item) => sum + item.amount, 0);
  } catch {
    let sum = 0;
    MEMORY_CACHE.xp.forEach((t) => (sum += t.amount));
    return sum;
  }
}

export async function getAllGrades(): Promise<Record<string, GradeRecord>> {
  const result: Record<string, GradeRecord> = {};
  try {
    const db = await getDatabase();
    const all = await db.getAll('grades');
    all.forEach((g) => (result[g.experimentId] = g));
  } catch {
    MEMORY_CACHE.grades.forEach((g, k) => (result[k] = g));
  }
  return result;
}

export async function getGradeForExperiment(experimentId: string): Promise<GradeRecord | undefined> {
  try {
    const db = await getDatabase();
    return await db.get('grades', experimentId);
  } catch {
    return MEMORY_CACHE.grades.get(experimentId);
  }
}

/* =========================================================================
   BOOKMARKS & OBSERVATIONS
   ========================================================================= */

export async function toggleBookmark(
  experimentId: string,
  subjectId: SubjectId,
  notes = ''
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const existing = await db.get('bookmarks', experimentId);
    if (existing) {
      await db.delete('bookmarks', experimentId);
      enqueueSync('bookmarks', 'delete', { experimentId }).catch(console.warn);
      return false;
    } else {
      const bookmark: LocalBookmark = {
        experimentId,
        subjectId,
        notes,
        createdAt: new Date().toISOString(),
      };
      await db.put('bookmarks', bookmark);
      enqueueSync('bookmarks', 'upsert', bookmark as unknown as Record<string, unknown>).catch(console.warn);
      return true;
    }
  } catch {
    return false;
  }
}

export async function isBookmarked(experimentId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const found = await db.get('bookmarks', experimentId);
    return Boolean(found);
  } catch {
    return MEMORY_CACHE.bookmarks.has(experimentId);
  }
}

export async function saveObservations(
  experimentId: string,
  trials: Array<{
    id: string;
    trial: number;
    inputParam: string;
    measuredParam: string;
    calculatedParam: string;
    notes: string;
  }>
): Promise<void> {
  try {
    const db = await getDatabase();
    for (const t of trials) {
      const obs: LocalObservation = {
        ...t,
        experimentId,
        updatedAt: new Date().toISOString(),
      };
      await db.put('experiment_observations', obs);
      enqueueSync('experiment_observations', 'upsert', obs as unknown as Record<string, unknown>).catch(console.warn);
    }
  } catch (err) {
    console.warn('Failed to save observations to IndexedDB:', err);
  }
}

export async function getObservations(experimentId: string): Promise<LocalObservation[]> {
  try {
    const db = await getDatabase();
    const index = db.transaction('experiment_observations').store.index('by-experiment');
    return await index.getAll(experimentId);
  } catch {
    return [];
  }
}

/* =========================================================================
   OVERALL STATS CALCULATION
   ========================================================================= */

export async function calculateOverallStats(): Promise<OverallStats> {
  const allProgress = await getAllProgress();
  const allWorkspaces = await getAllWorkspaces();
  const totalXP = await getTotalXP();

  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let totalTime = 0;
  let physicsCompleted = 0;
  let chemistryCompleted = 0;
  let biologyCompleted = 0;
  let mathematicsCompleted = 0;

  for (const exp of EXPERIMENTS) {
    const prog = allProgress[exp.id];
    if (!prog || prog.status === 'not-started') {
      notStarted++;
    } else if (prog.status === 'completed') {
      completed++;
      if (exp.subjectId === 'physics') physicsCompleted++;
      if (exp.subjectId === 'chemistry') chemistryCompleted++;
      if (exp.subjectId === 'biology') biologyCompleted++;
      if (exp.subjectId === 'mathematics') mathematicsCompleted++;
    } else if (prog.status === 'in-progress') {
      inProgress++;
    }

    if (prog?.timeSpentSeconds) {
      totalTime += prog.timeSpentSeconds;
    }
  }

  const physicsTotal = EXPERIMENTS.filter((e) => e.subjectId === 'physics').length;
  const chemistryTotal = EXPERIMENTS.filter((e) => e.subjectId === 'chemistry').length;
  const biologyTotal = EXPERIMENTS.filter((e) => e.subjectId === 'biology').length;
  const mathematicsTotal = EXPERIMENTS.filter((e) => e.subjectId === 'mathematics').length;

  return {
    totalActiveExperiments: EXPERIMENTS.length,
    completedExperiments: completed,
    inProgressExperiments: inProgress,
    notStartedExperiments: notStarted,
    totalWorkspacesCreated: allWorkspaces.length,
    totalTimeSpentSeconds: totalTime,
    physicsCompleted,
    physicsTotal,
    chemistryCompleted,
    chemistryTotal,
    biologyCompleted,
    biologyTotal,
    mathematicsCompleted,
    mathematicsTotal,
    totalXP,
  };
}

/* =========================================================================
   DATA RESET & EXPORT / IMPORT
   ========================================================================= */

export async function resetAllData(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.clear('experiment_progress');
    await db.clear('workspaces');
    await db.clear('viva_attempts');
    await db.clear('grades');
    await db.clear('xp_transactions');
    await db.clear('user_achievements');
    await db.clear('bookmarks');
    await db.clear('experiment_observations');
    await db.clear('sync_queue');
    await db.put('student_profile', {
      ...DEFAULT_STUDENT_PROFILE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error clearing IndexedDB, clearing fallback', err);
    MEMORY_CACHE.progress.clear();
    MEMORY_CACHE.workspaces.clear();
    MEMORY_CACHE.viva.clear();
    MEMORY_CACHE.grades.clear();
    MEMORY_CACHE.xp.clear();
    MEMORY_CACHE.achievements.clear();
    MEMORY_CACHE.bookmarks.clear();
    MEMORY_CACHE.observations.clear();
    MEMORY_CACHE.profile = { ...DEFAULT_STUDENT_PROFILE };
    localStorage.removeItem('prayogaproof_student_profile');
  }
}

export async function exportStudentData(): Promise<string> {
  const profile = await getStudentProfile();
  const progress = await getAllProgress();
  const workspaces = await getAllWorkspaces();
  const grades = await getAllGrades();
  const totalXP = await getTotalXP();

  const bundle = {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    profile,
    progress,
    workspaces,
    grades,
    totalXP,
  };

  return JSON.stringify(bundle, null, 2);
}
