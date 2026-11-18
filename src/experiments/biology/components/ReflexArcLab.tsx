import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export const ReflexArcLab: React.FC = () => {
  const [stimulusType, setStimulusType] = useState<'patellar-tap' | 'thermal-pin'>('patellar-tap');
  const [activeStep, setActiveStep] = useState<number>(0);

  const reflexStages = [
    { name: '1. Sensory Receptor', desc: 'Muscle spindle detects sudden stretch from reflex hammer tap.' },
    { name: '2. Afferent Sensory Axon', desc: 'Action potential propagates via pseudounipolar neuron through dorsal root ganglion (DRG).' },
    { name: '3. Spinal Cord Interneuron', desc: 'Excitatory neurotransmitter (glutamate) released across synapse in dorsal horn grey matter.' },
    { name: '4. Efferent Motor Neuron', desc: 'Ventral horn alpha-motor neuron fires action potential to spinal ventral root.' },
    { name: '5. Effector Muscle Twitch', desc: 'Acetylcholine at neuromuscular junction triggers rapid quadriceps contraction (knee jerk).' },
  ];

  const handleTriggerStimulus = () => {
    setActiveStep(1);

    // Step through the reflex arc rapidly (total latency ~25 ms)
    setTimeout(() => setActiveStep(2), 200);
    setTimeout(() => setActiveStep(3), 400);
    setTimeout(() => setActiveStep(4), 600);
    setTimeout(() => setActiveStep(5), 800);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Reflex Arc & Neural Pathway Simulation</h3>
            <p className="text-xs text-slate-400">
              Sensory receptor, dorsal root ganglion, spinal interneuron, motor neuron, and effector muscle response
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
        {/* Left: Stimulus Trigger & Pathway Steps */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Apply Somatic Stimulus
            </span>

            <div className="space-y-1.5">
              <span className="text-xs text-slate-300">Stimulus Mechanism:</span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'patellar-tap', label: 'Patellar Knee Tap' },
                    { id: 'thermal-pin', label: 'Thermal Pain Withdrawal' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => { setStimulusType(st.id); handleReset(); }}
                    className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                      stimulusType === st.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleTriggerStimulus}
              className="w-full"
              leftIcon={<Zap className="w-3.5 h-3.5 text-amber-300" />}
            >
              Trigger Reflex Stimulus
            </Button>
          </div>

          {/* Neural Pathway Sequence */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Sequential Arc Pathway
            </span>
            <div className="space-y-1.5">
              {reflexStages.map((stg, i) => {
                const isActive = activeStep === i + 1;
                const isPassed = activeStep > i + 1;
                return (
                  <div
                    key={stg.name}
                    className={`p-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 font-bold'
                        : isPassed
                        ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900/40 text-slate-500'
                    }`}
                  >
                    <p>{stg.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{stg.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Anatomical Spinal Cross-Section Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[340px]">
            <svg viewBox="0 0 450 280" className="w-full h-full max-w-lg">
              {/* Spinal Cord Cross-Section (Butterfly grey matter inside white matter) */}
              <ellipse cx="280" cy="140" rx="90" ry="75" fill="#1e293b" stroke="#475569" strokeWidth="3" />
              {/* Butterfly Grey Matter */}
              <path
                d="M 280 140 C 260 110, 230 100, 230 120 C 230 135, 260 140, 250 160 C 240 180, 260 190, 280 155 C 300 190, 320 180, 310 160 C 300 140, 330 135, 330 120 C 330 100, 300 110, 280 140 Z"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Receptor (Skin / Tendon on left) */}
              <g transform="translate(40, 70)">
                <rect x="0" y="0" width="30" height="40" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                <text x="15" y="24" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">Receptor</text>
              </g>

              {/* Effector Muscle on left bottom */}
              <g transform="translate(40, 180)">
                <ellipse cx="20" cy="25" rx="30" ry="20" fill={activeStep === 5 ? '#ef4444' : '#991b1b'} stroke="#b91c1c" strokeWidth="2" className={activeStep === 5 ? 'animate-bounce' : ''} />
                <text x="20" y="28" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Effector</text>
              </g>

              {/* Afferent Sensory Neuron (Dorsal Root) */}
              <path
                d="M 70 85 Q 160 80 230 110"
                fill="none"
                stroke={activeStep >= 2 ? '#f59e0b' : '#64748b'}
                strokeWidth="3.5"
                strokeDasharray={activeStep === 2 ? '4 2' : 'none'}
              />
              {/* Dorsal Root Ganglion (DRG) swelling */}
              <circle cx="160" cy="85" r="9" fill="#d97706" stroke="#b45309" strokeWidth="2" />
              <text x="160" y="70" textAnchor="middle" fill="#fde047" fontSize="8">DRG</text>

              {/* Interneuron in Spinal Grey Matter */}
              <path
                d="M 235 115 Q 260 140 240 165"
                fill="none"
                stroke={activeStep >= 3 ? '#10b981' : '#475569'}
                strokeWidth="4"
              />

              {/* Efferent Motor Neuron (Ventral Root) */}
              <path
                d="M 240 165 Q 150 180 70 195"
                fill="none"
                stroke={activeStep >= 4 ? '#ef4444' : '#64748b'}
                strokeWidth="3.5"
                strokeDasharray={activeStep === 4 ? '4 2' : 'none'}
              />
            </svg>

            {/* Neural Transmission Latency Display */}
            <div className="w-full max-w-md mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Reflex Latency:</span>
              <span className="text-amber-300 font-bold">~24.5 ms (Monosynaptic/Polysynaptic)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Monosynaptic vs Polysynaptic Reflexes:</strong> The patellar knee-jerk reflex is primarily monosynaptic: sensory afferents directly synapse onto alpha motor neurons in the spinal cord without brain intervention, ensuring an ultra-fast involuntary protective response.
          </div>
        </div>
      </div>
    </div>
  );
};
