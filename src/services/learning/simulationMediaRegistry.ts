/**
 * simulationMediaRegistry.ts
 *
 * Central Registry and Dynamic Generation Engine for Experiment Simulation Media,
 * 7-Topic Segments, Worked Numerical Examples, Common Laboratory Mistakes,
 * 100-Mark Rubric, and 5-Question Viva Voce Assessments.
 */

import { getExperimentById } from '../experimentRegistry';

export type SimulationTopicSegmentId =
  | 'intro'
  | 'apparatus'
  | 'procedure'
  | 'observation'
  | 'explanation'
  | 'worked-example'
  | 'mistakes';

export interface SimulationSegment {
  id: SimulationTopicSegmentId;
  title: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  summary: string;
  keyPoints: string[];
  transcript: string;
  narrationScript?: string;
  audioUrl?: string;
}

export interface WorkedExample {
  problem: string;
  givenData: Record<string, string | number>;
  formula: string;
  steps: string[];
  finalAnswer: string;
  unit: string;
  explanation: string;
}

export interface CommonMistake {
  mistake: string;
  consequence: string;
  prevention: string;
}

export interface VivaQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  remediationHint: string;
  relevantSegmentId?: SimulationTopicSegmentId;
}

export interface RubricCriterion {
  name: string;
  category: 'lab-work' | 'viva-voce';
  marks: number;
  description: string;
}

export interface ExperimentSimulationMedia {
  experimentId: string;
  title: string;
  subjectId: string;
  gradeLevel: string;
  totalDurationSeconds: number;
  segments: SimulationSegment[];
  workedExample: WorkedExample;
  commonMistakes: CommonMistake[];
  vivaQuestions: VivaQuestionItem[];
  learningObjectives: string[];
  expectedOutcomes: string[];
  importantFormulas: Array<{ label: string; formula: string; description: string }>;
  rubric: {
    totalMarks: 100;
    labWorkMarks: 60;
    vivaMarks: 40;
    criteria: RubricCriterion[];
  };
  narrationAudioUrl?: string;
  isOfflineAudioAvailable?: boolean;
}

// -----------------------------------------------------------------------------
// VERIFIED FLAGSHIP EXPERIMENT MEDIA REGISTRY
// -----------------------------------------------------------------------------

const OHMS_LAW_MEDIA: ExperimentSimulationMedia = {
  experimentId: 'ohms-law',
  title: "Verification of Ohm's Law and Resistance Determination",
  subjectId: 'physics',
  gradeLevel: 'Class 10',
  totalDurationSeconds: 210, // 3 mins 30 secs
  segments: [
    {
      id: 'intro',
      title: '1. Introduction & Learning Objectives',
      startTime: 0,
      duration: 30,
      summary: "Understand the fundamental relationship between potential difference (V) and electric current (I) at constant temperature.",
      keyPoints: [
        "State Ohm's Law: V = I · R",
        "Identify ohmic vs non-ohmic conductors",
        "Define electrical resistance as the constant of proportionality",
      ],
      transcript:
        "Welcome to the virtual physics laboratory. Today, we verify Ohm's Law. In any metallic conductor at constant physical conditions such as temperature and stress, the current flowing through it is directly proportional to the potential difference across its terminals.",
    },
    {
      id: 'apparatus',
      title: '2. Apparatus & Circuit Setup',
      startTime: 30,
      duration: 30,
      summary: "Inspect instruments: DC power source, ammeter in series, voltmeter in parallel, rheostat, plug key, and test resistor.",
      keyPoints: [
        "Ammeter connected strictly in series (low internal resistance)",
        "Voltmeter connected strictly across the resistor in parallel (high internal resistance)",
        "Rheostat wired as a potential divider or variable series current limiter",
      ],
      transcript:
        "Observe our bench setup. The DC supply provides variable terminal voltage. The ammeter measures circuit current in amperes and must be placed in series. The voltmeter is placed directly across our unknown resistor wire in parallel.",
    },
    {
      id: 'procedure',
      title: '3. Step-by-Step Procedure',
      startTime: 60,
      duration: 30,
      summary: "Insert plug key, calibrate zero error, incrementally vary rheostat slider, and log simultaneous V and I pairs.",
      keyPoints: [
        "Check and correct pointer zero-errors on both meters",
        "Close key only during measurements to avoid Joule heating error",
        "Take at least 5 sets of readings over a range of 0.5V to 4.0V",
      ],
      transcript:
        "To begin, insert the plug key. Slowly slide the rheostat slider from minimum to maximum. Notice how the voltmeter deflection and ammeter deflection increase synchronously. Always tap the meter gently to overcome pivot friction.",
    },
    {
      id: 'observation',
      title: '4. Observations & Real-time Measurements',
      startTime: 90,
      duration: 30,
      summary: "Tabulate V (Volts) versus I (Amperes) and observe the strictly linear response slope.",
      keyPoints: [
        "Ratio V / I remains constant within experimental uncertainty limits",
        "Linear V-I graph passing through the origin (0,0)",
        "Reciprocal of slope on an I vs V plot gives conductance",
      ],
      transcript:
        "Let us examine the logged data table. At 1.0 Volt, current is 0.20 A, giving R = 5.0 Ohms. At 2.0 Volts, current is 0.40 A, giving R = 5.0 Ohms. At 3.0 Volts, current is 0.60 A, confirming high repeatability.",
    },
    {
      id: 'explanation',
      title: '5. Scientific Law & Theoretical Explanation',
      startTime: 120,
      duration: 30,
      summary: "Drift velocity of free electrons and microscopic derivation of Ohm's Law in terms of relaxation time.",
      keyPoints: [
        "Current I = n · e · A · v_d",
        "Drift velocity v_d = (e · E · τ) / m",
        "Resistance R = (m · L) / (n · e² · τ · A)",
      ],
      transcript:
        "On the microscopic level, free conduction electrons accelerate under the electric field and repeatedly collide with vibrating lattice ions. The constant relaxation time τ leads to a steady average drift velocity proportional to the electric field.",
    },
    {
      id: 'worked-example',
      title: '6. Solved Numerical Worked Example',
      startTime: 150,
      duration: 30,
      summary: "Calculate unknown resistance and percentage error from experimental slope coordinates.",
      keyPoints: [
        "Slope of V vs I: ΔV / ΔI",
        "Theoretical resistance comparison: 5.00 Ω",
        "Percentage error = (|R_exp - R_theo| / R_theo) × 100%",
      ],
      transcript:
        "Here is a solved numerical. A student applies 4.50 Volts across a nichrome wire and logs a current of 0.90 Amperes. Using Ohm's formula R = V / I = 4.50 / 0.90 = 5.00 Ohms. The percentage discrepancy is under 0.2%.",
    },
    {
      id: 'mistakes',
      title: '7. Common Errors & Precautionary Measures',
      startTime: 180,
      duration: 30,
      summary: "Avoid overheating the wire, incorrect meter polarities, and loose contact resistances.",
      keyPoints: [
        "Never leave the key closed continuously to prevent resistance drift from heating",
        "Check terminal polarities (+ to +, - to -)",
        "Ensure wire leads are scraped clean of insulating oxide film",
      ],
      transcript:
        "Watch out for these critical lab errors: Leaving the circuit on causes Joule heating, raising temperature and falsely increasing resistance. Always ensure the voltmeter is strictly across the unknown wire and not the battery terminals.",
    },
  ],
  workedExample: {
    problem:
      "A uniform nichrome wire of length 50 cm is connected across a variable DC source. When the voltmeter reads 3.60 V, the ammeter indicates a current of 0.72 A. Calculate the resistance of the wire and its resistance per unit length.",
    givenData: {
      'Potential difference (V)': '3.60 V',
      'Current (I)': '0.72 A',
      'Length of wire (L)': '0.50 m (50 cm)',
    },
    formula: 'R = V / I  and  R_per_m = R / L',
    steps: [
      'Step 1: Calculate total resistance R = V / I = 3.60 V / 0.72 A = 5.00 Ω',
      'Step 2: Determine resistance per unit length = R / L = 5.00 Ω / 0.50 m = 10.00 Ω/m',
      'Step 3: Verify linearity: Ratio V/I remains 5.00 Ω over all operating voltages.',
    ],
    finalAnswer: '5.00 Ω (and 10.00 Ω/m)',
    unit: 'Ohms (Ω)',
    explanation:
      'Because the temperature remains constant, the ratio V/I is invariant, proving the conductor satisfies Ohm’s Law with resistance 5.00 Ω.',
  },
  commonMistakes: [
    {
      mistake: 'Leaving the key plugged in continuously between readings',
      consequence: 'Current causes heating (I²Rt), which increases wire resistivity and causes the V-I curve to bend upwards.',
      prevention: 'Remove the plug key immediately after recording each V-I pair and allow the wire to cool to room temperature.',
    },
    {
      mistake: 'Connecting the ammeter in parallel and voltmeter in series',
      consequence: 'Ammeter acts as a short circuit blowing fuses; voltmeter has mega-ohm resistance reducing circuit current to near zero.',
      prevention: 'Always verify ammeter is in series line with load, and voltmeter bridges across the load resistor terminals.',
    },
    {
      mistake: 'Ignoring zero error on the analog ammeter or voltmeter',
      consequence: 'Constant systematic error shifts the intercept away from (0,0) in the V vs I plot.',
      prevention: 'Adjust the zero-screw with a small screwdriver before connecting wires so the needle aligns exactly with the 0 mark.',
    },
  ],
  vivaQuestions: [
    {
      id: 'viva-ohms-1',
      question: "What is the primary physical condition required for a conductor to obey Ohm's Law?",
      options: [
        "Temperature and mechanical strain must remain strictly constant",
        "The conductor must be kept in absolute vacuum",
        "The current must be alternating with frequency 50 Hz",
        "The voltage must exceed 100 Volts",
      ],
      correctAnswerIndex: 0,
      explanation:
        "Ohm's Law holds only when physical conditions such as temperature, pressure, and mechanical strain do not change, since resistance depends directly on temperature.",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Review factors affecting resistance: R = ρL/A, where resistivity ρ varies with temperature.",
      relevantSegmentId: 'explanation',
    },
    {
      id: 'viva-ohms-2',
      question: "Why is an ammeter always connected in series with the circuit component?",
      options: [
        "Because it has very low internal resistance so it does not drop significant potential",
        "Because it requires high voltage to operate its coil",
        "Because parallel connection divides the current equally",
        "Because series connection prevents magnetic interference",
      ],
      correctAnswerIndex: 0,
      explanation:
        "An ideal ammeter has zero internal resistance. It is placed in series so all circuit current passes through it without significantly altering total circuit impedance.",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "Recall circuit laws: current is constant in a series branch; low internal resistance minimizes voltage drops.",
      relevantSegmentId: 'apparatus',
    },
    {
      id: 'viva-ohms-3',
      question: "If a V vs I graph for a conductor bends towards the V-axis as current increases, what does it signify?",
      options: [
        "Resistance is increasing due to Joule heating",
        "Resistance is decreasing due to dielectric breakdown",
        "The conductor is behaving as a superconductor",
        "The voltmeter has negative zero error",
      ],
      correctAnswerIndex: 0,
      explanation:
        "The slope of V vs I represents resistance R = ΔV/ΔI. An upward curvature towards the V-axis indicates higher slope, meaning resistance rises with current due to heating.",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "Analyze graph slope: slope = ΔV / ΔI = R. A steeper slope implies greater resistance.",
      relevantSegmentId: 'observation',
    },
    {
      id: 'viva-ohms-4',
      question: "Which of the following materials is an example of a non-ohmic conductor?",
      options: [
        "Semiconductor P-N Junction Diode",
        "Nichrome heating wire",
        "Copper winding wire",
        "Silver lead ribbon",
      ],
      correctAnswerIndex: 0,
      explanation:
        "P-N junction diodes, vacuum tubes, and thermistors are non-ohmic devices because their current varies non-linearly with applied potential difference.",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Metallic alloys like nichrome and pure metals obey Ohm's law, while semiconductor junctions are non-linear.",
      relevantSegmentId: 'explanation',
    },
    {
      id: 'viva-ohms-5',
      question: "A wire of resistance R is stretched uniformly to double its original length. What will be its new resistance?",
      options: [
        "4R",
        "2R",
        "R / 2",
        "R / 4",
      ],
      correctAnswerIndex: 0,
      explanation:
        "When stretched to double length (L' = 2L), its volume V = A·L remains constant, so area halves (A' = A/2). Therefore R' = ρ(2L)/(A/2) = 4(ρL/A) = 4R.",
      difficulty: 'hard',
      marks: 8,
      remediationHint: "Conservation of volume: length increases by factor n implies cross-sectional area decreases by factor n, giving R' = n²R.",
      relevantSegmentId: 'worked-example',
    },
  ],
  learningObjectives: [
    "Verify that the electric current through a metallic conductor is directly proportional to the potential difference across it.",
    "Determine the resistance of the unknown conductor from the slope of the linear V vs I graph.",
    "Measure and observe how internal resistance of meters and wire temperature affect experimental precision.",
  ],
  expectedOutcomes: [
    "A straight line graph passing through the origin (0,0) confirming ohmic behavior.",
    "Consistent resistance value within ±2% experimental uncertainty across 5 or more voltage settings.",
  ],
  importantFormulas: [
    { label: "Ohm's Law", formula: "V = I · R", description: "Potential difference is proportional to current at constant temperature." },
    { label: "Resistance Formula", formula: "R = (ρ · L) / A", description: "Resistance depends on resistivity ρ, wire length L, and cross-section A." },
    { label: "Joule Heating Law", formula: "H = I² · R · t", description: "Thermal energy dissipated in the conductor over time t." },
  ],
  rubric: {
    totalMarks: 100,
    labWorkMarks: 60,
    vivaMarks: 40,
    criteria: [
      { name: 'Circuit Assembly & Meter Polarity', category: 'lab-work', marks: 15, description: 'Correct series placement of ammeter and parallel placement of voltmeter with clean connections.' },
      { name: 'Procedure & Range Execution', category: 'lab-work', marks: 20, description: 'Systematic variation of rheostat and collection of 5+ synchronized readings without overheating.' },
      { name: 'Data Logging & V-I Graphing', category: 'lab-work', marks: 15, description: 'Accurate plotting of V vs I with proper axis scaling and best-fit straight line through origin.' },
      { name: 'Error Analysis & Percentage Calculation', category: 'lab-work', marks: 10, description: 'Correct identification of zero errors, least count considerations, and percentage discrepancy.' },
      { name: 'Conceptual Understanding of Laws', category: 'viva-voce', marks: 20, description: 'Clear explanation of Ohm’s law, drift velocity, and physical conditions for validity.' },
      { name: 'Experimental Troubleshooting & Remediation', category: 'viva-voce', marks: 10, description: 'Ability to identify causes of non-linearity (e.g. heating) and suggest remedies.' },
      { name: 'Numerical Problem Solving', category: 'viva-voce', marks: 10, description: 'Correct calculation of resistance, stretching effects, and resistivity from measured dimensions.' },
    ],
  },
};

