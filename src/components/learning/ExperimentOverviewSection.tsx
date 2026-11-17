/**
 * ExperimentOverviewSection.tsx
 *
 * Connected Overview Section containing:
 * - Title, Class, Subject, Difficulty, Estimated Duration
 * - Two Prominent CTA Action Buttons: "Start Experiment" & "Watch Simulation"
 * - Learning Objectives & Theoretical Foundation
 * - Apparatus & Safety Equipment Catalog
 * - Important Formulas Card with Mathematical Expressions
 * - Expected Experimental Outcomes
 * - Standard Laboratory Procedure Walkthrough
 */

import React from 'react';
import {
  Play,
  FlaskConical,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { ExperimentMetadata } from '../../types';
import { ExperimentSimulationMedia } from '../../services/learning/simulationMediaRegistry';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../shared/Card';

interface ExperimentOverviewSectionProps {
  experiment: ExperimentMetadata;
  media: ExperimentSimulationMedia;
  onStartExperiment: () => void;
  onWatchSimulation: () => void;
}

export const ExperimentOverviewSection: React.FC<ExperimentOverviewSectionProps> = ({
  experiment,
  media,
  onStartExperiment,
  onWatchSimulation,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Action Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                {experiment.subjectId}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                {experiment.gradeLevel}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                {experiment.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {experiment.estimatedDurationMinutes} mins
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {experiment.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {experiment.fullDescription}
            </p>

            {experiment.keyFormulaOrPrinciple && (
              <div className="p-3 px-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs sm:text-sm text-blue-200 flex items-center gap-2">
                <span className="font-bold text-blue-400">Core Principle:</span>
                <span>{experiment.keyFormulaOrPrinciple}</span>
              </div>
            )}
          </div>

          {/* Action Buttons: "Start Experiment" & "Watch Simulation" */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<FlaskConical className="w-5 h-5 text-white" />}
              onClick={onStartExperiment}
              className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 text-white font-bold py-3.5"
            >
              Start Experiment
            </Button>

            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 text-indigo-400 fill-indigo-400" />}
              onClick={onWatchSimulation}
              className="w-full bg-slate-800/90 hover:bg-slate-750 text-white border-slate-700 font-bold py-3.5"
            >
              Watch Simulation
            </Button>
          </div>
        </div>

        {/* Curriculum Tags */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Curriculum Alignment:
          </span>
          {experiment.curriculumTags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Grid: Objectives & Important Formulas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Objectives */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Learning Objectives
              </h3>
              <p className="text-xs text-slate-500">Curriculum Competencies to Master</p>
            </div>
          </div>

          <ul className="space-y-3">
            {media.learningObjectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Important Formulas Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Important Formulas & Laws
              </h3>
              <p className="text-xs text-slate-500">Mathematical Relationships and Definitions</p>
            </div>
          </div>

          <div className="space-y-3">
            {media.importantFormulas.map((f, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {f.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Required
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                  {f.formula}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apparatus & Safety */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Apparatus & Safety
              </h3>
              <p className="text-xs text-slate-500">
                Standard Equipment Checklist & Laboratory Safety Protocol
              </p>
            </div>
          </div>
          <Badge variant="outline">{experiment.apparatus.length} Items</Badge>
        </div>

        {/* Apparatus Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {experiment.apparatus.map((app, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {app.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {app.description || app.category}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Precautions Box */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Laboratory Safety & Care Instructions</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900/80 dark:text-amber-300/80">
            {experiment.safetyGuidelines.map((safe: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                <span>{safe}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Standard Laboratory Procedure Overview */}
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
                'Verify all electrical/chemical/optical apparatus are clean, dry, and undamaged. Note pointer zero-errors on analog ammeters and voltmeters.',
            },
            {
              step: 2,
              title: 'Circuit & Bench Assembly',
              detail:
                'Assemble circuit/apparatus strictly according to standard board diagrams, keeping keys open and polarity verified.',
            },
            {
              step: 3,
              title: 'Systematic Measurement & Range Sweep',
              detail:
                'Introduce controlled incremental parameter variations. Allow reading stabilization and record 5+ concordant observations.',
            },
            {
              step: 4,
              title: 'Data Tabulation & Graph Plotting',
              detail:
                'Plot independent variable on X-axis and dependent variable on Y-axis. Draw line of best fit and compute slope.',
            },
            {
              step: 5,
              title: 'Percentage Error & Result Statement',
              detail:
                'Compare experimental value with standard theoretical reference, compute percentage error, and state final conclusion.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
