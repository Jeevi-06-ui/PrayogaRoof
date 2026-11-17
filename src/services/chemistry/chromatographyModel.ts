/**
 * Paper Chromatography Scientific Model
 * Curriculum: CBSE Class 9 (Ch 2), ICSE Class 9/10, NCERT Laboratory Manual
 * 
 * Model: Ascending partition chromatography on cellulose paper.
 * Assumptions:
 * 1. Uniform capillary ascent of mobile phase through Whatman No. 1 cellulose fibers.
 * 2. Constant partition coefficient (Kd) between cellulose stationary phase and aqueous eluent.
 * 3. Idealized linear migration: distance = Rf * solventFront (no paper edge distortion).
 * 4. Rf values are reproducible characteristic physical constants under standardized conditions.
 */

export interface PigmentBand {
  name: string;
  pigmentName: string; // alias
  color: string;
  rf: number;
  distanceMm: number;
}

export interface InkSampleDefinition {
  id: string;
  name: string;
  description: string;
  initialSpotColor: string;
  pigments: Array<{ name: string; color: string; rf: number }>;
}

export const INK_SAMPLES: Record<string, InkSampleDefinition> = {
  'black-ink': {
    id: 'black-ink',
    name: 'Water-Soluble Black Sketch Pen Ink',
    description:
      'Commercial synthetic dye mixture separating into yellow, magenta, and cyan components.',
    initialSpotColor: '#0f172a',
    pigments: [
      { name: 'Yellow Dye Component', color: '#eab308', rf: 0.28 },
      { name: 'Magenta/Red Dye Component', color: '#e11d48', rf: 0.55 },
      { name: 'Cyan/Blue Dye Component', color: '#0284c7', rf: 0.82 },
    ],
  },
  'green-ink': {
    id: 'green-ink',
    name: 'Water-Soluble Green Marker Ink',
    description:
      'Binary secondary mixture composed of tartrazine yellow and brilliant blue pigments.',
    initialSpotColor: '#15803d',
    pigments: [
      { name: 'Tartrazine Yellow Pigment', color: '#facc15', rf: 0.30 },
      { name: 'Brilliant Blue Pigment', color: '#0284c7', rf: 0.78 },
    ],
  },
  'brown-ink': {
    id: 'brown-ink',
    name: 'Brown Calligraphy Ink',
    description: 'Tertiary pigment mixture yielding orange, crimson, and deep indigo fractions.',
    initialSpotColor: '#78350f',
    pigments: [
      { name: 'Orange Fraction', color: '#ea580c', rf: 0.32 },
      { name: 'Crimson Red Fraction', color: '#dc2626', rf: 0.58 },
      { name: 'Deep Indigo Fraction', color: '#1e3a8a', rf: 0.85 },
    ],
  },
  'plant-extract': {
    id: 'plant-extract',
    name: 'Spinach Leaf Chloroplast Extract',
    description: 'Natural photosynthetic leaf pigments extracted in acetone/ethanol solvent.',
    initialSpotColor: '#166534',
    pigments: [
      { name: 'Chlorophyll b (Yellow-Green)', color: '#84cc16', rf: 0.34 },
      { name: 'Chlorophyll a (Blue-Green)', color: '#047857', rf: 0.48 },
      { name: 'Xanthophyll (Yellow)', color: '#eab308', rf: 0.70 },
      { name: 'Carotene (Orange-Yellow)', color: '#ea580c', rf: 0.95 },
    ],
  },
  'class12-cation-mixture': {
    id: 'class12-cation-mixture',
    name: 'Class 12 Cation Mixture (Pb²⁺ and Cd²⁺)',
    description: 'Analytical separation of inorganic metal cations visualized via ammonium sulphide spray.',
    initialSpotColor: '#94a3b8',
    pigments: [
      { name: 'Lead(II) Ion Pb²⁺ (Precipitates PbS brown-black)', color: '#475569', rf: 0.38 },
      { name: 'Cadmium(II) Ion Cd²⁺ (Precipitates CdS bright canary yellow)', color: '#eab308', rf: 0.72 },
    ],
  },
  'class12-leaf-extract': {
    id: 'class12-leaf-extract',
    name: 'Class 12 Spinach Chloroplast Extract',
    description: 'Separation of photosynthetic pigments: carotene, xanthophyll, chlorophyll a, chlorophyll b.',
    initialSpotColor: '#166534',
    pigments: [
      { name: 'Chlorophyll b (Olive Green)', color: '#65a30d', rf: 0.35 },
      { name: 'Chlorophyll a (Blue-Green)', color: '#059669', rf: 0.48 },
      { name: 'Xanthophyll (Yellow)', color: '#facc15', rf: 0.70 },
      { name: 'Carotene (Orange-Yellow)', color: '#f97316', rf: 0.95 },
    ],
  },
};

