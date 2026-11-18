/**
 * VivaSection.tsx
 *
 * Mobile-First Section for Viva Voce Examination, Remediation, and 100-Mark Rubric Evaluation:
 * - Card-by-card question wizard with progress indicator (1 of 5)
 * - Large touch-friendly answer options (min 44px hit targets)
 * - "Submit Answer", "I Don't Know", "Watch Explanation", "Next Question", and "Retry"
 * - Instant scientific feedback and remediation hints linked to voice simulation segments
 * - 100-Mark Rubric Breakdown (60 Marks Lab Work + 40 Marks Viva Voce)
 * - XP rewards, badges, and performance summary fitting all phone viewports
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ExperimentSimulationMedia,
  VivaQuestionItem,
} from '../../services/learning/simulationMediaRegistry';
import { Button } from '../shared/Button';

interface VivaSectionProps {
  media: ExperimentSimulationMedia;
  onVivaComplete?: (score: number, total: number) => void;
  onAssessmentEvaluated?: (data: {
    vivaMarks: number;
    labMarks: number;
    totalMarks: number;
    letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
    xpAwarded: number;
    answers: Array<{
      questionId: string;
      selectedIndex: number;
      correctIndex: number;
      marks: number;
    }>;
  }) => void;
  onRemediate?: (segmentId: string, questionId: string) => void;
}

export const VivaSection: React.FC<VivaSectionProps> = ({
  media,
  onVivaComplete,
  onAssessmentEvaluated,
  onRemediate,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'card' | 'all'>('card');

  const questions: VivaQuestionItem[] = media.vivaQuestions.slice(0, 5);
  const activeQuestion = questions[activeQuestionIndex] || questions[0];

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleDontKnow = (questionId: string) => {
    setRevealedExplanations((prev) => ({ ...prev, [questionId]: true }));
    // Do not set an answer, but allow advancing
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    }
  };

  const handleEvaluate = () => {
    setIsSubmitted(true);
    let earned = 0;
    const answerDetails = questions.map((q) => {
      const selected = selectedAnswers[q.id] ?? -1;
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) earned += q.marks;
      return {
        questionId: q.id,
        selectedIndex: selected,
        correctIndex: q.correctAnswerIndex,
        marks: isCorrect ? q.marks : 0,
      };
    });

    if (onVivaComplete) {
      onVivaComplete(earned, 40);
    }

    const labScore = 54;
    const finalScore = labScore + earned;
    const finalGrade = finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 60 ? 'C' : 'D';
    const xp = finalScore >= 90 ? 50 : finalScore >= 80 ? 40 : finalScore >= 70 ? 30 : finalScore >= 60 ? 20 : 10;

    if (onAssessmentEvaluated) {
      onAssessmentEvaluated({
        vivaMarks: earned,
        labMarks: labScore,
        totalMarks: finalScore,
        letterGrade: finalGrade,
        xpAwarded: xp,
        answers: answerDetails,
      });
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setRevealedExplanations({});
    setIsSubmitted(false);
    setActiveQuestionIndex(0);
  };

  // Score Calculations
  let vivaScore = 0;
  let _correctCount = 0;
  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctAnswerIndex) {
      vivaScore += q.marks;
      _correctCount += 1;
    }
  });

  const estimatedLabWorkScore = 54;
  const totalScore = estimatedLabWorkScore + vivaScore; // out of 100

  const getLetterGrade = (marks: number) => {
    if (marks >= 90) return { grade: 'A+', color: 'text-emerald-500', label: 'Outstanding Mastery', xp: 50 };
    if (marks >= 80) return { grade: 'A', color: 'text-blue-500', label: 'Excellent Performance', xp: 40 };
    if (marks >= 70) return { grade: 'B', color: 'text-cyan-500', label: 'Good Competency', xp: 30 };
    if (marks >= 60) return { grade: 'C', color: 'text-amber-500', label: 'Needs Practice', xp: 20 };
    return { grade: 'D', color: 'text-rose-500', label: 'Remediation Required', xp: 10 };
  };

  const gradeInfo = getLetterGrade(totalScore);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Evaluation & Grade Preview Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider">
                100-Mark Rubric Assessment
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                60 Marks Lab + 40 Marks Viva
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
              Viva Voce &amp; Performance Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete the 5 syllabus viva questions below. Instant scientific feedback and remediation hints are provided.
            </p>
          </div>

          {/* Grade & Score Summary Display */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-around gap-4 min-w-[240px]">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Score
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-0.5">
                {isSubmitted ? `${totalScore}/100` : '-- / 100'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Viva: {isSubmitted ? `${vivaScore}/40` : `${Object.keys(selectedAnswers).length}/5 done`}
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Grade
              </div>
              <div className={`text-2xl sm:text-3xl font-black ${gradeInfo.color} mt-0.5`}>
                {isSubmitted ? gradeInfo.grade : '--'}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                {isSubmitted ? `+${gradeInfo.xp} XP` : 'Answer Below'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Viva Questions Section */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Five Mandatory Viva Voce Questions
              </h3>
              <p className="text-[11px] text-slate-500">
                8 Marks per question • 40 Marks Total Viva Component
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Card View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All (5)
              </button>
            </div>

            {isSubmitted ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleReset}
                className="text-xs min-h-[36px]"
              >
                Retake Viva
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={handleEvaluate}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="text-xs min-h-[36px]"
              >
                Submit &amp; Evaluate
              </Button>
            )}
          </div>
        </div>

        {/* ================= 1. CARD WIZARD VIEW (DEFAULT FOR MOBILE) ================= */}
        {viewMode === 'card' && (
          <div className="space-y-4">
            {/* Progress Bar & Indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Question {activeQuestionIndex + 1} of {questions.length}
                </span>
                <span className="font-mono text-slate-400">
                  {Object.keys(selectedAnswers).length}/{questions.length} answered
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex gap-1 p-0.5">
                {questions.map((q, idx) => {
                  const isAns = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === activeQuestionIndex;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`flex-1 h-full rounded-full cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-blue-600 dark:bg-blue-400'
                          : isAns
                          ? 'bg-emerald-400 dark:bg-emerald-600'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Active Single Question Card */}
            {activeQuestion && (
              <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {activeQuestion.question}
                  </h4>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex-shrink-0">
                    {activeQuestion.marks} pts
                  </span>
                </div>

                {/* Options List with Large Touch Targets */}
                <div className="space-y-2.5">
                  {activeQuestion.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[activeQuestion.id] === optIdx;
                    const isCorrect = optIdx === activeQuestion.correctAnswerIndex;

                    let btnStyle =
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200 hover:border-blue-400';

                    if (isSubmitted) {
                      if (isCorrect) {
                        btnStyle =
                          'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle =
                          'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100 font-bold';
                      }
                    } else if (isSelected) {
                      btnStyle =
                        'bg-blue-50 dark:bg-blue-950/80 border-blue-600 text-blue-900 dark:text-blue-100 font-bold shadow-xs';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 min-h-[48px] active:scale-[0.99] ${btnStyle}`}
                      >
                        <span className="font-mono font-bold text-slate-400 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {isSubmitted && isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>✓ Correct (+8 Marks)</span>
                          </span>
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question Wizard Footer Navigation & Action Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeQuestionIndex === 0}
                      onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 min-h-[40px]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeQuestionIndex === questions.length - 1}
                      onClick={() => setActiveQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 min-h-[40px]"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleDontKnow(activeQuestion.id)}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[40px]"
                      >
                        I Don&apos;t Know
                      </button>
                    )}

                    {onRemediate && (
                      <button
                        type="button"
                        onClick={() =>
                          onRemediate(activeQuestion.relevantSegmentId || 'theory', activeQuestion.id)
                        }
                        className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1.5 min-h-[40px]"
                      >
                        <Volume2 className="w-4 h-4 text-amber-500" />
                        <span>Watch Explanation</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Explanation Box (Revealed if submitted or &quot;Don&apos;t know&quot; clicked) */}
                {(isSubmitted || revealedExplanations[activeQuestion.id]) && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1.5 animate-in fade-in">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Scientific Explanation</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold">Explanation:</span> {activeQuestion.explanation}
                    </p>
                    {activeQuestion.remediationHint && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        <span className="font-semibold">Remediation Tip:</span> {activeQuestion.remediationHint}
                      </p>
                    )}
                    {isSubmitted &&
                      selectedAnswers[activeQuestion.id] !== activeQuestion.correctAnswerIndex &&
                      onRemediate && (
                        <div className="pt-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Volume2 className="w-3.5 h-3.5 text-white" />}
                            onClick={() =>
                              onRemediate(
                                activeQuestion.relevantSegmentId || 'explanation',
                                activeQuestion.id
                              )
                            }
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
        )}

        {/* ================= 2. ALL QUESTIONS VIEW ================= */}
        {viewMode === 'all' && (
          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-750'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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
                          className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 min-h-[44px] ${btnStyle}`}
                        >
                          <span className="font-mono font-bold text-slate-400">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isSubmitted && isOptionCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                              <span>✓ Correct (+8 Marks)</span>
                            </span>
                          )}
                          {isSubmitted && isOptionSelected && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        <span className="font-bold">Explanation:</span> {q.explanation}
                      </p>
                      {!isCorrect && onRemediate && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Volume2 className="w-3.5 h-3.5 text-white" />}
                          onClick={() => onRemediate(q.relevantSegmentId || 'explanation', q.id)}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs mt-1"
                        >
                          Review Simulation Explanation with Voice
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 100-Mark Rubric Breakdown Table (Responsive Overflow) */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <BarChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              100-Mark Evaluation Rubric Breakdown
            </h3>
            <p className="text-[11px] text-slate-500">
              Official Laboratory Assessment Weights &amp; Scoring Distribution
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              <tr>
                <th className="py-2.5 px-3">Evaluation Domain</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 w-20">Marks</th>
                <th className="py-2.5 px-3">Assessment Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {media.rubric.criteria.map((c, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {c.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.category === 'lab-work'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {c.category === 'lab-work' ? 'Lab Work (60)' : 'Viva Voce (40)'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {c.marks} pts
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
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
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
            >
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
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
