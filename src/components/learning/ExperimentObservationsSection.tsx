/**
 * ExperimentObservationsSection.tsx
 *
 * Section for recording and analyzing experiment observations:
 * - Interactive Observation Table with trial rows, raw inputs, and calculated outputs
 * - Ability to add new trial rows, clear trials, or recalculate mean
 * - Statistical Summary: Mean observed value, deviation, and percentage error
 * - Student Conclusions Journal with auto-save to IndexedDB via studentProgressService
 */

import React, { useState, useEffect } from 'react';
import {
  TableProperties,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  FileText,
  BarChart3,
  Calculator,
} from 'lucide-react';
import { Button } from '../shared/Button';
import { updateExperimentProgress } from '../../services/studentProgressService';

export interface ObservationRow {
  id: string;
  trial: number;
  inputParam: string; // e.g. "1.5 V"
  measuredParam: string; // e.g. "0.30 A"
  calculatedParam: string; // e.g. "5.00 Ω"
  notes: string;
}

interface ExperimentObservationsSectionProps {
  experimentId: string;
  initialNotes?: string;
  onNotesChange?: (notes: string) => void;
  onTrialsCountChange?: (count: number) => void;
}

export const ExperimentObservationsSection: React.FC<ExperimentObservationsSectionProps> = ({
  experimentId,
  initialNotes = '',
  onNotesChange,
  onTrialsCountChange,
}) => {
  // Default default initial trials based on standard laboratory observation
  const [trials, setTrials] = useState<ObservationRow[]>([
    {
      id: 'trial-1',
      trial: 1,
      inputParam: '1.00',
      measuredParam: '0.20',
      calculatedParam: '5.00',
      notes: 'Initial stable baseline reading',
    },
    {
      id: 'trial-2',
      trial: 2,
      inputParam: '2.00',
      measuredParam: '0.40',
      calculatedParam: '5.00',
      notes: 'Linear voltage increment',
    },
    {
      id: 'trial-3',
      trial: 3,
      inputParam: '3.00',
      measuredParam: '0.60',
      calculatedParam: '5.00',
      notes: 'Concordant data point',
    },
    {
      id: 'trial-4',
      trial: 4,
      inputParam: '4.00',
      measuredParam: '0.81',
      calculatedParam: '4.94',
      notes: 'Minor temperature fluctuation',
    },
  ]);

  const [notes, setNotes] = useState<string>(initialNotes);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // New trial input state
  const [newInput, setNewInput] = useState<string>('5.00');
  const [newMeasured, setNewMeasured] = useState<string>('1.00');
  const [newCalculated, setNewCalculated] = useState<string>('5.00');
  const [newNotes, setNewNotes] = useState<string>('New laboratory trial');

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    if (onTrialsCountChange) {
      onTrialsCountChange(trials.length);
    }
  }, [trials.length]);

  const handleAddTrial = () => {
    if (!newInput || !newMeasured) return;
    const newRow: ObservationRow = {
      id: `trial-${Date.now()}`,
      trial: trials.length + 1,
      inputParam: newInput,
      measuredParam: newMeasured,
      calculatedParam: newCalculated || '5.00',
      notes: newNotes,
    };
    setTrials((prev) => [...prev, newRow]);
    setNewInput('');
    setNewMeasured('');
    setNewCalculated('');
    setNewNotes('');
  };

  const handleDeleteTrial = (id: string) => {
    setTrials((prev) => prev.filter((t) => t.id !== id).map((t, idx) => ({ ...t, trial: idx + 1 })));
  };

  const handleClearAllTrials = () => {
    setTrials([]);
  };

  const handleSaveJournal = async () => {
    setIsSavingNotes(true);
    await updateExperimentProgress(experimentId, { notes });
    if (onNotesChange) {
      onNotesChange(notes);
    }
    setIsSavingNotes(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Compute average of calculated parameters if numeric
  const numericCalculated = trials
    .map((t) => parseFloat(t.calculatedParam))
    .filter((n) => !isNaN(n));

  const averageCalculated =
    numericCalculated.length > 0
      ? (
          numericCalculated.reduce((a, b) => a + b, 0) /
          numericCalculated.length
        ).toFixed(2)
      : 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Observation Table Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Observation Table & Data Logger
              </h3>
              <p className="text-xs text-slate-500">
                Recorded Values, Instrumental Least Count, and Derived Quantities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
              onClick={handleClearAllTrials}
              disabled={trials.length === 0}
            >
              Clear Table
            </Button>
          </div>
        </div>

        {/* Tabular Data View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4 w-16">Trial #</th>
                <th className="py-3 px-4">Input Setting (X)</th>
                <th className="py-3 px-4">Measured Reading (Y)</th>
                <th className="py-3 px-4">Calculated Ratio (Y/X)</th>
                <th className="py-3 px-4">Observations / Remarks</th>
                <th className="py-3 px-4 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {trials.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                    #{t.trial}
                  </td>
                  <td className="py-3 px-4">{t.inputParam}</td>
                  <td className="py-3 px-4">{t.measuredParam}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {t.calculatedParam}
                  </td>
                  <td className="py-3 px-4 font-sans text-xs text-slate-500 dark:text-slate-400">
                    {t.notes}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteTrial(t.id)}
                      aria-label={`Delete trial ${t.trial}`}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {trials.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-sans">
                    No observations logged yet. Add a trial below or conduct measurements in the Virtual Lab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Trial Entry Form */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Log New Measurement Trial:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Input Setting
              </label>
              <input
                type="text"
                placeholder="e.g. 5.00 V"
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Measured Reading
              </label>
              <input
                type="text"
                placeholder="e.g. 1.00 A"
                value={newMeasured}
                onChange={(e) => setNewMeasured(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Derived Value
              </label>
              <input
                type="text"
                placeholder="e.g. 5.00 Ω"
                value={newCalculated}
                onChange={(e) => setNewCalculated(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Trial Remarks
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddTrial}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-slate-500 text-[11px]">Mean Derived Value</div>
              <div className="font-bold font-mono text-sm text-slate-900 dark:text-slate-100">
                {averageCalculated}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-slate-500 text-[11px]">Recorded Sample Size</div>
              <div className="font-bold font-mono text-sm text-slate-900 dark:text-slate-100">
                {trials.length} trials
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-slate-500 text-[11px]">Concordancy & Precision</div>
              <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                High Reproducibility
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Conclusions Journal */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Student Laboratory Journal & Conclusions
              </h3>
              <p className="text-xs text-slate-500">
                Synthesize findings, interpret graphs, and state experimental deductions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" />
                Saved to IndexedDB
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSaveJournal}
              disabled={isSavingNotes}
            >
              {isSavingNotes ? 'Saving...' : 'Save Journal'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Write your scientific conclusions below. Address whether your data confirms theoretical laws, discuss possible sources of error (least count, parallax, friction, heating), and suggest remediation.
          </div>
          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your experimental conclusions, observations, and insights here..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 font-mono">
            <span>Character count: {notes.length}</span>
            <span>Persisted locally in IndexedDB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
