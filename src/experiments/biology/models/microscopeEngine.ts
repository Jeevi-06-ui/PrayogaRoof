/**
 * PrayogaProof Scientific Engine — Virtual Microscope Optical Engine
 *
 * Implements physical optics formulas:
 * - Abbe diffraction limit: d = λ / (2 · NA)
 * - Total magnification = M_eyepiece × M_objective
 * - Field of View (FOV) scaling
 * - Focal plane optical depth-of-field blur convolution
 */

import {
  MicroscopeObjectiveMagnification,
  MicroscopeObjectiveSpec,
  MicroscopeSlideSpecimen,
  VirtualMicroscopeState,
} from '../types/biologyTypes';

// Standard optical specifications for DIN achromatic objectives
export const OBJECTIVE_SPECS: Record<MicroscopeObjectiveMagnification, MicroscopeObjectiveSpec> = {
  '4x': {
    power: '4x',
    numericalAperture: 0.10,
    workingDistanceMm: 18.0,
    colorRing: '#ef4444', // Red ring
    fieldOfViewDiameterUm: 4500, // 4.5 mm
    depthOfFieldUm: 50.0,
  },
  '10x': {
    power: '10x',
    numericalAperture: 0.25,
    workingDistanceMm: 7.0,
    colorRing: '#eab308', // Yellow ring
    fieldOfViewDiameterUm: 1800, // 1.8 mm
    depthOfFieldUm: 8.5,
  },
  '40x': {
    power: '40x',
    numericalAperture: 0.65,
    workingDistanceMm: 0.6,
    colorRing: '#3b82f6', // Blue ring
    fieldOfViewDiameterUm: 450, // 0.45 mm
    depthOfFieldUm: 1.0,
  },
  '100x': {
    power: '100x',
    numericalAperture: 1.25, // requires cedarwood immersion oil (n=1.515)
    workingDistanceMm: 0.15,
    colorRing: '#ffffff', // White ring
    fieldOfViewDiameterUm: 180, // 0.18 mm
    depthOfFieldUm: 0.35,
  },
};

/**
 * Standard educational slide specimens catalog
 */
