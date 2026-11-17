/**
 * Phase Transition Models for Physical Chemistry (Class 11)
 *
 * Covers:
 * 1. Melting Point Determination (Thiele tube paraffin bath, pure and impure organic solids, melting range depression)
 * 2. Boiling Point Determination (Inverted micro-capillary tube, Clausius-Clapeyron vapor pressure, continuous bubble stream, suction re-entry)
 */

export interface OrganicSolidSample {
  id: string;
  name: string;
  formula: string;
  trueMeltingPointC: number;
  meltingRangeC: [number, number];
  enthalpyOfFusionKJPerMol: number;
  isImpure?: boolean;
  impurityDepressionC?: number;
  appearance: string;
  applications: string;
}

export const ORGANIC_SOLID_SAMPLES: Record<string, OrganicSolidSample> = {
  'benzoic-acid': {
    id: 'benzoic-acid',
    name: 'Pure Benzoic Acid',
    formula: 'C₆H₅COOH',
    trueMeltingPointC: 122.4,
    meltingRangeC: [122.0, 122.8],
    enthalpyOfFusionKJPerMol: 18.02,
    appearance: 'White glistening crystalline needles with faint pleasant odor',
    applications: 'Food preservative, primary chemical standard for bomb calorimetry',
  },
  urea: {
    id: 'urea',
    name: 'Pure Urea (Carbamide)',
    formula: 'CO(NH₂)₂',
    trueMeltingPointC: 133.0,
    meltingRangeC: [132.5, 133.5],
    enthalpyOfFusionKJPerMol: 14.60,
    appearance: 'Colorless, odorless transparent tetragonal prisms',
    applications: 'Nitrogenous fertilizer, synthesis of barbiturates and resins',
  },
  naphthalene: {
    id: 'naphthalene',
    name: 'Pure Naphthalene',
    formula: 'C₁₀H₈',
    trueMeltingPointC: 80.2,
    meltingRangeC: [80.0, 80.5],
    enthalpyOfFusionKJPerMol: 19.08,
    appearance: 'Glistening white monoclinic plates with characteristic mothball aroma',
    applications: 'Moth repellent, precursor to phthalic anhydride and azo dyes',
  },
  'impure-benzoic-acid': {
    id: 'impure-benzoic-acid',
    name: 'Impure Benzoic Acid Sample',
    formula: 'C₆H₅COOH + ~5% Cinnamic Acid impurity',
    trueMeltingPointC: 116.5,
    meltingRangeC: [114.5, 118.5],
    enthalpyOfFusionKJPerMol: 17.10,
    isImpure: true,
    impurityDepressionC: 5.9,
    appearance: 'Off-white granular powder with a depressed, broad melting interval',
    applications: 'Demonstrating melting range depression and purity verification',
  },
};

export interface MeltingPointResult {
  sample: OrganicSolidSample;
  currentTemperatureC: number;
  phaseState: 'solid' | 'softening' | 'liquid';
  liquidFraction: number; // 0.0 to 1.0
  isMeltingUnderway: boolean;
  isMeltingComplete: boolean;
  isDepressedMeltingRange: boolean;
  observedMeltingRangeText: string;
  thermodynamicEquilibriumText: string;
  status: string;
}

/**
 * Calculates melting phase transition state for a solid organic sample in a heated bath
 */
