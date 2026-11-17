/**
 * Acid-Base Titration & Analytical Endpoint Engine (Class 11)
 *
 * Supported Systems:
 * 1. Oxalic Acid vs Sodium Hydroxide (Diprotic weak acid - Strong base):
 *    H₂C₂O₄ + 2NaOH -> Na₂C₂O₄ + 2H₂O
 *    Stoichiometry: 1 mol oxalic acid reacts with 2 mol NaOH.
 *    Equivalence volume: Veq = (2 * Ma * Va) / Mb
 *    Indicator: Phenolphthalein (colorless -> pale persistent pink, pH 8.3 - 10.0)
 *
 * 2. Hydrochloric Acid vs Sodium Hydroxide (Monoprotic strong acid - Strong base):
 *    HCl + NaOH -> NaCl + H₂O
 *    Stoichiometry: 1 mol HCl reacts with 1 mol NaOH.
 *    Equivalence volume: Veq = (Ma * Va) / Mb
 *    Indicators: Phenolphthalein (pH 8.2 - 10) or Methyl Orange (pH 3.1 - 4.4, red -> yellow)
 */

export type TitrationSystemType = 'oxalic-acid-naoh' | 'hcl-naoh';
export type TitrationIndicator = 'phenolphthalein' | 'methyl-orange';

export interface TitrationParams {
  system?: TitrationSystemType;
  analyteVolumeMl?: number; // e.g. 20.0 mL
  analyteMolarityM?: number; // e.g. 0.1 M
  titrantMolarityM?: number; // e.g. 0.1 M
  titrantDeliveredMl?: number; // volume dispensed from burette
  indicator?: TitrationIndicator;
}

export interface TitrationCurvePoint {
  volumeMl: number;
  ph: number;
}

export interface TitrationState {
  system: TitrationSystemType;
  analyteVolumeMl: number;
  analyteMolarityM: number;
  titrantMolarityM: number;
  titrantDeliveredMl: number;
  totalVolumeMl: number;
  equivalenceVolumeMl: number;
  ph: number;
  hPlusM: number;
  ohMinusM: number;
  dpH_dV: number; // derivative slope
  isAtEndpoint: boolean;
  status: 'before-equivalence' | 'at-equivalence' | 'past-equivalence';
  indicator: TitrationIndicator;
  solutionColorHex: string;
  indicatorColorName: string;
  observation: string;
  curvePoints: TitrationCurvePoint[];
}

/**
 * Calculates theoretical pH for diprotic oxalic acid titration against strong base NaOH
 */
function calculateOxalicAcidPH(
  va: number, // mL
  ma: number, // M
  vb: number, // mL
  mb: number  // M
): number {
  const vTotal = va + vb;
  const initialMolesAcid = (ma * va) / 1000.0;
  const deliveredMolesBase = (mb * vb) / 1000.0;
  const veq1 = (ma * va) / mb; // First stage H2C2O4 -> HC2O4-
  const veq2 = (2.0 * ma * va) / mb; // Second stage HC2O4- -> C2O4(2-)

  const pKa1 = 1.25;
  const pKa2 = 4.27;
  const ka1 = Math.pow(10, -pKa1);
  const ka2 = Math.pow(10, -pKa2);

  if (vb <= 0.001) {
    // Pure oxalic acid diprotic equilibrium: [H+] ≈ sqrt(Ka1 * C)
    const c0 = ma;
    const hPlus = (-ka1 + Math.sqrt(ka1 * ka1 + 4.0 * ka1 * c0)) / 2.0;
    return Math.max(0.8, Math.min(3.5, -Math.log10(hPlus)));
  }

  if (vb < veq1 * 0.98) {
    // Buffer region 1: H2C2O4 / HC2O4-
    const molesH2C2O4 = initialMolesAcid - deliveredMolesBase;
    const molesHC2O4 = deliveredMolesBase;
    const ratio = Math.max(0.01, molesHC2O4 / Math.max(0.0001, molesH2C2O4));
    return Math.max(1.0, Math.min(3.0, pKa1 + Math.log10(ratio)));
  }

  if (Math.abs(vb - veq1) <= veq1 * 0.02) {
    // First equivalence point: intermediate amphiprotic HC2O4-
    return (pKa1 + pKa2) / 2.0; // ~ 2.76
  }

  if (vb < veq2 * 0.98) {
    // Buffer region 2: HC2O4- / C2O4(2-)
    const molesBaseInStage2 = deliveredMolesBase - initialMolesAcid;
    const molesHC2O4 = initialMolesAcid - molesBaseInStage2;
    const molesC2O4 = molesBaseInStage2;
    const ratio = Math.max(0.01, molesC2O4 / Math.max(0.0001, molesHC2O4));
    return Math.max(3.0, Math.min(7.0, pKa2 + Math.log10(ratio)));
  }

  if (Math.abs(vb - veq2) <= 0.2) {
    // Equivalence point 2: Sodium oxalate salt hydrolysis
    // C2O4(2-) + H2O ⇌ HC2O4- + OH-
    // Kb = Kw / Ka2 = 10^-14 / 10^-4.27 = 10^-9.73
    const cSalt = initialMolesAcid / (vTotal / 1000.0);
    const kb = 1e-14 / ka2;
    const ohMinus = Math.sqrt(kb * cSalt);
    const pOH = -Math.log10(Math.max(1e-14, ohMinus));
    return Math.max(8.2, Math.min(8.7, 14.0 - pOH));
  }

  // Excess strong base (NaOH)
  const excessMolesBase = deliveredMolesBase - 2.0 * initialMolesAcid;
  const ohM = excessMolesBase / (vTotal / 1000.0);
  const pOH = -Math.log10(Math.max(1e-14, ohM));
  return Math.min(13.5, Math.max(8.5, 14.0 - pOH));
}

