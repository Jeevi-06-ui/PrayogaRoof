import { ConceptualQuestion } from '../circuit/types';

export const RESISTIVITY_VI_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'res-vi-q1',
    experimentId: 'resistivity-vi-method',
    question: 'How is electrical resistivity (specific resistance ρ) related to the resistance R, length L, and cross-sectional area A of a uniform wire?',
    options: [
      'ρ = (R × A) / L (unit: Ω·m)',
      'ρ = (R × L) / A',
      'ρ = R × A × L',
      'ρ = L / (R × A)',
    ],
    correctIndex: 0,
    explanation: 'From the fundamental relation R = ρ·(L/A), rearranging yields resistivity ρ = (R·A)/L, which has SI units of Ω·m (Ohm-meter).',
  },
  {
    id: 'res-vi-q2',
    experimentId: 'resistivity-vi-method',
    question: 'Why is Constantan (Eureka) or Manganin alloy preferred over pure copper for standard resistance coils and metre bridge wires?',
    options: [
      'They have high resistivity and an exceptionally low temperature coefficient of resistance',
      'They have lower resistance than copper',
      'They melt at lower temperatures',
      'They are cheaper and lighter than copper',
    ],
    correctIndex: 0,
    explanation: 'Alloys like Constantan and Manganin have high resistivity and near-zero temperature coefficients of resistance (α ≈ 10⁻⁵ /K), so their resistance remains virtually constant even if slightly warmed during experimentation.',
  },
  {
    id: 'res-vi-q3',
    experimentId: 'resistivity-vi-method',
    question: 'Why should the key in a V-I resistivity circuit only be closed momentarily when taking readings?',
    options: [
      'Continuous current causes Joule heating (I²Rt), which increases the wire resistance and introduces systematic error',
      'Continuous current drains the voltmeter internal battery',
      'The ammeter needle can bend from continuous current',
      'The DC source switches off automatically',
    ],
    correctIndex: 0,
    explanation: 'Passing continuous current heats the wire by Joule effect (H = I²Rt). For metallic wires, resistance increases with temperature (R_T = R₀(1 + αΔT)), producing an upward curvature on the V-I plot instead of an ideal straight line.',
  },
  {
    id: 'res-vi-q4',
    experimentId: 'resistivity-vi-method',
    question: 'If the diameter of a resistance wire is measured to be halved while keeping the length constant, what happens to its resistance?',
    options: [
      'Resistance increases fourfold (R ∝ 1/d²)',
      'Resistance is doubled',
      'Resistance is halved',
      'Resistance increases sixteenfold',
    ],
    correctIndex: 0,
    explanation: 'Since cross-sectional area A = πd²/4, resistance R = 4ρL / (πd²). Halving diameter d halves the radius and reduces area by (1/2)² = 1/4, causing resistance to increase by a factor of 4.',
  },
];

export const METRE_BRIDGE_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'mb-q1',
    experimentId: 'metre-bridge',
    question: 'What is the electrical principle upon which the Metre Bridge operates to determine unknown resistance?',
    options: [
      'Wheatstone’s Bridge null deflection principle (P / Q = R / X)',
      'Kirchhoff’s Current Law alone',
      'Electromagnetic induction principle',
      'Seebeck thermoelectric effect',
    ],
    correctIndex: 0,
    explanation: 'The Metre Bridge is a practical realization of the Wheatstone bridge network. When the bridge is balanced, no current flows through the galvanometer, giving P/Q = R/X.',
  },
  {
    id: 'mb-q2',
    experimentId: 'metre-bridge',
    question: 'Why is it recommended to adjust the known resistance box R so that the null balance point l falls near the middle of the wire (40 cm to 60 cm)?',
    options: [
      'The bridge is most sensitive and percentage measurement error ΔX/X is minimized when all four arms have comparable resistances',
      'The wire is only calibrated between 40 cm and 60 cm',
      'Galvanometer resistance is zero at the center of the wire',
      'Battery voltage doubles at the 50 cm mark',
    ],
    correctIndex: 0,
    explanation: 'A Wheatstone bridge has maximum sensitivity when the four arm resistances are approximately equal (P ≈ Q ≈ R ≈ X). This occurs when the balancing length l ≈ 50 cm, minimizing fractional reading uncertainty.',
  },
  {
    id: 'mb-q3',
    experimentId: 'metre-bridge',
    question: 'In a Metre Bridge with known resistance R = 15 Ω in the left gap and unknown X in the right gap, the null point is obtained at l = 60 cm. What is the value of X?',
    options: [
      '10 Ω (X = R × (100 - l) / l = 15 × 40 / 60)',
      '22.5 Ω',
      '15 Ω',
      '6.67 Ω',
    ],
    correctIndex: 0,
    explanation: 'From the bridge balance condition R/X = l/(100 - l): X = R·(100 - l)/l = 15·(40/60) = 15·(2/3) = 10 Ω.',
  },
  {
    id: 'mb-q4',
    experimentId: 'metre-bridge',
    question: 'Why should the jockey knife-edge never be dragged along the metre bridge wire?',
    options: [
      'Dragging scrapes and flattens the wire, causing non-uniform cross-section and invalidating the linear resistance per cm assumption',
      'Dragging creates sparks that damage the wooden base',
      'Dragging discharges the battery instantly',
      'Dragging reverses the polarity of the galvanometer',
    ],
    correctIndex: 0,
    explanation: 'Dragging the sharp jockey knife-edge across the wire alters its uniform circular cross-section, changing the resistance per unit length and destroying the linearity required for accurate measurements.',
  },
];

