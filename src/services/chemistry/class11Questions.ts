import { ConceptualQuestion } from '../circuit/types';

export const BASIC_LAB_TECHNIQUES_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'blt-q1',
    experimentId: 'basic-lab-techniques',
    question: 'Why must the lowest point of a concave meniscus be read at eye level when measuring water in a graduated cylinder?',
    options: [
      'To prevent parallax error, which falsely inflates or depresses the apparent volumetric reading',
      'Because liquid water expands when viewed from above',
      'Because glass refines and magnifies the upper surface boundary',
      'To verify the chemical purity and boiling point of the water sample',
    ],
    correctIndex: 0,
    explanation:
      'Parallax error occurs when the observer’s line of sight is not horizontal with the meniscus level. Because water wets glass, adhesive forces produce a concave meniscus; aligning the eye with the lowest tangent point ensures true volumetric measurement.',
  },
  {
    id: 'blt-q2',
    experimentId: 'basic-lab-techniques',
    question: 'What is the fundamental purpose of pressing the "Tare" button on an electronic analytical balance?',
    options: [
      'To zero the display with the container (e.g., watch glass) on the pan, ensuring subsequent readings display only the net sample mass',
      'To reset the electrical mains voltage supply to zero',
      'To convert mass units from grams to ounces automatically',
      'To calibrate the draft shield air pressure inside the weighing compartment',
    ],
    correctIndex: 0,
    explanation:
      'Taring subtracts the tare weight (mass of the empty container or weighing boat) from total gross weight. The display reads 0.000 g so that any added chemical substance is directly measured as net mass.',
  },
  {
    id: 'blt-q3',
    experimentId: 'basic-lab-techniques',
    question: 'In quantitative analytical chemistry, how does "TD" (To Deliver) glassware like a burette differ from "TC" (To Contain) glassware like a volumetric flask?',
    options: [
      'TD glassware is calibrated to deliver the exact indicated volume allowing for film drainage, whereas TC glassware holds the exact volume without compensating for liquid clinging to walls upon pouring',
      'TD glassware is heat-resistant while TC glassware cannot be heated',
      'TD glassware is only used for non-polar organic solvents',
      'TC glassware is exclusively made of plastic polymers',
    ],
    correctIndex: 0,
    explanation:
      'Burettes and volumetric pipettes are marked "TD" (Ex) because their scale accounts for the capillary droplet and liquid film that remains adhering to internal glass surfaces after dispensing. Volumetric flasks are marked "TC" (In) because they are meant to contain the exact nominal solution volume.',
  },
  {
    id: 'blt-q4',
    experimentId: 'basic-lab-techniques',
    question: 'Why should warm or freshly heated vessels never be weighed directly on an analytical balance?',
    options: [
      'Convection air currents generated around warm vessels produce upward buoyant forces, causing falsely low and fluctuating mass readings',
      'The electronic load cell permanently demagnetizes at temperatures above 30°C',
      'Warm glass becomes porous and absorbs atmospheric nitrogen gas',
      'The watch glass immediately shatters due to thermal shock',
    ],
    correctIndex: 0,
    explanation:
      'Warm objects warm the surrounding air inside the closed balance cabinet. The rising convection currents exert an upward aerodynamic force on the weighing pan, making the sample appear lighter than its true static mass.',
  },
];

