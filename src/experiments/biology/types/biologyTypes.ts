/**
 * PrayogaProof Biology Domain Types
 * Primary owned folder: src/experiments/biology/
 * Branch: hitesh-biology
 */

import { ClassLevel } from '../../../types';

// =========================================================================
// 1. VIRTUAL MICROSCOPE STUDIO TYPES
// =========================================================================

export type MicroscopeObjectiveMagnification = '4x' | '10x' | '40x' | '100x';

export interface MicroscopeObjectiveSpec {
  power: MicroscopeObjectiveMagnification;
  numericalAperture: number;
  workingDistanceMm: number;
  colorRing: string;
  fieldOfViewDiameterUm: number;
  depthOfFieldUm: number;
}

export interface SpecimenOrganelle {
  id: string;
  name: string;
  scientificDescription: string;
  xPct: number; // 0 to 100 percentage across field of view
  yPct: number;
  radiusUm: number;
  color: string;
  stainAffinity: 'methylene-blue' | 'safranin' | 'acetocarmine' | 'iodine' | 'unstained';
}

export interface MicroscopeSlideSpecimen {
  id: string;
  commonName: string;
  scientificName: string;
  tissueType: 'plant-epidermis' | 'onion-peel' | 'human-cheek-epithelial' | 'root-tip-mitosis' | 'blood-smear' | 'chlamydomonas' | 'amoeba';
  classLevel: ClassLevel;
  curriculumChapter: string;
  preparationType: 'wet-mount' | 'permanent-slide' | 'cross-section' | 'smear' | 'peel-mount' | 'squash-mount';
  recommendedStain: 'methylene-blue' | 'safranin' | 'acetocarmine' | 'iodine';
  idealFocalPlaneZ: number; // 0 to 100 focus index
  baseColor: string;
  organelles: SpecimenOrganelle[];
  morphologyNote: string;
  diagnosticFeatures: string[];
}

export interface VirtualMicroscopeState {
  currentSlideId: string | null;
  eyepieceMagnification: number; // e.g. 10x
  activeObjective: MicroscopeObjectiveMagnification;
  coarseFocus: number; // 0 to 100
  fineFocus: number; // 0 to 100
  stageX: number; // -50 to 50 um offset
  stageY: number; // -50 to 50 um offset
  irisDiaphragmPercent: number; // 0 to 100 illumination aperture
  lightIntensityPercent: number; // 0 to 100 lamp voltage
  isOilApplied: boolean;
  activeStain: 'unstained' | 'methylene-blue' | 'safranin' | 'acetocarmine' | 'iodine';
  isSlideSecured: boolean;
}

// =========================================================================
// 2. BIOLOGY WORKBENCH & APPARATUS TYPES
// =========================================================================

export type BiologyApparatusCategory =
  | 'microscopy'
  | 'glassware'
  | 'biological-specimen'
  | 'stain-reagent'
  | 'physiological-model'
  | 'biochemical-assay'
  | 'measurement';

export interface BiologicalReagent {
  id: string;
  name: string;
  formula?: string;
  concentrationMolar?: number;
  concentrationPercent?: number;
  hazardNote: string; // purely virtual safety note
  stainTarget?: string;
}

export type OsmoticTonicity = 'hypotonic' | 'isotonic' | 'hypertonic';

export type PlantCellTurgorStatus = 'plasmolysed' | 'flaccid' | 'incipient-plasmolysis' | 'turgid';

export interface OsmosisSimulationParameters {
  externalSoluteConcentrationMolar: number; // 0.0 to 1.5 M sucrose or NaCl
  internalSoluteConcentrationMolar: number; // typically ~0.3 M for plant sap
  temperatureKelvin: number; // ~293 to 310 K
  membraneHydraulicConductivityLp: number; // um/(s·bar)
  reflectionCoefficientSigma: number; // 0 (permeable) to 1.0 (strictly semipermeable)
  cellType: 'plant-cell-with-wall' | 'animal-rbc';
  elapsedTimeSeconds: number;
}

export interface OsmosisSimulationResults {
  waterPotentialInternalMpa: number;
  waterPotentialExternalMpa: number;
  osmoticPressureInternalBar: number;
  osmoticPressureExternalBar: number;
  tonicity: OsmoticTonicity;
  netWaterFluxJv: number; // um/s, positive = influx, negative = efflux
  relativeCellVolume: number; // 0.5 to 1.4 (normalized)
  turgorPressureBar: number; // 0 for animal cells or plasmolysed plant cells
  plantCellState: PlantCellTurgorStatus;
  scientificObservation: string;
  explanation: string;
}

