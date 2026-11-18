/**
 * PrayogaProof Core Type Definitions
 * Phase 1 Architecture
 */

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'mathematics';

export type SubjectStatus = 'active' | 'coming-soon';

export type ClassLevel = 'foundation' | 'class-11' | 'class-12';

export type ImplementationStatus = 'implemented' | 'under-development' | 'planned';

export type ExperimentDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

export interface ApparatusItem {
  id: string;
  name: string;
  category: 'instrument' | 'glassware' | 'chemical' | 'component' | 'safety' | 'optics';
  description?: string;
  quantity?: string;
}

export interface ExperimentMetadata {
  id: string;
  title: string;
  subjectId: SubjectId;
  classLevel: ClassLevel;
  implementationStatus: ImplementationStatus;
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
  reusedModuleId?: string;
  activityPresetId?: string;
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

export type UserRole = 'student' | 'teacher' | 'admin';

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  role?: UserRole;
  grade: string;
  schoolName: string;
  region: string;
  avatarSeed: string;
  offlineSyncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends StudentProfile {
  role: UserRole;
  isGuest?: boolean;
}

export interface VivaAttemptRecord {
  id: string;
  studentId: string;
  experimentId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  maxScore: number;
  answers: Array<{
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    marks: number;
  }>;
  timeSpentSeconds: number;
  submittedAt: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  experimentId: string;
  labMarks: number;
  vivaMarks: number;
  totalMarks: number;
  letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  xpAwarded: number;
  awardedAt: string;
}

export interface XPTransaction {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  sourceType: 'experiment_completion' | 'viva_score' | 'achievement' | 'daily_streak' | 'teacher_bonus';
  sourceId: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  studentId: string;
  achievementId: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: string;
  unlockedAt: string;
}

export interface Classroom {
  id: string;
  teacherId: string;
  name: string;
  subject: SubjectId | 'general_stem';
  gradeLevel: string;
  schoolName: string;
  joinCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomMembership {
  id: string;
  classroomId: string;
  studentId: string;
  status: 'active' | 'pending' | 'archived';
  joinedAt: string;
}

export type SyncStatus = 'offline' | 'synced' | 'syncing' | 'error' | 'pending';


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
  biologyCompleted: number;
  biologyTotal: number;
  mathematicsCompleted: number;
  mathematicsTotal: number;
  totalXP?: number;
}

export * from './workspace';

