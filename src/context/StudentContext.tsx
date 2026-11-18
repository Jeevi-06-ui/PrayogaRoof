import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  StudentProfile,
  ExperimentProgress,
  OverallStats,
  SavedWorkspace,
  ProgressStatus,
  GradeRecord,
  VivaAttemptRecord,
  SyncStatus,
  SubjectId,
} from '../types';
import {
  getStudentProfile,
  updateStudentProfile as updateProfileApi,
  getAllProgress,
  calculateOverallStats,
  markExperimentStatus as markStatusApi,
  createWorkspace as createWorkspaceApi,
  deleteWorkspace as deleteWorkspaceApi,
  resetAllData as resetDataApi,
  getAllGrades as getAllGradesApi,
  recordGrade as recordGradeApi,
  recordVivaAttempt as recordVivaApi,
  saveObservations as saveObsApi,
  getObservations as getObsApi,
  toggleBookmark as toggleBookmarkApi,
  isBookmarked as isBookmarkedApi,
} from '../services/studentProgressService';
import { DEFAULT_STUDENT_PROFILE, LocalObservation } from '../services/db';
import {
  getSyncStatus,
  subscribeToSyncStatus,
  triggerSync as triggerSyncApi,
  getPendingSyncCount,
} from '../services/syncService';

interface StudentContextType {
  profile: StudentProfile;
  progressMap: Record<string, ExperimentProgress>;
  grades: Record<string, GradeRecord>;
  stats: OverallStats;
  syncStatus: SyncStatus;
  pendingSyncCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  triggerSync: () => Promise<boolean>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  markStatus: (experimentId: string, status: ProgressStatus) => Promise<void>;
  addWorkspace: (data: Omit<SavedWorkspace, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SavedWorkspace>;
  removeWorkspace: (id: string, experimentId?: string) => Promise<void>;
  recordAssessmentGrade: (gradeData: Omit<GradeRecord, 'id' | 'awardedAt'>) => Promise<GradeRecord>;
  recordViva: (vivaData: Omit<VivaAttemptRecord, 'id' | 'submittedAt'>) => Promise<VivaAttemptRecord>;
  saveObservations: (experimentId: string, trials: Parameters<typeof saveObsApi>[1]) => Promise<void>;
  getObservations: (experimentId: string) => Promise<LocalObservation[]>;
  toggleBookmark: (experimentId: string, subjectId: SubjectId) => Promise<boolean>;
  isBookmarked: (experimentId: string) => Promise<boolean>;
  resetAll: () => Promise<void>;
}

const defaultStats: OverallStats = {
  totalActiveExperiments: 79,
  completedExperiments: 0,
  inProgressExperiments: 0,
  notStartedExperiments: 79,
  totalWorkspacesCreated: 0,
  totalTimeSpentSeconds: 0,
  physicsCompleted: 0,
  physicsTotal: 25,
  chemistryCompleted: 0,
  chemistryTotal: 27,
  biologyCompleted: 0,
  biologyTotal: 15,
  mathematicsCompleted: 0,
  mathematicsTotal: 12,
  totalXP: 0,
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [progressMap, setProgressMap] = useState<Record<string, ExperimentProgress>>({});
  const [grades, setGrades] = useState<Record<string, GradeRecord>>({});
  const [stats, setStats] = useState<OverallStats>(defaultStats);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Subscribe to real-time sync state updates
  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((status, count) => {
      setSyncStatus(status);
      setPendingSyncCount(count);
    });
    getPendingSyncCount().then(setPendingSyncCount);
    return unsubscribe;
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedProfile, loadedProgress, loadedStats, loadedGrades, count] = await Promise.all([
        getStudentProfile(),
        getAllProgress(),
        calculateOverallStats(),
        getAllGradesApi(),
        getPendingSyncCount(),
      ]);
      setProfile(loadedProfile);
      setProgressMap(loadedProgress);
      setStats(loadedStats);
      setGrades(loadedGrades);
      setPendingSyncCount(count);
    } catch (err) {
      console.error('Failed to load student data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerSync = async (): Promise<boolean> => {
    const success = await triggerSyncApi(profile.id);
    await loadData();
    return success;
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    const updated = await updateProfileApi(updates);
    setProfile(updated);
  };

  const markStatus = async (experimentId: string, status: ProgressStatus) => {
    await markStatusApi(experimentId, status);
    const [newProgress, newStats] = await Promise.all([
      getAllProgress(),
      calculateOverallStats(),
    ]);
    setProgressMap(newProgress);
    setStats(newStats);
  };

  const addWorkspace = async (
    data: Omit<SavedWorkspace, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SavedWorkspace> => {
    const created = await createWorkspaceApi(data);
    const [newProgress, newStats] = await Promise.all([
      getAllProgress(),
      calculateOverallStats(),
    ]);
    setProgressMap(newProgress);
    setStats(newStats);
    return created;
  };

  const removeWorkspace = async (id: string, experimentId?: string) => {
    await deleteWorkspaceApi(id, experimentId);
    const [newProgress, newStats] = await Promise.all([
      getAllProgress(),
      calculateOverallStats(),
    ]);
    setProgressMap(newProgress);
    setStats(newStats);
  };

  const recordAssessmentGrade = async (
    gradeData: Omit<GradeRecord, 'id' | 'awardedAt'>
  ): Promise<GradeRecord> => {
    const recorded = await recordGradeApi(gradeData);
    const [newGrades, newStats] = await Promise.all([
      getAllGradesApi(),
      calculateOverallStats(),
    ]);
    setGrades(newGrades);
    setStats(newStats);
    return recorded;
  };

  const recordViva = async (
    vivaData: Omit<VivaAttemptRecord, 'id' | 'submittedAt'>
  ): Promise<VivaAttemptRecord> => {
    return await recordVivaApi(vivaData);
  };

  const saveObservations = async (
    experimentId: string,
    trials: Parameters<typeof saveObsApi>[1]
  ): Promise<void> => {
    await saveObsApi(experimentId, trials);
  };

  const getObservations = async (experimentId: string): Promise<LocalObservation[]> => {
    return await getObsApi(experimentId);
  };

  const toggleBookmark = async (experimentId: string, subjectId: SubjectId): Promise<boolean> => {
    return await toggleBookmarkApi(experimentId, subjectId);
  };

  const isBookmarked = async (experimentId: string): Promise<boolean> => {
    return await isBookmarkedApi(experimentId);
  };

  const resetAll = async () => {
    await resetDataApi();
    await loadData();
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        progressMap,
        grades,
        stats,
        syncStatus,
        pendingSyncCount,
        isLoading,
        refreshData: loadData,
        triggerSync,
        updateProfile,
        markStatus,
        addWorkspace,
        removeWorkspace,
        recordAssessmentGrade,
        recordViva,
        saveObservations,
        getObservations,
        toggleBookmark,
        isBookmarked,
        resetAll,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export function useStudent(): StudentContextType {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
