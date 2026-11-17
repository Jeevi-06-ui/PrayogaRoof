import { ConceptualQuestion } from '../circuit/types';

export const PH_TESTING_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'ph-q1',
    experimentId: 'ph-testing',
    question:
      'On the standard pH scale (0 to 14) at 25°C, what numerical range defines an acidic solution?',
    options: [
      'pH < 7.0 (high [H⁺] concentration)',
      'pH = 7.0 exactly',
      'pH > 7.0 (high [OH⁻] concentration)',
      'pH between 12.0 and 14.0',
    ],
    correctIndex: 0,
    explanation:
      'The pH scale is defined as pH = -log₁₀[H⁺]. Pure water has [H⁺] = 10⁻⁷ M (pH = 7.0). Any solution with higher hydrogen ion concentration has pH < 7.0 and is acidic.',
  },
  {
    id: 'ph-q2',
    experimentId: 'ph-testing',
    question:
      'When Universal Indicator solution is added to 0.1M Hydrochloric Acid (HCl), what characteristic color is observed?',
    options: [
      'Bright scarlet red (pH ~ 1.0)',
      'Emerald green (pH ~ 7.0)',
      'Deep violet/purple (pH ~ 13.0)',
      'Cobalt blue (pH ~ 10.0)',
    ],
    correctIndex: 0,
    explanation:
      'Hydrochloric acid is a strong mineral acid with high dissociation ([H⁺] ≈ 0.1 M, pH ≈ 1.0). Universal indicator displays a bright scarlet red tint in this pH range.',
  },
  {
    id: 'ph-q3',
    experimentId: 'ph-testing',
    question:
      'If a test sample shifts Universal Indicator paper to a deep royal purple/violet color, what can be concluded?',
    options: [
      'The solution is a strong alkali (such as 0.1M NaOH) with pH ~ 12-14',
      'The solution is neutral distilled water with pH = 7',
      'The solution is dilute lemon juice with pH ~ 2.2',
      'The solution is pure acetic acid',
    ],
    correctIndex: 0,
    explanation:
      'Universal indicator transitions through red (acid) → green (neutral) → blue → deep violet/purple in strong alkalis like 0.1M NaOH where hydroxide concentration is high.',
  },
];

export const NATURAL_INDICATORS_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'nat-q1',
    experimentId: 'natural-indicators',
    question:
      'What distinct color change occurs when natural turmeric indicator is exposed to a basic (alkaline) solution like sodium hydroxide or baking soda?',
    options: [
      'It turns from yellow to deep reddish-brown',
      'It turns from yellow to bright blue',
      'It turns completely colorless',
      'It remains yellow with no change',
    ],
    correctIndex: 0,
    explanation:
      'Turmeric contains the natural polyphenol curcumin. In neutral and acidic environments (pH < 7.4) it is yellow, but in alkaline conditions (pH ≥ 7.5) it shifts to deep reddish-brown.',
  },
  {
    id: 'nat-q2',
    experimentId: 'natural-indicators',
    question:
      'What happens when dilute acid (like HCl or lemon juice) is added to a basic turmeric solution that had previously turned reddish-brown?',
    options: [
      'The acid neutralizes the base and restores the original yellow color',
      'The solution turns permanent black',
      'The reddish-brown color intensifies',
      'The solution solidifies into a gel',
    ],
    correctIndex: 0,
    explanation:
      'Adding acid introduces H⁺ ions which neutralize the alkaline OH⁻ ions. Once the solution returns to acidic or neutral pH, curcumin returns to its natural yellow tautomeric state.',
  },
  {
    id: 'nat-q3',
    experimentId: 'natural-indicators',
    question:
      'Red cabbage extract contains natural anthocyanin pigments. What color does it display in a strongly acidic solution (pH 1-2)?',
    options: [
      'Bright red / pink',
      'Grass green',
      'Yellowish-orange',
      'Dark blue',
    ],
    correctIndex: 0,
    explanation:
      'Anthocyanins in red cabbage exist as stable flavylium cations in strong acid (pH 1-2), producing a characteristic bright red or magenta color.',
  },
];

