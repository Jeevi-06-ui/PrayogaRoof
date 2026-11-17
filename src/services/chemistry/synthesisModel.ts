/**
 * Inorganic and Organic Compound Synthesis Scientific Model
 * Curriculum: CBSE Class 12 Chemistry Practical
 * 
 * Compounds Modeled:
 * 1. Mohr's Salt (Ferrous Ammonium Sulphate): FeSO4·(NH4)2SO4·6H2O [Inorganic Double Salt, Light Green Monoclinic]
 * 2. Potash Alum: K2SO4·Al2(SO4)3·24H2O [Inorganic Double Salt, Colorless Octahedral]
 * 3. Acetanilide: C6H5NHCOCH3 [Organic Amide, Glistening White Leaflets, MP = 114°C]
 * 4. Dibenzalacetone: C17H14O [Organic α,β-Unsaturated Ketone, Bright Yellow Flakes, MP = 112°C]
 * 
 * Principles:
 * - Double Salt Formation: Equimolar ratio of two stable simple salts crystallizing in a stoichiometric lattice.
 * - Acidification with dil H2SO4 prevents oxidation and hydrolysis of Fe2+ ions into basic ferric sulphate.
 * - Nucleophilic Acyl Substitution: Acetylation of primary aromatic amine (aniline) with acetic anhydride.
 * - Percentage Yield: (Actual Mass Recovered / Theoretical Stoichiometric Mass) * 100%.
 */

export type CompoundSynthesisId =
  | 'mohrs-salt'
  | 'potash-alum'
  | 'acetanilide'
  | 'dibenzalacetone';

export type SynthesisStage =
  | 'reactant-mixing'
  | 'acidified-heating'
  | 'crystallisation-cooling'
  | 'filtration-drying';

export interface CompoundPreparationSpec {
  id: CompoundSynthesisId;
  name: string;
  category: 'inorganic-double-salt' | 'organic-synthetic';
  balancedEquation: string;
  reactants: Array<{ name: string; quantity: string }>;
  acidOrCatalyst: string;
  theoreticalYieldGrams: number;
  expectedPracticalYieldGrams: number;
  crystalHabit: string;
  crystalColor: string;
  meltingOrDecompPointC: number;
  safetyNote: string;
  educationalPrinciple: string;
}

