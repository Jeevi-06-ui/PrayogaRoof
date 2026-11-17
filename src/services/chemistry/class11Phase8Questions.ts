import { ConceptualQuestion } from '../circuit/types';

export const CHEMICAL_EQUILIBRIUM_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'eq-q1',
    experimentId: 'chemical-equilibrium',
    question:
      'In the reversible equilibrium Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq), what is the immediate effect of adding excess potassium thiocyanate (KSCN)?',
    options: [
      'Equilibrium shifts forward, intensifying the blood-red color',
      'Equilibrium shifts in reverse, completely bleaching the solution',
      'The value of the equilibrium constant Kc increases dramatically',
      'Precipitation of insoluble Fe(OH)₃ occurs instantly',
    ],
    correctIndex: 0,
    explanation:
      'According to Le Chatelier’s principle, increasing reactant concentration (SCN⁻) lowers the reaction quotient Q below Kc. To re-establish equilibrium, the system consumes the added reactant by shifting forward, forming more blood-red [Fe(SCN)]²⁺ complex.',
  },
  {
    id: 'eq-q2',
    experimentId: 'chemical-equilibrium',
    question:
      'Why does adding sodium fluoride (NaF) cause the blood-red [Fe(SCN)]²⁺ solution to turn straw-yellow or colorless?',
    options: [
      'F⁻ ions selectively sequester Fe³⁺ into the ultra-stable, colorless [FeF₆]³⁻ complex, driving the equilibrium in reverse',
      'F⁻ acts as a powerful reducing agent reducing Fe³⁺ to metallic iron',
      'Fluoride ions react directly with thiocyanate to form cyanogen gas',
      'F⁻ neutralizes the hydronium ions raising pH above 12',
    ],
    correctIndex: 0,
    explanation:
      'Fluoride forms the exceptionally stable hexafluoroferrate(III) complex [FeF₆]³⁻ (formation constant Kf ~ 10¹⁵). This dramatically depletes free Fe³⁺ ions in solution, forcing [Fe(SCN)]²⁺ to dissociate in reverse by Le Chatelier’s principle.',
  },
  {
    id: 'eq-q3',
    experimentId: 'chemical-equilibrium',
    question:
      'For an exothermic reversible reaction such as Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺ (ΔH° = -24.2 kJ/mol), what does the van ’t Hoff equation predict when temperature is increased?',
    options: [
      'Kc decreases and the equilibrium shifts in the endothermic reverse direction',
      'Kc increases and the equilibrium shifts in the forward direction',
      'Kc remains strictly invariant at all temperatures',
      'The reaction becomes irreversible and complete',
    ],
    correctIndex: 0,
    explanation:
      'According to the van ’t Hoff relationship ln(K₂/K₁) = (-ΔH°/R)(1/T₂ - 1/T₁), heating an exothermic system (ΔH° < 0) decreases the equilibrium constant Kc and shifts the position of equilibrium in the endothermic reverse direction.',
  },
  {
    id: 'eq-q4',
    experimentId: 'chemical-equilibrium',
    question:
      'In the gaseous equilibrium 2 NO₂(g, reddish-brown) ⇌ N₂O₄(g, colorless), what happens to the color when the volume of the syringe cylinder is compressed?',
    options: [
      'The system shifts forward toward N₂O₄ (fewer gas moles), lightening the amber color at new equilibrium',
      'The system shifts in reverse producing more NO₂ gas',
      'The equilibrium constant Kp quadruples',
      'All NO₂ instantly condenses into solid nitrogen',
    ],
    correctIndex: 0,
    explanation:
      'Compressing the gas volume increases total pressure. By Le Chatelier’s principle, the system shifts toward the side with fewer stoichiometric moles of gas (2 mol NO₂ ⟶ 1 mol N₂O₄), favoring colorless N₂O₄.',
  },
];

