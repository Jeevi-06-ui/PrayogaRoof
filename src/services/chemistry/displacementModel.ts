/**
 * Displacement Reaction Scientific Model
 * Reaction: Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)
 * Curriculum: CBSE Class 10 (Ch 1 Chemical Reactions & Equations), ICSE Class 9/10
 * 
 * Electrochemistry & Reactivity:
 * - Iron (Fe) is situated above Copper (Cu) in the activity/reactivity series.
 * - Standard reduction potentials:
 *     Fe²⁺(aq) + 2e⁻ → Fe(s)    E° = -0.44 V
 *     Cu²⁺(aq) + 2e⁻ → Cu(s)    E° = +0.34 V
 *   E°cell = E°cathode - E°anode = +0.34 - (-0.44) = +0.78 V > 0 (thermodynamically spontaneous).
 * - Net Ionic Equation: Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)
 * - Iron nail loses mass by dissolution of Fe²⁺, but gains mass as denser elemental Cu coats its surface.
 */

export interface DisplacementReactionState {
  progressPercentage: number; // 0 to 100%
  progressPercent: number; // alias
  solutionColor: string; // #2563eb (blue) -> #86efac (pale green)
  solutionLabel: string;
  solutionMolarityCu: number; // 0.5M -> 0.0M
  molarityCuSO4: number; // alias
  solutionMolarityFe: number; // 0.0M -> 0.5M
  molarityFeSO4: number; // alias
  nailSurfaceColor: string; // #64748b (silvery gray) -> #9a3412 (reddish brown copper crust)
  nailColor: string; // alias
  nailDepositDescription: string;
  appearanceDescription: string; // alias
  copperPlatedGrams: number;
  depositedCopperGrams: number; // alias
  ironDissolvedGrams: number;
  dissolvedIronGrams: number; // alias
  netNailMassChangeGrams: number;
  netMassChangeGrams: number; // alias
  chemicalEquation: string;
  redoxEquation: string; // alias
  reactionObservationText: string;
}

export const DISPLACEMENT_SAFETY_NOTES = Object.assign(
  [
    'Copper(II) sulphate solution is toxic to aquatic organisms (GHS09 / H410) and is a skin and eye irritant (GHS07 / H315).',
    'Virtual simulation provides safe observation without requiring hazardous chemical disposal.',
    'In physical laboratories, exhausted displacement reaction solutions must be collected in heavy-metal waste containers, never poured down municipal sinks.',
  ],
  {
    ghsCodes: ['GHS07', 'GHS09'],
    hazardStatements: ['H302', 'H315', 'H319', 'H410'],
    educationalDisclaimer:
      'Virtual simulation provides safe observation without requiring hazardous chemical disposal.',
    handlingGuidelines: [
      'Wear safety splash goggles and nitrile gloves in physical laboratories.',
      'Collect copper and iron waste in designated heavy metal storage containers.',
    ],
  }
);

/**
 * Calculates chemical and visual progress of iron nail immersed in copper sulphate solution
 */
