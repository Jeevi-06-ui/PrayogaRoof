import React, { useState } from 'react';
import {
  Sun,
  Layers,
} from 'lucide-react';
import { Badge } from '../../../components/shared/Badge';

export const EcosystemEnergyFlowLab: React.FC = () => {
  const [solarInputJoules, setSolarInputJoules] = useState<number>(1000000);
  const [pyramidType, setPyramidType] = useState<'energy' | 'biomass' | 'biomagnification'>('energy');
  const [ecosystemType, setEcosystemType] = useState<'grassland' | 'aquatic'>('grassland');

  // Lindeman's 10% Law calculations:
  // Plants fix ~1% of incident solar radiant energy
  const producerJoules = Math.round(solarInputJoules * 0.01);
  const primaryConsumerJoules = Math.round(producerJoules * 0.1);
  const secondaryConsumerJoules = Math.round(primaryConsumerJoules * 0.1);
  const apexConsumerJoules = Math.round(secondaryConsumerJoules * 0.1);

  // Biomagnification ppm concentrations
  const biomagPpm = [
    { level: 'Water / Abiotic Substrate', ppm: '0.000003 ppm' },
    { level: 'Phytoplankton (Producers)', ppm: '0.04 ppm' },
    { level: 'Zooplankton (Primary Consumers)', ppm: '0.23 ppm' },
    { level: 'Small Fish (Secondary Consumers)', ppm: '2.07 ppm' },
    { level: 'Fish-Eating Apex Raptor (Osprey)', ppm: '25.00 ppm' },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ecosystem Energy Flow & Lindeman’s 10% Law</h3>
            <p className="text-xs text-slate-400">
              Trophic levels, ecological pyramids (energy, biomass), thermodynamic dissipation, and pesticide biomagnification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setPyramidType('energy')}
              className={`px-3 py-1 rounded-lg transition-all ${
                pyramidType === 'energy' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Energy Pyramid
            </button>
            <button
              onClick={() => setPyramidType('biomass')}
              className={`px-3 py-1 rounded-lg transition-all ${
                pyramidType === 'biomass' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Biomass Pyramid
            </button>
            <button
              onClick={() => setPyramidType('biomagnification')}
              className={`px-3 py-1 rounded-lg transition-all ${
                pyramidType === 'biomagnification' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Biomagnification
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Energy Input Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Solar Radiant Input
            </span>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Incident Sunlight:
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  {solarInputJoules.toLocaleString()} J
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="100000"
                value={solarInputJoules}
                onChange={(e) => setSolarInputJoules(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {pyramidType === 'biomass' && (
              <div className="pt-2 border-t border-slate-700 space-y-1.5">
                <span className="text-xs text-slate-300">Ecosystem Biome:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setEcosystemType('grassland')}
                    className={`p-2 rounded-xl transition-all ${
                      ecosystemType === 'grassland' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    Terrestrial Grassland (Upright)
                  </button>
                  <button
                    onClick={() => setEcosystemType('aquatic')}
                    className={`p-2 rounded-xl transition-all ${
                      ecosystemType === 'aquatic' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    Marine Ocean (Inverted)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trophic Level Assimilation Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Trophic Energy Partition
            </span>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">1. Producers (1% PAR):</span>
              <span className="font-mono text-emerald-300 font-bold">{producerJoules.toLocaleString()} J</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">2. Herbivores (10%):</span>
              <span className="font-mono text-teal-300 font-bold">{primaryConsumerJoules.toLocaleString()} J</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">3. Carnivores (10%):</span>
              <span className="font-mono text-blue-300 font-bold">{secondaryConsumerJoules.toLocaleString()} J</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">4. Apex Predators (10%):</span>
              <span className="font-mono text-rose-300 font-bold">{apexConsumerJoules.toLocaleString()} J</span>
            </div>
          </div>
        </div>

        {/* Center: Dynamic Pyramid Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[340px]">
            {pyramidType === 'energy' && (
              /* Upright Ecological Pyramid of Energy */
              <div className="w-full max-w-md flex flex-col items-center space-y-2">
                {/* Level 4 Apex */}
                <div className="w-24 h-12 rounded-t-xl bg-rose-500/80 border border-rose-400 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-[10px] font-bold text-white">Apex Predator</span>
                  <span className="text-[11px] font-mono text-rose-100 font-bold">{apexConsumerJoules} J</span>
                </div>

                {/* Level 3 Secondary Consumers */}
                <div className="w-48 h-12 bg-blue-500/80 border border-blue-400 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-[10px] font-bold text-white">Secondary Consumers</span>
                  <span className="text-[11px] font-mono text-blue-100 font-bold">{secondaryConsumerJoules} J</span>
                </div>

                {/* Level 2 Primary Consumers */}
                <div className="w-72 h-12 bg-teal-500/80 border border-teal-400 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-[10px] font-bold text-slate-950">Primary Consumers (Herbivores)</span>
                  <span className="text-[11px] font-mono text-slate-900 font-bold">{primaryConsumerJoules} J</span>
                </div>

                {/* Level 1 Producers */}
                <div className="w-96 h-14 rounded-b-xl bg-emerald-500/80 border border-emerald-400 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-xs font-bold text-slate-950">Primary Producers (Autotrophs)</span>
                  <span className="text-xs font-mono text-slate-900 font-bold">{producerJoules} J</span>
                </div>
              </div>
            )}

            {pyramidType === 'biomass' && (
              /* Upright or Inverted Pyramid of Biomass */
              <div className="w-full max-w-md flex flex-col items-center space-y-2">
                {ecosystemType === 'grassland' ? (
                  <>
                    <div className="w-24 h-12 rounded-t-xl bg-rose-500/80 border border-rose-400 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-white">Carnivores (1.5 g/m²)</span>
                    </div>
                    <div className="w-56 h-12 bg-teal-500/80 border border-teal-400 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-slate-950">Herbivores (37 g/m²)</span>
                    </div>
                    <div className="w-96 h-14 rounded-b-xl bg-emerald-500/80 border border-emerald-400 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-950">Grass Producers (809 g/m²)</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Inverted marine biomass pyramid */}
                    <div className="w-80 h-14 rounded-t-xl bg-blue-500/80 border border-blue-400 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-white">Whales & Large Fish (21 g/m² Biomass)</span>
                    </div>
                    <div className="w-40 h-12 rounded-b-xl bg-emerald-500/80 border border-emerald-400 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-slate-950">Phytoplankton (4 g/m² Biomass)</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {pyramidType === 'biomagnification' && (
              /* Biomagnification Progression */
              <div className="w-full max-w-md space-y-2 text-xs">
                {biomagPpm.map((item, idx) => (
                  <div
                    key={item.level}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-slate-300 font-medium">{item.level}</span>
                    <Badge variant={idx === biomagPpm.length - 1 ? 'danger' : 'warning'} className="font-mono">
                      DDT: {item.ppm}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-300">Lindeman’s 10% Thermodynamic Efficiency Rule (1942):</strong> Only approximately 10% of the chemical energy stored in the organic matter of one trophic level is assimilated into the next level. The remaining 90% is dissipated as metabolic respiration, heat loss ($Q$), and unconsumed refuse, adhering strictly to the Second Law of Thermodynamics. Consequently, pyramids of energy are always upright and rarely support more than 4 to 5 trophic links.
          </div>
        </div>
      </div>
    </div>
  );
};
