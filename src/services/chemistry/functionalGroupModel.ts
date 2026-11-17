/**
 * Functional Group Identification Scientific Model
 * Curriculum: CBSE Class 12 Chemistry Practical (Qualitative Organic Analysis)
 * 
 * Functional Groups Covered:
 * 1. Unsaturation (>C=C< / -C≡C-): Bromine Water, Baeyer's alkaline KMnO4
 * 2. Alcoholic (-OH): Sodium metal effervescence, Ceric ammonium nitrate
 * 3. Phenolic (Ar-OH): Neutral FeCl3 violet coloration, Phthalein dye
 * 4. Aldehydic (-CHO): Tollens' silver mirror, Fehling's red Cu2O
 * 5. Ketonic (>C=O): Sodium nitroprusside ruby red, negative Tollens
 * 6. Carboxylic Acid (-COOH): Sodium bicarbonate CO2 effervescence, Esterification
 * 7. Primary Amine (-NH2): Azo dye test, Carbylamine reaction (simulation-only)
 */

export type FunctionalGroupId =
  | 'unsaturation'
  | 'alcohol'
  | 'phenol'
  | 'aldehyde'
  | 'ketone'
  | 'carboxylic-acid'
  | 'primary-amine';

export type FunctionalGroupTestId =
  | 'bromine-water'
  | 'baeyer-test'
  | 'sodium-metal'
  | 'ceric-ammonium-nitrate'
  | 'neutral-fecl3'
  | 'tollens-silver-mirror'
  | 'fehling-solution'
  | 'sodium-nitroprusside'
  | 'sodium-bicarbonate'
  | 'ester-test'
  | 'azo-dye';

export interface OrganicSampleSpec {
  id: string;
  name: string;
  formula: string;
  physicalState: string;
  functionalGroup: FunctionalGroupId;
  groupName: string;
  color: string;
}

export const ORGANIC_SAMPLES: Record<string, OrganicSampleSpec> = {
  'cyclohexene': {
    id: 'cyclohexene',
    name: 'Cyclohexene (Aliphatic Alkene)',
    formula: 'C₆H₁₀',
    physicalState: 'Colorless liquid with petroleum odor',
    functionalGroup: 'unsaturation',
    groupName: 'Unsaturated Hydrocarbon (>C=C<)',
    color: '#f8fafc',
  },
  'ethanol': {
    id: 'ethanol',
    name: 'Ethanol (Primary Aliphatic Alcohol)',
    formula: 'C₂H₅OH',
    physicalState: 'Colorless volatile liquid with spirituous odor',
    functionalGroup: 'alcohol',
    groupName: 'Alcoholic Hydroxyl (-OH)',
    color: '#f8fafc',
  },
  'phenol': {
    id: 'phenol',
    name: 'Phenol (Carbolic Acid - Aromatic Phenol)',
    formula: 'C₆H₅OH',
    physicalState: 'White crystalline solid turning pink on air exposure',
    functionalGroup: 'phenol',
    groupName: 'Phenolic Hydroxyl (Ar-OH)',
    color: '#fce7f3',
  },
  'benzaldehyde': {
    id: 'benzaldehyde',
    name: 'Benzaldehyde (Aromatic Aldehyde)',
    formula: 'C₆H₅CHO',
    physicalState: 'Pale yellow oily liquid with bitter almond odor',
    functionalGroup: 'aldehyde',
    groupName: 'Aldehydic Carbonyl (-CHO)',
    color: '#fef08a',
  },
  'acetone': {
    id: 'acetone',
    name: 'Acetone (Propanone - Aliphatic Ketone)',
    formula: 'CH₃COCH₃',
    physicalState: 'Colorless volatile liquid with sweetish odor',
    functionalGroup: 'ketone',
    groupName: 'Ketonic Carbonyl (>C=O)',
    color: '#f8fafc',
  },
  'benzoic-acid': {
    id: 'benzoic-acid',
    name: 'Benzoic Acid (Aromatic Carboxylic Acid)',
    formula: 'C₆H₅COOH',
    physicalState: 'White lustrous crystalline flakes',
    functionalGroup: 'carboxylic-acid',
    groupName: 'Carboxyl Group (-COOH)',
    color: '#ffffff',
  },
  'aniline': {
    id: 'aniline',
    name: 'Aniline (Phenylamine - Primary Aromatic Amine)',
    formula: 'C₆H₅NH₂',
    physicalState: 'Oily pale amber liquid turning dark brown',
    functionalGroup: 'primary-amine',
    groupName: 'Primary Amino Group (-NH₂)',
    color: '#fed7aa',
  },
};

