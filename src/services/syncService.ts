/**
 * Offline-First Cloud Synchronization Engine
 *
 * Implements:
 * - Queueing offline mutations into IndexedDB (`sync_queue`)
 * - Bidirectional synchronization on network reconnection
 * - Conflict resolution preserving newer cloud or completed states
 * - Idempotent XP transactions preventing duplicate rewards across devices
 * - Network status detection and real sync state reporting
 */

import { getDatabase, SyncQueueItem } from './db';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { firebaseAuth, isFirebaseConfigured } from './firebaseClient';
import { flushSyncQueueToFirestore, syncFirestoreDownToLocal } from './firestoreSyncService';
import { SyncStatus, ExperimentProgress, SavedWorkspace, GradeRecord } from '../types';

type SyncListener = (status: SyncStatus, pendingCount: number) => void;
const listeners = new Set<SyncListener>();

let currentSyncStatus: SyncStatus = 'synced';
let isSyncInProgress = false;

export function formatSyncStatus(status: SyncStatus, pendingCount: number): string {
  if (status === 'error') return 'Sync Failed';
  if (status === 'syncing') return 'Syncing to Cloud...';
  if (pendingCount > 0 || status === 'pending') return `Sync Pending (${pendingCount})`;
  if (status === 'synced') return 'Synced to Cloud';
  return 'Saved on Device';
}

export function getSyncStatus(): SyncStatus {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'offline';
  }
  return currentSyncStatus;
}

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  listener(getSyncStatus(), 0);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(status: SyncStatus, count: number) {
  currentSyncStatus = status;
  listeners.forEach((l) => l(status, count));
}

export async function getPendingSyncCount(): Promise<number> {
  try {
    const db = await getDatabase();
    const items = await db.getAll('sync_queue');
    return items.length;
  } catch {
    return 0;
  }
}

/**
 * Queue a local modification for synchronization
 */
export async function enqueueSync(
  table: string,
  action: 'upsert' | 'delete',
  payload: Record<string, unknown>
): Promise<void> {
  const item: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    table,
    action,
    payload,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  try {
    const db = await getDatabase();
    await db.put('sync_queue', item);
    const count = await getPendingSyncCount();

    if (navigator.onLine && (isFirebaseConfigured() || isSupabaseConfigured())) {
      notifyListeners('syncing', count);
      // Attempt background flush
      triggerSync().catch(console.warn);
    } else {
      notifyListeners('offline', count);
    }
  } catch (err) {
    console.warn('Failed to enqueue sync item:', err);
  }
}

/**
 * Flush all pending mutations to Cloud Firestore (or Supabase) and pull latest cloud records
 */
