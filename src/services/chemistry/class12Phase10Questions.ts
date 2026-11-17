import { ConceptualQuestion } from '../circuit/types';

export const INORGANIC_PREPARATION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'inorg-prep-q1',
    experimentId: 'inorganic-compound-prep',
    question:
      'Why is dilute sulphuric acid (H₂SO₄) added while preparing the aqueous solution for Mohr’s salt [FeSO₄·(NH₄)₂SO₄·6H₂O]?',
    options: [
      'To prevent the hydrolytic decomposition and aerial oxidation of Fe²⁺ ions into insoluble basic ferric sulphate',
      'To act as a dehydrating agent that precipitates ammonium sulphate instantly',
      'To change the crystal geometry from monoclinic to cubic',
      'To increase the pH of the solution above 10.0',
    ],
    correctIndex: 0,
    explanation:
      'In neutral aqueous solution, ferrous ions hydrolyze: Fe²⁺ + 2H₂O ⇌ Fe(OH)₂ + 2H⁺. Atmospheric oxygen rapidly oxidizes Fe(OH)₂ into basic ferric sulphate Fe(OH)SO₄ (turbid brown). Adding dilute H₂SO₄ provides excess H⁺ ions, shifting equilibrium to the left and keeping Fe²⁺ stable.',
  },
  {
    id: 'inorg-prep-q2',
    experimentId: 'inorganic-compound-prep',
    question:
      'What is the fundamental structural distinction between a double salt (such as Potash Alum or Mohr’s Salt) and a coordination complex (such as Potassium Ferrocyanide K₄[Fe(CN)₆]) in aqueous solution?',
    options: [
      'Double salts completely dissociate into their individual constituent simple ions in water, whereas complex ions retain their identity without complete dissociation',
      'Double salts always contain covalent bonds, whereas coordination complexes contain only ionic bonds',
      'Double salts are insoluble in water, whereas coordination complexes are highly soluble',
      'Double salts can only be formed by transition elements',
    ],
    correctIndex: 0,
    explanation:
      'A double salt exists as a stoichiometric crystal lattice in the solid state but completely dissociates into individual hydrated ions (K⁺, Al³⁺, SO₄²⁻ or Fe²⁺, NH₄⁺, SO₄²⁻) in aqueous solution. In contrast, coordination complexes contain coordinate covalent bonds that remain intact in water (e.g., [Fe(CN)₆]⁴⁻ does not yield free Fe²⁺ or CN⁻ ions).',
  },
  {
    id: 'inorg-prep-q3',
    experimentId: 'inorganic-compound-prep',
    question:
      'Why should the concentrated hot solution of Mohr’s salt or Potash Alum NOT be cooled rapidly by vigorous stirring or placing directly into freezing water?',
    options: [
      'Rapid cooling causes premature nucleation of microscopic amorphous crusts rather than well-developed, pure monoclinic/octahedral crystals',
      'Rapid cooling decomposes the sulphate radical into sulphur dioxide gas',
      'Sudden cooling causes the water of crystallisation to evaporate violently',
      'Rapid cooling transforms the double salt into an unstable explosive peroxide',
    ],
    correctIndex: 0,
    explanation:
      'Slow, undisturbed cooling allows solute molecules to arrange themselves systematically into the thermodynamic equilibrium crystal lattice, producing large, well-defined monoclinic prisms (Mohr’s salt) or sparkling octahedra (Potash alum) free of trapped mother liquor impurities.',
  },
  {
    id: 'inorg-prep-q4',
    experimentId: 'inorganic-compound-prep',
    question:
      'In the preparation of Potash Alum [K₂SO₄·Al₂(SO₄)₃·24H₂O], how many moles of water of crystallisation are incorporated per formula unit of the double salt?',
    options: [
      '24 moles of H₂O',
      '12 moles of H₂O',
      '6 moles of H₂O',
      '18 moles of H₂O',
    ],
    correctIndex: 0,
    explanation:
      'The stoichiometric formula of Potash Alum is K₂SO₄·Al₂(SO₄)₃·24H₂O (often written as KAl(SO₄)₂·12H₂O in semi-empirical form). Six water molecules coordinate with K⁺ and six coordinate with each Al³⁺, forming a 24-hydrate lattice.',
  },
];