export const SLIDE_CATALOG: MicroscopeSlideSpecimen[] = [
  {
    id: 'onion-peel',
    commonName: 'Onion Epidermal Peel',
    scientificName: 'Allium cepa epidermis',
    tissueType: 'onion-peel',
    classLevel: 'foundation',
    curriculumChapter: 'Life Processes & The Fundamental Unit of Life',
    preparationType: 'wet-mount',
    recommendedStain: 'safranin',
    idealFocalPlaneZ: 50,
    baseColor: '#fef3c7',
    organelles: [
      { id: 'cw-1', name: 'Cellulosic Cell Wall', scientificDescription: 'Rigid outer boundary giving structural integrity', xPct: 20, yPct: 30, radiusUm: 40, color: '#ca8a04', stainAffinity: 'safranin' },
      { id: 'nuc-1', name: 'Peripheral Nucleus', scientificDescription: 'Prominent eccentric nucleus pushed to edge by central vacuole', xPct: 28, yPct: 40, radiusUm: 8, color: '#b91c1c', stainAffinity: 'safranin' },
      { id: 'vac-1', name: 'Large Central Vacuole', scientificDescription: 'Sap-filled single vacuole occupying >80% volume', xPct: 50, yPct: 50, radiusUm: 35, color: '#fef08a', stainAffinity: 'unstained' },
    ],
    morphologyNote: 'Linear brick-like jigsaw arrangement of contiguous rectangular plant cells with distinct cell walls and peripheral nuclei.',
    diagnosticFeatures: [
      'Hexagonal/rectangular brick arrangement',
      'Double boundary cell wall stained deep pink-red by safranin',
      'Eccentric peripheral nucleus with visible nucleolus',
      'Absence of chloroplasts (non-photosynthetic storage bulb scale leaf)',
    ],
  },
  {
    id: 'human-cheek-epithelial',
    commonName: 'Human Cheek Epithelial Cells',
    scientificName: 'Homo sapiens stratified squamous epithelium',
    tissueType: 'human-cheek-epithelial',
    classLevel: 'foundation',
    curriculumChapter: 'Tissues & Fundamental Unit of Life',
    preparationType: 'smear',
    recommendedStain: 'methylene-blue',
    idealFocalPlaneZ: 55,
    baseColor: '#e0f2fe',
    organelles: [
      { id: 'pm-1', name: 'Plasma Membrane', scientificDescription: 'Thin, flexible selectively permeable boundary (no cell wall)', xPct: 50, yPct: 50, radiusUm: 30, color: '#0284c7', stainAffinity: 'methylene-blue' },
      { id: 'nuc-cheek', name: 'Centrally Located Nucleus', scientificDescription: 'Spherical deeply basophilic nucleus', xPct: 50, yPct: 50, radiusUm: 7, color: '#1e3a8a', stainAffinity: 'methylene-blue' },
      { id: 'cyto-1', name: 'Granular Cytoplasm', scientificDescription: 'Translucent cytoplasm containing microfilaments and glycogen granules', xPct: 40, yPct: 45, radiusUm: 20, color: '#bae6fd', stainAffinity: 'methylene-blue' },
    ],
    morphologyNote: 'Isolated or overlapping flat polygonal squamous cells lacking rigid cell walls, with prominent central rounded nuclei.',
    diagnosticFeatures: [
      'Irregular polygonal shape with folded cell margins',
      'Centrally located, dark blue stained spherical nucleus',
      'Absence of rigid cell walls and prominent central vacuoles',
      'Delicate, semi-transparent cytoplasm',
    ],
  },
  {
    id: 'leaf-epidermis-stomata',
    commonName: 'Leaf Epidermis with Stomata',
    scientificName: 'Tradescantia / Zea mays leaf peel',
    tissueType: 'plant-epidermis',
    classLevel: 'class-11',
    curriculumChapter: 'Anatomy of Flowering Plants & Plant Physiology',
    preparationType: 'peel-mount',
    recommendedStain: 'safranin',
    idealFocalPlaneZ: 48,
    baseColor: '#ecfdf5',
    organelles: [
      { id: 'pore-1', name: 'Stomatal Pore', scientificDescription: 'Aperture regulating gas exchange and transpirational water loss', xPct: 50, yPct: 50, radiusUm: 6, color: '#047857', stainAffinity: 'unstained' },
      { id: 'gc-1', name: 'Kidney-Shaped Guard Cells', scientificDescription: 'Specialized paired cells with differentially thickened inner walls', xPct: 45, yPct: 50, radiusUm: 16, color: '#10b981', stainAffinity: 'safranin' },
      { id: 'ep-1', name: 'Epidermal Pavement Cells', scientificDescription: 'Sinuous interlocking cells devoid of chloroplasts', xPct: 20, yPct: 20, radiusUm: 38, color: '#a7f3d0', stainAffinity: 'safranin' },
    ],
    morphologyNote: 'Wavy epidermal jigsaw puzzle containing specialized elliptic stomatal complexes flanked by chloroplast-rich guard cells.',
    diagnosticFeatures: [
      'Bean/kidney-shaped guard cells in dicots (dumbbell in monocots)',
      'Thickened inner cellulosic walls facing stomatal aperture',
      'Chloroplasts present in guard cells but absent in adjacent epidermal cells',
      'Sub-stomatal air cavity connection for transpiration',
    ],
  },
  {
    id: 'root-tip-mitosis',
    commonName: 'Onion Root Tip Meristem (Mitosis Stages)',
    scientificName: 'Allium cepa root apical meristem',
    tissueType: 'root-tip-mitosis',
    classLevel: 'class-11',
    curriculumChapter: 'Cell Cycle and Cell Division',
    preparationType: 'squash-mount',
    recommendedStain: 'acetocarmine',
    idealFocalPlaneZ: 52,
    baseColor: '#fff1f2',
    organelles: [
      { id: 'chr-metaphase', name: 'Equatorial Metaphase Plate', scientificDescription: 'Bivalent chromosomes aligned along cell center', xPct: 35, yPct: 50, radiusUm: 12, color: '#be123c', stainAffinity: 'acetocarmine' },
      { id: 'chr-anaphase', name: 'Diverging Anaphase Chromatids', scientificDescription: 'Sister chromatids migrating towards opposite spindle poles', xPct: 65, yPct: 50, radiusUm: 12, color: '#9f1239', stainAffinity: 'acetocarmine' },
    ],
    morphologyNote: 'Rapidly proliferating meristematic cells showing compact square shapes and condensed, deeply stained chromosomes in all stages of mitosis.',
    diagnosticFeatures: [
      'Prophase: Chromatin condenses into distinct thread-like chromatids; nucleolus disappears',
      'Metaphase: Chromosomes align at equatorial plate; centromeres attached to spindle fibers',
      'Anaphase: Centromeres split; daughter chromatids migrate towards opposite centrosome poles',
      'Telophase: Nuclear envelopes reform; chromatin decondenses followed by cell plate cytokinesis',
    ],
  },
  {
    id: 'blood-smear',
    commonName: 'Human Peripheral Blood Smear',
    scientificName: 'Homo sapiens blood smear',
    tissueType: 'blood-smear',
    classLevel: 'class-11',
    curriculumChapter: 'Body Fluids and Circulation',
    preparationType: 'smear',
    recommendedStain: 'methylene-blue',
    idealFocalPlaneZ: 50,
    baseColor: '#fff7ed',
    organelles: [
      { id: 'rbc-1', name: 'Biconcave Erythrocytes (RBCs)', scientificDescription: 'Enucleated disks packed with oxygen-carrying hemoglobin', xPct: 40, yPct: 40, radiusUm: 7, color: '#f87171', stainAffinity: 'unstained' },
      { id: 'wbc-neutrophil', name: 'Polymorphonuclear Neutrophil', scientificDescription: 'Leukocyte with 3-5 lobed purple nucleus', xPct: 60, yPct: 55, radiusUm: 12, color: '#7c3aed', stainAffinity: 'methylene-blue' },
      { id: 'plt-1', name: 'Platelets (Thrombocytes)', scientificDescription: 'Tiny purple cytoplasmic cell fragments aiding coagulation', xPct: 30, yPct: 70, radiusUm: 2.5, color: '#c084fc', stainAffinity: 'methylene-blue' },
    ],
    morphologyNote: 'Abundant pale pink biconcave erythrocytes interspersed with distinct nucleated leukocytes (neutrophils, lymphocytes) and minute platelets.',
    diagnosticFeatures: [
      'Erythrocytes (RBCs): Non-nucleated, circular, biconcave disks with lighter central pallor',
      'Neutrophils: Multilobed nucleus (3-5 lobes) connected by thin chromatin strands',
      'Lymphocytes: Large rounded dark purple nucleus occupying almost the entire cell',
      'Platelets: Tiny irregular purple cytoplasmic fragments (2-3 μm diameter)',
    ],
  },
];

