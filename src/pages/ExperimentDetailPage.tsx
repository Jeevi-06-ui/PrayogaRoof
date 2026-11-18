import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { getExperimentById } from '../services/experimentRegistry';
import { useStudent } from '../context/StudentContext';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { UniversalLabWorkspace } from '../components/workspace/UniversalLabWorkspace';
import { UnderDevelopmentWorkspace } from '../components/workspace/UnderDevelopmentWorkspace';
import { BiologyLabWorkspace } from '../experiments/biology';
import { Modal } from '../components/shared/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import {
  getWorkspacesByExperiment,
} from '../services/studentProgressService';
import { SavedWorkspace, ProgressStatus } from '../types';
import {
  ExperimentLearningTabs,
  ExperimentTabId,
} from '../components/learning/ExperimentLearningTabs';
import { ExperimentOverviewSection } from '../components/learning/ExperimentOverviewSection';
import { LoadSimulationSection } from '../components/learning/LoadSimulationSection';
import { ExperimentObservationsSection } from '../components/learning/ExperimentObservationsSection';
import { VivaSection } from '../components/learning/VivaSection';
import { getSimulationMedia } from '../services/learning/simulationMediaRegistry';

export const ExperimentDetailPage: React.FC = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const experiment = getExperimentById(experimentId || '');

  const { progressMap, markStatus, addWorkspace, removeWorkspace } = useStudent();

  // Top-level 5-section Learning Architecture
  const [activeTab, setActiveTab] = useState<ExperimentTabId>('overview');

  // Virtual Lab Submode: Guided vs Free Lab Canvas
  const [labSubMode, setLabSubMode] = useState<'guided' | 'freelab'>('guided');

  const [workspaces, setWorkspaces] = useState<SavedWorkspace[]>([]);
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState<boolean>(false);
  const [newWsTitle, setNewWsTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [observationCount, setObservationCount] = useState<number>(4);
  const [vivaCompleted, setVivaCompleted] = useState<boolean>(false);
  const [remediationTarget, setRemediationTarget] = useState<{
    segmentId: string;
    questionId: string;
  } | null>(null);

  const simulationMedia = useMemo(
    () => (experiment ? getSimulationMedia(experiment.id) : null),
    [experiment?.id]
  );

  // Load saved workspaces and notes for this experiment
  useEffect(() => {
    if (!experimentId) return;
    getWorkspacesByExperiment(experimentId).then((items) => {
      setWorkspaces(items);
    });

    const prog = progressMap[experimentId];
    if (prog?.notes) {
      setNotes(prog.notes);
    }
  }, [experimentId, progressMap]);

  if (!experiment || !simulationMedia) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Experiment Not Found
        </h2>
        <p className="text-sm text-slate-500">
          The requested experiment ID &quot;{experimentId}&quot; does not exist in the active STEM registry.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentProgress = progressMap[experiment.id] || {
    status: 'not-started' as ProgressStatus,
    timeSpentSeconds: 0,
    freeLabWorkspacesCount: 0,
  };

  const isCompleted = currentProgress.status === 'completed';
  const isInProgress = currentProgress.status === 'in-progress';

  const handleStatusToggle = async () => {
    if (isCompleted) {
      await markStatus(experiment.id, 'in-progress');
    } else {
      await markStatus(experiment.id, 'completed');
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWsTitle.trim()) return;

    await addWorkspace({
      experimentId: experiment.id,
      subjectId: experiment.subjectId,
      title: newWsTitle.trim(),
      description: `Free-form virtual bench setup for ${experiment.title}`,
      componentCount: experiment.apparatus.length,
      canvasState: {
        zoom: 1,
        stagePosition: { x: 0, y: 0 },
        elements: experiment.apparatus.map((app, idx) => ({
          id: `node-${idx}`,
          type: app.category,
          x: 80 + (idx % 3) * 220,
          y: 60 + Math.floor(idx / 3) * 140,
        })),
      },
    });

    const updated = await getWorkspacesByExperiment(experiment.id);
    setWorkspaces(updated);
    setNewWsTitle('');
    setIsNewWsModalOpen(false);
  };

  const handleDeleteWorkspace = async (wsId: string) => {
    await removeWorkspace(wsId, experiment.id);
    const updated = await getWorkspacesByExperiment(experiment.id);
    setWorkspaces(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Navigation Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label:
              experiment.subjectId === 'physics'
                ? 'Physics'
                : experiment.subjectId === 'chemistry'
                ? 'Chemistry'
                : experiment.subjectId === 'biology'
                ? 'Biology'
                : 'Mathematics',
            href: `/subjects/${experiment.subjectId}`,
          },
          { label: experiment.title },
        ]}
      />

      {/* Experiment Header Quick Status Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              experiment.subjectId === 'physics'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                : experiment.subjectId === 'chemistry'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                : experiment.subjectId === 'biology'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
            }`}
          >
            {experiment.subjectId.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {experiment.gradeLevel} • {experiment.difficulty}
          </span>
          {isCompleted ? (
            <Badge variant="success" dot>
              Completed
            </Badge>
          ) : isInProgress ? (
            <Badge variant="primary" dot>
              In Progress
            </Badge>
          ) : (
            <Badge variant="default">Not Started</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isCompleted ? 'success' : 'outline'}
            size="sm"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleStatusToggle}
          >
            {isCompleted ? 'Marked Completed ✓' : 'Mark as Completed'}
          </Button>
        </div>
      </div>

      {/* 5-Section Learning Tabs Navigation Header */}
      <ExperimentLearningTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        observationCount={observationCount}
        workspaceCount={workspaces.length}
        vivaCompleted={vivaCompleted}
      />

      {/* ================= 1. OVERVIEW SECTION ================= */}
      {activeTab === 'overview' && (
        <ExperimentOverviewSection
          experiment={experiment}
          media={simulationMedia}
          onStartExperiment={() => setActiveTab('lab')}
          onWatchSimulation={() => setActiveTab('simulation')}
        />
      )}

      {/* ================= 2. VIRTUAL LAB SECTION (STATE CONTINUOUSLY PRESERVED) ================= */}
      {/* 
        CRITICAL ARCHITECTURAL REQUIREMENT:
        Keep UniversalLabWorkspace continuously mounted in DOM to prevent wiping 
        active interactive circuit wires, canvas components, and simulation states.
      */}
      <div className={activeTab === 'lab' ? 'space-y-6 block' : 'hidden'}>
        {/* Lab Sub-Mode Switcher: Guided Mode vs Free Lab Canvas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLabSubMode('guided')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                labSubMode === 'guided'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guided Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setLabSubMode('freelab')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                labSubMode === 'freelab'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Lab Canvas</span>
              {workspaces.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                  {workspaces.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {labSubMode === 'freelab' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsNewWsModalOpen(true)}
              >
                New Workspace
              </Button>
            )}
            <Link to={`/workspace/${experiment.id}`}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4 text-blue-500" />}
              >
                Fullscreen Lab
              </Button>
            </Link>
          </div>
        </div>

        {/* Embedded Interactive Laboratory Workspace */}
        {experiment.implementationStatus === 'implemented' ? (
          <div className="w-full">
            {experiment.subjectId === 'biology' ? (
              <BiologyLabWorkspace
                experimentId={experiment.id}
                onLogObservation={(note) => {
                  setNotes((prev) => (prev ? `${prev}\n${note}` : note));
                }}
              />
            ) : (
              <UniversalLabWorkspace
                experimentId={experiment.id}
                initialMode={labSubMode}
              />
            )}
          </div>
        ) : (
          <UnderDevelopmentWorkspace experimentId={experiment.id} />
        )}

        {/* Free Lab Saved Workspaces Card Grid (Rendered when in freelab mode) */}
        {labSubMode === 'freelab' && (
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saved Bench Workspaces for this Experiment
            </h4>

            {workspaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((ws) => (
                  <Card key={ws.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          WS
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(ws.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {ws.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {ws.componentCount} components wired
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Open in Canvas
                      </Button>
                      <button
                        onClick={() => handleDeleteWorkspace(ws.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        aria-label="Delete workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FolderOpen}
                title="No custom workspaces yet"
                description="Create a named workspace to experiment with free component layouts and save your bench setup locally in IndexedDB."
                actionLabel="Create First Workspace"
                onAction={() => setIsNewWsModalOpen(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* ================= 3. LOAD SIMULATION SECTION ================= */}
      {activeTab === 'simulation' && (
        <LoadSimulationSection
          media={simulationMedia}
          onReturnToLab={() => setActiveTab('lab')}
          remediationTarget={remediationTarget}
          onClearRemediation={() => {
            setRemediationTarget(null);
            setActiveTab('viva');
          }}
        />
      )}

      {/* ================= 4. OBSERVATIONS SECTION ================= */}
      {activeTab === 'observations' && (
        <ExperimentObservationsSection
          experimentId={experiment.id}
          initialNotes={notes}
          onNotesChange={(n) => setNotes(n)}
          onTrialsCountChange={setObservationCount}
        />
      )}

      {/* ================= 5. VIVA & RESULTS SECTION ================= */}
      {activeTab === 'viva' && (
        <VivaSection
          media={simulationMedia}
          onVivaComplete={() => setVivaCompleted(true)}
          onRemediate={(segmentId, questionId) => {
            setRemediationTarget({ segmentId, questionId });
            setActiveTab('simulation');
          }}
        />
      )}

      {/* New Workspace Creation Modal */}
      <Modal
        isOpen={isNewWsModalOpen}
        onClose={() => setIsNewWsModalOpen(false)}
        title="Create New Virtual Workspace"
        description={`Set up a free-form digital laboratory bench for ${experiment.title}.`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsNewWsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateWorkspace}>
              Create Workspace
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={newWsTitle}
              onChange={(e) => setNewWsTitle(e.target.value)}
              placeholder="e.g. Trial Setup 1 - Variable Voltage"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            This will save a workspace record into IndexedDB containing the apparatus palette items pre-populated on your canvas.
          </p>
        </div>
      </Modal>
    </div>
  );
};