export const ORGANIC_PREPARATION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'org-prep-q1',
    experimentId: 'organic-compound-prep',
    question:
      'In the preparation of Acetanilide from aniline, why is zinc dust added during the heating/refluxing of aniline with acetic anhydride and glacial acetic acid?',
    options: [
      'Zinc acts as a reducing agent to prevent aerial oxidation of aniline to dark, colored quinone derivatives',
      'Zinc catalyzes the esterification of acetic acid into ethyl acetate',
      'Zinc neutralizes the acetic acid to form zinc acetate buffer',
      'Zinc increases the boiling point of the mixture by 50°C',
    ],
    correctIndex: 0,
    explanation:
      'Aniline is extremely prone to atmospheric aerial oxidation, which produces colored impurities (p-benzoquinone, aminophenols, and azo dyes). Zinc dust reduces colored oxidation products back to colorless species and keeps the aniline pure, ensuring snow-white glistening acetanilide crystals.',
  },
  {
    id: 'org-prep-q2',
    experimentId: 'organic-compound-prep',
    question:
      'What type of organic reaction takes place during the synthesis of Dibenzalacetone from benzaldehyde and acetone in the presence of dilute sodium hydroxide?',
    options: [
      'Crossed Aldol Condensation (Claisen-Schmidt reaction) followed by dehydration',
      'Electrophilic aromatic substitution (Friedel-Crafts acylation)',
      'Nucleophilic aliphatic substitution (SN2)',
      'Pinacol-pinacolone molecular rearrangement',
    ],
    correctIndex: 0,
    explanation:
      'Dibenzalacetone synthesis is a classic Claisen-Schmidt crossed aldol condensation: non-enolizable benzaldehyde reacts with enolizable acetone in the presence of base (NaOH). Two successive aldol addition-dehydration steps yield the yellow α,β-unsaturated ketone C₆H₅-CH=CH-CO-CH=CH-C₆H₅.',
  },
  {
    id: 'org-prep-q3',
    experimentId: 'organic-compound-prep',
    question:
      'Why is Acetanilide recrystallized from hot water rather than an organic solvent like ether or acetone?',
    options: [
      'Acetanilide is sparingly soluble in cold water but highly soluble in boiling water, enabling high recovery and efficient purification',
      'Acetanilide decomposes into aniline and acetic acid when heated in organic solvents',
      'Water reacts chemically with acetanilide to form insoluble hydrate crystals',
      'Organic solvents lower the melting point of acetanilide to below 0°C',
    ],
    correctIndex: 0,
    explanation:
      'An ideal recrystallization solvent dissolves minimal solute at low temperatures and maximum solute near its boiling point. Acetanilide dissolves at ~5.5 g/100 mL boiling water (100°C) but only ~0.5 g/100 mL cold water (20°C), giving sharp, glistening leaflets with >85% crystal recovery.',
  },
  {
    id: 'org-prep-q4',
    experimentId: 'organic-compound-prep',
    question:
      'What is the literature melting point of pure dry Acetanilide, and how does the presence of an impurity affect this value?',
    options: [
      '114°C; impurities lower the melting point and broaden the melting temperature range',
      '140°C; impurities sharpen the melting point to an exact single temperature',
      '78°C; impurities raise the melting point due to hydrogen bonding',
      '212°C; impurities have no effect on melting points of crystalline solids',
    ],
    correctIndex: 0,
    explanation:
      'Pure Acetanilide melts sharply at 113–114°C. According to colligative melting-point depression principles, any soluble impurity disrupts crystal lattice packing, depressing the observed melting point and causing it to melt over a broad range (e.g. 106–111°C).',
  },
];

