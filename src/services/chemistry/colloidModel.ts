/**
 * Colloid & Surface Chemistry Scientific Model
 * Curriculum: CBSE Class 12 Chemistry Practical (Colloid Preparation, Tyndall Effect, Hardy-Schulze Rule)
 * 
 * Sols Modeled:
 * 1. Hydrated Ferric Hydroxide Fe(OH)3 Sol (Lyophobic, Positive sol, Deep Red-Brown)
 * 2. Starch Sol (Lyophilic, Hydrated Reversible sol, Translucent Opalescent White)
 * 3. Arsenious Sulphide As2S3 Sol (Lyophobic, Negative sol, Canary Yellow)
 * 4. True Solution (Aqueous NaCl, Molecular dispersion, Clear Colorless)
 * 
 * Scientific Principles:
 * - Sol Formation: Hydrolysis of FeCl3 in boiling water: FeCl3 + 3H2O -> Fe(OH)3(sol) + 3HCl
 * - Tyndall Effect: Light scattering by colloidal particles (1 - 1000 nm). Transverse illuminated cone.
 * - Hardy-Schulze Rule: Coagulating power is proportional to the valence of the coagulating ion
 *   (the ion carrying charge opposite to that of the colloidal sol).
 *   For positive Fe(OH)3 sol: [Fe(CN)6]4- >> PO4(3-) > SO4(2-) >> Cl-
 *   For negative As2S3 sol: Al(3+) >> Ba(2+) >> Na+
 */

export type SolType = 'feoh3-sol' | 'starch-sol' | 'as2s3-sol' | 'true-solution-nacl';
export type ColloidCategory = 'lyophobic' | 'lyophilic' | 'true-solution';
export type SolCharge = 'positive' | 'negative' | 'neutral';
export type CoagulatingElectrolyte = 'k4fe_cn6' | 'na2so4' | 'nacl' | 'alcl3' | 'bacl2' | 'none';

export interface SolDefinition {
  id: SolType;
  name: string;
  category: ColloidCategory;
  charge: SolCharge;
  stabilizingIon: string;
  baseColor: string;
  transparency: number; // 0 to 1
  particleSizeNm: number;
  preparationMethod: string;
  chemicalEquation: string;
  reversibility: 'irreversible' | 'reversible';
}

export const SOL_CATALOG: Record<SolType, SolDefinition> = {
  'feoh3-sol': {
    id: 'feoh3-sol',
    name: 'Hydrated Ferric Hydroxide Sol [Fe(OH)₃ / Fe³⁺]',
    category: 'lyophobic',
    charge: 'positive',
    stabilizingIon: 'Fe³⁺ (preferential adsorption)',
    baseColor: '#881337', // Deep red-brown
    transparency: 0.85,
    particleSizeNm: 35,
    preparationMethod:
      'Hydrolysis: Add 2% FeCl3 solution dropwise into vigorously boiling distilled water with continuous stirring.',
    chemicalEquation: 'FeCl₃(aq) + 3H₂O(l) → Fe(OH)₃(sol) + 3HCl(aq)',
    reversibility: 'irreversible',
  },
  'starch-sol': {
    id: 'starch-sol',
    name: 'Soluble Starch Sol (Amylose / Amylopectin)',
    category: 'lyophilic',
    charge: 'neutral', // slightly negative/neutral, primarily stabilized by heavy hydration shell
    stabilizingIon: 'Hydration envelope (H₂O dipole solvating sheath)',
    baseColor: '#e2e8f0', // Translucent opalescent milky white
    transparency: 0.70,
    particleSizeNm: 120,
    preparationMethod:
      'Hydration: Make smooth starch paste with cold water, pour into boiling water, and boil for 2-3 minutes with stirring.',
    chemicalEquation: '(C₆H₁₀O₅)ₙ(s) + mH₂O(l) → (C₆H₁₀O₅)ₙ·mH₂O(sol)',
    reversibility: 'reversible',
  },
  'as2s3-sol': {
    id: 'as2s3-sol',
    name: 'Arsenious Sulphide Sol [As₂S₃ / S²⁻]',
    category: 'lyophobic',
    charge: 'negative',
    stabilizingIon: 'S²⁻ (preferential adsorption)',
    baseColor: '#eab308', // Bright canary yellow
    transparency: 0.88,
    particleSizeNm: 45,
    preparationMethod:
      'Double decomposition: Pass H₂S gas through hot aqueous As₂O₃ solution until saturated, boil off excess H₂S.',
    chemicalEquation: 'As₂O₃(aq) + 3H₂S(g) → As₂S₃(sol) + 3H₂O(l)',
    reversibility: 'irreversible',
  },
  'true-solution-nacl': {
    id: 'true-solution-nacl',
    name: 'Aqueous Sodium Chloride True Solution (NaCl)',
    category: 'true-solution',
    charge: 'neutral',
    stabilizingIon: 'Hydrated Na⁺(aq) and Cl⁻(aq) ions',
    baseColor: '#38bdf8', // Crystal clear transparent
    transparency: 0.98,
    particleSizeNm: 0.35, // < 1 nm
    preparationMethod: 'Simple dissolution of crystalline NaCl in water.',
    chemicalEquation: 'NaCl(s) + aq → Na⁺(aq) + Cl⁻(aq)',
    reversibility: 'reversible',
  },
};