export const MELTING_POINT_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'mp-q1',
    experimentId: 'melting-point',
    question: 'What is the characteristic feature of the melting point of a pure crystalline organic compound?',
    options: [
      'It melts sharply over a very narrow temperature range (typically 0.5°C to 1.0°C)',
      'It melts continuously over a broad range of 15°C to 20°C',
      'It decomposes into elemental carbon before any liquid phase forms',
      'Its melting temperature increases with every repeated trial',
    ],
    correctIndex: 0,
    explanation:
      'Pure crystalline solids possess an orderly lattice where all intermolecular bonds require identical thermal vibrational energy to break. Consequently, phase transition occurs sharply within a 0.5 - 1.0°C span.',
  },
  {
    id: 'mp-q2',
    experimentId: 'melting-point',
    question: 'How does the presence of a soluble foreign impurity affect the melting point behavior of an organic solid?',
    options: [
      'It depresses the melting onset temperature and broadens the overall melting range',
      'It elevates the melting point to a significantly higher temperature',
      'It eliminates the liquid phase, causing immediate sublimation',
      'It has zero thermodynamic effect on the phase transition',
    ],
    correctIndex: 0,
    explanation:
      'Foreign solute molecules disrupt the regular periodic lattice of the crystal host, weakening lattice stability. According to colligative melting point depression (ΔTf = Kf · m), liquefaction begins at a lower temperature and spans an extended range.',
  },
  {
    id: 'mp-q3',
    experimentId: 'melting-point',
    question: 'Why is heat applied specifically to the triangular side-arm of a Thiele tube rather than directly below the thermometer bulb?',
    options: [
      'Heating the side-arm generates natural convective circulation currents of liquid paraffin, ensuring uniform bath temperature without mechanical stirring',
      'To prevent the Bunsen flame from igniting the sample capillary directly',
      'Because liquid paraffin only conducts heat in the horizontal direction',
      'To concentrate thermal radiation away from the thermometer glass stem',
    ],
    correctIndex: 0,
    explanation:
      'As oil in the triangular side arm warms, its density decreases. The buoyant warm fluid rises along the upper bend while cooler denser oil enters from the bottom, driving a steady convective loop that maintains homogeneous temperature throughout the central tube.',
  },
  {
    id: 'mp-q4',
    experimentId: 'melting-point',
    question: 'Pure Benzoic Acid has a standard melting point of 122.4°C. A student measures an unknown white powder that melts between 114.5°C and 119.0°C. What does this indicate?',
    options: [
      'The sample is impure benzoic acid contaminated with foreign substances',
      'The sample is pure urea crystal',
      'The thermometer calibration has a systematic error of +10°C',
      'The compound is completely insoluble in organic solvents',
    ],
    correctIndex: 0,
    explanation:
      'A depressed onset (~114.5°C vs 122.4°C) combined with a wide 4.5°C melting span is the textbook signature of an impure organic solid containing foreign contaminants (such as cinnamic acid or synthetic side-products).',
  },
];

export const BOILING_POINT_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'bp-q1',
    experimentId: 'boiling-point',
    question: 'At the fundamental thermodynamic level, when does a liquid reach its boiling point?',
    options: [
      'When its saturated vapor pressure equals the prevailing external atmospheric pressure (P_vap = P_atm)',
      'When all dissolved air bubbles have been completely expelled from the liquid',
      'When the liquid temperature exceeds 100°C regardless of barometric pressure',
      'When surface tension becomes infinitely large',
    ],
    correctIndex: 0,
    explanation:
      'Boiling occurs when thermal kinetic energy enables vapor bubbles to form within the bulk liquid without being crushed by external pressure. This condition is met when P_vap(T) = P_atm.',
  },
  {
    id: 'bp-q2',
    experimentId: 'boiling-point',
    question: 'In Siwoloboff’s micro-method using an inverted capillary tube, what physical observation signifies that the true boiling point has been reached upon cooling?',
    options: [
      'The instant the rapid continuous stream of vapor bubbles stops and liquid abruptly rushes up into the capillary bore',
      'When the first occasional air bubble detaches from the capillary tip',
      'When the entire liquid sample completely evaporates from the fusion tube',
      'When the liquid turns completely solid inside the tube',
    ],
    correctIndex: 0,
    explanation:
      'During boiling, continuous vapor stream exits the capillary. The moment the flame is removed and temperature drops by even 0.1°C, vapor inside the capillary condenses so P_vap < P_atm. Atmospheric pressure forcefully pushes liquid into the capillary, marking the exact boiling temperature.',
  },
  {
    id: 'bp-q3',
    experimentId: 'boiling-point',
    question: 'How does high altitude (reduced atmospheric pressure) influence the measured boiling point of pure ethanol (normal b.p. 78.3°C at 101.3 kPa)?',
    options: [
      'The boiling point decreases because vapor pressure equals the lower atmospheric pressure at a lower temperature',
      'The boiling point increases due to reduced atmospheric cooling',
      'The boiling point remains exactly 78.3°C because chemical bonds do not change',
      'The liquid freezes instead of boiling',
    ],
    correctIndex: 0,
    explanation:
      'By the Clausius-Clapeyron equation, lower ambient pressure requires a lower saturated vapor pressure for equilibrium. Consequently, liquids boil at lower temperatures in mountainous or low-pressure environments.',
  },
  {
    id: 'bp-q4',
    experimentId: 'boiling-point',
    question: 'Why should volatile and flammable liquids like acetone (b.p. 56.1°C) or ethanol (b.p. 78.3°C) never be heated directly over an open naked flame?',
    options: [
      'Their vapors are highly flammable and direct flame exposure creates severe fire and explosion risks; an indirect heating bath must be used',
      'Direct heat causes immediate irreversible ionization into free radicals',
      'Open flame causes rapid glass crystallization of the test tube',
      'Their boiling point increases to over 300°C under direct heating',
    ],
    correctIndex: 0,
    explanation:
      'Low-boiling organic solvents form flammable vapor clouds above the tube opening. Naked flames can ignite these vapors. An indirect water or oil bath distributes heat safely below auto-ignition thresholds.',
  },
];