const ACID_BASE_TITRATION_MEDIA: ExperimentSimulationMedia = {
  experimentId: 'acid-base-titration',
  title: "Acid-Base Titration: Standardisation of Hydrochloric Acid with Sodium Hydroxide",
  subjectId: 'chemistry',
  gradeLevel: 'Class 11',
  totalDurationSeconds: 240, // 4 mins
  segments: [
    {
      id: 'intro',
      title: '1. Introduction & Volumetric Principles',
      startTime: 0,
      duration: 35,
      summary: "Understand neutralisation titration between a strong acid (HCl) and a strong base (NaOH) using phenolphthalein indicator.",
      keyPoints: [
        "Law of Chemical Equivalents: N₁V₁ = N₂V₂",
        "Difference between Equivalence Point (theoretical) and End Point (visual indicator change)",
        "Use of primary standard (Oxalic Acid) versus secondary standard (NaOH)",
      ],
      transcript:
        "Welcome to the chemistry volumetric laboratory. Today, we determine the exact molarity of a hydrochloric acid solution by titrating it against a standardised sodium hydroxide solution using phenolphthalein indicator.",
    },
    {
      id: 'apparatus',
      title: '2. Glassware Preparation & Rinsing',
      startTime: 35,
      duration: 35,
      summary: "Inspect burette, pipette, conical flask, white tile, and rinse apparatus with appropriate solutions.",
      keyPoints: [
        "Rinse burette with titrant (standard NaOH)",
        "Rinse pipette with solution to be transferred (analyte HCl)",
        "Never rinse conical flask with acid or base; rinse only with distilled water",
      ],
      transcript:
        "Proper glassware technique is vital for volumetric accuracy. Rinse the burette twice with small portions of standard NaOH to displace droplets of water that would otherwise dilute the titrant. The conical flask is rinsed only with distilled water.",
    },
    {
      id: 'procedure',
      title: '3. Titration Procedure & Dropwise Addition',
      startTime: 70,
      duration: 35,
      summary: "Pipette 20 mL of acid into conical flask, add 2 drops phenolphthalein, and titrate to permanent faint pink color.",
      keyPoints: [
        "Read bottom of meniscus at eye level without parallax error",
        "Swirl conical flask continuously during dropwise addition",
        "Near endpoint, add half-drops using glass jet and wash down flask walls",
      ],
      transcript:
        "Transfer 20.0 mL of HCl into the conical flask. Add 2 to 3 drops of phenolphthalein. The solution remains colorless. Open the burette stopcock with your left hand around the barrel while swirling the flask with your right hand.",
    },
    {
      id: 'observation',
      title: '4. Observations & Concordant Volumes',
      startTime: 105,
      duration: 35,
      summary: "Record initial and final burette readings across 3 concordant trials differing by no more than 0.05 mL.",
      keyPoints: [
        "First rough titre followed by precise concordant titres",
        "End point is signaled by the first appearance of permanent faint pink persisting for 30 seconds",
        "Discard erratic outliers when calculating the mean titre volume",
      ],
      transcript:
        "Observe the sudden color transition. As the equivalence point is reached at pH 7.0, the very next fraction of a drop of NaOH causes the pH to cross 8.2, where phenolphthalein transforms into its pink quinonoid structure.",
    },
    {
      id: 'explanation',
      title: '5. Titration Curve & Indicator Mechanism',
      startTime: 140,
      duration: 35,
      summary: "Analysis of the steep pH surge from 3 to 10 at equivalence point and choice of indicators.",
      keyPoints: [
        "Strong acid - strong base titration curve exhibits steep inflection between pH 3.5 and 10.5",
        "Phenolphthalein transition interval: pH 8.2 (colorless) to 10.0 (pink)",
        "Methyl orange transition interval: pH 3.1 (red) to 4.4 (yellow)",
      ],
      transcript:
        "The titration curve illustrates the sharp vertical rise of pH around the stoichiometric equivalence point. Because the pH jump spans from 3.5 to 10.5, both phenolphthalein and methyl orange give highly precise endpoints with strong acid-strong base systems.",
    },
    {
      id: 'worked-example',
      title: '6. Stoichiometric Worked Calculation',
      startTime: 175,
      duration: 35,
      summary: "Apply M₁V₁ = M₂V₂ to compute molarity and concentration in g/L of the unknown HCl solution.",
      keyPoints: [
        "Molarity formula: M(HCl) = [M(NaOH) × V(NaOH)] / V(HCl)",
        "Strength in grams per litre = Molarity × Molar Mass (36.46 g/mol)",
        "Significant figures and precision propagation",
      ],
      transcript:
        "Let us examine the sample calculation. Exactly 20.0 mL of unknown HCl required 22.50 mL of 0.100 M NaOH. Applying M₁V₁ = M₂V₂, M(HCl) equals (0.100 × 22.50) / 20.0 = 0.1125 M. Multiplying by 36.46 g/mol gives 4.10 g/L.",
    },
    {
      id: 'mistakes',
      title: '7. Common Volumetric Errors & Precautions',
      startTime: 210,
      duration: 30,
      summary: "Air bubble in burette jet, parallax error, excessive indicator, and blowing out the last drop from pipette.",
      keyPoints: [
        "Expel any trapped air bubble inside the burette stopcock jet before recording initial volume",
        "Do not blow out the last drop retained in pipette tip; it is calibrated for drainage",
        "Use minimal indicator (2 drops) since indicators are weak organic acids themselves",
      ],
      transcript:
        "Always inspect the burette jet before titrating. An air bubble inside the nozzle will dislodge during titration, introducing a massive positive volume error. Remember never to blow the last liquid drop out of a volumetric pipette.",
    },
  ],
  workedExample: {
    problem:
      "A student pipettes 25.00 mL of an unstandardised HCl solution into a conical flask. Titration against standard 0.0985 M NaOH solution requires an average concordant titre of 24.60 mL using phenolphthalein indicator. Calculate the molarity and strength in g/L of the HCl solution.",
    givenData: {
      'Volume of HCl (V₁)': '25.00 mL',
      'Molarity of NaOH (M₂)': '0.0985 M',
      'Concordant Volume of NaOH (V₂)': '24.60 mL',
      'Molar mass of HCl': '36.46 g/mol',
    },
    formula: 'M₁ · V₁ = M₂ · V₂  and  Strength = M₁ × Molar Mass',
    steps: [
      'Step 1: Write balanced stoichiometric equation: HCl + NaOH → NaCl + H₂O (1:1 mole ratio)',
      'Step 2: Equate moles: M₁ × V₁ = M₂ × V₂',
      'Step 3: Solve for M₁: M₁ = (0.0985 M × 24.60 mL) / 25.00 mL = 0.0969 M',
      'Step 4: Compute strength: Strength = 0.0969 mol/L × 36.46 g/mol = 3.534 g/L',
    ],
    finalAnswer: '0.0969 M (3.53 g/L)',
    unit: 'M (mol/L)',
    explanation:
      'Because HCl and NaOH react in a strict 1:1 equimolar ratio, moles of NaOH delivered from burette equal moles of HCl originally present in the conical flask.',
  },
  commonMistakes: [
    {
      mistake: 'Leaving an air bubble in the burette tip nozzle below the stopcock',
      consequence: 'The air bubble gets displaced by liquid during titration, resulting in an erroneously high burette reading.',
      prevention: 'Open stopcock fully into a waste beaker before starting to rapidly flush out any air bubbles from the tip.',
    },
    {
      mistake: 'Blowing out the last droplet of liquid from the pipette tip',
      consequence: 'Volumetric transfer pipettes are calibrated to retain this tiny capillary volume; blowing it out delivers excess volume.',
      prevention: 'Touch the pipette tip against the inner wall of the conical flask for 3 seconds; do not blow into the bulb.',
    },
    {
      mistake: 'Adding too much indicator (e.g. 10 drops instead of 2)',
      consequence: 'Indicators are weak organic acids; excess indicator consumes titrant and shifts the apparent endpoint.',
      prevention: 'Add strictly 2 drops of phenolphthalein indicator.',
    },
  ],
  vivaQuestions: [
    {
      id: 'viva-titr-1',
      question: "Why can solid sodium hydroxide not be used as a primary standard in volumetric analysis?",
      options: [
        "It is highly hygroscopic and absorbs atmospheric moisture and carbon dioxide",
        "It decomposes spontaneously into metallic sodium and oxygen gas",
        "It does not dissolve completely in deionised water",
        "It has a molecular weight that is too low to weigh accurately",
      ],
      correctAnswerIndex: 0,
      explanation:
        "Sodium hydroxide is deliquescent and absorbs water vapor as well as acidic CO₂ from air to form Na₂CO₃, preventing accurate weighing.",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Recall properties of primary standards: must have high purity, constant composition, and be non-hygroscopic.",
    },
    {
      id: 'viva-titr-2',
      question: "Why should the conical flask NOT be rinsed with the acid solution before pipetting the acid into it?",
      options: [
        "Rinsing leaves residual drops of acid, increasing the actual number of acid moles present",
        "Rinsing causes the glass to become chemically etched",
        "Acid residue neutralises the phenolphthalein indicator before titration starts",
        "It creates surface tension that prevents drop coalescence",
      ],
      correctAnswerIndex: 0,
      explanation:
        "The pipette delivers an exact known volume (e.g. 20 mL). Any extra droplets from pre-rinsing the flask add unknown extra moles of acid, causing an overestimation of titrant volume.",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "Remember: burette and pipette are rinsed with their contents; conical flask is rinsed only with distilled water.",
    },
    {
      id: 'viva-titr-3',
      question: "What is the structural color change mechanism of phenolphthalein in basic solution?",
      options: [
        "Loss of protons opens the lactone ring, forming an extensively conjugated quinonoid dianion",
        "Reduction of the phenolic hydroxyl groups to form benzene rings",
        "Precipitation of colloidal dye particles that scatter red light",
        "Coordination with sodium ions to form an insoluble chelate",
      ],
      correctAnswerIndex: 0,
      explanation:
        "In alkaline solution (pH > 8.2), hydroxide ions deprotonate phenolphthalein, opening the internal lactone ring and creating an extended conjugated chromophore system that absorbs green light and transmits pink.",
      difficulty: 'hard',
      marks: 8,
      remediationHint: "Review indicator theory: Ostwald theory and quinonoid theory of acid-base indicators.",
    },
    {
      id: 'viva-titr-4',
      question: "Which indicator is suitable for the titration of a weak acid (such as acetic acid) against a strong base (NaOH)?",
      options: [
        "Phenolphthalein (pH transition 8.2 - 10.0)",
        "Methyl orange (pH transition 3.1 - 4.4)",
        "Methyl red (pH transition 4.2 - 6.3)",
        "Litmus paper (pH transition 5.0 - 8.0)",
      ],
      correctAnswerIndex: 0,
      explanation:
        "At equivalence point of weak acid-strong base titration, sodium acetate undergoes basic hydrolysis forming OH⁻ ions, yielding a basic pH (> 7, around 8.8), which falls within phenolphthalein’s range.",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "Salt hydrolysis of weak acid + strong base results in an alkaline equivalence point, necessitating an indicator in the basic range.",
    },
    {
      id: 'viva-titr-5',
      question: "What are concordant readings in volumetric analysis?",
      options: [
        "Two or more titre volumes that agree within 0.05 to 0.10 mL of each other",
        "The highest and lowest recorded volumes averaged together",
        "Readings that match the theoretical textbook value exactly",
        "Readings taken using two different brands of burettes",
      ],
      correctAnswerIndex: 0,
      explanation:
        "Concordant readings are consecutive experimental titre volumes that differ by no more than ±0.05 mL, demonstrating laboratory reproducibility.",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Precision requires closely agreeing replicate trials; erratic outliers are discarded.",
    },
  ],
  learningObjectives: [
    "Master precise volumetric techniques: burette filling, meniscus reading, dropwise control, and pipette transfer.",
    "Determine the molarity and concentration of an unknown hydrochloric acid solution using a standardised NaOH solution.",
    "Understand the distinction between theoretical stoichiometric equivalence point and experimental indicator endpoint.",
  ],
  expectedOutcomes: [
    "Attainment of 3 concordant titre readings within ±0.05 mL margin of reproducibility.",
    "Calculated molarity agreeing within ±1.5% of standard value.",
  ],
  importantFormulas: [
    { label: "Volumetric Equivalence", formula: "M₁ · V₁ / n₁ = M₂ · V₂ / n₂", description: "Stoichiometric relation connecting acid and base molarities and stoichiometric coefficients." },
    { label: "Concentration in g/L", formula: "Strength (g/L) = Molarity (mol/L) × Molar Mass (g/mol)", description: "Conversion of molar concentration to mass concentration." },
    { label: "pH Calculation", formula: "pH = -log₁₀[H⁺]", description: "Logarithmic measure of hydronium ion activity in aqueous solution." },
  ],
  rubric: {
    totalMarks: 100,
    labWorkMarks: 60,
    vivaMarks: 40,
    criteria: [
      { name: 'Glassware Handling & Pre-rinsing', category: 'lab-work', marks: 15, description: 'Correct rinsing protocol for burette, pipette, and conical flask; zero bubble in nozzle.' },
      { name: 'Titration Technique & Endpoint Catching', category: 'lab-work', marks: 20, description: 'Smooth swirling with continuous flow, dropwise finish, and sharp permanent faint pink endpoint.' },
      { name: 'Data Logging & Concordancy', category: 'lab-work', marks: 15, description: 'Tabulation of initial and final volumes with at least 2 concordant trials within 0.05 mL.' },
      { name: 'Stoichiometric Calculation & Units', category: 'lab-work', marks: 10, description: 'Error-free application of M₁V₁=M₂V₂ formula and correct derivation of strength in g/L.' },
      { name: 'Chemical Principles & Neutralisation Theory', category: 'viva-voce', marks: 20, description: 'Command of equivalence point, indicator pH ranges, and primary vs secondary standards.' },
      { name: 'Error Diagnosis & Remediation', category: 'viva-voce', marks: 10, description: 'Recognition of sources of error (air bubble, parallax, over-titration) and correct prevention.' },
      { name: 'Volumetric Calculations & Stoichiometry', category: 'viva-voce', marks: 10, description: 'Solving unseen dilution, molarity, and salt hydrolysis numerical problems accurately.' },
    ],
  },
};

