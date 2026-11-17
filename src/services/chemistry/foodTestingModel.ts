/**
 * Food Component Testing Scientific Model
 * Curriculum: CBSE Class 12 Chemistry Practical (Nutrient Testing in Foodstuffs)
 * 
 * Food Macro-Nutrients Covered:
 * 1. Carbohydrates:
 *    - Molisch’s test (general carbohydrate ring test)
 *    - Fehling’s test (reducing vs non-reducing sugars)
 *    - Iodine test (specific for starch helical polysaccharide)
 * 2. Proteins:
 *    - Biuret test (copper coordination with peptide bonds)
 *    - Ninhydrin test (α-amino acid Ruhemann’s purple)
 * 3. Fats and Oils:
 *    - Translucent grease spot test
 *    - Acrolein test (dehydration of glycerol moiety to pungent acrolein)
 */

export type FoodSampleId =
  | 'glucose'
  | 'potato-starch'
  | 'egg-albumin'
  | 'milk'
  | 'vegetable-oil';

export type FoodTestId =
  | 'molisch-test'
  | 'fehling-test'
  | 'iodine-test'
  | 'biuret-test'
  | 'ninhydrin-test'
  | 'translucent-spot'
  | 'acrolein-test';

export interface FoodSampleSpec {
  id: FoodSampleId;
  name: string;
  category: string;
  primaryNutrient: string;
  hasCarbohydrate: boolean;
  hasReducingSugar: boolean;
  hasStarch: boolean;
  hasProtein: boolean;
  hasFat: boolean;
  description: string;
}

export const FOOD_SAMPLES: Record<FoodSampleId, FoodSampleSpec> = {
  'glucose': {
    id: 'glucose',
    name: 'Glucose Powder Solution (Monosaccharide)',
    category: 'Simple Sugar',
    primaryNutrient: 'Reducing Carbohydrate',
    hasCarbohydrate: true,
    hasReducingSugar: true,
    hasStarch: false,
    hasProtein: false,
    hasFat: false,
    description: 'Pure D-glucose hexose solution containing free hemiacetal reducing group.',
  },
  'potato-starch': {
    id: 'potato-starch',
    name: 'Potato Extract / Soluble Starch Solution',
    category: 'Complex Polysaccharide',
    primaryNutrient: 'Starch Carbohydrate',
    hasCarbohydrate: true,
    hasReducingSugar: false, // non-reducing macromolecule
    hasStarch: true,
    hasProtein: false,
    hasFat: false,
    description: 'Amylose and amylopectin polysaccharide chains extracted from boiled potato.',
  },
  'egg-albumin': {
    id: 'egg-albumin',
    name: 'Egg Albumin Dispersion (Fresh White of Egg)',
    category: 'Animal Protein',
    primaryNutrient: 'Globular Protein',
    hasCarbohydrate: false,
    hasReducingSugar: false,
    hasStarch: false,
    hasProtein: true,
    hasFat: false,
    description: 'High-molecular-weight globular protein rich in peptide bonds and sulfur-containing amino acids.',
  },
  'milk': {
    id: 'milk',
    name: 'Fresh Cow Milk (Natural Emulsion)',
    category: 'Complex Multi-Nutrient',
    primaryNutrient: 'Complete Food (Lactose, Casein, Fat)',
    hasCarbohydrate: true,
    hasReducingSugar: true, // Lactose is a reducing disaccharide
    hasStarch: false,
    hasProtein: true, // Casein, lactalbumin
    hasFat: true, // Butterfat globules
    description: 'Emulsion containing lactose sugar, casein phosphoproteins, and colloidal butterfat droplets.',
  },
  'vegetable-oil': {
    id: 'vegetable-oil',
    name: 'Edible Cooking Oil (Groundnut / Sunflower Oil)',
    category: 'Lipid / Triglyceride',
    primaryNutrient: 'Fat / Triacylglycerol',
    hasCarbohydrate: false,
    hasReducingSugar: false,
    hasStarch: false,
    hasProtein: false,
    hasFat: true,
    description: 'Glycerol triesters of long-chain fatty acids (oleic, linoleic, palmitic acids).',
  },
};

export interface FoodTestOutcome {
  testId: FoodTestId;
  testName: string;
  sampleName: string;
  nutrientTarget: string;
  isPositive: boolean;
  observation: string;
  inference: string;
  tubeColorHex: string;
  ringOrPptHex?: string;
  limitationNote: string;
  chemicalPrinciple: string;
}