export const CHROMATOGRAPHY_ASSUMPTIONS = Object.assign(
  [
    'Ascending solvent movement driven by capillary tension in uniform cellulose micro-channels.',
    'Solvent front advances toward maximum paper height (100 mm developing distance from origin baseline).',
    'Rf = (Distance traveled by pigment from baseline) / (Distance traveled by solvent front from baseline).',
    'Components migrate independently according to their relative solubility in mobile phase vs adsorption on cellulose.',
    'Edge effects and horizontal spot diffusion are neglected in this idealized educational model.',
  ],
  {
    paperGrade: 'Whatman No. 1 pure cellulose',
    chamberType: 'Sealed cylindrical glass tank with ground lid',
    eluentComposition: 'Water : Ethanol (80:20 v/v)',
    assumptions: [
      'Ascending solvent movement driven by capillary tension in uniform cellulose micro-channels.',
      'Solvent front advances toward maximum paper height (100 mm developing distance from origin baseline).',
      'Rf = (Distance traveled by pigment from baseline) / (Distance traveled by solvent front from baseline).',
      'Components migrate independently according to their relative solubility in mobile phase vs adsorption on cellulose.',
      'Edge effects and horizontal spot diffusion are neglected in this idealized educational model.',
    ],
  }
);

/**
 * Returns registered ink sample definition
 */
export function getInkSampleDefinition(sampleId: string): InkSampleDefinition | undefined {
  return INK_SAMPLES[sampleId];
}

/**
 * Calculates ascending solvent front displacement (mm) based on elapsed development time.
 * Models capillary rise up to maxFrontMm (standard 80 mm development run).
 */
export function calculateSolventFront(elapsedSeconds: number, maxFrontMm: number = 80): number {
  if (elapsedSeconds <= 0) return 0;
  // Capillary rise slows asymptotically as gravity balances capillary head: h(t) = Hmax * (1 - e^(-t / tau))
  const tau = 35.0; // time constant in seconds
  const front = maxFrontMm * (1 - Math.exp(-elapsedSeconds / tau));
  return Number(Math.min(maxFrontMm, front).toFixed(1));
}

/**
 * Calculates current position of all separated pigment bands along the paper strip.
 */
export function calculatePigmentPositions(
  sampleId: string,
  solventFrontMm: number
): PigmentBand[] {
  const ink = getInkSampleDefinition(sampleId) || INK_SAMPLES['black-ink'];
  const clampedFront = Math.max(0, solventFrontMm);

  return ink.pigments.map((p) => {
    const dist = Number((p.rf * clampedFront).toFixed(1));
    return {
      name: p.name,
      pigmentName: p.name,
      color: p.color,
      rf: p.rf,
      distanceMm: dist,
    };
  });
}

/**
 * Calculates Retention Factor (Rf value):
 * Rf = distance traveled by pigment / distance traveled by solvent front
 */
export function calculateRf(pigmentDistanceMm: number, solventFrontMm: number): number {
  if (solventFrontMm <= 0.001 || isNaN(solventFrontMm)) return 0;
  const rf = pigmentDistanceMm / solventFrontMm;
  return Number(Math.max(0, Math.min(1.0, rf)).toFixed(2));
}