export async function triggerSync(userId?: string): Promise<boolean> {
  if (isSyncInProgress) return false;
  const isCloudConfigured = isFirebaseConfigured() || isSupabaseConfigured();
  if (!navigator.onLine || !isCloudConfigured) {
    const count = await getPendingSyncCount();
    notifyListeners(navigator.onLine ? 'synced' : 'offline', count);
    return false;
  }

  isSyncInProgress = true;
  notifyListeners('syncing', await getPendingSyncCount());

  try {
    const effectiveUserId = userId || firebaseAuth.currentUser?.uid;

    // 1. Primary Cloud Firestore Synchronization
    if (isFirebaseConfigured() && effectiveUserId) {
      await flushSyncQueueToFirestore(effectiveUserId);
      await syncFirestoreDownToLocal(effectiveUserId);
      const remainingCount = await getPendingSyncCount();
      notifyListeners('synced', remainingCount);
      isSyncInProgress = false;
      return true;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const supabaseUserId = userId || user?.id;

    if (!supabaseUserId) {
      // User is in guest mode or not logged in; keep offline
      const count = await getPendingSyncCount();
      notifyListeners('synced', count);
      isSyncInProgress = false;
      return true;
    }

    const db = await getDatabase();
    const queue = await db.getAll('sync_queue');

    // 1. Process outbound queue
    for (const item of queue) {
      try {
        await processQueueItem(item, supabaseUserId);
        await db.delete('sync_queue', item.id);
      } catch (err) {
        console.warn(`Failed to sync queue item ${item.id}:`, err);
        // Increment retry count
        item.retryCount = (item.retryCount || 0) + 1;
        if (item.retryCount < 5) {
          await db.put('sync_queue', item);
        } else {
          // Drop permanently failing item to avoid queue clog
          await db.delete('sync_queue', item.id);
        }
      }
    }

    // 2. Pull inbound updates from Supabase
    await pullCloudUpdates(supabaseUserId);

    const remainingCount = await getPendingSyncCount();
    notifyListeners('synced', remainingCount);
    return true;
  } catch (err) {
    console.warn('Sync failed:', err);
    notifyListeners('error', await getPendingSyncCount());
    return false;
  } finally {
    isSyncInProgress = false;
  }
}

async function processQueueItem(item: SyncQueueItem, userId: string): Promise<void> {
  const { table, action, payload } = item;

  switch (table) {
    case 'student_progress': {
      if (action === 'upsert') {
        const row = {
          student_id: userId,
          experiment_id: payload.experimentId,
          subject_id: payload.subjectId,
          status: payload.status,
          guided_completed: Boolean(payload.guidedCompleted),
          guided_step_index: Number(payload.guidedStepIndex || 0),
          free_lab_workspaces_count: Number(payload.freeLabWorkspacesCount || 0),
          time_spent_seconds: Number(payload.timeSpentSeconds || 0),
          notes: String(payload.notes || ''),
          last_accessed_at: payload.lastAccessedAt || new Date().toISOString(),
          completed_at: payload.completedAt || null,
        };

        // Conflict check: Don't overwrite completed cloud status with in-progress
        const { data: existing } = await supabase
          .from('student_progress')
          .select('status, updated_at')
          .eq('student_id', userId)
          .eq('experiment_id', payload.experimentId as string)
          .maybeSingle();

        if (existing?.status === 'completed' && row.status !== 'completed') {
          row.status = 'completed';
          row.guided_completed = true;
        }

        await supabase.from('student_progress').upsert(row, {
          onConflict: 'student_id,experiment_id',
        });
      }
      break;
    }

    case 'saved_workspaces': {
      if (action === 'upsert') {
        await supabase.from('saved_workspaces').upsert({
          id: payload.id,
          student_id: userId,
          experiment_id: payload.experimentId,
          subject_id: payload.subjectId,
          title: payload.title,
          description: payload.description || '',
          component_count: payload.componentCount || 0,
          canvas_state: payload.canvasState || {},
          updated_at: payload.updatedAt || new Date().toISOString(),
        });
      } else if (action === 'delete') {
        await supabase
          .from('saved_workspaces')
          .delete()
          .eq('id', payload.id)
          .eq('student_id', userId);
      }
      break;
    }

    case 'viva_attempts': {
      if (action === 'upsert') {
        await supabase.from('viva_attempts').insert({
          id: payload.id,
          student_id: userId,
          experiment_id: payload.experimentId,
          total_questions: payload.totalQuestions || 5,
          correct_answers: payload.correctAnswers || 0,
          score: payload.score || 0,
          max_score: 40.00,
          answers: payload.answers || [],
          time_spent_seconds: payload.timeSpentSeconds || 0,
          submitted_at: payload.submittedAt || new Date().toISOString(),
        });
      }
      break;
    }

    case 'grades': {
      if (action === 'upsert') {
        await supabase.from('grades').upsert(
          {
            student_id: userId,
            experiment_id: payload.experimentId,
            lab_marks: payload.labMarks || 0,
            viva_marks: payload.vivaMarks || 0,
            letter_grade: payload.letterGrade || 'D',
            xp_awarded: payload.xpAwarded || 0,
            awarded_at: payload.awardedAt || new Date().toISOString(),
          },
          { onConflict: 'student_id,experiment_id' }
        );
      }
      break;
    }

    case 'xp_transactions': {
      if (action === 'upsert') {
        // Enforce idempotency key to prevent double XP awards
        await supabase.from('xp_transactions').upsert(
          {
            id: payload.id,
            student_id: userId,
            amount: payload.amount,
            reason: payload.reason,
            source_type: payload.sourceType,
            source_id: payload.sourceId,
            idempotency_key: payload.idempotencyKey,
            created_at: payload.createdAt || new Date().toISOString(),
          },
          { onConflict: 'idempotency_key', ignoreDuplicates: true }
        );
      }
      break;
    }

    case 'bookmarks': {
      if (action === 'upsert') {
        await supabase.from('bookmarks').upsert(
          {
            student_id: userId,
            experiment_id: payload.experimentId,
            subject_id: payload.subjectId,
            notes: payload.notes || '',
          },
          { onConflict: 'student_id,experiment_id' }
        );
      } else if (action === 'delete') {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('student_id', userId)
          .eq('experiment_id', payload.experimentId);
      }
      break;
    }

    case 'experiment_observations': {
      if (action === 'upsert') {
        await supabase.from('experiment_observations').upsert({
          id: payload.id,
          student_id: userId,
          experiment_id: payload.experimentId,
          trial_number: payload.trial,
          input_parameters: { val: payload.inputParam },
          measured_parameters: { val: payload.measuredParam },
          calculated_parameters: { val: payload.calculatedParam },
          notes: payload.notes || '',
        });
      }
      break;
    }
  }
}

/**
 * Pull latest authoritative cloud records and merge into local IndexedDB
 */
async function pullCloudUpdates(userId: string): Promise<void> {
  const db = await getDatabase();

  // 1. Pull student_progress
  const { data: cloudProgress } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', userId);

  if (cloudProgress) {
    for (const cp of cloudProgress) {
      const local = await db.get('experiment_progress', cp.experiment_id);
      // Conflict check: if local has newer last_accessed_at, keep local
      if (!local || new Date(cp.updated_at) >= new Date(local.lastAccessedAt)) {
        const merged: ExperimentProgress = {
          experimentId: cp.experiment_id,
          subjectId: cp.subject_id,
          status: cp.status,
          guidedCompleted: cp.guided_completed,
          guidedStepIndex: cp.guided_step_index,
          freeLabWorkspacesCount: cp.free_lab_workspaces_count,
          timeSpentSeconds: Math.max(local?.timeSpentSeconds || 0, cp.time_spent_seconds),
          notes: cp.notes || local?.notes || '',
          lastAccessedAt: cp.last_accessed_at,
          completedAt: cp.completed_at || undefined,
        };
        await db.put('experiment_progress', merged);
      }
    }
  }

  // 2. Pull saved_workspaces
  const { data: cloudWorkspaces } = await supabase
    .from('saved_workspaces')
    .select('*')
    .eq('student_id', userId);

  if (cloudWorkspaces) {
    for (const cw of cloudWorkspaces) {
      const local = await db.get('workspaces', cw.id);
      if (!local || new Date(cw.updated_at) >= new Date(local.updatedAt)) {
        const ws: SavedWorkspace = {
          id: cw.id,
          experimentId: cw.experiment_id,
          subjectId: cw.subject_id,
          title: cw.title,
          description: cw.description,
          componentCount: cw.component_count,
          canvasState: cw.canvas_state,
          createdAt: cw.created_at,
          updatedAt: cw.updated_at,
        };
        await db.put('workspaces', ws);
      }
    }
  }

  // 3. Pull grades
  const { data: cloudGrades } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', userId);

  if (cloudGrades) {
    for (const cg of cloudGrades) {
      const grade: GradeRecord = {
        id: cg.id,
        studentId: cg.student_id,
        experimentId: cg.experiment_id,
        labMarks: Number(cg.lab_marks),
        vivaMarks: Number(cg.viva_marks),
        totalMarks: Number(cg.total_marks),
        letterGrade: cg.letter_grade,
        xpAwarded: Number(cg.xp_awarded),
        awardedAt: cg.awarded_at,
      };
      await db.put('grades', grade);
    }
  }
}

// Global network status listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    triggerSync().catch(console.warn);
  });
  window.addEventListener('offline', () => {
    getPendingSyncCount().then((count) => notifyListeners('offline', count));
  });
}
