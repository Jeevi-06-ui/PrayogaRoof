import { ConceptualQuestion } from '../circuit/types';

export const PARALLELOGRAM_LAW_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'par-q1',
    experimentId: 'parallelogram-law',
    question: 'Two equal forces P and Q of 10 N act at an angle θ = 60° on a particle. What is the magnitude of their resultant force?',
    options: [
      '10√3 N (≈ 17.32 N)',
      '20 N',
      '10 N',
      '5√3 N (≈ 8.66 N)',
    ],
    correctIndex: 0,
    explanation: 'From R = √(P² + Q² + 2PQ cos θ), with P = Q = 10 N and cos 60° = 0.5: R = √(100 + 100 + 2×10×10×0.5) = √300 = 10√3 N.',
  },
  {
    id: 'par-q2',
    experimentId: 'parallelogram-law',
    question: 'In Gravesand’s apparatus, three concurrent coplanar forces hold a central knot in equilibrium. What is the relation between the resultant of any two forces and the third force?',
    options: [
      'The resultant is equal in magnitude and opposite in direction (equilibrant) to the third force',
      'The resultant is perpendicular to the third force',
      'The resultant is zero while the third force is non-zero',
      'The resultant is twice the magnitude of the third force',
    ],
    correctIndex: 0,
    explanation: 'For a body in equilibrium under three concurrent forces P, Q, and S, the vector sum is zero: P + Q + S = 0. Thus, R = P + Q = -S, meaning R and S are equal in magnitude and opposite in direction.',
  },
  {
    id: 'par-q3',
    experimentId: 'parallelogram-law',
    question: 'What is the purpose of placing a small plane mirror strip beneath the threads on the Gravesand’s drawing board?',
    options: [
      'To eliminate parallax error when marking the thread directions by aligning the thread with its reflection',
      'To reflect light onto the pulleys to reduce friction',
      'To measure the angle directly using optical reflection',
      'To verify the glass smoothness',
    ],
    correctIndex: 0,
    explanation: 'Placing a mirror strip under the thread allows the observer to position their eye so that the thread covers its own reflection, eliminating parallax error when placing pencil dots along the force line.',
  },
  {
    id: 'par-q4',
    experimentId: 'parallelogram-law',
    question: 'If two orthogonal forces (θ = 90°) have magnitudes 3 N and 4 N, what angle does their resultant make with the 3 N force?',
    options: [
      'arctan(4/3) ≈ 53.13°',
      '30°',
      '45°',
      'arctan(3/4) ≈ 36.87°',
    ],
    correctIndex: 0,
    explanation: 'For orthogonal vectors, tan α = Q / P = 4 / 3. Therefore, α = arctan(4/3) ≈ 53.13° relative to the 3 N vector.',
  },
];

export const LIMITING_FRICTION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'fric-q1',
    experimentId: 'limiting-friction',
    question: 'How is the limiting force of static friction (f_s,max) related to the normal reaction (N) between the contact surfaces?',
    options: [
      'Directly proportional (f_s,max = μ_s × N)',
      'Inversely proportional (f_s,max ∝ 1/N)',
      'Proportional to the square of normal reaction (f_s,max ∝ N²)',
      'Independent of normal reaction',
    ],
    correctIndex: 0,
    explanation: 'According to the first law of limiting friction, the maximum static friction force is directly proportional to the normal reaction between the two surfaces: f_s,max = μ_s × N.',
  },
  {
    id: 'fric-q2',
    experimentId: 'limiting-friction',
    question: 'A wooden block of mass 200 g is tested on a table first resting on its broad face (area 60 cm²) and then on its narrow edge (area 20 cm²). How does the limiting friction compare?',
    options: [
      'Limiting friction remains the same in both orientations',
      'Limiting friction is three times greater on the broad face',
      'Limiting friction is three times greater on the narrow edge',
      'Friction drops to zero on the narrow edge',
    ],
    correctIndex: 0,
    explanation: 'The laws of limiting friction state that friction is independent of the apparent area of contact between the surfaces, provided the normal reaction remains unchanged.',
  },
  {
    id: 'fric-q3',
    experimentId: 'limiting-friction',
    question: 'Once a block starts sliding across the surface, how does the kinetic friction (f_k) compare to the limiting static friction (f_s,max)?',
    options: [
      'Kinetic friction is slightly less than limiting static friction (f_k < f_s,max)',
      'Kinetic friction is much greater than limiting static friction',
      'Kinetic friction is exactly equal to limiting static friction',
      'Kinetic friction vanishes completely',
    ],
    correctIndex: 0,
    explanation: 'Once relative motion begins, the microscopic surface asperities do not have enough time to interlock as deeply as in stationary contact, so kinetic friction is slightly less than limiting static friction (μ_k < μ_s).',
  },
  {
    id: 'fric-q4',
    experimentId: 'limiting-friction',
    question: 'Why is it standard practice to gently tap the friction board before recording the threshold pulling mass in the pan?',
    options: [
      'To overcome localized surface stiction and find the true threshold of static equilibrium',
      'To accelerate the block to measurable velocity',
      'To heat up the contact surface',
      'To level the pulley height',
    ],
    correctIndex: 0,
    explanation: 'A gentle tap helps release temporary electrostatic or mechanical stiction spikes, ensuring that the measured pan weight represents the true limiting equilibrium condition.',
  },
];

