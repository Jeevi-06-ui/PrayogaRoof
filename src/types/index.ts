/**
 * PrayogaProof Core Type Definitions
 * Phase 1 Architecture
 */

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'mathematics';

export type SubjectStatus = 'active' | 'coming-soon';

export type ExperimentDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

export interface ApparatusItem {
  id: string;
  name: string;
  category: 'instrument' | 'glassware' | 'chemical' | 'component' | 'safety';
  description?: string;
  quantity?: string;
}

export interface ExperimentMetadata {
  id: string;
  title: string;
  subjectId: SubjectId;
  shortDescription: string;
  fullDescription: string;
  difficulty: ExperimentDifficulty;
  estimatedDurationMinutes: number;
  gradeLevel: string;
  curriculumTags: string[];
  learningObjectives: string[];
  apparatus: ApparatusItem[];
  safetyGuidelines: string[];
  keyFormulaOrPrinciple?: string;
  guidedModeOverview: string;
  freeLabOverview: string;
  thumbnailIcon: string;
  order: number;
}

export interface SubjectMetadata {
  id: SubjectId;
  name: string;
  tagline: string;
  description: string;
  status: SubjectStatus;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  totalExperiments: number;
  availableExperiments: number;
  iconName: string;
  plannedQuarter?: string;
}

export interface ExperimentProgress {
  experimentId: string;
  subjectId: SubjectId;
  status: ProgressStatus;
  guidedCompleted: boolean;
  guidedStepIndex: number;
  freeLabWorkspacesCount: number;
  timeSpentSeconds: number;
  lastAccessedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface SavedWorkspace {
  id: string;
  experimentId: string;
  subjectId: SubjectId;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  componentCount: number;
  canvasState: {
    zoom: number;
    stagePosition: { x: number; y: number };
    elements: Array<{
      id: string;
      type: string;
      x: number;
      y: number;
      rotation?: number;
      props?: Record<string, unknown>;
    }>;
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  schoolName: string;
  region: string;
  avatarSeed: string;
  offlineSyncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  highContrast: boolean;
  reducedMotion: boolean;
  autoSaveWorkspaces: boolean;
}

export interface OverallStats {
  totalActiveExperiments: number;
  completedExperiments: number;
  inProgressExperiments: number;
  notStartedExperiments: number;
  totalWorkspacesCreated: number;
  totalTimeSpentSeconds: number;
  physicsCompleted: number;
  physicsTotal: number;
  chemistryCompleted: number;
  chemistryTotal: number;
}
