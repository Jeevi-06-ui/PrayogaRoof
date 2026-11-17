/**
 * Systematic Qualitative Analysis of Inorganic Salts
 * Curriculum: CBSE Class 11 & Class 12 Chemistry Practical
 *
 * Systematic Decision Tree:
 * 1. Preliminary / Physical Examination
 * 2. Dry Heating Test
 * 3. Flame Test
 * 4. Dilute H₂SO₄ Test (Anion preliminary)
 * 5. Concentrated H₂SO₄ Test (Anion secondary)
 * 6. Confirmatory Test for Anions (Cl⁻, SO₄²⁻, NO₃⁻, CO₃²⁻, PO₄³⁻, C₂O₄²⁻)
 * 7. Systematic Cation Group Separation (Zero, I, II, III, IV, V, VI)
 * 8. Confirmatory Wet Tests for Cations
 * 9. Class 12 Extensions:
 *    - Interfering Radicals: Phosphate (PO₄³⁻), Oxalate (C₂O₄²⁻)
 *    - Premature Group III Precipitation Theory & Elimination Protocols
 *    - Phosphate Elimination via Sodium Acetate Buffer + FeCl₃
 *    - Oxalate Elimination via KMnO₄ / Repeated Conc. HNO₃ Evaporation
 */

export type SaltSampleId =
  | 'nh4cl'
  | 'pb-no3-2'
  | 'cuso4'
  | 'feso4'
  | 'alcl3'
  | 'znso4'
  | 'cacl2'
  | 'mgso4'
  // Class 12 Additions (Interfering Radicals & Advanced Group Analysis):
  | 'ca3_po4_2'
  | 'mg_c2o4'
  | 'fe_po4'
  | 'ba_cl2';

export type SaltTestId =
  | 'physical'
  | 'dry-heating'
  | 'flame-test'
  | 'dilute-acid'
  | 'conc-acid'
  | 'anion-confirmatory'
  | 'cation-group-test'
  | 'cation-confirmatory'
  // Class 12 Advanced Diagnostic & Elimination Tests:
  | 'phosphate-molybdate'
  | 'phosphate-elimination'
  | 'oxalate-kmno4';

export interface SaltInfo {
  id: SaltSampleId;
  name: string;
  formula: string;
  cation: string;
  cationGroup: string;
  anion: string;
  anionClass: string;
  appearance: string;
  solidColorHex: string;
  isClass12Interfering?: boolean;
}

export interface SaltTestOutcome {
  testId: SaltTestId;
  testName: string;
  procedure: string;
  observation: string;
  inference: string;
  tubeColorHex: string;
  precipitateColorHex?: string;
  precipitateLabel?: string;
  gasEvolution?: string;
  flameColorHex?: string;
  chemicalEquation: string;
}

export const SALT_CATALOGUE: Record<SaltSampleId, SaltInfo> = {
  nh4cl: {
    id: 'nh4cl',
    name: 'Ammonium Chloride',
    formula: 'NH₄Cl',
    cation: 'Ammonium (NH₄⁺)',
    cationGroup: 'Zero Group',
    anion: 'Chloride (Cl⁻)',
    anionClass: 'Conc. H₂SO₄ Group',
    appearance: 'White crystalline solid with slight ammoniacal odor',
    solidColorHex: '#f1f5f9',
  },
  'pb-no3-2': {
    id: 'pb-no3-2',
    name: 'Lead(II) Nitrate',
    formula: 'Pb(NO₃)₂',
    cation: 'Lead(II) (Pb²⁺)',
    cationGroup: 'Group I',
    anion: 'Nitrate (NO₃⁻)',
    anionClass: 'Conc. H₂SO₄ Group',
    appearance: 'White lustrous crystalline solid',
    solidColorHex: '#f8fafc',
  },
  cuso4: {
    id: 'cuso4',
    name: 'Copper(II) Sulphate Pentahydrate',
    formula: 'CuSO₄·5H₂O',
    cation: 'Copper(II) (Cu²⁺)',
    cationGroup: 'Group II',
    anion: 'Sulphate (SO₄²⁻)',
    anionClass: 'Independent Radicals (BaCl₂ test)',
    appearance: 'Vibrant blue crystalline granules',
    solidColorHex: '#0284c7',
  },
  feso4: {
    id: 'feso4',
    name: 'Iron(II) Sulphate Heptahydrate',
    formula: 'FeSO₄·7H₂O',
    cation: 'Iron(II) (Fe²⁺)',
    cationGroup: 'Group III',
    anion: 'Sulphate (SO₄²⁻)',
    anionClass: 'Independent Radicals (BaCl₂ test)',
    appearance: 'Pale light green crystalline powder',
    solidColorHex: '#86efac',
  },
  alcl3: {
    id: 'alcl3',
    name: 'Aluminium Chloride',
    formula: 'AlCl₃',
    cation: 'Aluminium (Al³⁺)',
    cationGroup: 'Group III',
    anion: 'Chloride (Cl⁻)',
    anionClass: 'Conc. H₂SO₄ Group',
    appearance: 'White to slightly off-white hygroscopic solid',
    solidColorHex: '#f8fafc',
  },
  znso4: {
    id: 'znso4',
    name: 'Zinc Sulphate Heptahydrate',
    formula: 'ZnSO₄·7H₂O',
    cation: 'Zinc (Zn²⁺)',
    cationGroup: 'Group IV',
    anion: 'Sulphate (SO₄²⁻)',
    anionClass: 'Independent Radicals (BaCl₂ test)',
    appearance: 'Colorless to transparent white crystals',
    solidColorHex: '#f1f5f9',
  },
  cacl2: {
    id: 'cacl2',
    name: 'Calcium Chloride',
    formula: 'CaCl₂',
    cation: 'Calcium (Ca²⁺)',
    cationGroup: 'Group V',
    anion: 'Chloride (Cl⁻)',
    anionClass: 'Conc. H₂SO₄ Group',
    appearance: 'White deliquescent granules',
    solidColorHex: '#f8fafc',
  },
  mgso4: {
    id: 'mgso4',
    name: 'Magnesium Sulphate Heptahydrate (Epsom Salt)',
    formula: 'MgSO₄·7H₂O',
    cation: 'Magnesium (Mg²⁺)',
    cationGroup: 'Group VI',
    anion: 'Sulphate (SO₄²⁻)',
    anionClass: 'Independent Radicals (BaCl₂ test)',
    appearance: 'Colorless needle-like prismatic crystals',
    solidColorHex: '#f8fafc',
  },

  // Class 12 Additions
  ca3_po4_2: {
    id: 'ca3_po4_2',
    name: 'Calcium Phosphate',
    formula: 'Ca₃(PO₄)₂',
    cation: 'Calcium (Ca²⁺)',
    cationGroup: 'Group V (Interfered)',
    anion: 'Phosphate (PO₄³⁻)',
    anionClass: 'Interfering Radical (Requires Elimination)',
    appearance: 'White amorphous insoluble powder',
    solidColorHex: '#f1f5f9',
    isClass12Interfering: true,
  },
  mg_c2o4: {
    id: 'mg_c2o4',
    name: 'Magnesium Oxalate',
    formula: 'MgC₂O₄',
    cation: 'Magnesium (Mg²⁺)',
    cationGroup: 'Group VI (Interfered)',
    anion: 'Oxalate (C₂O₄²⁻)',
    anionClass: 'Interfering Radical (Conc. H₂SO₄ / Redox)',
    appearance: 'White crystalline solid',
    solidColorHex: '#f8fafc',
    isClass12Interfering: true,
  },
  fe_po4: {
    id: 'fe_po4',
    name: 'Ferric Phosphate',
    formula: 'FePO₄',
    cation: 'Iron(III) (Fe³⁺)',
    cationGroup: 'Group III',
    anion: 'Phosphate (PO₄³⁻)',
    anionClass: 'Interfering Radical (Precipitates naturally in Grp III)',
    appearance: 'Yellowish-brown amorphous powder',
    solidColorHex: '#ca8a04',
    isClass12Interfering: true,
  },
  ba_cl2: {
    id: 'ba_cl2',
    name: 'Barium Chloride Dihydrate',
    formula: 'BaCl₂·2H₂O',
    cation: 'Barium (Ba²⁺)',
    cationGroup: 'Group V',
    anion: 'Chloride (Cl⁻)',
    anionClass: 'Conc. H₂SO₄ Group',
    appearance: 'White translucent crystalline plates',
    solidColorHex: '#f8fafc',
    isClass12Interfering: false,
  },
};

