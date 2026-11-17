import { ConceptualQuestion } from '../circuit/types';

export const CONCAVE_MIRROR_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'cm-q1',
    experimentId: 'concave-mirror-focal-length',
    question:
      'Where should an object be placed in front of a concave mirror of focal length f so that its real image is of the same size as the object?',
    options: [
      'At the center of curvature C (u = 2f)',
      'At the principal focus F (u = f)',
      'Beyond the center of curvature (u > 2f)',
      'Between focus and pole (u < f)',
    ],
    correctIndex: 0,
    explanation:
      'When an object is placed at the center of curvature C (u = 2f) of a concave mirror, the reflected rays converge at C itself (v = -2f), producing a real, inverted image with linear magnification m = -v/u = -(-2f)/(-2f) = -1 (same size as the object).',
  },
  {
    id: 'cm-q2',
    experimentId: 'concave-mirror-focal-length',
    question:
      'According to the New Cartesian Sign Convention, what are the signs of the focal length (f) and radius of curvature (R) of a concave spherical mirror?',
    options: [
      'Both f and R are negative (-)',
      'f is positive (+), R is negative (-)',
      'f is negative (-), R is positive (+)',
      'Both f and R are positive (+)',
    ],
    correctIndex: 0,
    explanation:
      'In the Cartesian sign convention, distances measured in the direction opposite to incident light (to the left of the pole P) are taken as negative. Since the focus and center of curvature of a concave mirror lie in front of the reflecting surface, both f and R are negative.',
  },
  {
    id: 'cm-q3',
    experimentId: 'concave-mirror-focal-length',
    question:
      'What happens to the image formed by a concave mirror when an object is brought closer to the pole than the principal focus (u < f)?',
    options: [
      'The image becomes virtual, erect, and magnified behind the mirror',
      'The image remains real and inverted on the screen',
      'The image disappears entirely',
      'The image becomes diminished and inverted behind the mirror',
    ],
    correctIndex: 0,
    explanation:
      'When the object is placed between the focus and pole (u < f), the reflected rays diverge. When projected backward behind the mirror, they appear to intersect, forming a virtual, erect, and magnified image behind the mirror (v > 0, m > 1). This is the optical principle used in dental and shaving mirrors.',
  },
  {
    id: 'cm-q4',
    experimentId: 'concave-mirror-focal-length',
    question:
      'A concave mirror has a focal length of 20 cm. If an object needle is placed at a distance of 30 cm in front of it, where does the real image form?',
    options: [
      'At v = -60 cm in front of the mirror',
      'At v = +60 cm behind the mirror',
      'At v = -12 cm in front of the mirror',
      'At v = -50 cm in front of the mirror',
    ],
    correctIndex: 0,
    explanation:
      'Using the mirror formula: 1/f = 1/v + 1/u => 1/v = 1/f - 1/u = 1/(-20) - 1/(-30) = -1/20 + 1/30 = -1/60. Therefore, v = -60 cm. The negative sign confirms the real, inverted image is formed 60 cm in front of the mirror.',
  },
];

export const CONVEX_MIRROR_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'cvm-q1',
    experimentId: 'convex-mirror-focal-length',
    question:
      'What type of image is always formed by a convex mirror for any real object placed in front of it?',
    options: [
      'Virtual, erect, and diminished behind the mirror',
      'Real, inverted, and magnified in front of the mirror',
      'Real, inverted, and diminished in front of the mirror',
      'Virtual, inverted, and magnified behind the mirror',
    ],
    correctIndex: 0,
    explanation:
      'For a convex mirror, the focal length is positive (f > 0). For any real object (u < 0), the mirror formula 1/v = 1/f - 1/u = 1/f + 1/|u| always yields a positive image distance (v > 0) with v < f. Thus, the image is always virtual, erect, and diminished, located between the pole and focus behind the mirror.',
  },
  {
    id: 'cvm-q2',
    experimentId: 'convex-mirror-focal-length',
    question:
      'Why is an auxiliary convex lens required in the laboratory to determine the focal length of a convex mirror?',
    options: [
      'Because a convex mirror alone forms a virtual image that cannot be caught on a screen',
      'To increase the magnification of the convex mirror',
      'To convert the convex mirror into a plane mirror',
      'To polarize the incident light beam',
    ],
    correctIndex: 0,
    explanation:
      'Because a convex mirror forms virtual images behind its surface, reflected rays cannot be focused onto a physical screen. By using an auxiliary convex lens to form a converging beam, rays can be made to strike the convex mirror normally at its center of curvature C, retracing their path and forming a coincident image at the object needle.',
  },
  {
    id: 'cvm-q3',
    experimentId: 'convex-mirror-focal-length',
    question:
      'In the auxiliary lens method, when reflected rays retrace their path to form an image coinciding with the object needle, where was the real focus of the lens relative to the convex mirror?',
    options: [
      'At the center of curvature C of the convex mirror',
      'At the principal focus F of the convex mirror',
      'At the optical pole P of the convex mirror',
      'At infinity behind the convex mirror',
    ],
    correctIndex: 0,
    explanation:
      'Rays incident normally on a spherical mirror must be directed toward its center of curvature C. When the converging beam from the auxiliary lens is intercepted by the mirror such that its virtual apex lies exactly at C, the rays strike normally and retrace their paths. Thus, the distance from mirror to screen image position equals R = 2f.',
  },
  {
    id: 'cvm-q4',
    experimentId: 'convex-mirror-focal-length',
    question:
      'If the measured distance between the pole of the convex mirror and the auxiliary lens real focus is 24.0 cm, what is the focal length of the convex mirror?',
    options: [
      '+12.0 cm',
      '+24.0 cm',
      '-12.0 cm',
      '+48.0 cm',
    ],
    correctIndex: 0,
    explanation:
      'The measured distance equals the radius of curvature: R = 24.0 cm. For a spherical mirror, focal length f = R / 2 = 24.0 / 2 = +12.0 cm.',
  },
];

