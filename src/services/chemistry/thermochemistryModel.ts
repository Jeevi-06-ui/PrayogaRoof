/**
 * Thermochemistry & Calorimetry Scientific Model
 * Curriculum: CBSE Class 12 Chemistry Practical (Enthalpy of Neutralization and Solution)
 * 
 * Reactions Modeled:
 * 1. Neutralization of Strong Acid with Strong Base:
 *    HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)  [Theoretical ΔH° = -57.32 kJ/mol]
 * 2. Neutralization of Weak Acid with Strong Base:
 *    CH3COOH(aq) + NaOH(aq) -> CH3COONa(aq) + H2O(l)  [Theoretical ΔH° = -55.90 kJ/mol]
 * 3. Enthalpy of Solution of KNO3 (Endothermic):
 *    KNO3(s) + aq -> K+(aq) + NO3-(aq)  [Theoretical ΔH° = +35.60 kJ/mol]
 * 4. Enthalpy of Solution of CuSO4·5H2O (Endothermic):
 *    CuSO4·5H2O(s) + aq -> Cu2+(aq) + SO4(2-)(aq)  [Theoretical ΔH° = +11.70 kJ/mol]
 * 
 * Principles:
 * - Heat evolved or absorbed: q = (m * c + W) * ΔT
 *   where m = mass of solution (g), c = 4.184 J/(g*K), W = water equivalent of calorimeter (J/K).
 * - Enthalpy change per mole: ΔH = -q / n_limiting (kJ/mol for exothermic, positive for endothermic).
 */

export type CalorimeterReactionType =
  | 'neutralization-hcl-naoh'
  | 'neutralization-ch3cooh-naoh'
  | 'solution-kno3'
  | 'solution-cuso4';

export interface ReactionMetadata {
  id: CalorimeterReactionType;
  name: string;
  equation: string;
  theoreticalDeltaH: number; // kJ/mol (negative = exothermic, positive = endothermic)
  reactantADefault: { name: string; volumeMl: number; molarity: number; tempC: number };
  reactantBDefault: { name: string; volumeMl: number; molarity: number; tempC: number };
  isNeutralization: boolean;
  notes: string;
}

export const THERMO_REACTIONS: Record<CalorimeterReactionType, ReactionMetadata> = {
  'neutralization-hcl-naoh': {
    id: 'neutralization-hcl-naoh',
    name: 'Neutralization: 1.0M HCl + 1.0M NaOH (Strong Acid - Strong Base)',
    equation: 'H⁺(aq) + OH⁻(aq) → H₂O(l)',
    theoreticalDeltaH: -57.32, // kJ/mol
    reactantADefault: { name: '1.0M Hydrochloric Acid (HCl)', volumeMl: 50.0, molarity: 1.0, tempC: 22.0 },
    reactantBDefault: { name: '1.0M Sodium Hydroxide (NaOH)', volumeMl: 50.0, molarity: 1.0, tempC: 22.0 },
    isNeutralization: true,
    notes: 'Exothermic neutralization forming 0.050 mol H2O. Constant ΔH° = -57.32 kJ/mol represents formation of water from hydronium and hydroxide.',
  },
  'neutralization-ch3cooh-naoh': {
    id: 'neutralization-ch3cooh-naoh',
    name: 'Neutralization: 1.0M CH₃COOH + 1.0M NaOH (Weak Acid - Strong Base)',
    equation: 'CH₃COOH(aq) + OH⁻(aq) → CH₃COO⁻(aq) + H₂O(l)',
    theoreticalDeltaH: -55.90, // kJ/mol (less heat due to enthalpy of dissociation of acetic acid)
    reactantADefault: { name: '1.0M Acetic Acid (CH₃COOH)', volumeMl: 50.0, molarity: 1.0, tempC: 22.0 },
    reactantBDefault: { name: '1.0M Sodium Hydroxide (NaOH)', volumeMl: 50.0, molarity: 1.0, tempC: 22.0 },
    isNeutralization: true,
    notes: 'Slightly less exothermic because ~1.4 kJ/mol is consumed in complete ionisation of weakly dissociated acetic acid molecules.',
  },
  'solution-kno3': {
    id: 'solution-kno3',
    name: 'Enthalpy of Solution: Potassium Nitrate (KNO₃)',
    equation: 'KNO₃(s) + aq → K⁺(aq) + NO₃⁻(aq)',
    theoreticalDeltaH: +35.60, // kJ/mol (endothermic)
    reactantADefault: { name: 'Deionized Distilled Water', volumeMl: 100.0, molarity: 0, tempC: 22.0 },
    reactantBDefault: { name: 'Potassium Nitrate Crystals (KNO₃)', volumeMl: 5.0, molarity: 0.05, tempC: 22.0 }, // 0.05 mol
    isNeutralization: false,
    notes: 'Endothermic dissolution: Lattice energy exceeds hydration enthalpy, causing temperature drop.',
  },
  'solution-cuso4': {
    id: 'solution-cuso4',
    name: 'Enthalpy of Solution: Hydrated Copper(II) Sulphate (CuSO₄·5H₂O)',
    equation: 'CuSO₄·5H₂O(s) + aq → Cu²⁺(aq) + SO₄²⁻(aq) + 5H₂O(l)',
    theoreticalDeltaH: +11.70, // kJ/mol (endothermic)
    reactantADefault: { name: 'Deionized Distilled Water', volumeMl: 100.0, molarity: 0, tempC: 22.0 },
    reactantBDefault: { name: 'CuSO₄·5H₂O Blue Crystals', volumeMl: 5.0, molarity: 0.04, tempC: 22.0 },
    isNeutralization: false,
    notes: 'Endothermic dissolution for pentahydrate crystals, in contrast to anhydrous CuSO4 which dissolves strongly exothermically.',
  },
};

