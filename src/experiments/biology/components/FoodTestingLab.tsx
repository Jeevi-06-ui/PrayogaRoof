import React, { useState } from 'react';
import {
  FlaskConical,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export type FoodSampleType = 'potato' | 'glucose' | 'albumin' | 'oil' | 'unknown-x';

export const FoodTestingLab: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<FoodSampleType>('potato');
  const [activeTest, setActiveTest] = useState<'iodine' | 'benedict' | 'biuret' | 'sudan'>('iodine');
  const [isHeated, setIsHeated] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    color: string;
    precipitate: string | null;
    inference: string;
    isPositive: boolean;
  }>({
    color: '#f8fafc',
    precipitate: null,
    inference: 'Click "Run Assay" to dispense reagents.',
    isPositive: false,
  });

  const handleRunTest = () => {
    let color = '#f8fafc';
    let precipitate: string | null = null;
    let inference = '';
    let isPositive = false;

    if (activeTest === 'iodine') {
      if (selectedSample === 'potato' || selectedSample === 'unknown-x') {
        color = '#172554'; // Blue-black
        inference = 'Positive: Blue-black coloration confirms presence of starch (amylose helical complex).';
        isPositive = true;
      } else {
        color = '#fef08a'; // Yellowish brown
        inference = 'Negative: Iodine remains yellow-brown; no starch detected.';
      }
    } else if (activeTest === 'benedict') {
      if (!isHeated) {
        color = '#38bdf8'; // Benedict blue
        inference = 'Benedict reagent added. Requires heating to boiling point (>85°C) to induce redox reaction!';
      } else if (selectedSample === 'glucose') {
        color = '#b91c1c'; // Brick-red
        precipitate = 'Brick-Red Cuprous Oxide (Cu2O)';
        inference = 'Positive: Brick-red precipitate confirms reducing sugar (free aldehyde/ketone group).';
        isPositive = true;
      } else {
        color = '#0284c7'; // Clear blue
        inference = 'Negative: Solution remains clear blue after boiling; no reducing sugars.';
      }
    } else if (activeTest === 'biuret') {
      if (selectedSample === 'albumin' || selectedSample === 'unknown-x') {
        color = '#7c3aed'; // Violet-purple
        inference = 'Positive: Violet/purple coloration confirms peptide bonds (copper coordination).';
        isPositive = true;
      } else {
        color = '#93c5fd'; // Pale blue
        inference = 'Negative: Remains pale blue CuSO4; no protein present.';
      }
    } else if (activeTest === 'sudan') {
      if (selectedSample === 'oil') {
        color = '#dc2626'; // Scarlet red
        precipitate = 'Red Lipid Layer';
        inference = 'Positive: Scarlet red oily globules confirm lipid / fat content.';
        isPositive = true;
      } else {
        color = '#fecdd3';
        inference = 'Negative: Sudan III does not form concentrated red globules; no lipids.';
      }
    }

    setTestResult({ color, precipitate, inference, isPositive });
  };

  const handleReset = () => {
    setIsHeated(false);
    setTestResult({
      color: '#f8fafc',
      precipitate: null,
      inference: 'Assay reset. Select a sample and test to proceed.',
      isPositive: false,
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Food Component Qualitative Biochemical Assays</h3>
            <p className="text-xs text-slate-400">
              Iodine test (starch), Benedict&apos;s test (sugars), Biuret test (protein), and Sudan III assay (lipids)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sample & Reagent Selectors */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sample Select */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Select Food Extract
            </span>
            <div className="space-y-1.5">
              {[
                { id: 'potato', name: 'Potato Tuber Extract (Starch)' },
                { id: 'glucose', name: 'Glucose Solution (Monosaccharide)' },
                { id: 'albumin', name: 'Egg Albumin (Protein)' },
                { id: 'oil', name: 'Vegetable Cooking Oil (Lipid)' },
                { id: 'unknown-x', name: 'Unknown Food Sample X' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSample(s.id as any); handleReset(); }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all ${
                    selectedSample === s.id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Assay Method Select */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Biochemical Assay
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'iodine', name: 'Iodine Test', desc: 'Starch' },
                { id: 'benedict', name: 'Benedict Test', desc: 'Reducing Sugar' },
                { id: 'biuret', name: 'Biuret Test', desc: 'Protein' },
                { id: 'sudan', name: 'Sudan III Test', desc: 'Fats / Oil' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTest(t.id as any); handleReset(); }}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    activeTest === t.id
                      ? 'bg-teal-950/40 border-teal-500 text-teal-300 font-bold'
                      : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p>{t.name}</p>
                  <p className="text-[10px] text-slate-500">{t.desc}</p>
                </button>
              ))}
            </div>

            {/* Heating control for Benedict */}
            {activeTest === 'benedict' && (
              <div className="pt-2 border-t border-slate-700">
                <Button
                  variant={isHeated ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setIsHeated(!isHeated)}
                  className="w-full"
                  leftIcon={<Flame className="w-3.5 h-3.5" />}
                >
                  {isHeated ? 'Water Bath Boiling (95°C) ✓' : 'Heat in Boiling Water Bath'}
                </Button>
              </div>
            )}

            <Button variant="primary" size="sm" onClick={handleRunTest} className="w-full mt-2">
              Run Assay & Dispense Reagents
            </Button>
          </div>
        </div>

        {/* Center: Test Tube Reaction Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
            {/* Reaction Test Tube */}
            <div className="w-20 h-56 rounded-b-full border-4 border-slate-500 bg-slate-900/60 relative flex flex-col justify-end p-2 overflow-hidden shadow-2xl">
              {/* Reacted liquid fill */}
              <div
                className="w-full rounded-b-full transition-all duration-700 relative"
                style={{
                  height: '70%',
                  backgroundColor: testResult.color,
                }}
              >
                <div className="w-full h-2 bg-white/20 rounded-full" />
                {testResult.precipitate && (
                  <div className="absolute bottom-0 inset-x-0 h-6 bg-red-800 rounded-b-full opacity-90 animate-pulse" />
                )}
              </div>
              {/* Glass shine */}
              <div className="absolute top-4 left-2 w-1.5 h-44 bg-white/10 rounded-full pointer-events-none" />
            </div>

            {/* Live Observation Banner */}
            <div className="w-full max-w-md mt-6 p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Experimental Deduction:</span>
                <Badge variant={testResult.isPositive ? 'success' : 'default'}>
                  {testResult.isPositive ? 'Positive Reaction ✓' : 'Negative Reaction'}
                </Badge>
              </div>
              <p className="text-slate-300 leading-relaxed font-mono">{testResult.inference}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