export const STANDARD_SOLUTION_PREP_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'std-q1',
    experimentId: 'standard-solution-prep',
    question:
      'Why is oxalic acid dihydrate (H₂C₂O₄·2H₂O) classified as an ideal primary standard solute?',
    options: [
      'It is obtainable in ultra-pure crystalline form, has high molar mass, and is non-hygroscopic and stable in air',
      'It is a liquid that dissolves instantaneously without weighing',
      'It is a monoprotic acid that reacts violently with water',
      'It reacts directly with atmospheric carbon dioxide',
    ],
    correctIndex: 0,
    explanation:
      'A primary standard must possess high chemical purity (≥ 99.9%), definite known composition, stability against air oxidation and moisture absorption, and high equivalent weight to minimize weighing errors.',
  },
  {
    id: 'std-q2',
    experimentId: 'standard-solution-prep',
    question:
      'What exact mass of pure oxalic acid dihydrate (Mw = 126.07 g/mol) is required to prepare 250.0 mL of a 0.100 M standard solution?',
    options: [
      '3.152 g',
      '1.576 g',
      '6.304 g',
      '12.607 g',
    ],
    correctIndex: 0,
    explanation:
      'Applying the standard analytical formula: mass w = (M · Mw · V) / 1000 = (0.100 × 126.07 × 250.0) / 1000 = 3.15175 g ≈ 3.152 g.',
  },
  {
    id: 'std-q3',
    experimentId: 'standard-solution-prep',
    question:
      'When making up the volume in a volumetric flask with a colorless aqueous solution, how should the liquid meniscus be aligned with the calibration mark?',
    options: [
      'The bottom (lowest point) of the curved concave meniscus must be exactly tangent to the etched graduation ring viewed at eye level',
      'The top upper edges of the liquid meniscus must align with the ring',
      'The liquid level should be 1 cm above the etched mark to allow for evaporation',
      'Parallax angle of 45° from above should be maintained',
    ],
    correctIndex: 0,
    explanation:
      'For transparent wetting liquids in glass, surface tension creates a concave meniscus. The true calibrated volume is defined when the bottom of this concave curve lies exactly tangent to the horizontal graduation mark viewed at eye level to eliminate parallax error.',
  },
  {
    id: 'std-q4',
    experimentId: 'standard-solution-prep',
    question:
      'Why must a freshly prepared standard solution in a volumetric flask be inverted repeatedly after fitting the stopper?',
    options: [
      'To overcome density stratification and achieve complete homogeneous concentration throughout the flask',
      'To dissolve trapped air bubbles from the neck',
      'To increase the temperature of the solution by frictional agitation',
      'To calibrate the graduation line for thermal expansion',
    ],
    correctIndex: 0,
    explanation:
      'When distilled water is added to the neck during final dilution, the upper layer is less concentrated than the lower dense solution. Thorough inversion (at least 10 times) ensures homogeneous diffusion throughout the 250 mL volume.',
  },
];

export const ACID_BASE_TITRATION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'tit-q1',
    experimentId: 'acid-base-titration',
    question:
      'In the quantitative titration of standard oxalic acid against sodium hydroxide: H₂C₂O₄ + 2 NaOH ⟶ Na₂C₂O₄ + 2 H₂O, what is the stoichiometric equivalence relationship?',
    options: [
      '2 · Ma · Va = Mb · Vb',
      'Ma · Va = 2 · Mb · Vb',
      'Ma · Va = Mb · Vb',
      'Ma · Vb = Mb · Va',
    ],
    correctIndex: 0,
    explanation:
      'Because oxalic acid is a diprotic acid (basicity = 2), 1 mole of acid reacts with 2 moles of sodium hydroxide. Hence: (Ma · Va) / 1 = (Mb · Vb) / 2  ==>  2 · Ma · Va = Mb · Vb.',
  },
  {
    id: 'tit-q2',
    experimentId: 'acid-base-titration',
    question:
      'Why is phenolphthalein the preferred indicator for titrating oxalic acid (weak acid) against sodium hydroxide (strong base)?',
    options: [
      'The equivalence point pH is alkaline (~8.4) due to salt hydrolysis of C₂O₄²⁻, falling within phenolphthalein’s transition range (8.3 to 10.0)',
      'Phenolphthalein reacts stoichiometrically with sodium ions',
      'Methyl orange decomposes in the presence of oxalate salts',
      'The equivalence point occurs at pH 3.5 in strong acid medium',
    ],
    correctIndex: 0,
    explanation:
      'Sodium oxalate formed at the equivalence point hydrolyzes: C₂O₄²⁻ + H₂O ⇌ HC₂O₄⁻ + OH⁻, creating a weakly basic solution (pH ~ 8.4). Phenolphthalein changes color sharply from colorless to permanent pale pink exactly in the range pH 8.3–10.0.',
  },
  {
    id: 'tit-q3',
    experimentId: 'acid-base-titration',
    question:
      'What constitutes the correct, rigorous scientific endpoint when using phenolphthalein indicator?',
    options: [
      'Appearance of a faint permanent pale pink coloration that persists for at least 30 seconds upon vigorous swirling',
      'Appearance of an intense dark magenta coloration',
      'The moment the first drop of titrant leaves the burette',
      'Complete decolorization of a pink solution to water white',
    ],
    correctIndex: 0,
    explanation:
      'The true analytical endpoint corresponds to the sharp transition where a single drop of titrant creates a delicate, permanent pale pink tinge that does not disappear upon swirling for 30 seconds. Over-titrating to deep magenta leads to positive volume error.',
  },
  {
    id: 'tit-q4',
    experimentId: 'acid-base-titration',
    question:
      'If 20.0 mL of 0.100 M oxalic acid requires 40.0 mL of NaOH solution for complete neutralization, what is the molarity (M) and strength (g/L) of the NaOH solution?',
    options: [
      'Molarity = 0.100 M; Strength = 4.00 g/L',
      'Molarity = 0.050 M; Strength = 2.00 g/L',
      'Molarity = 0.200 M; Strength = 8.00 g/L',
      'Molarity = 0.100 M; Strength = 40.0 g/L',
    ],
    correctIndex: 0,
    explanation:
      'Mb = (2 · Ma · Va) / Vb = (2 × 0.100 × 20.0) / 40.0 = 0.100 M. Strength = Molarity × Molar Mass(NaOH) = 0.100 M × 40.00 g/mol = 4.00 g/L.',
  },
];

