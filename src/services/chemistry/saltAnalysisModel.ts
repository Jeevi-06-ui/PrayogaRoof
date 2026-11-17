/**
 * Systematic Qualitative Analysis of Inorganic Salts (Class 11)
 *
 * Systematic Decision Tree:
 * 1. Preliminary / Physical Examination
 * 2. Dry Heating Test
 * 3. Flame Test
 * 4. Dilute H₂SO₄ Test (Anion preliminary)
 * 5. Concentrated H₂SO₄ Test (Anion secondary)
 * 6. Confirmatory Test for Anions (Cl⁻, SO₄²⁻, NO₃⁻, CO₃²⁻)
 * 7. Systematic Cation Group Separation (Zero, I, II, III, IV, V, VI)
 * 8. Confirmatory Wet Tests for Cations
 */

export type SaltSampleId =
  | 'nh4cl'
  | 'pb-no3-2'
  | 'cuso4'
  | 'feso4'
  | 'alcl3'
  | 'znso4'
  | 'cacl2'
  | 'mgso4';

export type SaltTestId =
  | 'physical'
  | 'dry-heating'
  | 'flame-test'
  | 'dilute-acid'
  | 'conc-acid'
  | 'anion-confirmatory'
  | 'cation-group-test'
  | 'cation-confirmatory';

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
          observation: 'White solid sublimes directly, forming dense white deposits on cooler upper walls of tube.',
          inference: 'Sublimation strongly indicates NH₄⁺ salt (Ammonium).',
          tubeColorHex: '#e2e8f0',
          gasEvolution: 'Sublimation white vapor (NH₃ + HCl)',
          chemicalEquation: 'NH₄Cl(s) ⇌ NH₃(g) + HCl(g) [recombining as white sublimate]',
        };
      }
      if (saltId === 'pb-no3-2') {
        return {
          testId,
          testName: 'Dry Heating Test',
          procedure: 'Heat dry sample in a dry test tube over non-luminous flame.',
          observation: 'Decrepitation crackling sound; pungent reddish-brown gas evolved; yellow residue (PbO) remains hot and cold.',
          inference: 'Brown gas indicates Nitrate (NO₃⁻); residue suggests Lead (Pb²⁺).',
          tubeColorHex: '#b45309',
          gasEvolution: 'NO₂ (reddish-brown nitrogen dioxide gas)',
          chemicalEquation: '2Pb(NO₃)₂(s) ⟶ 2PbO(s, yellow) + 4NO₂(g, brown) + O₂(g)',
        };
      }
      if (saltId === 'cuso4') {
        return {
          testId,
          testName: 'Dry Heating Test',
          procedure: 'Gently heat blue crystals in a dry test tube.',
          observation: 'Water droplets condense on the cooler neck; vibrant blue solid turns into anhydrous white powder.',
          inference: 'Presence of water of crystallisation; copper sulphate dehydration.',
          tubeColorHex: '#f8fafc',
          gasEvolution: 'Water vapor condensation',
          chemicalEquation: 'CuSO₄·5H₂O(s, blue) ⟶ CuSO₄(s, white) + 5H₂O(g)',
        };
      }
      return {
        testId,
        testName: 'Dry Heating Test',
        procedure: 'Heat dry sample in a hard glass test tube.',
        observation: 'Water of hydration released forming droplet dew on upper walls; residue remains white without sublimation.',
        inference: 'Hydrated salt; absence of sublimable ammonium salts or nitrate thermal decomposition.',
        tubeColorHex: '#f1f5f9',
        chemicalEquation: 'Hydrated crystal dehydration',
      };
    }

    case 'flame-test': {
      if (saltId === 'cacl2') {
        return {
          testId,
          testName: 'Flame Test (Conc. HCl Paste)',
          procedure: 'Make a thick paste with concentrated HCl on a platinum/nichrome wire loop. Introduce into non-luminous flame.',
          observation: 'Persistent brick-red flame coloration observed (flame turns bright brick red).',
          inference: 'Confirms Calcium (Ca²⁺) cation.',
          tubeColorHex: '#ea580c',
          flameColorHex: '#ef4444',
          chemicalEquation: 'Volatile CaCl₂ produces atomic emission characteristic of Ca²⁺ (brick red at ~622 nm)',
        };
      }
      if (saltId === 'cuso4') {
        return {
          testId,
          testName: 'Flame Test (Conc. HCl Paste)',
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
      if (saltId === 'nh4cl' || saltId === 'alcl3' || saltId === 'cacl2') {
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
      return {
        testId,
        testName: 'Concentrated H₂SO₄ Test',
        procedure: 'Treat dry sample with 1 mL concentrated H₂SO₄ and warm gently.',
        observation: 'No pungent gas, no brown fumes, no violet iodine vapors evolved.',
        inference: 'Absence of Cl⁻, Br⁻, I⁻, NO₃⁻, CH₃COO⁻. Suggests independent radical (SO₄²⁻).',
        tubeColorHex: '#f8fafc',
        chemicalEquation: 'No volatile acid gas displaced by conc. H₂SO₄',
      };
    }

    case 'anion-confirmatory': {
      if (saltId === 'nh4cl' || saltId === 'alcl3' || saltId === 'cacl2') {
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
      if (saltId === 'cacl2') {
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
      // mgso4
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
  }
}