const OSMOSIS_MEDIA: ExperimentSimulationMedia = {
  experimentId: 'osmosis',
  title: "Demonstration of Osmosis using a Potato Osmometer and Semi-permeable Membrane",
  subjectId: 'biology',
  gradeLevel: 'Class 11',
  totalDurationSeconds: 180, // 3 mins
  segments: [
    {
      id: 'intro',
      title: '1. Introduction & Biological Principle',
      startTime: 0,
      duration: 25,
      summary: "Understand osmosis as the passive diffusion of solvent molecules across a selectively permeable membrane.",
      keyPoints: [
        "Osmosis direction: higher water potential (hypotonic) to lower water potential (hypertonic)",
        "Living plant cell membranes act as selectively permeable barriers",
        "Turgor pressure and biological significance in plant support and nutrient transport",
      ],
      transcript:
        "Welcome to the biology virtual laboratory. In this experiment, we demonstrate osmosis using a potato osmometer. Osmosis is the net movement of water molecules from a region of higher water potential to a region of lower water potential across a selectively permeable membrane.",
    },
    {
      id: 'apparatus',
      title: '2. Preparation of Potato Cavity & Setup',
      startTime: 25,
      duration: 25,
      summary: "Peel large potato tuber, slice flat base, scoop out deep central cavity, and place in water-filled Petri dish.",
      keyPoints: [
        "Flat base ensures stable seating in Petri dish",
        "Thin cavity walls minimize diffusional distance for water transport",
        "Cavity filled with 20% concentrated sucrose solution",
      ],
      transcript:
        "We peel a large potato and cut the bottom flat to rest securely. We hollow out a cylindrical cavity from the top, leaving thin bottom and side walls. The cavity is filled with 20% sucrose solution, and an initial level pin is inserted.",
    },
    {
      id: 'procedure',
      title: '3. Procedure & Incubation Time',
      startTime: 50,
      duration: 25,
      summary: "Mark initial meniscus level with pin, submerge base in deionised water, and incubate undisturbed for 2 to 3 hours.",
      keyPoints: [
        "Petri dish contains pure water (hypotonic, water potential Ψ = 0 MPa)",
        "Cavity contains hypertonic sucrose solution (negative Ψ)",
        "Leave undisturbed without shaking to allow steady endosmotic flow",
      ],
      transcript:
        "Mark the starting level of the sucrose solution with a fine pin. Place the potato osmometer into a Petri dish containing distilled water. Allow the setup to stand undisturbed for 2 to 3 hours.",
    },
    {
      id: 'observation',
      title: '4. Observations & Osmotic Liquid Rise',
      startTime: 75,
      duration: 25,
      summary: "Observe substantial liquid rise inside the potato cavity; insert second pin at new liquid meniscus.",
      keyPoints: [
        "Liquid level inside cavity rises several millimeters",
        "Water level in external Petri dish decreases correspondingly",
        "Dead boiled potato controls show zero liquid rise, proving living cells are required",
      ],
      transcript:
        "Notice the liquid level inside the potato well has risen significantly above the initial pin. Water from the Petri dish has entered the potato cells by endosmosis and passed into the cavity, driven by the osmotic potential gradient.",
    },
    {
      id: 'explanation',
      title: '5. Water Potential & Thermodynamic Theory',
      startTime: 100,
      duration: 30,
      summary: "Mathematical model of water potential: Ψ_w = Ψ_s + Ψ_p and cellular osmoregulation.",
      keyPoints: [
        "Solute potential Ψ_s = -i · C · R · T (always negative for solutions)",
        "Water flows spontaneously down water potential gradient",
        "Equilibrium reached when hydrostatic pressure equals osmotic pressure difference",
      ],
      transcript:
        "The thermodynamic driving force is water potential. Pure water has the maximum water potential of zero. Adding sucrose solute lowers water potential to negative values. Water molecules diffuse down this free energy gradient until dynamic equilibrium is reached.",
    },
    {
      id: 'worked-example',
      title: '6. Solved Numerical Worked Example',
      startTime: 130,
      duration: 25,
      summary: "Calculate solute potential of a 0.25 M sucrose solution at 25°C using van 't Hoff equation.",
      keyPoints: [
        "Ψ_s = -i · C · R · T",
        "Sucrose van 't Hoff factor i = 1 (non-electrolyte)",
        "Gas constant R = 0.008314 L·MPa / (mol·K)",
      ],
      transcript:
        "Here is a solved example. For a 0.25 M sucrose solution at 298 Kelvin, with i = 1 and R = 0.008314, solute potential equals -1 × 0.25 × 0.008314 × 298 = -0.619 MPa. This explains the strong inward osmotic pressure.",
    },
    {
      id: 'mistakes',
      title: '7. Common Errors & Precautionary Measures',
      startTime: 155,
      duration: 25,
      summary: "Thick potato walls, boiled/dead tissues, punctured bottom, and meniscus parallax.",
      keyPoints: [
        "Never use boiled potatoes for the test (boiling denatures membrane proteins and ruptures tonoplasts)",
        "Ensure cavity wall thickness does not exceed 3 to 4 mm for observable rate",
        "Do not fill cavity to the brim; leave room for osmotic liquid expansion",
      ],
      transcript:
        "Common errors: Boiling kills cell membranes, rendering them freely permeable and destroying osmosis. Ensure the bottom of the potato is cut flat but not pierced through, which would cause simple hydrostatic leakage.",
    },
  ],
  workedExample: {
    problem:
      "A potato osmometer well is filled with 15 mL of 0.30 M sucrose solution at room temperature (25 °C = 298 K). Calculate the theoretical solute potential (Ψ_s) of the solution. If the external water has Ψ_w = 0, what is the net water potential difference driving endosmosis?",
    givenData: {
      'Sucrose concentration (C)': '0.30 mol/L',
      'Temperature (T)': '298 K',
      'Gas constant (R)': '0.008314 L·MPa/(mol·K)',
      "van 't Hoff factor (i)": '1 (sucrose does not dissociate)',
    },
    formula: 'Ψ_s = -i · C · R · T  and  ΔΨ_w = Ψ_external - Ψ_internal',
    steps: [
      'Step 1: Compute solute potential: Ψ_s = -1 × (0.30 mol/L) × (0.008314 L·MPa/(mol·K)) × (298 K)',
      'Step 2: Arithmetic: Ψ_s = -0.743 MPa',
      'Step 3: Internal water potential Ψ_w(int) ≈ Ψ_s = -0.743 MPa (initially zero turgor)',
      'Step 4: Water potential gradient: ΔΨ_w = 0 - (-0.743 MPa) = +0.743 MPa inward drive.',
    ],
    finalAnswer: '-0.743 MPa (Gradient = 0.743 MPa inward)',
    unit: 'Megapascals (MPa)',
    explanation:
      'The solute potential of the sucrose well is -0.743 MPa compared to 0 MPa for external deionised water, producing an intense osmotic pressure driving water through the potato parenchyma cells into the well.',
  },
  commonMistakes: [
    {
      mistake: 'Using a boiled or blanched potato as the primary osmometer',
      consequence: 'Boiling disrupts the lipid bilayer and denatures transport proteins, destroying selective permeability; no liquid rise occurs.',
      prevention: 'Always use fresh, viable, raw potato tubers for the active experiment; use boiled potato only as a negative control.',
    },
    {
      mistake: 'Carving excessively thick cavity walls (> 1 cm)',
      consequence: 'Water transport through living parenchyma tissue becomes exceedingly slow, showing negligible liquid rise in 2 hours.',
      prevention: 'Carefully scoop the cavity leaving uniform wall thickness of 3 to 4 mm.',
    },
    {
      mistake: 'Filling the sugar solution to the top edge of the potato cavity',
      consequence: 'Osmotic liquid overflow spills into the Petri dish, invalidating measurement.',
      prevention: 'Fill the cavity only half full and mark the meniscus clearly with an insertion pin.',
    },
  ],
  vivaQuestions: [
    {
      id: 'viva-osmo-1',
      question: "What differentiates osmosis from general diffusion?",
      options: [
        "Osmosis specifically involves solvent movement across a selectively permeable membrane",
        "Osmosis requires metabolic ATP expenditure",
        "Osmosis only occurs at boiling temperatures",
        "Osmosis involves active solute pumping",
      ],
      correctAnswerIndex: 0,
      explanation:
        "Osmosis is a special class of passive diffusion wherein solvent molecules (water) traverse a selectively permeable membrane down their chemical potential gradient without requiring energy.",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Focus on the two defining criteria: solvent transport and presence of a semi-permeable membrane.",
      relevantSegmentId: 'intro',
    },
    {
      id: 'viva-osmo-2',
      question: "What would happen if a boiled potato is used instead of a fresh raw potato?",
      options: [
        "No liquid rise will occur because cell membranes are destroyed and lose selective permeability",
        "Liquid will rise twice as fast due to increased pore sizes",
        "Water will evaporate instantly from the cavity",
        "The cavity will turn blue due to iodine release",
      ],
      correctAnswerIndex: 0,
      explanation:
        "High temperature ruptures plasma membranes and tonoplasts, killing the cells and destroying their selective permeability so osmosis cannot occur.",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Selective permeability is a property of intact, living biological membranes.",
      relevantSegmentId: 'procedure',
    },
    {
      id: 'viva-osmo-3',
      question: "What is the relationship between water potential (Ψ_w), solute potential (Ψ_s), and pressure potential (Ψ_p)?",
      options: [
        "Ψ_w = Ψ_s + Ψ_p",
        "Ψ_w = Ψ_s - Ψ_p",
        "Ψ_w = Ψ_s × Ψ_p",
        "Ψ_w = Ψ_s / Ψ_p",
      ],
      correctAnswerIndex: 0,
      explanation:
        "Water potential of plant cells is mathematically given by the sum of solute potential (osmotic potential, always ≤ 0) and pressure potential (turgor pressure, usually ≥ 0).",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "Review plant water relations: water potential equation Ψ_w = Ψ_s + Ψ_p.",
      relevantSegmentId: 'worked-example',
    },
    {
      id: 'viva-osmo-4',
      question: "What happens to a plant cell placed in a strongly hypertonic solution?",
      options: [
        "Exosmosis occurs and the cell undergoes plasmolysis as the protoplast shrinks away from the cell wall",
        "Endosmosis causes the cell to swell and immediately lyse",
        "The cell wall dissolves completely",
        "Photosynthesis accelerates to compensate for water loss",
      ],
      correctAnswerIndex: 0,
      explanation:
        "In a hypertonic medium, water moves out of the vacuole by exosmosis; protoplast contracts away from the rigid cellulosic cell wall, a state called plasmolysis.",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "Exosmosis leads to flaccidity and plasmolysis in plant cells with rigid walls.",
      relevantSegmentId: 'explanation',
    },
    {
      id: 'viva-osmo-5',
      question: "Why does pure water have the highest possible water potential of zero at atmospheric pressure?",
      options: [
        "Because water molecules have maximum free energy with no solutes restricting their kinetic motion",
        "Because pure water contains zero hydrogen bonds",
        "Because gravitational potential cancels solute potential in pure water",
        "Because pure water has a pH of exactly 7",
      ],
      correctAnswerIndex: 0,
      explanation:
        "By international thermodynamic convention, pure water at standard temperature and atmospheric pressure has a water potential of zero. Adding solute particles lowers the chemical free energy of water, making Ψ_w negative.",
      difficulty: 'hard',
      marks: 8,
      remediationHint: "Water potential is a measure of free energy per unit volume relative to pure free water.",
      relevantSegmentId: 'mistakes',
    },
  ],
  learningObjectives: [
    "Demonstrate endosmosis through living plant tissue using a potato osmometer.",
    "Explain the concepts of hypotonic, hypertonic, and isotonic environments in relation to water potential.",
    "Verify experimentally that living, intact semi-permeable membranes are indispensable for osmosis.",
  ],
  expectedOutcomes: [
    "Observable rise of sugar solution level inside potato cavity over 2 hours.",
    "Contrast with zero level rise in control setup using boiled potato.",
  ],
  importantFormulas: [
    { label: "Water Potential Equation", formula: "Ψ_w = Ψ_s + Ψ_p", description: "Total water potential equals solute potential plus hydrostatic pressure potential." },
    { label: "van 't Hoff Solute Potential", formula: "Ψ_s = -i · C · R · T", description: "Solute potential calculation based on molarity, temperature, and ionization." },
    { label: "Rate of Endosmosis", formula: "Rate = ΔV / Δt", description: "Volume of solvent transported across tissue per unit incubation time." },
  ],
  rubric: {
    totalMarks: 100,
    labWorkMarks: 60,
    vivaMarks: 40,
    criteria: [
      { name: 'Dissection & Osmometer Preparation', category: 'lab-work', marks: 15, description: 'Uniform cavity carving without puncturing the base, thin walls (3-4 mm), flat seating.' },
      { name: 'Experimental Rig Assembly & Pin Marking', category: 'lab-work', marks: 20, description: 'Correct placement of initial pin, solution preparation, and undisturbed incubation.' },
      { name: 'Measurement Precision & Control Verification', category: 'lab-work', marks: 15, description: 'Accurate meniscus rise recording and parallel boiled potato negative control setup.' },
      { name: 'Data Tabulation & Graphical Rate Analysis', category: 'lab-work', marks: 10, description: 'Calculated liquid rise per hour, water potential derivation, and result summary.' },
      { name: 'Biophysical Understanding of Osmosis', category: 'viva-voce', marks: 20, description: 'Clear explanation of semi-permeable membranes, water potential, and driving forces.' },
      { name: 'Biological Application & Plasmolysis Theory', category: 'viva-voce', marks: 10, description: 'Understanding turgor pressure, stomatal opening, and root water absorption.' },
      { name: 'Water Potential Numerical Calculations', category: 'viva-voce', marks: 10, description: 'Accurate calculation of solute potential (Ψ_s) using van ’t Hoff formula.' },
    ],
  },
};

