import { ConceptualQuestion } from '../circuit/types';
import { OHMS_LAW_QUESTIONS, SERIES_PARALLEL_QUESTIONS } from '../circuit/conceptualQuestions';
import {
  VERNIER_CALLIPERS_QUESTIONS,
  SCREW_GAUGE_QUESTIONS,
  IRREGULAR_LAMINA_QUESTIONS,
  SPHEROMETER_QUESTIONS,
  BEAM_BALANCE_QUESTIONS,
} from './class11Questions';
import {
  PARALLELOGRAM_LAW_QUESTIONS,
  LIMITING_FRICTION_QUESTIONS,
  INCLINED_PLANE_FRICTION_QUESTIONS,
  HOOKES_LAW_QUESTIONS,
  BOYLES_LAW_QUESTIONS,
} from './class11QuestionsPart2';

export {
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
};

export const CONVEX_LENS_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'lens-q1',
    experimentId: 'convex-lens',
    question:
      'When an object is placed between the optical centre (O) and the principal focus (F₁) of a convex lens, what type of image is formed?',
    options: [
      'Virtual, erect, and magnified (acting as a magnifying glass)',
      'Real, inverted, and diminished',
      'Real, inverted, and magnified',
      'Real, inverted, and same size',
    ],
    correctIndex: 0,
    explanation:
      'Inside the focal distance (u < f), refracted rays diverge on the transmission side. When back-traced, they intersect on the incident side to form a virtual, erect, and magnified image.',
  },
  {
    id: 'lens-q2',
    experimentId: 'convex-lens',
    question:
      'An illuminated object is placed at 2F₁ (u = -2f) in front of a thin convex lens with focal length f = 15 cm. Where is the image formed and what is its magnification?',
    options: [
      'At 2F₂ (v = +30 cm) with magnification m = -1 (same size, inverted)',
      'At F₂ (v = +15 cm) with magnification m = -0.5',
      'At infinity (parallel rays)',
      'On the same side at v = -30 cm with magnification m = +1',
    ],
    correctIndex: 0,
    explanation:
      'From 1/f = 1/v - 1/u: 1/15 = 1/v - 1/(-30) => 1/v = 1/15 - 1/30 = 1/30, so v = +30 cm. Magnification m = v / u = 30 / (-30) = -1 (real, inverted, equal size).',
  },
  {
    id: 'lens-q3',
    experimentId: 'convex-lens',
    question:
      'According to the Cartesian sign convention, what are the standard signs of object distance (u) and focal length (f) for a convex lens with light incident from the left?',
    options: [
      'u is negative (u < 0) and f is positive (f > 0)',
      'Both u and f are positive',
      'Both u and f are negative',
      'u is positive and f is negative',
    ],
    correctIndex: 0,
    explanation:
      'Distances against incident light (to the left of optical centre) are negative, so u < 0. The real principal focus of a converging convex lens lies along the transmission side (right), so f > 0.',
  },
];

export const MAGNETIC_FIELD_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'mag-q1',
    experimentId: 'magnetic-field',
    question:
      'Outside a permanent bar magnet, in which direction do magnetic field lines emerge and enter?',
    options: [
      'They emerge from the North pole and enter the South pole',
      'They emerge from the South pole and enter the North pole',
      'They radiate outward from both poles without entering',
      'They form concentric circles without entering poles',
    ],
    correctIndex: 0,
    explanation:
      'By convention, external magnetic lines of force emerge from the North pole and enter the South pole, continuing through the interior of the magnet to form closed, continuous loops.',
  },
  {
    id: 'mag-q2',
    experimentId: 'magnetic-field',
    question:
      'When a small magnetic plotting compass is placed near the North pole of a bar magnet, which direction does its red (North) needle tip point?',
    options: [
      'Points away from the magnet’s North pole (repelled by like pole)',
      'Points directly towards the magnet’s North pole',
      'Points perpendicular to the magnetic axis',
      'It spins continuously without alignment',
    ],
    correctIndex: 0,
    explanation:
      'Like magnetic poles repel and opposite poles attract. The North pole of the compass needle experiences a repulsive force from the magnet’s North pole and aligns tangential to the field vector pointing away from North.',
  },
  {
    id: 'mag-q3',
    experimentId: 'magnetic-field',
    question:
      'Why can two magnetic field lines never intersect or cross each other at any point in space?',
    options: [
      'Because at the intersection point, the magnetic field vector would have two distinct directions simultaneously, which is physically impossible',
      'Because magnetic lines are composed of like charges that electrostatically repel',
      'Because magnets only have two poles',
      'Because magnetic fields are purely scalar potentials',
    ],
    correctIndex: 0,
    explanation:
      'The tangent to a field line represents the unique direction of the net magnetic vector B. If two lines crossed, a compass needle placed at that point would have to point in two different directions at once, which is impossible.',
  },
];

