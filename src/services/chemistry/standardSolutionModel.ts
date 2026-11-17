/**
 * Standard Solution Preparation Model (Class 11)
 *
 * Preparation of standard solution of known molarity (e.g. 0.1M or 0.05M Oxalic Acid Dihydrate
 * or Sodium Carbonate in a 250 mL Class-A Volumetric Flask).
 *
 * Formula:
 * w = (M * Mw * V) / 1000
 * Actual Molarity:
 * M_actual = (w_actual * 1000) / (Mw * V_actual)
 */

export type StandardSoluteType = 'oxalic-acid' | 'sodium-carbonate';

export interface SoluteDefinition {
  id: StandardSoluteType;
  name: string;
  formula: string;
  molarMass: number; // g/mol
  soluteType: 'primary-standard';
  equivalentWeight: number; // For oxalic acid = 126.07 / 2 = 63.035
  colorHex: string;
}

export const SOLUTE_DEFINITIONS: Record<StandardSoluteType, SoluteDefinition> = {
  'oxalic-acid': {
    id: 'oxalic-acid',
    name: 'Oxalic Acid Dihydrate',
    formula: 'H₂C₂O₄·2H₂O',
    molarMass: 126.07,
    soluteType: 'primary-standard',
    equivalentWeight: 63.035, // diprotic acid
    colorHex: '#ffffff',
  },
  'sodium-carbonate': {
    id: 'sodium-carbonate',
    name: 'Anhydrous Sodium Carbonate',
    formula: 'Na₂CO₃',
    molarMass: 105.99,
    soluteType: 'primary-standard',
    equivalentWeight: 52.995, // diacidic base
    colorHex: '#f8fafc',
  },
};

export interface StandardSolutionParams {
  soluteType?: StandardSoluteType;
  targetMolarityM?: number; // e.g. 0.1 M or 0.05 M
  flaskCapacityMl?: number; // 250 mL
  weighedMassGrams?: number; // actual mass on analytical balance
  actualLiquidVolumeMl?: number; // liquid level in flask (target: 250.0 mL)
  isDissolved?: boolean;
  isStoppered?: boolean;
  isInvertedHomogeneous?: boolean;
}

export interface StandardSolutionState {
  solute: SoluteDefinition;
  targetMolarityM: number;
  flaskCapacityMl: number;
  theoreticalMassRequiredGrams: number;
  weighedMassGrams: number;
  actualLiquidVolumeMl: number;
  isDissolved: boolean;
  isStoppered: boolean;
  isInvertedHomogeneous: boolean;
  isMeniscusAligned: boolean;
  actualMolarityM: number;
  actualNormalityN: number;
  percentageError: number;
  stageStatus: 'weighing' | 'dissolving' | 'filling' | 'ready';
  feedbackText: string;
}

/**
 * Calculates theoretical mass required for standard solution preparation
 */
export function calculateRequiredMass(
  soluteType: StandardSoluteType,
  targetMolarityM: number,
  volumeMl: number = 250.0
): number {
  const solute = SOLUTE_DEFINITIONS[soluteType];
  const mass = (targetMolarityM * solute.molarMass * volumeMl) / 1000.0;
  return Number(mass.toFixed(4));
}

/**
 * Calculates complete state of standard solution preparation
 */
export function calculateStandardSolutionState(
  params: StandardSolutionParams = {}
): StandardSolutionState {
  const soluteType = params.soluteType ?? 'oxalic-acid';
  const solute = SOLUTE_DEFINITIONS[soluteType];
  const targetMolarity = Math.max(0.01, params.targetMolarityM ?? 0.1);
  const flaskCapacity = params.flaskCapacityMl ?? 250.0;

  const theoreticalMass = calculateRequiredMass(soluteType, targetMolarity, flaskCapacity);
  const weighedMass = params.weighedMassGrams ?? theoreticalMass;
  const liquidVol = Math.max(0, Math.min(260, params.actualLiquidVolumeMl ?? flaskCapacity));
  const isDissolved = params.isDissolved ?? true;
  const isStoppered = params.isStoppered ?? true;
  const isInverted = params.isInvertedHomogeneous ?? true;

  // Meniscus alignment: within ±0.5 mL of 250 mL graduation line
  const isMeniscusAligned = Math.abs(liquidVol - flaskCapacity) <= 0.5;

  // Actual Molarity = (w * 1000) / (Mw * V)
  const actualMolarity =
    liquidVol > 0
      ? Number(((weighedMass * 1000.0) / (solute.molarMass * liquidVol)).toFixed(4))
      : 0;

  // Normality = Molarity * (n-factor: 2 for oxalic acid or Na2CO3)
  const actualNormality = Number((actualMolarity * 2.0).toFixed(4));

  // Error percentage
  const percentageError = Number(
    (Math.abs(actualMolarity - targetMolarity) / targetMolarity * 100.0).toFixed(2)
  );

  let stageStatus: 'weighing' | 'dissolving' | 'filling' | 'ready' = 'weighing';
  let feedbackText = '';

  if (weighedMass === 0) {
    stageStatus = 'weighing';
    feedbackText = `Weigh out exactly ${theoreticalMass} g of pure ${solute.name} on the digital analytical balance using a clean, tared watch glass.`;
  } else if (!isDissolved) {
    stageStatus = 'dissolving';
    feedbackText = `Transferred ${weighedMass} g of solute. Add ~50 mL distilled water into beaker and dissolve completely with a glass stirring rod.`;
  } else if (!isMeniscusAligned || liquidVol < flaskCapacity * 0.98) {
    stageStatus = 'filling';
    feedbackText = `Quantitatively transfer solution into 250 mL volumetric flask. Dilute carefully until the bottom of the curved liquid meniscus sits exactly tangent to the etched graduation line (Current: ${liquidVol.toFixed(1)} mL).`;
  } else {
    stageStatus = 'ready';
    feedbackText = isInverted
      ? `Standard solution successfully prepared! Molarity: ${actualMolarity} M (${actualNormality} N). Deviation from target ${targetMolarity} M is ${percentageError}%. Flask is stoppered and inverted homogeneously.`
      : `Meniscus aligned at 250 mL graduation mark! Stopper the volumetric flask and invert several times to ensure complete uniform mixing.`;
  }

  return {
    solute,
    targetMolarityM: targetMolarity,
    flaskCapacityMl: flaskCapacity,
    theoreticalMassRequiredGrams: theoreticalMass,
    weighedMassGrams: weighedMass,
    actualLiquidVolumeMl: liquidVol,
    isDissolved,
    isStoppered,
    isInvertedHomogeneous: isInverted,
    isMeniscusAligned,
    actualMolarityM: actualMolarity,
    actualNormalityN: actualNormality,
    percentageError,
    stageStatus,
    feedbackText,
  };
}
