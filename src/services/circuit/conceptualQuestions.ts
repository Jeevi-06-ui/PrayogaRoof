import { ConceptualQuestion } from './types';
import {
  CONVEX_LENS_QUESTIONS,
  MAGNETIC_FIELD_QUESTIONS,
  SIMPLE_PENDULUM_QUESTIONS,
  VERNIER_CALLIPERS_QUESTIONS,
  SCREW_GAUGE_QUESTIONS,
  IRREGULAR_LAMINA_QUESTIONS,
  SPHEROMETER_QUESTIONS,
  BEAM_BALANCE_QUESTIONS,
  PARALLELOGRAM_LAW_QUESTIONS,
  LIMITING_FRICTION_QUESTIONS,
  INCLINED_PLANE_FRICTION_QUESTIONS,
  HOOKES_LAW_QUESTIONS,
  BOYLES_LAW_QUESTIONS,
  RESISTIVITY_VI_QUESTIONS,
  METRE_BRIDGE_QUESTIONS,
  GALVANOMETER_FOM_QUESTIONS,
  GALVANOMETER_VOLTMETER_QUESTIONS,
  GALVANOMETER_AMMETER_QUESTIONS,
} from '../physics/physicsQuestions';
import {
  PH_TESTING_QUESTIONS,
  NATURAL_INDICATORS_QUESTIONS,
  PAPER_CHROMATOGRAPHY_QUESTIONS,
  DISPLACEMENT_REACTION_QUESTIONS,
  CRYSTALLISATION_QUESTIONS,
} from '../chemistry/chemistryQuestions';

export const OHMS_LAW_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'ohm-q1',
    experimentId: 'ohms-law',
    question: 'According to Ohm’s Law, if the voltage across a constant resistor is doubled, what happens to the electric current?',
    options: [
      'The current is doubled (I ∝ V)',
      'The current is halved',
      'The current quadruples',
      'The current remains unchanged',
    ],
    correctIndex: 0,
    explanation: 'Ohm’s Law states V = I × R. At constant temperature and resistance (R), current (I) is directly proportional to potential difference (V). Doubling V doubles I.',
  },
  {
    id: 'ohm-q2',
    experimentId: 'ohms-law',
    question: 'Why must an ammeter always be connected in series with the component whose current is being measured?',
    options: [
      'Because current is identical along a single sequential branch, and an ammeter has near-zero internal resistance so it does not restrict flow',
      'Because an ammeter has very high resistance and would blow a fuse in parallel',
      'Because ammeters can only measure voltage differences',
      'Because series placement increases the battery voltage',
    ],
    correctIndex: 0,
    explanation: 'An ideal ammeter has negligible internal resistance (~0 Ω). It must be placed in series so the entire branch current passes through it without changing circuit impedance.',
  },
  {
    id: 'ohm-q3',
    experimentId: 'ohms-law',
    question: 'What does the mathematical slope (ΔV / ΔI) of a Voltage versus Current graph represent for an ohmic conductor?',
    options: [
      'The electrical resistance (R) in Ohms',
      'The total electric charge in Coulombs',
      'The electric power dissipated in Watts',
      'The thermal capacitance',
    ],
    correctIndex: 0,
    explanation: 'From V = I × R, rearranging gives R = ΔV / ΔI. Thus, the slope of a linear V-I plot gives the resistance of the conductor in Ohms.',
  },
];