export function calculateDisplacementState(
  immersionTimeMins: number,
  isImmersed: boolean = true
): DisplacementReactionState {
  if (!isImmersed || immersionTimeMins <= 0) {
    return {
      progressPercentage: 0,
      progressPercent: 0,
      solutionColor: '#2563eb', // Vivid Blue
      solutionLabel: '0.5M Copper(II) Sulphate (CuSO₄)',
      solutionMolarityCu: 0.5,
      molarityCuSO4: 0.5,
      solutionMolarityFe: 0.0,
      molarityFeSO4: 0.0,
      nailSurfaceColor: '#64748b', // Clean metallic silvery gray
      nailColor: '#64748b',
      nailDepositDescription: 'Clean, sandpapered metallic iron surface (no deposit).',
      appearanceDescription: 'Clean iron nail substrate withdrawn from solution or unreacted.',
      copperPlatedGrams: 0,
      depositedCopperGrams: 0,
      ironDissolvedGrams: 0,
      dissolvedIronGrams: 0,
      netNailMassChangeGrams: 0,
      netMassChangeGrams: 0,
      chemicalEquation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
      redoxEquation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
      reactionObservationText:
        'Iron nail is outside solution or initial contact has just begun. Solution is deep sky blue.',
    };
  }

  // Kinetics: Standard 20-minute timeline to complete reaction
  const reactionDurationMins = 20.0;
  const progressFraction = Math.min(1.0, immersionTimeMins / reactionDurationMins);
  const progressPct = Number((progressFraction * 100).toFixed(1));

  // Solution molarity shift
  const cuMolarity = Number((0.5 * (1 - progressFraction)).toFixed(3));
  const feMolarity = Number((0.5 * progressFraction).toFixed(3));

  // Color interpolation: Deep Blue (#2563eb) -> Light Pale Green (#86efac)
  let solutionColor = '#2563eb';
  let solutionLabel = '';
  if (progressFraction < 0.25) {
    solutionColor = '#2563eb'; // Deep Blue
    solutionLabel = '0.5M CuSO₄ (Vivid Blue)';
  } else if (progressFraction < 0.6) {
    solutionColor = '#0ea5e9'; // Fading Blue-Cyan
    solutionLabel = 'CuSO₄ + FeSO₄ Mixture (Fading Blue)';
  } else if (progressFraction < 0.85) {
    solutionColor = '#2dd4bf'; // Turquoise Green-Blue
    solutionLabel = 'Transitioning solution (Pale Turquoise)';
  } else {
    solutionColor = '#86efac'; // Light Green
    solutionLabel = '0.5M Iron(II) Sulphate (FeSO₄ - Pale Green)';
  }

  // Nail surface color: Silvery Gray (#64748b) -> Reddish Brown Copper (#9a3412)
  let nailColor = '#64748b';
  let depositDesc = '';
  if (progressFraction < 0.15) {
    nailColor = '#64748b';
    depositDesc = 'Iron surface begins to dull slightly.';
  } else if (progressFraction < 0.5) {
    nailColor = '#b45309'; // Bronze-copper patches
    depositDesc = 'Thin reddish-brown patches of elemental copper nucleating on iron.';
  } else {
    nailColor = '#9a3412'; // Dense reddish-brown copper crust
    depositDesc = 'Dense, uniform reddish-brown elemental copper crust deposited over the iron nail.';
  }

  // Stoichiometry: Assuming 25 mL of 0.5M CuSO4 (0.0125 moles Cu2+)
  // Mass Cu deposited = 0.0125 * 63.55 g/mol * progress = ~0.79 g max
  // Mass Fe dissolved = 0.0125 * 55.85 g/mol * progress = ~0.70 g max
  // Net gain on nail = (63.55 - 55.85) * 0.0125 * progress = ~0.096 g gain
  const maxMoles = 0.0125;
  const cuGrams = Number((maxMoles * 63.55 * progressFraction).toFixed(3));
  const feGrams = Number((maxMoles * 55.85 * progressFraction).toFixed(3));
  const netGain = Number((cuGrams - feGrams).toFixed(3));

  let obsText = '';
  if (progressFraction >= 0.95) {
    obsText = `Displacement complete: Fe has displaced virtually all Cu²⁺ ions. Solution turned pale green (FeSO₄) and nail is coated with reddish-brown copper (+${netGain} g net mass gain).`;
  } else {
    obsText = `Reaction active (${progressPct}% complete, ${immersionTimeMins} mins elapsed): Blue Cu²⁺ ions reducing to Cu(s) on nail surface, Fe dissolving as Fe²⁺ into solution.`;
  }

  return {
    progressPercentage: progressPct,
    progressPercent: progressPct,
    solutionColor,
    solutionLabel,
    solutionMolarityCu: cuMolarity,
    molarityCuSO4: cuMolarity,
    solutionMolarityFe: feMolarity,
    molarityFeSO4: feMolarity,
    nailSurfaceColor: nailColor,
    nailColor,
    nailDepositDescription: depositDesc,
    appearanceDescription: depositDesc,
    copperPlatedGrams: cuGrams,
    depositedCopperGrams: cuGrams,
    ironDissolvedGrams: feGrams,
    dissolvedIronGrams: feGrams,
    netNailMassChangeGrams: netGain,
    netMassChangeGrams: netGain,
    chemicalEquation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
    redoxEquation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
    reactionObservationText: obsText,
  };
}
