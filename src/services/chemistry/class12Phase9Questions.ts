import { ConceptualQuestion } from '../circuit/types';

export const SURFACE_CHEMISTRY_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'surf-q1',
    experimentId: 'surface-chemistry',
    question:
      'Why is hydrated ferric hydroxide sol Fe(OH)₃ prepared by adding FeCl₃ dropwise into vigorously boiling water rather than cold water?',
    options: [
      'Boiling water accelerates rapid hydrolysis to form colloidal Fe(OH)₃ nuclei, which selectively adsorb Fe³⁺ ions to remain stably dispersed',
      'Cold water oxidizes FeCl₃ into volatile chlorine dioxide gas',
      'High temperature removes all dissolved oxygen which would otherwise coagulate the sol',
      'Boiling water lowers the dielectric constant to zero',
    ],
    correctIndex: 0,
    explanation:
      'Hydrolysis of FeCl₃ is strongly endothermic: FeCl₃ + 3H₂O ⇌ Fe(OH)₃ + 3HCl. In boiling water (100°C), rapid uniform nucleation occurs and colloidal particles selectively adsorb Fe³⁺ common ions, acquiring a positive charge that prevents macro-precipitation.',
  },
  {
    id: 'surf-q2',
    experimentId: 'surface-chemistry',
    question:
      'Why does a colloidal sol exhibit the Tyndall effect while an aqueous true solution of NaCl does not?',
    options: [
      'Colloidal particle diameters (1–1000 nm) are comparable to the wavelength of light and have a substantial refractive index difference from the medium',
      'True solution particles absorb 100% of the light without reflection',
      'NaCl molecules are completely non-polar and do not interact with electromagnetic waves',
      'Tyndall effect only occurs when an external electric field is applied',
    ],
    correctIndex: 0,
    explanation:
      'According to Rayleigh scattering theory, light scattering is significant only when particle diameter is comparable to the incident wavelength (~400–700 nm) and the refractive index contrast between dispersed phase and dispersion medium is large. True solution solute ions are <1 nm, making scattering imperceptible.',
  },
  {
    id: 'surf-q3',
    experimentId: 'surface-chemistry',
    question:
      'According to the Hardy-Schulze rule, which of the following electrolytes has the HIGHEST coagulating power for a positively charged Fe(OH)₃ sol?',
    options: [
      'Potassium ferrocyanide K₄[Fe(CN)₆] (anion valence = -4)',
      'Sodium phosphate Na₃PO₄ (anion valence = -3)',
      'Sodium sulphate Na₂SO₄ (anion valence = -2)',
      'Sodium chloride NaCl (anion valence = -1)',
    ],
    correctIndex: 0,
    explanation:
      'The Hardy-Schulze rule states that the coagulating power of an electrolyte is directly proportional to the valence of the active counter-ion (ion with charge opposite to the sol). For positive Fe(OH)₃ sol, the coagulating ion is the anion: [Fe(CN)₆]⁴⁻ > PO₄³⁻ > SO₄²⁻ > Cl⁻.',
  },
  {
    id: 'surf-q4',
    experimentId: 'surface-chemistry',
    question:
      'Why are lyophilic sols (such as soluble starch sol) vastly more stable and resistant to coagulation than lyophobic sols (such as Fe(OH)₃)?',
    options: [
      'Lyophilic particles are surrounded by an extensive solvent hydration envelope in addition to surface charge',
      'Lyophilic particles carry an infinite positive surface charge',
      'Starch molecules are completely insoluble in water and cannot be solvated',
      'Lyophilic sols have zero surface tension',
    ],
    correctIndex: 0,
    explanation:
      'Lyophobic sols depend solely on electrostatic repulsion for stability. Lyophilic colloids, however, possess high affinity for the dispersion medium and form a thick protective hydration sheath (solvation layer) around each macromolecule, which physically prevents aggregation even when charges are screened.',
  },
];

