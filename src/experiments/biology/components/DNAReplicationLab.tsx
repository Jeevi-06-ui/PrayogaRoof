import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export const DNAReplicationLab: React.FC = () => {
  const [step, setStep] = useState<number>(1);

  const stepsData = [
    {
      step: 1,
      title: '1. Helicase Unwinds Double Helix',
      desc: 'DNA Helicase breaks hydrogen bonds between nitrogenous base pairs (A=T, G≡C), unwinding the duplex into a Y-shaped replication fork.',
      enzyme: 'DNA Helicase + Topoisomerase (Gyrase)',
    },
    {
      step: 2,
      title: '2. Primase Synthesizes RNA Primers',
      desc: 'RNA Primase lays down short complementary RNA oligonucleotides (~10 nucleotides) providing free 3′-OH ends for polymerases to initiate synthesis.',
      enzyme: 'RNA Primase',
    },
    {
      step: 3,
      title: '3. Leading & Lagging Strand Elongation',
      desc: 'DNA Polymerase III synthesizes the leading strand continuously 5′→3′ toward the fork, and the lagging strand discontinuously in short Okazaki fragments away from the fork.',
      enzyme: 'DNA Polymerase III (Holoenzyme)',
    },
    {
      step: 4,
      title: '4. Primer Removal & Nick Ligation',
      desc: 'DNA Polymerase I uses 5′→3′ exonuclease activity to degrade RNA primers and fills gaps with dNTPs. DNA Ligase forms covalent phosphodiester bonds to seal fragments.',
      enzyme: 'DNA Polymerase I + DNA Ligase',
    },
  ];

  const current = stepsData[step - 1];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">DNA Replication Fork & Semiconservative Synthesis</h3>
            <p className="text-xs text-slate-400">
              Helicase unwinding, leading strand 5′→3′, Okazaki fragments, and DNA ligase phosphodiester bond sealing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="bg-cyan-950/80 text-cyan-300 border-cyan-500/40">
            Semiconservative Model
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Step Stepper */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Replication Cascade
            </span>

            <div className="space-y-2">
              {stepsData.map((s) => (
                <button
                  key={s.step}
                  onClick={() => setStep(s.step)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all ${
                    step === s.step
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <p>{s.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{s.enzyme}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
              <Button
                variant="outline"
                size="sm"
                disabled={step <= 1}
                onClick={() => setStep(step - 1)}
                className="w-1/2"
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={step >= 4}
                onClick={() => setStep(step + 1)}
                className="w-1/2"
              >
                Next Step
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Enzymes in Action
            </span>
            <p className="text-cyan-300 font-bold font-mono">{current.enzyme}</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">{current.desc}</p>
          </div>
        </div>

        {/* Center: Dynamic Fork Schematic */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            <svg viewBox="0 0 450 260" className="w-full h-full max-w-lg">
              {/* Parental strands unwinding (Y-fork) */}
              {/* Parental 3' to 5' (top) */}
              <path
                d="M 50 60 L 220 60 Q 280 60 380 30"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
              />
              <text x="40" y="65" fill="#38bdf8" fontSize="10" fontWeight="bold">3′</text>
              <text x="390" y="32" fill="#38bdf8" fontSize="10" fontWeight="bold">5′</text>

              {/* Parental 5' to 3' (bottom) */}
              <path
                d="M 50 180 L 220 180 Q 280 180 380 210"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
              />
              <text x="40" y="185" fill="#38bdf8" fontSize="10" fontWeight="bold">5′</text>
              <text x="390" y="215" fill="#38bdf8" fontSize="10" fontWeight="bold">3′</text>

              {/* Hydrogen bonds in un-unwound region (left) */}
              {Array.from({ length: 8 }, (_, i) => (
                <line
                  key={i}
                  x1={70 + i * 18}
                  y1="64"
                  x2={70 + i * 18}
                  y2="176"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Helicase Enzyme Wedge at the fork juncture */}
              <g transform="translate(220, 120)">
                <polygon points="0,-30 40,0 0,30" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                <text x="14" y="4" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">Helicase</text>
              </g>

              {/* Newly synthesized Leading Strand (Continuous green) */}
              {step >= 3 && (
                <g>
                  <path
                    d="M 220 80 L 370 50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeDasharray={step === 3 ? '4 2' : 'none'}
                  />
                  <text x="290" y="80" fill="#10b981" fontSize="9" fontWeight="bold">Leading Strand (5′→3′)</text>
                </g>
              )}

              {/* Newly synthesized Lagging Strand (Discontinuous Okazaki fragments) */}
              {step >= 3 && (
                <g>
                  {/* Okazaki Fragment 1 */}
                  <path d="M 240 160 L 290 170" fill="none" stroke="#f43f5e" strokeWidth="3.5" />
                  {/* Okazaki Fragment 2 */}
                  <path d="M 310 175 L 360 190" fill="none" stroke="#f43f5e" strokeWidth="3.5" />
                  <text x="270" y="152" fill="#f43f5e" fontSize="9" fontWeight="bold">Okazaki Fragments</text>

                  {/* DNA Ligase in step 4 */}
                  {step === 4 && (
                    <g transform="translate(300, 172)">
                      <circle cx="0" cy="0" r="10" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1.5" />
                      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">Ligase</text>
                    </g>
                  )}
                </g>
              )}
            </svg>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300">Meselson-Stahl Semiconservative Proof:</strong> Each replicated daughter duplex contains one original parent strand and one newly synthesized complementary daughter strand. Because DNA polymerases can only add deoxynucleotides to a free 3′-OH group in the 5′→3′ direction, the antiparallel orientation of duplex DNA necessitates discontinuous Okazaki synthesis on the lagging template strand.
          </div>
        </div>
      </div>
    </div>
  );
};