export const SYNTHESIS_CATALOG: Record<CompoundSynthesisId, CompoundPreparationSpec> = {
  'mohrs-salt': {
    id: 'mohrs-salt',
    name: 'Ferrous Ammonium Sulphate [FeSO₄·(NH₄)₂SO₄·6H₂O] (Mohr’s Salt)',
    category: 'inorganic-double-salt',
    balancedEquation: 'FeSO₄·7H₂O(s) + (NH₄)₂SO₄(s) → FeSO₄·(NH₄)₂SO₄·6H₂O(s) + H₂O(l)',
    reactants: [
      { name: 'Ferrous Sulphate Heptahydrate (FeSO₄·7H₂O)', quantity: '7.00 g (0.0252 mol)' },
      { name: 'Ammonium Sulphate ((NH₄)₂SO₄)', quantity: '3.33 g (0.0252 mol)' },
    ],
    acidOrCatalyst: '2-3 mL Dilute H₂SO₄ (prevents aerial oxidation of Fe²⁺ to Fe³⁺ and hydrolysis)',
    theoreticalYieldGrams: 9.88,
    expectedPracticalYieldGrams: 8.45, // ~85.5%
    crystalHabit: 'Monoclinic prisms (light sea-green, transparent)',
    crystalColor: '#a7f3d0',
    meltingOrDecompPointC: 100, // Loses water of crystallisation at ~100°C
    safetyNote: 'Dilute H2SO4 must be added prior to warming to keep Fe(II) completely reduced.',
    educationalPrinciple:
      'Double salts completely dissociate into simple individual ions (Fe²⁺, NH₄⁺, SO₄²⁻) in aqueous solution, unlike coordination complexes.',
  },
  'potash-alum': {
    id: 'potash-alum',
    name: 'Potash Alum [K₂SO₄·Al₂(SO₄)₃·24H₂O] (Fitkari)',
    category: 'inorganic-double-salt',
    balancedEquation: 'K₂SO₄(s) + Al₂(SO₄)₃·18H₂O(s) + 6H₂O(l) → K₂SO₄·Al₂(SO₄)₃·24H₂O(s)',
    reactants: [
      { name: 'Potassium Sulphate (K₂SO₄)', quantity: '2.50 g (0.0143 mol)' },
      { name: 'Aluminium Sulphate (Al₂(SO₄)₃·18H₂O)', quantity: '9.55 g (0.0143 mol)' },
    ],
    acidOrCatalyst: '1 mL Dilute H₂SO₄ (prevents precipitation of gelatinous Al(OH)₃)',
    theoreticalYieldGrams: 13.58,
    expectedPracticalYieldGrams: 11.20, // ~82.5%
    crystalHabit: 'Regular octahedral crystals (colorless, sparkling)',
    crystalColor: '#e2e8f0',
    meltingOrDecompPointC: 92.5,
    safetyNote: 'Do not over-boil; concentrate only to the crystallization point test.',
    educationalPrinciple:
      'Isomorphous double sulphate lattice forming characteristic sparkling octahedra with 24 crystal waters.',
  },
  'acetanilide': {
    id: 'acetanilide',
    name: 'Acetanilide (N-Phenylacetamide - C₆H₅NHCOCH₃)',
    category: 'organic-synthetic',
    balancedEquation: 'C₆H₅NH₂(l) + (CH₃CO)₂O(l) → C₆H₅NHCOCH₃(s) + CH₃COOH(l)',
    reactants: [
      { name: 'Freshly Distilled Aniline (C₆H₅NH₂)', quantity: '5.00 mL (5.10 g, 0.0548 mol)' },
      { name: 'Acetic Anhydride ((CH₃CO)₂O)', quantity: '5.00 mL (5.40 g, 0.0529 mol)' },
    ],
    acidOrCatalyst: '5 mL Glacial Acetic Acid + 0.1 g Zinc Dust (prevents aniline oxidation to dark quinones)',
    theoreticalYieldGrams: 7.15,
    expectedPracticalYieldGrams: 5.95, // ~83.2%
    crystalHabit: 'Glistening white leaflets / shiny scales (recrystallized from hot water)',
    crystalColor: '#ffffff',
    meltingOrDecompPointC: 114.0, // Sharp melting point for pure sample
    safetyNote: 'SIMULATION-ONLY WORKFLOW: Aniline is hazardous and absorbed through skin; handled exclusively in virtual safety environment.',
    educationalPrinciple:
      'Nucleophilic acyl substitution: Aniline amino nitrogen attacks the carbonyl carbon of acetic anhydride, protecting the amino group by acetylation.',
  },
  'dibenzalacetone': {
    id: 'dibenzalacetone',
    name: 'Dibenzalacetone (1,5-Diphenylpenta-1,4-dien-3-one)',
    category: 'organic-synthetic',
    balancedEquation: 'CH₃COCH₃(l) + 2C₆H₅CHO(l) → C₆H₅CH=CHCOCH=CHC₆H₅(s) + 2H₂O(l)',
    reactants: [
      { name: 'Benzaldehyde (C₆H₅CHO)', quantity: '5.00 mL (5.22 g, 0.0492 mol)' },
      { name: 'Acetone (CH₃COCH₃)', quantity: '1.80 mL (1.43 g, 0.0246 mol)' },
    ],
    acidOrCatalyst: '10% Aqueous NaOH in Ethanol (Claisen-Schmidt base catalyst generating enolate)',
    theoreticalYieldGrams: 5.76,
    expectedPracticalYieldGrams: 4.65, // ~80.7%
    crystalHabit: 'Bright canary-yellow glistening plates / flakes',
    crystalColor: '#fde047',
    meltingOrDecompPointC: 112.0,
    safetyNote: 'Maintain temperature between 20-25°C to avoid self-condensation of acetone into mesityl oxide.',
    educationalPrinciple:
      'Crossed aldol condensation (Claisen-Schmidt reaction) where enolizable acetone reacts with non-enolizable benzaldehyde.',
  },
};

export interface SynthesisParams {
  compoundId: CompoundSynthesisId;
  stage: SynthesisStage;
  heatingDurationMin?: number;
  coolingDurationMin?: number;
  isAcidified?: boolean;
}

