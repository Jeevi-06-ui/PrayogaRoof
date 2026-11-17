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

export function getChemistryQuestions(experimentId: string): ConceptualQuestion[] {
  switch (experimentId) {
    case 'ph-testing':
      return PH_TESTING_QUESTIONS;
    case 'natural-indicators':
      return NATURAL_INDICATORS_QUESTIONS;
    default:
      return [];
  }
}