export const CONCAVE_LENS_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'cl-q1',
    experimentId: 'concave-lens-focal-length',
    question:
      'What is the characteristic optical nature and sign of focal length for a biconcave lens?',
    options: [
      'Diverging action with a negative focal length (f < 0)',
      'Converging action with a positive focal length (f > 0)',
      'Diverging action with a positive focal length (f > 0)',
      'Zero optical power',
    ],
    correctIndex: 0,
    explanation:
      'A biconcave lens is thinner in the center than at the edges. Parallel incident rays diverge after refraction as if originating from a virtual focus on the incident side, giving it a negative focal length (f < 0) under Cartesian sign convention.',
  },
  {
    id: 'cl-q2',
    experimentId: 'concave-lens-focal-length',
    question:
      'Why can a concave lens not independently form a real image on a screen for any real object?',
    options: [
      'Because refracted rays always diverge and can only intersect virtually on the same side as the object',
      'Because glass absorbs 100% of the incident light',
      'Because total internal reflection occurs inside the lens',
      'Because concave lenses invert wave phase',
    ],
    correctIndex: 0,
    explanation:
      'For any real object (u < 0), the thin lens equation 1/v = 1/f + 1/u with negative f gives 1/v = -1/|f| - 1/|u| < 0. Thus, v is strictly negative, meaning the image is always virtual, erect, and on the incident side of the lens.',
  },
  {
    id: 'cl-q3',
    experimentId: 'concave-lens-focal-length',
    question:
      'To produce a real image on a screen using a combination of a convex lens (f1) and a concave lens (f2) in contact, what condition must be satisfied?',
    options: [
      'The convex lens must be more powerful than the concave lens (f1 < |f2|)',
      'The concave lens must be more powerful than the convex lens (|f2| < f1)',
      'Both lenses must have identical focal lengths (f1 = |f2|)',
      'The combination must have negative net optical power',
    ],
    correctIndex: 0,
    explanation:
      'The equivalent focal length F of two thin lenses in contact is 1/F = 1/f1 + 1/f2 = 1/f1 - 1/|f2|. To obtain a real image on a screen, the net combination must be converging (F > 0), which requires 1/f1 > 1/|f2|, or equivalently f1 < |f2| (the convex lens must have a shorter focal length and higher power).',
  },
  {
    id: 'cl-q4',
    experimentId: 'concave-lens-focal-length',
    question:
      'A convex lens of focal length +15 cm is placed in contact with a concave lens of focal length -30 cm. What is the equivalent focal length of the combination?',
    options: [
      '+30 cm',
      '-30 cm',
      '+10 cm',
      '+45 cm',
    ],
    correctIndex: 0,
    explanation:
      'Using the lens combination formula: 1/F = 1/f1 + 1/f2 = 1/15 + 1/(-30) = 2/30 - 1/30 = 1/30. Therefore, the equivalent focal length F = +30 cm (converging combination).',
  },
];