export const CHEMICAL_KINETICS_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'kin-q1',
    experimentId: 'chemical-kinetics',
    question:
      'In the reaction Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + SO₂(g) + S(s) + H₂O(l), what directly causes the black cross mark on the glazed tile to become invisible?',
    options: [
      'Accumulation of sub-microscopic colloidal elemental sulphur particles scattering and absorbing transmitted light',
      'Absorption of light by gaseous sulphur dioxide bubbling through the solution',
      'Rapid crystallization of sodium chloride crystals on the bottom of the flask',
      'Formation of an intense black dye in aqueous solution',
    ],
    correctIndex: 0,
    explanation:
      'As the redox decomposition proceeds, elemental sulphur precipitates in a finely divided colloidal state. The scattering (turbidity) increases monotonically until optical density reaches a critical threshold that obscures the black cross beneath the flask.',
  },
  {
    id: 'kin-q2',
    experimentId: 'chemical-kinetics',
    question:
      'Why is reaction rate taken as proportional to 1/t (where t is the time taken to obscure the cross)?',
    options: [
      'Because the critical mass of colloidal sulphur needed to obscure the cross is constant: Rate = Δ[S] / Δt = constant / t ∝ 1/t',
      'Because the concentration of water increases linearly with time',
      'Because velocity is defined as distance divided by time squared',
      'Because the stopwatch runs faster at higher temperatures',
    ],
    correctIndex: 0,
    explanation:
      'For a fixed optical path length and flask geometry, a constant critical concentration of colloidal sulphur Δ[S] is required to reduce light transmittance to zero. Hence, Rate = Δ[S] / t = k′ / t ∝ 1/t.',
  },
  {
    id: 'kin-q3',
    experimentId: 'chemical-kinetics',
    question:
      'If the concentration of sodium thiosulphate is halved while maintaining constant total volume and excess HCl, what happens to the obscuration time t?',
    options: [
      'Obscuration time t doubles, confirming the reaction is first-order with respect to [Na₂S₂O₃]',
      'Obscuration time t is halved',
      'Obscuration time t quadruples (second order)',
      'Obscuration time remains completely unchanged',
    ],
    correctIndex: 0,
    explanation:
      'Since Rate ∝ [Na₂S₂O₃]¹ and Rate ∝ 1/t, halving [Na₂S₂O₃] cuts the rate in half, which doubles the required time t. A linear plot of 1/t vs [Na₂S₂O₃] passes through the origin, proving first-order kinetics.',
  },
  {
    id: 'kin-q4',
    experimentId: 'chemical-kinetics',
    question:
      'Why does raising the reaction temperature from 25°C to 35°C nearly double the reaction rate between thiosulphate and acid?',
    options: [
      'The fraction of colliding reactant molecules possessing kinetic energy greater than the activation energy (E ≥ Ea) approximately doubles',
      'The molecular collision frequency increases by 200%',
      'The concentration of hydrochloric acid increases with temperature',
      'The volume of the liquid contracts substantially',
    ],
    correctIndex: 0,
    explanation:
      'According to the Arrhenius equation and Maxwell-Boltzmann energy distribution, a modest 10°C increase in temperature nearly doubles the fraction of molecules with energy exceeding the threshold activation energy Ea (Boltzmann factor e^(-Ea/RT)), even though total collisions increase by only ~2-3%.',
  },
];

export const THERMOCHEMISTRY_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'thermo-q1',
    experimentId: 'thermochemistry',
    question:
      'Why is the standard enthalpy of neutralization of any strong acid (e.g. HCl, HNO₃) with any strong base (e.g. NaOH, KOH) approximately constant at -57.32 kJ/mol?',
    options: [
      'Strong acids and bases are 100% dissociated; the fundamental reaction is always H⁺(aq) + OH⁻(aq) → H₂O(l)',
      'All strong acids and bases share the exact same molecular weight',
      'The calorimeter cup is calibrated to always show -57.32 kJ/mol',
      'Water has zero heat of vaporization at room temperature',
    ],
    correctIndex: 0,
    explanation:
      'In dilute aqueous solutions, strong acids and bases are completely ionized. The spectator ions (Na⁺, K⁺, Cl⁻, NO₃⁻) undergo no net chemical change. The reaction across all strong acid-base combinations is universally the formation of liquid water from hydrated hydronium and hydroxide ions: H⁺(aq) + OH⁻(aq) → H₂O(l) (ΔH° = -57.32 kJ/mol).',
  },
  {
    id: 'thermo-q2',
    experimentId: 'thermochemistry',
    question:
      'Why is the enthalpy of neutralization of acetic acid (CH₃COOH) with NaOH numerically less exothermic (-55.90 kJ/mol) than that of HCl with NaOH (-57.32 kJ/mol)?',
    options: [
      'Some heat energy (~1.42 kJ/mol) is consumed in the endothermic complete ionization of weakly dissociated acetic acid molecules',
      'Acetic acid reacts endothermically with sodium chloride',
      'Acetate ions decompose into carbon dioxide and methane in the calorimeter',
      'Sodium hydroxide is only partially soluble in the presence of acetic acid',
    ],
    correctIndex: 0,
    explanation:
      'Acetic acid is a weak acid that is only slightly dissociated in aqueous solution (~1.3%). Complete neutralization requires the remaining undissociated CH₃COOH molecules to ionize into H⁺ and CH₃COO⁻. This dissociation absorbs heat (ΔH_ion = +1.42 kJ/mol), resulting in a net enthalpy of -57.32 + 1.42 = -55.90 kJ/mol.',
  },
  {
    id: 'thermo-q3',
    experimentId: 'thermochemistry',
    question:
      'What is the physical meaning of the water equivalent (W) of a calorimeter?',
    options: [
      'The mass of pure water that has the same total heat capacity as the calorimeter container, thermometer, and stirrer',
      'The total volume of water required to fill the calorimeter to the brim',
      'The density of the solution divided by the density of mercury',
      'The amount of water produced during stoichiometric neutralization',
    ],
    correctIndex: 0,
    explanation:
      'The water equivalent W = m_cal × c_cal represents the heat capacity of the calorimeter vessel and its accessories expressed in terms of the equivalent mass of water that would absorb the same quantity of heat per degree Kelvin.',
  },
  {
    id: 'thermo-q4',
    experimentId: 'thermochemistry',
    question:
      'When solid potassium nitrate (KNO₃) dissolves in distilled water in a calorimeter, the temperature drops. What thermodynamic conclusion follows?',
    options: [
      'Dissolution of KNO₃ is endothermic (ΔH_sol > 0) because lattice energy exceeds hydration enthalpy',
      'Dissolution of KNO₃ is exothermic and releases latent heat',
      'The calorimeter cup is leaking heat to the environment',
      'Potassium ions react with nitrate to form potassium metal',
    ],
    correctIndex: 0,
    explanation:
      'Enthalpy of solution ΔH_sol = Lattice Energy + Hydration Enthalpy. For KNO₃, the energy required to break the ionic crystal lattice (+687 kJ/mol) exceeds the energy released by ion hydration (-651 kJ/mol), resulting in a net positive (endothermic) enthalpy of solution (+35.6 kJ/mol) and a temperature decrease.',
  },
];