export const SIMPLE_PENDULUM_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'pend-q1',
    experimentId: 'simple-pendulum',
    question:
      'If the mass of a simple pendulum bob is increased from 50 g to 200 g while keeping the string length unchanged, what happens to its time period (T)?',
    options: [
      'The time period remains completely unchanged (T is independent of mass)',
      'The time period doubles',
      'The time period is halved',
      'The time period quadruples',
    ],
    correctIndex: 0,
    explanation:
      'In the simple pendulum formula T = 2π√(L/g), bob mass (m) does not appear. Gravitational mass equals inertial mass, so mass cancels out completely in the equation of motion (d²θ/dt² + (g/L)sinθ = 0).',
  },
  {
    id: 'pend-q2',
    experimentId: 'simple-pendulum',
    question:
      'If the suspension length of a simple pendulum is quadrupled (L’ = 4L), what happens to its period of oscillation?',
    options: [
      'The time period doubles (T ∝ √L)',
      'The time period quadruples',
      'The time period is halved',
      'The time period remains unchanged',
    ],
    correctIndex: 0,
    explanation:
      'Since period T is proportional to the square root of length (T = 2π√(L/g)), quadrupling L results in T’ = 2π√(4L/g) = 2 × T. The period doubles.',
  },
  {
    id: 'pend-q3',
    experimentId: 'simple-pendulum',
    question:
      'For what range of angular deflection (θ) is the formula T = 2π√(L/g) considered physically accurate (the small-angle approximation)?',
    options: [
      'Small angles up to approximately 10° to 15° where sin(θ) ≈ θ (in radians)',
      'Any angle up to 90°',
      'Only angles greater than 45°',
      'Only when completing full 360° revolutions',
    ],
    correctIndex: 0,
    explanation:
      'The standard analytical solution assumes sin(θ) ≈ θ in radians. For θ ≤ 15° (~0.26 rad), the error of this approximation is under 0.5%, making simple harmonic motion (SHM) an excellent physical model.',
  },
];

export function getPhysicsQuestions(experimentId: string): ConceptualQuestion[] {
  switch (experimentId) {
    case 'ohms-law':
      return OHMS_LAW_QUESTIONS;
    case 'series-parallel-circuits':
      return SERIES_PARALLEL_QUESTIONS;
    case 'convex-lens':
      return CONVEX_LENS_QUESTIONS;
    case 'magnetic-field':
      return MAGNETIC_FIELD_QUESTIONS;
    case 'simple-pendulum':
      return SIMPLE_PENDULUM_QUESTIONS;
    case 'vernier-callipers':
      return VERNIER_CALLIPERS_QUESTIONS;
    case 'screw-gauge':
      return SCREW_GAUGE_QUESTIONS;
    case 'irregular-lamina':
      return IRREGULAR_LAMINA_QUESTIONS;
    case 'spherometer':
      return SPHEROMETER_QUESTIONS;
    case 'beam-balance':
      return BEAM_BALANCE_QUESTIONS;
    case 'parallelogram-law':
      return PARALLELOGRAM_LAW_QUESTIONS;
    case 'limiting-friction':
      return LIMITING_FRICTION_QUESTIONS;
    case 'inclined-plane-friction':
      return INCLINED_PLANE_FRICTION_QUESTIONS;
    case 'hookes-law':
      return HOOKES_LAW_QUESTIONS;
    case 'boyles-law':
      return BOYLES_LAW_QUESTIONS;
    default:
      return [];
  }
}