export const INCLINED_PLANE_FRICTION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'inc-q1',
    experimentId: 'inclined-plane-friction',
    question: 'When a block of weight W = mg rests on an inclined plane of angle θ, what is the component of gravity acting perpendicular to the incline?',
    options: [
      'mg cos θ (balanced by the normal reaction N)',
      'mg sin θ',
      'mg tan θ',
      'mg / cos θ',
    ],
    correctIndex: 0,
    explanation: 'Resolving gravity along orthogonal directions: perpendicular to the incline is mg cos θ (which provides the normal force N = mg cos θ), while parallel to the incline is mg sin θ.',
  },
  {
    id: 'inc-q2',
    experimentId: 'inclined-plane-friction',
    question: 'What is the "angle of repose" (θ_r) of an inclined plane?',
    options: [
      'The minimum angle of inclination at which a body just begins to slide down under its own weight',
      'The angle at which normal reaction equals total weight',
      'The angle at which gravity vanishes',
      'The maximum slope of 90 degrees',
    ],
    correctIndex: 0,
    explanation: 'The angle of repose is the maximum inclination angle for which a body remains at rest on the plane. At this threshold, mg sin θ_r = μ_s mg cos θ_r, which simplifies to tan θ_r = μ_s.',
  },
  {
    id: 'inc-q3',
    experimentId: 'inclined-plane-friction',
    question: 'If the coefficient of static friction between a block and an inclined board is μ_s = 1.0, at what angle of inclination will the block begin to slide?',
    options: [
      '45° (since tan 45° = 1.0)',
      '30°',
      '60°',
      '90°',
    ],
    correctIndex: 0,
    explanation: 'Since tan θ_r = μ_s = 1.0, the angle of repose is θ_r = arctan(1.0) = 45°.',
  },
  {
    id: 'inc-q4',
    experimentId: 'inclined-plane-friction',
    question: 'What is the minimum effort P required to pull a block of weight mg up an incline with static friction coefficient μ_s?',
    options: [
      'P = mg (sin θ + μ_s cos θ)',
      'P = mg (sin θ - μ_s cos θ)',
      'P = mg sin θ',
      'P = μ_s mg cos θ',
    ],
    correctIndex: 0,
    explanation: 'To pull the block up, the applied force must overcome both the downward component of gravity (mg sin θ) and the opposing limiting friction (f_s,max = μ_s mg cos θ), giving P = mg(sin θ + μ_s cos θ).',
  },
];