export function calculateMeltingPointState(params: {
  sampleId: string;
  currentTemperatureC: number;
}): MeltingPointResult {
  const sample = ORGANIC_SOLID_SAMPLES[params.sampleId] || ORGANIC_SOLID_SAMPLES['benzoic-acid'];
  const t = Math.max(0.0, params.currentTemperatureC);
  const [tStart, tEnd] = sample.meltingRangeC;

  let phaseState: 'solid' | 'softening' | 'liquid' = 'solid';
  let liquidFraction = 0.0;

  if (t < tStart) {
    phaseState = 'solid';
    liquidFraction = 0.0;
  } else if (t >= tStart && t < tEnd) {
    phaseState = 'softening';
    liquidFraction = Number(((t - tStart) / (tEnd - tStart)).toFixed(2));
  } else {
    phaseState = 'liquid';
    liquidFraction = 1.0;
  }

  const isMeltingUnderway = phaseState === 'softening';
  const isMeltingComplete = phaseState === 'liquid';
  const isDepressed = Boolean(sample.isImpure);

  const observedRangeText = `${tStart.toFixed(1)}°C – ${tEnd.toFixed(1)}°C (ΔT = ${(tEnd - tStart).toFixed(1)}°C)`;
  const thermodynamicText =
    'Phase Equilibrium: Solid ⇌ Liquid at Tm where ΔGfus = ΔHfus - Tm·ΔSfus = 0.';

  let status = '';
  if (phaseState === 'solid') {
    status = `Solid crystals intact at ${t.toFixed(1)}°C. Melting expected at ${sample.trueMeltingPointC}°C.`;
  } else if (phaseState === 'softening') {
    status = `MELTING IN PROGRESS: Sample softening with visible liquid meniscus (${(liquidFraction * 100).toFixed(0)}% melted) at ${t.toFixed(1)}°C.`;
  } else {
    status = `MELTING COMPLETE: Clear, transparent liquid meniscus formed at ${t.toFixed(1)}°C (Pure Tm = ${sample.trueMeltingPointC}°C).`;
  }

  return {
    sample,
    currentTemperatureC: Number(t.toFixed(1)),
    phaseState,
    liquidFraction,
    isMeltingUnderway,
    isMeltingComplete,
    isDepressedMeltingRange: isDepressed,
    observedMeltingRangeText: observedRangeText,
    thermodynamicEquilibriumText: thermodynamicText,
    status,
  };
}

export interface OrganicLiquidSample {
  id: string;
  name: string;
  formula: string;
  normalBoilingPointC: number; // At 101.325 kPa (1 atm)
  enthalpyOfVaporizationKJPerMol: number;
  appearance: string;
  flammabilityHazard: string;
}

export const ORGANIC_LIQUID_SAMPLES: Record<string, OrganicLiquidSample> = {
  ethanol: {
    id: 'ethanol',
    name: 'Ethyl Alcohol (Ethanol)',
    formula: 'C₂H₅OH',
    normalBoilingPointC: 78.3,
    enthalpyOfVaporizationKJPerMol: 38.56,
    appearance: 'Clear, colorless volatile liquid with characteristic spirituous odor',
    flammabilityHazard: 'Highly flammable liquid and vapor (Flash point 13°C)',
  },
  acetone: {
    id: 'acetone',
    name: 'Acetone (Propan-2-one)',
    formula: 'CH₃COCH₃',
    normalBoilingPointC: 56.1,
    enthalpyOfVaporizationKJPerMol: 29.10,
    appearance: 'Clear, colorless, highly volatile liquid with sweet fruity aroma',
    flammabilityHazard: 'Extremely flammable liquid and vapor (Flash point -20°C)',
  },
  'ethyl-acetate': {
    id: 'ethyl-acetate',
    name: 'Ethyl Acetate',
    formula: 'CH₃COOC₂H₅',
    normalBoilingPointC: 77.1,
    enthalpyOfVaporizationKJPerMol: 31.94,
    appearance: 'Clear colorless solvent with sweet pleasant pear-like fragrance',
    flammabilityHazard: 'Flammable liquid and vapor (Flash point -4°C)',
  },
  water: {
    id: 'water',
    name: 'Distilled Water',
    formula: 'H₂O',
    normalBoilingPointC: 100.0,
    enthalpyOfVaporizationKJPerMol: 40.66,
    appearance: 'Clear, colorless neutral solvent',
    flammabilityHazard: 'Non-flammable reference liquid',
  },
};

export interface BoilingPointResult {
  sample: OrganicLiquidSample;
  currentTemperatureC: number;
  ambientPressureKPa: number;
  pressureCorrectedBoilingPointC: number;
  vaporPressureKPa: number;
  boilingState:
    | 'sub-boiling'
    | 'trapped-air-bubbles'
    | 'continuous-vapor-stream'
    | 'liquid-re-entry';
  bubbleFrequencyHz: number;
  isBoiling: boolean;
  isLiquidReEntryCaptured: boolean;
  clausiusClapeyronSummary: string;
  status: string;
}

/**
 * Calculates boiling point thermodynamics and inverted capillary bubble behavior:
 * Clausius-Clapeyron Equation:
 * ln(P_vap / P0) = - (ΔH_vap / R) * (1 / T - 1 / T0)
 * Boiling occurs when P_vap(T) = P_ambient.
 * On cooling, when P_vap < P_ambient, liquid rushes into the capillary tube.
 */