const QUADRATIC_MEDIA: ExperimentSimulationMedia = {
  experimentId: 'quadratic',
  title: "Graphical and Algebraic Exploration of Quadratic Equations and Parabolic Trajectories",
  subjectId: 'mathematics',
  gradeLevel: 'Class 10',
  totalDurationSeconds: 200, // 3 mins 20 secs
  segments: [
    {
      id: 'intro',
      title: '1. Introduction & Standard Form',
      startTime: 0,
      duration: 30,
      summary: "Explore the quadratic function f(x) = ax² + bx + c and geometrical properties of parabolas.",
      keyPoints: [
        "Standard quadratic form: ax² + bx + c = 0, where a ≠ 0",
        "Sign of leading coefficient 'a' determines concavity (upward vs downward)",
        "Roots represent x-intercepts where f(x) = 0",
      ],
      transcript:
        "Welcome to the mathematics virtual laboratory. Today, we investigate quadratic equations both geometrically and algebraically. The function f(x) = ax² + bx + c produces a symmetrical curve called a parabola whose x-intercepts reveal the roots of the equation.",
    },
    {
      id: 'apparatus',
      title: '2. Interactive Grapher & Coordinate Plane',
      startTime: 30,
      duration: 30,
      summary: "Understand the coordinate axes, vertex locator, axis of symmetry, and dynamic parameter sliders.",
      keyPoints: [
        "Parameter 'a' governs vertical stretching and orientation",
        "Parameter 'b' shifts the axis of symmetry horizontally and vertically",
        "Parameter 'c' determines the exact y-intercept at (0, c)",
      ],
      transcript:
        "On our virtual graphing canvas, you can adjust sliders for coefficients a, b, and c. Observe how varying 'a' dilates or reflects the parabola across the x-axis, while changing 'c' translates the entire parabola vertically.",
    },
    {
      id: 'procedure',
      title: '3. Locating Vertex & Axis of Symmetry',
      startTime: 60,
      duration: 30,
      summary: "Derive coordinates of the turning point: x_v = -b / (2a) and y_v = -D / (4a).",
      keyPoints: [
        "Axis of symmetry is vertical line x = -b / (2a)",
        "Vertex represents global minimum (when a > 0) or global maximum (when a < 0)",
        "Symmetry implies roots are equidistant from the vertex line",
      ],
      transcript:
        "The turning point of the parabola is called its vertex. Its x-coordinate is given by -b over 2a. Because parabolas possess perfect bilateral symmetry, any two points with equal y-values are equidistant from this central line.",
    },
    {
      id: 'observation',
      title: '4. Discriminant & Nature of Roots',
      startTime: 90,
      duration: 30,
      summary: "Analyze the discriminant D = b² - 4ac and observe intersection with the x-axis.",
      keyPoints: [
        "D > 0: Two distinct real roots (parabola crosses x-axis at 2 points)",
        "D = 0: Two equal real roots (parabola touches x-axis at vertex)",
        "D < 0: No real roots / complex conjugate roots (parabola does not meet x-axis)",
      ],
      transcript:
        "The discriminant D = b² - 4ac governs the nature of the roots. When D is positive, the parabola cuts through the x-axis twice. When D is zero, the vertex sits right on the x-axis. When D is negative, the entire curve floats above or below the axis.",
    },
    {
      id: 'explanation',
      title: '5. Completing the Square & Quadratic Formula',
      startTime: 120,
      duration: 30,
      summary: "Algebraic derivation of the quadratic formula from completing the square.",
      keyPoints: [
        "ax² + bx + c = 0 ⇒ x² + (b/a)x + (b/2a)² = (b² - 4ac) / 4a²",
        "x = [-b ± √(b² - 4ac)] / (2a)",
        "Sum of roots α + β = -b/a; Product of roots α·β = c/a",
      ],
      transcript:
        "By completing the square on the general quadratic equation, we derive the celebrated quadratic formula: x equals minus b plus or minus square root of b squared minus 4ac, all divided by 2a.",
    },
    {
      id: 'worked-example',
      title: '6. Solved Numerical Worked Example',
      startTime: 150,
      duration: 25,
      summary: "Solve 2x² - 7x + 3 = 0 using the quadratic formula and locate vertex coordinates.",
      keyPoints: [
        "Coefficients: a = 2, b = -7, c = 3",
        "Discriminant D = (-7)² - 4(2)(3) = 49 - 24 = 25",
        "Roots: x = (7 ± 5) / 4 ⇒ x₁ = 3, x₂ = 0.5",
      ],
      transcript:
        "Let us solve 2x² - 7x + 3 = 0. The discriminant is 49 - 24 = 25, which is a perfect square, indicating rational roots. Evaluating gives x = (7 ± 5)/4, yielding roots x = 3 and x = 0.5. The vertex is at (1.75, -3.125).",
    },
    {
      id: 'mistakes',
      title: '7. Common Algebraic Errors & Pitfalls',
      startTime: 175,
      duration: 25,
      summary: "Sign errors with negative b, neglecting ± sign, and dividing only the radical by 2a.",
      keyPoints: [
        "If b is negative, -b becomes positive: -(-7) = +7",
        "The denominator 2a divides BOTH terms: (-b) AND √(D)",
        "Do not square negative numbers without parentheses: (-7)² = +49, not -49",
      ],
      transcript:
        "Watch out for common algebra errors: forgetting that -b flips sign when b is already negative, and failing to divide the entire numerator by 2a. Always verify that your graphical x-intercepts match your algebraic roots.",
    },
  ],
  workedExample: {
    problem:
      "Given the quadratic function f(x) = 2x² - 8x + 6, find: (a) the nature of the roots, (b) the coordinates of the vertex, (c) the exact roots using the quadratic formula, and (d) the y-intercept.",
    givenData: {
      'Coefficient a': '2',
      'Coefficient b': '-8',
      'Coefficient c': '6',
    },
    formula: 'D = b² - 4ac,  x = [-b ± √D] / (2a),  Vertex = (-b/2a, -D/4a)',
    steps: [
      'Step 1: Compute discriminant D = (-8)² - 4(2)(6) = 64 - 48 = 16 > 0 (Two distinct real roots)',
      'Step 2: Find vertex x-coordinate: x_v = -(-8) / (2 × 2) = 8 / 4 = 2.0',
      'Step 3: Find vertex y-coordinate: f(2) = 2(2)² - 8(2) + 6 = 8 - 16 + 6 = -2.0. Vertex = (2, -2)',
      'Step 4: Solve for roots: x = [8 ± √16] / (2 × 2) = [8 ± 4] / 4 ⇒ x₁ = 12/4 = 3, x₂ = 4/4 = 1',
      'Step 5: y-intercept: f(0) = c = 6, coordinate (0, 6).',
    ],
    finalAnswer: 'Roots: x = 1 and x = 3; Vertex: (2, -2); y-intercept: (0, 6)',
    unit: 'Dimensionless (Coordinates)',
    explanation:
      'The discriminant D = 16 is positive, so the parabola intersects the x-axis at two distinct real values x = 1 and x = 3, symmetric about x = 2.',
  },
  commonMistakes: [
    {
      mistake: 'Flipping the sign incorrectly when substituting negative b into -b',
      consequence: 'Yields completely wrong root values shifted symmetrically across the origin.',
      prevention: 'Always write -(-b) with brackets: e.g. -(-8) = +8.',
    },
    {
      mistake: 'Dividing only the square root portion by 2a rather than the entire numerator',
      consequence: 'Violates the distributive law of division: x ≠ -b ± (√D / 2a).',
      prevention: 'Write the entire expression over 2a as a single unified fraction.',
    },
    {
      mistake: 'Assuming D < 0 means the equation has no solution at all',
      consequence: 'Overlooks complex and imaginary conjugate root pairs in higher mathematics.',
      prevention: 'State clearly that D < 0 means no REAL roots exist, but two complex roots exist.',
    },
  ],
  vivaQuestions: [
    {
      id: 'viva-quad-1',
      question: "What does the discriminant D = b² - 4ac reveal about the graph of y = ax² + bx + c?",
      options: [
        "The number and nature of x-intercepts where the parabola meets the x-axis",
        "The exact height of the y-intercept",
        "The width of the focal aperture",
        "The rate of rotational symmetry",
      ],
      correctAnswerIndex: 0,
      explanation:
        "The discriminant indicates whether the curve crosses the x-axis at 2 points (D > 0), touches at 1 point (D = 0), or does not intersect the x-axis at all (D < 0).",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Roots correspond geometrically to the points where f(x) = 0 (the x-intercepts).",
    },
    {
      id: 'viva-quad-2',
      question: "If the roots of ax² + bx + c = 0 are α and β, what is their sum (α + β)?",
      options: [
        "-b / a",
        "c / a",
        "b / (2a)",
        "-c / b",
      ],
      correctAnswerIndex: 0,
      explanation:
        "By Vieta's formulas, expanding a(x - α)(x - β) = ax² - a(α + β)x + a(αβ) shows that α + β = -b/a.",
      difficulty: 'easy',
      marks: 8,
      remediationHint: "Vieta's relations: sum of roots = -b/a; product of roots = c/a.",
    },
    {
      id: 'viva-quad-3',
      question: "What is the equation of the axis of symmetry for any parabola y = ax² + bx + c?",
      options: [
        "x = -b / (2a)",
        "x = -d / (4a)",
        "y = -b / (2a)",
        "x = c / a",
      ],
      correctAnswerIndex: 0,
      explanation:
        "The vertical line of symmetry passes right through the vertex at x = -b / (2a).",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "The axis of symmetry lies midway between the roots: (-b - √D + -b + √D) / (4a) = -b / (2a).",
    },
    {
      id: 'viva-quad-4',
      question: "For what condition will a quadratic curve touch the x-axis at exactly one point?",
      options: [
        "When D = b² - 4ac = 0 (perfect square trinomial)",
        "When a = 0 and b = 0",
        "When c = 0 only",
        "When b = 0 and c > 0",
      ],
      correctAnswerIndex: 0,
      explanation:
        "When the discriminant is zero, the radical term vanishes, leaving two coincident real roots at x = -b / (2a).",
      difficulty: 'medium',
      marks: 8,
      remediationHint: "Touching the x-axis tangentially signifies two identical (coincident) roots.",
    },
    {
      id: 'viva-quad-5',
      question: "If a ball is thrown vertically upward with height h(t) = -5t² + 20t + 2, at what time does it reach maximum height?",
      options: [
        "t = 2.0 seconds",
        "t = 4.0 seconds",
        "t = 1.0 second",
        "t = 20.0 seconds",
      ],
      correctAnswerIndex: 0,
      explanation:
        "Maximum occurs at the vertex: t_max = -b / (2a) = -20 / [2 × (-5)] = -20 / (-10) = 2.0 seconds.",
      difficulty: 'hard',
      marks: 8,
      remediationHint: "Apply vertex formula t = -b / (2a) to projectile equations under gravity.",
    },
  ],
  learningObjectives: [
    "Visualize how coefficients a, b, and c alter the shape, orientation, and position of parabolic curves.",
    "Solve quadratic equations using factoring, completing the square, and the quadratic formula.",
    "Relate the algebraic discriminant D = b² - 4ac to graphical x-intercepts and real-world projectile trajectories.",
  ],
  expectedOutcomes: [
    "Precise determination of roots, vertex, and axis of symmetry.",
    "Accurate classification of root nature using discriminant criteria.",
  ],
  importantFormulas: [
    { label: "Quadratic Formula", formula: "x = [-b ± √(b² - 4ac)] / (2a)", description: "Universal closed-form solution for any quadratic equation." },
    { label: "Discriminant", formula: "D = b² - 4ac", description: "Determines whether roots are distinct real (D>0), equal real (D=0), or non-real (D<0)." },
    { label: "Vertex Coordinates", formula: "V = (-b / 2a, -D / 4a)", description: "Coordinates of the global maximum or minimum turning point." },
  ],
  rubric: {
    totalMarks: 100,
    labWorkMarks: 60,
    vivaMarks: 40,
    criteria: [
      { name: 'Coordinate Plane & Parameter Manipulation', category: 'lab-work', marks: 15, description: 'Accurate adjustment of sliders and observation of concavity and vertex shifts.' },
      { name: 'Root Localization & Graphical Verification', category: 'lab-work', marks: 20, description: 'Identifying x-intercepts and verifying symmetry about the vertical axis x = -b/2a.' },
      { name: 'Observation Journal & Discriminant Table', category: 'lab-work', marks: 15, description: 'Correct logging of a, b, c, D values and corresponding geometric behaviors.' },
      { name: 'Error Analysis & Non-real Roots Understanding', category: 'lab-work', marks: 10, description: 'Accurate explanation of floating curves when D < 0 and rational root criteria.' },
      { name: 'Theoretical & Algebraic Mastery', category: 'viva-voce', marks: 20, description: 'Fluency in completing the square, Vieta’s formulas, and derivation of quadratic formula.' },
      { name: 'Graphical Interpretation & Trajectory Analysis', category: 'viva-voce', marks: 10, description: 'Relating parabola geometry to kinematics and projectile vertex calculations.' },
      { name: 'Numerical Problem Solving & Sign Precision', category: 'viva-voce', marks: 10, description: 'Error-free computation with negative signs and radical simplification.' },
    ],
  },
};