export const ELECTROCHEMISTRY_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'elec-q1',
    experimentId: 'electrochemistry',
    question:
      'In a galvanic Daniell cell, why does the digital voltmeter read 0.000 V when the salt bridge is removed?',
    options: [
      'The internal circuit is broken, and accumulation of positive Zn²⁺ and negative SO₄²⁻ charges in the half-cells immediately halts electron flow',
      'The zinc electrode instantly dissolves completely',
      'Copper ions begin flowing backward through the voltmeter wires',
      'The standard reduction potential of copper drops to zero',
    ],
    correctIndex: 0,
    explanation:
      'Without a salt bridge, electrical neutrality cannot be maintained. The anode compartment accumulates excess Zn²⁺ and the cathode compartment accumulates excess SO₄²⁻. This rapid charge separation creates an opposing electrical potential that instantly halts current flow across the open circuit.',
  },
  {
    id: 'elec-q2',
    experimentId: 'electrochemistry',
    question:
      'Why is potassium chloride (KCl) agar-agar commonly chosen as the electrolyte in the salt bridge for a Daniell cell?',
    options: [
      'K⁺ and Cl⁻ ions have nearly identical ionic mobilities (transport numbers), minimizing liquid junction potential',
      'KCl reacts vigorously with copper to generate extra electromotive force',
      'KCl is the only salt that can dissolve in agar-agar gel',
      'KCl solidifies into metallic potassium at room temperature',
    ],
    correctIndex: 0,
    explanation:
      'In a salt bridge, the cation and anion must migrate at almost equal velocities so that no potential difference develops at the liquid junctions between the bridge and half-cell solutions. The transport numbers of K⁺ (0.49) and Cl⁻ (0.51) in water are virtually identical.',
  },
  {
    id: 'elec-q3',
    experimentId: 'electrochemistry',
    question:
      'According to the Nernst equation E_cell = E°_cell - (0.0591 / 2) log₁₀([Zn²⁺] / [Cu²⁺]), what happens to cell EMF if the zinc electrolyte is diluted from 1.0 M to 0.1 M while [Cu²⁺] = 1.0 M?',
    options: [
      'Cell EMF increases by approximately 0.0296 V (from +1.103 V to +1.133 V)',
      'Cell EMF decreases by 0.0591 V',
      'Cell EMF drops to 0.000 V',
      'Cell EMF inverts polarity to -1.103 V',
    ],
    correctIndex: 0,
    explanation:
      'With [Zn²⁺] = 0.1 M and [Cu²⁺] = 1.0 M, Q = 0.1 / 1.0 = 10⁻¹, so log₁₀(Q) = -1. Then E = 1.103 - (0.05916 / 2)(-1) = 1.103 + 0.02958 ≈ +1.133 V. Lowering product concentration shifts the cell reaction forward.',
  },
  {
    id: 'elec-q4',
    experimentId: 'electrochemistry',
    question:
      'At equilibrium in a Daniell cell, what are the values of cell potential (E_cell) and the reaction quotient (Q)?',
    options: [
      'E_cell = 0.000 V, and Q equals the equilibrium constant Kc = 10^(2 × 1.10 / 0.0591) ≈ 1.5 × 10³⁷',
      'E_cell = +1.100 V and Q = 1.0',
      'E_cell = -1.100 V and Q = 0',
      'E_cell becomes infinite',
    ],
    correctIndex: 0,
    explanation:
      'When the cell reaction reaches dynamic thermodynamic equilibrium, no net electron transfer can occur, so E_cell = 0 V and Q = Kc. Solving 0 = E° - (0.0591/n) log Kc gives log Kc = n E° / 0.0591 = 2(1.10)/0.0591 ≈ 37.2, yielding Kc ≈ 1.5 × 10³⁷.',
  },
];

