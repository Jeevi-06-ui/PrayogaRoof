/**
 * Chemical Equilibrium & Le Chatelier's Principle Models (Class 11)
 *
 * Models:
 * 1. Iron(III)-Thiocyanate Solution Complex Equilibrium:
 *    Fe³⁺(pale yellow) + SCN⁻(colorless) ⇌ [Fe(SCN)]²⁺(blood-red)  [ΔH° = -24.2 kJ/mol, exothermic]
 *    Perturbations: Added Fe³⁺, Added SCN⁻, Added F⁻ (removes Fe³⁺ as [FeF₆]³⁻), Temperature shifts
 *
 * 2. Nitrogen Dioxide - Dinitrogen Tetroxide Gaseous Equilibrium:
 *    2NO₂(g, reddish-brown) ⇌ N₂O₄(g, colorless)  [ΔH° = -57.2 kJ/mol, exothermic]
 *    Perturbations: Pressure / volume compression (2 moles -> 1 mole), Temperature shifts
 */

export type EquilibriumSystemType = 'fe-scn' | 'no2-n2o4';

export interface FeSCNPerturbationParams {
  temperatureC?: number; // 0 to 80°C (default 25°C)
  addedFe3PlusM?: number; // excess Fe³⁺ (e.g. 0 to 0.01 M)
  addedSCNMinusM?: number; // excess SCN⁻ (e.g. 0 to 0.01 M)
  addedFluorideM?: number; // F⁻ complexing agent removing Fe³⁺
}

export interface FeSCNEquilibriumState {
  system: 'fe-scn';
  temperatureC: number;
  initialFe3M: number;
  initialSCNM: number;
  equilibriumFe3M: number;
  equilibriumSCNM: number;
  equilibriumComplexM: number; // [[Fe(SCN)]²⁺]
  kc: number;
  qc: number;
  shiftDirection: 'forward' | 'reverse' | 'at-equilibrium';
  colorHex: string;
  absorbance450nm: number; // optical density (Beer-Lambert: A = ε · b · c)
  opticalAppearance: string;
  explanation: string;
}

export interface NO2N2O4PerturbationParams {
  temperatureC?: number; // -10 to 100°C (default 25°C)
  volumeLiters?: number; // 0.5 to 4.0 L (default 1.0 L)
  totalMolesInitial?: number; // default 0.05 mol
}

export interface NO2N2O4EquilibriumState {
  system: 'no2-n2o4';
  temperatureC: number;
  volumeLiters: number;
  totalPressureAtm: number;
  partialPressureNO2Atm: number;
  partialPressureN2O4Atm: number;
  molesNO2: number;
  molesN2O4: number;
  kp: number;
  qp: number;
  shiftDirection: 'forward' | 'reverse' | 'at-equilibrium';
  brownIntensityPercent: number; // 0 (colorless) to 100 (dark brown)
  colorHex: string;
  opticalAppearance: string;
  explanation: string;
}

/**
 * Calculates equilibrium concentrations for the Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺ system
 */
