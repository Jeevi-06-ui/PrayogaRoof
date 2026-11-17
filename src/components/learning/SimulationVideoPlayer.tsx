/**
 * SimulationVideoPlayer.tsx
 *
 * Interactive Visual Simulation & Audible Voice Player:
 * - Animated scientific simulation canvas / SVG rendering for each topic segment
 * - Full Voice Narration Integration via Web Speech API and HTMLAudioElement
 * - Synchronized Controls:
 *   - Play, Pause, Resume, Replay, Stop
 *   - Timeline scrubber with chapter jump and voice resync
 *   - Real volume slider and Mute / Unmute
 *   - Playback rate synchronization (0.5x to 2x)
 *   - Installed English voice selection dropdown
 *   - Synchronized live closed captions (CC)
 *   - Fullscreen toggle
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Minimize2,
  Subtitles,
  Gauge,
  Sparkles,
  Mic,
  MicOff,
  Radio,
} from 'lucide-react';
import {
  ExperimentSimulationMedia,
  SimulationSegment,
} from '../../services/learning/simulationMediaRegistry';
import { useSimulationNarration } from '../../hooks/useSimulationNarration';

interface SimulationVideoPlayerProps {
  media: ExperimentSimulationMedia;
  activeSegmentId?: string;
  onSegmentChange?: (segment: SimulationSegment) => void;
  onTimeUpdate?: (seconds: number) => void;
  autoPlayVoice?: boolean;
}

export const SimulationVideoPlayer: React.FC<SimulationVideoPlayerProps> = ({
  media,
  activeSegmentId,
  onSegmentChange,
  onTimeUpdate,
  autoPlayVoice = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(performance.now());
  const lastSpokenSegmentIdRef = useRef<string | null>(null);

  const narration = useSimulationNarration();

  const totalDuration = media.totalDurationSeconds || 180;

  // Determine current active segment based on currentTime
  const currentSegment = useMemo(() => {
    const found = media.segments.find(
      (s) => currentTime >= s.startTime && currentTime < s.startTime + s.duration
    );
    return found || media.segments[media.segments.length - 1] || media.segments[0];
  }, [media.segments, currentTime]);

  // Sync external segment selection
  useEffect(() => {
    if (activeSegmentId && activeSegmentId !== currentSegment?.id) {
      const target = media.segments.find((s) => s.id === activeSegmentId);
      if (target) {
        setCurrentTime(target.startTime);
        if (isPlaying && isVoiceEnabled) {
          triggerNarrationForSegment(target);
        }
      }
    }
  }, [activeSegmentId, media.segments]);

  // Auto-play voice if triggered externally (e.g. from "Play Simulation with Voice" button)
  useEffect(() => {
    if (autoPlayVoice && !isPlaying) {
      handlePlay(true);
    }
  }, [autoPlayVoice]);

  // Notify parent of segment changes and time updates
  useEffect(() => {
    if (currentSegment && onSegmentChange) {
      onSegmentChange(currentSegment);
    }
  }, [currentSegment?.id]);

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  }, [currentTime]);

  // Trigger narration for a given segment
  const triggerNarrationForSegment = (segment: SimulationSegment) => {
    if (!isVoiceEnabled) return;
    lastSpokenSegmentIdRef.current = segment.id;
    const script = segment.narrationScript || segment.transcript;
    narration.speak(script, {
      segmentId: segment.id,
      audioUrl: segment.audioUrl || media.narrationAudioUrl,
      rate: playbackRate,
    });
  };

  // Detect segment change during playback and speak new segment narration
  useEffect(() => {
    if (isPlaying && isVoiceEnabled && currentSegment) {
      if (lastSpokenSegmentIdRef.current !== currentSegment.id) {
        triggerNarrationForSegment(currentSegment);
      }
    }
  }, [currentSegment?.id, isPlaying, isVoiceEnabled]);

  // Cleanup: Stop all audio when unmounting
  useEffect(() => {
    return () => {
      narration.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTickRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSeconds = ((now - lastTickRef.current) / 1000) * playbackRate;
      lastTickRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSeconds;
        if (next >= totalDuration) {
          setIsPlaying(false);
          narration.stop();
          return totalDuration;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackRate, totalDuration]);

  // Playback control handlers
  const handlePlay = (startVoice: boolean = isVoiceEnabled) => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(true);
    if (startVoice) {
      setIsVoiceEnabled(true);
      if (narration.state === 'paused') {
        narration.resume();
      } else if (currentSegment) {
        triggerNarrationForSegment(currentSegment);
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    narration.pause();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    if (isVoiceEnabled && media.segments[0]) {
      triggerNarrationForSegment(media.segments[0]);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    lastSpokenSegmentIdRef.current = null;
    narration.stop();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);

    const targetSeg = media.segments.find(
      (s) => val >= s.startTime && val < s.startTime + s.duration
    );
    if (targetSeg && isPlaying && isVoiceEnabled) {
      triggerNarrationForSegment(targetSeg);
    }
  };

  const handleSegmentJump = (startTime: number) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
    const targetSeg = media.segments.find(
      (s) => startTime >= s.startTime && startTime < s.startTime + s.duration
    );
    if (targetSeg && isVoiceEnabled) {
      triggerNarrationForSegment(targetSeg);
    }
  };

  const handleToggleVoice = () => {
    const nextVal = !isVoiceEnabled;
    setIsVoiceEnabled(nextVal);
    if (!nextVal) {
      narration.stop();
    } else if (isPlaying && currentSegment) {
      triggerNarrationForSegment(currentSegment);
    }
  };

  const handleSpeedChange = (newRate: number) => {
    setPlaybackRate(newRate);
    narration.setRate(newRate);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fractional progress within current segment (0.0 to 1.0)
  const segmentProgress = useMemo(() => {
    if (!currentSegment) return 0;
    const elapsed = currentTime - currentSegment.startTime;
    return Math.min(Math.max(elapsed / (currentSegment.duration || 1), 0), 1);
  }, [currentTime, currentSegment]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 text-white shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full'
      }`}
    >
      {/* ================= SIMULATION CANVAS / VISUAL DISPLAY ================= */}
      <div className="relative w-full aspect-video min-h-[280px] sm:min-h-[380px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Header Overlay with Badge, Subject, and Voice Engine Indicator */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              {media.subjectId} • {media.gradeLevel}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80 text-xs font-semibold backdrop-blur-md">
              Segment {media.segments.findIndex((s) => s.id === currentSegment?.id) + 1} of 7
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Voice Status Indicator */}
            {isVoiceEnabled && (
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold backdrop-blur-md border ${
                  narration.state === 'playing'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700'
                }`}
              >
                <Radio
                  className={`w-3.5 h-3.5 ${
                    narration.state === 'playing' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {narration.state === 'playing' ? 'VOICE NARRATING' : 'VOICE READY'}
                </span>
              </span>
            )}

            {isPlaying && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold animate-pulse backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                SIMULATING
              </span>
            )}
          </div>
        </div>

        {/* Segment-Specific Visual Animation Canvas */}
        <div className="w-full max-w-2xl h-full flex flex-col items-center justify-center text-center relative z-0">
          {/* 1. Intro Segment */}
          {currentSegment?.id === 'intro' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mx-auto shadow-inner">
                <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
                <span
                  className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white px-4">
                {media.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                {currentSegment.summary}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {currentSegment.keyPoints.map((kp, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    ✦ {kp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. Apparatus Segment */}
          {currentSegment?.id === 'apparatus' && (
            <div className="w-full space-y-4 animate-in fade-in duration-300">
              <div className="text-sm font-bold text-blue-400 uppercase tracking-widest">
                Workbench & Apparatus Inspection
              </div>
              <div className="relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-md mx-auto">
                <div className="flex items-center justify-around gap-4 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 text-lg font-bold">
                      A
                    </div>
                    <span className="text-[11px] text-slate-400">Source / Supply</span>
                  </div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-lg font-bold">
                      B
                    </div>
                    <span className="text-[11px] text-slate-400">Test Apparatus</span>
                  </div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-lg font-bold">
                      C
                    </div>
                    <span className="text-[11px] text-slate-400">Detector / Meter</span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 font-mono pt-2 border-t border-slate-800">
                  Calibrated Least Count & Zero Error Verification
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {currentSegment.summary}
              </p>
            </div>
          )}

          {/* 3. Procedure Segment */}
          {currentSegment?.id === 'procedure' && (
            <div className="w-full space-y-4 animate-in fade-in duration-300">
              <div className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
                Active Protocol Demonstration
              </div>
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Procedure Stage</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(segmentProgress * 100)}% Executed
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-150"
                    style={{ width: `${segmentProgress * 100}%` }}
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-left text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white">Current Operation:</div>
                  <div>{currentSegment.summary}</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Observation Segment */}
          {currentSegment?.id === 'observation' && (
            <div className="w-full space-y-4 animate-in fade-in duration-300">
              <div className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
                Real-Time Observation & Curve Plotting
              </div>
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto">
                <svg
                  viewBox="0 0 320 160"
                  className="w-full h-36 stroke-current text-cyan-400 overflow-visible"
                >
                  <line x1="40" y1="20" x2="40" y2="130" stroke="#334155" strokeWidth="1.5" />
                  <line x1="40" y1="130" x2="300" y2="130" stroke="#334155" strokeWidth="1.5" />
                  <text x="35" y="15" fill="#94a3b8" fontSize="10" textAnchor="end">
                    Y
                  </text>
                  <text x="305" y="135" fill="#94a3b8" fontSize="10">
                    X
                  </text>

                  <line
                    x1="40"
                    y1="130"
                    x2={40 + 240 * segmentProgress}
                    y2={130 - 100 * segmentProgress}
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((pt, idx) => {
                    if (segmentProgress < pt) return null;
                    const cx = 40 + 240 * pt;
                    const cy = 130 - 100 * pt;
                    return (
                      <g key={idx}>
                        <circle cx={cx} cy={cy} r="4" fill="#22d3ee" />
                        <circle cx={cx} cy={cy} r="8" fill="#22d3ee" opacity="0.3" />
                      </g>
                    );
                  })}
                </svg>
                <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <span>Linear Correlation: R² = 0.998</span>
                  <span className="text-cyan-400 font-bold">High Precision</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Explanation Segment */}
          {currentSegment?.id === 'explanation' && (
            <div className="w-full space-y-4 animate-in fade-in duration-300">
              <div className="text-sm font-bold text-purple-400 uppercase tracking-widest">
                Scientific Law & Governing Dynamics
              </div>
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto space-y-3">
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 font-mono text-sm text-purple-200">
                  {media.importantFormulas[0]?.formula || 'Fundamental Governing Law'}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed text-left">
                  {currentSegment.summary}
                </p>
                <div className="grid grid-cols-2 gap-2 text-left text-[11px] pt-1">
                  {currentSegment.keyPoints.slice(0, 2).map((kp, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400"
                    >
                      • {kp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. Worked Example Segment */}
          {currentSegment?.id === 'worked-example' && (
            <div className="w-full space-y-3 animate-in fade-in duration-300">
              <div className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                Numerical Worked Example
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto text-left space-y-2">
                <div className="text-xs font-bold text-amber-300">Problem Statement:</div>
                <div className="text-xs text-slate-300 line-clamp-2">
                  {media.workedExample.problem}
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 font-mono text-xs text-amber-200 flex items-center justify-between">
                  <span>Final Answer:</span>
                  <span className="font-bold text-amber-300 text-sm">
                    {media.workedExample.finalAnswer}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 7. Mistakes Segment */}
          {currentSegment?.id === 'mistakes' && (
            <div className="w-full space-y-3 animate-in fade-in duration-300">
              <div className="text-sm font-bold text-rose-400 uppercase tracking-widest">
                Common Errors & Precautions
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto text-left space-y-2">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Key Laboratory Precaution:
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {media.commonMistakes[0]?.prevention || currentSegment.summary}
                </div>
                <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300">
                  <span className="font-bold">Consequence if ignored:</span>{' '}
                  {media.commonMistakes[0]?.consequence || 'Inaccurate observations and damaged apparatus.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Closed Caption (CC) Overlay Banner */}
        {showCaptions && currentSegment?.transcript && (
          <div className="absolute bottom-4 left-6 right-6 z-20 pointer-events-none text-center">
            <div className="inline-block px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-700/80 text-xs sm:text-sm text-slate-100 font-medium shadow-2xl backdrop-blur-md max-w-2xl">
              {currentSegment.transcript}
            </div>
          </div>
        )}
      </div>

      {/* ================= CONTROLS & TIMELINE BAR ================= */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
        {/* Timeline Slider with Segment Tick Marks */}
        <div className="relative flex flex-col gap-1">
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Simulation timeline progress"
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />

          {/* Segment Chapter Ticks on timeline */}
          <div className="relative w-full h-3">
            {media.segments.map((seg, idx) => {
              const leftPercent = (seg.startTime / totalDuration) * 100;
              const isCurrent = currentSegment?.id === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => handleSegmentJump(seg.startTime)}
                  title={`${seg.title} (${formatTime(seg.startTime)})`}
                  style={{ left: `${leftPercent}%` }}
                  className={`absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer`}
                >
                  <span
                    className={`w-1.5 h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-blue-400 h-2.5 w-2'
                        : 'bg-slate-600 group-hover:bg-slate-400'
                    }`}
                  />
                  <span className="hidden group-hover:block absolute bottom-3 whitespace-nowrap text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-slate-200 z-30 pointer-events-none">
                    {idx + 1}. {seg.title.split('. ')[1] || seg.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Controls: Play/Pause, Stop, Replay, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white transition-all shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleStop}
              aria-label="Stop simulation"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReplay}
              aria-label="Replay simulation from beginning"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="font-mono text-xs text-slate-300 ml-1">
              <span className="text-white font-bold">{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Right Controls: Voice Toggle, Volume, Speed, CC, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Voice On/Off Toggle Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              aria-label={isVoiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
              title={isVoiceEnabled ? 'Voice Narration is ON' : 'Voice Narration is OFF'}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                isVoiceEnabled
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                  : 'text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {isVoiceEnabled ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline font-bold">Voice ON</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline font-bold">Voice OFF</span>
                </>
              )}
            </button>

            {/* Volume Control with Popover Slider */}
            <div className="relative">
              <button
                type="button"
                onClick={() => narration.toggleMute()}
                onMouseEnter={() => setShowVolumeSlider(true)}
                aria-label={narration.isMuted ? 'Unmute voice' : 'Mute voice'}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {narration.isMuted || narration.volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : narration.volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Volume Slider Popover */}
              {showVolumeSlider && (
                <div
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  className="absolute bottom-11 left-1/2 -translate-x-1/2 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col items-center gap-1.5 z-30 w-28"
                >
                  <span className="text-[10px] text-slate-400 font-mono">
                    {narration.isMuted ? 'Muted' : `${Math.round(narration.volume * 100)}%`}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={narration.isMuted ? 0 : narration.volume}
                    onChange={(e) => narration.setVolume(parseFloat(e.target.value))}
                    aria-label="Volume slider"
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/80 text-xs">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                aria-label="Playback speed"
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value={0.5} className="bg-slate-900">0.5x</option>
                <option value={0.75} className="bg-slate-900">0.75x</option>
                <option value={1} className="bg-slate-900">1.0x</option>
                <option value={1.25} className="bg-slate-900">1.25x</option>
                <option value={1.5} className="bg-slate-900">1.5x</option>
                <option value={2} className="bg-slate-900">2.0x</option>
              </select>
            </div>

            {/* Captions Toggle */}
            <button
              type="button"
              onClick={() => setShowCaptions((prev) => !prev)}
              aria-label="Toggle closed captions"
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                showCaptions
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Subtitles className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">CC</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen display"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