export const FUNCTIONAL_GROUP_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'fg-q1',
    experimentId: 'functional-group-identification',
    question:
      'How does the reaction of Phenol with neutral ferric chloride (FeCl₃) differ from that of an aliphatic alcohol like Ethanol?',
    options: [
      'Phenol forms an intense violet/purple coordination complex [Fe(OC₆H₅)₆]³⁻, whereas ethanol produces no characteristic color change',
      'Ethanol forms a dark violet precipitate, whereas phenol forms a colorless gas',
      'Both phenol and ethanol produce a canary yellow precipitate',
      'Phenol reduces FeCl₃ to metallic iron mirror on the test tube walls',
    ],
    correctIndex: 0,
    explanation:
      'Phenols contain an enolic/aryl hydroxyl group directly attached to an sp² aromatic carbon, forming highly colored coordination complexes (intense violet/purple [Fe(OC₆H₅)₆]³⁻) with neutral FeCl₃. Simple aliphatic alcohols lack this enolic coordination ability and give no color change.',
  },
  {
    id: 'fg-q2',
    experimentId: 'functional-group-identification',
    question:
      'Why does Benzaldehyde give a positive Tollens’ silver mirror test but a negative (or very sluggish) Fehling’s test?',
    options: [
      'Aromatic aldehydes are weaker reducing agents than aliphatic aldehydes and cannot reduce the weaker Cu²⁺ tartrate complex in Fehling solution, but are oxidized by stronger Tollens [Ag(NH₃)₂]⁺',
      'Benzaldehyde does not contain a carbonyl group (-CHO)',
      'Fehling solution oxidizes the benzene ring instead of the aldehyde group',
      'Benzaldehyde is a ketone and therefore resists both reagents',
    ],
    correctIndex: 0,
    explanation:
      'Fehling’s reagent is a weaker oxidizing agent (Cu²⁺/Cu₂O, E° = +0.15 V in alkali) than Tollens’ reagent (Ag⁺/Ag, E° = +0.80 V). The electron-donating resonance of the aromatic phenyl ring stabilizes the carbonyl carbon in benzaldehyde, making it less electrophilic and resistant to Fehling oxidation, though it easily reduces ammoniacal silver nitrate.',
  },
  {
    id: 'fg-q3',
    experimentId: 'functional-group-identification',
    question:
      'Why does Benzoic acid give brisk effervescence with saturated aqueous Sodium Bicarbonate (NaHCO₃), while Phenol does NOT?',
    options: [
      'Benzoic acid (pKa ≈ 4.2) is stronger than carbonic acid H₂CO₃ (pKa ≈ 6.37), whereas phenol (pKa ≈ 10.0) is much weaker and cannot liberate CO₂',
      'Phenol is insoluble in water and cannot touch bicarbonate ions',
      'Sodium bicarbonate decomposes phenol into poisonous carbon monoxide gas',
      'Benzoic acid contains active nitrogen that hydrolyzes bicarbonate',
    ],
    correctIndex: 0,
    explanation:
      'An acid can decompose bicarbonate to release CO₂ only if its conjugate pKa is lower than that of carbonic acid (H₂CO₃ ⇌ H₂O + CO₂, pKa1 = 6.37). Benzoic acid (pKa = 4.2) displaces CO₂: C₆H₅COOH + NaHCO₃ ⟶ C₆H₅COONa + H₂O + CO₂↑. Phenol (pKa = 9.95) is vastly weaker and cannot decompose NaHCO₃.',
  },
  {
    id: 'fg-q4',
    experimentId: 'functional-group-identification',
    question:
      'In the Azo Dye test for primary aromatic amines (such as Aniline), why must the diazotization step be carried out in an ice-salt bath strictly between 0°C and 5°C?',
    options: [
      'Arenediazonium salts (C₆H₅N₂⁺Cl⁻) are thermally unstable and decompose into phenol and nitrogen gas (N₂) above 5°C',
      'β-Naphthol solidifies and becomes unreactive below 0°C',
      'Sodium nitrite (NaNO₂) evaporates at room temperature',
      'Higher temperatures cause the amine to oxidize into nitrobenzene',
    ],
    correctIndex: 0,
    explanation:
      'Arenediazonium cations are stabilized only by resonance with the aromatic ring at low temperatures (0–5°C). Above 5–10°C, benzenediazonium chloride undergoes nucleophilic displacement by water: C₆H₅N₂⁺Cl⁻ + H₂O ⟶ C₆H₅OH + N₂↑ + HCl, preventing coupling with alkaline β-naphthol to form the scarlet azo dye.',
  },
];

