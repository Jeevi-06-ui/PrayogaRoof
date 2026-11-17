/**
 * Electrochemistry & Galvanic Cell Scientific Model
 * Curriculum: CBSE Class 12 Chemistry Practical (Daniell Cell EMF and Nernst Equation)
 * 
 * Galvanic Daniell Cell:
 * Anode (Oxidation):  Zn(s) -> Zn2+(aq) + 2e-    [E°red = -0.763 V]
 * Cathode (Reduction): Cu2+(aq) + 2e- -> Cu(s)   [E°red = +0.340 V]
 * Net Cell Reaction:  Zn(s) + Cu2+(aq) -> Zn2+(aq) + Cu(s)  [n = 2]
 * 
 * Standard Cell Potential:
 * E°cell = E°cathode - E°anode = +0.340 V - (-0.763 V) = +1.103 V ≈ 1.100 V
 * 
 * Nernst Equation at 298.15 K (25°C):
 * E_cell = E°cell - (0.05916 / n) * log10([Zn2+] / [Cu2+])
 * 
 * Circuit Rules:
 * 1. Open circuit (salt bridge omitted): EMF = 0.000 V.
 * 2. Reversed meter polarity: EMF = -E_cell.
 * 3. Salt bridge allows migration of K+ and Cl- to prevent charge accumulation.
 */

export interface HalfCellDefinition {
  metal: string;
  ion: string;
  standardReductionPotential: number; // Volts
  color: string;
  solutionColor: string;
}

export const HALF_CELLS: Record<string, HalfCellDefinition> = {
  zinc: {
    metal: 'Zinc (Zn)',
    ion: 'Zn²⁺',
    standardReductionPotential: -0.763,
    color: '#94a3b8',
    solutionColor: '#f1f5f9', // Colorless
  },
  copper: {
    metal: 'Copper (Cu)',
    ion: 'Cu²⁺',
    standardReductionPotential: +0.340,
    color: '#b45309',
    solutionColor: '#0284c7', // Bright blue CuSO4
  },
  silver: {
    metal: 'Silver (Ag)',
    ion: 'Ag⁺',
    standardReductionPotential: +0.799,
    color: '#e2e8f0',
    solutionColor: '#f8fafc',
  },
  iron: {
    metal: 'Iron (Fe)',
    ion: 'Fe²⁺',
    standardReductionPotential: -0.440,
    color: '#64748b',
    solutionColor: '#bbf7d0', // Pale green FeSO4
  },
};

export interface DaniellCellParams {
  anodeMetal?: string; // default 'zinc'
  cathodeMetal?: string; // default 'copper'
  zincConcentrationM: number; // e.g. 0.01, 0.1, 1.0 M
  copperConcentrationM: number; // e.g. 0.01, 0.1, 1.0 M
  saltBridgeInserted: boolean;
  saltBridgeElectrolyte?: 'kcl' | 'kno3' | 'nh4no3';
  temperatureC?: number; // default 25.0°C
  voltmeterPolarityReversed?: boolean;
}

export interface DaniellCellState {
  standardEmfVolts: number;
  measuredEmfVolts: number;
  reactionQuotientQ: number;
  logQ: number;
  temperatureC: number;
  electronsTransferred: number;
  anodeHalfEquation: string;
  cathodeHalfEquation: string;
  netEquation: string;
  circuitClosed: boolean;
  voltmeterReadingText: string;
  observationStatus: string;
  anodeSolutionColor: string;
  cathodeSolutionColor: string;
  standardNernstPoints: Array<{ znConc: number; cuConc: number; logQ: number; emf: number }>;
  assumptions: string[];
}

export const ELECTROCHEMISTRY_ASSUMPTIONS = [
  'Electrolyte activities are approximated by molar concentrations in dilute aqueous media.',
  'Liquid junction potential is minimized and rendered negligible by the saturated KCl agar-agar salt bridge.',
  'Voltmeter has high input impedance (> 10 MΩ), ensuring zero current draw and true thermodynamic EMF measurement.',
  'Electrodes are pure metals with fresh oxide-free surfaces immersed at standard temperature (298.15 K).',
  'Nernst slope factor: 2.303 R T / (n F) = 0.05916 / 2 = 0.02958 V per decade of concentration ratio at 25°C.',
];

/**
 * Calculates galvanic cell state and measured EMF
 */
