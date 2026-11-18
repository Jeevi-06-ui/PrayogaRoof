import React, { useState, useMemo } from 'react';
import {
  Sun,
  CloudRain,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export const StomataLab: React.FC = () => {
  const [lightLux, setLightLux] = useState<number>(1200);
  const [relativeHumidityPct, setRelativeHumidityPct] = useState<number>(50);
  const [waterStress, setWaterStress] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'schematic' | 'microscope'>('schematic');

  // Stomatal Aperture calculation (0 to 12 μm width)
  const apertureWidthUm = useMemo(() => {
    if (waterStress) return 0.2; // Closed under drought / ABA
    const lightFactor = Math.min(1, lightLux / 1000);
    const humidityFactor = relativeHumidityPct / 100;
    const aperture = 12 * lightFactor * (0.5 + 0.5 * humidityFactor);
    return Math.max(0.2, parseFloat(aperture.toFixed(1)));
  }, [lightLux, relativeHumidityPct, waterStress]);

  // Transpiration flux (mmol/(m²·s))
  const transpirationFlux = useMemo(() => {
    if (apertureWidthUm <= 0.5) return 0.2;
    // Driven by vapor pressure deficit and stomatal conductance
    const vpd = (100 - relativeHumidityPct) / 100;
    const flux = (apertureWidthUm / 12) * (vpd * 4.5 + 0.5);
    return parseFloat(flux.toFixed(2));
  }, [apertureWidthUm, relativeHumidityPct]);

  const guardCellTurgorBar = useMemo(() => {
    return waterStress ? 0 : Math.round((apertureWidthUm / 12) * 8);
  }, [apertureWidthUm, waterStress]);

  const handleReset = () => {
    setLightLux(1200);
    setRelativeHumidityPct(50);
    setWaterStress(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Stomata & Transpiration Mechanics</h3>
            <p className="text-xs text-slate-400">
              Guard cell turgor, potassium ion pump mechanism, microfibril radial deflection, and transpiration flux
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'schematic' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Diagrammatic Complex
            </button>
            <button
              onClick={() => setViewMode('microscope')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'microscope' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Epidermal Peel View
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Environmental Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Environmental Parameters
            </span>

            {/* Light Intensity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Solar Irradiance
                </span>
                <span className="font-mono text-amber-300 font-bold">{lightLux} Lux</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={lightLux}
                onChange={(e) => setLightLux(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Humidity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  Relative Humidity
                </span>
                <span className="font-mono text-blue-300 font-bold">{relativeHumidityPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={relativeHumidityPct}
                onChange={(e) => setRelativeHumidityPct(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            {/* Water Stress / ABA */}
            <div className="pt-2 border-t border-slate-700">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-900/60 hover:bg-slate-700/40 border border-slate-700 transition-colors">
                <div className="pr-2">
                  <p className="text-xs font-bold text-rose-300">Drought Stress / Abscisic Acid (ABA)</p>
                  <p className="text-[10px] text-slate-400">Triggers rapid potassium ion efflux</p>
                </div>
                <input
                  type="checkbox"
                  checked={waterStress}
                  onChange={(e) => setWaterStress(e.target.checked)}
                  className="rounded text-rose-500 bg-slate-700 border-slate-600 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Physiological Output Indicators */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Stomatal Pore Width:</span>
              <span className="font-mono text-emerald-300 font-bold">{apertureWidthUm} μm</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Guard Cell Turgor:</span>
              <span className="font-mono text-teal-300 font-bold">{guardCellTurgorBar} bar</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Transpiration Flux:</span>
              <span className="font-mono text-blue-300 font-bold">{transpirationFlux} mmol/(m²·s)</span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Visual Diagram */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full aspect-[16/10] bg-slate-950 rounded-3xl border border-slate-800 p-6 flex items-center justify-center relative overflow-hidden shadow-inner">
            {viewMode === 'schematic' ? (
              /* High-fidelity schematic of paired kidney-shaped guard cells */
              <svg viewBox="0 0 400 300" className="w-full h-full max-w-lg">
                {/* Sinuous Epidermal Pavement Cells */}
                <path d="M 20 50 Q 80 20 120 70 Q 150 120 90 140 Z" fill="#064e3b" fillOpacity="0.4" stroke="#047857" strokeWidth="2" />
                <path d="M 280 50 Q 340 30 380 90 Q 360 160 300 130 Z" fill="#064e3b" fillOpacity="0.4" stroke="#047857" strokeWidth="2" />
                <path d="M 30 180 Q 90 160 110 220 Q 80 280 20 250 Z" fill="#064e3b" fillOpacity="0.4" stroke="#047857" strokeWidth="2" />
                <path d="M 290 170 Q 360 180 370 240 Q 320 290 270 260 Z" fill="#064e3b" fillOpacity="0.4" stroke="#047857" strokeWidth="2" />

                {/* Stomatal Complex Center */}
                <g transform="translate(140, 50)">
                  {/* Left Guard Cell */}
                  <path
                    d={`M ${50 - apertureWidthUm * 2} 20 C ${10 - apertureWidthUm * 2} 50, ${10 - apertureWidthUm * 2} 150, ${50 - apertureWidthUm * 2} 180 C ${35 - apertureWidthUm} 140, ${35 - apertureWidthUm} 60, ${50 - apertureWidthUm * 2} 20 Z`}
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                  {/* Inner Thickened Cellulosic Wall Left */}
                  <path
                    d={`M ${50 - apertureWidthUm * 2} 20 C ${35 - apertureWidthUm} 60, ${35 - apertureWidthUm} 140, ${50 - apertureWidthUm * 2} 180`}
                    fill="none"
                    stroke="#022c22"
                    strokeWidth="5"
                    className="transition-all duration-300"
                  />

                  {/* Right Guard Cell */}
                  <path
                    d={`M ${70 + apertureWidthUm * 2} 20 C ${110 + apertureWidthUm * 2} 50, ${110 + apertureWidthUm * 2} 150, ${70 + apertureWidthUm * 2} 180 C ${85 + apertureWidthUm} 140, ${85 + apertureWidthUm} 60, ${70 + apertureWidthUm * 2} 20 Z`}
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                  {/* Inner Thickened Cellulosic Wall Right */}
                  <path
                    d={`M ${70 + apertureWidthUm * 2} 20 C ${85 + apertureWidthUm} 60, ${85 + apertureWidthUm} 140, ${70 + apertureWidthUm * 2} 180`}
                    fill="none"
                    stroke="#022c22"
                    strokeWidth="5"
                    className="transition-all duration-300"
                  />

                  {/* Stomatal Aperture (Center Gap) */}
                  <ellipse
                    cx="60"
                    cy="100"
                    rx={apertureWidthUm * 1.8}
                    ry="70"
                    fill="#022c22"
                    className="transition-all duration-300"
                  />

                  {/* Chloroplasts inside Guard Cells */}
                  {[
                    [32, 60], [28, 90], [30, 120], [35, 150],
                    [88, 60], [92, 90], [90, 120], [85, 150],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4.5" fill="#065f46" stroke="#022c22" strokeWidth="1" />
                  ))}

                  {/* Nuclei */}
                  <circle cx="26" cy="100" r="7" fill="#b91c1c" />
                  <circle cx="94" cy="100" r="7" fill="#b91c1c" />
                </g>
              </svg>
            ) : (
              /* Epidermal peel field under compound microscope */
              <div className="w-72 h-72 rounded-full border-4 border-slate-700 bg-emerald-950/40 relative flex items-center justify-center overflow-hidden">
                <div className="text-center p-4 space-y-1">
                  <p className="text-xs font-bold text-emerald-300">Microscopic Field (40x)</p>
                  <p className="text-[11px] text-slate-300">
                    Lower epidermis of Tradescantia zebrina stained with Safranin O.
                  </p>
                  <p className="text-xs text-teal-400 font-mono mt-2">
                    Stomata Density: ~240 stomata / mm²
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full mt-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-300">Potassium Ion Mechanism (Levitt):</strong> In light, protons (H⁺) are actively pumped out of guard cells, triggering K⁺ uptake via inward rectifying channels. Osmotic water potential drops, driving endosmosis. Radial cellulose microfibrils prevent lateral expansion, causing differential outer wall bowing and pore opening.
          </div>
        </div>
      </div>
    </div>
  );
};