export const HOOKES_LAW_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'hook-q1',
    experimentId: 'hookes-law',
    question: 'What does Hooke’s Law state regarding the extension of an elastic helical spring?',
    options: [
      'Within elastic limits, extension is directly proportional to the stretching load (F = k × x)',
      'Extension is inversely proportional to load',
      'Extension is proportional to the square of load',
      'Extension is independent of load',
    ],
    correctIndex: 0,
    explanation: 'Hooke’s Law states that within the elastic limit, the restoring force / extension is directly proportional to the applied load: F = k·x, where k is the spring constant.',
  },
  {
    id: 'hook-q2',
    experimentId: 'hookes-law',
    question: 'On a graph of Load (F in Newtons, vertical axis) versus Extension (x in meters, horizontal axis), what physical property is represented by the slope of the linear region?',
    options: [
      'Spring constant (k = ΔF / Δx in N/m)',
      'Elastic potential energy',
      'Total mass of the spring',
      'Acceleration due to gravity',
    ],
    correctIndex: 0,
    explanation: 'Since F = k·x, the slope of the Load (y-axis) versus Extension (x-axis) curve gives the spring constant k = ΔF / Δx in N/m.',
  },
  {
    id: 'hook-q3',
    experimentId: 'hookes-law',
    question: 'What occurs if slotted weights suspended from the spring exceed its elastic limit?',
    options: [
      'Plastic deformation occurs: the spring does not return to its original length when unloaded (permanent set)',
      'The spring becomes infinitely stiff',
      'The spring constant doubles permanently',
      'The oscillation frequency becomes infinite',
    ],
    correctIndex: 0,
    explanation: 'Beyond the elastic limit (yield point), Hooke’s Law breaks down and plastic deformation takes place, leaving a permanent elongation (permanent set) even after removing the weights.',
  },
  {
    id: 'hook-q4',
    experimentId: 'hookes-law',
    question: 'A mass m is attached to a helical spring of stiffness k and set into vertical oscillation. What is the time period T of oscillation?',
    options: [
      'T = 2π √(m / k)',
      'T = 2π √(k / m)',
      'T = (1 / 2π) √(m / k)',
      'T = 2π √(g / m)',
    ],
    correctIndex: 0,
    explanation: 'For simple harmonic motion of a spring-mass system, the angular frequency is ω = √(k/m), which gives the time period T = 2π/ω = 2π√(m/k).',
  },
];

export const BOYLES_LAW_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'boyle-q1',
    experimentId: 'boyles-law',
    question: 'According to Boyle’s Law, how is the absolute pressure P of a fixed mass of ideal gas related to its volume V at constant temperature?',
    options: [
      'Inversely proportional (P ∝ 1/V or P × V = Constant)',
      'Directly proportional (P ∝ V)',
      'Proportional to square of volume (P ∝ V²)',
      'Independent of volume',
    ],
    correctIndex: 0,
    explanation: 'Boyle’s Law states that for a fixed mass of gas at constant temperature, pressure is inversely proportional to volume: P ∝ 1/V, meaning P × V = constant.',
  },
  {
    id: 'boyle-q2',
    experimentId: 'boyles-law',
    question: 'If the volume of an enclosed gas is compressed to one-third of its initial volume at constant temperature, what happens to its pressure?',
    options: [
      'The pressure triples (P_new = 3 × P_initial)',
      'The pressure reduces to one-third',
      'The pressure remains unchanged',
      'The pressure increases ninefold',
    ],
    correctIndex: 0,
    explanation: 'Since P₁V₁ = P₂V₂, when V₂ = V₁ / 3, we have P₂ = 3 × P₁. Compressing gas into one-third the volume triples the molecular collision rate against cylinder walls.',
  },
  {
    id: 'boyle-q3',
    experimentId: 'boyles-law',
    question: 'Which of the following plots yields a straight line passing through the origin for an isothermal ideal gas undergoing Boyle’s Law?',
    options: [
      'P versus 1/V',
      'P versus V',
      'P versus V²',
      'log P versus V',
    ],
    correctIndex: 0,
    explanation: 'Since P = C × (1/V), plotting P against 1/V yields a straight line y = m·x passing through the origin with slope m = C = P·V.',
  },
  {
    id: 'boyle-q4',
    experimentId: 'boyles-law',
    question: 'In a Quill tube or J-tube mercury apparatus open to the atmosphere, how is total enclosed gas pressure calculated when the open mercury meniscus is h mm higher than the closed column meniscus?',
    options: [
      'P_total = P_atmospheric + h',
      'P_total = P_atmospheric - h',
      'P_total = h alone',
      'P_total = P_atmospheric × h',
    ],
    correctIndex: 0,
    explanation: 'When the open limb mercury level is higher by h mm, the enclosed gas supports both the atmospheric pressure and the hydrostatic mercury head: P_total = P_atm + h mm of Hg.',
  },
];