export const FOOD_TEST_ASSUMPTIONS = [
  'Food extracts are prepared fresh in deionized water without synthetic preservatives.',
  'Molisch test requires slow pouring of conc H2SO4 down the tube wall to avoid boiling and charring.',
  'Fehling test requires boiling in a water bath for 2-3 minutes to allow copper(II) reduction.',
  'Starch-iodine inclusion complex is reversible; heating unpacks the amylose helix, bleaching the blue color.',
];

/**
 * Runs a qualitative biochemical test on a food sample
 */
export function runFoodTest(sampleId: FoodSampleId, testId: FoodTestId): FoodTestOutcome {
  const sample = FOOD_SAMPLES[sampleId] || FOOD_SAMPLES['glucose'];

  switch (testId) {
    case 'molisch-test': {
      const isPos = sample.hasCarbohydrate;
      return {
        testId,
        testName: 'Molisch’s Test (General Carbohydrate Test)',
        sampleName: sample.name,
        nutrientTarget: 'Carbohydrates (General)',
        isPositive: isPos,
        observation: isPos
          ? 'A dense, characteristic reddish-purple / violet ring forms at the junction of the two liquid layers.'
          : 'No purple ring formed at the junction; interface remains colorless.',
        inference: isPos
          ? 'Carbohydrate confirmed: Dehydration by conc H₂SO₄ yields furfural derivatives that condense with α-naphthol.'
          : 'Absence of detectable carbohydrates.',
        tubeColorHex: '#f8fafc',
        ringOrPptHex: isPos ? '#701a75' : undefined,
        limitationNote: 'Positive for all carbohydrates (monosaccharides, disaccharides, and polysaccharides alike).',
        chemicalPrinciple:
          'Concentrated H₂SO₄ dehydrates pentoses and hexoses to furfural and 5-hydroxymethylfurfural, which condense with α-naphthol to form a purple dye ring.',
      };
    }

    case 'fehling-test': {
      const isPos = sample.hasReducingSugar;
      return {
        testId,
        testName: 'Fehling’s Test (Reducing Sugars)',
        sampleName: sample.name,
        nutrientTarget: 'Reducing Sugars (Free Carbonyl)',
        isPositive: isPos,
        observation: isPos
          ? 'Deep blue solution turns green, then yellow, forming a dense, brick-red cuprous oxide (Cu₂O) precipitate on boiling.'
          : 'Deep blue solution remains clear on boiling; no red precipitate formed.',
        inference: isPos
          ? 'Reducing carbohydrate confirmed: Free aldehydic or α-hydroxy-ketonic group reduces alkaline Cu²⁺ tartrate.'
          : 'Non-reducing sugar or non-carbohydrate substrate (starch macromolecule has negligible reducing ends).',
        tubeColorHex: isPos ? '#991b1b' : '#1d4ed8',
        ringOrPptHex: isPos ? '#b91c1c' : undefined,
        limitationNote: 'Does not detect non-reducing polysaccharides (starch) or non-reducing disaccharides (sucrose) unless hydrolyzed.',
        chemicalPrinciple:
          'R-CHO + 2 Cu²⁺(tartrate) + 5 OH⁻ → R-COO⁻ + Cu₂O(s)↓ (Brick-Red) + 3 H₂O.',
      };
    }

    case 'iodine-test': {
      const isPos = sample.hasStarch;
      return {
        testId,
        testName: 'Iodine Test (Starch Inclusion Complex)',
        sampleName: sample.name,
        nutrientTarget: 'Starch Polysaccharide (Amylose)',
        isPositive: isPos,
        observation: isPos
          ? 'Instant, striking appearance of an intense deep blue-black / indigo coloration (color disappears on heating, reappears on cooling).'
          : 'Pale yellowish-brown iodine tint remains unchanged.',
        inference: isPos
          ? 'Starch confirmed: Tri-iodide and penta-iodide ions slip inside the helical coils of unbranched amylose chains.'
          : 'Absence of starch polysaccharide.',
        tubeColorHex: isPos ? '#1e1b4b' : '#ca8a04',
        limitationNote: 'Negative for simple mono- and disaccharides (glucose, sucrose) and glycogen (which gives brown-red).',
        chemicalPrinciple:
          'I₃⁻ and I₅⁻ linear polyiodide ions coordinate inside the hollow cavity of helical amylose (diameter ~5 Å), creating intense charge-transfer absorption.',
      };
    }

    case 'biuret-test': {
      const isPos = sample.hasProtein;
      return {
        testId,
        testName: 'Biuret Test (Peptide Bond Coordination)',
        sampleName: sample.name,
        nutrientTarget: 'Proteins and Polypeptides',
        isPositive: isPos,
        observation: isPos
          ? 'Development of a characteristic, distinct violet / purple coloration upon adding dilute NaOH and 1% CuSO₄.'
          : 'Solution remains light blue (color of uncoordinated copper ions); no violet coloration.',
        inference: isPos
          ? 'Protein confirmed: Cu²⁺ ions coordinate with four peptide bond nitrogen atoms (-CONH-) in alkaline medium.'
          : 'Absence of peptide bonds.',
        tubeColorHex: isPos ? '#6b21a8' : '#38bdf8',
        limitationNote: 'Requires at least two peptide bonds; free single amino acids give a negative biuret test.',
        chemicalPrinciple:
          'In alkaline solution, cupric Cu²⁺ ions coordinate with adjacent peptide nitrogen atoms producing a square-planar violet coordination chelate.',
      };
    }

    case 'ninhydrin-test': {
      const isPos = sample.hasProtein;
      return {
        testId,
        testName: 'Ninhydrin Test (α-Amino Acid Chromophore)',
        sampleName: sample.name,
        nutrientTarget: 'Amino Acids & Free Protein Amines',
        isPositive: isPos,
        observation: isPos
          ? 'Appearance of an intense blue-violet / purple coloration (Ruhemann’s purple) after gentle warming in a water bath.'
          : 'Pale yellow solution remains unchanged; no blue-violet color.',
        inference: isPos
          ? 'Protein / amino acids confirmed: Oxidative deamination producing indanedione-derived Ruhemann’s purple pigment.'
          : 'Absence of free α-amino acids.',
        tubeColorHex: isPos ? '#4338ca' : '#fef08a',
        limitationNote: 'Proline and hydroxyproline give a yellow color instead of purple.',
        chemicalPrinciple:
          'Ninhydrin undergoes oxidative decarboxylation and deamination with α-amino acids to generate Ruhemann’s purple anion (λmax ~ 570 nm).',
      };
    }

    case 'translucent-spot': {
      const isPos = sample.hasFat;
      return {
        testId,
        testName: 'Translucent Spot Test (Filter Paper Grease Spot)',
        sampleName: sample.name,
        nutrientTarget: 'Fats and Fatty Oils',
        isPositive: isPos,
        observation: isPos
          ? 'A distinct translucent greasy spot appears on the filter paper that remains permanent and does NOT disappear on gentle drying.'
          : 'The wet spot evaporates completely on drying, leaving no translucent residue.',
        inference: isPos
          ? 'Fat / lipid confirmed: Non-volatile triglycerides coat the cellulose fibers, matching their refractive index and transmitting light.'
          : 'Absence of fat / lipid.',
        tubeColorHex: '#f8fafc',
        ringOrPptHex: isPos ? '#fde047' : undefined,
        limitationNote: 'Water produces a temporary spot that evaporates completely, whereas lipid grease spots are strictly non-volatile.',
        chemicalPrinciple:
          'Fats and oils penetrate paper cellulose fibers, reducing diffuse light scattering and producing optical translucency.',
      };
    }

    case 'acrolein-test':
    default: {
      const isPos = sample.hasFat;
      return {
        testId: 'acrolein-test',
        testName: 'Acrolein Test (Glycerol Dehydration with KHSO₄)',
        sampleName: sample.name,
        nutrientTarget: 'Glycerol Backbone of Triglycerides',
        isPositive: isPos,
        observation: isPos
          ? 'Vigorous evolution of a pungent, highly irritating vapor with the characteristic acrid odor of burnt fat.'
          : 'No irritating pungent odor; sample chars quietly without acrolein evolution.',
        inference: isPos
          ? 'Triglyceride fat confirmed: Heating with potassium bisulphate dehydrates glycerol into volatile acrolein (propenal).'
          : 'Absence of glycerol-based lipid.',
        tubeColorHex: isPos ? '#713f12' : '#f8fafc',
        limitationNote: 'Specific to glycerol esters; free fatty acids alone without glycerol backbone give a negative test.',
        chemicalPrinciple:
          'CH₂(OH)-CH(OH)-CH₂(OH) (Glycerol) + 2 KHSO₄ ⎯Δ→ CH₂=CH-CHO (Acrolein, pungent) + 2 H₂O.',
      };
    }
  }
}