export interface SynthesisState {
  spec: CompoundPreparationSpec;
  currentStage: SynthesisStage;
  isAcidified: boolean;
  solutionAppearance: string;
  crystalFormed: boolean;
  crystalMassGrams: number;
  practicalYieldPercent: number;
  purityPercent: number;
  meltingPointObservedC: number;
  statusMessage: string;
  assumptions: string[];
}

export const SYNTHESIS_ASSUMPTIONS = [
  'Stoichiometric molar ratios are maintained according to standard NCERT Class 12 laboratory manual preparations.',
  'Acidification prevents precipitation of unwanted insoluble oxides or basic salts during concentration.',
  'Crystallization proceeds via slow undisturbed air cooling to maximize monoclinic / octahedral crystal habit development.',
  'Recrystallization from distilled water eliminates excess soluble reactants, giving sharp characteristic melting points.',
];

/**
 * Computes simulation state for inorganic or organic compound synthesis
 */
export function calculateSynthesisState(params: SynthesisParams): SynthesisState {
  const spec = SYNTHESIS_CATALOG[params.compoundId] || SYNTHESIS_CATALOG['mohrs-salt'];
  const stage = params.stage;
  const isAcidified = params.isAcidified !== false;
  const heatMin = Math.max(0, params.heatingDurationMin ?? 10);
  const coolMin = Math.max(0, params.coolingDurationMin ?? 15);

  let solutionAppearance = 'Homogeneous liquid mixture';
  let crystalFormed = false;
  let crystalMassGrams = 0;
  let practicalYieldPercent = 0;
  let purityPercent = 0;
  let meltingPointObservedC = 0;
  let statusMessage = '';

  switch (stage) {
    case 'reactant-mixing':
      solutionAppearance =
        spec.category === 'inorganic-double-salt'
          ? 'Clear pale green / transparent aqueous dissolution'
          : 'Pale amber / pale yellow organic liquid mixture';
      statusMessage = `Reactants measured equimolarly. ${isAcidified ? 'Acid medium established.' : 'Warning: Medium lacks protective acid!'}`;
      break;

    case 'acidified-heating':
      solutionAppearance = `Boiling concentrated solution at ${heatMin >= 10 ? 'crystallisation point (crust forms on glass rod)' : 'under-concentrated stage'}`;
      statusMessage = `Warmed for ${heatMin} minutes. Crust test confirms saturation. Ready for cooling.`;
      break;

    case 'crystallisation-cooling':
      if (coolMin >= 10) {
        crystalFormed = true;
        crystalMassGrams = Number((spec.expectedPracticalYieldGrams * 0.95).toFixed(2));
        practicalYieldPercent = Number(((crystalMassGrams / spec.theoreticalYieldGrams) * 100).toFixed(1));
        solutionAppearance = `Abundant solid crystallization: ${spec.crystalHabit} deposited at bottom of vessel.`;
        statusMessage = `Crystallization complete after ${coolMin} min undisturbed cooling.`;
      } else {
        solutionAppearance = 'Supersaturated liquid beginning nucleated crystal growth.';
        statusMessage = `Cooling in progress (${coolMin}/15 min). Do not disturb vessel during crystal growth.`;
      }
      break;

    case 'filtration-drying':
    default:
      crystalFormed = true;
      crystalMassGrams = spec.expectedPracticalYieldGrams;
      practicalYieldPercent = Number(((crystalMassGrams / spec.theoreticalYieldGrams) * 100).toFixed(1));
      purityPercent = isAcidified ? 98.5 : 88.0;
      meltingPointObservedC = isAcidified ? spec.meltingOrDecompPointC : spec.meltingOrDecompPointC - 4.5;
      solutionAppearance = `Pure dry crystals isolated on filter paper: ${spec.crystalHabit}.`;
      statusMessage = `Recovery complete: ${crystalMassGrams} g (${practicalYieldPercent}% yield). Purity: ${purityPercent}%.`;
      break;
  }

  return {
    spec,
    currentStage: stage,
    isAcidified,
    solutionAppearance,
    crystalFormed,
    crystalMassGrams,
    practicalYieldPercent,
    purityPercent,
    meltingPointObservedC,
    statusMessage,
    assumptions: SYNTHESIS_ASSUMPTIONS,
  };
}