export interface ElectrolyteDefinition {
  id: CoagulatingElectrolyte;
  name: string;
  formula: string;
  cation: { symbol: string; valence: number };
  anion: { symbol: string; valence: number };
  description: string;
}

export const ELECTROLYTE_CATALOG: Record<CoagulatingElectrolyte, ElectrolyteDefinition> = {
  k4fe_cn6: {
    id: 'k4fe_cn6',
    name: 'Potassium Ferrocyanide (0.01M)',
    formula: 'K₄[Fe(CN)₆]',
    cation: { symbol: 'K⁺', valence: 1 },
    anion: { symbol: '[Fe(CN)₆]⁴⁻', valence: 4 },
    description: 'Quadrivalent anion with exceptionally high coagulating power for positive sols.',
  },
  na2so4: {
    id: 'na2so4',
    name: 'Sodium Sulphate (0.1M)',
    formula: 'Na₂SO₄',
    cation: { symbol: 'Na⁺', valence: 1 },
    anion: { symbol: 'SO₄²⁻', valence: 2 },
    description: 'Divalent sulphate anion with moderate coagulating efficacy.',
  },
  nacl: {
    id: 'nacl',
    name: 'Sodium Chloride (0.5M)',
    formula: 'NaCl',
    cation: { symbol: 'Na⁺', valence: 1 },
    anion: { symbol: 'Cl⁻', valence: 1 },
    description: 'Monovalent chloride anion requiring high concentration to induce coagulation.',
  },
  alcl3: {
    id: 'alcl3',
    name: 'Aluminium Chloride (0.01M)',
    formula: 'AlCl₃',
    cation: { symbol: 'Al³⁺', valence: 3 },
    anion: { symbol: 'Cl⁻', valence: 1 },
    description: 'Trivalent aluminium cation with potent coagulating power for negative sols.',
  },
  bacl2: {
    id: 'bacl2',
    name: 'Barium Chloride (0.05M)',
    formula: 'BaCl₂',
    cation: { symbol: 'Ba²⁺', valence: 2 },
    anion: { symbol: 'Cl⁻', valence: 1 },
    description: 'Divalent barium cation with intermediate coagulating power.',
  },
  none: {
    id: 'none',
    name: 'No Electrolyte Added',
    formula: 'None',
    cation: { symbol: '-', valence: 0 },
    anion: { symbol: '-', valence: 0 },
    description: 'Pure colloidal dispersion without added salt.',
  },
};

export interface ColloidParams {
  solType: SolType;
  laserActive: boolean;
  electrolyte: CoagulatingElectrolyte;
  electrolyteVolumeMl?: number; // mL of electrolyte added
  isBoilingWater?: boolean; // Required for Fe(OH)3 hydrolysis
  fecl3AddedDrops?: number; // Drops of FeCl3 added
  isWarmedStarch?: boolean;
}