/**
 * Calculates theoretical pH for monoprotic strong acid HCl titrated with NaOH
 */
function calculateHCLPH(
  va: number, // mL
  ma: number, // M
  vb: number, // mL
  mb: number  // M
): number {
  const vTotal = va + vb;
  const molesAcid = (ma * va) / 1000.0;
  const molesBase = (mb * vb) / 1000.0;
  const veq = (ma * va) / mb;

  if (Math.abs(vb - veq) <= 0.05) {
    return 7.0; // Equivalence point for strong acid + strong base
  }

  if (vb < veq) {
    const remainingAcidMoles = molesAcid - molesBase;
    const hM = remainingAcidMoles / (vTotal / 1000.0);
    return Math.max(0.5, Math.min(6.5, -Math.log10(Math.max(1e-14, hM))));
  } else {
    const excessBaseMoles = molesBase - molesAcid;
    const ohM = excessBaseMoles / (vTotal / 1000.0);
    const pOH = -Math.log10(Math.max(1e-14, ohM));
    return Math.min(13.8, Math.max(7.5, 14.0 - pOH));
  }
}

/**
 * Generates an array of theoretical curve points for graph rendering
 */
export function generateTitrationCurve(
  system: TitrationSystemType,
  va: number,
  ma: number,
  mb: number,
  maxV: number = 50.0
): TitrationCurvePoint[] {
  const points: TitrationCurvePoint[] = [];
  const step = 0.5;
  for (let v = 0; v <= maxV; v += step) {
    const ph =
      system === 'oxalic-acid-naoh'
        ? calculateOxalicAcidPH(va, ma, v, mb)
        : calculateHCLPH(va, ma, v, mb);
    points.push({
      volumeMl: Number(v.toFixed(1)),
      ph: Number(ph.toFixed(2)),
    });
  }
  return points;
}

/**
 * Calculates the complete state of the titration experiment at any delivered volume
 */