export const PAPER_CHROMATOGRAPHY_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'chrom-q1',
    experimentId: 'paper-chromatography',
    question:
      'In paper chromatography, how is the Retention Factor (Rf value) of a separated dye component defined and calculated?',
    options: [
      'Distance traveled by the solute component divided by distance traveled by the solvent front',
      'Distance traveled by the solvent front divided by distance traveled by the solute',
      'Total capillary migration time divided by paper strip length',
      'Total mass of the ink spot divided by solvent volume',
    ],
    correctIndex: 0,
    explanation:
      'Rf = (Distance traveled by solute component from baseline) / (Distance traveled by solvent front from baseline). Because components cannot travel ahead of the advancing mobile phase, Rf is a dimensionless ratio between 0.0 and 1.0.',
  },
  {
    id: 'chrom-q2',
    experimentId: 'paper-chromatography',
    question:
      'Why do the constituent pigments in commercial black or green ink separate into distinct colored bands along the paper strip?',
    options: [
      'They possess differing solubilities in the mobile solvent and differing adsorption affinities for cellulose paper fibers',
      'The pigments have different electrical charges that repel each other across the paper',
      'Denser pigments evaporate into the air while lighter pigments remain fixed to the origin',
      'The eluting solvent chemically converts the ink into new elements',
    ],
    correctIndex: 0,
    explanation:
      'Paper chromatography separates components through partition equilibrium. Pigments that are more soluble in the ascending mobile solvent and less strongly adsorbed to cellulose fibers migrate faster and achieve higher Rf values.',
  },
  {
    id: 'chrom-q3',
    experimentId: 'paper-chromatography',
    question:
      'What critical laboratory precaution must be observed when suspending spotted chromatography paper into the developing chamber?',
    options: [
      'The sample ink spots on the origin baseline must remain positioned above the solvent liquid level',
      'The ink spot must be fully submerged underwater at the bottom of the chamber',
      'The developing chamber must remain uncovered to allow solvent to evaporate rapidly',
      'The paper strip must be heated with a direct flame during development',
    ],
    correctIndex: 0,
    explanation:
      'If the origin baseline is submerged below the solvent surface, the ink spot will simply dissolve into the reservoir solvent pool instead of ascending the paper strip via capillary action.',
  },
];

export const DISPLACEMENT_REACTION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'disp-q1',
    experimentId: 'displacement-reaction',
    question:
      'When an iron nail is immersed in blue copper(II) sulphate solution (CuSO₄), what chemical reaction takes place?',
    options: [
      'Single displacement: Iron displaces copper to form iron(II) sulphate (FeSO₄) and elemental copper (Cu)',
      'Double decomposition producing an insoluble iron hydroxide precipitate',
      'Neutralization reaction generating salt and water',
      'No reaction occurs because copper is more reactive than iron',
    ],
    correctIndex: 0,
    explanation:
      'Iron is more reactive than copper in the activity series (E°cell = +0.78 V). Iron atoms lose electrons to form Fe²⁺ ions while Cu²⁺ ions gain electrons and plate out as metallic copper: Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s).',
  },
  {
    id: 'disp-q2',
    experimentId: 'displacement-reaction',
    question:
      'What macroscopic visual evidence confirms that the displacement reaction between iron and copper sulphate has occurred?',
    options: [
      'The blue solution fades to light pale green (FeSO₄) and a reddish-brown metallic copper crust coats the nail',
      'The solution turns bright magenta and vigorously releases hydrogen gas bubbles',
      'The iron nail dissolves completely without any solid precipitate or color change',
      'The liquid freezes into a dark blue crystalline block',
    ],
    correctIndex: 0,
    explanation:
      'The blue color of hydrated Cu²⁺ ions fades as they are reduced, while newly formed Fe²⁺ ions turn the solution light pale green. Concurrently, metallic reddish-brown copper deposits on the iron surface.',
  },
  {
    id: 'disp-q3',
    experimentId: 'displacement-reaction',
    question:
      'Based on the chemical reactivity series (Zn > Fe > Pb > Cu > Ag), which of the following combinations will NOT undergo a displacement reaction?',
    options: [
      'A copper wire immersed in an aqueous iron(II) sulphate solution',
      'A zinc strip immersed in an aqueous copper(II) sulphate solution',
      'An iron nail immersed in an aqueous copper(II) sulphate solution',
      'A copper strip immersed in an aqueous silver nitrate solution',
    ],
    correctIndex: 0,
    explanation:
      'Copper is less reactive than iron in the activity series. Consequently, elemental copper cannot reduce Fe²⁺ ions, and no spontaneous displacement reaction occurs.',
  },
];

