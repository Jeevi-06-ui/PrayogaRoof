/**
 * Qualitative Detection of Elements in Organic Compounds (Class 11)
 * Safe Virtual Model: Pre-Fused Lassaigne's Extract (Sodium Fusion Filtrate)
 *
 * Strict Educational Safety Guideline:
 * Evaluates simulated pre-fused aqueous Lassaigne extract aliquots directly.
 * Does not provide hazardous laboratory instructions for cutting or handling elemental sodium.
 *
 * Diagnostic Tests:
 * 1. Test for Nitrogen: Prussian Blue Test (FeSO₄ + NaOH + Δ + H₂SO₄ + FeCl₃)
 * 2. Test for Sulphur: Sodium Nitroprusside Test (Purple/Violet coloration)
 * 3. Test for Sulphur: Lead Acetate Test (Black PbS precipitate)
 * 4. Test for Halogens: Silver Nitrate Test after HNO₃ boil (White AgCl, Pale Yellow AgBr, Yellow AgI)
 */

export type OrganicSampleId =
  | 'urea'
  | 'thiourea'
  | 'sulphanilic-acid'
  | 'chlorobenzene'
  | 'bromobenzene'
  | 'iodobenzene'
  | 'benzoic-acid';

export type OrganicElementTestId =
  | 'nitrogen-prussian-blue'
  | 'sulphur-nitroprusside'
  | 'sulphur-lead-acetate'
  | 'halogen-silver-nitrate';

export interface OrganicCompoundInfo {
  id: OrganicSampleId;
  name: string;
  formula: string;
  functionalClass: string;
  elementsPresent: {
    nitrogen: boolean;
    sulphur: boolean;
    halogen: 'chlorine' | 'bromine' | 'iodine' | 'none';
  };
  sampleColorHex: string;
}

export interface ElementTestOutcome {
  testId: OrganicElementTestId;
  testName: string;
  targetElement: string;
  procedure: string;
  observation: string;
  inference: string;
  isPositive: boolean;
  tubeColorHex: string;
  precipitateColorHex?: string;
  precipitateLabel?: string;
  chemicalEquation: string;
}

export const ORGANIC_COMPOUND_CATALOGUE: Record<OrganicSampleId, OrganicCompoundInfo> = {
  urea: {
    id: 'urea',
    name: 'Urea (Carbamide)',
    formula: 'NH₂CONH₂',
    functionalClass: 'Amide',
    elementsPresent: { nitrogen: true, sulphur: false, halogen: 'none' },
    sampleColorHex: '#f8fafc',
  },
  thiourea: {
    id: 'thiourea',
    name: 'Thiourea',
    formula: 'NH₂CSNH₂',
    functionalClass: 'Thioamide',
    elementsPresent: { nitrogen: true, sulphur: true, halogen: 'none' },
    sampleColorHex: '#f1f5f9',
  },
  'sulphanilic-acid': {
    id: 'sulphanilic-acid',
    name: 'Sulphanilic Acid',
    formula: 'H₂N-C₆H₄-SO₃H',
    functionalClass: 'Amino Sulphonic Acid',
    elementsPresent: { nitrogen: true, sulphur: true, halogen: 'none' },
    sampleColorHex: '#fef08a',
  },
  chlorobenzene: {
    id: 'chlorobenzene',
    name: 'Chlorobenzene',
    formula: 'C₆H₅Cl',
    functionalClass: 'Aryl Halide (Chloroarene)',
    elementsPresent: { nitrogen: false, sulphur: false, halogen: 'chlorine' },
    sampleColorHex: '#e2e8f0',
  },
  bromobenzene: {
    id: 'bromobenzene',
    name: 'Bromobenzene',
    formula: 'C₆H₅Br',
    functionalClass: 'Aryl Halide (Bromoarene)',
    elementsPresent: { nitrogen: false, sulphur: false, halogen: 'bromine' },
    sampleColorHex: '#cbd5e1',
  },
  iodobenzene: {
    id: 'iodobenzene',
    name: 'Iodobenzene',
    formula: 'C₆H₅I',
    functionalClass: 'Aryl Halide (Iodoarene)',
    elementsPresent: { nitrogen: false, sulphur: false, halogen: 'iodine' },
    sampleColorHex: '#94a3b8',
  },
  'benzoic-acid': {
    id: 'benzoic-acid',
    name: 'Benzoic Acid',
    formula: 'C₆H₅COOH',
    functionalClass: 'Aromatic Carboxylic Acid',
    elementsPresent: { nitrogen: false, sulphur: false, halogen: 'none' },
    sampleColorHex: '#ffffff',
  },
};

