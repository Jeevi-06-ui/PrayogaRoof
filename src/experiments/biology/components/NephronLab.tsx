import React, { useState, useMemo } from 'react';
import {
  Droplets,
} from 'lucide-react';
import { Badge } from '../../../components/shared/Badge';

export const NephronLab: React.FC = () => {
  const [hydrationLevel, setHydrationLevel] = useState<'normal' | 'dehydrated' | 'overhydrated'>('normal');
  const [afferentDiameterMm, setAfferentDiameterMm] = useState<number>(50); // um
  const [selectedSegment, setSelectedSegment] = useState<'glomerulus' | 'pct' | 'henle' | 'dct' | 'collecting'>('glomerulus');

  // GFR Calculation based on Net Filtration Pressure
  // GHP ~ 60 mmHg, BCOP ~ 32 mmHg, CHP ~ 18 mmHg -> NFP = 10 mmHg
  const nfpMmHg = useMemo(() => {
    const ghp = 50 + (afferentDiameterMm / 50) * 10;
    return Math.round(ghp - (32 + 18));
  }, [afferentDiameterMm]);

  const gfrMlMin = Math.round(nfpMmHg * 12.5);

  const adhLevel = hydrationLevel === 'dehydrated' ? 'High ADH (Vasopressin Peak)' : hydrationLevel === 'overhydrated' ? 'Suppressed ADH' : 'Normal Baseline ADH';
  const urineOsmolarity = hydrationLevel === 'dehydrated' ? 1200 : hydrationLevel === 'overhydrated' ? 80 : 300;
  const urineVolumeLDay = hydrationLevel === 'dehydrated' ? 0.6 : hydrationLevel === 'overhydrated' ? 4.5 : 1.5;

  const segmentDescriptions: Record<string, { name: string; osmolarity: string; transport: string }> = {
    glomerulus: {
      name: 'Glomerulus & Bowman’s Capsule',
      osmolarity: '300 mOsm/L (Isosmotic to blood plasma)',
      transport: 'Non-selective ultrafiltration of water, glucose, urea, and electrolytes through podocyte filtration slits under 10 mmHg NFP.',
    },
    pct: {
      name: 'Proximal Convoluted Tubule (PCT)',
      osmolarity: '300 mOsm/L (Isosmotic fluid reabsorption)',
      transport: 'Simple cuboidal brush border epithelium reabsorbs 65-70% water, 100% glucose & amino acids via Na+/glucose symporters and active ATP pumps.',
    },
    henle: {
      name: 'Loop of Henle (Countercurrent Multiplier)',
      osmolarity: '300 → 1200 → 200 mOsm/L',
      transport: 'Descending limb loses water; ascending limb actively expels Na+ and Cl- into medullary interstitium, building the osmotic gradient.',
    },
    dct: {
      name: 'Distal Convoluted Tubule (DCT)',
      osmolarity: '200 mOsm/L (Hypotonic)',
      transport: 'Conditional reabsorption of Na+ and water under aldosterone regulation; active tubular secretion of K+, H+, and NH4+.',
    },
    collecting: {
      name: 'Collecting Duct (Medullary Concentration)',
      osmolarity: `${urineOsmolarity} mOsm/L (Final Urine)`,
      transport: 'Aquaporin-2 channels inserted by ADH allow massive water reabsorption into the hypertonic medulla, yielding concentrated urine.',
    },
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nephron Physiology & Countercurrent Mechanism</h3>
            <p className="text-xs text-slate-400">
              Glomerular ultrafiltration (GFR), PCT obligate reabsorption, Henle medullary gradient, and ADH control
            </p>
          </div>
        </div>

        <Badge variant="primary" className="bg-teal-950/80 text-teal-300 border-teal-500/40">
          Renal Countercurrent System
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Physiological Parameters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hydration & Hormonal Regulators
            </span>

            {/* Hydration State Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300">Systemic Hydration State:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'normal', label: 'Euhydrated' },
                    { id: 'dehydrated', label: 'Dehydrated' },
                    { id: 'overhydrated', label: 'Water Excess' },
                  ] as const
                ).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setHydrationLevel(h.id)}
                    className={`p-2 rounded-xl text-xs font-medium transition-all ${
                      hydrationLevel === h.id
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Afferent Arteriole Diameter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Afferent Arteriole Diameter:</span>
                <span className="font-mono text-teal-300 font-bold">{afferentDiameterMm} μm</span>
              </div>
              <input
                type="range"
                min="35"
                max="65"
                step="1"
                value={afferentDiameterMm}
                onChange={(e) => setAfferentDiameterMm(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          </div>

          {/* Filtration & Urine Output Metrics */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Net Filtration Pressure:</span>
              <span className="font-mono text-teal-300 font-bold">{nfpMmHg} mmHg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Glomerular Filtration Rate:</span>
              <span className="font-mono text-emerald-400 font-bold">{gfrMlMin} mL/min (~180 L/day)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ADH (Vasopressin):</span>
              <span className="font-bold text-amber-300">{adhLevel}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-700">
              <span className="text-slate-400">Final Urine Output:</span>
              <span className="font-mono text-cyan-300 font-bold">{urineVolumeLDay} L/day ({urineOsmolarity} mOsm/L)</span>
            </div>
          </div>
        </div>

        {/* Center: Anatomical Nephron Schematic with Osmotic Gradient */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[340px]">
            <svg viewBox="0 0 450 300" className="w-full h-full max-w-lg">
              {/* Cortex vs Medulla background gradient */}
              <rect x="20" y="20" width="410" height="110" fill="#0f172a" fillOpacity="0.8" stroke="#334155" strokeWidth="1" />
              <text x="30" y="38" fill="#64748b" fontSize="9" fontWeight="bold">RENAL CORTEX (300 mOsm/L)</text>

              <rect x="20" y="130" width="410" height="150" fill="#1e1b4b" fillOpacity="0.4" stroke="#334155" strokeWidth="1" />
              <text x="30" y="148" fill="#818cf8" fontSize="9" fontWeight="bold">RENAL MEDULLA (Gradient: 400 → 1200 mOsm/L)</text>

              {/* Bowman's Capsule & Glomerulus (top left) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSegment('glomerulus')}
              >
                {/* Bowman's cup */}
                <path d="M 60 70 C 40 70, 40 120, 90 120 C 120 120, 120 70, 90 70" fill="none" stroke="#38bdf8" strokeWidth="4" />
                {/* Glomerular capillary knot */}
                <circle cx="85" cy="95" r="16" fill="#ef4444" fillOpacity="0.7" stroke="#b91c1c" strokeWidth="2" />
                {/* Afferent & Efferent arterioles */}
                <line x1="55" y1="50" x2="75" y2="85" stroke="#ef4444" strokeWidth="5" />
                <line x1="115" y1="50" x2="95" y2="85" stroke="#ef4444" strokeWidth="3" />
              </g>

              {/* Proximal Convoluted Tubule (PCT) - Convoluted loop in cortex */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSegment('pct')}
              >
                <path
                  d="M 100 115 Q 130 80 150 115 Q 170 80 190 115"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>

              {/* Loop of Henle descending down into medulla and ascending back */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSegment('henle')}
              >
                {/* Descending Limb */}
                <path d="M 190 115 L 190 260 Q 210 275 230 260 L 230 115" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
                {/* Hairpin Osmolarity Badge */}
                <rect x="185" y="245" width="50" height="16" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                <text x="210" y="256" textAnchor="middle" fill="#fde047" fontSize="8" fontWeight="bold">1200 mOsm</text>
              </g>

              {/* Distal Convoluted Tubule (DCT) in cortex */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSegment('dct')}
              >
                <path
                  d="M 230 115 Q 260 70 290 115 Q 320 70 340 115"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>

              {/* Collecting Duct descending through cortex into medulla */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSegment('collecting')}
              >
                <line x1="340" y1="50" x2="340" y2="275" stroke="#ec4899" strokeWidth="8" strokeLinecap="round" />
                <polygon points="332,275 348,275 340,285" fill="#ec4899" />
              </g>
            </svg>
          </div>

          {/* Active Segment Detailed Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-teal-300 text-sm">
                {segmentDescriptions[selectedSegment].name}
              </h4>
              <Badge variant="primary" className="text-[10px]">
                {segmentDescriptions[selectedSegment].osmolarity}
              </Badge>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {segmentDescriptions[selectedSegment].transport}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
