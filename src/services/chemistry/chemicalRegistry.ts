/**
 * Chemistry Chemical Registry & Validated Educational Indicator Rules
 * Curriculum Alignment: CBSE Class 10 (Ch 2), ICSE Class 10 (Ch 3), NCERT Science
 */

import { ChemicalSubstance, IndicatorColorRule } from './chemistryTypes';

export const CHEMICAL_SUBSTANCES: Record<string, ChemicalSubstance> = {
  hcl: {
    id: 'hcl',
    name: '0.1M Hydrochloric Acid',
    formula: 'HCl(aq)',
    category: 'strong-acid',
    basePH: 1.0,
    defaultConcentrationM: 0.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Corrosive', 'Skin Irritant', 'Acid Vapor'],
    safetyNotes:
      'Standard laboratory mineral acid. Virtual safety: Wear splash goggles and chemical-resistant gloves. Always add acid to water, never water to concentrated acid.',
  },
  'lemon-juice': {
    id: 'lemon-juice',
    name: 'Fresh Lemon Juice (Citric Acid)',
    formula: 'C₆H₈O₇(aq)',
    category: 'weak-acid',
    basePH: 2.2,
    defaultConcentrationM: 0.05,
    baseColor: '#fef9c3', // Pale translucent lemon yellow
    hazards: ['Mild Organic Acid'],
    safetyNotes:
      'Naturally occurring fruit acid containing ~5-6% citric acid. Safe educational food-grade sample.',
  },
  'acetic-acid': {
    id: 'acetic-acid',
    name: 'Dilute Acetic Acid (Vinegar)',
    formula: 'CH₃COOH(aq)',
    category: 'weak-acid',
    basePH: 2.9,
    defaultConcentrationM: 0.1,
    baseColor: '#f1f5f9', // Clear colorless
    hazards: ['Mild Irritant', 'Pungent Odor'],
    safetyNotes:
      'Weak organic monocarboxylic acid. Typical household vinegar contains ~4-8% ethanoic acid.',
  },
  'pure-water': {
    id: 'pure-water',
    name: 'Pure Distilled Water',
    formula: 'H₂O(l)',
    category: 'neutral',
    basePH: 7.0,
    defaultConcentrationM: 55.5,
    baseColor: '#e0f2fe', // Crystal clear pale blue tint
    hazards: ['Non-Hazardous'],
    safetyNotes:
      'Deionized high-purity laboratory water. Acts as standard neutral solvent with auto-ionization Kw = 1.0 × 10⁻¹⁴ at 25°C.',
  },
  'baking-soda': {
    id: 'baking-soda',
    name: '0.1M Sodium Hydrogen Carbonate',
    formula: 'NaHCO₃(aq)',
    category: 'weak-base',
    basePH: 8.4,
    defaultConcentrationM: 0.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Mild Alkali'],
    safetyNotes:
      'Amphoteric hydrogen carbonate salt. Aqueous solutions hydrolyze mildly alkaline due to HCO₃⁻ + H₂O ⇌ H₂CO₃ + OH⁻.',
  },
  'soap-solution': {
    id: 'soap-solution',
    name: 'Household Soap Solution',
    formula: 'C₁₇H₃₅COONa(aq)',
    category: 'weak-base',
    basePH: 9.2,
    defaultConcentrationM: 0.05,
    baseColor: '#f1f5f9', // Slightly cloudy white
    hazards: ['Eye Irritant'],
    safetyNotes:
      'Sodium salt of long-chain fatty acids (stearate). Hydrolyzes in water producing free alkaline hydroxide ions.',
  },
  naoh: {
    id: 'naoh',
    name: '0.1M Sodium Hydroxide',
    formula: 'NaOH(aq)',
    category: 'strong-base',
    basePH: 13.0,
    defaultConcentrationM: 0.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Caustic', 'Corrosive', 'Exothermic Dissolution'],
    safetyNotes:
      'Strong mineral alkali (caustic soda). Rapidly saponifies organic skin oils. Virtual safety: Use virtual eye protection and protective apron.',
  },
  'turmeric-indicator': {
    id: 'turmeric-indicator',
    name: 'Natural Turmeric Extract',
    formula: 'Curcuma longa (Curcumin)',
    category: 'natural-indicator',
    basePH: 7.0,
    defaultConcentrationM: 0.01,
    baseColor: '#eab308', // Brilliant golden yellow
    hazards: ['Staining Agent (Non-toxic)'],
    safetyNotes:
      'Natural botanical polyphenol indicator. Yellow in acidic/neutral media; shifts to deep reddish-brown in basic solutions (pH > 7.4).',
  },
  'red-cabbage-indicator': {
    id: 'red-cabbage-indicator',
    name: 'Natural Red Cabbage Extract',
    formula: 'Brassica oleracea (Anthocyanin)',
    category: 'natural-indicator',
    basePH: 7.0,
    defaultConcentrationM: 0.01,
    baseColor: '#9333ea', // Royal purple/violet
    hazards: ['Non-toxic Plant Dye'],
    safetyNotes:
      'Natural broad-spectrum pH indicator containing cyanidin anthocyanins. Exhibits distinct multi-color transitions across the 1-14 pH scale.',
  },
  'universal-indicator': {
    id: 'universal-indicator',
    name: 'Universal Indicator Solution',
    formula: 'Multi-dye formulation (aq)',
    category: 'synthetic-indicator',
    basePH: 7.0,
    defaultConcentrationM: 0.01,
    baseColor: '#22c55e', // Emerald green at neutral
    hazards: ['Contains Ethanol Carrier', 'Flammable'],
    safetyNotes:
      'Composite dye indicator (thymol blue, methyl red, bromothymol blue, phenolphthalein). Gives continuous rainbow spectrum from pH 1 to 14.',
  },
  cuso4: {
    id: 'cuso4',
    name: '0.5M Copper(II) Sulphate',
    formula: 'CuSO₄·5H₂O(aq)',
    category: 'salt-solution',
    basePH: 4.5,
    defaultConcentrationM: 0.5,
    baseColor: '#2563eb', // Royal brilliant blue
    hazards: ['Aquatic Toxin (GHS09)', 'Skin/Eye Irritant (GHS07)', 'Harmful if Swallowed'],
    safetyNotes:
      'Heavy metal salt solution. Toxic to aquatic organisms with long lasting effects. Collect waste in heavy-metal collection containers, never dispose down the sink.',
  },
  feso4: {
    id: 'feso4',
    name: '0.5M Iron(II) Sulphate',
    formula: 'FeSO₄·7H₂O(aq)',
    category: 'salt-solution',
    basePH: 4.8,
    defaultConcentrationM: 0.5,
    baseColor: '#86efac', // Pale light green
    hazards: ['Skin/Eye Irritant', 'Oxidizes to Fe³⁺ in Air'],
    safetyNotes:
      'Aqueous green vitriol solution produced as iron displaces copper. Gradually oxidizes to rusty orange-brown iron(III) upon atmospheric oxygen exposure.',
  },
  'water-ethanol-eluent': {
    id: 'water-ethanol-eluent',
    name: 'Chromatography Mobile Phase (Water/Ethanol 80:20)',
    formula: 'H₂O + C₂H₅OH (80:20 v/v)',
    category: 'neutral',
    basePH: 7.0,
    defaultConcentrationM: 1.0,
    baseColor: '#f8fafc', // Crystal clear
    hazards: ['Flammable Liquid/Vapor', 'Keep Sealed'],
    safetyNotes:
      'Optimized polar mobile phase for ascending paper chromatography. Keeps development chamber saturated for uniform capillary dye migration.',
  },
  'orange-juice': {
    id: 'orange-juice',
    name: 'Fresh Orange Juice (Citrus sinensis)',
    formula: 'Organic acids in H₂O (Citric + Ascorbic)',
    category: 'weak-acid',
    basePH: 3.6,
    defaultConcentrationM: 0.05,
    baseColor: '#f97316', // Vibrant orange
    hazards: ['Food Sample (Non-Hazardous)'],
    safetyNotes: 'Freshly extracted citrus juice rich in citric and ascorbic acid. Typical natural biological pH ranges from 3.5 to 3.8.',
  },
  'tomato-juice': {
    id: 'tomato-juice',
    name: 'Fresh Tomato Extract (Solanum lycopersicum)',
    formula: 'Organic acids in H₂O (Citric + Malic)',
    category: 'weak-acid',
    basePH: 4.3,
    defaultConcentrationM: 0.03,
    baseColor: '#ef4444', // Tomato red
    hazards: ['Food Sample (Non-Hazardous)'],
    safetyNotes: 'Natural vegetable extract containing mild citric, malic, and oxalic acids with characteristic pH ~4.2 - 4.4.',
  },
  'apple-juice': {
    id: 'apple-juice',
    name: 'Natural Apple Juice (Malus domestica)',
    formula: 'Malic acid blend in H₂O',
    category: 'weak-acid',
    basePH: 3.9,
    defaultConcentrationM: 0.04,
    baseColor: '#eab308', // Golden translucent amber
    hazards: ['Food Sample (Non-Hazardous)'],
    safetyNotes: 'Natural pome fruit juice whose acidity is predominantly governed by L-malic acid (pH ~3.8 - 4.0).',
  },
  'nh4cl-solution': {
    id: 'nh4cl-solution',
    name: '0.1M Ammonium Chloride Solution',
    formula: 'NH₄Cl(aq)',
    category: 'salt-solution',
    basePH: 5.13,
    defaultConcentrationM: 0.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Mild Eye Irritant'],
    safetyNotes: 'Salt of weak base (NH₄OH) and strong acid (HCl). Aqueous cation hydrolysis NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺ generates acidic pH ~5.13.',
  },
  'ch3coona-solution': {
    id: 'ch3coona-solution',
    name: '0.1M Sodium Acetate Solution',
    formula: 'CH₃COONa(aq)',
    category: 'salt-solution',
    basePH: 8.87,
    defaultConcentrationM: 0.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Low Hazard'],
    safetyNotes: 'Salt of weak acid (CH₃COOH) and strong base (NaOH). Aqueous anion hydrolysis CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻ generates alkaline pH ~8.87.',
  },
  'nacl-solution': {
    id: 'nacl-solution',
    name: '0.1M Sodium Chloride Solution',
    formula: 'NaCl(aq)',
    category: 'salt-solution',
    basePH: 7.0,
    defaultConcentrationM: 0.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Non-Hazardous'],
    safetyNotes: 'Neutral salt formed by strong acid (HCl) and strong base (NaOH). Neither ion undergoes appreciable hydrolysis, retaining neutral pH 7.0.',
  },
  'acetate-buffer': {
    id: 'acetate-buffer',
    name: 'Equimolar Acetate Buffer (0.1M, pH 4.74)',
    formula: 'CH₃COOH + CH₃COONa (1:1, aq)',
    category: 'buffer-solution',
    basePH: 4.74,
    defaultConcentrationM: 0.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Mild Odor'],
    safetyNotes: 'Standard educational buffer system conforming to Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA]) = 4.74 + 0 = 4.74.',
  },
  'benzoic-acid-solid': {
    id: 'benzoic-acid-solid',
    name: 'Pure Benzoic Acid Crystals',
    formula: 'C₆H₅COOH(s)',
    category: 'solid-organic',
    basePH: 3.1,
    defaultConcentrationM: 1.0,
    baseColor: '#f8fafc', // White crystalline needles
    hazards: ['Skin/Respiratory Irritant', 'Combustible Dust'],
    safetyNotes: 'Aromatic carboxylic acid. Standard calibration melting reference: sharp melting point 122.4°C.',
  },
  'urea-solid': {
    id: 'urea-solid',
    name: 'Pure Urea Granules',
    formula: '(NH₂)₂CO(s)',
    category: 'solid-organic',
    basePH: 7.0,
    defaultConcentrationM: 1.0,
    baseColor: '#f8fafc', // Pure white prismatic crystals
    hazards: ['Low Hazard'],
    safetyNotes: 'Carbamide standard reference compound. Exhibits clean, sharp melting point at 133.0°C.',
  },
  'naphthalene-solid': {
    id: 'naphthalene-solid',
    name: 'Pure Naphthalene Flakes',
    formula: 'C₁₀H₈(s)',
    category: 'solid-organic',
    basePH: 7.0,
    defaultConcentrationM: 1.0,
    baseColor: '#f1f5f9', // Lustrous white flakes
    hazards: ['Flammable Solid', 'Harmful if Inhaled', 'Characteristic Mothball Odor'],
    safetyNotes: 'Bicyclic aromatic hydrocarbon. Readily sublimes; sharp melting point at 80.2°C.',
  },
  'impure-benzoic-acid': {
    id: 'impure-benzoic-acid',
    name: 'Impure Benzoic Acid (with 5% Cinnamic Acid)',
    formula: 'C₆H₅COOH + C₉H₈O₂',
    category: 'solid-organic',
    basePH: 3.1,
    defaultConcentrationM: 1.0,
    baseColor: '#fef08a', // Slightly off-white / yellowish
    hazards: ['Skin/Eye Irritant'],
    safetyNotes: 'Contains 5% cinnamic acid impurity. Illustrates colligative melting range depression: begins liquefaction at 114.5°C and completes at 118.5°C.',
  },
  'ethanol-liquid': {
    id: 'ethanol-liquid',
    name: 'Absolute Ethanol (99.8%)',
    formula: 'C₂H₅OH(l)',
    category: 'organic-solvent',
    basePH: 7.0,
    defaultConcentrationM: 17.1,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Highly Flammable Liquid/Vapor (GHS02)', 'Eye Irritant'],
    safetyNotes: 'Standard volatile organic alcohol. Standard normal boiling point = 78.3°C at 101.325 kPa.',
  },
  'acetone-liquid': {
    id: 'acetone-liquid',
    name: 'Pure Acetone (Propanone)',
    formula: 'CH₃COCH₃(l)',
    category: 'organic-solvent',
    basePH: 7.0,
    defaultConcentrationM: 13.6,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Highly Flammable Liquid (GHS02)', 'Causes Drowsiness/Dizziness'],
    safetyNotes: 'Volatile aliphatic ketone with elevated vapor pressure. Normal boiling point = 56.1°C at 101.325 kPa.',
  },
  'ethyl-acetate-liquid': {
    id: 'ethyl-acetate-liquid',
    name: 'Pure Ethyl Acetate',
    formula: 'CH₃COOCH₂CH₃(l)',
    category: 'organic-solvent',
    basePH: 7.0,
    defaultConcentrationM: 10.2,
    baseColor: '#f8fafc', // Clear colorless
    hazards: ['Flammable Liquid', 'Pleasant Fruity Odor'],
    safetyNotes: 'Volatile carboxylate ester. Standard normal boiling point = 77.1°C at 101.325 kPa.',
  },
  'mg-ribbon': {
    id: 'mg-ribbon',
    name: 'Magnesium Ribbon Strips',
    formula: 'Mg(s)',
    category: 'metal',
    basePH: 7.0,
    defaultConcentrationM: 1.0,
    baseColor: '#cbd5e1', // Silvery metallic ribbon
    hazards: ['Flammable Solid', 'Water-reactive on Heating'],
    safetyNotes: 'Group 2 reactive metal. Displaces hydrogen gas from acids: Mg + 2H⁺ ⟶ Mg²⁺ + H₂↑. Clean oxide layer with sandpaper before reaction kinetics timing.',
  },
};

