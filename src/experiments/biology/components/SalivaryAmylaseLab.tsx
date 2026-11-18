import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame,
  RotateCcw,
  Play,
  Pause,
  Droplets,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export const SalivaryAmylaseLab: React.FC = () => {
  const [temperatureC, setTemperatureC] = useState<number>(37);
  const [pH, setPH] = useState<number>(6.8);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Time to reach achromic point in minutes (bell-curve around 37°C and pH 6.8)
  const achromicTimeMinutes = useMemo(() => {
    // Temperature effect
    if (temperatureC < 10 || temperatureC > 75) return 999; // Inactive or denatured
    const tempFactor = Math.exp(-Math.pow(temperatureC - 37, 2) / 250);

    // pH effect
    if (pH < 4.5 || pH > 9.0) return 999; // Inactivated by extreme acidity/alkalinity
    const phFactor = Math.exp(-Math.pow(pH - 6.8, 2) / 1.8);

    const rate = tempFactor * phFactor;
    if (rate < 0.05) return 999;
    return Math.max(2, Math.round(5 / rate));
  }, [temperatureC, pH]);

  const isAchromicReached = elapsedMinutes >= achromicTimeMinutes && achromicTimeMinutes < 999;

  // 12 spotting wells (representing 1 to 12 minutes)
  const wells = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const min = i + 1;
      let color = '#172554'; // Blue-black (undigested starch)
      let label = 'Blue-Black (Starch)';

      if (min > elapsedMinutes) {
        // Not yet sampled
        color = '#334155';
        label = 'Empty Well';
      } else if (min >= achromicTimeMinutes && achromicTimeMinutes < 999) {
        // Achromic reached: iodine stays yellow
        color = '#fef08a';
        label = 'Pale Yellow (Achromic)';
      } else {
        // Transitional erythrodextrins
        const fraction = min / achromicTimeMinutes;
        if (fraction > 0.6) {
          color = '#7e22ce'; // Reddish-violet
          label = 'Violet (Dextrins)';
        } else if (fraction > 0.3) {
          color = '#1e3a8a'; // Deep blue
          label = 'Deep Blue';
        }
      }

      return { min, color, label };
    });
  }, [elapsedMinutes, achromicTimeMinutes]);

  // Timer interval
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsedMinutes((prev) => {
          if (prev >= 12 || (achromicTimeMinutes < 999 && prev >= achromicTimeMinutes + 2)) {
            setIsRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, achromicTimeMinutes]);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMinutes(0);
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
            <h3 className="text-lg font-bold text-white">Salivary Amylase Action & Enzyme Kinetics</h3>
            <p className="text-xs text-slate-400">
              Enzymatic starch hydrolysis, temperature/pH denaturation, and achromic point determination
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
        {/* Left: Enzyme Reaction Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-teal-400" />
              Incubation Factors
            </span>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Reaction Temperature:</span>
                <span className="font-mono text-amber-300 font-bold">{temperatureC}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                step="5"
                value={temperatureC}
                onChange={(e) => {
                  setTemperatureC(parseInt(e.target.value, 10));
                  handleReset();
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-slate-400">
                Optimum mammalian body temp: 37°C (denatures &gt;60°C)
              </span>
            </div>

            {/* pH Buffer Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">pH Buffer:</span>
                <span className="font-mono text-teal-300 font-bold">pH {pH.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.2"
                value={pH}
                onChange={(e) => {
                  setPH(parseFloat(e.target.value));
                  handleReset();
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <span className="text-[10px] text-slate-400">
                Salivary salivary amylase optimum: pH 6.8
              </span>
            </div>

            {/* Start Timer */}
            <div className="pt-2 border-t border-slate-700">
              <Button
                variant={isRunning ? 'outline' : 'primary'}
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
                className="w-full"
                leftIcon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {isRunning ? 'Pause Assay' : 'Begin Serial Spotting (1 min intervals)'}
              </Button>
            </div>
          </div>

          {/* Achromic Point Status */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Elapsed Time:</span>
              <span className="font-mono text-white font-bold">{elapsedMinutes} mins</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Expected Achromic Point:</span>
              <span className="font-mono text-teal-300 font-bold">
                {achromicTimeMinutes === 999 ? 'No Digestion (Denatured)' : `${achromicTimeMinutes} mins`}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Status:</span>
              <Badge variant={isAchromicReached ? 'success' : 'default'} className="text-[10px]">
                {isAchromicReached ? 'Achromic Point Reached ✓' : 'Hydrolysis Incomplete'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Center: 12-Well Porcelain Spotting Tile */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Porcelain Spotting Tile (1 Drop Iodine + 1 Drop Reaction Mixture Every Minute)
            </span>

            {/* Spotting Tile Porcelain Plate */}
            <div className="w-full max-w-lg bg-slate-100 rounded-2xl p-5 shadow-2xl border-2 border-slate-300 grid grid-cols-4 gap-4">
              {wells.map((well) => (
                <div key={well.min} className="flex flex-col items-center p-2 rounded-xl bg-slate-200/50">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-slate-400 shadow-inner flex items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: well.color }}
                  >
                    <span className="text-xs font-mono font-bold text-slate-700 opacity-60">
                      {well.min}m
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 mt-1 truncate max-w-[70px]">
                    {well.label.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-teal-300">Enzymatic Digestion Progression:</strong> Starch (amylose) forms an intense blue-black coordinate inclusion complex with $I_3^-$. Salivary amylase ($\alpha$-amylase) randomly hydrolyzes internal $\alpha$-(1$\rightarrow$4) glucosidic bonds, yielding soluble dextrins, erythrodextrins (violet/red), and finally achrodextrins and maltose which do not form a colored complex with iodine. The moment iodine remains yellow marks the <strong className="text-white">Achromic Point</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