export const PRISM_REFRACTION_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'prism-q1',
    experimentId: 'prism-refractive-index',
    question:
      'What is the condition that holds true when a ray of light undergoes Minimum Deviation (Dm) through an optical glass prism?',
    options: [
      'The angle of incidence equals the angle of emergence (i = e) and the ray traverses parallel to the prism base',
      'The angle of incidence is zero (normal incidence)',
      'The angle of deviation is 90 degrees',
      'Total internal reflection occurs at both faces',
    ],
    correctIndex: 0,
    explanation:
      'At the angle of minimum deviation Dm, light travels symmetrically through the prism: the angle of incidence equals the angle of emergence (i1 = i2 = im), the interior refraction angles are equal (r1 = r2 = A / 2), and the refracted ray inside an equilateral prism passes strictly parallel to its base.',
  },
  {
    id: 'prism-q2',
    experimentId: 'prism-refractive-index',
    question:
      'What is the exact prism formula used to calculate the refractive index (μ) of a glass prism of refracting angle A?',
    options: [
      'μ = sin((A + Dm) / 2) / sin(A / 2)',
      'μ = sin(A) / sin(Dm)',
      'μ = (A + Dm) / A',
      'μ = tan((A + Dm) / 2) / tan(A / 2)',
    ],
    correctIndex: 0,
    explanation:
      'At minimum deviation, the angle of incidence is i = (A + Dm)/2 and the angle of refraction inside is r = A/2. Applying Snell’s law μ = sin(i) / sin(r) yields the standard prism formula: μ = sin((A + Dm)/2) / sin(A/2).',
  },
  {
    id: 'prism-q3',
    experimentId: 'prism-refractive-index',
    question:
      'If crown glass has a refractive index of μ = 1.52, what is the approximate critical angle for total internal reflection at the glass-air interface?',
    options: [
      'θc = arcsin(1 / 1.52) ≈ 41.1°',
      'θc = arcsin(1.52) ≈ 60.0°',
      'θc = 45.0°',
      'θc = 30.0°',
    ],
    correctIndex: 0,
    explanation:
      'The critical angle θc is defined by sin(θc) = 1/μ. For crown glass (μ = 1.52), θc = arcsin(1 / 1.52) = arcsin(0.6579) ≈ 41.14°. If the interior angle r2 exceeds 41.1°, total internal reflection occurs at the second face.',
  },
  {
    id: 'prism-q4',
    experimentId: 'prism-refractive-index',
    question:
      'For an equilateral glass prism (A = 60°), if the measured angle of minimum deviation is Dm = 30°, what is the refractive index of the glass material?',
    options: [
      'μ = √2 ≈ 1.414',
      'μ = 1.500',
      'μ = 1.732',
      'μ = 1.333',
    ],
    correctIndex: 0,
    explanation:
      'Using the prism formula: μ = sin((A + Dm)/2) / sin(A/2): μ = sin((60° + 30°)/2) / sin(60°/2) = sin(45°) / sin(30°) = (1/√2) / (1/2) = 2 / √2 = √2 ≈ 1.414.',
  },
];

export const PN_DIODE_QUESTIONS: ConceptualQuestion[] = [
  {
    id: 'pnd-q1',
    experimentId: 'pn-junction-diode',
    question:
      'What is the physical cause of the "Knee Voltage" (cut-in voltage) in a forward-biased P-N junction diode?',
    options: [
      'The built-in barrier potential across the depletion layer must be overcome by the applied forward voltage',
      'The metallic contacts melt at that specific voltage',
      'The diode transitions from conductor to insulator',
      'Resistive wire heating reduces internal resistance to zero',
    ],
    correctIndex: 0,
    explanation:
      'In a P-N junction, the diffusion of majority carriers creates a depletion layer with a built-in barrier potential (around 0.7V for Silicon and 0.3V for Germanium). Under forward bias, majority carriers cannot cross until the applied forward voltage exceeds this barrier potential, at which point current increases exponentially.',
  },
  {
    id: 'pnd-q2',
    experimentId: 'pn-junction-diode',
    question:
      'How are battery terminals connected to establish Forward Bias and Reverse Bias in a P-N junction?',
    options: [
      'Forward: P to (+), N to (-); Reverse: P to (-), N to (+)',
      'Forward: P to (-), N to (+); Reverse: P to (+), N to (-)',
      'Forward: P and N to (+); Reverse: P and N to (-)',
      'Polarity does not affect semiconductor conduction',
    ],
    correctIndex: 0,
    explanation:
      'In forward bias, the positive battery terminal connects to the P-type anode and the negative terminal to the N-type cathode, narrowing the depletion layer. In reverse bias, P connects to negative and N to positive, widening the depletion layer and blocking majority carrier flow.',
  },
  {
    id: 'pnd-q3',
    experimentId: 'pn-junction-diode',
    question:
      'What constitutes the tiny current (in microamperes) that flows when a P-N diode is reverse biased below breakdown?',
    options: [
      'Thermally generated minority charge carriers drifting across the junction',
      'Majority holes tunneling into the cathode',
      'Surface electromagnetic radiation',
      'Impurities causing complete mechanical short-circuit',
    ],
    correctIndex: 0,
    explanation:
      'In reverse bias, majority carriers are pulled away from the junction. However, thermally generated minority carriers (electrons in P-region, holes in N-region) are swept across by the junction field, constituting a minute reverse saturation current (I_0) that depends primarily on temperature rather than reverse voltage.',
  },
  {
    id: 'pnd-q4',
    experimentId: 'pn-junction-diode',
    question:
      'How is the dynamic (AC) forward resistance (r_ac) of a diode determined from its forward I-V characteristic curve?',
    options: [
      'r_ac = ΔV / ΔI (reciprocal slope of the forward I-V curve)',
      'r_ac = V / I at the origin',
      'r_ac = ΔI / ΔV',
      'r_ac = (V × I) / 2',
    ],
    correctIndex: 0,
    explanation:
      'Dynamic (AC) resistance is defined as the ratio of a small change in forward voltage (ΔV) to the corresponding small change in forward current (ΔI) in the operating conduction region: r_ac = ΔV / ΔI. Because the I-V curve is non-linear, dynamic resistance decreases dramatically above the knee voltage.',
  },
];