/**
 * Universal Indicator standard spectrum (pH 1 - 14)
 */
export const UNIVERSAL_INDICATOR_RULES: IndicatorColorRule[] = [
  { minPH: 0.0, maxPH: 2.0, color: '#ef4444', label: 'Strong Acid: Scarlet Red (pH 1-2)' },
  { minPH: 2.0, maxPH: 4.0, color: '#f97316', label: 'Moderate Acid: Orange (pH 3-4)' },
  { minPH: 4.0, maxPH: 6.0, color: '#eab308', label: 'Weak Acid: Yellow (pH 5-6)' },
  { minPH: 6.0, maxPH: 8.0, color: '#22c55e', label: 'Neutral: Emerald Green (pH 7)' },
  { minPH: 8.0, maxPH: 10.0, color: '#06b6d4', label: 'Weak Base: Cyan / Blue-Green (pH 8-9)' },
  { minPH: 10.0, maxPH: 12.0, color: '#3b82f6', label: 'Moderate Base: Blue / Indigo (pH 10-11)' },
  { minPH: 12.0, maxPH: 14.0, color: '#7c3aed', label: 'Strong Base: Deep Violet / Purple (pH 12-14)' },
];

/**
 * Natural Turmeric Extract Color Rules:
 * Yellow in Acidic & Neutral (pH < 7.4)
 * Deep Reddish-Brown in Alkaline (pH >= 7.5)
 */
