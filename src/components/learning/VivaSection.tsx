/**
 * VivaSection.tsx
 *
 * Section for Viva Voce Examination, Remediation, and 100-Mark Rubric Evaluation:
 * - 5 Comprehensive Viva Voce Questions with multiple-choice selection
 * - Instant evaluation, feedback, explanation, and remediation hints
 * - 100-Mark Rubric Breakdown (60 Marks Lab Work + 40 Marks Viva Voce)
 * - Letter Grade Preview (A+, A, B, C, D) and Performance Summary
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BarChart,
  Lightbulb,
  Volume2,
} from 'lucide-react';
import {
  ExperimentSimulationMedia,
  VivaQuestionItem,
} from '../../services/learning/simulationMediaRegistry';
import { Button } from '../shared/Button';

interface VivaSectionProps {
  media: ExperimentSimulationMedia;
  onVivaComplete?: (score: number, total: number) => void;
  onRemediate?: (segmentId: string, questionId: string) => void;
}

export const VivaSection: React.FC<VivaSectionProps> = ({
  media,
  onVivaComplete,
  onRemediate,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const questions: VivaQuestionItem[] = media.vivaQuestions.slice(0, 5);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleEvaluate = () => {
    setIsSubmitted(true);
    let earned = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        earned += q.marks;
      }
    });
    if (onVivaComplete) {
      onVivaComplete(earned, 40);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  // Score Calculations
  let vivaScore = 0;
  let correctCount = 0;
  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctAnswerIndex) {
      vivaScore += q.marks;
      correctCount += 1;
    }
  });

  // Assume standard baseline lab work performance of 54/60 (90%) for preview
  const estimatedLabWorkScore = 54;
  const totalScore = estimatedLabWorkScore + vivaScore; // out of 100

  const getLetterGrade = (marks: number) => {
    if (marks >= 90) return { grade: 'A+', color: 'text-emerald-500', label: 'Outstanding Mastery' };
    if (marks >= 80) return { grade: 'A', color: 'text-blue-500', label: 'Excellent Performance' };
    if (marks >= 70) return { grade: 'B', color: 'text-cyan-500', label: 'Good Competency' };
    if (marks >= 60) return { grade: 'C', color: 'text-amber-500', label: 'Needs Practice' };
    return { grade: 'D', color: 'text-rose-500', label: 'Remediation Required' };
  };

  const gradeInfo = getLetterGrade(totalScore);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Evaluation & Grade Preview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                100-Mark Rubric Assessment
              </span>
              <span className="text-xs text-slate-400 font-mono">
                60 Marks Lab + 40 Marks Viva
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Viva Voce & Performance Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Answer the 5 conceptual viva questions below. Instant scientific feedback and remediation hints are generated upon submission.
            </p>
          </div>

          {/* Grade & Score Summary Display */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-6 min-w-[260px]">
            <div className="text-center">
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Total Score
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
                {isSubmitted ? totalScore : '--'}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Viva: {isSubmitted ? `${vivaScore}/40 (${correctCount}/5 Correct)` : 'Pending'}
              </div>
            </div>

            <div className="w-px h-12 bg-white/10" />

            <div className="text-center">
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Grade
              </div>
              <div className={`text-3xl sm:text-4xl font-black ${gradeInfo.color} mt-1`}>
                {isSubmitted ? gradeInfo.grade : '--'}
              </div>
              <div className="text-[10px] text-slate-300 mt-1">
                {isSubmitted ? gradeInfo.label : 'Answer Below'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Viva Questions Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Five Mandatory Viva Voce Questions
              </h3>
              <p className="text-xs text-slate-500">
                8 Marks per question • 40 Marks Total Viva Component
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={handleReset}
              >
                Retake Viva
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={handleEvaluate}
                disabled={Object.keys(selectedAnswers).length === 0}
              >
                Submit & Evaluate ({Object.keys(selectedAnswers).length}/5 Answered)
              </Button>
            )}
          </div>
        </div>

        {/* Question Cards */}
        <div className="space-y-6">
          {questions.map((q, qIdx) => {
            const selectedOpt = selectedAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = isAnswered && selectedOpt === q.correctAnswerIndex;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isSubmitted
                    ? isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-750'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0">
                    {q.marks} pts
                  </span>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {q.options.map((opt, optIdx) => {
                    const isOptionSelected = selectedOpt === optIdx;
                    const isOptionCorrect = optIdx === q.correctAnswerIndex;

                    let btnStyle =
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:border-blue-400';

                    if (isSubmitted) {
                      if (isOptionCorrect) {
                        btnStyle =
                          'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 text-emerald-900 dark:text-emerald-100 font-bold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        btnStyle =
                          'bg-rose-100 dark:bg-rose-900/60 border-rose-400 text-rose-900 dark:text-rose-100 font-bold';
                      }
                    } else if (isOptionSelected) {
                      btnStyle =
                        'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                      >
                        <span className="font-mono font-bold text-slate-400">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isSubmitted && isOptionCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                        {isSubmitted && isOptionSelected && !isOptionCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Explanation (Rendered after submission) */}
                {isSubmitted && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct (+{q.marks} Marks)
                        </span>
                      ) : (
                        <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Incorrect (0 / {q.marks} Marks)
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                      <span className="font-bold">Explanation:</span> {q.explanation}
                    </p>

                    {!isCorrect && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2 text-[11px]">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Remediation Guide:</span>{' '}
                            {q.remediationHint || 'Review the scientific principle in the simulation.'}
                          </div>
                        </div>

                        {onRemediate && (
                          <div className="pt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Volume2 className="w-3.5 h-3.5 text-white" />}
                              onClick={() => onRemediate(q.relevantSegmentId || 'explanation', q.id)}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                            >
                              Review Simulation Explanation with Voice
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 100-Mark Rubric Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <BarChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              100-Mark Evaluation Rubric Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Official Laboratory Assessment Weights & Scoring Distribution
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4">Evaluation Domain</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 w-24">Marks</th>
                <th className="py-3 px-4">Assessment Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {media.rubric.criteria.map((c, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {c.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.category === 'lab-work'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {c.category === 'lab-work' ? 'Lab Work (60)' : 'Viva Voce (40)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {c.marks} pts
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grading Scale Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-center text-xs">
          {[
            { grade: 'A+', range: '90 - 100', text: 'Outstanding' },
            { grade: 'A', range: '80 - 89', text: 'Excellent' },
            { grade: 'B', range: '70 - 79', text: 'Good' },
            { grade: 'C', range: '60 - 69', text: 'Average' },
            { grade: 'D', range: '< 60', text: 'Remediation' },
          ].map((g) => (
            <div
              key={g.grade}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
            >
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {g.grade}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{g.range}</div>
              <div className="text-[10px] text-slate-500 font-medium">{g.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
