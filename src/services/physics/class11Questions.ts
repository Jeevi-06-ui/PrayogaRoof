import { ConceptualQuestion } from '../circuit/types';

export const VERNIER_CALLIPERS_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'vc-q1',
    experimentId: 'vernier-callipers',
    question:
      'If the main scale of a Vernier Calliper is divided in millimetres (1 MSD = 1 mm) and 10 Vernier Scale Divisions (VSD) coincide with 9 Main Scale Divisions, what is the least count (LC)?',
    options: [
      '0.1 mm (0.01 cm)',
      '0.01 mm (0.001 cm)',
      '0.5 mm (0.05 cm)',
      '1.0 mm (0.1 cm)',
    ],
    correctIndex: 0,
    explanation:
      'Least Count = 1 MSD - 1 VSD = 1 mm - (9/10) mm = 1 mm - 0.9 mm = 0.1 mm = 0.01 cm.',
  },
  {
    id: 'vc-q2',
    experimentId: 'vernier-callipers',
    question:
      'When the jaws of a Vernier Calliper are in contact, the zero mark of the Vernier scale lies to the right of the zero mark of the main scale. What type of zero error is this, and how is it corrected?',
    options: [
      'Positive zero error; it must be subtracted from the observed reading',
      'Negative zero error; it must be added to the observed reading',
      'Positive zero error; it must be added to the observed reading',
      'Zero error is negligible and ignored in laboratory measurements',
    ],
    correctIndex: 0,
    explanation:
      'When the Vernier zero lies to the right of the main scale zero, the instrument reads a non-zero positive value even when jaws are closed. Hence, the error is positive and must be subtracted: Corrected Reading = Observed Reading - (+Zero Error).',
  },
  {
    id: 'vc-q3',
    experimentId: 'vernier-callipers',
    question:
      'Which part of the Vernier Callipers is used to measure the internal diameter of a hollow beaker or calorimeter?',
    options: [
      'Upper jaws (internal measuring nibs)',
      'Lower jaws (external measuring jaws)',
      'The sliding metallic strip (depth probe)',
      'The main beam clamping screw',
    ],
    correctIndex: 0,
    explanation:
      'Upper jaws are designed specifically to press against the inside walls of hollow cylinders and beakers to determine internal diameter.',
  },
];

export const SCREW_GAUGE_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'sg-q1',
    experimentId: 'screw-gauge',
    question:
      'A micrometer screw gauge has a pitch of 1 mm and 100 divisions on its circular thimble. What is its least count?',
    options: [
      '0.01 mm (0.001 cm)',
      '0.1 mm (0.01 cm)',
      '0.001 mm (0.0001 cm)',
      '0.05 mm (0.005 cm)',
    ],
    correctIndex: 0,
    explanation:
      'Least Count = Pitch / Number of Circular Divisions = 1.0 mm / 100 = 0.01 mm = 0.001 cm.',
  },
  {
    id: 'sg-q2',
    experimentId: 'screw-gauge',
    question:
      'Why is a ratchet stop provided at the end of the thimble on a micrometer screw gauge?',
    options: [
      'To apply a uniform, gentle pressure on the specimen and prevent overtightening or screw deformation',
      'To increase the speed of screw rotation',
      'To lock the screw permanently after measurement',
      'To calibrate the zero error automatically',
    ],
    correctIndex: 0,
    explanation:
      'The ratchet mechanism slips when uniform contact pressure is reached, preventing crushing of the test object or stripping the precision screw threads.',
  },
  {
    id: 'sg-q3',
    experimentId: 'screw-gauge',
    question:
      'What causes "backlash error" in a screw gauge, and how can students avoid it during an experiment?',
    options: [
      'Wear and tear between the screw and nut threads; avoided by always rotating the thimble in one single direction when taking a reading',
      'Thermal expansion of the anvil; avoided by cooling the instrument in ice',
      'Magnetic attraction to the specimen; avoided by using brass frames',
      'Improper zero alignment; avoided by multiplying readings by 2',
    ],
    correctIndex: 0,
    explanation:
      'Due to wear of screw threads, reversing rotation causes lost motion. Rotating the thimble in only one direction eliminates backlash error.',
  },
];

