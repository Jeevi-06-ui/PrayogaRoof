import React, { useState } from 'react';
import {
  Eye,
} from 'lucide-react';
import { Badge } from '../../../components/shared/Badge';

export type MitosisStage = 'interphase' | 'prophase' | 'metaphase' | 'anaphase' | 'telophase' | 'cytokinesis';

export const MitosisLab: React.FC = () => {
  const [activeStage, setActiveStage] = useState<MitosisStage>('metaphase');
  const [dividingCount, setDividingCount] = useState<number>(24);
  const [totalCount, setTotalCount] = useState<number>(120);

  const mitoticIndex = ((dividingCount / Math.max(1, totalCount)) * 100).toFixed(1);

  const stageDescriptions: Record<MitosisStage, { title: string; desc: string; diagnostic: string }> = {
    interphase: {
      title: 'Interphase (Non-dividing Meristem)',
      desc: 'High metabolic activity; DNA replication occurs in S-phase. Nucleus contains diffuse chromatin and distinct nucleolus.',
      diagnostic: 'Intact spherical nuclear envelope with dark granular chromatin; no distinct chromosomes visible.',
    },
    prophase: {
      title: 'Prophase (Chromatin Condensation)',
      desc: 'Chromatin threads shorten and thicken into visible chromosomes with paired chromatids joined at centromeres. Nucleolus and nuclear envelope disintegrate.',
      diagnostic: 'Coiled tangle of distinct rod-like chromosomes within the cytoplasm.',
    },
    metaphase: {
      title: 'Metaphase (Equatorial Alignment)',
      desc: 'Spindle fibers attach to kinetochores of bivalent chromosomes. Chromosomes align symmetrically along the equatorial metaphase plate.',
      diagnostic: 'Linear arrangement of highly condensed chromosomes across the center of the rectangular plant cell.',
    },
    anaphase: {
      title: 'Anaphase (Sister Chromatid Disjunction)',
      desc: 'Centromeres split longitudinally. Spindle microtubule depolymerization pulls daughter chromosomes toward opposite centrosome poles.',
      diagnostic: 'Two distinct clusters of V-shaped and L-shaped chromatids migrating toward opposite ends of the cell.',
    },
    telophase: {
      title: 'Telophase (Nuclear Reconstruction)',
      desc: 'Chromatids reach the poles and decondense into fine chromatin meshwork. Nuclear envelope reforms around daughter nuclei.',
      diagnostic: 'Two newly formed reconstituted nuclei at polar ends of an elongated rectangular cell.',
    },
    cytokinesis: {
      title: 'Cytokinesis (Cell Plate Formation)',
      desc: 'Phragmoplast vesicles coalesce at the equatorial plane to lay down the cellulosic cell plate, dividing the cytoplasm into two identical daughter cells.',
      diagnostic: 'A distinct transverse dividing cell plate separating two fully formed daughter cells.',
    },
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mitosis Stages in Onion Root Tip Squash</h3>
            <p className="text-xs text-slate-400">
              Equational somatic division, chromosome morphology, spindle mechanics, and mitotic index calculation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="bg-rose-950/80 text-rose-300 border-rose-500/40">
            Allium cepa Meristem
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Stage Selector & Mitotic Index Calculator */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Mitotic Phase
            </span>
            <div className="space-y-1.5">
              {(['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis'] as MitosisStage[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStage(st)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    activeStage === st
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <span className="capitalize">{st}</span>
                  {activeStage === st && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mitotic Index Counter */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mitotic Index Counter
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Dividing Cells Counted:</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={dividingCount}
                  onChange={(e) => setDividingCount(parseInt(e.target.value, 10) || 0)}
                  className="w-20 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-teal-300 font-mono text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Meristem Cells:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={totalCount}
                  onChange={(e) => setTotalCount(parseInt(e.target.value, 10) || 1)}
                  className="w-20 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-right"
                />
              </div>
              <div className="pt-2 border-t border-slate-700 flex items-center justify-between font-bold">
                <span className="text-slate-400">Mitotic Index (MI):</span>
                <span className="font-mono text-rose-400 text-base">{mitoticIndex}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive High-Magnification Cell Diagram */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            <svg viewBox="0 0 400 300" className="w-full h-full max-w-md">
              {/* Plant Cell Rectangular Cellulosic Cell Wall */}
              <rect x="60" y="40" width="280" height="220" rx="12" fill="#ffe4e6" fillOpacity="0.4" stroke="#e11d48" strokeWidth="4" />

              {/* Cytoplasm */}
              <rect x="66" y="46" width="268" height="208" rx="8" fill="#fda4af" fillOpacity="0.3" />

              {/* Stage-specific chromosome rendering */}
              {activeStage === 'interphase' && (
                <g transform="translate(200, 150)">
                  <circle cx="0" cy="0" r="45" fill="#f43f5e" fillOpacity="0.6" stroke="#9f1239" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="-10" cy="-10" r="12" fill="#881337" />
                  <path d="M -25 5 Q 0 -20 20 10 Q -10 25 -25 5 Z" fill="none" stroke="#be123c" strokeWidth="2" />
                </g>
              )}

              {activeStage === 'prophase' && (
                <g transform="translate(200, 150)" stroke="#be123c" strokeWidth="4" strokeLinecap="round">
                  <line x1="-30" y1="-25" x2="-10" y2="15" />
                  <line x1="10" y1="-30" x2="30" y2="10" />
                  <line x1="-20" y1="20" x2="15" y2="25" />
                  <line x1="-5" y1="-10" x2="15" y2="-5" />
                  <circle cx="0" cy="0" r="55" fill="none" stroke="#9f1239" strokeWidth="1.5" strokeDasharray="4 4" />
                </g>
              )}

              {activeStage === 'metaphase' && (
                <g transform="translate(200, 150)">
                  {/* Spindle Fibers from polar centrosomes */}
                  <line x1="-100" y1="0" x2="0" y2="-40" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="3 2" />
                  <line x1="-100" y1="0" x2="0" y2="0" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="3 2" />
                  <line x1="-100" y1="0" x2="0" y2="40" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="3 2" />
                  <line x1="100" y1="0" x2="0" y2="-40" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="3 2" />
                  <line x1="100" y1="0" x2="0" y2="0" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="3 2" />
                  <line x1="100" y1="0" x2="0" y2="40" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="3 2" />

                  {/* Chromosomes Aligned at Metaphase Plate (x = 0) */}
                  <g stroke="#9f1239" strokeWidth="5" strokeLinecap="round">
                    <line x1="0" y1="-50" x2="0" y2="-20" />
                    <line x1="0" y1="-15" x2="0" y2="15" />
                    <line x1="0" y1="20" x2="0" y2="50" />
                  </g>
                  {/* Centromeres */}
                  <circle cx="0" cy="-35" r="4" fill="#fbbf24" />
                  <circle cx="0" cy="0" r="4" fill="#fbbf24" />
                  <circle cx="0" cy="35" r="4" fill="#fbbf24" />
                </g>
              )}

              {activeStage === 'anaphase' && (
                <g transform="translate(200, 150)">
                  {/* Spindle poles pulling V-shaped chromatids */}
                  <g stroke="#9f1239" strokeWidth="4" strokeLinecap="round" fill="none">
                    {/* Left Daughter Chromatids migrating left */}
                    <path d="M -20 -40 L -45 -35 L -20 -30" />
                    <path d="M -20 -5 L -45 0 L -20 5" />
                    <path d="M -20 30 L -45 35 L -20 40" />

                    {/* Right Daughter Chromatids migrating right */}
                    <path d="M 20 -40 L 45 -35 L 20 -30" />
                    <path d="M 20 -5 L 45 0 L 20 5" />
                    <path d="M 20 30 L 45 35 L 20 40" />
                  </g>
                </g>
              )}

              {activeStage === 'telophase' && (
                <g transform="translate(200, 150)">
                  {/* Two reforming nuclear envelopes */}
                  <circle cx="-65" cy="0" r="30" fill="#f43f5e" fillOpacity="0.5" stroke="#9f1239" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="65" cy="0" r="30" fill="#f43f5e" fillOpacity="0.5" stroke="#9f1239" strokeWidth="2" strokeDasharray="3 3" />
                </g>
              )}

              {activeStage === 'cytokinesis' && (
                <g transform="translate(200, 150)">
                  {/* Two full nuclei */}
                  <circle cx="-65" cy="0" r="30" fill="#f43f5e" fillOpacity="0.7" stroke="#9f1239" strokeWidth="2" />
                  <circle cx="65" cy="0" r="30" fill="#f43f5e" fillOpacity="0.7" stroke="#9f1239" strokeWidth="2" />
                  {/* Cell plate formation dividing the cell vertically */}
                  <line x1="0" y1="-100" x2="0" y2="100" stroke="#e11d48" strokeWidth="4" strokeDasharray="6 3" />
                </g>
              )}
            </svg>
          </div>

          {/* Morphological Description */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2 text-xs">
            <h4 className="font-bold text-rose-300 text-sm">
              {stageDescriptions[activeStage].title}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {stageDescriptions[activeStage].desc}
            </p>
            <div className="pt-2 border-t border-slate-700 flex items-start gap-2">
              <span className="font-bold text-rose-400 flex-shrink-0">Diagnostic Feature:</span>
              <span className="text-slate-300">{stageDescriptions[activeStage].diagnostic}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
