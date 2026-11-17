/**
 * Crystallisation Scientific Model
 * Substance: Copper(II) Sulphate Pentahydrate (CuSO₄·5H₂O)
 * Curriculum: CBSE Class 9 (Ch 2 Is Matter Around Us Pure), ICSE Class 9
 * 
 * Physical Principle:
 * - Solubility of solid solutes increases with solvent temperature.
 * - S(T) represents maximum grams of anhydrous CuSO₄ that dissolve in 100 g H₂O at temperature T (°C).
 * - Solubility curve empirical model: S(T) = 14.3 + 0.25*T + 0.003*T²
 * - When a hot saturated solution is cooled or solvent evaporates, the solution becomes supersaturated.
 * - Solute in excess of the cold equilibrium solubility precipitates out as pure, crystalline
 *   triclinic copper sulphate pentahydrate: CuSO₄(aq) + 5H₂O(l) → CuSO₄·5H₂O(s).
 * 
 * Documented Assumptions:
 * 1. Equilibrium solubility governs maximum dissolved concentration (no prolonged metastable supersaturation).
 * 2. Uniform solution temperature throughout evaporating dish.
 * 3. Evaporation rate is proportional to solution temperature and exposed surface area.
 * 4. Yield reflects thermodynamic equilibrium without claiming atomic-scale nucleation simulation.
 */

export interface CrystallisationParams {
  soluteMassGrams?: number;
  initialSoluteMassG?: number;
  initialSolventVolumeMl?: number;
  initialWaterVolumeMl?: number;
  solventVolumeMl?: number;
  temperatureC?: number;
  tempC?: number;
  evaporationTimeMins?: number;
  isHeating?: boolean;
}

export interface CrystallisationState {
  temperatureC: number;
  solventVolumeMl: number;
  remainingWaterMl: number; // alias
  soluteMassGrams: number;
  solubilityLimitGrams: number; // Max grams dissolvable in current solvent volume at current T
  concentrationGPer100Ml: number;
  saturationRatio: number; // Concentration / Solubility (1.0 = saturated, >1.0 = supersaturated)
  saturationStatus: 'unsaturated' | 'saturated' | 'supersaturated';
  crystalYieldGrams: number; // Mass of crystallized CuSO4·5H2O
  crystalGrowthPercentage: number; // 0 to 100% visualization progress
  crystalGrowthPercent: number; // alias
  crystalAppearance: string;
  crystalDescription: string; // alias
  observationText: string;
}

export const CRYSTALLISATION_ASSUMPTIONS = Object.assign(
  [
    'Equilibrium thermal solubility model: S(T) = 14.3 + 0.25*T + 0.003*T² (g CuSO₄ / 100 mL H₂O).',
    'Solvent evaporation rate increases non-linearly with heating temperature (higher rate near 85-100°C).',
    'Crystallisation occurs when dissolved concentration exceeds temperature-dependent equilibrium saturation.',
    'Crystal mass yield accounts for pentahydrate water of crystallization: M(CuSO₄·5H₂O) / M(CuSO₄) ≈ 1.564.',
    'Simplified macroscopic educational model; molecular-scale lattice defects are not simulated.',
  ],
  {
    crystalHabit: 'Triclinic pinacoidal crystals of copper(II) sulphate pentahydrate',
    hydrateFormula: 'CuSO₄·5H₂O',
    hydrateMolarMass: 249.68,
    anhydrousMolarMass: 159.61,
    assumptions: [
      'Equilibrium thermal solubility model: S(T) = 14.3 + 0.25*T + 0.003*T² (g CuSO₄ / 100 mL H₂O).',
      'Solvent evaporation rate increases non-linearly with heating temperature (higher rate near 85-100°C).',
      'Crystallisation occurs when dissolved concentration exceeds temperature-dependent equilibrium saturation.',
      'Crystal mass yield accounts for pentahydrate water of crystallization: M(CuSO₄·5H₂O) / M(CuSO₄) ≈ 1.564.',
      'Simplified macroscopic educational model; molecular-scale lattice defects are not simulated.',
    ],
  }
);

/**
 * Calculates equilibrium solubility of anhydrous copper sulphate (g / 100 mL H2O) at temperature T (°C)
 */
export function calculateSolubility(tempC: number): number {
  const t = Math.max(0, Math.min(100, tempC));
  const s = 14.3 + 0.25 * t + 0.003 * Math.pow(t, 2);
  return Number(s.toFixed(1));
}

/**
 * Calculates crystallization parameters based on solute mass, solvent volume, temperature, and evaporation
 */