export function calculateFeSCNEquilibrium(
  params: FeSCNPerturbationParams = {}
): FeSCNEquilibriumState {
  const tempC = Math.max(0, Math.min(80, params.temperatureC ?? 25));
  const addedFe = Math.max(0, params.addedFe3PlusM ?? 0);
  const addedSCN = Math.max(0, params.addedSCNMinusM ?? 0);
  const addedF = Math.max(0, params.addedFluorideM ?? 0);

  // Baseline standard analytical concentrations (0.002 M each)
  const baseFe = 0.002 + addedFe;
  const baseSCN = 0.002 + addedSCN;

  // Fluoride complexes with Fe³⁺: Fe³⁺ + 6F⁻ ⇌ [FeF₆]³⁻ with huge Kf ~ 10¹⁵
  // Effective free Fe³⁺ is suppressed by fluoride sequestration
  const sequesteredFe = Math.min(baseFe * 0.95, addedF / 6.0);
  const effectiveFe = Math.max(0.00005, baseFe - sequesteredFe);

  // Temperature dependency of Kc via van 't Hoff equation:
  // ln(K2/K1) = -ΔH°/R * (1/T2 - 1/T1)
  // At 25°C (298.15 K), Kc = 138 M⁻¹; ΔH° = -24200 J/mol (exothermic)
  const r = 8.314;
  const tRefK = 298.15;
  const tActualK = tempC + 273.15;
  const deltaH = -24200.0;
  const lnKRatio = (-deltaH / r) * (1.0 / tActualK - 1.0 / tRefK);
  const kc = Number((138.0 * Math.exp(lnKRatio)).toFixed(1));

  // Equilibrium equation:
  // Kc = x / ((effectiveFe - x) * (baseSCN - x))
  // => Kc·x² - (Kc·effectiveFe + Kc·baseSCN + 1)·x + Kc·effectiveFe·baseSCN = 0
  const a = kc;
  const b = -(kc * effectiveFe + kc * baseSCN + 1.0);
  const c = kc * effectiveFe * baseSCN;

  const discriminant = Math.sqrt(Math.max(0, b * b - 4.0 * a * c));
  const x = (-b - discriminant) / (2.0 * a); // physical root
  const complexM = Number(Math.max(0, Math.min(Math.min(effectiveFe, baseSCN), x)).toFixed(6));
  const eqFe = Number((effectiveFe - complexM).toFixed(6));
  const eqSCN = Number((baseSCN - complexM).toFixed(6));

  // Absorbance at 450 nm: ε = 5000 M⁻¹ cm⁻¹, path length b = 1 cm
  const abs = Number((complexM * 5000.0).toFixed(3));

  // Determine color and shift description
  let shiftDirection: 'forward' | 'reverse' | 'at-equilibrium' = 'at-equilibrium';
  let appearance = 'Standard Blood-Red Solution';
  let colorHex = '#dc2626'; // Red
  let explanation = '';

  if (addedF > 0.001) {
    shiftDirection = 'reverse';
    colorHex = '#fef08a'; // Pale yellow/straw
    appearance = 'Decolorized / Straw Yellow (Fe³⁺ sequestered as colorless [FeF₆]³⁻)';
    explanation =
      'Fluoride ions react with Fe³⁺ to form the extremely stable, colorless [FeF₆]³⁻ complex. By Le Chatelier’s principle, removing Fe³⁺ drives the equilibrium in reverse, decomposing the blood-red [Fe(SCN)]²⁺ complex.';
  } else if (addedFe > 0 || addedSCN > 0 || tempC < 20) {
    shiftDirection = 'forward';
    colorHex = '#7f1d1d'; // Deep burgundy/blood-red
    appearance = 'Intense Deep Blood-Red (Equilibrium shifted forward)';
    explanation =
      tempC < 20
        ? `Exothermic reaction (ΔH° = -24.2 kJ/mol): Lowering temperature (${tempC}°C) favors the forward direction, increasing [Fe(SCN)]²⁺ complex concentration.`
        : 'Increasing reactant concentration (Fe³⁺ or SCN⁻) raises the reaction quotient Q < Kc. By Le Chatelier’s principle, the system shifts forward to consume added reactants, intensifying the red coloration.';
  } else if (tempC > 40) {
    shiftDirection = 'reverse';
    colorHex = '#ea580c'; // Lighter orange-red
    appearance = 'Faded Orange-Red (Equilibrium shifted reverse upon heating)';
    explanation = `Heating an exothermic reaction (${tempC}°C) shifts the equilibrium in the endothermic reverse direction, dissociating [Fe(SCN)]²⁺ into pale yellow Fe³⁺ and colorless SCN⁻.`;
  } else {
    explanation =
      'Dynamic equilibrium maintained between Fe³⁺ (pale yellow), SCN⁻ (colorless), and [Fe(SCN)]²⁺ (blood-red) with Kc = 138 M⁻¹ at 25°C.';
  }

  return {
    system: 'fe-scn',
    temperatureC: tempC,
    initialFe3M: effectiveFe,
    initialSCNM: baseSCN,
    equilibriumFe3M: eqFe,
    equilibriumSCNM: eqSCN,
    equilibriumComplexM: complexM,
    kc,
    qc: kc,
    shiftDirection,
    colorHex,
    absorbance450nm: abs,
    opticalAppearance: appearance,
    explanation,
  };
}

/**
 * Calculates equilibrium parameters for the 2NO₂(g) ⇌ N₂O₄(g) gaseous equilibrium
 */