/**
 * Runs a specific systematic test on the chosen salt and produces diagnostic laboratory outcomes
 */
export function runSaltAnalysisTest(saltId: SaltSampleId, testId: SaltTestId): SaltTestOutcome {
  const salt = SALT_CATALOGUE[saltId];

  switch (testId) {
    case 'physical':
      return {
        testId,
        testName: 'Physical & Visual Examination',
        procedure: 'Examine color, state, and odor of the dry crystalline sample.',
        observation: `${salt.appearance}. No heavy sulfurous or vinegar odor detected.`,
        inference:
          saltId === 'cuso4'
            ? 'Blue color strongly suggests hydrated Cu²⁺ cation.'
            : saltId === 'feso4'
            ? 'Light green tint suggests Fe²⁺ cation.'
            : saltId === 'fe_po4'
            ? 'Yellowish-brown color suggests Fe³⁺ cation.'
            : 'White/colorless appearance indicates absence of Cu²⁺, Fe²⁺/Fe³⁺, Ni²⁺, Co²⁺.',
        tubeColorHex: salt.solidColorHex,
        chemicalEquation: 'Physical observation of crystal lattice geometry and color',
      };

    case 'dry-heating': {
      if (saltId === 'nh4cl') {
        return {
          testId,
          testName: 'Dry Heating Test',
          procedure: 'Heat a small pinch of dry salt in a dry ignition test tube over Bunsen flame.',
          observation: 'White solid sublimes directly; dense white sublimate coats the cooler upper walls of the test tube.',
          inference: 'Sublimable salt indicated: Ammonium (NH₄⁺) salt.',
          tubeColorHex: '#ffffff',
          chemicalEquation: 'NH₄Cl(s) ⇌ NH₃(g) + HCl(g) ⟶ NH₄Cl(s, cooler walls)',
        };
      }
      if (saltId === 'pb-no3-2') {
        return {
          testId,
          testName: 'Dry Heating Test',
          procedure: 'Heat dry salt in an ignition tube.',
          observation: 'Decrepitation (crackling noise) followed by brisk evolution of reddish-brown gas (NO₂) turning moist blue litmus red. Yellow residue when cold (PbO).',
          inference: 'Indicates Nitrate (NO₃⁻) and Lead (Pb²⁺).',
          tubeColorHex: '#ca8a04',
          gasEvolution: 'Reddish-brown NO₂ gas',
          chemicalEquation: '2Pb(NO₃)₂(s) ⟶ 2PbO(s, yellow residue) + 4NO₂(g, brown) + O₂(g)',
        };
      }
      if (saltId === 'cuso4') {
        return {
          testId,
          testName: 'Dry Heating Test',
          procedure: 'Heat dry blue crystals gently in a test tube.',
          observation: 'Blue crystals lose water of crystallisation, forming a white anhydrous amorphous powder. Droplets of condensed water form on upper tube walls.',
          inference: 'Hydrated copper salt present.',
          tubeColorHex: '#e2e8f0',
          chemicalEquation: 'CuSO₄·5H₂O(s, blue) ⟶ CuSO₄(s, anhydrous white) + 5H₂O(g)',
        };
      }
      if (saltId === 'feso4') {
        return {
          testId,
          testName: 'Dry Heating Test',
          procedure: 'Strongly heat green salt in dry tube.',
          observation: 'Color turns from pale green to dirty brown/red; pungent suffocating choking smell of burning sulphur (SO₂ + SO₃) evolved.',
          inference: 'Sulphate of heavy metal (FeSO₄) indicated.',
          tubeColorHex: '#78350f',
          gasEvolution: 'Pungent SO₂/SO₃ choking fumes',
          chemicalEquation: '2FeSO₄·7H₂O ⟶ Fe₂O₃(s, red-brown) + SO₂(g) + SO₃(g) + 14H₂O',
        };
      }
      if (saltId === 'mg_c2o4') {
        return {
          testId,
          testName: 'Dry Heating Test',
          procedure: 'Heat dry sample in ignition tube.',
          observation: 'Slight charring with decomposition; gas evolved burns with a faint blue flame (CO) and turns lime water milky (CO₂).',
          inference: 'Indicates presence of Oxalate (C₂O₄²⁻) anion.',
          tubeColorHex: '#475569',
          gasEvolution: 'CO and CO₂ gases',
          chemicalEquation: 'MgC₂O₄(s) ⟶ MgO(s) + CO(g) + CO₂(g)',
        };
      }
      return {
        testId,
        testName: 'Dry Heating Test',
        procedure: 'Heat a small pinch of dry salt in a dry ignition test tube.',
        observation: 'No significant color change or gas evolution; slight condensation of moisture on tube walls.',
        inference: 'Absence of NH₄⁺, NO₃⁻, NO₂⁻, I⁻, Br⁻, and organic acid salts.',
        tubeColorHex: salt.solidColorHex,
        chemicalEquation: 'Thermal stability at Bunsen burner temperatures',
      };
    }

    case 'flame-test': {
      if (saltId === 'cacl2' || saltId === 'ca3_po4_2') {
        return {
          testId,
          testName: 'Flame Test',
          procedure: 'Prepare a paste of salt with conc. HCl on a watch glass. Introduce on platinum/nichrome wire into non-luminous flame.',
          observation: 'Brilliant brick-red flame coloration observed, appearing light green when viewed through cobalt blue glass.',
          inference: 'Confirms Calcium (Ca²⁺) cation.',
          tubeColorHex: '#ef4444',
          flameColorHex: '#dc2626',
          chemicalEquation: 'Ca²⁺ + 2Cl⁻ ⟶ CaCl₂; thermal excitation of Ca atoms gives brick-red emission (~620 nm)',
        };
      }
      if (saltId === 'ba_cl2') {
        return {
          testId,
          testName: 'Flame Test',
          procedure: 'Introduce paste of BaCl₂ with conc. HCl on clean loop into non-luminous flame.',
          observation: 'Persistent apple-green (grassy green) flame coloration observed.',
          inference: 'Confirms Barium (Ba²⁺) cation.',
          tubeColorHex: '#65a30d',
          flameColorHex: '#84cc16',
          chemicalEquation: 'Ba²⁺ atomic emission imparts characteristic apple-green flame (~524 nm)',
        };
      }
      if (saltId === 'cuso4') {
        return {
          testId,
          testName: 'Flame Test',
          procedure: 'Introduce sample moistened with conc. HCl into non-luminous flame.',
          observation: 'Brilliant bluish-green flame with bright sparks observed.',
          inference: 'Confirms Copper (Cu²⁺) cation.',
          tubeColorHex: '#0d9488',
          flameColorHex: '#14b8a6',
          chemicalEquation: 'Cu²⁺ atomic emission imparts green-blue coloration to Bunsen flame',
        };
      }
      if (saltId === 'pb-no3-2') {
        return {
          testId,
          testName: 'Flame Test',
          procedure: 'Introduce sample into non-luminous flame.',
          observation: 'Dull bluish-white flame observed.',
          inference: 'Characteristic flame emission for Lead (Pb²⁺).',
          tubeColorHex: '#cbd5e1',
          flameColorHex: '#93c5fd',
          chemicalEquation: 'Pb²⁺ thermal excitation producing pale blue-grey flame',
        };
      }
      return {
        testId,
        testName: 'Flame Test',
        procedure: 'Introduce loop with paste into the burner flame.',
        observation: 'No characteristic persistent flame coloration (pale burner flame unchanged).',
        inference: 'Absence of Ca²⁺, Ba²⁺, Sr²⁺, Cu²⁺.',
        tubeColorHex: '#e2e8f0',
        chemicalEquation: 'Non-volatile or non-emitting cation in visible region',
      };
    }

    case 'dilute-acid':
      return {
        testId,
        testName: 'Dilute H₂SO₄ Test (Dilute Acid Radicals)',
        procedure: 'Add 2 mL of dilute H₂SO₄ to 0.1 g of dry salt in a test tube. Warm gently.',
        observation: 'No brisk effervescence; no colorless gas turning lime water milky; no rotten egg odor.',
        inference: 'Absence of dilute acid radicals: Carbonate (CO₃²⁻), Sulphite (SO₃²⁻), Sulphide (S²⁻), Nitrite (NO₂⁻).',
        tubeColorHex: '#f8fafc',
        chemicalEquation: 'No reaction with dilute H₂SO₄ at room/moderate temperature',
      };

    case 'conc-acid': {
      if (saltId === 'nh4cl' || saltId === 'alcl3' || saltId === 'cacl2' || saltId === 'ba_cl2') {
        return {
          testId,
          testName: 'Concentrated H₂SO₄ Test',
          procedure: 'Treat a pinch of salt with 1 mL concentrated H₂SO₄. Warm gently. Hold a glass rod dipped in NH₄OH near mouth.',
          observation: 'Colorless pungent fumes of HCl evolved, which produce dense white plumes of NH₄Cl with NH₄OH rod.',
          inference: 'Indicates presence of Chloride (Cl⁻) anion.',
          tubeColorHex: '#e2e8f0',
          gasEvolution: 'HCl gas (dense white fumes with NH₄OH)',
          chemicalEquation: 'Cl⁻ + H₂SO₄ ⟶ HSO₄⁻ + HCl(g); HCl(g) + NH₃(g) ⟶ NH₄Cl(s, dense white fumes)',
        };
      }
      if (saltId === 'pb-no3-2') {
        return {
          testId,
          testName: 'Concentrated H₂SO₄ Test',
          procedure: 'Add conc. H₂SO₄ and heat gently; add paper pellet or copper turnings.',
          observation: 'Dense reddish-brown fumes of NO₂ gas evolve rapidly, darkening with copper turnings; solution turns blue.',
          inference: 'Indicates presence of Nitrate (NO₃⁻) anion.',
          tubeColorHex: '#78350f',
          gasEvolution: 'NO₂ gas (pungent reddish-brown)',
          chemicalEquation: '4HNO₃ + Cu ⟶ Cu(NO₃)₂ + 2NO₂(g, brown) + 2H₂O',
        };
      }
      if (saltId === 'mg_c2o4') {
        return {
          testId,
          testName: 'Concentrated H₂SO₄ Test (Oxalate Anion)',
          procedure: 'Heat a pinch of dry salt with 1 mL conc. H₂SO₄.',
          observation: 'Brisk effervescence of colorless odorless CO gas (burns with blue flame at mouth) mixed with CO₂ (turns lime water milky).',
          inference: 'Indicates presence of Oxalate (C₂O₄²⁻) anion.',
          tubeColorHex: '#cbd5e1',
          gasEvolution: 'CO (blue flame) and CO₂ (milky lime water)',
          chemicalEquation: 'C₂O₄²⁻ + H₂SO₄ ⟶ H₂O + CO(g) + CO₂(g) + SO₄²⁻',
        };
      }
      return {
        testId,
        testName: 'Concentrated H₂SO₄ Test',
        procedure: 'Treat dry sample with 1 mL concentrated H₂SO₄ and warm gently.',
        observation: 'No pungent gas, no brown fumes, no violet iodine vapors evolved.',
        inference: 'Absence of Cl⁻, Br⁻, I⁻, NO₃⁻, C₂O₄²⁻. Suggests independent or interfering radical (SO₄²⁻, PO₄³⁻).',
        tubeColorHex: '#f8fafc',
        chemicalEquation: 'No volatile acid gas displaced by conc. H₂SO₄',
      };
    }

    case 'anion-confirmatory': {
      if (saltId === 'nh4cl' || saltId === 'alcl3' || saltId === 'cacl2' || saltId === 'ba_cl2') {
        return {
          testId,
          testName: 'Silver Nitrate Confirmatory Test for Chloride',
          procedure: 'Acidify aqueous salt solution with dilute HNO₃, then add 1 mL of AgNO₃ solution.',
          observation: 'Curdy white precipitate of AgCl forms immediately, which dissolves completely in excess dilute NH₄OH.',
          inference: 'Confirmed: Chloride (Cl⁻) anion present.',
          tubeColorHex: '#ffffff',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'White curdy AgCl precipitate',
          chemicalEquation: 'Cl⁻ + Ag⁺ ⟶ AgCl(s, white curdy ppt); AgCl + 2NH₄OH ⟶ [Ag(NH₃)₂]Cl(aq) + 2H₂O',
        };
      }
      if (saltId === 'cuso4' || saltId === 'feso4' || saltId === 'znso4' || saltId === 'mgso4') {
        return {
          testId,
          testName: 'Barium Chloride Confirmatory Test for Sulphate',
          procedure: 'Acidify salt solution with dilute HCl and add 1 mL of BaCl₂ solution.',
          observation: 'Heavy, brilliant white precipitate of BaSO₄ forms immediately, completely insoluble in concentrated HCl.',
          inference: 'Confirmed: Sulphate (SO₄²⁻) anion present.',
          tubeColorHex: '#f1f5f9',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'Heavy white BaSO₄ precipitate',
          chemicalEquation: 'SO₄²⁻ + Ba²⁺ ⟶ BaSO₄(s, white ppt insoluble in conc HCl)',
        };
      }
      if (saltId === 'pb-no3-2') {
        return {
          testId,
          testName: 'Brown Ring Confirmatory Test for Nitrate',
          procedure: 'Add freshly prepared FeSO₄ solution to salt solution. Incline the tube and slowly pour conc. H₂SO₄ down side.',
          observation: 'A dark brown ring forms at the interface/junction of the two liquid layers.',
          inference: 'Confirmed: Nitrate (NO₃⁻) anion present.',
          tubeColorHex: '#78350f',
          precipitateColorHex: '#451a03',
          precipitateLabel: 'Brown ring at liquid junction',
          chemicalEquation: 'NO₃⁻ + 3Fe²⁺ + 4H⁺ ⟶ 3Fe³⁺ + NO + 2H₂O; [Fe(H₂O)₆]²⁺ + NO ⟶ [Fe(H₂O)₅(NO)]²⁺(brown ring) + H₂O',
        };
      }
      if (saltId === 'ca3_po4_2' || saltId === 'fe_po4') {
        return {
          testId,
          testName: 'Ammonium Molybdate Confirmatory Test for Phosphate',
          procedure: 'Boil salt solution with 2 mL conc. HNO₃, then add excess ammonium molybdate (NH₄)₂MoO₄ reagent and warm gently.',
          observation: 'Dense canary-yellow precipitate of Ammonium Phosphomolybdate [(NH₄)₃PO₄·12MoO₃] forms.',
          inference: 'Confirmed: Phosphate (PO₄³⁻) interfering radical present.',
          tubeColorHex: '#fef08a',
          precipitateColorHex: '#facc15',
          precipitateLabel: 'Canary-yellow Ammonium Phosphomolybdate ppt',
          chemicalEquation: 'PO₄³⁻ + 12MoO₄²⁻ + 3NH₄⁺ + 24H⁺ ⟶ (NH₄)₃[P(Mo₃O₁₀)₄](s, canary yellow) + 12H₂O',
        };
      }
      if (saltId === 'mg_c2o4') {
        return {
          testId,
          testName: 'KMnO₄ Decolorization Confirmatory Test for Oxalate',
          procedure: 'Acidify salt solution with dilute H₂SO₄, warm to 60-70°C, and add KMnO₄ dropwise.',
          observation: 'Pink color of KMnO₄ is discharged with brisk evolution of CO₂ gas bubbles.',
          inference: 'Confirmed: Oxalate (C₂O₄²⁻) interfering radical present.',
          tubeColorHex: '#f8fafc',
          gasEvolution: 'CO₂ gas bubbles',
          chemicalEquation: '5C₂O₄²⁻ + 2MnO₄⁻ + 16H⁺ --(60°C)--> 2Mn²⁺ + 10CO₂↑ + 8H₂O',
        };
      }
      return {
        testId,
        testName: 'Anion Confirmatory Test',
        procedure: 'Aqueous confirmatory reagent additions.',
        observation: 'Characteristic precipitate observed.',
        inference: 'Anion identified.',
        tubeColorHex: '#ffffff',
        chemicalEquation: 'Confirmatory precipitation reaction',
      };
    }

    case 'cation-group-test': {
      if (saltId === 'nh4cl') {
        return {
          testId,
          testName: 'Zero Group Analysis (Ammonium Ion)',
          procedure: 'Add 2 mL of 2M NaOH solution to salt and boil vigorously.',
          observation: 'Pungent ammoniacal gas evolved, turning moist red litmus paper blue and turning Nessler’s reagent brown.',
          inference: 'Zero Group cation (NH₄⁺) indicated.',
          tubeColorHex: '#d97706',
          gasEvolution: 'NH₃ gas (pungent ammonia)',
          precipitateColorHex: '#92400e',
          precipitateLabel: 'Brown coloration/precipitate with Nessler reagent',
          chemicalEquation: 'NH₄⁺ + OH⁻ ⟶ NH₃(g) + H₂O; 2K₂[HgI₄] + NH₃ + 3KOH ⟶ H₂N-Hg-O-Hg-I(brown ppt) + 7KI + 2H₂O',
        };
      }
      if (saltId === 'pb-no3-2') {
        return {
          testId,
          testName: 'Group I Cation Separation (Lead)',
          procedure: 'To Original Solution (OS) in cold water, add 1 mL of dilute HCl.',
          observation: 'Dense white precipitate of PbCl₂ forms, which dissolves completely on boiling and recrystallizes on cooling.',
          inference: 'Group I present: Lead (Pb²⁺).',
          tubeColorHex: '#ffffff',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'White crystalline PbCl₂ precipitate',
          chemicalEquation: 'Pb²⁺ + 2Cl⁻ ⟶ PbCl₂(s, white ppt, soluble in hot water)',
        };
      }
      if (saltId === 'cuso4') {
        return {
          testId,
          testName: 'Group II Cation Separation (Copper)',
          procedure: 'To acidified OS, pass/add H₂S source in acidic medium.',
          observation: 'Copious black precipitate of CuS forms immediately.',
          inference: 'Group II present: Copper (Cu²⁺).',
          tubeColorHex: '#1e293b',
          precipitateColorHex: '#0f172a',
          precipitateLabel: 'Black CuS precipitate',
          chemicalEquation: 'Cu²⁺ + H₂S ⟶ CuS(s, black ppt) + 2H⁺',
        };
      }
      if (saltId === 'feso4') {
        return {
          testId,
          testName: 'Group III Cation Separation (Iron)',
          procedure: 'To OS add solid NH₄Cl, warm, cool, and add excess NH₄OH.',
          observation: 'Dirty green gelatinous precipitate of Fe(OH)₂ forms, turning rusty brown upon air exposure.',
          inference: 'Group III present: Iron(II) (Fe²⁺).',
          tubeColorHex: '#15803d',
          precipitateColorHex: '#166534',
          precipitateLabel: 'Dirty green Fe(OH)₂ precipitate',
          chemicalEquation: 'Fe²⁺ + 2NH₄OH ⟶ Fe(OH)₂(s, dirty green ppt) + 2NH₄⁺',
        };
      }
      if (saltId === 'fe_po4') {
        return {
          testId,
          testName: 'Group III Cation Separation (Iron with Phosphate)',
          procedure: 'To OS add solid NH₄Cl, boil with conc. HNO₃, cool, and add excess NH₄OH.',
          observation: 'Reddish-brown / yellowish-brown precipitate of FePO₄ and Fe(OH)₃ precipitates quantitatively.',
          inference: 'Group III present: Iron(III) (Fe³⁺). (Since Fe³⁺ precipitates before other cations, phosphate does not interfere with Fe³⁺).',
          tubeColorHex: '#78350f',
          precipitateColorHex: '#854d0e',
          precipitateLabel: 'Yellowish-brown FePO₄ precipitate',
          chemicalEquation: 'Fe³⁺ + PO₄³⁻ ⟶ FePO₄(s, yellowish-brown ppt)',
        };
      }
      if (saltId === 'alcl3') {
        return {
          testId,
          testName: 'Group III Cation Separation (Aluminium)',
          procedure: 'To OS add solid NH₄Cl, boil, cool, and add excess NH₄OH.',
          observation: 'White gelatinous precipitate of Al(OH)₃ forms.',
          inference: 'Group III present: Aluminium (Al³⁺).',
          tubeColorHex: '#f1f5f9',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'White gelatinous Al(OH)₃ precipitate',
          chemicalEquation: 'Al³⁺ + 3NH₄OH ⟶ Al(OH)₃(s, gelatinous white ppt) + 3NH₄⁺',
        };
      }
      if (saltId === 'znso4') {
        return {
          testId,
          testName: 'Group IV Cation Separation (Zinc)',
          procedure: 'To Group III ammoniacal filtrate, pass H₂S gas.',
          observation: 'Dull white to grayish-white precipitate of ZnS forms.',
          inference: 'Group IV present: Zinc (Zn²⁺).',
          tubeColorHex: '#e2e8f0',
          precipitateColorHex: '#cbd5e1',
          precipitateLabel: 'Grayish-white ZnS precipitate',
          chemicalEquation: 'Zn²⁺ + S²⁻ ⟶ ZnS(s, grayish-white ppt)',
        };
      }
      if (saltId === 'cacl2') {
        return {
          testId,
          testName: 'Group V Cation Separation (Calcium)',
          procedure: 'To ammoniacal solution add solid (NH₄)₂CO₃ solution and warm gently.',
          observation: 'White precipitate of CaCO₃ forms.',
          inference: 'Group V present: Calcium (Ca²⁺).',
          tubeColorHex: '#ffffff',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'White CaCO₃ precipitate',
          chemicalEquation: 'Ca²⁺ + CO₃²⁻ ⟶ CaCO₃(s, white precipitate)',
        };
      }
      if (saltId === 'ba_cl2') {
        return {
          testId,
          testName: 'Group V Cation Separation (Barium)',
          procedure: 'To Group IV filtrate add NH₄Cl, NH₄OH and (NH₄)₂CO₃ solution.',
          observation: 'Dense white precipitate of BaCO₃ forms.',
          inference: 'Group V present: Barium (Ba²⁺).',
          tubeColorHex: '#ffffff',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'White BaCO₃ precipitate',
          chemicalEquation: 'Ba²⁺ + CO₃²⁻ ⟶ BaCO₃(s, white precipitate)',
        };
      }
      if (saltId === 'ca3_po4_2') {
        return {
          testId,
          testName: 'Group Separation with Phosphate Interference (Calcium)',
          procedure: 'Add NH₄Cl and NH₄OH without removing phosphate radical.',
          observation: 'PREMATURE INTERFERENCE: Insoluble white precipitate of Ca₃(PO₄)₂ precipitates prematurely in Group III due to alkaline pH!',
          inference: 'Interfering Radical Detected: Phosphate precipitates Group V Ca²⁺ as Ca₃(PO₄)₂ prematurely. Must eliminate phosphate before proceeding!',
          tubeColorHex: '#f1f5f9',
          precipitateColorHex: '#e2e8f0',
          precipitateLabel: 'Premature Ca₃(PO₄)₂ precipitate in Grp III',
          chemicalEquation: '3Ca²⁺ + 2PO₄³⁻ ⟶ Ca₃(PO₄)₂(s, premature ppt in alkaline NH₄OH medium)',
        };
      }
      if (saltId === 'mg_c2o4') {
        return {
          testId,
          testName: 'Group Separation with Oxalate Interference (Magnesium)',
          procedure: 'Add NH₄Cl and NH₄OH without destroying oxalate radical.',
          observation: 'PREMATURE INTERFERENCE: White precipitate of MgC₂O₄ precipitates prematurely in Group III alkaline buffer.',
          inference: 'Interfering Radical Detected: Oxalate precipitates Group VI Mg²⁺ prematurely in Group III. Must eliminate oxalate with conc. HNO₃!',
          tubeColorHex: '#f1f5f9',
          precipitateColorHex: '#e2e8f0',
          precipitateLabel: 'Premature MgC₂O₄ precipitate in Grp III',
          chemicalEquation: 'Mg²⁺ + C₂O₄²⁻ ⟶ MgC₂O₄(s, premature ppt in alkaline medium)',
        };
      }
      // mgso4
      return {
        testId,
        testName: 'Group VI Cation Separation (Magnesium)',
        procedure: 'To Group V filtrate add excess NH₄OH and disodium hydrogen phosphate (Na₂HPO₄). Scratch walls with glass rod.',
        observation: 'White crystalline precipitate of Mg(NH₄)PO₄ forms along scratched glass lines.',
        inference: 'Group VI present: Magnesium (Mg²⁺).',
        tubeColorHex: '#ffffff',
        precipitateColorHex: '#ffffff',
        precipitateLabel: 'White crystalline Mg(NH₄)PO₄ precipitate',
        chemicalEquation: 'Mg²⁺ + NH₄⁺ + HPO₄²⁻ + OH⁻ ⟶ Mg(NH₄)PO₄·6H₂O(s, white crystalline ppt)',
      };
    }

    case 'cation-confirmatory': {
      if (saltId === 'nh4cl') {
        return {
          testId,
          testName: 'Confirmatory Test for Ammonium (Nessler Reagent)',
          procedure: 'Add alkaline potassium tetraiodomercurate(II) (Nessler’s Reagent) to neutral or alkaline salt solution.',
          observation: 'Deep brown precipitate (Iodide of Millon’s base) forms immediately.',
          inference: 'Confirmed: Ammonium (NH₄⁺) cation.',
          tubeColorHex: '#92400e',
          precipitateColorHex: '#78350f',
          precipitateLabel: 'Brown Millon’s base precipitate',
          chemicalEquation: '2K₂[HgI₄] + NH₃ + 3KOH ⟶ H₂N-Hg-O-Hg-I(s, brown) + 7KI + 2H₂O',
        };
      }
      if (saltId === 'pb-no3-2') {
        return {
          testId,
          testName: 'Confirmatory Test for Lead (Potassium Iodide)',
          procedure: 'Dissolve Group I PbCl₂ precipitate in hot water; divide into two parts. To part 1 add Potassium Iodide (KI).',
          observation: 'Bright golden-yellow precipitate of PbI₂ forms; on boiling and cooling, sparkling golden spangles appear.',
          inference: 'Confirmed: Lead (Pb²⁺) cation.',
          tubeColorHex: '#eab308',
          precipitateColorHex: '#facc15',
          precipitateLabel: 'Golden yellow PbI₂ spangles',
          chemicalEquation: 'Pb²⁺ + 2I⁻ ⟶ PbI₂(s, golden-yellow precipitate)',
        };
      }
      if (saltId === 'cuso4') {
        return {
          testId,
          testName: 'Confirmatory Test for Copper (Excess NH₄OH & K₄[Fe(CN)₆])',
          procedure: 'Dissolve CuS in dil. HNO₃. Add excess ammonium hydroxide NH₄OH.',
          observation: 'Initial pale blue precipitate dissolves completely to yield an intense, deep azure-blue solution.',
          inference: 'Confirmed: Copper (Cu²⁺) as tetraamminecopper(II) complex [Cu(NH₃)₄]²⁺.',
          tubeColorHex: '#1d4ed8',
          chemicalEquation: 'Cu²⁺ + 4NH₄OH ⟶ [Cu(NH₃)₄]²⁺(aq, deep azure blue) + 4H₂O',
        };
      }
      if (saltId === 'feso4') {
        return {
          testId,
          testName: 'Confirmatory Test for Iron(II) (Potassium Ferricyanide)',
          procedure: 'Acidify salt solution with dil. HCl and add Potassium Ferricyanide K₃[Fe(CN)₆] solution.',
          observation: 'Intense deep blue precipitate / coloration (Turnbull’s Blue) forms immediately.',
          inference: 'Confirmed: Iron(II) (Fe²⁺) cation.',
          tubeColorHex: '#1e3a8a',
          precipitateColorHex: '#1e3a8a',
          precipitateLabel: 'Turnbull’s Blue precipitate',
          chemicalEquation: '3Fe²⁺ + 2[Fe(CN)₆]³⁻ ⟶ Fe₃[Fe(CN)₆]₂(s, deep blue Turnbull’s blue)',
        };
      }
      if (saltId === 'fe_po4') {
        return {
          testId,
          testName: 'Confirmatory Test for Iron(III) (Potassium Ferrocyanide)',
          procedure: 'Dissolve Group III precipitate in dil. HCl. Add Potassium Ferrocyanide K₄[Fe(CN)₆] solution.',
          observation: 'Intense Prussian blue precipitate forms immediately.',
          inference: 'Confirmed: Iron(III) (Fe³⁺) cation.',
          tubeColorHex: '#1e3a8a',
          precipitateColorHex: '#172554',
          precipitateLabel: 'Prussian Blue precipitate',
          chemicalEquation: '4Fe³⁺ + 3[Fe(CN)₆]⁴⁻ ⟶ Fe₄[Fe(CN)₆]₃(s, intense Prussian blue)',
        };
      }
      if (saltId === 'alcl3') {
        return {
          testId,
          testName: 'Confirmatory Lake Test for Aluminium',
          procedure: 'Dissolve Al(OH)₃ precipitate in dil. HCl. Add blue litmus solution, then add NH₄OH dropwise along sides.',
          observation: 'A buoyant blue lake (blue precipitate floating on colorless water medium) forms.',
          inference: 'Confirmed: Aluminium (Al³⁺) cation.',
          tubeColorHex: '#2563eb',
          precipitateColorHex: '#3b82f6',
          precipitateLabel: 'Floating blue lake precipitate',
          chemicalEquation: 'Al(OH)₃ adsorbs blue litmus dye in alkaline medium forming the characteristic blue lake',
        };
      }
      if (saltId === 'znso4') {
        return {
          testId,
          testName: 'Confirmatory Test for Zinc (NaOH Precipitation & Dissolution)',
          procedure: 'Add NaOH dropwise to salt solution until in excess.',
          observation: 'White gelatinous precipitate of Zn(OH)₂ forms, which dissolves completely in excess NaOH to form clear zincate.',
          inference: 'Confirmed: Zinc (Zn²⁺) amphoteric cation.',
          tubeColorHex: '#f8fafc',
          chemicalEquation: 'Zn²⁺ + 2OH⁻ ⟶ Zn(OH)₂(s, white ppt); Zn(OH)₂ + 2OH⁻ ⟶ [Zn(OH)₄]²⁻(aq, soluble colorless)',
        };
      }
      if (saltId === 'cacl2' || saltId === 'ca3_po4_2') {
        return {
          testId,
          testName: 'Confirmatory Test for Calcium (Ammonium Oxalate)',
          procedure: 'Dissolve Group V precipitate in hot dilute acetic acid. Add ammonium oxalate solution (NH₄)₂C₂O₄.',
          observation: 'Fine white crystalline precipitate of Calcium Oxalate (CaC₂O₄) forms immediately.',
          inference: 'Confirmed: Calcium (Ca²⁺) cation.',
          tubeColorHex: '#ffffff',
          precipitateColorHex: '#ffffff',
          precipitateLabel: 'White Calcium Oxalate precipitate',
          chemicalEquation: 'Ca²⁺ + C₂O₄²⁻ ⟶ CaC₂O₄(s, white crystalline precipitate)',
        };
      }
      if (saltId === 'ba_cl2') {
        return {
          testId,
          testName: 'Confirmatory Test for Barium (Potassium Chromate)',
          procedure: 'Dissolve Group V BaCO₃ precipitate in warm dil. acetic acid. Add Potassium Chromate (K₂CrO₄) solution.',
          observation: 'Brilliant yellow precipitate of Barium Chromate (BaCrO₄) forms, insoluble in acetic acid.',
          inference: 'Confirmed: Barium (Ba²⁺) cation.',
          tubeColorHex: '#fef08a',
          precipitateColorHex: '#eab308',
          precipitateLabel: 'Yellow BaCrO₄ precipitate',
          chemicalEquation: 'Ba²⁺ + CrO₄²⁻ ⟶ BaCrO₄(s, bright yellow precipitate)',
        };
      }
      // mgso4, mg_c2o4
      return {
        testId,
        testName: 'Confirmatory Test for Magnesium (Magneson Reagent)',
        procedure: 'To salt solution add 2 drops Magneson reagent (p-nitrobenzene azo-resorcinol), then make alkaline with NaOH.',
        observation: 'A striking sky-blue precipitate forms immediately.',
        inference: 'Confirmed: Magnesium (Mg²⁺) cation.',
        tubeColorHex: '#0284c7',
        precipitateColorHex: '#0369a1',
        precipitateLabel: 'Sky blue Magneson precipitate',
        chemicalEquation: 'Mg(OH)₂ forms an adsorption lake with Magneson reagent in basic medium',
      };
    }

    // Class 12 Advanced Diagnostic Tests
    case 'phosphate-molybdate': {
      if (saltId === 'ca3_po4_2' || saltId === 'fe_po4') {
        return {
          testId,
          testName: 'Ammonium Molybdate Test for Phosphate Radical',
          procedure: 'Boil solution with conc. HNO₃. Add excess ammonium molybdate reagent and heat gently to 60°C.',
          observation: 'Copious canary-yellow crystalline precipitate of Ammonium Phosphomolybdate forms.',
          inference: 'Phosphate (PO₄³⁻) present! This radical MUST be eliminated before proceeding to Group III/IV/V.',
          tubeColorHex: '#fef08a',
          precipitateColorHex: '#facc15',
          precipitateLabel: 'Canary-yellow Ammonium Phosphomolybdate',
          chemicalEquation: 'H₃PO₄ + 12(NH₄)₂MoO₄ + 21HNO₃ ⟶ (NH₄)₃[P(Mo₃O₁₀)₄]↓ + 21NH₄NO₃ + 12H₂O',
        };
      }
      return {
        testId,
        testName: 'Ammonium Molybdate Test for Phosphate Radical',
        procedure: 'Boil solution with conc. HNO₃. Add excess ammonium molybdate reagent and heat gently.',
        observation: 'Clear yellow solution without any canary-yellow precipitate.',
        inference: 'Phosphate (PO₄³⁻) ABSENT. No phosphate elimination required.',
        tubeColorHex: '#fef9c3',
        chemicalEquation: 'No reaction: Phosphate radical absent',
      };
    }

    case 'phosphate-elimination': {
      if (saltId === 'ca3_po4_2') {
        return {
          testId,
          testName: 'Phosphate Elimination Protocol (Sodium Acetate - FeCl₃ Method)',
          procedure:
            'Neutralize Group II filtrate with NH₄OH, acidify slightly with dilute acetic acid, add sodium acetate buffer (pH 4.5), and add FeCl₃ solution dropwise until reddish-brown coloration persists. Boil and filter hot.',
          observation:
            'Yellowish-white precipitate of FePO₄ and brown basic ferric acetate precipitates quantitatively. Filtrate tests NEGATIVE for phosphate.',
          inference:
            'Phosphate successfully ELIMINATED! The clear filtrate now contains Calcium (Ca²⁺) ions, ready for systematic Group V precipitation as CaCO₃ without interference.',
          tubeColorHex: '#f8fafc',
          precipitateColorHex: '#a16207',
          precipitateLabel: 'FePO₄ and Basic Ferric Acetate precipitate',
          chemicalEquation:
            'PO₄³⁻ + Fe³⁺ ⟶ FePO₄(s, yellowish-white ppt); Fe³⁺ + 3CH₃COO⁻ + 2H₂O ⟶ Fe(OH)₂(CH₃COO)↓ + 2CH₃COOH',
        };
      }
      if (saltId === 'fe_po4') {
        return {
          testId,
          testName: 'Phosphate Elimination Protocol',
          procedure: 'Analyze iron phosphate system.',
          observation: 'Iron(III) already combines stoichiometrically with phosphate in Group III.',
          inference: 'Fe³⁺ acts as self-eliminator; precipitate is FePO₄.',
          tubeColorHex: '#ca8a04',
          precipitateColorHex: '#854d0e',
          precipitateLabel: 'FePO₄ precipitate',
          chemicalEquation: 'Fe³⁺ + PO₄³⁻ ⟶ FePO₄(s)',
        };
      }
      return {
        testId,
        testName: 'Phosphate Elimination Protocol',
        procedure: 'Phosphate check.',
        observation: 'Phosphate radical is absent from this salt.',
        inference: 'Elimination procedure is NOT required. Proceed directly to systematic group separation.',
        tubeColorHex: '#f8fafc',
        chemicalEquation: 'Phosphate absent; no elimination required',
      };
    }

    case 'oxalate-kmno4': {
      if (saltId === 'mg_c2o4') {
        return {
          testId,
          testName: 'Oxalate Redox Decolorization Test',
          procedure: 'Acidify salt solution with dilute H₂SO₄, warm to 60-70°C, and add KMnO₄ solution dropwise.',
          observation: 'Permanganate pink color is rapidly discharged with continuous effervescence of CO₂ gas bubbles.',
          inference: 'Oxalate (C₂O₄²⁻) interfering radical CONFIRMED. Must be eliminated by repeated conc. HNO₃ oxidation before Group III.',
          tubeColorHex: '#f8fafc',
          gasEvolution: 'CO₂ gas (brisk effervescence)',
          chemicalEquation: '5C₂O₄²⁻ + 2MnO₄⁻ + 16H⁺ --(60°C)--> 2Mn²⁺ + 10CO₂↑ + 8H₂O',
        };
      }
      return {
        testId,
        testName: 'Oxalate Redox Decolorization Test',
        procedure: 'Acidify salt solution with dil. H₂SO₄, warm to 60°C, add KMnO₄.',
        observation: 'Permanganate pink/purple color remains unchanged; no gas evolution.',
        inference: 'Oxalate (C₂O₄²⁻) ABSENT.',
        tubeColorHex: '#f472b6',
        chemicalEquation: 'No redox reaction; oxalic radical absent',
      };
    }
  }
}