export const IRREGULAR_LAMINA_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'il-q1',
    experimentId: 'irregular-lamina',
    question:
      'When determining the area of an irregular lamina using graph paper, which rule is standard for boundary squares?',
    options: [
      'Full squares and squares with > 50% area are counted as 1; exactly half squares are counted as 0.5; squares with < 50% are neglected',
      'Every square that the boundary touches is counted as 1 full square',
      'Only completely full squares are counted, boundary squares are ignored',
      'The length of the boundary is multiplied by the width',
    ],
    correctIndex: 0,
    explanation:
      'Statistically, treating squares with >50% as 1 and <50% as 0 allows over-estimations and under-estimations along the closed perimeter to cancel out, leaving area = (N_full + N_moreHalf + 0.5 * N_half) * unit_area.',
  },
  {
    id: 'il-q2',
    experimentId: 'irregular-lamina',
    question:
      'How does decreasing the grid square size (e.g., from 1 cm squares to 2 mm millimeter grid squares) affect the estimated area and its uncertainty?',
    options: [
      'It increases precision and reduces boundary uncertainty',
      'It increases boundary uncertainty proportionally',
      'It changes the physical area of the lamina',
      'It produces no change in measurement accuracy',
    ],
    correctIndex: 0,
    explanation:
      'Finer grid squares conform closer to the curved boundary contour, drastically reducing the fractional uncertainty ΔA proportional to grid cell width.',
  },
  {
    id: 'il-q3',
    experimentId: 'irregular-lamina',
    question:
      'What is the theoretical boundary uncertainty when counting squares for a lamina perimeter crossing N_boundary squares of size s?',
    options: [
      'Uncertainty is approximately ± 0.5 × N_boundary × s²',
      'Uncertainty is zero because graph squares are standardized',
      'Uncertainty equals the total area squared',
      'Uncertainty is proportional to the thickness of the leaf',
    ],
    correctIndex: 0,
    explanation:
      'Each partially covered boundary square contributes an uncertainty of at most ± 0.5 s², leading to a combined boundary uncertainty of ± 0.5 * N_boundary * s².',
  },
];

export const SPHEROMETER_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'sph-q1',
    experimentId: 'spherometer',
    question:
      'In the spherometer formula R = l² / (6h) + h / 2, what physical quantities do "l" and "h" represent?',
    options: [
      'l is the mean distance between adjacent outer legs; h is the sagitta (elevation or depression of central screw)',
      'l is the total height of the instrument; h is the diameter of circular disc',
      'l is the radius of the outer circle; h is the thickness of glass slab',
      'l is the focal length; h is the object distance',
    ],
    correctIndex: 0,
    explanation:
      'In an equilateral triangle tripod of side l, the circumradius r = l / √3. From Pythagoras theorem on the sphere, R² = r² + (R - h)², which expands to R = l² / (6h) + h / 2.',
  },
  {
    id: 'sph-q2',
    experimentId: 'spherometer',
    question:
      'Why must a student first place the spherometer on a flat, optically plane glass plate before measuring a curved lens?',
    options: [
      'To determine the zero reference reading (h₀) where all four points lie in a common plane',
      'To flatten the tripod tips',
      'To magnetize the central screw',
      'To clean off dust from the circular head',
    ],
    correctIndex: 0,
    explanation:
      'Planes provide the baseline zero elevation (h₀). The sagitta is then calculated as the difference h = |h₁ - h₀| when placed on the curved surface.',
  },
  {
    id: 'sph-q3',
    experimentId: 'spherometer',
    question:
      'If the central screw of a spherometer is raised (h₁ > h₀) to touch the vertex of a lens while all three legs rest on its surface, what type of surface is being measured?',
    options: [
      'A convex surface',
      'A concave surface',
      'A plane flat surface',
      'A cylindrical surface',
    ],
    correctIndex: 0,
    explanation:
      'On a convex lens, the center bulges upward above the plane of the outer feet, so the central screw must be elevated (h₁ > h₀). For a concave surface, it must be lowered into the depression (h₁ < h₀).',
  },
];

export const BEAM_BALANCE_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'bb-q1',
    experimentId: 'beam-balance',
    question:
      'On which fundamental law of mechanics is the physical beam balance based?',
    options: [
      'Principle of Moments: at mechanical equilibrium, clockwise torque equals counter-clockwise torque (m₁ × l₁ = m₂ × l₂)',
      'Hooke’s Law of elasticity',
      'Archimedes principle of buoyant force',
      'Newton’s third law of action-reaction exclusively',
    ],
    correctIndex: 0,
    explanation:
      'For equal balance arms (l₁ = l₂ = L), equilibrium requires net torque Στ = 0 => m₁·g·L = m₂·g·L => m₁ = m₂.',
  },
  {
    id: 'bb-q2',
    experimentId: 'beam-balance',
    question:
      'Why is the beam arrested (lowered onto supports) every time weights or objects are added or removed from the scale pans?',
    options: [
      'To protect the delicate knife-edge and agate bearing planes from chipping and excessive wear',
      'To reset the electrical voltage',
      'To prevent the pans from swinging indefinitely',
      'To calibrate the zero reading automatically',
    ],
    correctIndex: 0,
    explanation:
      'Agate knife-edges are razor-sharp precision bearings. Impact loads during weight placement would chip or dull the knife edges, destroying balance sensitivity.',
  },
  {
    id: 'bb-q3',
    experimentId: 'beam-balance',
    question:
      'In the "method of oscillations", if three successive turning points of the pointer on the index scale are d₁ = -3.0, d₂ = +2.6, and d₃ = -2.2, what is the resting point (RP)?',
    options: [
      '-0.2 divisions',
      '+0.4 divisions',
      '0.0 divisions',
      '-1.0 divisions',
    ],
    correctIndex: 0,
    explanation:
      'Resting point RP = (d₁ + 2·d₂ + d₃) / 4 = (-3.0 + 2·(2.6) + (-2.2)) / 4 = (-3.0 + 5.2 - 2.2) / 4 = 0.0 / 4 = 0.0 divisions (perfectly balanced around center).',
  },
];
