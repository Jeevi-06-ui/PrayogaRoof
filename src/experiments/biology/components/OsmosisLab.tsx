import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Play,
  Pause,
} from 'lucide-react';
import {
  evaluateOsmosisSimulation,
  DEFAULT_OSMOSIS_PARAMS,
} from '../models/osmosisModel';
import { OsmosisSimulationParameters } from '../types/biologyTypes';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export const OsmosisLab: React.FC = () => {
  const [setupType, setSetupType] = useState<'potato' | 'thistle'>('potato');
  const [isBoiledControl, setIsBoiledControl] = useState<boolean>(false);
  const [externalSucrosePct, setExternalSucrosePct] = useState<number>(0); // pure water
  const [internalSucrosePct, setInternalSucrosePct] = useState<number>(20); // 20% in cavity
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Convert % sucrose to approximate molarity (20% ~ 0.6M)
  const externalMolar = externalSucrosePct * 0.03;
  const internalMolar = internalSucrosePct * 0.03;

  const simParams: OsmosisSimulationParameters = useMemo(() => ({
    ...DEFAULT_OSMOSIS_PARAMS,
    externalSoluteConcentrationMolar: externalMolar,
    internalSoluteConcentrationMolar: isBoiledControl ? 0.01 : internalMolar,
    reflectionCoefficientSigma: isBoiledControl ? 0.0 : 1.0,
    elapsedTimeSeconds: elapsedMinutes * 60,
  }), [externalMolar, internalMolar, isBoiledControl, elapsedMinutes]);

  const simResult = useMemo(() => {
    return evaluateOsmosisSimulation(simParams);
  }, [simParams]);

  // Liquid height rise in mm
  const liquidRiseMm = useMemo(() => {
    if (isBoiledControl) return 0;
    const maxRise = Math.max(0, (internalMolar - externalMolar) * 35);
    const progress = 1 - Math.exp(-0.03 * elapsedMinutes);
    return Math.round(maxRise * progress);
  }, [internalMolar, externalMolar, elapsedMinutes, isBoiledControl]);

  // Live timer effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedMinutes((prev) => {
          if (prev >= 120) {
            setIsPlaying(false);
            return 120;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedMinutes(0);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Flagship: Osmosis & Cell Water Potential</h3>
              <Badge variant="success" className="text-[11px] bg-teal-950/80 text-teal-300 border-teal-500/40">
                Thermodynamically Validated
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Living potato osmometer, thistle funnel, van &apos;t Hoff water potential, and cellular plasmolysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setSetupType('potato'); handleReset(); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                setupType === 'potato'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Potato Osmometer
            </button>
            <button
              onClick={() => { setSetupType('thistle'); handleReset(); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                setupType === 'thistle'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thistle Funnel
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-slate-300 hover:text-white"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid: Controls + Visual Apparatus + Cell Microscopic State */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Experimental Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Solution Concentrations */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Solution Concentrations
            </span>

            {/* Internal Cavity / Funnel Sucrose */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Internal Sucrose Solution</span>
                <span className="font-mono text-teal-300 font-bold">{internalSucrosePct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={internalSucrosePct}
                onChange={(e) => setInternalSucrosePct(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <span className="text-[10px] text-slate-400">
                Solute potential Ψs: {simResult.waterPotentialInternalMpa.toFixed(2)} MPa
              </span>
            </div>

            {/* External Beaker Solution */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">External Beaker Solution</span>
                <span className="font-mono text-blue-300 font-bold">{externalSucrosePct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={externalSucrosePct}
                onChange={(e) => setExternalSucrosePct(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
              <span className="text-[10px] text-slate-400">
                Water potential Ψw: {simResult.waterPotentialExternalMpa.toFixed(2)} MPa
              </span>
            </div>

            {/* Boiled Potato Control Toggle */}
            {setupType === 'potato' && (
              <div className="pt-2 border-t border-slate-700">
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-900/60 hover:bg-slate-700/40 border border-slate-700 transition-colors">
                  <div className="pr-2">
                    <p className="text-xs font-bold text-amber-300">Boiled Potato Control</p>
                    <p className="text-[10px] text-slate-400">
                      High heat denatures membranes, abolishing selective permeability
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isBoiledControl}
                    onChange={(e) => {
                      setIsBoiledControl(e.target.checked);
                      handleReset();
                    }}
                    className="rounded text-amber-500 bg-slate-700 border-slate-600 focus:ring-0"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Time Controls */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Incubation Time:</span>
              <span className="font-mono text-teal-300 font-bold text-sm">{elapsedMinutes} mins</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isPlaying ? 'outline' : 'primary'}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-full"
                leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {isPlaying ? 'Pause Incubation' : 'Start Incubation (2 hrs)'}
              </Button>
            </div>
          </div>

          {/* Governing Formula Card */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs space-y-2">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Governing Thermodynamic Law
            </span>
            <p className="font-mono text-teal-300 font-bold text-xs">
              Ψ_w = Ψ_s + Ψ_p
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Solute potential: Ψs = -i·C·R·T. Net solvent flux Jv = Lp·ΔΨ. Pure water has highest water potential (0 MPa); solutes lower free energy.
            </p>
          </div>
        </div>

        {/* Center: Dynamic Animated Apparatus Setup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm aspect-square bg-slate-950/80 border border-slate-800 rounded-3xl p-6 relative flex flex-col items-center justify-center shadow-inner overflow-hidden">
            {setupType === 'potato' ? (
              /* Potato Tuber Cavity Visualizer */
              <div className="relative w-full h-full flex flex-col items-center justify-end pb-4">
                {/* Outer Glass Petri Dish with Distilled Water */}
                <div className="w-64 h-16 border-b-4 border-x-4 border-slate-600 rounded-b-3xl bg-sky-500/10 relative flex items-end justify-center">
                  {/* Beaker water level */}
                  <div className="w-full h-8 bg-sky-400/20 rounded-b-2xl" />
                  <span className="absolute bottom-1 text-[10px] text-sky-300 font-mono">
                    Pure Distilled Water (Ψ = 0 MPa)
                  </span>
                </div>

                {/* Potato Tuber Block inside Petri dish */}
                <div
                  className={`w-44 h-48 rounded-2xl border-4 ${
                    isBoiledControl ? 'bg-amber-900/60 border-amber-800' : 'bg-amber-700/60 border-amber-600'
                  } absolute bottom-8 flex flex-col items-center justify-start pt-3 shadow-lg`}
                >
                  <span className="text-[10px] font-bold text-amber-200">
                    {isBoiledControl ? 'Boiled Dead Potato' : 'Living Potato Tissue'}
                  </span>

                  {/* Carved Cavity inside potato */}
                  <div className="w-28 h-32 rounded-b-2xl border-2 border-slate-900 bg-slate-950/90 relative flex flex-col justify-end p-1 mt-1 overflow-hidden">
                    {/* Liquid fill in cavity with animated meniscus rise */}
                    <div
                      className="w-full rounded-b-xl bg-teal-500/50 border-t-2 border-teal-300 transition-all duration-300 relative"
                      style={{
                        height: `${Math.min(95, 25 + liquidRiseMm * 3)}%`,
                      }}
                    >
                      {/* Insertion marking pin at initial level */}
                      <div className="absolute bottom-6 left-0 right-0 h-[1.5px] bg-red-500 flex items-center justify-end pr-1">
                        <span className="text-[8px] text-red-300 font-mono">Initial</span>
                      </div>
                    </div>

                    <div className="absolute top-2 inset-x-0 text-center text-[10px] text-teal-300 font-mono font-bold">
                      +{liquidRiseMm} mm
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Thistle Funnel Osmometer Visualizer */
              <div className="relative w-full h-full flex flex-col items-center justify-end pb-4">
                {/* Beaker with water */}
                <div className="w-56 h-36 border-b-4 border-x-4 border-slate-600 rounded-b-2xl bg-sky-500/10 relative flex items-end">
                  <div className="w-full h-24 bg-sky-400/20 rounded-b-xl" />
                </div>

                {/* Inverted Thistle Funnel with long capillary stem */}
                <div className="absolute bottom-10 flex flex-col items-center">
                  {/* Long Capillary stem */}
                  <div className="w-4 h-44 border-x-2 border-slate-400 bg-slate-900/40 relative flex flex-col justify-end">
                    {/* Liquid rise up the capillary */}
                    <div
                      className="w-full bg-teal-500/70 border-t-2 border-teal-300 transition-all duration-300"
                      style={{ height: `${Math.min(95, 10 + liquidRiseMm * 4)}%` }}
                    />
                  </div>
                  {/* Bell-shaped bulb */}
                  <div className="w-24 h-16 rounded-b-full border-2 border-slate-400 bg-teal-500/40 border-t-0 flex items-end justify-center pb-1">
                    <span className="text-[9px] text-teal-200 font-mono">Parchment</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm mt-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
            <span className="text-slate-400">Net Volume Ascent:</span>
            <span className="font-mono text-teal-300 font-bold text-base">
              +{liquidRiseMm} mm
            </span>
          </div>
        </div>

        {/* Right Column: Microscopic Cell Response */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cellular Microscopic State
            </span>

            {/* Plant Cell Morphological Diagram */}
            <div className="w-full aspect-square bg-slate-950 rounded-2xl border border-slate-700 flex items-center justify-center p-4 relative overflow-hidden">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Rigid Cellulosic Cell Wall */}
                <rect x="25" y="25" width="150" height="150" rx="8" fill="none" stroke="#ca8a04" strokeWidth="4" />

                {/* Plasma membrane & protoplast (shrinks during plasmolysis) */}
                <rect
                  x={simResult.plantCellState === 'plasmolysed' ? 45 : 30}
                  y={simResult.plantCellState === 'plasmolysed' ? 45 : 30}
                  width={simResult.plantCellState === 'plasmolysed' ? 110 : 140}
                  height={simResult.plantCellState === 'plasmolysed' ? 110 : 140}
                  rx="6"
                  fill="#10b981"
                  fillOpacity={simResult.plantCellState === 'turgid' ? 0.7 : 0.4}
                  stroke="#059669"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />

                {/* Central Vacuole */}
                <ellipse
                  cx="100"
                  cy="100"
                  rx={simResult.plantCellState === 'turgid' ? 50 : simResult.plantCellState === 'plasmolysed' ? 25 : 40}
                  ry={simResult.plantCellState === 'turgid' ? 45 : simResult.plantCellState === 'plasmolysed' ? 22 : 35}
                  fill="#bae6fd"
                  fillOpacity="0.8"
                  className="transition-all duration-500"
                />

                {/* Nucleus */}
                <circle
                  cx={simResult.plantCellState === 'plasmolysed' ? 65 : 48}
                  cy={simResult.plantCellState === 'plasmolysed' ? 65 : 48}
                  r="10"
                  fill="#b91c1c"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Cell Status:</span>
                <span className="font-bold text-teal-300 capitalize">{simResult.plantCellState}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tonicity:</span>
                <span className="font-bold text-blue-300 capitalize">{simResult.tonicity}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Turgor Pressure:</span>
                <span className="font-mono text-emerald-400 font-bold">{simResult.turgorPressureBar.toFixed(1)} bar</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              {simResult.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
