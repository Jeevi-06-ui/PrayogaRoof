/**
 * Strong vs Weak Acid Ionisation, pH & Kinetics Model (Class 11)
 *
 * Distinguishes:
 * 1. Acid Strength: Intrinsic ionization propensity (Ka, degree of ionization α)
 * 2. Acid Concentration: Total analytical solute moles per liter (C, Molarity)
 * 3. Reaction Kinetics: Initial rate of H₂ gas evolution when reacting with Magnesium metal
 * 4. Stoichiometric Capacity: Total H₂ gas produced at completion
 */

export type AcidType = 'hydrochloric' | 'acetic';

export interface AcidIonisationResult {
  acidType: AcidType;
  acidName: string;
  formula: string;
  isStrongAcid: boolean;
  analyticalConcentrationM: number;
  acidDissociationConstantKa: number;
  degreeOfIonisationAlpha: number; // α (fraction between 0 and 1)
  percentIonisation: number; // α * 100%
  hydroniumConcentrationM: number; // [H+] in mol/L
  hydroxideConcentrationM: number; // [OH-] in mol/L
  ph: number;
  poh: number;
  colorWithUniversalIndicator: string;
  universalIndicatorLabel: string;
  magnesiumReaction: {
    relativeRate: number; // Normalized to 0.1M HCl = 1.0
    reactionDescription: string;
    effervescenceIntensity: 'violent' | 'vigorous' | 'moderate' | 'gentle' | 'very-slow';
    estimatedReactionDurationSec: number;
    totalH2GasVolumeMl: number; // Based on 2cm Mg ribbon (1.0 mmol)
  };
  explanationSummary: string;
}

export const KA_ACETIC_ACID = 1.75e-5; // at 25°C

/**
 * Calculates accurate chemical equilibrium and ionisation parameters for strong and weak acids
 */