export const TURMERIC_COLOR_RULES: IndicatorColorRule[] = [
  { minPH: 0.0, maxPH: 7.4, color: '#eab308', label: 'Acidic / Neutral: Bright Yellow' },
  { minPH: 7.4, maxPH: 14.0, color: '#991b1b', label: 'Alkaline: Deep Reddish-Brown' },
];

/**
 * Natural Red Cabbage Extract Color Rules (Anthocyanin Spectrum):
 * pH 1 - 2: Bright Red
 * pH 3 - 5: Pink / Red-Violet
 * pH 6 - 7.5: Purple / Violet
 * pH 7.5 - 10: Blue / Cyan-Green
 * pH 10 - 14: Green / Yellow-Green
 */
export const RED_CABBAGE_COLOR_RULES: IndicatorColorRule[] = [
  { minPH: 0.0, maxPH: 2.5, color: '#dc2626', label: 'Strong Acid: Bright Red' },
  { minPH: 2.5, maxPH: 5.5, color: '#d946ef', label: 'Weak Acid: Pink / Magenta' },
  { minPH: 5.5, maxPH: 7.5, color: '#9333ea', label: 'Neutral: Purple / Violet' },
  { minPH: 7.5, maxPH: 10.5, color: '#0284c7', label: 'Weak Base: Ocean Blue / Green-Blue' },
  { minPH: 10.5, maxPH: 14.0, color: '#16a34a', label: 'Strong Base: Green to Yellowish-Green' },
];

export function getSubstanceById(id: string): ChemicalSubstance | undefined {
  return CHEMICAL_SUBSTANCES[id];
}

export function getAllSubstances(): ChemicalSubstance[] {
  return Object.values(CHEMICAL_SUBSTANCES);
}

export function evaluateIndicatorColor(
  indicatorType: 'universal' | 'turmeric' | 'red-cabbage',
  ph: number
): { color: string; label: string } {
  const clampedPH = Math.max(0, Math.min(14, ph));

  let rules = UNIVERSAL_INDICATOR_RULES;
  if (indicatorType === 'turmeric') {
    rules = TURMERIC_COLOR_RULES;
  } else if (indicatorType === 'red-cabbage') {
    rules = RED_CABBAGE_COLOR_RULES;
  }

  for (const rule of rules) {
    if (clampedPH >= rule.minPH && clampedPH <= rule.maxPH) {
      return { color: rule.color, label: rule.label };
    }
  }

  return { color: rules[rules.length - 1].color, label: rules[rules.length - 1].label };
}
