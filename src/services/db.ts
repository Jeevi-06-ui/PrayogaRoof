import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ExperimentProgress, SavedWorkspace, StudentProfile, AppSettings } from '../types';

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
}

const DB_NAME = 'prayogaproof-storage';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PrayogaDB>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<PrayogaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PrayogaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Student Profile Store
        if (!db.objectStoreNames.contains('student_profile')) {
          db.createObjectStore('student_profile', { keyPath: 'id' });
        }

        // Experiment Progress Store
        if (!db.objectStoreNames.contains('experiment_progress')) {
          const progressStore = db.createObjectStore('experiment_progress', { keyPath: 'experimentId' });
          progressStore.createIndex('by-subject', 'subjectId');
          progressStore.createIndex('by-status', 'status');
        }

        // Workspaces Store
        if (!db.objectStoreNames.contains('workspaces')) {
          const workspaceStore = db.createObjectStore('workspaces', { keyPath: 'id' });
          workspaceStore.createIndex('by-experiment', 'experimentId');
          workspaceStore.createIndex('by-updated', 'updatedAt');
        }

        // App Settings Store
        if (!db.objectStoreNames.contains('app_settings')) {
          db.createObjectStore('app_settings');
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
