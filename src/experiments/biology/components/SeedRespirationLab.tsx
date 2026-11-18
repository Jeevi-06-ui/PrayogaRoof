import React, { useState, useMemo, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export const SeedRespirationLab: React.FC = () => {
  const [seedType, setSeedType] = useState<'germinating' | 'boiled' | 'dry'>('germinating');
  const [seedMassG, setSeedMassG] = useState<number>(50);
  const [hasKOH, setHasKOH] = useState<boolean>(true);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Manometer liquid ascent in cm
  const liquidRiseCm = useMemo(() => {
    if (!hasKOH || seedType === 'boiled' || seedType === 'dry') return 0;
    // Respiration rate proportional to seed mass
    const maxRise = (seedMassG / 50) * 8.5;
    const progress = 1 - Math.exp(-0.025 * elapsedMinutes);
    return parseFloat((maxRise * progress).toFixed(1));
  }, [seedType, seedMassG, hasKOH, elapsedMinutes]);

  // Oxygen consumed in mL
  const oxygenConsumedMl = useMemo(() => {
    // 1 cm of capillary ~ 0.5 mL gas displacement
    return parseFloat((liquidRiseCm * 0.45).toFixed(2));
  }, [liquidRiseCm]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setElapsedMinutes((prev) => {
          if (prev >= 120) {
            setIsPlaying(false);
            return 120;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedMinutes(0);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Aerobic Respiration in Germinating Seeds</h3>
            <p className="text-xs text-slate-400">
              Closed respirometer, KOH carbon dioxide absorption, partial vacuum creation, and manometer displacement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Seed Respirometer Setup
            </span>

            {/* Seed Condition */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 font-medium">Seed Condition:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'germinating', label: 'Germinating' },
                  { id: 'boiled', label: 'Boiled Control' },
                  { id: 'dry', label: 'Dry Dormant' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSeedType(s.id as any); handleReset(); }}
                    className={`p-2 rounded-xl text-xs font-medium truncate transition-all ${
                      seedType === s.id
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seed Mass Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Seed Mass:</span>
                <span className="font-mono text-teal-300 font-bold">{seedMassG} g</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={seedMassG}
                onChange={(e) => { setSeedMassG(parseInt(e.target.value, 10)); handleReset(); }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* KOH Tube Presence */}
            <div className="pt-2 border-t border-slate-700">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-900/60 hover:bg-slate-700/40 border border-slate-700 transition-colors">
                <div className="pr-2">
                  <p className="text-xs font-bold text-teal-300">20% KOH Tube Suspended</p>
                  <p className="text-[10px] text-slate-400">Essential for chemical CO2 absorption</p>
                </div>
                <input
                  type="checkbox"
                  checked={hasKOH}
                  onChange={(e) => { setHasKOH(e.target.checked); handleReset(); }}
                  className="rounded text-teal-500 bg-slate-700 border-slate-600 focus:ring-0"
                />
              </label>
            </div>

            {/* Timer Button */}
            <Button
              variant={isPlaying ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full"
              leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {isPlaying ? 'Pause Incubation' : 'Start Respiration Time-Lapse'}
            </Button>
          </div>

          {/* Measurements Status Card */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Elapsed Time:</span>
              <span className="font-mono text-white font-bold">{elapsedMinutes} mins</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Manometer Rise (Δh):</span>
              <span className="font-mono text-teal-300 font-bold text-sm">+{liquidRiseCm} cm</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">O₂ Absorbed:</span>
              <span className="font-mono text-blue-300 font-bold text-sm">{oxygenConsumedMl} mL</span>
            </div>
          </div>
        </div>

        {/* Center: Animated Conical Respirometer Apparatus */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            {/* SVG Respirometer Assembly */}
            <svg viewBox="0 0 450 280" className="w-full h-full max-w-lg">
              {/* Conical Flask */}
              <polygon points="60,240 180,240 140,80 100,80" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
              {/* Airtight Rubber Cork */}
              <rect x="96" y="65" width="48" height="18" rx="2" fill="#78350f" />

              {/* Germinating seeds on flask floor */}
              {Array.from({ length: 18 }, (_, i) => {
                const cx = 85 + (i % 6) * 14;
                const cy = 210 + Math.floor(i / 6) * 10;
                return (
                  <ellipse
                    key={i}
                    cx={cx}
                    cy={cy}
                    rx="5.5"
                    ry="4"
                    fill={seedType === 'germinating' ? '#84cc16' : seedType === 'boiled' ? '#78350f' : '#ca8a04'}
                    stroke="#3f6212"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Suspended Small Test Tube with KOH */}
              {hasKOH && (
                <g transform="translate(112, 100)">
                  <rect x="0" y="0" width="16" height="55" rx="3" fill="#e2e8f0" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="1" y="25" width="14" height="28" rx="2" fill="#38bdf8" fillOpacity="0.7" />
                  <line x1="8" y1="-25" x2="8" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
                </g>
              )}

              {/* Bent Glass Delivery Tube */}
              <path
                d="M 120 65 L 120 30 L 320 30 L 320 220"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Beaker with Colored Liquid at right */}
              <rect x="290" y="160" width="60" height="90" rx="4" fill="#0284c7" fillOpacity="0.2" stroke="#64748b" strokeWidth="2.5" />
              <rect x="292" y="190" width="56" height="58" rx="2" fill="#ef4444" fillOpacity="0.6" />

              {/* Ascending Red Liquid Column in Delivery Tube arm */}
              <path
                d={`M 320 220 L 320 ${Math.max(40, 220 - liquidRiseCm * 20)}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-teal-300">Chemistry of the Respirometer:</strong> Aerobic respiration consumes O₂ and yields CO₂ in equal volume (RQ ≈ 1.0). If unabsorbed, no pressure difference would develop. The suspended potassium hydroxide reacts: 2KOH + CO₂ → K₂CO₃ + H₂O. As CO₂ gas is converted into solid carbonate, the total moles of gas in the enclosed headspace decrease, dropping internal pressure. External atmospheric pressure (P_atm) forces colored water up the vertical tube.
          </div>
        </div>
      </div>
    </div>
  );
};
