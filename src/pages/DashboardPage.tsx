import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  FlaskConical,
  CheckCircle2,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { StatCard } from '../components/shared/StatCard';
import { SubjectCard } from '../components/shared/SubjectCard';
import { ExperimentCard } from '../components/shared/ExperimentCard';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSpinner } from '../components/shared/LoadingState';
import { Button } from '../components/shared/Button';
import { getAllSubjects, EXPERIMENTS } from '../services/experimentRegistry';

export const DashboardPage: React.FC = () => {
  const { profile, progressMap, stats, isLoading } = useStudent();
  const subjects = getAllSubjects();

  if (isLoading) {
    return <LoadingSpinner label="Loading student dashboard and local records..." />;
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

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Offline Laboratory Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Enrolled in {profile.grade} at {profile.schoolName}. You have access to 10 active laboratory experiments across Physics and Chemistry.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      {/* Real Progress Metrics Cards */}
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Real Local Progress Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Experiments"
            value={`${stats.completedExperiments}/${stats.totalActiveExperiments}`}
            subtitle={`${stats.inProgressExperiments} currently in progress`}
            icon={CheckCircle2}
            color="blue"
            progress={completionRate}
          />

          <StatCard
            title="Physics Mastery"
            value={`${stats.physicsCompleted}/5`}
            subtitle="Mechanics, Circuits & Optics"
            icon={Zap}
            color="blue"
            progress={(stats.physicsCompleted / 5) * 100}
          />

          <StatCard
            title="Chemistry Mastery"
            value={`${stats.chemistryCompleted}/5`}
            subtitle="pH, Indicators & Reactions"
            icon={FlaskConical}
            color="emerald"
            progress={(stats.chemistryCompleted / 5) * 100}
          />

          <StatCard
            title="Virtual Workspaces"
            value={stats.totalWorkspacesCreated}
            subtitle="Saved in browser IndexedDB"
            icon={Layers}
            color="purple"
          />
        </div>
      </div>

      {/* Subject Access Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              STEM Laboratories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select an active subject to inspect available experiments
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
                  : 0
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
    </div>
  );
};
