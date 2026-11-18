import React, { useState } from 'react';
import {
  FlaskConical,
  Flame,
  Droplets,
  RotateCcw,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export interface TestTubeItem {
  id: string;
  name: string;
  reagents: string[];
  sample: string | null;
  volumeMl: number;
  temperatureC: number;
  color: string;
  precipitate: string | null;
  reactionLabel: string;
}

interface BiologicalWorkbenchProps {
  onLogObservation?: (observation: string) => void;
  className?: string;
}

export const BiologicalWorkbench: React.FC<BiologicalWorkbenchProps> = ({
  onLogObservation,
  className = '',
}) => {
  const [burnerActive, setBurnerActive] = useState<boolean>(false);
  const [waterBathTempC, setWaterBathTempC] = useState<number>(25);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  // 4 active test tubes on the rack
  const [testTubes, setTestTubes] = useState<TestTubeItem[]>([
    {
      id: 'tube-1',
      name: 'Tube 1 (Starch Test)',
      reagents: [],
      sample: 'starch',
      volumeMl: 5,
      temperatureC: 25,
      color: '#f8fafc', // cloudy white
      precipitate: null,
      reactionLabel: '1% Starch Suspension',
    },
    {
      id: 'tube-2',
      name: 'Tube 2 (Sugar Test)',
      reagents: [],
      sample: 'glucose',
      volumeMl: 5,
      temperatureC: 25,
      color: '#f1f5f9', // clear
      precipitate: null,
      reactionLabel: 'Glucose Solution',
    },
    {
      id: 'tube-3',
      name: 'Tube 3 (Protein Test)',
      reagents: [],
      sample: 'albumin',
      volumeMl: 5,
      temperatureC: 25,
      color: '#f8fafc', // pale colloidal
      precipitate: null,
      reactionLabel: 'Egg Albumin Extract',
    },
    {
      id: 'tube-4',
      name: 'Tube 4 (Lipid Test)',
      reagents: [],
      sample: 'oil',
      volumeMl: 5,
      temperatureC: 25,
      color: '#fef08a', // pale yellow oil layer
      precipitate: null,
      reactionLabel: 'Vegetable Oil Emulsion',
    },
  ]);

  // Spotting tile 12 wells for amylase assay
  const spottingWells = [
    { id: 0, color: '#fef08a', label: 'Start (0m)' },
    { id: 1, color: '#1e3a8a', label: '1 min' },
    { id: 2, color: '#1e3a8a', label: '2 min' },
    { id: 3, color: '#2563eb', label: '3 min' },
    { id: 4, color: '#3b82f6', label: '4 min' },
    { id: 5, color: '#60a5fa', label: '5 min' },
    { id: 6, color: '#93c5fd', label: '6 min' },
    { id: 7, color: '#a855f7', label: '7 min' },
    { id: 8, color: '#c084fc', label: '8 min' },
    { id: 9, color: '#fef08a', label: '9 min (Achromic)' },
    { id: 10, color: '#fef08a', label: '10 min' },
    { id: 11, color: '#fef08a', label: '11 min' },
  ];

  const currentTube = testTubes[selectedTubeIndex];

  const handleAddReagent = (reagentId: string) => {
    setTestTubes((prev) => {
      const updated = [...prev];
      const target = { ...updated[selectedTubeIndex] };

      if (!target.reagents.includes(reagentId)) {
        target.reagents = [...target.reagents, reagentId];
      }

      // Recompute biochemical color reaction
      if (reagentId === 'iodine' && target.sample === 'starch') {
        target.color = '#172554'; // Intense blue-black
        target.reactionLabel = 'Starch-Iodine Helical Complex (Deep Blue-Black)';
        notify(`${target.name}: Iodine added -> Intense Blue-Black color confirms Amylose!`);
      } else if (reagentId === 'benedict') {
        target.color = '#38bdf8'; // Benedict blue
        target.reactionLabel = 'Benedict’s Solution Added (Blue Cu2+)';
        notify(`${target.name}: Benedict’s added. Heat in water bath to induce reduction!`);
      } else if (reagentId === 'biuret' && target.sample === 'albumin') {
        target.color = '#7c3aed'; // Deep purple/violet
        target.reactionLabel = 'Biuret Complex Formed (Violet/Purple Coordination with Peptide Bonds)';
        notify(`${target.name}: Biuret added -> Purple-Violet complex confirms Protein!`);
      } else if (reagentId === 'sudan-iii' && target.sample === 'oil') {
        target.color = '#dc2626'; // Bright scarlet red
        target.reactionLabel = 'Sudan III Lipophilic Staining (Scarlet Red Oil Globules)';
        notify(`${target.name}: Sudan III added -> Scarlet red lipid emulsion confirms Fat!`);
      } else if (reagentId === 'amylase' && target.sample === 'starch') {
        target.reactionLabel = 'Amylase Hydrolysis In Progress (Starch -> Maltose)';
        notify(`${target.name}: Salivary amylase added. Cleaving alpha-1,4-glucosidic bonds.`);
      }

      updated[selectedTubeIndex] = target;
      return updated;
    });
  };

  const handleApplyHeat = () => {
    setBurnerActive(!burnerActive);
    if (!burnerActive) {
      setWaterBathTempC(90);
      notify('Water bath heated to 90°C. Boiling accelerates Benedict’s redox reaction!');

      // Check if current tube has Benedict + glucose
      setTestTubes((prev) => {
        const updated = [...prev];
        const target = { ...updated[selectedTubeIndex] };
        if (target.reagents.includes('benedict') && target.sample === 'glucose') {
          target.color = '#b91c1c'; // Brick-red precipitate
          target.precipitate = 'Brick-Red Cuprous Oxide (Cu2O)';
          target.reactionLabel = 'Benedict Test Positive: Red Cu2O Precipitate (Reducing Sugar Confirmed)';
          notify(`${target.name}: Heated! Alkaline Cu2+ reduced to brick-red insoluble Cu2O precipitate!`);
        }
        updated[selectedTubeIndex] = target;
        return updated;
      });
    } else {
      setWaterBathTempC(25);
    }
  };

  const handleResetBench = () => {
    setBurnerActive(false);
    setWaterBathTempC(25);
    setTestTubes([
      {
        id: 'tube-1',
        name: 'Tube 1 (Starch Test)',
        reagents: [],
        sample: 'starch',
        volumeMl: 5,
        temperatureC: 25,
        color: '#f8fafc',
        precipitate: null,
        reactionLabel: '1% Starch Suspension',
      },
      {
        id: 'tube-2',
        name: 'Tube 2 (Sugar Test)',
        reagents: [],
        sample: 'glucose',
        volumeMl: 5,
        temperatureC: 25,
        color: '#f1f5f9',
        precipitate: null,
        reactionLabel: 'Glucose Solution',
      },
      {
        id: 'tube-3',
        name: 'Tube 3 (Protein Test)',
        reagents: [],
        sample: 'albumin',
        volumeMl: 5,
        temperatureC: 25,
        color: '#f8fafc',
        precipitate: null,
        reactionLabel: 'Egg Albumin Extract',
      },
      {
        id: 'tube-4',
        name: 'Tube 4 (Lipid Test)',
        reagents: [],
        sample: 'oil',
        volumeMl: 5,
        temperatureC: 25,
        color: '#fef08a',
        precipitate: null,
        reactionLabel: 'Vegetable Oil Emulsion',
      },
    ]);
    notify('Workbench apparatus cleaned and reset to initial state.');
  };

  const notify = (msg: string) => {
    setNotification(msg);
    if (onLogObservation) {
      onLogObservation(msg);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl ${className}`}
    >
      {/* Workbench Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Biological Experiment Workbench</h3>
            <p className="text-xs text-slate-400">
              Interactive wet-lab assays, reagent dispensing, controlled water bath, and serial porcelain spotting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetBench}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-slate-300 hover:text-white"
          >
            Reset Bench
          </Button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-500/50 text-teal-200 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Bench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Reagent Shelf (Left 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-teal-400" />
              Reagent Dispensers
            </span>

            <div className="space-y-2">
              {[
                { id: 'iodine', name: "Lugol's Iodine", color: 'bg-amber-600', desc: 'Amylose starch complexation' },
                { id: 'benedict', name: "Benedict's Solution", color: 'bg-sky-500', desc: 'Reducing sugar redox test' },
                { id: 'biuret', name: 'Biuret Reagent (NaOH+CuSO4)', color: 'bg-purple-600', desc: 'Peptide bond detection' },
                { id: 'sudan-iii', name: 'Sudan III Stain', color: 'bg-rose-600', desc: 'Lipid fat ester staining' },
                { id: 'amylase', name: 'Salivary Amylase', color: 'bg-emerald-600', desc: 'Enzymatic starch hydrolysis' },
              ].map((reagent) => (
                <button
                  key={reagent.id}
                  onClick={() => handleAddReagent(reagent.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 hover:border-teal-500/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${reagent.color}`} />
                      <span className="font-bold text-slate-200 group-hover:text-teal-300">
                        {reagent.name}
                      </span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-4.5">{reagent.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature & Water Bath Controls */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Water Bath
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {waterBathTempC}°C
              </span>
            </div>

            <Button
              variant={burnerActive ? 'primary' : 'outline'}
              size="sm"
              onClick={handleApplyHeat}
              className="w-full"
              leftIcon={<Flame className="w-3.5 h-3.5" />}
            >
              {burnerActive ? 'Turn Off Water Bath' : 'Boil Water Bath (90°C)'}
            </Button>
          </div>
        </div>

        {/* Center: Test Tube Rack (6 columns) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
            {/* Wooden/Metal Test Tube Rack Base */}
            <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-inner">
              <div className="flex items-end justify-around gap-4 h-56 pb-4 border-b-4 border-slate-600">
                {testTubes.map((tube, index) => {
                  const isSelected = selectedTubeIndex === index;
                  return (
                    <div
                      key={tube.id}
                      onClick={() => setSelectedTubeIndex(index)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      {/* Individual Test Tube Glass Container */}
                      <div
                        className={`w-12 h-44 rounded-b-full border-2 transition-all relative flex flex-col justify-end p-1 overflow-hidden ${
                          isSelected
                            ? 'border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-105'
                            : 'border-slate-500 hover:border-slate-300'
                        } bg-slate-900/40`}
                      >
                        {/* Meniscus & Liquid fill */}
                        <div
                          className="w-full rounded-b-full transition-all duration-500 relative"
                          style={{
                            height: `${tube.volumeMl * 14}%`,
                            backgroundColor: tube.color,
                          }}
                        >
                          {/* Liquid surface highlight */}
                          <div className="w-full h-1.5 bg-white/30 rounded-full" />
                          {/* Precipitate settling at bottom */}
                          {tube.precipitate && (
                            <div className="absolute bottom-0 inset-x-0 h-4 bg-red-700 rounded-b-full opacity-90 animate-pulse" />
                          )}
                        </div>

                        {/* Glass Reflection glare */}
                        <div className="absolute top-2 left-1.5 w-1 h-32 bg-white/15 rounded-full pointer-events-none" />
                      </div>

                      {/* Label underneath */}
                      <span
                        className={`text-[11px] font-bold mt-2 truncate max-w-[80px] ${
                          isSelected ? 'text-teal-300' : 'text-slate-400'
                        }`}
                      >
                        Tube {index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Rack Floor */}
              <div className="h-3 w-full bg-slate-700 rounded-b-xl mt-1" />
            </div>

            {/* Selected Tube Live Status Display */}
            <div className="w-full max-w-md mt-4 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-100">{currentTube.name}</p>
                <p className="text-[11px] text-teal-300 font-mono mt-0.5">
                  {currentTube.reactionLabel}
                </p>
              </div>
              <Badge variant="success" className="text-[10px]">
                {currentTube.volumeMl} mL
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Porcelain Spotting Tile (3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                12-Well Spotting Tile
              </span>
              <span className="text-[10px] text-teal-400 font-mono">Amylase Assay</span>
            </div>

            {/* 12 Spotting wells grid */}
            <div className="p-3 bg-white rounded-xl shadow-inner grid grid-cols-4 gap-2 border border-slate-300">
              {spottingWells.map((well) => (
                <div
                  key={well.id}
                  className="flex flex-col items-center justify-center p-1 group"
                  title={well.label}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-slate-300 shadow-inner flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: well.color }}
                  >
                    <span className="text-[8px] font-mono font-bold text-slate-700 opacity-60">
                      {well.id + 1}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 mt-1 truncate max-w-[45px]">
                    {well.label.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
              <strong className="text-slate-200">Achromic Point Principle:</strong> As salivary amylase hydrolyzes starch into maltose, the deep blue-black iodine color fades to yellow (Well 10), marking complete digestion.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