export interface FunctionalGroupOutcome {
  testId: FunctionalGroupTestId;
  testName: string;
  sampleName: string;
  targetGroup: string;
  isPositive: boolean;
  observation: string;
  inference: string;
  tubeColorHex: string;
  precipitateColorHex?: string;
  gasEvolution?: string;
  chemicalEquation: string;
}

export const FUNCTIONAL_GROUP_ASSUMPTIONS = [
  'Organic samples are chemically pure standard reagents tested under standardized temperatures.',
  'Tollens reagent is freshly prepared ammoniacal silver nitrate solution: [Ag(NH3)2]OH.',
  'Neutral ferric chloride is freshly boiled and neutralized with dilute ammonium hydroxide to remove excess acid.',
  'All hazardous testing scenarios are executed in a safe, strictly educational virtual environment.',
];

/**
 * Runs a diagnostic chemical test on a selected organic sample
 */
export function runFunctionalGroupTest(
  sampleId: string,
  testId: FunctionalGroupTestId
): FunctionalGroupOutcome {
  const sample = ORGANIC_SAMPLES[sampleId] || ORGANIC_SAMPLES['ethanol'];
  const fg = sample.functionalGroup;

  switch (testId) {
    case 'bromine-water': {
      const isPos = fg === 'unsaturation';
      return {
        testId,
        testName: 'Bromine Water Test (Addition to Double Bond)',
        sampleName: sample.name,
        targetGroup: 'Unsaturation (>C=C<)',
        isPositive: isPos,
        observation: isPos
          ? 'Reddish-orange bromine color discharged completely without evolution of HBr gas.'
          : 'Reddish-brown bromine color persists; no reaction.',
        inference: isPos
          ? 'Unsaturation confirmed: Electrophilic addition of bromine across carbon-carbon double bond.'
          : 'Absence of aliphatic unsaturation.',
        tubeColorHex: isPos ? '#f8fafc' : '#ea580c',
        chemicalEquation: isPos
          ? 'R-CH=CH-R + Br₂ → R-CHBr-CHBr-R (Colorless dibromo adduct)'
          : 'No addition reaction',
      };
    }

    case 'baeyer-test': {
      const isPos = fg === 'unsaturation';
      return {
        testId,
        testName: 'Baeyer’s Test (1% Alkaline Cold KMnO₄)',
        sampleName: sample.name,
        targetGroup: 'Unsaturation (>C=C<)',
        isPositive: isPos,
        observation: isPos
          ? 'Purple KMnO₄ color discharged; dark brown MnO₂ precipitate formed.'
          : 'Purple KMnO₄ color persists unchanged.',
        inference: isPos
          ? 'Unsaturation confirmed: Syn-dihydroxylation of alkene to vicinal glycol.'
          : 'Absence of easily oxidizable double bond.',
        tubeColorHex: isPos ? '#78350f' : '#7e22ce',
        precipitateColorHex: isPos ? '#451a03' : undefined,
        chemicalEquation: isPos
          ? '3 R-CH=CH-R + 2 KMnO₄ + 4 H₂O → 3 R-CH(OH)-CH(OH)-R + 2 MnO₂↓ + 2 KOH'
          : 'No oxidation reaction',
      };
    }

    case 'sodium-metal': {
      const isPos = fg === 'alcohol' || fg === 'carboxylic-acid';
      return {
        testId,
        testName: 'Sodium Metal Test (Active Hydrogen Evolution)',
        sampleName: sample.name,
        targetGroup: 'Alcoholic / Carboxylic Active Hydrogen',
        isPositive: isPos,
        observation: isPos
          ? 'Brisk effervescence of colorless gas; burning splinter pops with characteristic sound (H₂).'
          : 'No gas evolution; sodium piece sinks quietly.',
        inference: isPos
          ? 'Active hydrogen atom confirmed (-OH or -COOH group present).'
          : 'Absence of acidic/alcoholic hydrogen.',
        tubeColorHex: '#f1f5f9',
        gasEvolution: isPos ? 'Colorless H₂ gas bubbles evolving vigorously' : undefined,
        chemicalEquation: isPos
          ? '2 R-OH + 2 Na → 2 R-ONa + H₂↑'
          : 'No displacement reaction',
      };
    }

    case 'ceric-ammonium-nitrate': {
      const isPos = fg === 'alcohol';
      return {
        testId,
        testName: 'Ceric Ammonium Nitrate Test (CAN Complex)',
        sampleName: sample.name,
        targetGroup: 'Alcoholic Hydroxyl (-OH)',
        isPositive: isPos,
        observation: isPos
          ? 'Appearance of an intense wine-red / cherry-red solution complex.'
          : 'Yellow-orange color of CAN reagent remains unchanged.',
        inference: isPos
          ? 'Alcoholic group (-OH) confirmed: Alkoxy coordination with Ce(IV) ion.'
          : 'Absence of aliphatic alcoholic group.',
        tubeColorHex: isPos ? '#b91c1c' : '#f59e0b',
        chemicalEquation: isPos
          ? '(NH₄)₂[Ce(NO₃)₆] + R-OH → (NH₄)₂[Ce(OR)(NO₃)₅] (Wine-red complex) + HNO₃'
          : 'No coordination complex formed',
      };
    }

    case 'neutral-fecl3': {
      const isPos = fg === 'phenol';
      return {
        testId,
        testName: 'Neutral Ferric Chloride Test (FeCl₃)',
        sampleName: sample.name,
        targetGroup: 'Phenolic Hydroxyl (Ar-OH)',
        isPositive: isPos,
        observation: isPos
          ? 'Formation of a deep, characteristic violet / purple coloration.'
          : 'Pale yellow-brown color of FeCl₃ reagent remains unchanged.',
        inference: isPos
          ? 'Phenolic group (Ar-OH) confirmed: Coordination complex with Fe³⁺ ions.'
          : 'Absence of phenolic enol/aryl hydroxyl.',
        tubeColorHex: isPos ? '#581c87' : '#d97706',
        chemicalEquation: isPos
          ? '6 C₆H₅OH + FeCl₃ → [Fe(OC₆H₅)₆]³⁻ (Intense Violet Complex) + 3 H⁺ + 3 HCl'
          : 'No phenolic coordination',
      };
    }

    case 'tollens-silver-mirror': {
      const isPos = fg === 'aldehyde';
      return {
        testId,
        testName: 'Tollens’ Silver Mirror Test (Ammoniacal AgNO₃)',
        sampleName: sample.name,
        targetGroup: 'Aldehydic Carbonyl (-CHO)',
        isPositive: isPos,
        observation: isPos
          ? 'A brilliant, shining metallic silver mirror coats the inner test-tube wall upon warming.'
          : 'Solution remains clear; no mirror or black silver deposit.',
        inference: isPos
          ? 'Aldehyde confirmed: Mild oxidation of -CHO to -COO⁻ with reduction of Ag⁺ to metallic Ag.'
          : 'Ketone or non-reducing substrate confirmed.',
        tubeColorHex: isPos ? '#cbd5e1' : '#f8fafc',
        precipitateColorHex: isPos ? '#94a3b8' : undefined,
        chemicalEquation: isPos
          ? 'R-CHO + 2 [Ag(NH₃)₂]⁺ + 3 OH⁻ → R-COO⁻ + 2 Ag(s)↓ (Silver Mirror) + 4 NH₃ + 2 H₂O'
          : 'Ketones resist mild Tollens oxidation',
      };
    }

    case 'fehling-solution': {
      // Aliphatic aldehydes reduce Fehling's; benzaldehyde is exceptionally sluggish/negative
      const isPos = sample.id === 'acetaldehyde' || fg === 'aldehyde';
      return {
        testId,
        testName: 'Fehling’s Solution Test (Fehling A + Fehling B)',
        sampleName: sample.name,
        targetGroup: 'Aliphatic Aldehydic Carbonyl (-CHO)',
        isPositive: isPos,
        observation: isPos
          ? 'Initial deep royal blue solution yields a dense, red cuprous oxide (Cu₂O) precipitate on heating.'
          : 'Royal blue alkaline copper solution remains clear; no red precipitate.',
        inference: isPos
          ? 'Aldehyde confirmed: Cu²⁺ tartrate complex reduced to insoluble Cu₂O.'
          : 'Absence of reducing aliphatic carbonyl group.',
        tubeColorHex: isPos ? '#991b1b' : '#1d4ed8',
        precipitateColorHex: isPos ? '#b91c1c' : undefined,
        chemicalEquation: isPos
          ? 'R-CHO + 2 Cu²⁺ + 5 OH⁻ → R-COO⁻ + Cu₂O(s)↓ (Brick-Red ppt) + 3 H₂O'
          : 'No reduction of alkaline Cu(II) tartrate',
      };
    }

    case 'sodium-nitroprusside': {
      const isPos = fg === 'ketone';
      return {
        testId,
        testName: 'Sodium Nitroprusside Test for Ketones',
        sampleName: sample.name,
        targetGroup: 'Ketonic Carbonyl (>C=O)',
        isPositive: isPos,
        observation: isPos
          ? 'Addition of sodium nitroprusside and dilute NaOH gives an intense ruby-red / wine-red coloration.'
          : 'Yellowish-orange alkaline solution without red coloration.',
        inference: isPos
          ? 'Ketone confirmed: Acetone enolate forms an intensely colored nitroprusside complex.'
          : 'Absence of methyl ketonic functional group.',
        tubeColorHex: isPos ? '#881337' : '#ca8a04',
        chemicalEquation: isPos
          ? 'CH₃COCH₃ + OH⁻ ⇌ CH₃COCH₂⁻ + H₂O; [Fe(CN)₅NO]²⁻ + CH₃COCH₂⁻ → [Fe(CN)₅NO·CH₃COCH₂]³⁻ (Ruby Red)'
          : 'No enolate nitroprusside complex',
      };
    }

    case 'sodium-bicarbonate': {
      const isPos = fg === 'carboxylic-acid';
      return {
        testId,
        testName: 'Sodium Bicarbonate Test (NaHCO₃ Effervescence)',
        sampleName: sample.name,
        targetGroup: 'Carboxyl Group (-COOH)',
        isPositive: isPos,
        observation: isPos
          ? 'Instant, vigorous effervescence of colorless, odorless gas that turns clear lime water milky.'
          : 'No effervescence; solid bicarbonate dissolves quietly without gas bubbles.',
        inference: isPos
          ? 'Carboxylic acid (-COOH) confirmed: Stronger acid than carbonic acid (H₂CO₃), liberating CO₂.'
          : 'Absence of carboxylic acid group (phenols do not decompose NaHCO₃).',
        tubeColorHex: '#f8fafc',
        gasEvolution: isPos ? 'Brisk CO₂ gas effervescence turning lime water milky' : undefined,
        chemicalEquation: isPos
          ? 'R-COOH + NaHCO₃ → R-COONa + H₂O + CO₂↑'
          : 'No reaction: Substrate pKa > 6.37',
      };
    }

    case 'ester-test': {
      const isPos = fg === 'carboxylic-acid' || fg === 'alcohol';
      return {
        testId,
        testName: 'Esterification Test (Fruity Odor)',
        sampleName: sample.name,
        targetGroup: 'Carboxylic Acid / Alcohol Coupling',
        isPositive: isPos,
        observation: isPos
          ? 'Pleasant, sweet, characteristic fruity fragrance of ethyl ester detected after warming.'
          : 'Pungent or chemical solvent odor; no fruity fragrance.',
        inference: isPos
          ? 'Ester formation confirmed: Acid-catalyzed condensation to volatile carboxylic ester.'
          : 'Absence of esterifiable group.',
        tubeColorHex: '#f1f5f9',
        chemicalEquation: isPos
          ? 'R-COOH + R\'-OH ⇌ R-COOR\' (Fruity Ester) + H₂O'
          : 'No esterification',
      };
    }

    case 'azo-dye':
    default: {
      const isPos = fg === 'primary-amine';
      return {
        testId: 'azo-dye',
        testName: 'Azo Dye Test (Diazotisation and Coupling)',
        sampleName: sample.name,
        targetGroup: 'Primary Aromatic Amino (-NH₂)',
        isPositive: isPos,
        observation: isPos
          ? 'Formation of a brilliant scarlet-red / bright orange azo dye precipitate with alkaline β-naphthol.'
          : 'Clear yellow solution without colored azo dye precipitation.',
        inference: isPos
          ? 'Primary aromatic amine confirmed: Diazonium salt couples with β-naphthol to form insoluble azo dye.'
          : 'Absence of primary aromatic amino group.',
        tubeColorHex: isPos ? '#ea580c' : '#fef08a',
        precipitateColorHex: isPos ? '#c2410c' : undefined,
        chemicalEquation: isPos
          ? 'C₆H₅N₂⁺Cl⁻ + C₁₀H₇O⁻ → C₆H₅-N=N-C₁₀H₆OH (Bright Scarlet Azo Dye) + Cl⁻'
          : 'Cannot undergo diazotization coupling',
      };
    }
  }
}