export function calculateTitrationState(params: TitrationParams = {}): TitrationState {
  const system = params.system ?? 'oxalic-acid-naoh';
  const va = Math.max(5, params.analyteVolumeMl ?? 20.0);
  const ma = Math.max(0.01, params.analyteMolarityM ?? 0.1);
  const mb = Math.max(0.01, params.titrantMolarityM ?? 0.1);
  const vb = Math.max(0, Math.min(50, params.titrantDeliveredMl ?? 0.0));
  const indicator = params.indicator ?? 'phenolphthalein';

  // Stoichiometric equivalence point volume
  const equivalenceVolumeMl =
    system === 'oxalic-acid-naoh'
      ? Number(((2.0 * ma * va) / mb).toFixed(2))
      : Number(((ma * va) / mb).toFixed(2));

  // Current pH
  const ph =
    system === 'oxalic-acid-naoh'
      ? calculateOxalicAcidPH(va, ma, vb, mb)
      : calculateHCLPH(va, ma, vb, mb);

  const roundedPh = Number(ph.toFixed(2));
  const hPlusM = Number(Math.pow(10, -roundedPh).toExponential(3));
  const ohMinusM = Number((1e-14 / Math.pow(10, -roundedPh)).toExponential(3));

  // Numerical slope dpH/dV
  const deltaV = 0.1;
  const phPlus =
    system === 'oxalic-acid-naoh'
      ? calculateOxalicAcidPH(va, ma, vb + deltaV, mb)
      : calculateHCLPH(va, ma, vb + deltaV, mb);
  const dpH_dV = Number((Math.abs(phPlus - roundedPh) / deltaV).toFixed(2));

  // Endpoint detection status (within 0.2 mL of theoretical Veq)
  const isAtEndpoint = Math.abs(vb - equivalenceVolumeMl) <= 0.25;
  let status: 'before-equivalence' | 'at-equivalence' | 'past-equivalence' = 'before-equivalence';

  if (isAtEndpoint) {
    status = 'at-equivalence';
  } else if (vb > equivalenceVolumeMl) {
    status = 'past-equivalence';
  }

  // Indicator colorimetry
  let solutionColorHex = '#f8fafc'; // Clear / colorless default
  let indicatorColorName = 'Colorless';
  let observation = '';

  if (indicator === 'phenolphthalein') {
    if (roundedPh < 8.2) {
      solutionColorHex = '#f8fafc';
      indicatorColorName = 'Colorless';
      observation =
        vb === 0
          ? 'Conical flask contains clear analyte solution with phenolphthalein indicator. Solution is completely colorless in acidic pH.'
          : `Titrant being delivered (${vb.toFixed(1)} mL). Transient pink flashes disappear upon swirling as acid neutralizes added NaOH.`;
    } else if (roundedPh >= 8.2 && roundedPh <= 9.0) {
      solutionColorHex = '#fbcfe8'; // Delicate persistent pale pink
      indicatorColorName = 'Permanent Pale Pink (Endpoint)';
      observation = `ENDPOINT REACHED at ${vb.toFixed(1)} mL! A permanent faint pink tinge persists for at least 30 seconds upon swirling (pH = ${roundedPh}). Neutralization complete.`;
    } else {
      solutionColorHex = '#ec4899'; // Deep pink / magenta
      indicatorColorName = 'Deep Magenta (Over-titrated)';
      observation = `Over-titration: Excess NaOH present (${vb.toFixed(1)} mL, pH = ${roundedPh}). Indicator exhibits deep magenta coloration.`;
    }
  } else {
    // Methyl Orange: Red (< 3.1) -> Orange (3.1 - 4.4) -> Yellow (> 4.4)
    if (roundedPh < 3.1) {
      solutionColorHex = '#ef4444';
      indicatorColorName = 'Red';
      observation = `Strongly acidic solution (pH = ${roundedPh}). Methyl orange exists in quinonoid red cation form.`;
    } else if (roundedPh >= 3.1 && roundedPh <= 4.4) {
      solutionColorHex = '#f97316';
      indicatorColorName = 'Orange (Transition Endpoint)';
      observation = `Methyl orange transition interval (pH = ${roundedPh}). Color shifts distinctly from red to bright yellow-orange.`;
    } else {
      solutionColorHex = '#eab308';
      indicatorColorName = 'Bright Yellow';
      observation = `Alkaline/neutral solution (pH = ${roundedPh}). Methyl orange exists in yellow benzenoid form.`;
    }
  }

  // Pre-generate curve points for visualization
  const curvePoints = generateTitrationCurve(system, va, ma, mb, 50.0);

  return {
    system,
    analyteVolumeMl: va,
    analyteMolarityM: ma,
    titrantMolarityM: mb,
    titrantDeliveredMl: vb,
    totalVolumeMl: Number((va + vb).toFixed(1)),
    equivalenceVolumeMl,
    ph: roundedPh,
    hPlusM,
    ohMinusM,
    dpH_dV,
    isAtEndpoint,
    status,
    indicator,
    solutionColorHex,
    indicatorColorName,
    observation,
    curvePoints,
  };
}