// =========================================================================
// 3. GENETICS & CELL DIVISION TYPES
// =========================================================================

export type CellCyclePhase =
  | 'interphase-g1'
  | 'interphase-s'
  | 'interphase-g2'
  | 'prophase'
  | 'metaphase'
  | 'anaphase'
  | 'telophase'
  | 'cytokinesis';

export type MeiosisPhase =
  | 'prophase-1-leptotene'
  | 'prophase-1-zygotene'
  | 'prophase-1-pachytene'
  | 'prophase-1-diplotene'
  | 'prophase-1-diakinesis'
  | 'metaphase-1'
  | 'anaphase-1'
  | 'telophase-1'
  | 'interkinesis'
  | 'prophase-2'
  | 'metaphase-2'
  | 'anaphase-2'
  | 'telophase-2'
  | 'tetrad-spores';

export interface PunnettSquareCrossInput {
  traitName: string;
  dominantAllele: string; // e.g. 'T'
  recessiveAllele: string; // e.g. 't'
  dominantPhenotype: string; // e.g. 'Tall'
  recessivePhenotype: string; // e.g. 'Dwarf'
  parent1Genotype: string; // e.g. 'Tt'
  parent2Genotype: string; // e.g. 'Tt'
}

export interface PunnettSquareOutcome {
  gametesParent1: string[];
  gametesParent2: string[];
  grid: Array<{ genotype: string; phenotype: string }>;
  genotypeRatio: Record<string, number>;
  phenotypeRatio: Record<string, number>;
  genotypeFractions: Record<string, string>;
  phenotypeFractions: Record<string, string>;
  isMendelianExpected: boolean;
  theoreticalRatioString: string;
}

// =========================================================================
// 4. OFFLINE AI BIOLOGY TUTOR & REMEDIATION
// =========================================================================

export interface TutorContext {
  subject: 'biology';
  classLevel: ClassLevel;
  chapterTitle: string;
  topicTitle?: string;
  currentExperimentId?: string;
  lastQuestionAttempted?: {
    questionText: string;
    studentSelectedOption: string;
    correctOption: string;
    identifiedMisconception?: string;
  };
}

export interface TutorResponse {
  answerMarkdown: string;
  scientificPrinciple: string;
  ncertReference: string;
  suggestedFollowUpQuestions: string[];
  recommendedDiagramId?: string;
  recommendedExperimentId?: string;
  voiceNarrationText: string;
}

export interface MisconceptionRemediationRule {
  misconceptionId: string;
  topicTag: string;
  erroneousBelief: string;
  scientificRefutation: string;
  remedialExplanation: string;
  diagnosticCheckQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// =========================================================================
// 5. NEET & CBSE QUESTION BANK TYPES
// =========================================================================

export type BiologyExamMode = 'cbse-class-10' | 'cbse-class-11' | 'cbse-class-12' | 'neet-ug';

export type BiologyQuestionFormat =
  | 'single-correct-mcq'
  | 'assertion-reason'
  | 'statement-1-2'
  | 'diagram-based'
  | 'experimental-data-case';

export interface BiologyQuestion {
  id: string;
  examMode: BiologyExamMode;
  classLevel: ClassLevel;
  chapterNumber: number;
  chapterTitle: string;
  topicTitle: string;
  format: BiologyQuestionFormat;
  questionText: string;
  diagramSvgId?: string;
  options: string[];
  correctIndex: number;
  assertionText?: string;
  reasonText?: string;
  ncertLineReference: string;
  scientificExplanation: string;
  whyIncorrectOptionsFail: string[];
  difficulty: 'Easy' | 'Medium' | 'Challenging-NEET';
  misconceptionAddressed?: string;
  reviewStatus: 'Verified-Scientifically-Sound' | 'Needs-Review';
}

// =========================================================================
// 6. PRACTICAL REPORT GENERATOR TYPES
// =========================================================================

export interface BiologyObservationRecord {
  trialNumber: number;
  independentVariable: string;
  independentValue: string;
  dependentVariable: string;
  dependentValue: string;
  visualNote: string;
  timestamp: string;
}

export interface BiologyPracticalReport {
  id: string;
  experimentId: string;
  experimentTitle: string;
  studentName: string;
  gradeLevel: string;
  dateGenerated: string;
  aim: string;
  principle: string;
  apparatusUsed: string[];
  procedureSteps: string[];
  controlledVariables: Record<string, string>;
  observations: BiologyObservationRecord[];
  resultsAndInference: string;
  precautions: string[];
  educationalDisclaimer: string;
  quizScore?: {
    score: number;
    total: number;
    percentage: number;
  };
}