export interface CalorimetryParams {
  reactionType: CalorimeterReactionType;
  volumeAcidMl: number;
  molarityAcid: number;
  volumeBaseMl: number;
  molarityBase: number;
  initialTempC: number;
  waterEquivalentW: number; // J/K (calorimeter heat constant)
  isMixed: boolean;
  elapsedSeconds: number;
}

export interface CalorimetryState {
  reaction: ReactionMetadata;
  molesReacted: number;
  totalMassGrams: number;
  calorimeterHeatCapacityJoulePerK: number;
  theoreticalDeltaT: number;
  currentTempC: number;
  peakTempC: number;
  heatEvolvedJoules: number;
  experimentalDeltaH: number; // kJ/mol
  theoreticalDeltaH: number;
  errorPercent: number;
  observationStatus: string;
  isExothermic: boolean;
  coolingCurve: Array<{ timeSec: number; tempC: number }>;
  assumptions: string[];
}

export const THERMOCHEMISTRY_ASSUMPTIONS = [
  'Polystyrene cup calorimeter has negligible heat capacity and provides near-adiabatic thermal insulation.',
  'Density of dilute aqueous solutions is assumed equal to pure water (1.00 g/mL).',
  'Specific heat capacity of aqueous solution is taken as 4.184 J/(g·K).',
  'Mixing occurs instantaneously; peak temperature is corrected for Newton cooling back to mixing instant.',
  'Theoretical enthalpy of neutralization for strong acid and strong base is -57.32 kJ/mol at 298 K.',
];

const SPECIFIC_HEAT_WATER = 4.184; // J/(g*K)

/**
 * Calculates calorimetry simulation state
 */
