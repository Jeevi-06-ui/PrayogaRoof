/**
 * Redox Titration Scientific Engine: Potassium Permanganate (KMnO₄)
 * Curriculum: CBSE Class 12 Chemistry Practical
 * 
 * Supported Redox Systems:
 * 1. Standard KMnO₄ vs Ferrous Ammonium Sulphate (Mohr's Salt):
 *    Ionic equation: MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O
 *    Stoichiometric mole ratio: n(KMnO₄) : n(Mohr's Salt) = 1 : 5
 *    Formula: M₁V₁ = (M₂V₂) / 5  ==>  M(KMnO₄) = (M_mohr * V_mohr) / (5 * V_kmno4)
 *    Medium: Dilute H₂SO₄ (~20 mL 1:4 H₂SO₄)
 *    Indicator: Self-indicating KMnO₄ (End-point: Colorless to permanent faint pink)
 * 
 * 2. Standard KMnO₄ vs Oxalic Acid (H₂C₂O₄·2H₂O):
 *    Ionic equation: 2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ --(60-70°C)--> 2Mn²⁺ + 10CO₂↑ + 8H₂O
 *    Stoichiometric mole ratio: n(KMnO₄) : n(Oxalic Acid) = 2 : 5
 *    Formula: (M₁V₁) / 2 = (M₂V₂) / 5  ==>  M(KMnO₄) = (2 * M_oxalic * V_oxalic) / (5 * V_kmno4)
 *    Activation Energy Requirement: Solution must be heated to 60-70°C before titrating.
 * 
 * Procedural & Analytical Rigor:
 * - Upper Meniscus: Due to the intense purple coloration of KMnO₄, readings are taken at the UPPER meniscus.
 * - Acid Choice: Dilute H₂SO₄ is mandatory. HCl cannot be used because it reduces KMnO₄ into toxic Cl₂ gas.
 *   HNO₃ cannot be used because it is itself a strong oxidizer.
 */

export type RedoxTitrationSystem = 'kmno4-mohrs-salt' | 'kmno4-oxalic-acid';

export interface RedoxTitrationParams {
  system?: RedoxTitrationSystem;
  analyteVolumeMl?: number; // Volume of standard solution pipetted (mL), default 20.0
  analyteMolarityM?: number; // Molarity of standard solution (M), default 0.05 M (M/20)
  titrantMolarityM?: number; // Actual Molarity of KMnO4 titrant (M), default 0.02 M (M/50)
  titrantDeliveredMl?: number; // Volume of KMnO4 added from burette (mL)
  acidAdded?: boolean; // Whether dil H2SO4 was added (default true)
  temperatureC?: number; // Conical flask temperature (°C), default 25 for Mohr, 65 for Oxalic
}

export interface RedoxCurvePoint {
  titrantVolumeMl: number;
  potentialMv: number; // Redox electrode potential (Pt vs SHE)
  fractionOxidized: number; // 0.0 to 1.0+
}

export interface RedoxTitrationState {
  system: RedoxTitrationSystem;
  systemName: string;
  analyteName: string;
  titrantName: string;
  analyteVolumeMl: number;
  analyteMolarityM: number;
  titrantMolarityM: number;
  titrantDeliveredMl: number;
  equivalenceVolumeMl: number;
  acidAdded: boolean;
  temperatureC: number;
  isTempAdequate: boolean;
  isAcidAdequate: boolean;
  status: 'before-equivalence' | 'at-equivalence' | 'past-equivalence' | 'impaired';
  solutionColorHex: string;
  solutionAppearance: string;
  upperMeniscusBuretteReadingMl: number;
  fractionCompleted: number;
  electrodePotentialMv: number;
  calculatedMolarityM: number;
  calculatedStrengthGperL: number;
  observation: string;
  reactionEquation: string;
  stoichiometricRatioText: string;
  curvePoints: RedoxCurvePoint[];
}