export const FOOD_TESTING_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'food-q1',
    experimentId: 'food-component-testing',
    question:
      'In the Molisch test for carbohydrates, what chemical transformation generates the characteristic reddish-violet ring at the liquid interface?',
    options: [
      'Concentrated H₂SO₄ dehydrates sugars to furfural/hydroxymethylfurfural, which condenses with α-naphthol to form a colored dye',
      'Sugars reduce sulphuric acid into purple sulphur vapor',
      'α-Naphthol hydrolyzes into purple indigo dye in acidic medium',
      'Starch complexation with trace iodine in the sulphuric acid',
    ],
    correctIndex: 0,
    explanation:
      'Conc. H₂SO₄ acts as a powerful dehydrating agent: pentoses dehydrate to furfural, and hexoses dehydrate to 5-hydroxymethylfurfural. These cyclic aldehydes rapidly condense with two molecules of α-naphthol (1-naphthol) at the acid-water interface to yield a purple/violet condensation product.',
  },
  {
    id: 'food-q2',
    experimentId: 'food-component-testing',
    question:
      'Why does Potato Starch give an intense deep blue-black color with dilute iodine solution, while Glucose does NOT?',
    options: [
      'Iodine forms an inclusion complex by slipping inside the helical coil of amylose in starch; glucose monosaccharide lacks this helical polymer structure',
      'Glucose chemically reduces elemental iodine into colorless iodide ions',
      'Starch oxidizes iodine into dark iodate ions',
      'Glucose forms an insoluble covalent adduct that bleaches the iodine color',
    ],
    correctIndex: 0,
    explanation:
      'Starch contains amylose (unbranched α-1,4-glucan), which coils into a continuous cylindrical helix. Polyiodide ions (I₃⁻, I₅⁻) enter the hydrophobic cavity of this helix, creating charge-transfer bands that absorb all visible wavelengths except deep blue-black (~620 nm). Monosaccharides like glucose cannot form inclusion complexes.',
  },
  {
    id: 'food-q3',
    experimentId: 'food-component-testing',
    question:
      'Why does free Glycine (a single amino acid) give a NEGATIVE Biuret test, whereas Egg Albumin gives a vibrant violet-purple color?',
    options: [
      'The Biuret reaction requires coordination with at least two adjacent peptide bonds (-CONH-), which are absent in free monomeric amino acids',
      'Glycine is completely insoluble in alkaline sodium hydroxide',
      'Glycine contains a carboxylic group that destroys cupric Cu²⁺ ions',
      'Biuret test is specific only to carbohydrate rings',
    ],
    correctIndex: 0,
    explanation:
      'The Biuret test is a coordination chelate reaction: in alkaline solution, Cu²⁺ coordinates with nitrogen atoms from four peptide bonds (-CONH-) across polypeptide chains, producing a square-planar violet complex. Free amino acids contain only one terminal amino group and no peptide bonds, so they cannot form the biuret chelate.',
  },
  {
    id: 'food-q4',
    experimentId: 'food-component-testing',
    question:
      'In the Acrolein test for fats and oils, what specific molecular component of the triglyceride undergoes dehydration to produce the pungent acrid odor?',
    options: [
      'The glycerol (propane-1,2,3-triol) backbone of the triglyceride',
      'The long-chain saturated fatty acid hydrocarbon tail',
      'The ester carbonyl oxygen atom',
      'Dissolved nitrogen gas in the lipid emulsion',
    ],
    correctIndex: 0,
    explanation:
      'Heating fats with potassium bisulphate (KHSO₄) causes thermal dehydration of the glycerol backbone: CH₂(OH)-CH(OH)-CH₂(OH) ⎯(KHSO₄, Δ)⎯→ CH₂=CH-CHO (Acrolein / Propenal) + 2H₂O. Acrolein is a volatile, highly lacrymatory aldehyde with the unmistakable pungent odor of scorched cooking fat.',
  },
];

