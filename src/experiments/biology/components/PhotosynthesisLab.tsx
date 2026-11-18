import React, { useState, useMemo } from 'react';
import {
  Sun,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export const PhotosynthesisLab: React.FC = () => {
  const [lightLux, setLightLux] = useState<number>(1200);
  const [bicarbonatePct, setBicarbonatePct] = useState<number>(0.5);
  const [temperatureC, setTemperatureC] = useState<number>(25);
  const [testSplinterDone, setTestSplinterDone] = useState<boolean>(false);

  // Oxygen bubble evolution rate (bubbles per minute) following Blackman's Law
  const bubblesPerMin = useMemo(() => {
    // Light factor (photochemical Hill reaction)
    const lightFactor = Math.min(1.0, lightLux / 1500);

    // CO2 factor (Calvin cycle Rubisco substrate)
    const co2Factor = Math.min(1.0, bicarbonatePct / 0.8);

    // Temperature factor (enzymatic optimum around 28-32°C)
    const tempFactor =
      temperatureC < 10 || temperatureC > 45
        ? 0.1
        : Math.exp(-Math.pow(temperatureC - 30, 2) / 120);

    // Rate determined by the most limiting factor
    const limitingRate = Math.min(lightFactor, co2Factor) * tempFactor * 42;
    return Math.max(1, Math.round(limitingRate));
  }, [lightLux, bicarbonatePct, temperatureC]);

  const handleReset = () => {
    setLightLux(1200);
    setBicarbonatePct(0.5);
    setTemperatureC(25);
    setTestSplinterDone(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Photosynthesis & Limiting Factors (Hydrilla)</h3>
            <p className="text-xs text-slate-400">
              Photochemical oxygen evolution, Blackman&apos;s Law of Limiting Factors, and glowing splint test
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
        {/* Left: Experimental Variables */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Limiting Factors Controls
            </span>

            {/* Light Intensity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Light Intensity (Lux):
                </span>
                <span className="font-mono text-amber-300 font-bold">{lightLux} Lux</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="100"
                value={lightLux}
                onChange={(e) => setLightLux(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* NaHCO3 (CO2) Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Sodium Bicarbonate (CO₂ Source):</span>
                <span className="font-mono text-teal-300 font-bold">{bicarbonatePct}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={bicarbonatePct}
                onChange={(e) => setBicarbonatePct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Water Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Water Temperature:</span>
                <span className="font-mono text-blue-300 font-bold">{temperatureC}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="1"
                value={temperatureC}
                onChange={(e) => setTemperatureC(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            {/* Glowing Splint Test */}
            <div className="pt-2 border-t border-slate-700">
              <Button
                variant={testSplinterDone ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setTestSplinterDone(true)}
                className="w-full"
                leftIcon={<Flame className="w-3.5 h-3.5 text-amber-400" />}
              >
                {testSplinterDone ? 'Splint Reignited Burst! (Confirmed O₂)' : 'Test Gas with Glowing Splint'}
              </Button>
            </div>
          </div>

          {/* Measurements Status */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Rate of Photosynthesis:</span>
              <span className="font-mono text-teal-300 font-bold text-base">
                {bubblesPerMin} bubbles / min
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Limiting Factor:</span>
              <Badge variant="warning" className="text-[10px]">
                {lightLux < 800 ? 'Light Intensity' : bicarbonatePct < 0.3 ? 'CO₂ Availability' : temperatureC < 18 ? 'Low Temperature' : 'Light Saturated'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Center: Inverted Funnel & Hydrilla Beaker Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            <svg viewBox="0 0 400 300" className="w-full h-full max-w-md">
              {/* Beaker with water */}
              <rect x="100" y="80" width="200" height="190" rx="6" fill="#0284c7" fillOpacity="0.2" stroke="#64748b" strokeWidth="3" />
              {/* Water surface line */}
              <line x1="100" y1="100" x2="300" y2="100" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />

              {/* Inverted Funnel over Hydrilla */}
              <polygon points="130,240 270,240 206,120 194,120" fill="#e2e8f0" fillOpacity="0.3" stroke="#94a3b8" strokeWidth="2" />
              {/* Funnel Stem */}
              <rect x="194" y="60" width="12" height="60" fill="#e2e8f0" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="2" />

              {/* Inverted Test Tube collecting gas over funnel stem */}
              <rect x="188" y="20" width="24" height="100" rx="4" fill="#38bdf8" fillOpacity="0.3" stroke="#cbd5e1" strokeWidth="2" />
              {/* Gas collection pocket at closed top of tube */}
              <rect x="190" y="22" width="20" height="25" rx="2" fill="#f8fafc" fillOpacity="0.8" />
              <text x="200" y="38" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">O₂</text>

              {/* Hydrilla verticillata sprigs under the funnel */}
              <g stroke="#15803d" strokeWidth="3" strokeLinecap="round">
                <line x1="160" y1="235" x2="195" y2="170" />
                <line x1="240" y1="235" x2="205" y2="170" />
                <line x1="200" y1="238" x2="200" y2="165" />
                {/* Hydrilla whorled leaves */}
                <ellipse cx="175" cy="200" rx="8" ry="3" fill="#16a34a" />
                <ellipse cx="185" cy="185" rx="8" ry="3" fill="#16a34a" />
                <ellipse cx="225" cy="200" rx="8" ry="3" fill="#16a34a" />
                <ellipse cx="215" cy="185" rx="8" ry="3" fill="#16a34a" />
              </g>

              {/* Animated Rising Oxygen Gas Bubbles */}
              {Array.from({ length: Math.min(8, Math.ceil(bubblesPerMin / 5)) }, (_, i) => (
                <circle
                  key={i}
                  cx={197 + ((i % 3) - 1) * 3}
                  cy={150 - i * 15}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  className="animate-bounce opacity-80"
                />
              ))}

              {/* Glowing splinter flame burst if active */}
              {testSplinterDone && (
                <g transform="translate(200, 15)">
                  <line x1="-15" y1="-25" x2="0" y2="0" stroke="#78350f" strokeWidth="3" />
                  <circle cx="0" cy="0" r="10" fill="#f59e0b" className="animate-ping" />
                  <circle cx="0" cy="0" r="6" fill="#ef4444" />
                </g>
              )}
            </svg>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-teal-300">Blackman’s Principle of Limiting Factors (1905):</strong> &quot;When a process is conditioned as to its rapidity by a number of separate factors, the rate of the process is limited by the pace of the slowest factor.&quot; Increasing lamp irradiance increases $O_2$ bubble rate until dissolved bicarbonate or enzymatic temperature limits carbon fixation.
          </div>
        </div>
      </div>
    </div>
  );
};