export const REDOX_SYSTEM_SPECS = {
  'kmno4-mohrs-salt': {
    system: 'kmno4-mohrs-salt' as RedoxTitrationSystem,
    name: 'Redox Titration: KMnO₄ vs Mohr’s Salt [FeSO₄·(NH₄)₂SO₄·6H₂O]',
    analyteName: 'Ferrous Ammonium Sulphate (Mohr’s Salt)',
    titrantName: 'Potassium Permanganate (KMnO₄)',
    analyteMolarMass: 392.14, // g/mol
    titrantMolarMass: 158.034, // g/mol
    moleRatioKMnO4ToAnalyte: 1 / 5, // 1 mol KMnO4 oxidizes 5 mol Fe2+
    requiresHeating: false,
    idealTempRangeC: [20, 35],
    equation: '2KMnO₄ + 8H₂SO₄ + 10FeSO₄·(NH₄)₂SO₄ → K₂SO₄ + 2MnSO₄ + 5Fe₂(SO₄)₃ + 10(NH₄)₂SO₄ + 8H₂O',
    ionicEquation: 'MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O',
    stoichiometryRatioText: '1 mol KMnO₄ ≡ 5 mol Fe²⁺ (M₁V₁ = M₂V₂ / 5)',
    indicatorText: 'Self-indicator (KMnO₄ imparts pale persistent pink at endpoint)',
  },
  'kmno4-oxalic-acid': {
    system: 'kmno4-oxalic-acid' as RedoxTitrationSystem,
    name: 'Redox Titration: KMnO₄ vs Standard Oxalic Acid [(COOH)₂·2H₂O]',
    analyteName: 'Hydrated Oxalic Acid [(COOH)₂·2H₂O]',
    titrantName: 'Potassium Permanganate (KMnO₄)',
    analyteMolarMass: 126.07, // g/mol
    titrantMolarMass: 158.034, // g/mol
    moleRatioKMnO4ToAnalyte: 2 / 5, // 2 mol KMnO4 oxidizes 5 mol C2O4(2-)
    requiresHeating: true,
    idealTempRangeC: [60, 70],
    equation: '2KMnO₄ + 3H₂SO₄ + 5(COOH)₂ → K₂SO₄ + 2MnSO₄ + 10CO₂↑ + 8H₂O',
    ionicEquation: '2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ --(60-70°C)--> 2Mn²⁺ + 10CO₂↑ + 8H₂O',
    stoichiometryRatioText: '2 mol KMnO₄ ≡ 5 mol (COOH)₂ (M₁V₁ / 2 = M₂V₂ / 5)',
    indicatorText: 'Self-indicator (KMnO₄ imparts pale persistent pink at endpoint)',
  },
};

/**
 * Calculates standard Nernst redox electrode potential for titration curve plotting
 */
function calculateRedoxPotential(
  system: RedoxTitrationSystem,
  vTitrant: number,
  vEq: number
): number {
  // Standard reduction potentials:
  // Fe3+ + e- -> Fe2+: E0 = +770 mV
  // MnO4- + 8H+ + 5e- -> Mn2+ + 4H2O: E0 = +1510 mV
  // CO2 / H2C2O4: E0 = -490 mV
  if (vTitrant <= 0.001) {
    return system === 'kmno4-mohrs-salt' ? 700 : 350;
  }
  const ratio = vTitrant / vEq;
  if (ratio < 0.999) {
    if (system === 'kmno4-mohrs-salt') {
      // E = E0_Fe + (59.2) * log10([Fe3+]/[Fe2+]) = 770 + 59.2 * log10(ratio / (1 - ratio))
      const safeRatio = Math.max(0.005, Math.min(0.995, ratio));
      return Math.round(770 + 59.2 * Math.log10(safeRatio / (1 - safeRatio)));
    } else {
      // Oxalate system
      const safeRatio = Math.max(0.005, Math.min(0.995, ratio));
      return Math.round(450 + 40 * Math.log10(safeRatio / (1 - safeRatio)));
    }
  } else if (ratio <= 1.005) {
    // Equivalence potential: weighted average of E0 values
    return system === 'kmno4-mohrs-salt'
      ? Math.round((5 * 1510 + 1 * 770) / 6) // ~1387 mV
      : Math.round((5 * 1510 + 2 * 350) / 7); // ~1178 mV
  } else {
    // Excess permanganate
    const excessRatio = Math.max(0.005, ratio - 1);
    return Math.min(1550, Math.round(1510 + (59.2 / 5) * Math.log10(excessRatio)));
  }
}

