import { getDatabase, DEFAULT_STUDENT_PROFILE, DEFAULT_SETTINGS } from './db';
import { EXPERIMENTS } from './experimentRegistry';
import {
  ExperimentProgress,
  SavedWorkspace,
  StudentProfile,
  OverallStats,
  SubjectId,
  ProgressStatus,
} from '../types';

// In-memory fallback if IndexedDB is unavailable in non-browser/restricted envs
const MEMORY_CACHE = {
  profile: { ...DEFAULT_STUDENT_PROFILE },
  settings: { ...DEFAULT_SETTINGS },
  progress: new Map<string, ExperimentProgress>(),
  workspaces: new Map<string, SavedWorkspace>(),
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
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
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
}

/* =========================================================================
   OVERALL STATS CALCULATION
   ========================================================================= */

export async function calculateOverallStats(): Promise<OverallStats> {
  const allProgress = await getAllProgress();
  const allWorkspaces = await getAllWorkspaces();

  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let totalTime = 0;
  let physicsCompleted = 0;
  let chemistryCompleted = 0;

  for (const exp of EXPERIMENTS) {
    const prog = allProgress[exp.id];
    if (!prog || prog.status === 'not-started') {
      notStarted++;
    } else if (prog.status === 'completed') {
      completed++;
      if (exp.subjectId === 'physics') physicsCompleted++;
      if (exp.subjectId === 'chemistry') chemistryCompleted++;
    } else if (prog.status === 'in-progress') {
      inProgress++;
    }

    if (prog?.timeSpentSeconds) {
      totalTime += prog.timeSpentSeconds;
    }
  }

  return {
    totalActiveExperiments: EXPERIMENTS.length,
    completedExperiments: completed,
    inProgressExperiments: inProgress,
    notStartedExperiments: notStarted,
    totalWorkspacesCreated: allWorkspaces.length,
    totalTimeSpentSeconds: totalTime,
    physicsCompleted,
    physicsTotal: 5,
    chemistryCompleted,
    chemistryTotal: 5,
  };
}

/* =========================================================================
   DATA RESET & EXPORT / IMPORT (FOR STUDENT PRIVACY & OFFLINE PORTABILITY)
   ========================================================================= */

export async function resetAllData(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.clear('experiment_progress');
    await db.clear('workspaces');
    await db.put('student_profile', {
      ...DEFAULT_STUDENT_PROFILE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error clearing IndexedDB, clearing fallback', err);
    MEMORY_CACHE.progress.clear();
    MEMORY_CACHE.workspaces.clear();
    MEMORY_CACHE.profile = { ...DEFAULT_STUDENT_PROFILE };
    localStorage.removeItem('prayogaproof_student_profile');
  }
}

export async function exportStudentData(): Promise<string> {
  const profile = await getStudentProfile();
  const progress = await getAllProgress();
  const workspaces = await getAllWorkspaces();

  const bundle = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    profile,
    progress,
    workspaces,
  };

  return JSON.stringify(bundle, null, 2);
}