export const CRYSTALLISATION_CLASS11_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'crys11-q1',
    experimentId: 'crystallisation-class11',
    question: 'What is the primary thermodynamic criterion for choosing a suitable recrystallisation solvent to purify an impure organic solid?',
    options: [
      'The solute must have high solubility at boiling temperature but low solubility at room/ice temperature',
      'The solute must be equally soluble at all temperatures to prevent precipitation',
      'The solvent must react chemically with the solute to form a complex',
      'The solvent must have a boiling point above 250°C',
    ],
    correctIndex: 0,
    explanation:
      'Recrystallisation depends on a steep temperature-dependent solubility gradient. High hot solubility allows concentrated dissolution in minimal solvent; low cold solubility ensures maximum precipitation of pure crystals on cooling.',
  },
  {
    id: 'crys11-q2',
    experimentId: 'crystallisation-class11',
    question: 'Why is hot gravity filtration performed rapidly using fluted filter paper rather than ordinary conical folding?',
    options: [
      'Fluted paper maximizes filtration surface area and creates air channels, accelerating flow before premature cooling crystallizes solute in the funnel',
      'Fluted paper chemically absorbs heavy metals and soluble color impurities',
      'Conical folding always tears under hot aqueous solutions',
      'Fluted paper eliminates the need for glass funnels',
    ],
    correctIndex: 0,
    explanation:
      'Hot solutions cool quickly upon contact with cold glassware. Fluted filter paper increases filtration velocity by ~3×, ensuring insoluble sand and charcoal grit are filtered off before the solution cools and clogs the pores with premature crystals.',
  },
  {
    id: 'crys11-q3',
    experimentId: 'crystallisation-class11',
    question: 'A student starts with 20.0 g of crude impure benzoic acid and harvests 16.4 g of pure dry recrystallised crystals. What is the percentage recovery yield?',
    options: [
      '82.0%',
      '16.4%',
      '36.4%',
      '121.9%',
    ],
    correctIndex: 0,
    explanation:
      'Percentage Recovery Yield = (Mass of pure dry crystals obtained / Initial mass of impure sample) × 100% = (16.4 g / 20.0 g) × 100% = 82.0%.',
  },
  {
    id: 'crys11-q4',
    experimentId: 'crystallisation-class11',
    question: 'Why must a hot concentrated solution be allowed to cool slowly and undisturbed rather than being rapidly agitated or flash-frozen?',
    options: [
      'Slow undisturbed cooling favors orderly crystal lattice growth and excludes impurity molecules from the crystal matrix',
      'Rapid agitation evaporates all solvent, preventing crystal nucleation',
      'Disturbance causes the solute to chemically decompose into carbon dioxide',
      'Slow cooling increases the final mass beyond theoretical stoichiometry',
    ],
    correctIndex: 0,
    explanation:
      'Slow cooling produces large, well-defined pure crystals. Fast shock cooling causes rapid micro-nucleation that occludes (traps) mother liquor and soluble foreign impurities inside the crystalline crevices.',
  },
];