export const REDOX_TITRATION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'redox-q1',
    experimentId: 'redox-titration-kmno4',
    question:
      'Why is the UPPER meniscus read when recording burette volumes of Potassium Permanganate (KMnO₄) solution?',
    options: [
      'KMnO₄ solution is deeply colored and virtually opaque, making the lower meniscus difficult to view with certainty',
      'KMnO₄ has negative surface tension that curves the meniscus upward',
      'Burette graduations are inverted for potassium permanganate',
      'Upper meniscus reading prevents evaporation of the titrant',
    ],
    correctIndex: 0,
    explanation:
      'For transparent or lightly colored solutions, the bottom of the curve (lower meniscus) is aligned with the graduation mark to avoid parallax. For intensely dark, opaque solutions like KMnO₄, the lower meniscus is obscured, so analytical convention mandates reading the top boundary (upper meniscus).',
  },
  {
    id: 'redox-q2',
    experimentId: 'redox-titration-kmno4',
    question:
      'Why CANNOT dilute Hydrochloric acid (HCl) be used in place of dilute Sulphuric acid (H₂SO₄) to acidify the permanganate titration mixture?',
    options: [
      'KMnO₄ oxidizes chloride ions (Cl⁻) into toxic chlorine gas (Cl₂), causing falsely elevated consumption of KMnO₄',
      'HCl precipitates potassium permanganate as insoluble potassium chloride',
      'HCl neutralizes the reducing power of Mohr’s salt completely',
      'HCl causes the solution to turn boiling hot immediately',
    ],
    correctIndex: 0,
    explanation:
      'In acidic medium, KMnO₄ has a standard reduction potential of +1.51 V, which is higher than the Cl₂/Cl⁻ potential (+1.36 V). KMnO₄ oxidizes HCl: 2MnO₄⁻ + 10Cl⁻ + 16H⁺ ⟶ 2Mn²⁺ + 5Cl₂↑ + 8H₂O. Part of the titrant is consumed oxidizing HCl rather than analyte, causing serious analytical error.',
  },
  {
    id: 'redox-q3',
    experimentId: 'redox-titration-kmno4',
    question:
      'Why is the Oxalic acid solution heated to 60–70°C before titrating with KMnO₄, whereas Mohr’s salt titration is carried out at room temperature?',
    options: [
      'The reaction between MnO₄⁻ and C₂O₄²⁻ has high activation energy due to electrostatic repulsion between negative ions; once Mn²⁺ forms, it autocatalyzes the reaction',
      'Oxalic acid only dissolves in water above 60°C',
      'Heating decomposes oxalic acid into active hydroxyl radicals',
      'Mohr’s salt is explosive if heated above 30°C',
    ],
    correctIndex: 0,
    explanation:
      'Both reacting species (MnO₄⁻ and C₂O₄²⁻) carry negative charges, creating strong electrostatic repulsion and high activation energy. At room temperature, reaction is too slow to detect an endpoint. Warming to 60–70°C accelerates the initial step; the generated Mn²⁺ ions then act as an autocatalyst, allowing rapid titration.',
  },
  {
    id: 'redox-q4',
    experimentId: 'redox-titration-kmno4',
    question:
      'In the balanced ionic redox reaction between Permanganate and Mohr’s salt (Fe²⁺) in acidic medium, what is the stoichiometric mole ratio of KMnO₄ to Fe²⁺?',
    options: [
      '1 mole of KMnO₄ oxidizes 5 moles of Fe²⁺ (1 : 5 mole ratio)',
      '1 mole of KMnO₄ oxidizes 1 mole of Fe²⁺ (1 : 1 mole ratio)',
      '2 moles of KMnO₄ oxidize 3 moles of Fe²⁺ (2 : 3 mole ratio)',
      '5 moles of KMnO₄ oxidize 1 mole of Fe²⁺ (5 : 1 mole ratio)',
    ],
    correctIndex: 0,
    explanation:
      'The half-reactions are: MnO₄⁻ + 8H⁺ + 5e⁻ ⟶ Mn²⁺ + 4H₂O (n = 5), and Fe²⁺ ⟶ Fe³⁺ + e⁻ (n = 1). Multiplying the oxidation half-reaction by 5 gives the overall equation: MnO₄⁻ + 5Fe²⁺ + 8H⁺ ⟶ Mn²⁺ + 5Fe³⁺ + 4H₂O. Thus, 1 mol KMnO₄ reacts with 5 mol Fe²⁺ (M₁V₁ = M₂V₂ / 5).',
  },
];