export function calculateCrystallisation(
  soluteOrParams: number | CrystallisationParams,
  initialSolventVolumeMl?: number,
  tempC?: number,
  evaporationTimeMins: number = 0,
  isHeating: boolean = false
): CrystallisationState {
  let soluteMassGrams = 20;
  let initialSolvent = 50;
  let temperatureVal = 85;
  let evapTime = evaporationTimeMins;
  let heatingApplied = isHeating;

  if (typeof soluteOrParams === 'object') {
    soluteMassGrams = soluteOrParams.soluteMassGrams ?? soluteOrParams.initialSoluteMassG ?? 20;
    initialSolvent =
      soluteOrParams.initialSolventVolumeMl ??
      soluteOrParams.initialWaterVolumeMl ??
      soluteOrParams.solventVolumeMl ??
      50;
    temperatureVal = soluteOrParams.temperatureC ?? soluteOrParams.tempC ?? 85;
    evapTime = soluteOrParams.evaporationTimeMins ?? 0;
    heatingApplied = soluteOrParams.isHeating ?? false;
  } else {
    soluteMassGrams = soluteOrParams;
    initialSolvent = initialSolventVolumeMl ?? 50;
    temperatureVal = tempC ?? 85;
  }

  const temperature = Math.max(10, Math.min(100, temperatureVal));

  // 1. Evaporation solvent loss
  // Evaporation rate (mL / min) depends on temperature and active flame heating
  let evapRateMlPerMin = 0.1; // Baseline ambient evaporation
  if (heatingApplied) {
    evapRateMlPerMin = 0.5 + Math.pow(temperature / 100, 2) * 2.5; // up to ~3.0 mL/min at boiling
  }
  const solventLost = evapRateMlPerMin * Math.max(0, evapTime);
  const remainingSolvent = Math.max(5.0, Number((initialSolvent - solventLost).toFixed(1)));

  // 2. Maximum dissolvable anhydrous solute in remaining solvent
  const solubilityPer100 = calculateSolubility(temperature);
  const maxDissolvableGrams = Number(((solubilityPer100 * remainingSolvent) / 100).toFixed(2));

  // 3. Dissolved concentration and saturation ratio
  const concentration = Number(((soluteMassGrams / remainingSolvent) * 100).toFixed(1));
  const saturationRatio = Number((concentration / solubilityPer100).toFixed(2));

  let saturationStatus: CrystallisationState['saturationStatus'] = 'unsaturated';
  let excessSoluteAnhydrous = 0;
  let crystalYieldGrams = 0;
  let growthPct = 0;
  let appearance = '';
  let obs = '';

  if (soluteMassGrams > maxDissolvableGrams) {
    // Supersaturated / Crystallizing
    saturationStatus = 'supersaturated';
    excessSoluteAnhydrous = soluteMassGrams - maxDissolvableGrams;
    // 1.564 factor converts anhydrous CuSO4 to pentahydrate crystal CuSO4·5H2O
    crystalYieldGrams = Number((excessSoluteAnhydrous * 1.564).toFixed(2));
    growthPct = Math.min(
      100,
      Number(((crystalYieldGrams / (soluteMassGrams * 1.564)) * 100).toFixed(1))
    );
    appearance = `Brilliant deep royal blue triclinic crystals deposited (${crystalYieldGrams} g harvested).`;
    obs = `Crystallisation Active: Solution cooled or concentrated below saturation limit. Solute precipitated into ${crystalYieldGrams} g of pure rhombic CuSO₄·5H₂O crystals (T = ${temperature}°C, Solvent = ${remainingSolvent} mL).`;
  } else if (Math.abs(soluteMassGrams - maxDissolvableGrams) <= 1.0) {
    // Saturated (Crystallization point)
    saturationStatus = 'saturated';
    growthPct = 5;
    appearance =
      'Saturated mother liquor: Micro-crystalline crust forming at the rim and stirring rod tip.';
    obs = `Crystallization Point Reached: Solution is fully saturated (${concentration} g/100mL at ${temperature}°C). Slow cooling will yield large pure crystals.`;
  } else {
    // Unsaturated
    saturationStatus = 'unsaturated';
    growthPct = 0;
    appearance =
      'Homogeneous clear royal blue solution (all solute dissolved; no crystals).';
    obs = `Unsaturated Solution: ${soluteMassGrams} g dissolved in ${remainingSolvent} mL water at ${temperature}°C (${solubilityPer100} g/100mL capacity available). Heat or evaporate further to reach saturation.`;
  }

  return {
    temperatureC: temperature,
    solventVolumeMl: remainingSolvent,
    remainingWaterMl: remainingSolvent,
    soluteMassGrams,
    solubilityLimitGrams: maxDissolvableGrams,
    concentrationGPer100Ml: concentration,
    saturationRatio,
    saturationStatus,
    crystalYieldGrams,
    crystalGrowthPercentage: growthPct,
    crystalGrowthPercent: growthPct,
    crystalAppearance: appearance,
    crystalDescription: appearance,
    observationText: obs,
  };
}