export const PH_DETERMINATION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'phd-q1',
    experimentId: 'ph-determination',
    question: 'A 0.1M aqueous solution of Ammonium Chloride (NH₄Cl) is tested with Universal Indicator. Why does it turn yellow-orange indicating an acidic pH (~5.1)?',
    options: [
      'NH₄⁺ is the conjugate acid of weak base NH₃; it undergoes cation hydrolysis releasing hydronium ions: NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺',
      'Chloride ions react with water to form excess hydroxide ions',
      'Ammonium chloride contains free dissolved hydrochloric acid gas',
      'Ammonium chloride is a non-polar covalent molecule that repels water',
    ],
    correctIndex: 0,
    explanation:
      'Ammonium chloride is the salt of a weak base (NH₄OH) and strong acid (HCl). The NH₄⁺ cation undergoes hydrolysis: NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺, lowering pH to ~5.13.',
  },
  {
    id: 'phd-q2',
    experimentId: 'ph-determination',
    question: 'Why does an equimolar 0.1M solution of Sodium Acetate (CH₃COONa) exhibit a basic pH (~8.9)?',
    options: [
      'CH₃COO⁻ is the conjugate base of weak acetic acid; it hydrolyzes generating hydroxide ions: CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻',
      'Sodium cations react violently with water releasing hydrogen gas',
      'Acetate ions decompose into carbonate and hydroxide ions at room temperature',
      'Sodium acetate is an amphoteric buffer with pH fixed at 7.00',
    ],
    correctIndex: 0,
    explanation:
      'Sodium acetate is formed from weak acid (CH₃COOH) and strong base (NaOH). Acetate anions hydrolyze: CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻, creating excess OH⁻ and alkaline pH ~8.87.',
  },
  {
    id: 'phd-q3',
    experimentId: 'ph-determination',
    question: 'An acetate buffer consists of equimolar 0.1M CH₃COOH and 0.1M CH₃COONa (pKa = 4.74). According to the Henderson-Hasselbalch equation, what is its equilibrium pH?',
    options: [
      'pH = 4.74, because log([CH₃COO⁻]/[CH₃COOH]) = log(1) = 0',
      'pH = 7.00, because the acid and salt neutralize each other completely',
      'pH = 1.00, because acetic acid is a carboxylic acid',
      'pH = 13.00, because sodium is an alkali metal',
    ],
    correctIndex: 0,
    explanation:
      'Henderson-Hasselbalch equation: pH = pKa + log([Conjugate Base]/[Weak Acid]). For equimolar concentrations (0.1M / 0.1M), the ratio is 1 and log(1) = 0, so pH = pKa = 4.74.',
  },
  {
    id: 'phd-q4',
    experimentId: 'ph-determination',
    question: 'Natural fruit juices like fresh orange juice and tomato juice test acidic (pH ~3.6 and ~4.3). What primary chemical species causes this acidity?',
    options: [
      'Naturally occurring organic carboxylic acids (predominantly citric, malic, and ascorbic acids)',
      'Dissolved mineral hydrochloric acid from soil fertilizers',
      'Dissolved sulfur dioxide from acid rain deposition',
      'Phosphoric acid added during virtual packaging',
    ],
    correctIndex: 0,
    explanation:
      'Biological fruit extracts naturally contain organic weak carboxylic acids such as citric acid in citrus (pH 3.5-3.8), malic acid in apples/tomatoes (pH 3.8-4.4), and ascorbic acid (vitamin C).',
  },
];