export const SALT_ANALYSIS_CLASS12_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'salt12-q1',
    experimentId: 'salt-analysis-class12',
    question:
      'Why are Phosphate (PO₄³⁻) and Oxalate (C₂O₄²⁻) known as "interfering acid radicals" in systematic qualitative inorganic analysis?',
    options: [
      'In the alkaline medium of Group III (NH₄Cl + NH₄OH), phosphates and oxalates of Groups IV, V, and VI cations are insoluble and precipitate prematurely',
      'They dissolve all test tubes made of borosilicate glass',
      'They oxidize hydrogen sulphide into elemental sulphur in Group II',
      'They turn the flame invisible during Bunsen flame tests',
    ],
    correctIndex: 0,
    explanation:
      'In acidic solution (Groups I and II), phosphates and oxalates of all cations remain dissolved as soluble hydrogen phosphate / bioxalate salts. When NH₄Cl and NH₄OH are added to precipitate Group III (pH ~9), the solution becomes basic. Phosphates and oxalates of Ca²⁺, Ba²⁺, Mg²⁺, Zn²⁺, Mn²⁺ are insoluble in alkaline medium and precipitate prematurely alongside Group III hydroxides, completely disrupting cation separation.',
  },
  {
    id: 'salt12-q2',
    experimentId: 'salt-analysis-class12',
    question:
      'In the Phosphate Elimination protocol, why are sodium acetate buffer and neutral ferric chloride (FeCl₃) added to the filtrate before Group III?',
    options: [
      'Fe³⁺ selectively precipitates all phosphate as insoluble FePO₄ at pH ~4.5, while excess iron precipitates as basic ferric acetate on boiling, leaving filtrate phosphate-free',
      'Sodium acetate oxidizes phosphate into phosphorus pentoxide gas',
      'FeCl₃ dissolves all Group IV cations permanently',
      'Sodium acetate prevents the solution from boiling',
    ],
    correctIndex: 0,
    explanation:
      'In acetic acid buffered by sodium acetate (pH ~4.5), Ferric Phosphate (FePO₄) is virtually insoluble (Ksp ~ 10⁻²²), whereas phosphates of Groups IV, V, and VI cations remain soluble. Adding FeCl₃ selectively precipitates all PO₄³⁻ as FePO₄. Boiling causes excess Fe³⁺ to precipitate as insoluble basic ferric acetate Fe(OH)₂(CH₃COO). Filtering hot removes both precipitates, leaving the filtrate phosphate-free.',
  },
  {
    id: 'salt12-q3',
    experimentId: 'salt-analysis-class12',
    question:
      'What is the confirmatory test for Phosphate (PO₄³⁻) radical using Ammonium Molybdate?',
    options: [
      'Boiling with concentrated HNO₃ and excess ammonium molybdate produces a canary-yellow crystalline precipitate of Ammonium Phosphomolybdate',
      'Treating with silver nitrate produces a bright scarlet red solution',
      'Adding barium chloride produces a black precipitate of barium phosphide',
      'Heating with copper turnings produces brown NO₂ gas',
    ],
    correctIndex: 0,
    explanation:
      'When acidified with concentrated HNO₃ and warmed with excess (NH₄)₂MoO₄, orthophosphates form a canary-yellow precipitate of Ammonium Phosphomolybdate [(NH₄)₃PO₄·12MoO₃ or (NH₄)₃[P(Mo₃O₁₀)₄]]: H₃PO₄ + 12(NH₄)₂MoO₄ + 21HNO₃ ⟶ (NH₄)₃[P(Mo₃O₁₀)₄]↓ + 21NH₄NO₃ + 12H₂O.',
  },
  {
    id: 'salt12-q4',
    experimentId: 'salt-analysis-class12',
    question:
      'In the flame test for alkaline earth metal cations, which characteristic colors are imparted by Calcium (Ca²⁺) and Barium (Ba²⁺) respectively?',
    options: [
      'Calcium imparts a brick-red flame; Barium imparts a persistent apple-green (grassy green) flame',
      'Calcium imparts an apple-green flame; Barium imparts a crimson red flame',
      'Calcium imparts a violet flame; Barium imparts a golden yellow flame',
      'Both cations impart a brilliant royal blue flame',
    ],
    correctIndex: 0,
    explanation:
      'When heated in a non-luminous Bunsen flame with concentrated HCl (forming volatile metal chlorides), Calcium imparts a brick-red flame (appearing light green through cobalt blue glass), and Barium imparts an apple-green (grassy green) flame due to their characteristic atomic emission wavelengths.',
  },
];