export function calculateNO2N2O4Equilibrium(
  params: NO2N2O4PerturbationParams = {}
): NO2N2O4EquilibriumState {
  const tempC = Math.max(-10, Math.min(100, params.temperatureC ?? 25));
  const volumeL = Math.max(0.2, Math.min(5.0, params.volumeLiters ?? 1.0));
  const totalMolesN = Math.max(0.01, params.totalMolesInitial ?? 0.05);

  const tK = tempC + 273.15;
  const r = 0.08206; // L · atm / (mol · K)
  const rJoules = 8.314;

  // Temperature dependence of Kp:
  // 2NO₂(g) ⇌ N₂O₄(g), ΔH° = -57.2 kJ/mol (exothermic)
  // At 25°C (298.15 K), Kp = 8.8 atm⁻¹
  const deltaH = -57200.0; // J/mol
  const kp298 = 8.8;
  const lnKpRatio = (-deltaH / rJoules) * (1.0 / tK - 1.0 / 298.15);
  const kp = Number((kp298 * Math.exp(lnKpRatio)).toFixed(2));

  // Kp = p(N2O4) / [p(NO2)]²
  // Let initial moles be n0 in terms of NO2 equivalence: nTotal_atoms = totalMolesN.
  // Let x = moles of N2O4 formed; moles of NO2 = totalMolesN - 2x.
  // Total gas moles n_total = (totalMolesN - 2x) + x = totalMolesN - x.
  // P_total = n_total · R · T / V
  // p(NO2) = [(totalMolesN - 2x) / n_total] · P_total = (totalMolesN - 2x) · R · T / V
  // p(N2O4) = (x / n_total) · P_total = x · R · T / V
  // Kp = p(N2O4) / p(NO2)² = (x · R · T / V) / [ (totalMolesN - 2x)² · (R · T / V)² ]
  // Kp · (R·T/V) · (totalMolesN - 2x)² = x
  // Let K_eff = Kp · (R · T / V)
  const kEff = kp * ((r * tK) / volumeL);

  // K_eff · (n0² - 4·n0·x + 4·x²) = x
  // 4·K_eff·x² - (4·n0·K_eff + 1)·x + K_eff·n0² = 0
  const a = 4.0 * kEff;
  const b = -(4.0 * totalMolesN * kEff + 1.0);
  const c = kEff * totalMolesN * totalMolesN;

  const disc = Math.sqrt(Math.max(0, b * b - 4.0 * a * c));
  const x = (-b - disc) / (2.0 * a);
  const molesN2O4 = Number(Math.max(0, Math.min(totalMolesN / 2.0, x)).toFixed(5));
  const molesNO2 = Number(Math.max(0, totalMolesN - 2.0 * molesN2O4).toFixed(5));
  const totalMoles = molesNO2 + molesN2O4;

  const pTotal = Number(((totalMoles * r * tK) / volumeL).toFixed(3));
  const pNO2 = Number(((molesNO2 * r * tK) / volumeL).toFixed(3));
  const pN2O4 = Number(((molesN2O4 * r * tK) / volumeL).toFixed(3));

  // Brown intensity is proportional to [NO2] concentration
  const concNO2 = molesNO2 / volumeL;
  const brownIntensity = Math.min(100, Math.max(5, Math.round((concNO2 / 0.05) * 80)));

  // Color interpolation between faint straw (#fef9c3) and deep reddish brown (#78350f)
  let appearance = 'Moderate Amber-Brown Vapor';
  let colorHex = '#b45309';
  let shiftDirection: 'forward' | 'reverse' | 'at-equilibrium' = 'at-equilibrium';
  let explanation = '';

  if (volumeL <= 0.6) {
    shiftDirection = 'forward';
    appearance = 'Light Amber / Pale Vapor (Volume compressed, shifted forward toward N₂O₄)';
    colorHex = '#d97706';
    explanation = `Compressing volume to ${volumeL} L increases total pressure (${pTotal} atm). By Le Chatelier’s principle, the system shifts toward the side with fewer gas moles (2 NO₂ → 1 N₂O₄), reducing [NO₂] concentration.`;
  } else if (tempC >= 50) {
    shiftDirection = 'reverse';
    appearance = 'Dark Reddish-Brown Vapor (Heated, shifted reverse toward NO₂)';
    colorHex = '#78350f';
    explanation = `Heating (${tempC}°C) shifts this exothermic equilibrium (ΔH° = -57.2 kJ/mol) in the endothermic reverse direction, dissociating colorless N₂O₄ into dark reddish-brown NO₂.`;
  } else if (tempC <= 5) {
    shiftDirection = 'forward';
    appearance = 'Nearly Colorless Vapor (Chilled, shifted forward toward N₂O₄)';
    colorHex = '#fef08a';
    explanation = `Chilling (${tempC}°C) shifts this exothermic reaction forward, converting colored NO₂ into colorless N₂O₄.`;
  } else {
    explanation =
      'Dynamic gaseous equilibrium between reddish-brown NO₂ and colorless N₂O₄ governed by Le Chatelier’s pressure and temperature dependencies.';
  }

  return {
    system: 'no2-n2o4',
    temperatureC: tempC,
    volumeLiters: volumeL,
    totalPressureAtm: pTotal,
    partialPressureNO2Atm: pNO2,
    partialPressureN2O4Atm: pN2O4,
    molesNO2,
    molesN2O4,
    kp,
    qp: kp,
    shiftDirection,
    brownIntensityPercent: brownIntensity,
    colorHex,
    opticalAppearance: appearance,
    explanation,
  };
}