export interface ColloidState {
  sol: SolDefinition;
  laserActive: boolean;
  tyndallIntensityPercent: number; // 0 to 100%
  tyndallConeVisible: boolean;
  tyndallObservation: string;
  coagulationStatus: 'stable-colloid' | 'incipient-turbidity' | 'coagulated-precipitate';
  flocculationValence: number;
  coagulationObservation: string;
  particleMotionFactor: number; // Brownian motion speed factor
  effectiveColor: string;
  assumptions: string[];
}

export const COLLOID_ASSUMPTIONS = [
  'Colloidal particle diameters lie in the range 1 nm to 1000 nm (10 Å to 10000 Å).',
  'Tyndall light scattering requires that particle size is comparable to wavelength (650 nm laser) and refractive indices differ substantially.',
  'Lyophilic sols are stabilized primarily by a protective hydration envelope in addition to surface charge, resisting simple electrolyte coagulation.',
  'Hardy-Schulze Rule: Flocculating efficiency scales rapidly with the ionic charge of the active opposing ion (~ valence⁴ to valence⁶).',
  'Hydrolysis of FeCl3 requires boiling water (100°C) to prevent immediate macro-precipitation of coarse Fe(OH)3.',
];

/**
 * Calculates the state of the colloid simulation
 */
export function calculateColloidState(params: ColloidParams): ColloidState {
  const sol = SOL_CATALOG[params.solType] || SOL_CATALOG['feoh3-sol'];
  const laserActive = Boolean(params.laserActive);
  const electrolyte = ELECTROLYTE_CATALOG[params.electrolyte] || ELECTROLYTE_CATALOG['none'];
  const electrolyteVol = Math.max(0, params.electrolyteVolumeMl ?? 0);

  // 1. Tyndall Scattering Calculation
  let tyndallPercent = 0;
  let tyndallConeVisible = false;
  let tyndallObservation = '';

  if (sol.category === 'true-solution') {
    tyndallPercent = 0;
    tyndallConeVisible = false;
    tyndallObservation = laserActive
      ? 'No Tyndall effect: True solution particles (<1 nm) are too small to scatter light. Laser beam passes invisibly through liquid.'
      : 'Laser is OFF. Solution appears transparent and colorless.';
  } else if (sol.category === 'lyophilic') {
    // Starch sol scatters light moderately because hydrated particle and water have similar refractive indices
    tyndallPercent = laserActive ? 52 : 0;
    tyndallConeVisible = laserActive;
    tyndallObservation = laserActive
      ? 'Moderate Tyndall scattering: Starch particles (~120 nm) scatter red laser light, forming a distinct opalescent illuminated path.'
      : 'Laser is OFF. Starch sol shows characteristic opalescent milky-white translucence.';
  } else {
    // Lyophobic sols (Fe(OH)3, As2S3) have strong refractive index contrast with water
    tyndallPercent = laserActive ? 92 : 0;
    tyndallConeVisible = laserActive;
    tyndallObservation = laserActive
      ? `Intense Tyndall effect: High refractive index contrast between ${sol.name} particles and dispersion medium produces a brilliant transverse luminous red scattering cone.`
      : 'Laser is OFF. Deeply colored colloidal dispersion is visible.';
  }

  // 2. Coagulation & Hardy-Schulze Evaluation
  let coagulationStatus: 'stable-colloid' | 'incipient-turbidity' | 'coagulated-precipitate' =
    'stable-colloid';
  let flocculationValence = 0;
  let coagulationObservation = '';
  let effectiveColor = sol.baseColor;

  if (sol.category === 'true-solution' || electrolyte.id === 'none' || electrolyteVol <= 0) {
    coagulationStatus = 'stable-colloid';
    coagulationObservation = `${sol.name} is stably dispersed in aqueous medium with no precipitation.`;
  } else if (sol.category === 'lyophilic') {
    // Lyophilic sol is stable against standard electrolyte addition due to hydration sheath
    coagulationStatus = 'stable-colloid';
    coagulationObservation =
      'Starch sol remains stable without coagulation. Lyophilic sols are heavily hydrated by solvent molecules, requiring both dehydration and high salt concentration to salt out.';
  } else {
    // Lyophobic sol coagulation governed by Hardy-Schulze rule
    if (sol.charge === 'positive') {
      // Coagulating ion is the ANION
      flocculationValence = electrolyte.anion.valence;
      const anionName = electrolyte.anion.symbol;

      if (flocculationValence === 4) {
        // [Fe(CN)6]4- : extremely potent coagulant (threshold ~0.1 mmol/L)
        if (electrolyteVol >= 0.5) {
          coagulationStatus = 'coagulated-precipitate';
          effectiveColor = '#450a0a'; // Dark coagulated clumps
          coagulationObservation = `Rapid complete coagulation: Quadrivalent ${anionName} has enormous coagulating power. Positive Fe(OH)₃ sol neutralizes and precipitates as heavy reddish-brown flocs!`;
        } else {
          coagulationStatus = 'incipient-turbidity';
          coagulationObservation = `Incipient coagulation: ${anionName} induces visible aggregation of colloidal particles.`;
        }
      } else if (flocculationValence === 2) {
        // SO4(2-) : moderate coagulant
        if (electrolyteVol >= 2.0) {
          coagulationStatus = 'coagulated-precipitate';
          effectiveColor = '#581c1c';
          coagulationObservation = `Coagulation occurred: Divalent ${anionName} provides sufficient counter-ion charge density to neutralize colloidal charge, precipitating Fe(OH)₃.`;
        } else if (electrolyteVol >= 0.5) {
          coagulationStatus = 'incipient-turbidity';
          coagulationObservation = `Developing flocculation: Divalent ${anionName} causes partial aggregation.`;
        } else {
          coagulationStatus = 'stable-colloid';
          coagulationObservation = `Stable: Added ${electrolyteVol} mL of ${electrolyte.formula} is below the critical coagulation concentration for SO₄²⁻.`;
        }
      } else {
        // Cl- : monovalent anion, very weak coagulating power
        if (electrolyteVol >= 8.0) {
          coagulationStatus = 'incipient-turbidity';
          coagulationObservation = `Weak flocculation: Monovalent ${anionName} requires high ionic strength to screen the double layer.`;
        } else {
          coagulationStatus = 'stable-colloid';
          coagulationObservation = `Stable sol: Monovalent ${anionName} has low coagulating power in accordance with Hardy-Schulze rule (coagulating value > 9.5 mmol/L).`;
        }
      }
    } else if (sol.charge === 'negative') {
      // For negative sol (As2S3), coagulating ion is the CATION
      flocculationValence = electrolyte.cation.valence;
      const cationName = electrolyte.cation.symbol;

      if (flocculationValence === 3) {
        // Al3+
        coagulationStatus = electrolyteVol >= 0.5 ? 'coagulated-precipitate' : 'incipient-turbidity';
        coagulationObservation = `Rapid coagulation: Trivalent ${cationName} strongly neutralizes negative As₂S₃ sol, causing immediate yellow curdy precipitation.`;
        effectiveColor = '#a16207';
      } else if (flocculationValence === 2) {
        // Ba2+
        coagulationStatus = electrolyteVol >= 2.0 ? 'coagulated-precipitate' : 'stable-colloid';
        coagulationObservation = `Coagulation with divalent ${cationName}: Moderately effective flocculation.`;
        effectiveColor = '#ca8a04';
      } else {
        // Na+
        coagulationStatus = 'stable-colloid';
        coagulationObservation = `Stable: Monovalent ${cationName} has minimal coagulating effect on negative sol.`;
      }
    }
  }

  // 3. Brownian Motion Factor
  const particleMotionFactor = Number((100 / (sol.particleSizeNm + 5)).toFixed(2));

  return {
    sol,
    laserActive,
    tyndallIntensityPercent: tyndallPercent,
    tyndallConeVisible,
    tyndallObservation,
    coagulationStatus,
    flocculationValence,
    coagulationObservation,
    particleMotionFactor,
    effectiveColor,
    assumptions: COLLOID_ASSUMPTIONS,
  };
}