export const CRYSTALLISATION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'cryst-q1',
    experimentId: 'crystallisation',
    question:
      'Why is crystallisation considered a superior purification technique compared to simple evaporation to dryness for solid salts?',
    options: [
      'Crystallisation excludes soluble impurities from the crystal lattice and avoids thermal decomposition of the product',
      'Crystallisation always yields twice as much solid product as evaporation',
      'Evaporation to dryness destroys all water molecules permanently',
      'Crystallisation can only be performed at temperatures below freezing point',
    ],
    correctIndex: 0,
    explanation:
      'Evaporation to dryness bakes all soluble impurities into the solid cake and may thermally char or decompose the solute. Crystallisation allows only identical solute molecules to integrate into the growing crystal lattice, leaving impurities dissolved in the mother liquor.',
  },
  {
    id: 'cryst-q2',
    experimentId: 'crystallisation',
    question:
      'What fundamental scientific principle drives crystal formation when a hot saturated copper sulphate solution cools slowly?',
    options: [
      'Copper sulphate solubility decreases significantly as temperature drops, creating supersaturation that precipitates crystals',
      'Cold water evaporates five times faster than boiling water',
      'Lowering temperature chemically converts copper sulphate into an insoluble gas',
      'Copper ions become magnetically attracted to porcelain at room temperature',
    ],
    correctIndex: 0,
    explanation:
      'Solubility is strongly temperature-dependent: 100 mL of water dissolves ~57 g of CuSO₄ at 85°C but only ~20 g at 20°C. Cooling a hot saturated solution forces the excess solute out of solution as pure triclinic crystals.',
  },
  {
    id: 'cryst-q3',
    experimentId: 'crystallisation',
    question:
      'How does a student verify that a heated copper sulphate solution has reached its "crystallisation point" before letting it cool?',
    options: [
      'By dipping a glass rod into the solution and blowing on it to see if a thin micro-crystalline crust forms on the tip',
      'By heating until all liquid has completely boiled away to dryness',
      'By measuring the solution pH with Universal Indicator until it reaches pH 14',
      'By chilling the beaker in liquid nitrogen immediately',
    ],
    correctIndex: 0,
    explanation:
      'Dipping a clean glass stirring rod into the hot solution and blowing gently cools a thin liquid film. The immediate appearance of tiny crystals confirms that the solution is saturated at its current volume and ready for slow cooling.',
  },
];

export function getChemistryQuestions(experimentId: string): ConceptualQuestion[] {
  switch (experimentId) {
    case 'ph-testing':
      return PH_TESTING_QUESTIONS;
    case 'natural-indicators':
      return NATURAL_INDICATORS_QUESTIONS;
    case 'paper-chromatography':
      return PAPER_CHROMATOGRAPHY_QUESTIONS;
    case 'displacement-reaction':
      return DISPLACEMENT_REACTION_QUESTIONS;
    case 'crystallisation':
      return CRYSTALLISATION_QUESTIONS;
    default:
      return [];
  }
}
