/**
 * LoadSimulationSection.tsx
 *
 * Dedicated section for "Load Simulation" containing:
 * - Prominent "Play Simulation with Voice" Action Button
 * - SimulationVideoPlayer with shared visual & audio playback controls
 * - 7 Topic Segments interactive selector & progress tracker
 * - Synchronized live transcript and narration text
 * - Complete Solved Numerical Worked Example card
 * - Common Laboratory Mistakes & Precautionary Measures
 * - Viva Remediation mode linking back to viva question review
 * - Embedded Developer & Teacher Audio Diagnostics Panel
 * - "Return to Virtual Lab" action button
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  FileSpreadsheet,
  AlertOctagon,
  Sparkles,
  BookOpen,
  Volume2,
  Radio,
  Lightbulb,
} from 'lucide-react';
import {
  ExperimentSimulationMedia,
  SimulationSegment,
} from '../../services/learning/simulationMediaRegistry';
import { SimulationVideoPlayer } from './SimulationVideoPlayer';
import { AudioDiagnosticsPanel } from './AudioDiagnosticsPanel';
import { Button } from '../shared/Button';
import { useSimulationNarration } from '../../hooks/useSimulationNarration';

interface LoadSimulationSectionProps {
  media: ExperimentSimulationMedia;
  onReturnToLab: () => void;
  remediationTarget?: {
    segmentId: string;
    questionId: string;
  } | null;
  onClearRemediation?: () => void;
}

export const LoadSimulationSection: React.FC<LoadSimulationSectionProps> = ({
  media,
  onReturnToLab,
  remediationTarget,
  onClearRemediation,
}) => {
  const [activeSegmentId, setActiveSegmentId] = useState<string>(
    remediationTarget?.segmentId || media.segments[0]?.id || 'intro'
  );
  const [triggerPlayVoice, setTriggerPlayVoice] = useState<boolean>(false);

  const narration = useSimulationNarration();

  // If entering from a viva remediation target, switch to that segment
  useEffect(() => {
    if (remediationTarget?.segmentId) {
      setActiveSegmentId(remediationTarget.segmentId);
    }
  }, [remediationTarget?.segmentId]);

  const activeSegment =
    media.segments.find((s) => s.id === activeSegmentId) || media.segments[0];

  const handleSegmentSelect = (segment: SimulationSegment) => {
    setActiveSegmentId(segment.id);
  };

  const handlePlayWithVoice = () => {
    setTriggerPlayVoice(true);
    // Reset trigger after tick so subsequent clicks can re-trigger if needed
    setTimeout(() => setTriggerPlayVoice(false), 200);

    const script = activeSegment?.narrationScript || activeSegment?.transcript;
    if (script) {
      narration.speak(script, {
        segmentId: activeSegment?.id,
        audioUrl: activeSegment?.audioUrl || media.narrationAudioUrl,
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Viva Remediation Banner (shown when student arrives from incorrect viva question) */}
      {remediationTarget && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Viva Voce Remediation Mode
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                Reviewing foundational concept for Question {remediationTarget.questionId.split('-').pop()}. Listen to the voice explanation and watch the simulation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Volume2 className="w-4 h-4 text-white" />}
              onClick={handlePlayWithVoice}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold whitespace-nowrap"
            >
              Play Explanation with Voice
            </Button>
            {onClearRemediation && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearRemediation}
                className="whitespace-nowrap border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              >
                Return to Viva Question
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Top Banner & Return Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              Simulation Video & Voice Narration
            </span>
            <span className="text-xs text-slate-500 font-mono">
              7 Segments • {Math.round(media.totalDurationSeconds / 60)} min runtime
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono flex items-center gap-1 ${
                narration.isSpeechSupported
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <Radio className="w-2.5 h-2.5" />
              {narration.isSpeechSupported ? 'Audible Voice Ready' : 'TTS Unsupported'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {media.title}
          </h2>
        </div>

        {/* Action Buttons: "Play Simulation with Voice" & "Return to Virtual Lab" */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Volume2 className="w-5 h-5 text-white" />}
            onClick={handlePlayWithVoice}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 text-white font-extrabold whitespace-nowrap py-3 px-6"
          >
            Play Simulation with Voice
          </Button>

          <Button
            variant="outline"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={onReturnToLab}
            className="whitespace-nowrap"
          >
            Return to Virtual Lab
          </Button>
        </div>
      </div>

      {/* Main Simulation View: Player & 7 Segment Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player & Active Transcript (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <SimulationVideoPlayer
            media={media}
            activeSegmentId={activeSegmentId}
            onSegmentChange={handleSegmentSelect}
            autoPlayVoice={triggerPlayVoice}
          />

          {/* Synchronized Transcript & Deep Dive Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Synchronized Transcript: {activeSegment?.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayWithVoice}
                  className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
                <span className="text-xs font-mono text-slate-500">
                  {activeSegment?.duration}s
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
              &ldquo;{activeSegment?.transcript}&rdquo;
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Key Segment Competencies:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                {activeSegment?.keyPoints.map((kp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: 7 Topic Segments List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                7 Topic Segments
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Click to seek & narrate
              </span>
            </div>

            <div className="space-y-2">
              {media.segments.map((segment) => {
                const isActive = activeSegmentId === segment.id;
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => {
                      setActiveSegmentId(segment.id);
                      if (narration.state === 'playing') {
                        narration.speak(segment.narrationScript || segment.transcript, {
                          segmentId: segment.id,
                        });
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isActive ? (
                        <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-950" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive
                              ? 'text-blue-900 dark:text-blue-200'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {segment.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                          {segment.duration}s
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {segment.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick CTA to return to lab */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <h4 className="text-sm font-bold">Hands-On Practice</h4>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Review completed? Put theory into practice by assembling apparatus and recording measurements in the virtual lab.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onReturnToLab}
              className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold border-none"
            >
              Start Lab Experiment →
            </Button>
          </div>
        </div>
      </div>

      {/* ================= WORKED EXAMPLE & MISTAKES ACCORDION/CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solved Numerical Worked Example Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Solved Numerical Worked Example
              </h3>
              <p className="text-xs text-slate-500">
                Standard Board Exam Style Step-by-Step Derivation
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 font-medium">
              <span className="font-bold text-amber-600 dark:text-amber-400 mr-1.5">
                Problem:
              </span>
              {media.workedExample.problem}
            </div>

            {/* Given Parameters */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Given Experimental Data:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(media.workedExample.givenData).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="text-[10px] text-slate-500 truncate">{key}</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Applied */}
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 font-mono text-xs text-blue-900 dark:text-blue-200">
              <span className="font-bold">Formula:</span> {media.workedExample.formula}
            </div>

            {/* Derivation Steps */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Step-by-Step Solution:
              </span>
              <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {media.workedExample.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Final Answer Banner */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                Final Result:
              </span>
              <span className="font-extrabold text-sm sm:text-base font-mono text-emerald-700 dark:text-emerald-400">
                {media.workedExample.finalAnswer}
              </span>
            </div>
          </div>
        </div>

        {/* Common Mistakes & Precautions Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Common Laboratory Errors & Precautions
              </h3>
              <p className="text-xs text-slate-500">
                Avoid Frequent Pitfalls Observed in Practical Examinations
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {media.commonMistakes.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2 text-xs"
              >
                <div className="font-bold text-rose-900 dark:text-rose-200 flex items-start gap-1.5">
                  <span className="text-rose-500 font-extrabold">{idx + 1}.</span>
                  <span>{item.mistake}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] pl-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Consequence:
                  </span>{' '}
                  {item.consequence}
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium pl-3">
                  <span className="font-bold">Prevention:</span> {item.prevention}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Audio Diagnostics & Verification Panel (Developer & Instructor Tools) */}
      <AudioDiagnosticsPanel />
    </div>
  );
};