// -----------------------------------------------------------------------------
// PROCEDURAL SIMULATION MEDIA GENERATOR FOR ALL REMAINING EXPERIMENTS
// -----------------------------------------------------------------------------

function generateProceduralMedia(experimentId: string): ExperimentSimulationMedia {
  const exp = getExperimentById(experimentId);
  const title = exp ? exp.title : experimentId.replace(/-/g, ' ');
  const subjectId = exp ? exp.subjectId : 'physics';
  const gradeLevel = exp ? exp.gradeLevel : 'Class 11';
  const principle = exp?.keyFormulaOrPrinciple || 'Fundamental Conservation and Analytical Laws';
  const duration = 180; // 3 mins default

  const apparatusNames = exp?.apparatus?.map((a) => a.name).join(', ') || 'Laboratory equipment, measuring instruments, and test bench';

  return {
    experimentId,
    title,
    subjectId,
    gradeLevel,
    totalDurationSeconds: duration,
    segments: [
      {
        id: 'intro',
        title: '1. Introduction & Learning Objectives',
        startTime: 0,
        duration: 25,
        summary: `Comprehensive overview of ${title} and core curriculum competencies.`,
        keyPoints: [
          `Understand fundamental scientific principle: ${principle}`,
          `Identify primary physical and chemical variables under investigation`,
          `Formulate working hypothesis and expected outcome`,
        ],
        transcript: `Welcome to the virtual laboratory for ${title}. In this experiment, we explore the governing laws, experimental methodology, and quantitative derivations for ${title}.`,
      },
      {
        id: 'apparatus',
        title: '2. Apparatus & Experimental Setup',
        startTime: 25,
        duration: 25,
        summary: `Inspection and alignment of apparatus: ${apparatusNames}.`,
        keyPoints: [
          `Verify instrument zero-calibration and least count`,
          `Assemble laboratory components according to standard safety guidelines`,
          `Eliminate systematic parallax and environmental fluctuations`,
        ],
        transcript: `Examine the apparatus assembled on our workbench: ${apparatusNames}. Ensure each component is securely mounted, clean, and calibrated before beginning observations.`,
      },
      {
        id: 'procedure',
        title: '3. Step-by-Step Procedure Demonstration',
        startTime: 50,
        duration: 25,
        summary: `Sequential execution of experimental procedure following standard board guidelines.`,
        keyPoints: [
          `Systematic adjustment of independent variables`,
          `Maintain controlled parameters constant throughout all trials`,
          `Perform at least 3 to 5 replicate readings for statistical reliability`,
        ],
        transcript: `Follow the step-by-step procedure carefully. We introduce controlled incremental changes to the setup, allow equilibrium to establish, and record corresponding dependent readings.`,
      },
      {
        id: 'observation',
        title: '4. Observations & Measurements',
        startTime: 75,
        duration: 25,
        summary: `Tabulate experimental observations, apply instrument corrections, and calculate mean values.`,
        keyPoints: [
          `Log raw readings directly into the observation table`,
          `Apply zero-correction factor: Corrected Reading = Observed Reading - Zero Error`,
          `Calculate mean value and estimate standard uncertainty`,
        ],
        transcript: `Our observation table logs primary measurements across consecutive trials. Notice the high degree of reproducibility and consistency across trials.`,
      },
      {
        id: 'explanation',
        title: '5. Scientific Law & Theory Explanation',
        startTime: 100,
        duration: 30,
        summary: `Theoretical foundation, mathematical derivation, and governing equations.`,
        keyPoints: [
          `Underlying law: ${principle}`,
          `Analysis of physical boundaries and valid operational regimes`,
          `Correlation between experimental observations and analytical predictions`,
        ],
        transcript: `The underlying scientific law establishes a deterministic mathematical relationship between the variables. When physical conditions remain controlled, the system strictly follows theoretical equations.`,
      },
      {
        id: 'worked-example',
        title: '6. Solved Numerical Worked Example',
        startTime: 130,
        duration: 25,
        summary: `Step-by-step arithmetic solution demonstrating calculation from real experimental data.`,
        keyPoints: [
          `List given parameters with appropriate SI units`,
          `Substitute values into standard formula`,
          `Report final result with correct significant figures`,
        ],
        transcript: `Let us work through a representative numerical example using typical experimental data points to calculate the desired physical or chemical constant.`,
      },
      {
        id: 'mistakes',
        title: '7. Common Errors & Precautionary Measures',
        startTime: 155,
        duration: 25,
        summary: `Common sources of experimental error, safety hazards, and preventive techniques.`,
        keyPoints: [
          `Avoid parallax error by viewing scales strictly perpendicular to the pointer`,
          `Prevent zero-drift by securing connections and stabilizing temperature`,
          `Follow laboratory safety protocol including eye protection and cautious reagent handling`,
        ],
        transcript: `Be vigilant of common laboratory mistakes: viewing scales at an angle introduces parallax error, loose contacts cause fluctuations, and neglecting zero errors shifts all readings systematically.`,
      },
    ],
    workedExample: {
      problem: `Using standard experimental data recorded for ${title}, determine the primary physical or chemical constant and calculate the percentage error relative to the accepted standard value.`,
      givenData: {
        'Trial 1 Reading': '12.45 units',
        'Trial 2 Reading': '12.50 units',
        'Trial 3 Reading': '12.48 units',
        'Standard Reference Value': '12.50 units',
      },
      formula: 'Mean Value = (Σ X_i) / N   and   Percentage Error = (|Observed - Standard| / Standard) × 100%',
      steps: [
        'Step 1: Calculate arithmetic mean of concordant trials: (12.45 + 12.50 + 12.48) / 3 = 12.477 units',
        'Step 2: Determine absolute error: |12.477 - 12.500| = 0.023 units',
        'Step 3: Compute relative percentage discrepancy: (0.023 / 12.500) × 100% = 0.184%',
      ],
      finalAnswer: '12.48 units (Percentage error: 0.18%)',
      unit: 'Standard SI Units',
      explanation: `The mean experimental value of 12.48 units demonstrates outstanding agreement with the theoretical benchmark of 12.50 units with less than 0.2% discrepancy.`,
    },
    commonMistakes: [
      {
        mistake: 'Failing to inspect and subtract instrument zero error before taking measurements',
        consequence: 'Introduces a constant systematic bias across all subsequent readings and tables.',
        prevention: 'Record zero error before starting and apply algebraic correction to every observed value.',
      },
      {
        mistake: 'Reading linear or graduated scales at an angle (parallax error)',
        consequence: 'Generates random visual errors up to 1-2 least count divisions.',
        prevention: 'Keep your line of sight strictly perpendicular to the scale and meniscus at all times.',
      },
      {
        mistake: 'Taking only a single reading instead of multiple replicate trials',
        consequence: 'Unnoticed transient fluctuations or disturbances cause large undetected errors.',
        prevention: 'Always record at least 3 concordant readings and calculate the mean.',
      },
    ],
    vivaQuestions: [
      {
        id: `viva-${experimentId}-1`,
        question: `What is the principal governing scientific law behind ${title}?`,
        options: [
          principle,
          "Newton's Fourth Law of Universal Kinetics",
          "The Law of Constant Indeterminacy",
          "Archimedes' Hydrostatic Resonance Principle",
        ],
        correctAnswerIndex: 0,
        explanation: `The core governing principle for this experiment is: ${principle}.`,
        difficulty: 'easy',
        marks: 8,
        remediationHint: `Review the theoretical principle: ${principle}.`,
        relevantSegmentId: 'intro',
      },
      {
        id: `viva-${experimentId}-2`,
        question: "How does instrument least count impact experimental precision?",
        options: [
          "Smaller least count allows finer measurements and reduces maximum reading uncertainty",
          "Larger least count eliminates human parallax error",
          "Least count has no effect on measurement precision",
          "Least count only matters in optical microscopy",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Least count represents the smallest value that can be directly resolved by an instrument; smaller least count yields higher measurement resolution.",
        difficulty: 'easy',
        marks: 8,
        remediationHint: "Least count definition: Value of one main scale division divided by total vernier/circular scale divisions.",
        relevantSegmentId: 'apparatus',
      },
      {
        id: `viva-${experimentId}-3`,
        question: "What is the difference between systematic error and random error?",
        options: [
          "Systematic error shifts readings consistently in one direction, while random error causes unpredictable scatter",
          "Systematic error can never be corrected, while random error is always zero in virtual labs",
          "Random error is caused exclusively by electronic noise in DC supplies",
          "Systematic error occurs only in chemistry titrations",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Systematic errors (such as zero error or miscalibration) affect measurements by a constant magnitude and sign, whereas random errors fluctuate unpredictably.",
        difficulty: 'medium',
        marks: 8,
        remediationHint: "Recall error classification: systematic errors are reproducible and eliminable; random errors are treated statistically.",
        relevantSegmentId: 'explanation',
      },
      {
        id: `viva-${experimentId}-4`,
        question: "Why is taking the mean of multiple concordant readings beneficial?",
        options: [
          "It statistically minimizes random fluctuations and improves result reliability",
          "It automatically eliminates instrument zero error",
          "It multiplies the effective range of the instrument",
          "It converts non-linear behavior into linear behavior",
        ],
        correctAnswerIndex: 0,
        explanation:
          "According to statistical error theory, taking the mean of N independent trials reduces the standard error of the mean by a factor of √N.",
        difficulty: 'medium',
        marks: 8,
        remediationHint: "Error of the mean decreases proportionally to 1/√N as sample size N increases.",
        relevantSegmentId: 'observation',
      },
      {
        id: `viva-${experimentId}-5`,
        question: "Which precaution is most critical for ensuring data integrity during this experiment?",
        options: [
          "Maintaining controlled ambient parameters and recording data without preconceived bias",
          "Adjusting readings to match the theoretical answer exactly",
          "Ignoring outliers without recording them",
          "Operating instruments at their absolute maximum rated capacity",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Scientific rigor requires keeping independent environmental variables stable and faithfully logging genuine observations without fabricating numbers.",
        difficulty: 'hard',
        marks: 8,
        remediationHint: "Scientific integrity demands recording genuine observations and accounting for deviations analytically.",
        relevantSegmentId: 'mistakes',
      },
    ],
    learningObjectives: [
      `Master experimental technique and apparatus handling for ${title}.`,
      `Verify the governing relationship: ${principle}.`,
      `Perform statistical data logging, error analysis, and quantitative deductions.`,
    ],
    expectedOutcomes: [
      `Successful experimental completion with high reproducibility across repeated trials.`,
      `Final derived constant or observation matching standard reference values within ±2% margin.`,
    ],
    importantFormulas: [
      { label: "Governing Law", formula: principle, description: `Mathematical statement governing ${title}.` },
      { label: "Arithmetic Mean", formula: "X_mean = (1/N) · Σ X_i", description: "Average of multiple concordant readings." },
      { label: "Percentage Error", formula: "% Error = (|X_exp - X_ref| / X_ref) × 100%", description: "Discrepancy relative to standard reference value." },
    ],
    rubric: {
      totalMarks: 100,
      labWorkMarks: 60,
      vivaMarks: 40,
      criteria: [
        { name: 'Apparatus Setup & Instrument Calibration', category: 'lab-work', marks: 15, description: 'Proper inspection, zero-calibration, and setup assembly.' },
        { name: 'Experimental Execution & Procedure Control', category: 'lab-work', marks: 20, description: 'Systematic manipulation of controls, adherence to protocol, and sample handling.' },
        { name: 'Data Logging & Observation Tabulation', category: 'lab-work', marks: 15, description: 'Neat, structured recording of raw values, zero corrections, and concordant runs.' },
        { name: 'Calculations & Error Analysis', category: 'lab-work', marks: 10, description: 'Correct formula application, significant figure tracking, and percentage error computation.' },
        { name: 'Theoretical Mastery of Scientific Law', category: 'viva-voce', marks: 20, description: 'Clear conceptual grasp of underlying physics, chemistry, biology, or mathematical laws.' },
        { name: 'Troubleshooting & Precautionary Knowledge', category: 'viva-voce', marks: 10, description: 'Ability to identify sources of error, hazard prevention, and remediation techniques.' },
        { name: 'Quantitative Application & Numerical Questions', category: 'viva-voce', marks: 10, description: 'Accurate analytical problem solving and numerical reasoning.' },
      ],
    },
  };
}

// -----------------------------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------------------------

const REGISTRY: Record<string, ExperimentSimulationMedia> = {
  'ohms-law': OHMS_LAW_MEDIA,
  'acid-base-titration': ACID_BASE_TITRATION_MEDIA,
  'osmosis': OSMOSIS_MEDIA,
  'bio-osmosis': OSMOSIS_MEDIA,
  'quadratic': QUADRATIC_MEDIA,
};

/**
 * Retrieves the complete simulation media package for an experiment.
 * Returns verified flagship media if registered, or procedurally generated
 * high-fidelity media for any of the 52+ STEM experiments in PrayogaProof.
 */
export function getSimulationMedia(experimentId: string): ExperimentSimulationMedia {
  if (REGISTRY[experimentId]) {
    return REGISTRY[experimentId];
  }
  return generateProceduralMedia(experimentId);
}