export function calculateDaniellCellState(params: DaniellCellParams): DaniellCellState {
  const anodeKey = params.anodeMetal || 'zinc';
  const cathodeKey = params.cathodeMetal || 'copper';
  const anodeCell = HALF_CELLS[anodeKey] || HALF_CELLS['zinc'];
  const cathodeCell = HALF_CELLS[cathodeKey] || HALF_CELLS['copper'];

  const cZn = Math.max(0.001, Math.min(2.0, params.zincConcentrationM ?? 1.0));
  const cCu = Math.max(0.001, Math.min(2.0, params.copperConcentrationM ?? 1.0));
  const saltBridge = Boolean(params.saltBridgeInserted);
  const tempC = Math.max(5, Math.min(60, params.temperatureC ?? 25.0));
  const tempK = tempC + 273.15;
  const isPolarityReversed = Boolean(params.voltmeterPolarityReversed);

  // Standard potential E°cell = E°cathode - E°anode
  const standardEmf = Number((cathodeCell.standardReductionPotential - anodeCell.standardReductionPotential).toFixed(3));
  const n = 2; // electrons transferred
  const slopeFactor = (2.302585 * 8.31446 * tempK) / (n * 96485.3); // ~0.02958 at 298.15K

  // Reaction quotient Q = [Anode ion] / [Cathode ion]
  const reactionQuotientQ = Number((cZn / cCu).toFixed(4));
  const logQ = Number(Math.log10(reactionQuotientQ).toFixed(3));

  let calculatedEmf = standardEmf - slopeFactor * logQ;
  calculatedEmf = Number(calculatedEmf.toFixed(3));

  let measuredEmf = 0.0;
  let circuitClosed = false;
  let readingText = '0.000 V (Open Circuit)';
  let observationStatus = 'Salt bridge is absent. Electrical circuit is broken; voltmeter displays 0.000 V.';

  if (saltBridge) {
    circuitClosed = true;
    measuredEmf = isPolarityReversed ? -calculatedEmf : calculatedEmf;
    readingText = `${measuredEmf > 0 ? '+' : ''}${measuredEmf.toFixed(3)} V`;

    if (isPolarityReversed) {
      observationStatus = `Reverse Polarity: Voltmeter leads connected backward. Measured negative potential ${measuredEmf.toFixed(3)} V.`;
    } else {
      observationStatus = `Stable Galvanic EMF: ${readingText}. Agrees with Nernst equation (E = ${standardEmf.toFixed(3)} - 0.0296 × log₁₀(${cZn}/${cCu})).`;
    }
  }

  // Pre-calculated 5 standard calibration concentration ratios
  const standardNernstPoints = [
    { znConc: 0.01, cuConc: 1.0, logQ: -2.0, emf: Number((standardEmf - slopeFactor * -2.0).toFixed(3)) },
    { znConc: 0.10, cuConc: 1.0, logQ: -1.0, emf: Number((standardEmf - slopeFactor * -1.0).toFixed(3)) },
    { znConc: 1.00, cuConc: 1.0, logQ: 0.0, emf: Number((standardEmf).toFixed(3)) },
    { znConc: 1.00, cuConc: 0.10, logQ: +1.0, emf: Number((standardEmf - slopeFactor * 1.0).toFixed(3)) },
    { znConc: 1.00, cuConc: 0.01, logQ: +2.0, emf: Number((standardEmf - slopeFactor * 2.0).toFixed(3)) },
  ];

  return {
    standardEmfVolts: standardEmf,
    measuredEmfVolts: measuredEmf,
    reactionQuotientQ,
    logQ,
    temperatureC: tempC,
    electronsTransferred: n,
    anodeHalfEquation: 'Zn(s) → Zn²⁺(aq) + 2e⁻  (Oxidation at Anode)',
    cathodeHalfEquation: 'Cu²⁺(aq) + 2e⁻ → Cu(s)  (Reduction at Cathode)',
    netEquation: 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)  [E° = +1.10 V]',
    circuitClosed,
    voltmeterReadingText: readingText,
    observationStatus,
    anodeSolutionColor: anodeCell.solutionColor,
    cathodeSolutionColor: cathodeCell.solutionColor,
    standardNernstPoints,
    assumptions: ELECTROCHEMISTRY_ASSUMPTIONS,
  };
}