/**
 * Calculates optical resolving power (Abbe limit) in micrometers.
 * λ is assumed to be 550 nm (0.55 μm, green-yellow light).
 */
export function calculateResolvingPowerUm(numericalAperture: number, wavelengthUm: number = 0.55): number {
  if (numericalAperture <= 0) return 100.0;
  return wavelengthUm / (2 * numericalAperture);
}

/**
 * Calculates focal blur factor (0 = crystal clear focus, 100 = completely blurred out)
 */
export function calculateFocalBlur(
  state: VirtualMicroscopeState,
  specimen: MicroscopeSlideSpecimen
): { blurPx: number; isFocused: boolean; opticalResolutionUm: number } {
  const objSpec = OBJECTIVE_SPECS[state.activeObjective];

  // Combine coarse and fine focus into a single 0-100 virtual Z-axis position
  const currentZ = (state.coarseFocus * 0.8) + (state.fineFocus * 0.2);
  const deltaZ = Math.abs(currentZ - specimen.idealFocalPlaneZ);

  // Higher magnifications have narrower depth of field, making focus much more sensitive
  const sensitivityMultiplier = objSpec.power === '100x' ? 3.5 : objSpec.power === '40x' ? 2.0 : objSpec.power === '10x' ? 1.0 : 0.4;
  const effectiveDeltaZ = deltaZ * sensitivityMultiplier;

  // Blur in pixels (for CSS filter or Canvas convolution)
  const blurPx = Math.min(25, effectiveDeltaZ * 0.85);
  const isFocused = blurPx < 1.2;

  // Resolving power
  let effectiveNA = objSpec.numericalAperture;
  if (objSpec.power === '100x' && !state.isOilApplied) {
    // Air gap drastically lowers NA from 1.25 to ~0.8 due to light refraction
    effectiveNA = 0.75;
  }

  const opticalResolutionUm = calculateResolvingPowerUm(effectiveNA);

  return {
    blurPx,
    isFocused,
    opticalResolutionUm,
  };
}
