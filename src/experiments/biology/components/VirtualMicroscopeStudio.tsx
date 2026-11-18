import React, { useState, useMemo } from 'react';
import {
  Microscope,
  Eye,
  Sliders,
  Sun,
  Camera,
  Info,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  Droplets,
  Move,
} from 'lucide-react';
import {
  SLIDE_CATALOG,
  OBJECTIVE_SPECS,
  calculateFocalBlur,
} from '../models/microscopeEngine';
import {
  MicroscopeObjectiveMagnification,
  VirtualMicroscopeState,
  MicroscopeSlideSpecimen,
} from '../types/biologyTypes';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

interface VirtualMicroscopeStudioProps {
  initialSlideId?: string;
  onTakeSnapshot?: (imageUrl: string, notes: string) => void;
  className?: string;
}

export const VirtualMicroscopeStudio: React.FC<VirtualMicroscopeStudioProps> = ({
  initialSlideId = 'onion-peel',
  onTakeSnapshot,
  className = '',
}) => {
  const [selectedSlideId, setSelectedSlideId] = useState<string>(initialSlideId);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showScaleBar, setShowScaleBar] = useState<boolean>(true);
  const [selectedOrganelleId, setSelectedOrganelleId] = useState<string | null>(null);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);

  const [microscopeState, setMicroscopeState] = useState<VirtualMicroscopeState>({
    currentSlideId: initialSlideId,
    eyepieceMagnification: 10,
    activeObjective: '10x',
    coarseFocus: 50,
    fineFocus: 50,
    stageX: 0,
    stageY: 0,
    irisDiaphragmPercent: 80,
    lightIntensityPercent: 85,
    isOilApplied: false,
    activeStain: 'safranin',
    isSlideSecured: true,
  });

  const activeSpecimen: MicroscopeSlideSpecimen = useMemo(() => {
    return (
      SLIDE_CATALOG.find((s) => s.id === selectedSlideId) ||
      SLIDE_CATALOG[0]
    );
  }, [selectedSlideId]);

  // Optical calculations
  const objectiveSpec = OBJECTIVE_SPECS[microscopeState.activeObjective];
  const totalMagnification = microscopeState.eyepieceMagnification * parseInt(objectiveSpec.power, 10);
  const opticalAnalysis = useMemo(() => {
    return calculateFocalBlur(microscopeState, activeSpecimen);
  }, [microscopeState, activeSpecimen]);

  const handleObjectiveChange = (power: MicroscopeObjectiveMagnification) => {
    setMicroscopeState((prev) => ({
      ...prev,
      activeObjective: power,
    }));
  };

  const handleSlideChange = (slideId: string) => {
    setSelectedSlideId(slideId);
    const targetSpecimen = SLIDE_CATALOG.find((s) => s.id === slideId);
    if (targetSpecimen) {
      setMicroscopeState((prev) => ({
        ...prev,
        currentSlideId: slideId,
        activeStain: targetSpecimen.recommendedStain,
        coarseFocus: targetSpecimen.idealFocalPlaneZ,
        fineFocus: 50,
        stageX: 0,
        stageY: 0,
      }));
    }
    setSelectedOrganelleId(null);
  };

  const handleResetFocus = () => {
    setMicroscopeState((prev) => ({
      ...prev,
      coarseFocus: activeSpecimen.idealFocalPlaneZ,
      fineFocus: 50,
      stageX: 0,
      stageY: 0,
      irisDiaphragmPercent: 80,
      lightIntensityPercent: 85,
    }));
  };

  const handleCaptureSnapshot = () => {
    const summary = `${activeSpecimen.commonName} under ${totalMagnification}x magnification (${microscopeState.activeObjective} objective). Focus: ${opticalAnalysis.isFocused ? 'In Sharp Focus' : 'Suboptimal'}. Stain: ${microscopeState.activeStain}.`;
    if (onTakeSnapshot) {
      onTakeSnapshot('', summary);
    }
    setSnapshotFeedback('Snapshot captured & logged to Observation Sheet!');
    setTimeout(() => setSnapshotFeedback(null), 3000);
  };

  // Compute specimen visual representation based on stain affinity and focus blur
  const stainFilterStyle = useMemo(() => {
    const stain = microscopeState.activeStain;
    let hueRotate = 0;
    let saturate = 1;
    let brightness = microscopeState.lightIntensityPercent / 90;
    const contrast = (microscopeState.irisDiaphragmPercent / 70);

    if (stain === 'safranin') {
      hueRotate = 330;
      saturate = 1.4;
    } else if (stain === 'methylene-blue') {
      hueRotate = 210;
      saturate = 1.6;
    } else if (stain === 'acetocarmine') {
      hueRotate = 345;
      saturate = 1.8;
    } else if (stain === 'iodine') {
      hueRotate = 40;
      saturate = 1.3;
    } else if (stain === 'unstained') {
      saturate = 0.2;
      brightness *= 1.1;
    }

    return {
      filter: `blur(${opticalAnalysis.blurPx}px) hue-rotate(${hueRotate}deg) saturate(${saturate}) brightness(${brightness}) contrast(${contrast})`,
    };
  }, [microscopeState, opticalAnalysis.blurPx]);

  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col p-6' : 'p-6 space-y-6'
      } ${className}`}
    >
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Virtual Microscope Studio</h3>
              <Badge variant="primary" className="bg-emerald-950/80 text-emerald-300 border-emerald-500/40 text-[11px]">
                DIN Achromatic Optics
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 4x-100x optical immersion field with focal plane depth convolution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFocus}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-slate-300 hover:text-white"
          >
            Auto-Center Focus
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCaptureSnapshot}
            leftIcon={<Camera className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Capture Slide
          </Button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Microscope'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {snapshotFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{snapshotFeedback}</span>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Column: Slide Selection & Lens Turret */}
        <div className="lg:col-span-3 space-y-4">
          {/* Specimen Slide Selector */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Specimen Slide
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {SLIDE_CATALOG.length} Slides Available
              </span>
            </div>

            <div className="space-y-1.5">
              {SLIDE_CATALOG.map((slide) => {
                const isSelected = slide.id === selectedSlideId;
                return (
                  <button
                    key={slide.id}
                    onClick={() => handleSlideChange(slide.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate">{slide.commonName}</p>
                      <p className="text-[10px] text-slate-400 italic truncate font-sans">
                        {slide.scientificName}
                      </p>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Objective Lens Turret */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Objective Turret
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Total: {totalMagnification}x
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['4x', '10x', '40x', '100x'] as MicroscopeObjectiveMagnification[]).map((power) => {
                const spec = OBJECTIVE_SPECS[power];
                const isActive = microscopeState.activeObjective === power;
                return (
                  <button
                    key={power}
                    onClick={() => handleObjectiveChange(power)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md'
                        : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: spec.colorRing }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black">{power}</span>
                      <span className="text-[10px] font-mono text-slate-400">NA {spec.numericalAperture}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      FOV {spec.fieldOfViewDiameterUm} μm
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Oil Immersion Warning / Toggle for 100x */}
            {microscopeState.activeObjective === '100x' && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cedarwood Immersion Oil</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  100x objective requires immersion oil (n=1.515) to eliminate air refraction and achieve NA 1.25.
                </p>
                <button
                  onClick={() =>
                    setMicroscopeState((prev) => ({ ...prev, isOilApplied: !prev.isOilApplied }))
                  }
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                    microscopeState.isOilApplied
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  {microscopeState.isOilApplied ? 'Immersion Oil Applied ✓' : 'Apply Immersion Oil'}
                </button>
              </div>
            )}
          </div>

          {/* Biological Stain Selector */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Differential Stain
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'safranin', label: 'Safranin O (Pink)' },
                  { id: 'methylene-blue', label: 'Methylene Blue' },
                  { id: 'acetocarmine', label: 'Acetocarmine' },
                  { id: 'iodine', label: "Lugol's Iodine" },
                  { id: 'unstained', label: 'Unstained Native' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() =>
                    setMicroscopeState((prev) => ({
                      ...prev,
                      activeStain: st.id,
                    }))
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-colors ${
                    microscopeState.activeStain === st.id
                      ? 'bg-slate-700 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Circular Optical Viewport */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-4">
          {/* Eyepiece Viewport Container */}
          <div className="relative w-full max-w-[420px] aspect-square rounded-full border-8 border-slate-950 bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-2">
            {/* Circular Optical Aperture */}
            <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-800 flex items-center justify-center">
              {/* Outer Vignette Shadow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] z-20 pointer-events-none" />

              {/* Specimen Cellular Simulation Canvas */}
              <div
                className="relative w-[130%] h-[130%] transition-transform duration-100 flex items-center justify-center"
                style={{
                  ...stainFilterStyle,
                  transform: `translate(${microscopeState.stageX}px, ${microscopeState.stageY}px) scale(${
                    totalMagnification / 100
                  })`,
                }}
              >
                {/* Specimen Base Morphological Render */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full pointer-events-auto"
                  style={{ backgroundColor: activeSpecimen.baseColor }}
                >
                  {/* Cellular Pattern based on tissue type */}
                  {activeSpecimen.tissueType === 'onion-peel' && (
                    <g stroke="#ca8a04" strokeWidth="2.5" fill="none">
                      {/* Brick-like hexagonal plant cells */}
                      <polygon points="50,40 160,35 170,120 60,125" fill="#fef9c3" fillOpacity="0.6" />
                      <polygon points="160,35 280,30 290,115 170,120" fill="#fef9c3" fillOpacity="0.7" />
                      <polygon points="280,30 380,35 390,115 290,115" fill="#fef9c3" fillOpacity="0.6" />
                      <polygon points="40,120 150,115 160,200 50,205" fill="#fef08a" fillOpacity="0.7" />
                      <polygon points="150,115 270,110 280,195 160,200" fill="#fef08a" fillOpacity="0.8" />
                      <polygon points="270,110 385,115 395,200 280,195" fill="#fef08a" fillOpacity="0.7" />
                      <polygon points="50,205 160,200 170,285 60,290" fill="#fef9c3" fillOpacity="0.6" />
                      <polygon points="160,200 280,195 290,280 170,285" fill="#fef9c3" fillOpacity="0.7" />
                      <polygon points="280,195 380,200 390,285 290,280" fill="#fef9c3" fillOpacity="0.6" />
                      <polygon points="40,290 150,285 160,370 50,375" fill="#fef08a" fillOpacity="0.7" />
                      <polygon points="150,285 270,280 280,365 160,370" fill="#fef08a" fillOpacity="0.8" />
                      <polygon points="270,280 385,285 395,370 280,365" fill="#fef08a" fillOpacity="0.7" />
                    </g>
                  )}

                  {activeSpecimen.tissueType === 'human-cheek-epithelial' && (
                    <g>
                      {/* Squamous cells with rounded irregular boundaries */}
                      <path
                        d="M 120 180 Q 150 140 220 150 Q 280 170 270 240 Q 240 290 180 280 Q 110 260 120 180 Z"
                        fill="#bae6fd"
                        fillOpacity="0.7"
                        stroke="#0284c7"
                        strokeWidth="2"
                      />
                      <path
                        d="M 230 110 Q 270 90 320 110 Q 360 140 340 190 Q 300 220 260 200 Q 220 160 230 110 Z"
                        fill="#bae6fd"
                        fillOpacity="0.5"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {activeSpecimen.tissueType === 'plant-epidermis' && (
                    <g>
                      {/* Sinuous epidermal pavement cells */}
                      <path
                        d="M 50 100 Q 90 70 140 100 Q 180 130 150 180 Q 100 190 70 160 Z"
                        fill="#d1fae5"
                        stroke="#059669"
                        strokeWidth="2"
                      />
                      {/* Stomatal Complex */}
                      <g transform="translate(160, 160)">
                        {/* Subsidiary / Guard cells pair */}
                        <path
                          d="M 30 10 C 10 10, 10 70, 30 70 C 22 50, 22 30, 30 10 Z"
                          fill="#10b981"
                          stroke="#047857"
                          strokeWidth="2"
                        />
                        <path
                          d="M 50 10 C 70 10, 70 70, 50 70 C 58 50, 58 30, 50 10 Z"
                          fill="#10b981"
                          stroke="#047857"
                          strokeWidth="2"
                        />
                        {/* Stomatal Pore Aperture */}
                        <ellipse cx="40" cy="40" rx="4" ry="18" fill="#064e3b" />
                        {/* Chloroplasts inside guard cells */}
                        <circle cx="22" cy="25" r="2.5" fill="#047857" />
                        <circle cx="20" cy="40" r="2.5" fill="#047857" />
                        <circle cx="24" cy="55" r="2.5" fill="#047857" />
                        <circle cx="58" cy="25" r="2.5" fill="#047857" />
                        <circle cx="60" cy="40" r="2.5" fill="#047857" />
                        <circle cx="56" cy="55" r="2.5" fill="#047857" />
                      </g>
                    </g>
                  )}

                  {activeSpecimen.tissueType === 'root-tip-mitosis' && (
                    <g>
                      {/* Proliferating meristem cells */}
                      <rect x="80" y="80" width="80" height="70" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />
                      <rect x="170" y="80" width="80" height="70" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />
                      <rect x="260" y="80" width="80" height="70" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />
                      <rect x="80" y="160" width="80" height="70" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />
                      <rect x="170" y="160" width="80" height="70" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />
                      <rect x="260" y="160" width="80" height="70" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />
                      {/* Chromosomes in Metaphase & Anaphase */}
                      <g transform="translate(190, 180)">
                        <line x1="20" y1="10" x2="20" y2="40" stroke="#9f1239" strokeWidth="4" />
                        <line x1="24" y1="12" x2="24" y2="38" stroke="#9f1239" strokeWidth="4" />
                        <line x1="16" y1="12" x2="16" y2="38" stroke="#9f1239" strokeWidth="4" />
                      </g>
                    </g>
                  )}

                  {activeSpecimen.tissueType === 'blood-smear' && (
                    <g>
                      {/* Multiple biconcave RBC disks */}
                      {[
                        [100, 120], [140, 110], [180, 130], [120, 160], [240, 140],
                        [280, 160], [110, 220], [150, 240], [210, 210], [260, 230],
                        [190, 280], [240, 290], [130, 310], [290, 290], [90, 270],
                      ].map(([cx, cy], i) => (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="14" fill="#fca5a5" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx={cx} cy={cy} r="6" fill="#fecaca" />
                        </g>
                      ))}
                      {/* Multilobed Neutrophil */}
                      <circle cx="200" cy="160" r="22" fill="#e9d5ff" stroke="#7c3aed" strokeWidth="2" />
                      <circle cx="192" cy="154" r="7" fill="#6d28d9" />
                      <circle cx="208" cy="154" r="7" fill="#6d28d9" />
                      <circle cx="200" cy="168" r="6" fill="#6d28d9" />
                    </g>
                  )}

                  {/* Organelle Interactive Hotspots */}
                  {showHotspots &&
                    activeSpecimen.organelles.map((organelle) => {
                      const isSelected = selectedOrganelleId === organelle.id;
                      const cx = (organelle.xPct / 100) * 400;
                      const cy = (organelle.yPct / 100) * 400;
                      return (
                        <g
                          key={organelle.id}
                          className="cursor-pointer group"
                          onClick={() => setSelectedOrganelleId(organelle.id)}
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={organelle.radiusUm * 0.75}
                            fill={organelle.color}
                            fillOpacity={isSelected ? 0.9 : 0.6}
                            stroke={isSelected ? '#38bdf8' : '#ffffff'}
                            strokeWidth={isSelected ? 3 : 1.5}
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={organelle.radiusUm * 0.75 + 4}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            className="animate-spin-slow opacity-80"
                          />
                        </g>
                      );
                    })}
                </svg>
              </div>

              {/* Reticle / Field Crosshairs Overlay */}
              <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-30">
                <div className="w-full h-[0.5px] bg-slate-300" />
                <div className="h-full w-[0.5px] bg-slate-300 absolute" />
                <div className="w-24 h-24 rounded-full border border-slate-300 absolute" />
              </div>

              {/* Focus Quality Badge Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                <div
                  className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md border ${
                    opticalAnalysis.isFocused
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : opticalAnalysis.blurPx < 5
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-red-500/20 text-red-300 border-red-500/50'
                  }`}
                >
                  {opticalAnalysis.isFocused ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sharp Focus ({opticalAnalysis.opticalResolutionUm.toFixed(2)} μm)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        {opticalAnalysis.blurPx < 5 ? 'Approaching Focal Plane' : 'Out of Focus'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Calibrated Micrometer Scale Bar Overlay */}
              {showScaleBar && (
                <div className="absolute top-4 right-4 z-30 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300 flex flex-col items-center">
                  <div className="w-16 h-1 bg-white mb-0.5 rounded-full" />
                  <span>
                    {Math.round(objectiveSpec.fieldOfViewDiameterUm / 8)} μm
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stage XY Pan D-Pad */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Move className="w-3.5 h-3.5 text-slate-400" />
            <span>Stage Pan:</span>
            <button
              onClick={() => setMicroscopeState((prev) => ({ ...prev, stageX: prev.stageX - 15 }))}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              ←
            </button>
            <button
              onClick={() => setMicroscopeState((prev) => ({ ...prev, stageY: prev.stageY - 15 }))}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              ↑
            </button>
            <button
              onClick={() => setMicroscopeState((prev) => ({ ...prev, stageY: prev.stageY + 15 }))}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              ↓
            </button>
            <button
              onClick={() => setMicroscopeState((prev) => ({ ...prev, stageX: prev.stageX + 15 }))}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
            >
              →
            </button>
            <button
              onClick={() => setMicroscopeState((prev) => ({ ...prev, stageX: 0, stageY: 0 }))}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 text-[10px]"
            >
              Center
            </button>
          </div>
        </div>

        {/* Right Column: Coarse/Fine Focus Knobs & Substage Illumination */}
        <div className="lg:col-span-3 space-y-4">
          {/* Focal Knobs Controls */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Focus Mechanism
            </span>

            {/* Coarse Focus Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Coarse Focus</span>
                <span className="font-mono text-slate-400">{microscopeState.coarseFocus}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={microscopeState.coarseFocus}
                onChange={(e) =>
                  setMicroscopeState((prev) => ({
                    ...prev,
                    coarseFocus: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Fine Focus Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Fine Focus Knob</span>
                <span className="font-mono text-slate-400">{microscopeState.fineFocus}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={microscopeState.fineFocus}
                onChange={(e) =>
                  setMicroscopeState((prev) => ({
                    ...prev,
                    fineFocus: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Substage Illumination & Iris Diaphragm */}
            <div className="pt-2 border-t border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Substage Lamp
                </span>
                <span className="font-mono text-slate-400">
                  {microscopeState.lightIntensityPercent}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                value={microscopeState.lightIntensityPercent}
                onChange={(e) =>
                  setMicroscopeState((prev) => ({
                    ...prev,
                    lightIntensityPercent: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Iris Diaphragm</span>
                <span className="font-mono text-slate-400">
                  {microscopeState.irisDiaphragmPercent}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={microscopeState.irisDiaphragmPercent}
                onChange={(e) =>
                  setMicroscopeState((prev) => ({
                    ...prev,
                    irisDiaphragmPercent: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            {/* Hotspots & Scale Bar Toggles */}
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                  className="rounded text-emerald-500 bg-slate-700 border-slate-600 focus:ring-0"
                />
                <span>Hotspots</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showScaleBar}
                  onChange={(e) => setShowScaleBar(e.target.checked)}
                  className="rounded text-emerald-500 bg-slate-700 border-slate-600 focus:ring-0"
                />
                <span>Scale Bar</span>
              </label>
            </div>
          </div>

          {/* Active Organelle Info Card */}
          {selectedOrganelleId ? (
            (() => {
              const organelle = activeSpecimen.organelles.find((o) => o.id === selectedOrganelleId);
              if (!organelle) return null;
              return (
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/40 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">{organelle.name}</span>
                    <button
                      onClick={() => setSelectedOrganelleId(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {organelle.scientificDescription}
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                    <span>Radius: ~{organelle.radiusUm} μm</span>
                    <span>•</span>
                    <span>Stain Affinity: {organelle.stainAffinity}</span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>Click on any highlighted cellular structure in the circular field of view to inspect diagnostic morphology.</span>
            </div>
          )}
        </div>
      </div>

      {/* Morphological Notes & Diagnostic Criteria Card */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Diagnostic Identification Criteria — {activeSpecimen.commonName}
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {activeSpecimen.curriculumChapter}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{activeSpecimen.morphologyNote}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
          {activeSpecimen.diagnosticFeatures.map((feat, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
