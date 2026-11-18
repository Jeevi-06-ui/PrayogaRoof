import React, { useState } from 'react';
import {
  Eye,
} from 'lucide-react';
import { Badge } from '../../../components/shared/Badge';

export type MeiosisStage =
  | 'leptotene'
  | 'zygotene'
  | 'pachytene'
  | 'diplotene'
  | 'diakinesis'
  | 'anaphase-1'
  | 'tetrad-gametes';

export const MeiosisLab: React.FC = () => {
  const [activeStage, setActiveStage] = useState<MeiosisStage>('pachytene');

  const stageData: Record<MeiosisStage, { name: string; phase: string; details: string; feature: string }> = {
    leptotene: {
      name: 'Leptotene',
      phase: 'Prophase I',
      details: 'Chromatin begins long condensation process; chromosomes appear as long slender threads with beaded chromomeres along their length.',
      feature: 'Bouquet stage: telomeres cluster near nuclear envelope.',
    },
    zygotene: {
      name: 'Zygotene',
      phase: 'Prophase I',
      details: 'Homologous chromosomes pair up gene-for-gene in a process called synapsis, mediated by the zipper-like synaptonemal complex forming bivalents (tetrads).',
      feature: 'Synaptonemal complex bridges maternal and paternal homologs.',
    },
    pachytene: {
      name: 'Pachytene (Crossing Over)',
      phase: 'Prophase I',
      details: 'Non-sister chromatids of homologous chromosomes exchange genetic segments at recombination nodules catalyzed by recombinase enzyme.',
      feature: 'Physical exchange of non-sister chromatid segments creating recombinant alleles.',
    },
    diplotene: {
      name: 'Diplotene',
      phase: 'Prophase I',
      details: 'Synaptonemal complex dissolves and paired chromosomes repel each other, remaining connected only at crossing over points known as chiasmata.',
      feature: 'X-shaped chiasmata become distinctly visible under microscopy.',
    },
    diakinesis: {
      name: 'Diakinesis',
      phase: 'Prophase I',
      details: 'Terminalization of chiasmata occurs as bivalents contract to maximum compaction. Nuclear membrane disintegrates and spindle apparatus forms.',
      feature: 'Chiasmata slip towards chromosome ends (terminalization).',
    },
    'anaphase-1': {
      name: 'Anaphase I (Reductional Disjunction)',
      phase: 'Meiosis I',
      details: 'Homologous chromosome pairs separate and move to opposite poles, while sister chromatids remain attached at their centromeres. Ploidy drops from diploid (2n) to haploid (n).',
      feature: 'Reduction from 2n to n; independent assortment of maternal/paternal homologs.',
    },
    'tetrad-gametes': {
      name: '4 Recombinant Haploid Gametes',
      phase: 'End of Meiosis II',
      details: 'Following equational Meiosis II, 4 haploid gamete microspores are produced, each carrying a unique mosaic of maternal and paternal DNA.',
      feature: 'Four non-identical haploid gametes providing immense genetic variation.',
    },
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Meiosis & Chromosomal Crossing Over</h3>
            <p className="text-xs text-slate-400">
              Synapsis, synaptonemal complex, chiasmata, reductional division, and 4 haploid recombinant gametes
            </p>
          </div>
        </div>

        <Badge variant="primary" className="bg-purple-950/80 text-purple-300 border-purple-500/40">
          Reductional Gametogenesis
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Phase Scrubber */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Prophase I & Meiosis Stages
            </span>
            <div className="space-y-1.5">
              {(Object.keys(stageData) as MeiosisStage[]).map((stageKey) => (
                <button
                  key={stageKey}
                  onClick={() => setActiveStage(stageKey)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    activeStage === stageKey
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div>
                    <p>{stageData[stageKey].name}</p>
                    <p className="text-[10px] text-slate-500">{stageData[stageKey].phase}</p>
                  </div>
                  {activeStage === stageKey && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Maternal Homolog:</span>
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Paternal Homolog:</span>
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            </div>
            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
              Track the recombinant mosaic segments resulting from crossing over at pachytene.
            </p>
          </div>
        </div>

        {/* Center: Stage Visualizer Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            <svg viewBox="0 0 400 280" className="w-full h-full max-w-md">
              {/* Cell outline */}
              <circle cx="200" cy="140" r="115" fill="#1e1b4b" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2.5" />

              {/* Crossing over at Pachytene */}
              {activeStage === 'pachytene' && (
                <g transform="translate(200, 140)">
                  {/* Maternal Chromosome (Red) */}
                  <path d="M -30 -60 Q -10 -20 0 0 Q -10 20 -30 60" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                  <path d="M -20 -60 Q -5 -20 0 0 Q -5 20 -20 60" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />

                  {/* Paternal Chromosome (Blue) */}
                  <path d="M 30 -60 Q 10 -20 0 0 Q 10 20 30 60" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 20 -60 Q 5 -20 0 0 Q 5 20 20 60" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />

                  {/* Recombination Nodule / Chiasma at center (0,0) */}
                  <circle cx="0" cy="0" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="2" className="animate-pulse" />
                  <text x="0" y="24" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">Chiasma</text>
                </g>
              )}

              {/* Anaphase I Reductional Disjunction */}
              {activeStage === 'anaphase-1' && (
                <g transform="translate(200, 140)">
                  {/* Maternal homolog migrating left with swapped blue segment */}
                  <g transform="translate(-60, 0)">
                    <path d="M 0 -45 L -20 0 L 0 45" fill="none" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
                    <line x1="-5" y1="15" x2="0" y2="45" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" />
                  </g>

                  {/* Paternal homolog migrating right with swapped red segment */}
                  <g transform="translate(60, 0)">
                    <path d="M 0 -45 L 20 0 L 0 45" fill="none" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" />
                    <line x1="5" y1="15" x2="0" y2="45" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
                  </g>
                </g>
              )}

              {/* 4 Haploid Recombinant Gametes */}
              {activeStage === 'tetrad-gametes' && (
                <g transform="translate(200, 140)">
                  {/* 4 daughter cells */}
                  {[
                    [-50, -45, '#ef4444', '#ef4444', 'Gamete 1 (Pure Mat)'],
                    [50, -45, '#ef4444', '#3b82f6', 'Gamete 2 (Recombinant)'],
                    [-50, 45, '#3b82f6', '#ef4444', 'Gamete 3 (Recombinant)'],
                    [50, 45, '#3b82f6', '#3b82f6', 'Gamete 4 (Pure Pat)'],
                  ].map(([x, y, c1, c2], i) => (
                    <g key={i} transform={`translate(${x}, ${y})`}>
                      <circle cx="0" cy="0" r="32" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" />
                      <line x1="0" y1="-18" x2="0" y2="2" stroke={c1 as string} strokeWidth="5" strokeLinecap="round" />
                      <line x1="0" y1="2" x2="0" y2="18" stroke={c2 as string} strokeWidth="5" strokeLinecap="round" />
                    </g>
                  ))}
                </g>
              )}

              {/* Generic Stage view for other subphases */}
              {activeStage !== 'pachytene' && activeStage !== 'anaphase-1' && activeStage !== 'tetrad-gametes' && (
                <g transform="translate(200, 140)">
                  <path d="M -25 -50 Q -10 0 -25 50" fill="none" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
                  <path d="M 25 -50 Q 10 0 25 50" fill="none" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" />
                  {activeStage === 'zygotene' && (
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#a855f7" strokeWidth="3" strokeDasharray="3 2" />
                  )}
                </g>
              )}
            </svg>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2 text-xs">
            <h4 className="font-bold text-purple-300 text-sm">
              {stageData[activeStage].name} — {stageData[activeStage].phase}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {stageData[activeStage].details}
            </p>
            <div className="pt-2 border-t border-slate-700 flex items-start gap-2">
              <span className="font-bold text-purple-400 flex-shrink-0">Diagnostic Criterion:</span>
              <span className="text-slate-300">{stageData[activeStage].feature}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