export function calculateAcidIonisation(params: {
  acidType: AcidType;
  concentrationM: number;
  volumeMl?: number;
}): AcidIonisationResult {
  const type = params.acidType;
  const c = Math.max(0.0001, Math.min(2.0, params.concentrationM));
  const volMl = Math.max(5.0, params.volumeMl ?? 50.0);

  let ka = 1e6; // Effectively infinite for strong acid
  let alpha = 1.0;
  let hPlus = c;
  let isStrong = true;
  let acidName = 'Hydrochloric Acid';
  let formula = 'HCl(aq)';

  if (type === 'hydrochloric') {
    isStrong = true;
    acidName = 'Hydrochloric Acid';
    formula = 'HCl(aq)';
    ka = 1e6;
    alpha = 1.0;
    hPlus = c;
  } else {
    isStrong = false;
    acidName = 'Acetic Acid (Ethanoic Acid)';
    formula = 'CH₃COOH(aq)';
    ka = KA_ACETIC_ACID;

    // Exact quadratic solution for weak monoprotic acid:
    // C·α² + Ka·α - Ka = 0
    // => α = (-Ka + √(Ka² + 4·C·Ka)) / (2·C)
    const discriminant = Math.sqrt(ka * ka + 4.0 * c * ka);
    alpha = (-ka + discriminant) / (2.0 * c);
    hPlus = c * alpha;
  }

  const kw = 1.0e-14; // at 25°C
  const ohMinus = kw / hPlus;
  const phVal = Number((-Math.log10(hPlus)).toFixed(2));
  const pohVal = Number((14.0 - phVal).toFixed(2));
  const pctAlpha = Number((alpha * 100.0).toFixed(2));

  // Determine Universal Indicator color for this pH
  let uiColor = '#ef4444';
  let uiLabel = 'Scarlet Red';
  if (phVal < 1.5) {
    uiColor = '#dc2626';
    uiLabel = 'Deep Scarlet Red (pH ~ 1)';
  } else if (phVal < 2.5) {
    uiColor = '#ea580c';
    uiLabel = 'Red-Orange (pH ~ 2)';
  } else if (phVal < 3.5) {
    uiColor = '#f97316';
    uiLabel = 'Orange (pH ~ 3)';
  } else if (phVal < 4.5) {
    uiColor = '#facc15';
    uiLabel = 'Orange-Yellow (pH ~ 4)';
  } else {
    uiColor = '#eab308';
    uiLabel = 'Yellow (pH ~ 5)';
  }

  // Magnesium Reaction Kinetics Model:
  // Mg(s) + 2H+(aq) -> Mg2+(aq) + H2(g)
  // Standard test: 2 cm cleaned Mg ribbon = 0.024 g Mg = 1.0 mmol Mg.
  // 1.0 mmol Mg consumes 2.0 mmol H+.
  // Total H2 gas evolved = 1.0 mmol * 24.0 mL/mmol = 24.0 mL (STP).
  const availableMolesH = c * (volMl / 1000.0);
  const mgMoles = 0.001; // 1 mmol
  const limitingMolesMg = Math.min(mgMoles, availableMolesH / 2.0);
  const totalH2Volume = Number((limitingMolesMg * 24000.0).toFixed(1));

  // Reaction rate is proportional to instantaneous [H+]
  // Reference: 0.1M HCl has [H+] = 0.1M -> relativeRate = 1.0 (20s duration)
  const relRate = Number((hPlus / 0.1).toFixed(3));
  let effervescence: 'violent' | 'vigorous' | 'moderate' | 'gentle' | 'very-slow' = 'moderate';
  let durationSec = 20.0;

  if (relRate >= 0.8) {
    effervescence = 'vigorous';
    durationSec = 20.0;
  } else if (relRate >= 0.25) {
    effervescence = 'moderate';
    durationSec = 45.0;
  } else if (relRate >= 0.01) {
    effervescence = 'gentle';
    durationSec = 110.0;
  } else {
    effervescence = 'very-slow';
    durationSec = 240.0;
  }

  const reactionDesc =
    type === 'hydrochloric'
      ? `Rapid, vigorous hydrogen effervescence with complete ribbon dissolution in ~${durationSec}s due to 100% [H⁺] availability.`
      : `Slow, steady streaming bubbles; reaction takes ~${durationSec}s because only ${(alpha * 100).toFixed(1)}% of molecules are ionized at any instant.`;

  const explanation =
    type === 'hydrochloric'
      ? `Strong Acid (HCl): Complete ionization (α = 100%). At ${c} M, [H⁺] = ${hPlus.toFixed(4)} M => pH = ${phVal}.`
      : `Weak Acid (CH₃COOH): Equilibrium ionization with Ka = 1.75×10⁻⁵. At ${c} M, only ${(alpha * 100).toFixed(2)}% of molecules ionize => [H⁺] = ${hPlus.toExponential(3)} M => pH = ${phVal}.`;

  return {
    acidType: type,
    acidName,
    formula,
    isStrongAcid: isStrong,
    analyticalConcentrationM: c,
    acidDissociationConstantKa: ka,
    degreeOfIonisationAlpha: Number(alpha.toFixed(4)),
    percentIonisation: pctAlpha,
    hydroniumConcentrationM: Number(hPlus.toExponential(4)),
    hydroxideConcentrationM: Number(ohMinus.toExponential(4)),
    ph: phVal,
    poh: pohVal,
    colorWithUniversalIndicator: uiColor,
    universalIndicatorLabel: uiLabel,
    magnesiumReaction: {
      relativeRate: relRate,
      reactionDescription: reactionDesc,
      effervescenceIntensity: effervescence,
      estimatedReactionDurationSec: durationSec,
      totalH2GasVolumeMl: totalH2Volume,
    },
    explanationSummary: explanation,
  };
}

/**
 * Compares equimolar solutions of strong acid (HCl) vs weak acid (CH3COOH)
 */
export function compareEquimolarAcids(concentrationM: number) {
  const hcl = calculateAcidIonisation({ acidType: 'hydrochloric', concentrationM });
  const ch3cooh = calculateAcidIonisation({ acidType: 'acetic', concentrationM });

  const hRatio = Number((hcl.hydroniumConcentrationM / ch3cooh.hydroniumConcentrationM).toFixed(1));
  const rateRatio = Number(
    (hcl.magnesiumReaction.relativeRate / ch3cooh.magnesiumReaction.relativeRate).toFixed(1)
  );

  return {
    concentrationM,
    strongAcid: hcl,
    weakAcid: ch3cooh,
    hydroniumRatio: hRatio, // e.g. 75x higher in HCl at 0.1M
    rateRatio,
    pedagogicalTakeaway:
      'STRENGTH vs CONCENTRATION: Equal concentrations do NOT yield equal pH or reaction rates! Strong acids ionize completely, while weak acids establish a dynamic equilibrium governed by Ostwald’s dilution law.',
  };
}
