import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  FolderOpen,
  FileText,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { getExperimentById } from '../services/experimentRegistry';
import { useStudent } from '../context/StudentContext';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { Tabs } from '../components/shared/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../components/shared/Card';
import { UniversalLabWorkspace } from '../components/workspace/UniversalLabWorkspace';
import { Modal } from '../components/shared/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import {
  getWorkspacesByExperiment,
  updateExperimentProgress,
} from '../services/studentProgressService';
import { SavedWorkspace, ProgressStatus } from '../types';

export const ExperimentDetailPage: React.FC = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const experiment = getExperimentById(experimentId || '');

  const { progressMap, markStatus, addWorkspace, removeWorkspace } = useStudent();

  const [activeTab, setActiveTab] = useState<string>('guided');
  const [workspaces, setWorkspaces] = useState<SavedWorkspace[]>([]);
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState<boolean>(false);
  const [newWsTitle, setNewWsTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);

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

  if (!experiment) {
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

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await updateExperimentProgress(experiment.id, { notes });
    setTimeout(() => setIsSavingNotes(false), 500);
  };

  const tabs = [
    { id: 'guided', label: 'Guided Mode', icon: <BookOpen className="w-4 h-4" /> },
    {
      id: 'freelab',
      label: 'Free Lab Canvas',
      icon: <Sparkles className="w-4 h-4" />,
      badge: workspaces.length > 0 ? workspaces.length : undefined,
    },
    { id: 'apparatus', label: 'Apparatus & Safety', icon: <Layers className="w-4 h-4" /> },
    { id: 'notes', label: 'Student Lab Notes', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Navigation Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label: experiment.subjectId === 'physics' ? 'Physics' : 'Chemistry',
            href: `/subjects/${experiment.subjectId}`,
          },
          { label: experiment.title },
        ]}
      />

      {/* Experiment Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  experiment.subjectId === 'physics'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                }`}
              >
                {experiment.subjectId.toUpperCase()}
              </span>
              <Badge variant="outline">{experiment.difficulty}</Badge>
              <Badge variant="outline">{experiment.gradeLevel}</Badge>
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

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {experiment.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {experiment.fullDescription}
            </p>

            {experiment.keyFormulaOrPrinciple && (
              <div className="p-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">Principle:</span>
                <span>{experiment.keyFormulaOrPrinciple}</span>
              </div>
            )}
          </div>

          {/* Quick Actions & Status Control */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <Button
              variant={isCompleted ? 'success' : 'primary'}
              size="md"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleStatusToggle}
            >
              {isCompleted ? 'Marked Completed ✓' : 'Mark as Completed'}
            </Button>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Duration</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {experiment.estimatedDurationMinutes} mins
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Apparatus</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {experiment.apparatus.length} items
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Workspaces</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {workspaces.length} saved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Tags */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Curriculum Alignment:
          </span>
          {experiment.curriculumTags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        className="w-full sm:w-auto"
      />

      {/* ================= TAB CONTENT: GUIDED MODE ================= */}
      {activeTab === 'guided' && (
        <div className="space-y-6">
          {experiment.subjectId === 'physics' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Interactive Guided Laboratory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Follow guided steps, construct valid circuits, verify physical laws, and complete syllabus goals.
                  </p>
                </div>
                <Link to={`/workspace/${experiment.id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Sparkles className="w-4 h-4 text-blue-500" />}
                  >
                    Open Fullscreen Lab
                  </Button>
                </Link>
              </div>

              {/* Embedded Guided Universal Laboratory */}
              <div className="w-full">
                <UniversalLabWorkspace experimentId={experiment.id} initialMode="guided" />
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-200">
                <p className="font-bold">Guided Laboratory Walkthrough (Phase 1 Placeholder)</p>
                <p className="mt-0.5 text-blue-800 dark:text-blue-300">
                  {experiment.guidedModeOverview} Review the structured procedure and learning objectives below.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step by Step Sequence */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Laboratory Procedure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: 'Apparatus Inspection & Zero Error Calibration',
                      detail:
                        'Verify all electrical/chemical apparatus are clean, dry, and undamaged. Note pointer zero-errors on analog ammeters and voltmeters.',
                    },
                    {
                      step: 2,
                      title: 'Circuit / Reaction Setup',
                      detail:
                        'Connect components strictly according to circuit diagram or spotting plate cavity plan. Keep circuit keys open before supervisor verification.',
                    },
                    {
                      step: 3,
                      title: 'Observation & Value Recording',
                      detail:
                        'Vary the independent variable across 5 gradual increments. Tabulate corresponding dependent response values in the laboratory log.',
                    },
                    {
                      step: 4,
                      title: 'Graph Plotting & Data Analysis',
                      detail:
                        'Plot characteristic curves on Cartesian axes, determine best-fit slope, and calculate physical constants with appropriate units.',
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start gap-3.5"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {s.step}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {s.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {s.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Observation Table Template */}
              <Card>
                <CardHeader>
                  <CardTitle>Standard Observation Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                          <th className="py-2.5 px-3">Trail #</th>
                          <th className="py-2.5 px-3">Independent Var (X)</th>
                          <th className="py-2.5 px-3">Dependent Var (Y)</th>
                          <th className="py-2.5 px-3">Derived Value (K = Y/X)</th>
                          <th className="py-2.5 px-3">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {[1, 2, 3, 4, 5].map((trial) => (
                          <tr key={trial} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                              Observation {trial}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3 text-slate-500">—</td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Pending Lab Phase 2
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Objectives Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {experiment.learningObjectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB CONTENT: FREE LAB CANVAS (PACKET TRACER STYLE) ================= */}
      {activeTab === 'freelab' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Free-Form Virtual Workspaces
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {workspaces.length} workspace{workspaces.length === 1 ? '' : 's'} saved in local IndexedDB storage.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewWsModalOpen(true)}
            >
              Create New Workspace
            </Button>
          </div>

          {/* Universal Interactive Laboratory Workspace */}
          <div className="w-full">
            <UniversalLabWorkspace experimentId={experiment.id} initialMode="freelab" />
          </div>

          {/* Saved Workspaces Management List */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
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
        </div>
      )}

      {/* ================= TAB CONTENT: APPARATUS & SAFETY ================= */}
      {activeTab === 'apparatus' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Apparatus & Reagents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {experiment.apparatus.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-[10px] uppercase text-slate-400 font-mono">
                        Category: {item.category}
                      </p>
                    </div>
                  </div>
                  {item.quantity && (
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
                      {item.quantity}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety Protocols & Virtual Laboratory Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {experiment.safetyGuidelines.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= TAB CONTENT: LAB NOTES ================= */}
      {activeTab === 'notes' && (
        <Card>
          <CardHeader>
            <CardTitle>Student Scientific Journal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record your hypotheses, observations, formula derivations, and reflections. Notes are automatically saved in browser IndexedDB.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record your observations, questions for your science teacher, and experimental insights here..."
              rows={8}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {notes.length} characters recorded
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                isLoading={isSavingNotes}
              >
                Save Journal Entry
              </Button>
            </div>
          </CardContent>
        </Card>
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