export const GALVANOMETER_FOM_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'gfom-q1',
    experimentId: 'galvanometer-figure-of-merit',
    question: 'What is the "Figure of Merit" (k) of a moving-coil galvanometer?',
    options: [
      'The steady electric current required to produce a unit scale deflection (1 division) in the galvanometer (unit: A/div)',
      'The maximum voltage the galvanometer can tolerate before burnout',
      'The mechanical mass of the moving coil assembly',
      'The ratio of coil turns to magnetic flux density',
    ],
    correctIndex: 0,
    explanation: 'The figure of merit k of a galvanometer is defined as the current required to produce a deflection of one division on its scale: k = I / θ in Amperes per division.',
  },
  {
    id: 'gfom-q2',
    experimentId: 'galvanometer-figure-of-merit',
    question: 'In the half-deflection method, why is the resistance of the galvanometer given by G = (R × S) / (R - S)?',
    options: [
      'Closing shunt S creates an equivalent resistance GS/(G+S) that halves the coil current when S provides an alternate path equal to G (since R ≫ G)',
      'Because R and S are in series with each other',
      'Because magnetic flux is halved by the shunt resistor',
      'Because thermal EMF cancels half the voltage',
    ],
    correctIndex: 0,
    explanation: 'When shunt key K2 is closed, total circuit current I increases slightly, but divides equally between G and S if G = S (when R ≫ G). The exact mathematical derivation yields G = (R·S)/(R - S).',
  },
  {
    id: 'gfom-q3',
    experimentId: 'galvanometer-figure-of-merit',
    question: 'A galvanometer has 30 scale divisions on each side and a figure of merit k = 2 × 10⁻⁵ A/div. What is its full-scale deflection current (I_g)?',
    options: [
      '0.6 mA (600 μA = 30 × 2 × 10⁻⁵ A)',
      '6.0 mA',
      '0.06 mA',
      '1.5 mA',
    ],
    correctIndex: 0,
    explanation: 'Full-scale current I_g = N × k = 30 divisions × (2 × 10⁻⁵ A/div) = 6 × 10⁻⁴ A = 0.6 mA = 600 μA.',
  },
  {
    id: 'gfom-q4',
    experimentId: 'galvanometer-figure-of-merit',
    question: 'Why must a very high resistance (R > 2000 Ω) always be connected in series with a galvanometer before closing the battery circuit?',
    options: [
      'To restrict current to microamperes and prevent burning the delicate moving coil or violently pinning the needle',
      'To increase the battery EMF',
      'To demagnetize the permanent horseshoe magnets',
      'To calibrate the zero position of the scale',
    ],
    correctIndex: 0,
    explanation: 'Galvanometers are extremely sensitive instruments with coil resistances under 100 Ω that reach full deflection at under 1 mA. Connecting directly across a 2V cell without high series resistance would burn the hair-springs.',
  },
];

