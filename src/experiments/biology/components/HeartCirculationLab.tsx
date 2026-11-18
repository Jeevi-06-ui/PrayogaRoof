import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export type CardiacPhase = 'joint-diastole' | 'atrial-systole' | 'ventricular-systole' | 'isovolumetric-relaxation';

export const HeartCirculationLab: React.FC = () => {
  const [bpm, setBpm] = useState<number>(72);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);

  const phases: Array<{ id: CardiacPhase; name: string; sound: string; ecg: string; desc: string }> = [
    {
      id: 'joint-diastole',
      name: '1. Joint Diastole (Ventricular Filling)',
      sound: 'Quiet filling',
      ecg: 'T-P Interval baseline',
      desc: 'All 4 chambers relaxed. AV valves open; blood passively fills ventricles (~70% total volume). Semilunar valves closed.',
    },
    {
      id: 'atrial-systole',
      name: '2. Atrial Systole',
      sound: 'Atrial contraction',
      ecg: 'P Wave (Atrial Depolarization)',
      desc: 'SA node fires; both atria contract simultaneously, pushing remaining 30% of blood into ventricles.',
    },
    {
      id: 'ventricular-systole',
      name: '3. Ventricular Systole (Ejection)',
      sound: 'LUB (First Heart Sound - S1)',
      ecg: 'QRS Complex (Ventricular Depolarization)',
      desc: 'Ventricles contract; AV valves snap shut (LUB), intraventricular pressure spikes (>80 mmHg), semilunar valves open, ejecting blood into Aorta and Pulmonary Artery.',
    },
    {
      id: 'isovolumetric-relaxation',
      name: '4. Isovolumetric Relaxation',
      sound: 'DUB (Second Heart Sound - S2)',
      ecg: 'T Wave (Ventricular Repolarization)',
      desc: 'Ventricles relax; blood falls back against semilunar cusps snapping them shut (DUB), preventing arterial backflow.',
    },
  ];

  const currentPhase = phases[phaseIndex];

  // Animated cardiac cycle loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      const stepDurationMs = (60000 / bpm) / 4;
      timer = setInterval(() => {
        setPhaseIndex((prev) => (prev + 1) % phases.length);
      }, stepDurationMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, bpm]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Human Heart Hemodynamics & Cardiac Cycle</h3>
            <p className="text-xs text-slate-400">
              4-Chamber dual circulation, valve mechanics (LUB-DUB), ECG wave correlation, and cardiac output
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            leftIcon={isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          >
            {isPlaying ? 'Pause Heart' : 'Start Heartbeat'}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Controls & Hemodynamics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hemodynamic Controls
            </span>

            {/* Heart Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Heart Rate (BPM):</span>
                <span className="font-mono text-rose-400 font-bold text-sm">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="45"
                max="160"
                step="5"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Bradycardia (&lt;60)</span>
                <span>Normal (72)</span>
                <span>Tachycardia (&gt;100)</span>
              </div>
            </div>

            {/* Cardiac Output Calculation */}
            <div className="pt-2 border-t border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Stroke Volume:</span>
                <span className="font-mono text-slate-200">~70 mL / beat</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cardiac Output (CO):</span>
                <span className="font-mono text-teal-300 font-bold">
                  {((bpm * 70) / 1000).toFixed(2)} L / min
                </span>
              </div>
            </div>
          </div>

          {/* Current Cardiac Phase Details */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Active Phase & Sounds
            </span>
            <p className="font-bold text-rose-300 text-sm">{currentPhase.name}</p>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1 font-mono text-[11px]">
              <p className="text-amber-300">Heart Sound: {currentPhase.sound}</p>
              <p className="text-cyan-300">ECG Segment: {currentPhase.ecg}</p>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">{currentPhase.desc}</p>
          </div>
        </div>

        {/* Center: Interactive 4-Chamber Anatomical Heart */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[340px]">
            <svg viewBox="0 0 420 300" className="w-full h-full max-w-md">
              {/* Vena Cava (Deoxygenated blue inflow) */}
              <rect x="70" y="20" width="30" height="70" rx="6" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
              <text x="85" y="45" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">Vena Cava</text>

              {/* Aorta (Oxygenated red outflow arch) */}
              <path d="M 230 80 Q 230 15 280 20 Q 330 25 320 80" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
              <text x="280" y="40" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Aorta</text>

              {/* Heart Muscular Wall Contour */}
              <path
                d="M 100 80 Q 210 50 320 80 Q 340 180 210 280 Q 80 180 100 80 Z"
                fill="#450a0a"
                stroke="#b91c1c"
                strokeWidth="4"
              />

              {/* Septum dividing Right and Left halves */}
              <line x1="210" y1="80" x2="210" y2="280" stroke="#7f1d1d" strokeWidth="8" />

              {/* 4 Chambers */}
              {/* Right Atrium (RA) - Blue deoxygenated */}
              <rect x="110" y="85" width="90" height="70" rx="8" fill="#1d4ed8" fillOpacity={phaseIndex === 1 ? '0.9' : '0.6'} stroke="#3b82f6" strokeWidth="2" />
              <text x="155" y="125" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Right Atrium</text>

              {/* Left Atrium (LA) - Red oxygenated */}
              <rect x="220" y="85" width="90" height="70" rx="8" fill="#b91c1c" fillOpacity={phaseIndex === 1 ? '0.9' : '0.6'} stroke="#ef4444" strokeWidth="2" />
              <text x="265" y="125" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Left Atrium</text>

              {/* Right Ventricle (RV) - Blue deoxygenated */}
              <path
                d="M 115 165 L 205 165 L 205 255 Q 150 220 115 165 Z"
                fill="#1e40af"
                fillOpacity={phaseIndex === 2 ? '0.9' : '0.6'}
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <text x="160" y="205" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">Right Ventricle</text>

              {/* Left Ventricle (LV) - Thick muscular wall, Red oxygenated */}
              <path
                d="M 215 165 L 305 165 Q 270 220 215 255 Z"
                fill="#991b1b"
                fillOpacity={phaseIndex === 2 ? '0.9' : '0.6'}
                stroke="#ef4444"
                strokeWidth="3"
              />
              <text x="260" y="205" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">Left Ventricle</text>

              {/* Tricuspid Valve (between RA & RV) */}
              <line
                x1="130"
                y1="165"
                x2="185"
                y2="165"
                stroke={phaseIndex === 2 ? '#ef4444' : '#10b981'}
                strokeWidth="3.5"
                strokeDasharray={phaseIndex === 2 ? 'none' : '4 2'}
              />

              {/* Bicuspid / Mitral Valve (between LA & LV) */}
              <line
                x1="235"
                y1="165"
                x2="290"
                y2="165"
                stroke={phaseIndex === 2 ? '#ef4444' : '#10b981'}
                strokeWidth="3.5"
                strokeDasharray={phaseIndex === 2 ? 'none' : '4 2'}
              />
            </svg>

            {/* Synchronized ECG strip */}
            <div className="w-full max-w-md mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-300">Lead II ECG</span>
              </div>
              <span className="text-xs font-mono font-bold text-teal-300">{currentPhase.ecg}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
