import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  ExperimentProgress,
  SavedWorkspace,
  StudentProfile,
  AppSettings,
  VivaAttemptRecord,
  GradeRecord,
  XPTransaction,
  UserAchievement,
} from '../types';

export interface SyncQueueItem {
  id: string;
  table: string;
  action: 'upsert' | 'delete';
  payload: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

export interface LocalObservation {
  id: string;
  experimentId: string;
  trial: number;
  inputParam: string;
  measuredParam: string;
  calculatedParam: string;
  notes: string;
  updatedAt: string;
}

export interface LocalBookmark {
  experimentId: string;
  subjectId: string;
  notes: string;
  createdAt: string;
}

export interface PrayogaDB extends DBSchema {
  student_profile: {
    key: string;
    value: StudentProfile;
  };
  experiment_progress: {
    key: string;
    value: ExperimentProgress;
    indexes: { 'by-subject': string; 'by-status': string };
  };
  workspaces: {
    key: string;
    value: SavedWorkspace;
    indexes: { 'by-experiment': string; 'by-updated': string };
  };
  app_settings: {
    key: string;
    value: AppSettings;
  };
  viva_attempts: {
    key: string;
    value: VivaAttemptRecord;
    indexes: { 'by-experiment': string };
  };
  grades: {
    key: string;
    value: GradeRecord;
  };
  xp_transactions: {
    key: string;
    value: XPTransaction;
    indexes: { 'by-idempotency': string };
  };
  user_achievements: {
    key: string;
    value: UserAchievement;
  };
  bookmarks: {
    key: string;
    value: LocalBookmark;
  };
  experiment_observations: {
    key: string;
    value: LocalObservation;
    indexes: { 'by-experiment': string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
  };
}

const DB_NAME = 'prayogaproof-storage';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<PrayogaDB>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<PrayogaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PrayogaDB>(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion) {
        // Version 1 Stores
        if (!db.objectStoreNames.contains('student_profile')) {
          db.createObjectStore('student_profile', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('experiment_progress')) {
          const progressStore = db.createObjectStore('experiment_progress', { keyPath: 'experimentId' });
          progressStore.createIndex('by-subject', 'subjectId');
          progressStore.createIndex('by-status', 'status');
        }

        if (!db.objectStoreNames.contains('workspaces')) {
          const workspaceStore = db.createObjectStore('workspaces', { keyPath: 'id' });
          workspaceStore.createIndex('by-experiment', 'experimentId');
          workspaceStore.createIndex('by-updated', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('app_settings')) {
          db.createObjectStore('app_settings');
        }

        // Version 2 Stores (Cloud Sync, Viva, Grades, XP, Badges, Bookmarks, Observations)
        if (!db.objectStoreNames.contains('viva_attempts')) {
          const vivaStore = db.createObjectStore('viva_attempts', { keyPath: 'id' });
          vivaStore.createIndex('by-experiment', 'experimentId');
        }

        if (!db.objectStoreNames.contains('grades')) {
          db.createObjectStore('grades', { keyPath: 'experimentId' });
        }

        if (!db.objectStoreNames.contains('xp_transactions')) {
          const xpStore = db.createObjectStore('xp_transactions', { keyPath: 'id' });
          xpStore.createIndex('by-idempotency', 'idempotencyKey');
        }

        if (!db.objectStoreNames.contains('user_achievements')) {
          db.createObjectStore('user_achievements', { keyPath: 'achievementId' });
        }

        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'experimentId' });
        }

        if (!db.objectStoreNames.contains('experiment_observations')) {
          const obsStore = db.createObjectStore('experiment_observations', { keyPath: 'id' });
          obsStore.createIndex('by-experiment', 'experimentId');
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'current-student',
  name: 'Curious Learner',
  grade: 'Grade 10',
  schoolName: 'Prayoga Partner School',
  region: 'Karnataka, India',
  avatarSeed: 'scientist-1',
  offlineSyncEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  highContrast: false,
  reducedMotion: false,
  autoSaveWorkspaces: true,
};