export const GALVANOMETER_VOLTMETER_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'gvolt-q1',
    experimentId: 'galvanometer-voltmeter',
    question: 'How is a moving-coil galvanometer converted into a voltmeter capable of measuring up to a maximum voltage V?',
    options: [
      'By connecting a calculated high resistance (series multiplier R_s) in series with the galvanometer coil',
      'By connecting a low resistance shunt in parallel with the galvanometer',
      'By removing half the coil turns from the galvanometer',
      'By replacing the permanent magnet with a soft iron core',
    ],
    correctIndex: 0,
    explanation: 'To measure higher voltages without exceeding the galvanometer full-scale current I_g, a large series multiplier resistance R_s is placed in series, so V = I_g·(R_s + G).',
  },
  {
    id: 'gvolt-q2',
    experimentId: 'galvanometer-voltmeter',
    question: 'What is the formula to calculate the required series multiplier resistance R_s for a galvanometer of resistance G and full-scale current I_g to measure up to V volts?',
    options: [
      'R_s = (V / I_g) - G',
      'R_s = (V / I_g) + G',
      'R_s = (I_g × G) / V',
      'R_s = V / (I_g × G)',
    ],
    correctIndex: 0,
    explanation: 'At full scale voltage V, current through meter is I_g. Thus V = I_g·(R_s + G), which rearranges to R_s = (V / I_g) - G.',
  },
  {
    id: 'gvolt-q3',
    experimentId: 'galvanometer-voltmeter',
    question: 'A galvanometer of resistance G = 50 Ω and full-scale current I_g = 1 mA is to be converted into a voltmeter of range 0 - 3 V. What series resistance R_s is required?',
    options: [
      '2950 Ω (R_s = 3 / 0.001 - 50 = 3000 - 50)',
      '3050 Ω',
      '3000 Ω',
      '2500 Ω',
    ],
    correctIndex: 0,
    explanation: 'R_s = (V / I_g) - G = (3.0 V / 0.001 A) - 50 Ω = 3000 Ω - 50 Ω = 2950 Ω.',
  },
  {
    id: 'gvolt-q4',
    experimentId: 'galvanometer-voltmeter',
    question: 'Why should an ideal voltmeter have infinite electrical resistance?',
    options: [
      'So that it draws zero current from the circuit when placed in parallel, leaving circuit potentials unchanged',
      'So that it can measure infinitely high voltages',
      'To prevent heating in the power supply',
      'To increase needle oscillation speed',
    ],
    correctIndex: 0,
    explanation: 'A voltmeter is connected in parallel across circuit components. If its resistance were finite, it would draw branch current, lowering the equivalent resistance and altering the actual potential difference it is trying to measure.',
  },
];

export const GALVANOMETER_AMMETER_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'gamm-q1',
    experimentId: 'galvanometer-ammeter',
    question: 'How is a moving-coil galvanometer converted into an ammeter of specified range 0 to I?',
    options: [
      'By connecting a low resistance wire (shunt S) in parallel across the galvanometer coil',
      'By connecting a high resistance in series with the coil',
      'By connecting an auxiliary capacitor across the terminals',
      'By removing the iron core from the magnetic pole pieces',
    ],
    correctIndex: 0,
    explanation: 'To measure large currents, the majority of the current (I - I_g) must bypass the delicate galvanometer coil through a low-resistance parallel shunt S.',
  },
  {
    id: 'gamm-q2',
    experimentId: 'galvanometer-ammeter',
    question: 'What is the formula to calculate the shunt resistance S required to convert a galvanometer of resistance G and full-scale current I_g into an ammeter of range I?',
    options: [
      'S = (I_g × G) / (I - I_g)',
      'S = (I - I_g) / (I_g × G)',
      'S = (I × G) / I_g',
      'S = (I_g × G) / (I + I_g)',
    ],
    correctIndex: 0,
    explanation: 'Since the shunt S and galvanometer G are in parallel, the potential difference across them is identical: I_g·G = (I - I_g)·S, which yields S = (I_g·G) / (I - I_g).',
  },
  {
    id: 'gamm-q3',
    experimentId: 'galvanometer-ammeter',
    question: 'A galvanometer with G = 99 Ω requires 10 mA for full-scale deflection. To convert it into an ammeter of range 0 - 1 A, what shunt resistance S is required?',
    options: [
      '1.0 Ω (S = 0.01 × 99 / (1.0 - 0.01) = 0.99 / 0.99 = 1.0 Ω)',
      '0.1 Ω',
      '10.0 Ω',
      '9.9 Ω',
    ],
    correctIndex: 0,
    explanation: 'S = (I_g·G) / (I - I_g) = (0.010 A × 99 Ω) / (1.0 A - 0.010 A) = 0.99 / 0.99 = 1.0 Ω.',
  },
  {
    id: 'gamm-q4',
    experimentId: 'galvanometer-ammeter',
    question: 'Why should an ideal ammeter have zero electrical resistance?',
    options: [
      'Because it is connected in series, and any resistance it introduces will reduce the current it is intended to measure',
      'To prevent the ammeter from deflecting in reverse',
      'So that it can measure alternating current directly',
      'To make the meter weight lighter',
    ],
    correctIndex: 0,
    explanation: 'An ammeter is inserted in series with the circuit branch. If it possessed internal resistance R_a, the total circuit resistance would increase from R to R + R_a, decreasing the true circuit current by Ohm’s Law.',
  },
];
