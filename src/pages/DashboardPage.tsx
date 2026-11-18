import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  FlaskConical,
  Dna,
  Calculator,
  CheckCircle2,
  BookOpen,
  Award,
  Cloud,
  RefreshCw,
  Clock,
  GraduationCap,
  LogOut,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { formatSyncStatus } from '../services/syncService';
import { StatCard } from '../components/shared/StatCard';
import { SubjectCard } from '../components/shared/SubjectCard';
import { ExperimentCard } from '../components/shared/ExperimentCard';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSpinner } from '../components/shared/LoadingState';
import { Button } from '../components/shared/Button';
import { getAllSubjects, EXPERIMENTS } from '../services/experimentRegistry';

export const DashboardPage: React.FC = () => {
  const { profile, progressMap, grades, stats, syncStatus, pendingSyncCount, triggerSync, isLoading } = useStudent();
  const { role, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const subjects = getAllSubjects();
  const [activeTab, setActiveTab] = useState<'labs' | 'grades' | 'achievements' | 'history'>('labs');
  const [isSyncing, setIsSyncing] = useState(false);

  if (isLoading) {
    return <LoadingSpinner label="Loading student dashboard and laboratory records..." />;
  }

  // Filter in-progress or recently accessed experiments
  const activeExperiments = EXPERIMENTS.filter((exp) => {
    const p = progressMap[exp.id];
    return p && (p.status === 'in-progress' || p.status === 'completed');
  });

  const completionRate =
    stats.totalActiveExperiments > 0
      ? (stats.completedExperiments / stats.totalActiveExperiments) * 100
      : 0;

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerSync();
    setIsSyncing(false);
  };

  const gradeList = Object.values(grades);
  const totalXPEarned = stats.totalXP ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Real Sync Status Pill */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md text-xs font-semibold ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                    : syncStatus === 'syncing' || pendingSyncCount > 0
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                    : syncStatus === 'error'
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                    : 'bg-white/20 text-blue-100 border border-white/20'
                }`}
              >
                {syncStatus === 'synced' ? (
                  <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                ) : syncStatus === 'syncing' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                ) : syncStatus === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                ) : pendingSyncCount > 0 ? (
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-blue-200" />
                )}
                <span>{formatSyncStatus(syncStatus, pendingSyncCount)}</span>
              </div>

              {pendingSyncCount > 0 && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              Enrolled in {profile.grade} at {profile.schoolName}. Real-time multi-device cloud synchronization and offline STEM lab active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {role === 'teacher' && (
              <Link to="/teacher">
                <Button
                  variant="secondary"
                  size="md"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-transparent shadow-md"
                >
                  <GraduationCap className="w-4 h-4 mr-1.5" />
                  <span>Teacher Portal</span>
                </Button>
              </Link>
            )}
            <Link to="/subjects/physics">
              <Button
                variant="secondary"
                size="md"
                className="bg-white text-blue-700 hover:bg-blue-50 border-transparent font-semibold shadow-sm"
              >
                Explore Physics
              </Button>
            </Link>
            <Link to="/subjects/chemistry">
              <Button
                variant="outline"
                size="md"
                className="text-white border-white/40 hover:bg-white/10 font-semibold"
              >
                Explore Chemistry
              </Button>
            </Link>
            <Link to="/subjects/biology">
              <Button
                variant="outline"
                size="md"
                className="text-white border-white/40 hover:bg-white/10 font-semibold"
              >
                Explore Biology
              </Button>
            </Link>
            <Link to="/subjects/mathematics">
              <Button
                variant="outline"
                size="md"
                className="text-white border-white/40 hover:bg-white/10 font-semibold"
              >
                Explore Mathematics
              </Button>
            </Link>
            {!isGuest && (
              <Button
                variant="outline"
                size="md"
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="text-white border-rose-400/50 hover:bg-rose-500/20 font-semibold"
              >
                <LogOut className="w-4 h-4 mr-1.5 text-rose-300" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Real Progress Metrics Cards */}
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Learning Competency &amp; Assessment Metrics
        </h2>
        {/* Row 1: Global Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Completed Experiments"
            value={`${stats.completedExperiments}/${stats.totalActiveExperiments}`}
            subtitle={`${stats.inProgressExperiments} currently in progress`}
            icon={CheckCircle2}
            color="blue"
            progress={completionRate}
          />

          <StatCard
            title="Total Earned XP"
            value={`${totalXPEarned} XP`}
            subtitle="Authoritative Rubric Score"
            icon={Award}
            color="purple"
          />

          <StatCard
            title="Saved Lab Workspaces"
            value={`${stats.totalWorkspacesCreated} Benches`}
            subtitle="Free-form Canvas Assemblies"
            icon={HardDrive}
            color="emerald"
          />

          <StatCard
            title="Lab Time Invested"
            value={`${Math.round((stats.totalTimeSpentSeconds || 0) / 60)} Mins`}
            subtitle="Active Hands-on Investigation"
            icon={Clock}
            color="amber"
          />
        </div>

        {/* Row 2: Four Subject Mastery Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Physics Mastery"
            value={`${stats.physicsCompleted}/${stats.physicsTotal || 25}`}
            subtitle="Mechanics, Circuits & Optics"
            icon={Zap}
            color="blue"
            progress={(stats.physicsCompleted / (stats.physicsTotal || 25)) * 100}
          />

          <StatCard
            title="Chemistry Mastery"
            value={`${stats.chemistryCompleted}/${stats.chemistryTotal || 27}`}
            subtitle="Titration, Kinetics & Analysis"
            icon={FlaskConical}
            color="emerald"
            progress={(stats.chemistryCompleted / (stats.chemistryTotal || 27)) * 100}
          />

          <StatCard
            title="Biology Mastery"
            value={`${stats.biologyCompleted}/${stats.biologyTotal || 15}`}
            subtitle="Physiology, Genetics & Ecology"
            icon={Dna}
            color="emerald"
            progress={(stats.biologyCompleted / (stats.biologyTotal || 15)) * 100}
          />

          <StatCard
            title="Mathematics Mastery"
            value={`${stats.mathematicsCompleted}/${stats.mathematicsTotal || 12}`}
            subtitle="Calculus, Vectors & Algebra"
            icon={Calculator}
            color="purple"
            progress={(stats.mathematicsCompleted / (stats.mathematicsTotal || 12)) * 100}
          />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('labs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'labs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Active Labs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'grades'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Grades &amp; Viva Voce ({gradeList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Learning History
        </button>
      </div>

      {/* Tab 1: Active Labs & Subjects */}
      {activeTab === 'labs' && (
        <>
          {/* Subject Access Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Four STEM Subject Laboratories
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select an active discipline to explore curriculum experiments
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjects.map((subj) => (
                <SubjectCard
                  key={subj.id}
                  subject={subj}
                  completedCount={
                    subj.id === 'physics'
                      ? stats.physicsCompleted
                      : subj.id === 'chemistry'
                      ? stats.chemistryCompleted
                      : subj.id === 'biology'
                      ? stats.biologyCompleted
                      : stats.mathematicsCompleted
                  }
                />
              ))}
            </div>
          </div>

          {/* Resume / Recent Experiments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Active Experiments
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Pick up where you left off in your virtual laboratory investigations
                </p>
              </div>
            </div>

            {activeExperiments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeExperiments.map((exp) => (
                  <ExperimentCard
                    key={exp.id}
                    experiment={exp}
                    status={progressMap[exp.id]?.status}
                    workspacesCount={progressMap[exp.id]?.freeLabWorkspacesCount}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No experiments started yet"
                description="All your active experiments, guided lab progress, and saved workspaces will appear here once you begin."
                actionLabel="Start with Ohm's Law (Physics)"
                onAction={() => (window.location.href = '/experiments/ohms-law')}
              />
            )}
          </div>
        </>
      )}

      {/* Tab 2: Grades & Viva Voce Breakdown */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Authoritative Assessment Records
            </h2>
            <span className="text-xs text-slate-500">100-Mark Rubric Breakdown</span>
          </div>

          {gradeList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradeList.map((g) => {
                const exp = EXPERIMENTS.find((e) => e.id === g.experimentId);
                return (
                  <div
                    key={g.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {exp?.subjectId || 'Laboratory'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                          {exp?.title || g.experimentId}
                        </h4>
                      </div>
                      <span
                        className={`text-lg font-black px-2.5 py-0.5 rounded-xl ${
                          g.letterGrade === 'A+'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : g.letterGrade === 'A'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {g.letterGrade}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Lab Work</div>
                        <div className="font-bold font-mono">{g.labMarks}/60</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Viva Voce</div>
                        <div className="font-bold font-mono">{g.vivaMarks}/40</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Total Score</div>
                        <div className="font-bold font-mono text-blue-600 dark:text-blue-400">
                          {g.totalMarks}/100
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                      <span>Awarded {new Date(g.awardedAt).toLocaleDateString()}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        +{g.xpAwarded} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No assessment records yet"
              description="Complete the 5 viva voce examination questions inside any experiment to receive an authoritative grade and XP rewards."
              actionLabel="Take Viva in Ohm's Law"
              onAction={() => (window.location.href = '/experiments/ohms-law')}
            />
          )}
        </div>
      )}

      {/* Tab 3: Learning History Timeline */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Laboratory Investigation Timeline
          </h2>

          <div className="space-y-3">
            {activeExperiments.map((exp) => {
              const p = progressMap[exp.id];
              return (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {exp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Status: <span className="font-semibold capitalize">{p.status}</span> • Time
                        Spent: {Math.round((p.timeSpentSeconds || 0) / 60)} mins
                      </p>
                    </div>
                  </div>

                  <Link to={`/experiments/${exp.id}`}>
                    <Button variant="outline" size="sm">
                      Open Lab
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