export const STRONG_VS_WEAK_ACIDS_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'swa-q1',
    experimentId: 'strong-vs-weak-acids',
    question: 'Equimolar solutions (0.10 M) of Hydrochloric Acid (HCl) and Acetic Acid (CH₃COOH) are prepared. How do their hydrogen ion concentrations [H⁺] compare?',
    options: [
      'HCl has ~76× higher [H⁺] concentration (~0.100 M vs ~0.0013 M) because HCl ionises completely while CH₃COOH ionises only ~1.3%',
      'Both solutions have identical [H⁺] because their molar concentrations are both 0.10 M',
      'Acetic acid has higher [H⁺] because it contains 4 hydrogen atoms per molecule',
      'Neither solution contains free [H⁺] ions in aqueous phase',
    ],
    correctIndex: 0,
    explanation:
      'Acid strength measures the extent of dissociation. HCl is a strong acid that ionizes completely (α = 100%, [H⁺] = 0.1 M, pH 1.00). Acetic acid is weak (Ka = 1.75 × 10⁻⁵) and ionizes only ~1.31% ([H⁺] = 0.00131 M, pH 2.88). The ratio is 0.1 / 0.001314 ≈ 76.1×.',
  },
  {
    id: 'swa-q2',
    experimentId: 'strong-vs-weak-acids',
    question: 'According to Ostwald’s Dilution Law, what happens to the degree of dissociation (α) of a weak acid like acetic acid when its concentration is diluted tenfold (from 0.1M to 0.01M)?',
    options: [
      'The degree of dissociation α increases from ~1.3% to ~4.1%',
      'The degree of dissociation α decreases to zero',
      'The degree of dissociation remains completely constant',
      'The acid converts into a strong mineral acid',
    ],
    correctIndex: 0,
    explanation:
      'Ostwald’s Dilution Law states α ≈ √(Ka / C). As concentration C decreases by a factor of 10, α increases by √10 ≈ 3.16× (from 1.31% to 4.10%), demonstrating that dilution favors ionisation equilibrium.',
  },
  {
    id: 'swa-q3',
    experimentId: 'strong-vs-weak-acids',
    question: 'When identical 24.3 mg strips of magnesium ribbon are dropped into 50 mL of 0.1M HCl and 50 mL of 0.1M CH₃COOH, how do their initial bubbling rates compare?',
    options: [
      'HCl produces vigorous, rapid effervescence whereas CH₃COOH produces mild, gentle effervescence',
      'Both acids bubble at the exact same rate because both solutions are 0.1M',
      'Acetic acid bubbles much faster because it has a higher molecular weight',
      'Magnesium only reacts with hydrochloric acid; acetic acid shows zero reaction',
    ],
    correctIndex: 0,
    explanation:
      'The reaction rate Mg(s) + 2H⁺ ⟶ Mg²⁺ + H₂↑ depends directly on the instantaneous concentration of hydronium ions [H⁺]. Because HCl provides 76× higher [H⁺], its initial reaction rate is proportionally faster.',
  },
  {
    id: 'swa-q4',
    experimentId: 'strong-vs-weak-acids',
    question: 'What is the total stoichiometric volume of H₂ gas evolved when 1.0 mmol of Magnesium ribbon completely reacts with excess 0.1M HCl vs 0.1M CH₃COOH?',
    options: [
      'Exactly identical (~24.0 mL at RTP) in both reactions, because total gas yield is governed by stoichiometry (limiting Mg), not acid strength',
      'HCl produces 76 times more hydrogen gas than CH₃COOH',
      'Acetic acid produces twice as much gas because it contains more hydrogen atoms',
      'Zero gas is produced because magnesium dissolves without redox reaction',
    ],
    correctIndex: 0,
    explanation:
      'This highlights the critical pedagogical principle: Acid strength governs the REACTION RATE (initial velocity), while total moles and stoichiometry dictate the ULTIMATE CAPACITY (total H₂ volume). Since Mg is the limiting reactant (1.0 mmol), both acids produce exactly 1.0 mmol H₂ (24.0 mL at RTP).',
  },
];