/**
 * Generates theoretical redox titration curve points
 */
function generateCurvePoints(system: RedoxTitrationSystem, vEq: number): RedoxCurvePoint[] {
  const points: RedoxCurvePoint[] = [];
  const maxV = Math.ceil(vEq * 1.5);
  const step = maxV <= 25 ? 0.5 : 1.0;

  for (let v = 0; v <= maxV; v += step) {
    const fraction = Number((v / vEq).toFixed(3));
    const potential = calculateRedoxPotential(system, v, vEq);
    points.push({
      titrantVolumeMl: Number(v.toFixed(1)),
      potentialMv: potential,
      fractionOxidized: fraction,
    });
  }
  return points;
}

/**
 * Main evaluation function for KMnO4 redox titrations
 */
export function calculateRedoxTitrationState(params: RedoxTitrationParams = {}): RedoxTitrationState {
  const system = params.system || 'kmno4-mohrs-salt';
  const spec = REDOX_SYSTEM_SPECS[system];

  const analyteVolumeMl = Math.max(1, params.analyteVolumeMl ?? 20.0);
  const analyteMolarityM = Math.max(0.001, params.analyteMolarityM ?? 0.05); // M/20
  const titrantMolarityM = Math.max(0.001, params.titrantMolarityM ?? 0.02); // M/50
  const titrantDeliveredMl = Math.max(0, params.titrantDeliveredMl ?? 0);
  const acidAdded = params.acidAdded ?? true;
  const temperatureC = params.temperatureC ?? (spec.requiresHeating ? 65 : 25);

  // Stoichiometric equivalence volume:
  // For Mohr's salt: M1 * V1 = (M2 * V2) / 5  =>  V1 = (M2 * V2) / (5 * M1)
  // For Oxalic acid: M1 * V1 / 2 = M2 * V2 / 5  =>  V1 = (2 * M2 * V2) / (5 * M1)
  const equivalenceVolumeMl = Number(
    ((spec.moleRatioKMnO4ToAnalyte * analyteMolarityM * analyteVolumeMl) / titrantMolarityM).toFixed(2)
  );

  const isTempAdequate = spec.requiresHeating ? temperatureC >= 55 && temperatureC <= 80 : true;
  const isAcidAdequate = acidAdded;

  let status: RedoxTitrationState['status'];
  let solutionColorHex: string;
  let solutionAppearance: string;
  let observation: string;

  const fractionCompleted = Number((titrantDeliveredMl / equivalenceVolumeMl).toFixed(3));
  const diffFromEq = titrantDeliveredMl - equivalenceVolumeMl;

  // Upper meniscus reading:
  // For dark liquids like KMnO4, the upper edge of the curved liquid surface is recorded
  const upperMeniscusBuretteReadingMl = Number(titrantDeliveredMl.toFixed(2));

  // Determine physical state and diagnostic colors
  if (!isAcidAdequate) {
    status = 'impaired';
    solutionColorHex = '#78350f'; // Muddy brown MnO2 precipitate
    solutionAppearance = 'Turbid Muddy Brown (Precipitate of hydrated MnO₂)';
    observation =
      'WARNING: Titration conducted without dilute H₂SO₄! In neutral/alkaline solution, MnO₄⁻ is reduced only to insoluble brown MnO₂, ruining the stoichiometric calculation.';
  } else if (!isTempAdequate && spec.requiresHeating) {
    status = 'impaired';
    solutionColorHex = '#a16207'; // Sluggish brown/yellow
    solutionAppearance = 'Sluggish Yellow-Brown Turbidity';
    observation = `WARNING: Oxalic acid titration requires warming to 60-70°C (current: ${temperatureC}°C). Reaction is extremely sluggish at room temperature; unreduced oxalate and permanganate intermediate linger.`;
  } else if (diffFromEq < -0.15) {
    status = 'before-equivalence';
    // Before equivalence: KMnO4 is reduced instantly to Mn2+ (colorless)
    if (system === 'kmno4-mohrs-salt') {
      // Very faint yellow-green hue due to Fe3+ generated
      solutionColorHex = '#fefce8';
      solutionAppearance = 'Colorless / Faint Yellowish Tint (Formation of Fe³⁺ and Mn²⁺)';
    } else {
      solutionColorHex = '#f8fafc';
      solutionAppearance = 'Clear Colorless (Mn²⁺ and CO₂ gas bubbles evolved)';
    }
    observation = `Permanganate drops decolorize immediately on swirling as Fe²⁺/oxalate is in excess (${titrantDeliveredMl.toFixed(1)} / ${equivalenceVolumeMl.toFixed(1)} mL).`;
  } else if (Math.abs(diffFromEq) <= 0.15) {
    status = 'at-equivalence';
    // Equivalence point: Single drop of excess KMnO4 gives persistent faint pink
    solutionColorHex = '#fbcfe8'; // Pale light pink
    solutionAppearance = 'Permanent Faint Pink (Exact Stoichiometric Equivalence)';
    observation = `ENDPOINT REACHED: First single drop of excess KMnO₄ imparts a permanent faint pink coloration lasting >30 seconds. Upper meniscus reading: ${upperMeniscusBuretteReadingMl.toFixed(2)} mL.`;
  } else {
    status = 'past-equivalence';
    // Over-titrated
    if (diffFromEq < 1.0) {
      solutionColorHex = '#f472b6'; // Bright pink
      solutionAppearance = 'Moderately Dark Pink (Slightly Over-Titrated)';
    } else {
      solutionColorHex = '#db2777'; // Deep purple / Magenta
      solutionAppearance = 'Deep Magenta-Purple (Excess KMnO₄ in Solution)';
    }
    observation = `OVER-TITRATED by ${diffFromEq.toFixed(2)} mL. Solution contains unreduced intense purple KMnO₄. Concordant titre reading should be taken at initial faint pink.`;
  }

  // Calculated Molarity and Strength based on current delivered volume
  const effectiveVol = Math.max(0.1, titrantDeliveredMl);
  const calculatedMolarityM = Number(
    ((spec.moleRatioKMnO4ToAnalyte * analyteMolarityM * analyteVolumeMl) / effectiveVol).toFixed(4)
  );
  const calculatedStrengthGperL = Number((calculatedMolarityM * spec.titrantMolarMass).toFixed(2));

  const electrodePotentialMv = calculateRedoxPotential(system, titrantDeliveredMl, equivalenceVolumeMl);
  const curvePoints = generateCurvePoints(system, equivalenceVolumeMl);

  return {
    system,
    systemName: spec.name,
    analyteName: spec.analyteName,
    titrantName: spec.titrantName,
    analyteVolumeMl,
    analyteMolarityM,
    titrantMolarityM,
    titrantDeliveredMl,
    equivalenceVolumeMl,
    acidAdded,
    temperatureC,
    isTempAdequate,
    isAcidAdequate,
    status,
    solutionColorHex,
    solutionAppearance,
    upperMeniscusBuretteReadingMl,
    fractionCompleted,
    electrodePotentialMv,
    calculatedMolarityM,
    calculatedStrengthGperL,
    observation,
    reactionEquation: spec.equation,
    stoichiometricRatioText: spec.stoichiometryRatioText,
    curvePoints,
  };
}