export const SERIES_PARALLEL_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'sp-q1',
    experimentId: 'series-parallel-circuits',
    question: 'Two 6 Ω resistors are connected in series across a 12 V battery. What is the total circuit current and equivalent resistance?',
    options: [
      'Req = 12 Ω, Total Current = 1 A',
      'Req = 3 Ω, Total Current = 4 A',
      'Req = 6 Ω, Total Current = 2 A',
      'Req = 36 Ω, Total Current = 0.33 A',
    ],
    correctIndex: 0,
    explanation: 'In series, equivalent resistance is the sum: Req = R1 + R2 = 6 + 6 = 12 Ω. By Ohm’s Law, I = V / Req = 12 V / 12 Ω = 1 A.',
  },
  {
    id: 'sp-q2',
    experimentId: 'series-parallel-circuits',
    question: 'Two 6 Ω resistors are connected in parallel across a 12 V battery. What is the total circuit current and equivalent resistance?',
    options: [
      'Req = 3 Ω, Total Current = 4 A (2 A in each branch)',
      'Req = 12 Ω, Total Current = 1 A',
      'Req = 6 Ω, Total Current = 2 A',
      'Req = 1.5 Ω, Total Current = 8 A',
    ],
    correctIndex: 0,
    explanation: 'In parallel: 1/Req = 1/6 + 1/6 = 2/6 = 1/3, so Req = 3 Ω. Total current I = V / Req = 12 V / 3 Ω = 4 A. Each branch receives I_branch = 12 V / 6 Ω = 2 A.',
  },
  {
    id: 'sp-q3',
    experimentId: 'series-parallel-circuits',
    question: 'Why are domestic household electrical appliances wired in parallel rather than in series?',
    options: [
      'Each appliance receives full mains voltage independently, and if one appliance turns off or fails, the others continue operating',
      'Parallel wiring requires less current than series wiring',
      'Series wiring would cause all appliances to run at dangerously high voltage',
      'Parallel wiring prevents electric current from heating wires',
    ],
    correctIndex: 0,
    explanation: 'Parallel wiring ensures that every appliance receives the full rated line voltage (e.g. 230V or 120V) and operates independently through its own branch switch.',
  },
];

export function getConceptualQuestions(experimentId: string): ConceptualQuestion[] {
  if (experimentId === 'ohms-law') return OHMS_LAW_QUESTIONS;
  if (experimentId === 'series-parallel-circuits') return SERIES_PARALLEL_QUESTIONS;
  if (experimentId === 'convex-lens') return CONVEX_LENS_QUESTIONS;
  if (experimentId === 'magnetic-field') return MAGNETIC_FIELD_QUESTIONS;
  if (experimentId === 'simple-pendulum') return SIMPLE_PENDULUM_QUESTIONS;
  if (experimentId === 'ph-testing') return PH_TESTING_QUESTIONS;
  if (experimentId === 'natural-indicators') return NATURAL_INDICATORS_QUESTIONS;
  if (experimentId === 'paper-chromatography') return PAPER_CHROMATOGRAPHY_QUESTIONS;
  if (experimentId === 'displacement-reaction') return DISPLACEMENT_REACTION_QUESTIONS;
  if (experimentId === 'crystallisation') return CRYSTALLISATION_QUESTIONS;
  if (experimentId === 'vernier-callipers') return VERNIER_CALLIPERS_QUESTIONS;
  if (experimentId === 'screw-gauge') return SCREW_GAUGE_QUESTIONS;
  if (experimentId === 'irregular-lamina') return IRREGULAR_LAMINA_QUESTIONS;
  if (experimentId === 'spherometer') return SPHEROMETER_QUESTIONS;
  if (experimentId === 'beam-balance') return BEAM_BALANCE_QUESTIONS;
  if (experimentId === 'parallelogram-law') return PARALLELOGRAM_LAW_QUESTIONS;
  if (experimentId === 'limiting-friction') return LIMITING_FRICTION_QUESTIONS;
  if (experimentId === 'inclined-plane-friction') return INCLINED_PLANE_FRICTION_QUESTIONS;
  if (experimentId === 'hookes-law') return HOOKES_LAW_QUESTIONS;
  if (experimentId === 'boyles-law') return BOYLES_LAW_QUESTIONS;
  if (experimentId === 'resistivity-vi-method') return RESISTIVITY_VI_QUESTIONS;
  if (experimentId === 'metre-bridge') return METRE_BRIDGE_QUESTIONS;
  if (experimentId === 'galvanometer-figure-of-merit') return GALVANOMETER_FOM_QUESTIONS;
  if (experimentId === 'galvanometer-voltmeter') return GALVANOMETER_VOLTMETER_QUESTIONS;
  if (experimentId === 'galvanometer-ammeter') return GALVANOMETER_AMMETER_QUESTIONS;
  return [...OHMS_LAW_QUESTIONS, ...SERIES_PARALLEL_QUESTIONS];
}