export const SALT_ANALYSIS_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'salt-q1',
    experimentId: 'salt-analysis-class11',
    question:
      'In systematic cation analysis, which group does the ammonium ion (NH₄⁺) belong to, and what reagent identifies it?',
    options: [
      'Zero Group; identified by heating with NaOH to evolve NH₃ gas that turns Nessler’s reagent brown',
      'Group I; precipitated by dilute HCl as white NH₄Cl',
      'Group II; precipitated by H₂S gas in acidic medium',
      'Group VI; precipitated by disodium hydrogen phosphate',
    ],
    correctIndex: 0,
    explanation:
      'NH₄⁺ is classified in Zero Group because it does not precipitate with any standard group reagents (HCl, H₂S, NH₄OH, (NH₄)₂CO₃). Boiling with sodium hydroxide expels pungent NH₃ gas, which gives a brown precipitate of Iodide of Millon’s base with Nessler’s reagent (K₂[HgI₄]).',
  },
  {
    id: 'salt-q2',
    experimentId: 'salt-analysis-class11',
    question:
      'During dry heating and flame testing, a white crystalline salt gives off dense brown fumes (NO₂) and exhibits a dull bluish-white flame. Which salt is indicated?',
    options: [
      'Lead(II) nitrate, Pb(NO₃)₂',
      'Ammonium chloride, NH₄Cl',
      'Calcium chloride, CaCl₂',
      'Copper(II) sulphate, CuSO₄',
    ],
    correctIndex: 0,
    explanation:
      '2 Pb(NO₃)₂(s) ⟶ 2 PbO(s) + 4 NO₂(g, brown) + O₂(g). The pungent brown fumes confirm nitrate (NO₃⁻), while the yellow PbO residue and dull bluish-white flame confirm Lead(II) (Pb²⁺).',
  },
  {
    id: 'salt-q3',
    experimentId: 'salt-analysis-class11',
    question:
      'What confirms the presence of sulphate (SO₄²⁻) when treating an acidified aqueous salt solution with barium chloride (BaCl₂)?',
    options: [
      'A dense white precipitate of BaSO₄ forms that is insoluble even in concentrated HCl',
      'A curdy white precipitate forms that dissolves readily in dilute ammonia',
      'A gelatinous white precipitate forms that dissolves in excess NaOH',
      'A bright golden-yellow precipitate of sparkling spangles forms',
    ],
    correctIndex: 0,
    explanation:
      'Barium sulphate (BaSO₄) has an extremely low solubility product (Ksp ~ 1.1 × 10⁻¹⁰) and is the salt of a strong acid, making the white precipitate completely insoluble in boiling concentrated hydrochloric acid.',
  },
  {
    id: 'salt-q4',
    experimentId: 'salt-analysis-class11',
    question:
      'In the confirmatory test for Copper(II) ions (Cu²⁺), what happens when excess ammonium hydroxide (NH₄OH) is added to the solution?',
    options: [
      'Initial pale blue precipitate dissolves completely to yield an intense, deep azure-blue solution of [Cu(NH₃)₄]²⁺',
      'A black precipitate of CuS forms and settles to the bottom',
      'A bright brick-red precipitate of Cu₂O forms',
      'The solution becomes completely colorless and transparent',
    ],
    correctIndex: 0,
    explanation:
      'Addition of dropwise NH₄OH initially precipitates pale blue Cu(OH)₂. With excess ammonia, the precipitate dissolves forming the soluble tetraamminecopper(II) complex cation: Cu(OH)₂ + 4 NH₃ ⟶ [Cu(NH₃)₄]²⁺ + 2 OH⁻, displaying a deep azure-blue coloration.',
  },
];

