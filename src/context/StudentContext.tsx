import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  StudentProfile,
  ExperimentProgress,
  OverallStats,
  SavedWorkspace,
  ProgressStatus,
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
} from '../services/studentProgressService';
import { DEFAULT_STUDENT_PROFILE } from '../services/db';

interface StudentContextType {
  profile: StudentProfile;
  progressMap: Record<string, ExperimentProgress>;
  stats: OverallStats;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  markStatus: (experimentId: string, status: ProgressStatus) => Promise<void>;
  addWorkspace: (data: Omit<SavedWorkspace, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SavedWorkspace>;
  removeWorkspace: (id: string, experimentId?: string) => Promise<void>;
  resetAll: () => Promise<void>;
}

const defaultStats: OverallStats = {
  totalActiveExperiments: 10,
  completedExperiments: 0,
  inProgressExperiments: 0,
  notStartedExperiments: 10,
  totalWorkspacesCreated: 0,
  totalTimeSpentSeconds: 0,
  physicsCompleted: 0,
  physicsTotal: 5,
  chemistryCompleted: 0,
  chemistryTotal: 5,
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [progressMap, setProgressMap] = useState<Record<string, ExperimentProgress>>({});
  const [stats, setStats] = useState<OverallStats>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedProfile, loadedProgress, loadedStats] = await Promise.all([
        getStudentProfile(),
        getAllProgress(),
        calculateOverallStats(),
      ]);
      setProfile(loadedProfile);
      setProgressMap(loadedProgress);
      setStats(loadedStats);
    } catch (err) {
      console.error('Failed to load student data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const resetAll = async () => {
    await resetDataApi();
    await loadData();
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        progressMap,
        stats,
        isLoading,
        refreshData: loadData,
        updateProfile,
        markStatus,
        addWorkspace,
        removeWorkspace,
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