export const PAPER_CHROMATOGRAPHY_CLASS12_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'chrom12-q1',
    experimentId: 'paper-chromatography-class12',
    question:
      'In Class 12 analytical paper chromatography of metal cations (Pb²⁺ and Cd²⁺), why is spraying with yellow ammonium sulphide (NH₄)₂S necessary to visualize the spots?',
    options: [
      'Pb²⁺ and Cd²⁺ ions are colorless; (NH₄)₂S precipitates insoluble colored sulphides (brown-black PbS and bright yellow CdS)',
      '(NH₄)₂S dissolves the cellulose paper to reveal etched grooves',
      'Ammonium sulphide acts as a fluorescent dye glowing under UV light',
      'Ammonium sulphide neutralizes the acidic mobile phase',
    ],
    correctIndex: 0,
    explanation:
      'Unlike inks or plant pigments, simple transition and post-transition metal cations in dilute aqueous solutions are colorless. Spraying with a sulphide reagent precipitates lead as insoluble brown-black PbS (Ksp ~ 3 × 10⁻²⁸) and cadmium as canary-yellow CdS (Ksp ~ 1 × 10⁻²⁷), rendering the spots visible.',
  },
  {
    id: 'chrom12-q2',
    experimentId: 'paper-chromatography-class12',
    question:
      'What is the stationary phase and mobile phase in ascending paper partition chromatography?',
    options: [
      'Stationary phase: Water molecules chemically bound/adsorbed to cellulose fibers; Mobile phase: Organic solvent mixture ascending by capillary action',
      'Stationary phase: The glass developing chamber; Mobile phase: Dry cellulose paper',
      'Stationary phase: The pencil baseline; Mobile phase: Whatman paper',
      'Stationary phase: Atmospheric nitrogen; Mobile phase: Water vapor',
    ],
    correctIndex: 0,
    explanation:
      'Cellulose paper acts as an inert structural support holding a thin layer of tightly bound water molecules (the stationary phase). The ascending organic solvent (mobile phase) carries solutes, which partition repeatedly between the two immiscible liquid phases according to their partition coefficients.',
  },
  {
    id: 'chrom12-q3',
    experimentId: 'paper-chromatography-class12',
    question:
      'In the chromatographic separation of photosynthetic spinach leaf pigments, which pigment migrates closest to the solvent front (highest Rf ≈ 0.95)?',
    options: [
      'Carotene (pure hydrocarbon with highest solubility in non-polar organic mobile phase and lowest affinity for cellulose)',
      'Chlorophyll b (contains polar aldehyde and ester groups forming hydrogen bonds with cellulose)',
      'Chlorophyll a (contains magnesium porphyrin ring)',
      'Xanthophyll (contains polar hydroxyl groups)',
    ],
    correctIndex: 0,
    explanation:
      'Carotenes are non-polar hydrocarbons (C₄₀H₅₆) lacking polar functional groups. They dissolve readily in non-polar mobile phases (petroleum ether/acetone) and interact weakly with the polar cellulose-water matrix, migrating almost with the solvent front (Rf ~ 0.95). In contrast, Chlorophyll b (Rf ~ 0.35) forms strong hydrogen bonds.',
  },
  {
    id: 'chrom12-q4',
    experimentId: 'paper-chromatography-class12',
    question:
      'Why must the initial sample spot be kept strictly above the liquid solvent level in the developing chamber?',
    options: [
      'If immersed directly in the bulk solvent, the sample would dissolve into the reservoir rather than ascending along the paper strip',
      'The solvent would catch fire on contact with the ink',
      'The paper would immediately tear under hydrostatic pressure',
      'The Rf values would exceed 1.0',
    ],
    correctIndex: 0,
    explanation:
      'The sample spot must be positioned ~1.5–2 cm above the lower edge, above the liquid meniscus. If submerged, the solute mixture would instantly disperse and dissolve into the solvent pool at the bottom of the chamber, preventing any upward chromatographic separation.',
  },
];