export const ORGANIC_ELEMENT_DETECTION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'org-q1',
    experimentId: 'organic-element-detection',
    question:
      'Why must organic compounds undergo sodium fusion (Lassaigne’s test) before testing for extra elements (N, S, Halogens)?',
    options: [
      'Extra elements are covalently bound in organic molecules and must be converted into water-soluble ionic sodium salts (NaCN, Na₂S, NaX)',
      'Sodium acts as an acid catalyst for esterification reactions',
      'Organic compounds do not dissolve in water without sodium oxidation',
      'To vaporize all carbon and hydrogen atoms into methane gas',
    ],
    correctIndex: 0,
    explanation:
      'Covalent bonds in organic molecules do not ionize in aqueous solution. Fusion with strongly electropositive metallic sodium breaks covalent bonds and converts the elements into simple ionic salts: Na + C + N ⟶ NaCN; 2 Na + S ⟶ Na₂S; Na + X ⟶ NaX.',
  },
  {
    id: 'org-q2',
    experimentId: 'organic-element-detection',
    question:
      'In the test for Nitrogen, what is the chemical formula of the brilliant Prussian Blue precipitate formed when acidified Lassaigne extract reacts with iron salts?',
    options: [
      'Fe₄[Fe(CN)₆]₃ (Iron(III) hexacyanoferrate(II))',
      'K₃[Fe(CN)₆] (Potassium ferricyanide)',
      'Na₂[Fe(CN)₅NO] (Sodium nitroprusside)',
      'Fe(SCN)₃ (Iron thiocyanate)',
    ],
    correctIndex: 0,
    explanation:
      'Sodium cyanide reacts with FeSO₄ in alkali to form sodium ferrocyanide Na₄[Fe(CN)₆]. Upon acidification with H₂SO₄ and addition of FeCl₃, intense Prussian Blue precipitate Fe₄[Fe(CN)₆]₃ precipitates.',
  },
  {
    id: 'org-q3',
    experimentId: 'organic-element-detection',
    question:
      'When Sodium Nitroprusside solution is added to a Lassaigne filtrate containing Sulphur, what diagnostic color is observed?',
    options: [
      'Brilliant, intense purple / violet coloration ([Fe(CN)₅NOS]⁴⁻)',
      'Bright canary yellow precipitate',
      'Blood-red solution',
      'Emerald green coloration',
    ],
    correctIndex: 0,
    explanation:
      'Sulphide ions react with sodium nitroprusside to form the characteristic purple/violet thionitroprusside complex anion: Na₂S + Na₂[Fe(CN)₅NO] ⟶ Na₄[Fe(CN)₅NOS].',
  },
  {
    id: 'org-q4',
    experimentId: 'organic-element-detection',
    question:
      'How does the silver nitrate test distinguish between Chlorine, Bromine, and Iodine in the acidified Lassaigne extract?',
    options: [
      'Cl gives white AgCl (soluble in NH₄OH); Br gives pale yellow AgBr (sparingly soluble); I gives yellow AgI (insoluble in NH₄OH)',
      'Cl gives red precipitate; Br gives blue; I gives green',
      'All three give white precipitates with identical solubilities',
      'Halogens only react with silver in the presence of concentrated sulphuric acid',
    ],
    correctIndex: 0,
    explanation:
      'Silver halides exhibit distinct colors and lattice energies: AgCl is curdy white and completely soluble in dilute NH₄OH; AgBr is pale yellow and sparingly soluble in NH₄OH; AgI is bright canary yellow and totally insoluble in NH₄OH.',
  },
];
