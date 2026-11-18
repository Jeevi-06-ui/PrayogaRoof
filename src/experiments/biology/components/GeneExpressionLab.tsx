import React, { useState } from 'react';
import {
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export const GeneExpressionLab: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'transcription' | 'translation'>('translation');
  const [activeCodonIndex, setActiveCodonIndex] = useState<number>(0);

  const codons = [
    { codon: 'AUG', anticodon: 'UAC', aminoAcid: 'Methionine (Met)', role: 'Start Codon' },
    { codon: 'GUA', anticodon: 'CAU', aminoAcid: 'Valine (Val)', role: 'Aliphatic Nonpolar' },
    { codon: 'GAA', anticodon: 'CUU', aminoAcid: 'Glutamic Acid (Glu)', role: 'Acidic Negatively Charged' },
    { codon: 'GGU', anticodon: 'CCA', aminoAcid: 'Glycine (Gly)', role: 'Smallest Achiral Residue' },
    { codon: 'UAA', anticodon: 'AUU', aminoAcid: 'None (Release Factor)', role: 'Ochre Stop Codon' },
  ];

  const currentCodon = codons[activeCodonIndex];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gene Expression (Central Dogma: Transcription & Translation)</h3>
            <p className="text-xs text-slate-400">
              RNA Polymerase transcription, ribosomal codon recognition, aminoacyl-tRNA anticodon pairing, and peptide bonding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveStage('transcription')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeStage === 'transcription' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Transcription (DNA → mRNA)
            </button>
            <button
              onClick={() => setActiveStage('translation')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeStage === 'translation' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Translation (mRNA → Protein)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Codon Table & Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Triplet Codon Decoding
            </span>

            <div className="space-y-1.5">
              {codons.map((c, i) => (
                <button
                  key={c.codon}
                  onClick={() => setActiveCodonIndex(i)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                    activeCodonIndex === i
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                      : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.codon}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-teal-300">{c.aminoAcid.split(' ')[0]}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{c.role}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
              <Button
                variant="outline"
                size="sm"
                disabled={activeCodonIndex <= 0}
                onClick={() => setActiveCodonIndex(activeCodonIndex - 1)}
                className="w-1/2"
              >
                Previous Codon
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={activeCodonIndex >= codons.length - 1}
                onClick={() => setActiveCodonIndex(activeCodonIndex + 1)}
                className="w-1/2"
              >
                Next Codon
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">mRNA Codon:</span>
              <span className="font-mono text-indigo-300 font-bold text-sm">5′- {currentCodon.codon} -3′</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">tRNA Anticodon:</span>
              <span className="font-mono text-teal-300 font-bold text-sm">3′- {currentCodon.anticodon} -5′</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Attached Residue:</span>
              <span className="font-bold text-amber-300">{currentCodon.aminoAcid}</span>
            </div>
          </div>
        </div>

        {/* Center: Ribosome Translation Machinery */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            <svg viewBox="0 0 450 260" className="w-full h-full max-w-lg">
              {/* mRNA Strand running horizontally */}
              <line x1="30" y1="180" x2="420" y2="180" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
              <text x="15" y="184" fill="#818cf8" fontSize="10" fontWeight="bold">5′</text>
              <text x="425" y="184" fill="#818cf8" fontSize="10" fontWeight="bold">3′</text>

              {/* Codon labels along mRNA */}
              {codons.map((c, i) => (
                <g key={i} transform={`translate(${80 + i * 65}, 198)`}>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={activeCodonIndex === i ? '#38bdf8' : '#94a3b8'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {c.codon}
                  </text>
                </g>
              ))}

              {/* Ribosomal 60S Large Subunit (top dome) */}
              <ellipse cx={80 + activeCodonIndex * 65} cy="110" rx="65" ry="45" fill="#4338ca" fillOpacity="0.4" stroke="#6366f1" strokeWidth="2.5" />
              {/* Ribosomal 40S Small Subunit (bottom base) */}
              <ellipse cx={80 + activeCodonIndex * 65} cy="180" rx="55" ry="22" fill="#3730a3" fillOpacity="0.5" stroke="#4f46e5" strokeWidth="2" />

              {/* Docked tRNA at P Site */}
              <g transform={`translate(${80 + activeCodonIndex * 65}, 145)`}>
                {/* Cloverleaf stalk */}
                <line x1="0" y1="0" x2="0" y2="-45" stroke="#10b981" strokeWidth="4" />
                {/* Anticodon Loop */}
                <rect x="-14" y="-8" width="28" height="14" rx="3" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
                <text x="0" y="3" textAnchor="middle" fill="#a7f3d0" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {currentCodon.anticodon}
                </text>
                {/* Amino acid sphere at 3' acceptor stem */}
                <circle cx="0" cy="-55" r="12" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                <text x="0" y="-52" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">
                  {currentCodon.aminoAcid.split(' ')[0].substring(0, 3)}
                </text>
              </g>

              {/* Growing Polypeptide Chain */}
              <g transform={`translate(${80 + activeCodonIndex * 65 - 20}, 85)`}>
                {Array.from({ length: activeCodonIndex }, (_, i) => (
                  <g key={i} transform={`translate(${-i * 18}, ${-i * 8})`}>
                    <circle cx="0" cy="0" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-indigo-300">Central Dogma Decoded:</strong> Genetic information flows irreversibly from DNA to RNA to Protein. RNA Polymerase II transcribes the template into mRNA. The ribosome reads non-overlapping triplet codons (Crick &amp; Nirenberg code). Aminoacyl-tRNA synthetases charge tRNAs with specific amino acids. Peptidyl transferase ribozyme in the large subunit catalyzes peptide bond condensation until a stop codon (UAA, UAG, UGA) releases the completed polypeptide.
          </div>
        </div>
      </div>
    </div>
  );
};