/**
 * Runs a specific element identification test on the virtual pre-fused Lassaigne filtrate aliquot
 */
export function runOrganicElementTest(
  sampleId: OrganicSampleId,
  testId: OrganicElementTestId
): ElementTestOutcome {
  const sample = ORGANIC_COMPOUND_CATALOGUE[sampleId];
  const { nitrogen, sulphur, halogen } = sample.elementsPresent;

  switch (testId) {
    case 'nitrogen-prussian-blue': {
      if (nitrogen) {
        return {
          testId,
          testName: 'Prussian Blue Test for Nitrogen',
          targetElement: 'Nitrogen (N)',
          procedure:
            'To 1.5 mL Lassaigne filtrate, add freshly prepared FeSO₄ solution and 2 drops NaOH. Boil gently, cool, acidify with dilute H₂SO₄, and add 2 drops FeCl₃ solution.',
          observation:
            'A brilliant Prussian Blue precipitate / intense coloration forms immediately.',
          inference:
            'Positive: Nitrogen is present in the organic compound (converted to NaCN during fusion).',
          isPositive: true,
          tubeColorHex: '#1e3a8a',
          precipitateColorHex: '#1d4ed8',
          precipitateLabel: 'Prussian Blue Fe₄[Fe(CN)₆]₃ precipitate',
          chemicalEquation:
            '6NaCN + FeSO₄ ⟶ Na₄[Fe(CN)₆] + Na₂SO₄; 3Na₄[Fe(CN)₆] + 4FeCl₃ ⟶ Fe₄[Fe(CN)₆]₃(s, Prussian Blue) + 12NaCl',
        };
      }
      return {
        testId,
        testName: 'Prussian Blue Test for Nitrogen',
        targetElement: 'Nitrogen (N)',
        procedure:
          'To 1.5 mL Lassaigne filtrate, add freshly prepared FeSO₄ and NaOH, boil, cool, acidify with dilute H₂SO₄, and add FeCl₃.',
        observation: 'No Prussian blue or green coloration forms. Solution remains faint pale amber.',
        inference: 'Negative: Nitrogen is absent in the organic compound.',
        isPositive: false,
        tubeColorHex: '#fef08a',
        chemicalEquation: 'No cyanide ions present; no complexation occurs',
      };
    }

    case 'sulphur-nitroprusside': {
      if (sulphur) {
        return {
          testId,
          testName: 'Sodium Nitroprusside Test for Sulphur',
          targetElement: 'Sulphur (S)',
          procedure:
            'To 1 mL Lassaigne filtrate, add 3-4 drops of freshly prepared Sodium Nitroprusside solution Na₂[Fe(CN)₅NO].',
          observation:
            'A magnificent, deep brilliant purple / violet coloration appears instantly.',
          inference:
            'Positive: Sulphur is present in the organic compound (converted to Na₂S during fusion).',
          isPositive: true,
          tubeColorHex: '#7e22ce',
          precipitateColorHex: '#6b21a8',
          precipitateLabel: 'Purple [Fe(CN)₅NOS]⁴⁻ thionitroprusside complex',
          chemicalEquation:
            'Na₂S + Na₂[Fe(CN)₅NO] ⟶ Na₄[Fe(CN)₅NOS] (intense purple thionitroprusside complex)',
        };
      }
      return {
        testId,
        testName: 'Sodium Nitroprusside Test for Sulphur',
        targetElement: 'Sulphur (S)',
        procedure:
          'To 1 mL Lassaigne filtrate, add 3-4 drops of sodium nitroprusside solution.',
        observation: 'No purple or violet coloration. Solution remains faint pale yellow.',
        inference: 'Negative: Sulphur is absent in the organic compound.',
        isPositive: false,
        tubeColorHex: '#fef9c3',
        chemicalEquation: 'No sulphide ions present; nitroprusside remains unchanged',
      };
    }

    case 'sulphur-lead-acetate': {
      if (sulphur) {
        return {
          testId,
          testName: 'Lead Acetate Test for Sulphur',
          targetElement: 'Sulphur (S)',
          procedure:
            'Acidify 1 mL Lassaigne filtrate with dilute acetic acid (CH₃COOH), then add 1 mL Lead Acetate solution.',
          observation:
            'A dense, black precipitate of Lead Sulphide (PbS) forms immediately.',
          inference:
            'Positive: Confirms presence of Sulphur in the organic compound.',
          isPositive: true,
          tubeColorHex: '#0f172a',
          precipitateColorHex: '#020617',
          precipitateLabel: 'Black PbS precipitate',
          chemicalEquation:
            'Na₂S + (CH₃COO)₂Pb ⟶ PbS(s, black ppt) + 2CH₃COONa',
        };
      }
      return {
        testId,
        testName: 'Lead Acetate Test for Sulphur',
        targetElement: 'Sulphur (S)',
        procedure:
          'Acidify 1 mL Lassaigne filtrate with acetic acid and add lead acetate solution.',
        observation: 'No black precipitate forms. Solution remains clear and colorless.',
        inference: 'Negative: Sulphur is absent.',
        isPositive: false,
        tubeColorHex: '#f8fafc',
        chemicalEquation: 'No sulphide ions present; lead acetate remains in solution',
      };
    }

    case 'halogen-silver-nitrate': {
      if (halogen === 'chlorine') {
        return {
          testId,
          testName: 'Silver Nitrate Test for Halogens (Chlorine)',
          targetElement: 'Halogen (Cl)',
          procedure:
            'Acidify 1.5 mL Lassaigne filtrate with concentrated HNO₃ and boil for 2 minutes (to expel any HCN or H₂S). Cool and add 1 mL AgNO₃ solution, then add excess dilute NH₄OH.',
          observation:
            'A curdy white precipitate of AgCl forms, which dissolves completely and readily in excess dilute NH₄OH.',
          inference:
            'Positive: Chlorine (Cl) is present in the organic compound.',
          isPositive: true,
          tubeColorHex: '#ffffff',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'White curdy AgCl (completely soluble in NH₄OH)',
          chemicalEquation:
            'NaCl + AgNO₃ ⟶ AgCl(s, white curdy ppt) + NaNO₃; AgCl + 2NH₄OH ⟶ [Ag(NH₃)₂]Cl(aq, soluble) + 2H₂O',
        };
      }
      if (halogen === 'bromine') {
        return {
          testId,
          testName: 'Silver Nitrate Test for Halogens (Bromine)',
          targetElement: 'Halogen (Br)',
          procedure:
            'Acidify 1.5 mL Lassaigne filtrate with HNO₃, boil, cool, and add AgNO₃ solution, followed by dilute NH₄OH.',
          observation:
            'A pale yellow precipitate of AgBr forms, which is only sparingly soluble in excess dilute NH₄OH.',
          inference:
            'Positive: Bromine (Br) is present in the organic compound.',
          isPositive: true,
          tubeColorHex: '#fef08a',
          precipitateColorHex: '#fde047',
          precipitateLabel: 'Pale yellow AgBr (sparingly soluble in NH₄OH)',
          chemicalEquation:
            'NaBr + AgNO₃ ⟶ AgBr(s, pale yellow ppt) + NaNO₃; sparingly soluble in NH₄OH',
        };
      }
      if (halogen === 'iodine') {
        return {
          testId,
          testName: 'Silver Nitrate Test for Halogens (Iodine)',
          targetElement: 'Halogen (I)',
          procedure:
            'Acidify 1.5 mL Lassaigne filtrate with HNO₃, boil, cool, and add AgNO₃ solution, followed by dilute NH₄OH.',
          observation:
            'A bright canary-yellow precipitate of AgI forms, which is completely insoluble in excess dilute NH₄OH.',
          inference:
            'Positive: Iodine (I) is present in the organic compound.',
          isPositive: true,
          tubeColorHex: '#facc15',
          precipitateColorHex: '#eab308',
          precipitateLabel: 'Bright yellow AgI (insoluble in NH₄OH)',
          chemicalEquation:
            'NaI + AgNO₃ ⟶ AgI(s, bright yellow ppt) + NaNO₃; insoluble in NH₄OH',
        };
      }
      return {
        testId,
        testName: 'Silver Nitrate Test for Halogens',
        targetElement: 'Halogens (Cl, Br, I)',
        procedure:
          'Acidify 1.5 mL Lassaigne filtrate with HNO₃, boil, cool, and add AgNO₃ solution.',
        observation: 'No precipitate forms. Solution remains crystal clear and colorless.',
        inference: 'Negative: Halogens (Cl, Br, I) are absent in the organic compound.',
        isPositive: false,
        tubeColorHex: '#f8fafc',
        chemicalEquation: 'No halide ions present; silver ions remain dissociated in solution',
      };
    }
  }
}