export function calculateBoilingPointState(params: {
  liquidId: string;
  currentTemperatureC: number;
  ambientPressureKPa?: number;
  isHeating?: boolean;
  previouslyReachedBoiling?: boolean;
}): BoilingPointResult {
  const sample = ORGANIC_LIQUID_SAMPLES[params.liquidId] || ORGANIC_LIQUID_SAMPLES['ethanol'];
  const tC = Math.max(0.0, params.currentTemperatureC);
  const pAtm = Math.max(50.0, params.ambientPressureKPa ?? 101.325);
  const isHeating = params.isHeating !== false;
  const hadBoiled = Boolean(params.previouslyReachedBoiling);

  const rConst = 8.314; // J / (mol * K)
  const t0K = sample.normalBoilingPointC + 273.15;
  const deltaH = sample.enthalpyOfVaporizationKJPerMol * 1000.0; // J/mol

  // Pressure-corrected boiling point via Clausius-Clapeyron:
  // 1/Tb = 1/T0 - (R / ΔH) * ln(P_atm / 101.325)
  const lnPRatio = Math.log(pAtm / 101.325);
  const invTb = 1.0 / t0K - (rConst / deltaH) * lnPRatio;
  const tbCorrectedK = 1.0 / invTb;
  const tbCorrectedC = Number((tbCorrectedK - 273.15).toFixed(1));

  // Vapor pressure at current temperature T:
  const tK = tC + 273.15;
  const exponent = (-deltaH / rConst) * (1.0 / tK - 1.0 / t0K);
  const vaporPressureKPa = Number((101.325 * Math.exp(Math.max(-20.0, Math.min(20.0, exponent)))).toFixed(1));

  let boilingState:
    | 'sub-boiling'
    | 'trapped-air-bubbles'
    | 'continuous-vapor-stream'
    | 'liquid-re-entry' = 'sub-boiling';
  let bubbleFreq = 0.0;
  let isBoiling = false;
  let isReEntry = false;

  if (tC < tbCorrectedC - 12.0) {
    boilingState = 'sub-boiling';
    bubbleFreq = 0.0;
    isBoiling = false;
  } else if (tC < tbCorrectedC - 0.5) {
    boilingState = 'trapped-air-bubbles';
    bubbleFreq = Number(((tC - (tbCorrectedC - 12.0)) / 10.0).toFixed(1));
    isBoiling = false;
  } else if (tC >= tbCorrectedC - 0.5 && isHeating) {
    boilingState = 'continuous-vapor-stream';
    bubbleFreq = 8.5; // Rapid continuous stream
    isBoiling = true;
  } else if (!isHeating && (hadBoiled || tC >= tbCorrectedC - 1.0) && tC <= tbCorrectedC) {
    // Cooling phase: vapor pressure drops, liquid rushes inside capillary tube!
    boilingState = 'liquid-re-entry';
    bubbleFreq = 0.0;
    isBoiling = true;
    isReEntry = true;
  } else {
    boilingState = 'continuous-vapor-stream';
    bubbleFreq = 8.5;
    isBoiling = true;
  }

  const clausiusSummary = `Clausius-Clapeyron: P_vap(${tC.toFixed(1)}°C) = ${vaporPressureKPa} kPa (P_atm = ${pAtm.toFixed(1)} kPa). True Tb = ${tbCorrectedC}°C.`;

  let status = '';
  if (boilingState === 'sub-boiling') {
    status = `Quiet liquid at ${tC.toFixed(1)}°C. Normal Tb = ${sample.normalBoilingPointC}°C.`;
  } else if (boilingState === 'trapped-air-bubbles') {
    status = `Pre-boiling: Intermittent air bubbles escaping from inverted capillary mouth at ${tC.toFixed(1)}°C.`;
  } else if (boilingState === 'continuous-vapor-stream') {
    status = `RAPID VAPOR STREAM: Continuous unbroken stream of vapor bubbles issuing from capillary at ${tC.toFixed(1)}°C!`;
  } else {
    status = `LIQUID RE-ENTRY CAPTURED! Liquid abruptly enters capillary as P_vap < P_atm at ${tC.toFixed(1)}°C (Boiling Point confirmed!).`;
  }

  return {
    sample,
    currentTemperatureC: Number(tC.toFixed(1)),
    ambientPressureKPa: pAtm,
    pressureCorrectedBoilingPointC: tbCorrectedC,
    vaporPressureKPa,
    boilingState,
    bubbleFrequencyHz: bubbleFreq,
    isBoiling,
    isLiquidReEntryCaptured: isReEntry,
    clausiusClapeyronSummary: clausiusSummary,
    status,
  };
}
