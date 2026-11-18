import React, { useState, useMemo } from 'react';
import {
  Grid,
} from 'lucide-react';

export const MendelianGeneticsLab: React.FC = () => {
  const [crossMode, setCrossMode] = useState<'monohybrid' | 'dihybrid'>('monohybrid');
  const [p1Mono, setP1Mono] = useState<string>('Tt');
  const [p2Mono, setP2Mono] = useState<string>('Tt');

  // Monohybrid Gametes & Offspring Grid
  const monoGrid = useMemo(() => {
    const g1 = [p1Mono[0], p1Mono[1]];
    const g2 = [p2Mono[0], p2Mono[1]];
    const cells: Array<{ genotype: string; phenotype: string }> = [];

    let tallCount = 0;
    let dwarfCount = 0;
    const genotypes: Record<string, number> = {};

    for (const a1 of g1) {
      for (const a2 of g2) {
        // Sort alleles: dominant first (e.g. 'T' before 't')
        const sorted = [a1, a2].sort().join('');
        const genotype = sorted === 'tT' ? 'Tt' : sorted;
        const phenotype = genotype.includes('T') ? 'Tall (Dominant)' : 'Dwarf (Recessive)';
        if (phenotype.startsWith('Tall')) tallCount++;
        else dwarfCount++;

        genotypes[genotype] = (genotypes[genotype] || 0) + 1;
        cells.push({ genotype, phenotype });
      }
    }

    return { g1, g2, cells, tallCount, dwarfCount, genotypes };
  }, [p1Mono, p2Mono]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mendelian Genetics & Punnett Square Laboratory</h3>
            <p className="text-xs text-slate-400">
              Mendel’s Laws of Segregation and Independent Assortment, 3:1 and 9:3:3:1 phenotypic ratios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setCrossMode('monohybrid')}
              className={`px-3 py-1 rounded-lg transition-all ${
                crossMode === 'monohybrid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monohybrid (Height: T/t)
            </button>
            <button
              onClick={() => setCrossMode('dihybrid')}
              className={`px-3 py-1 rounded-lg transition-all ${
                crossMode === 'dihybrid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dihybrid (Shape/Color: RrYy)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Parental Genotypes */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Parental Alleles (P₁ & P₂)
            </span>

            {crossMode === 'monohybrid' ? (
              <>
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300">Parent 1 Genotype:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['TT', 'Tt', 'tt'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setP1Mono(g)}
                        className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          p1Mono === g ? 'bg-amber-500 text-slate-950' : 'bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300">Parent 2 Genotype:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['TT', 'Tt', 'tt'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setP2Mono(g)}
                        className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          p2Mono === g ? 'bg-amber-500 text-slate-950' : 'bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-amber-300">Dihybrid Cross Setup:</p>
                <p>Parent 1 (RrYy) × Parent 2 (RrYy)</p>
                <p className="text-[11px] text-slate-400">
                  R: Round (dominant), r: wrinkled (recessive)<br />
                  Y: Yellow (dominant), y: green (recessive)
                </p>
              </div>
            )}
          </div>

          {/* Ratios Status */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Expected Offspring Distribution
            </span>
            {crossMode === 'monohybrid' ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Phenotypic Ratio:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {monoGrid.tallCount} Tall : {monoGrid.dwarfCount} Dwarf
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Genotypic Ratio:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Object.entries(monoGrid.genotypes).map(([k, v]) => `${v} ${k}`).join(' : ')}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <p className="font-mono text-amber-300 font-bold">
                  9 Round Yellow : 3 Round Green : 3 Wrinkled Yellow : 1 Wrinkled Green
                </p>
                <p className="text-[11px] text-slate-400">
                  Independent assortment of unlinked alleles yields 16 combinations (9:3:3:1 ratio).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Punnett Square Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            {crossMode === 'monohybrid' ? (
              /* 2x2 Punnett Square */
              <div className="w-full max-w-sm space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                  <div className="p-2 text-slate-500">P₁ \ P₂</div>
                  <div className="p-2 rounded-xl bg-slate-800 text-teal-300">{monoGrid.g2[0]}</div>
                  <div className="p-2 rounded-xl bg-slate-800 text-teal-300">{monoGrid.g2[1]}</div>

                  <div className="p-2 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center">
                    {monoGrid.g1[0]}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center">
                    <span className="text-base text-white">{monoGrid.cells[0].genotype}</span>
                    <span className="text-[9px] text-slate-400">{monoGrid.cells[0].phenotype.split(' ')[0]}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center">
                    <span className="text-base text-white">{monoGrid.cells[1].genotype}</span>
                    <span className="text-[9px] text-slate-400">{monoGrid.cells[1].phenotype.split(' ')[0]}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center">
                    {monoGrid.g1[1]}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center">
                    <span className="text-base text-white">{monoGrid.cells[2].genotype}</span>
                    <span className="text-[9px] text-slate-400">{monoGrid.cells[2].phenotype.split(' ')[0]}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center">
                    <span className="text-base text-white">{monoGrid.cells[3].genotype}</span>
                    <span className="text-[9px] text-slate-400">{monoGrid.cells[3].phenotype.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* 4x4 Punnett Square for Dihybrid */
              <div className="w-full max-w-md p-4 bg-slate-900/80 rounded-2xl border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {[
                  'RRYY', 'RRYy', 'RrYY', 'RrYy',
                  'RRYy', 'RRyy', 'RrYy', 'Rryy',
                  'RrYY', 'RrYy', 'rrYY', 'rrYy',
                  'RrYy', 'Rryy', 'rrYy', 'rryy',
                ].map((gt, i) => {
                  const isRoundYellow = gt.includes('R') && gt.includes('Y');
                  const isRoundGreen = gt.includes('R') && !gt.includes('Y');
                  const isWrinkledYellow = !gt.includes('R') && gt.includes('Y');
                  const bg = isRoundYellow ? 'bg-amber-500/20 text-amber-200' : isRoundGreen ? 'bg-emerald-500/20 text-emerald-200' : isWrinkledYellow ? 'bg-yellow-500/20 text-yellow-200' : 'bg-slate-700/40 text-slate-300';
                  return (
                    <div key={i} className={`p-2.5 rounded-xl border border-slate-700/60 ${bg} flex flex-col items-center justify-center`}>
                      <span className="font-bold text-[11px]">{gt}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Law of Segregation & Independent Assortment:</strong> Alleles segregate during gamete formation so each gamete carries only one allele for each gene. Non-homologous gene pairs assort independently into gametes, producing 4 distinct gametic genotypes (RY, Ry, rY, ry) in equal 1:1:1:1 proportions, yielding the classic 9:3:3:1 dihybrid ratio.
          </div>
        </div>
      </div>
    </div>
  );
};