export function calculateCalorimetryState(params: CalorimetryParams): CalorimetryState {
  const reaction = THERMO_REACTIONS[params.reactionType] || THERMO_REACTIONS['neutralization-hcl-naoh'];
  const vAcid = Math.max(1, params.volumeAcidMl);
  const mAcid = Math.max(0.01, params.molarityAcid);
  const vBase = Math.max(1, params.volumeBaseMl);
  const mBase = Math.max(0.01, params.molarityBase);
  const t0 = Math.max(5, Math.min(50, params.initialTempC));
  const wEq = Math.max(0, params.waterEquivalentW ?? 25.0);
  const isMixed = Boolean(params.isMixed);
  const elapsed = Math.max(0, params.elapsedSeconds);

  // Moles of limiting reagent / water formed
  const molesAcid = (vAcid * mAcid) / 1000;
  const molesBase = (vBase * mBase) / 1000;
  const molesReacted = reaction.isNeutralization
    ? Math.min(molesAcid, molesBase)
    : 0.050; // standard solution run

  const totalMassGrams = vAcid + vBase; // density ~ 1.0 g/mL
  const totalHeatCapacity = totalMassGrams * SPECIFIC_HEAT_WATER + wEq; // J/K

  // Theoretical heat q = -ΔH * moles
  const theoreticalHeatJoules = -reaction.theoreticalDeltaH * 1000 * molesReacted;
  const theoreticalDeltaT = Number((theoreticalHeatJoules / totalHeatCapacity).toFixed(2));
  const theoreticalPeakT = Number((t0 + theoreticalDeltaT).toFixed(2));

  // Dynamic temperature evolution:
  // Mixing happens at t = 10s.
  // Rise/drop occurs over 15s (10s to 25s).
  // Beyond 25s, gentle Newton cooling towards ambient t0.
  let currentTemp = t0;
  let peakTemp = t0;

  if (isMixed) {
    if (elapsed < 10) {
      currentTemp = t0;
      peakTemp = t0;
    } else if (elapsed <= 25) {
      const progress = (elapsed - 10) / 15;
      currentTemp = Number((t0 + theoreticalDeltaT * progress).toFixed(2));
      peakTemp = currentTemp;
    } else {
      // Cooling phase: T(t) = t0 + ΔT * exp(-k * (t - 25))
      const kCool = 0.0015; // slow heat leakage from polystyrene cup
      const cooledDelta = theoreticalDeltaT * Math.exp(-kCool * (elapsed - 25));
      currentTemp = Number((t0 + cooledDelta).toFixed(2));
      peakTemp = theoreticalPeakT;
    }
  }

  const measuredDeltaT = Number((peakTemp - t0).toFixed(2));
  const heatEvolvedJoules = Number((totalHeatCapacity * measuredDeltaT).toFixed(1));

  let experimentalDeltaH = 0;
  let errorPercent = 0;

  if (isMixed && molesReacted > 0.0001 && Math.abs(measuredDeltaT) > 0.1) {
    experimentalDeltaH = Number((-(heatEvolvedJoules / molesReacted) / 1000).toFixed(2));
    errorPercent = Number(
      (Math.abs((experimentalDeltaH - reaction.theoreticalDeltaH) / reaction.theoreticalDeltaH) * 100).toFixed(2)
    );
  }

  let observationStatus = 'Reactants separated. Calorimeter equilibrated at ambient temperature.';
  if (isMixed) {
    if (reaction.theoreticalDeltaH < 0) {
      observationStatus = `Exothermic reaction: Rapid temperature rise ΔT = +${measuredDeltaT}°C. Enthalpy ΔH_neut = ${experimentalDeltaH} kJ/mol (Theoretical: ${reaction.theoreticalDeltaH} kJ/mol, Error: ${errorPercent}%).`;
    } else {
      observationStatus = `Endothermic dissolution: Temperature fell ΔT = ${measuredDeltaT}°C. Enthalpy of solution ΔH_sol = +${Math.abs(experimentalDeltaH)} kJ/mol.`;
    }
  }

  // Pre-calculate full 120-second cooling curve
  const coolingCurve: Array<{ timeSec: number; tempC: number }> = [];
  for (let s = 0; s <= 120; s += 5) {
    if (s < 10) {
      coolingCurve.push({ timeSec: s, tempC: t0 });
    } else if (s <= 25) {
      const p = (s - 10) / 15;
      coolingCurve.push({ timeSec: s, tempC: Number((t0 + theoreticalDeltaT * p).toFixed(2)) });
    } else {
      const cd = theoreticalDeltaT * Math.exp(-0.0015 * (s - 25));
      coolingCurve.push({ timeSec: s, tempC: Number((t0 + cd).toFixed(2)) });
    }
  }

  return {
    reaction,
    molesReacted: Number(molesReacted.toFixed(4)),
    totalMassGrams,
    calorimeterHeatCapacityJoulePerK: Number(totalHeatCapacity.toFixed(1)),
    theoreticalDeltaT,
    currentTempC: currentTemp,
    peakTempC: peakTemp,
    heatEvolvedJoules,
    experimentalDeltaH,
    theoreticalDeltaH: reaction.theoreticalDeltaH,
    errorPercent,
    observationStatus,
    isExothermic: reaction.theoreticalDeltaH < 0,
    coolingCurve,
    assumptions: THERMOCHEMISTRY_ASSUMPTIONS,
  };
}
