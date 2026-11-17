/**
 * Chemistry Typed Structured State Model & Transfer Interfaces
 * Standard Educational Curriculum Models (NCERT / CBSE / ICSE / State Boards)
 */

export type SubstanceCategory =
  | 'strong-acid'
  | 'weak-acid'
  | 'neutral'
  | 'weak-base'
  | 'strong-base'
  | 'natural-indicator'
  | 'synthetic-indicator'
  | 'salt-solution';

export interface ChemicalSubstance {
  id: string;
  name: string;
  formula: string;
  category: SubstanceCategory;
  basePH: number;
  defaultConcentrationM: number;
  baseColor: string; // Hex color code
  hazards: string[];
  safetyNotes: string;
}

export interface MixtureComponent {
  substanceId: string;
  substanceName: string;
  volumeMl: number;
  concentrationM: number;
  moles: number; // concentration * (volumeMl / 1000)
}

export interface ContainerLiquidState {
  capacityMl: number;
  totalVolumeMl: number;
  temperatureC: number;
  ph: number;
  color: string;
  components: MixtureComponent[];
  isStirred: boolean;
  indicatorActive?: 'universal' | 'turmeric' | 'red-cabbage';
  reactionState:
    | 'empty'
    | 'unmixed'
    | 'homogeneous'
    | 'neutralized'
    | 'acid-shifted'
    | 'base-shifted'
    | 'overflow-alert';
  observationText: string;
  isOverflow: boolean;
}

export interface LiquidTransferResult {
  success: boolean;
  transferredVolumeMl: number;
  sourceRemainingMl: number;
  destinationTotalMl: number;
  overflowOccurred: boolean;
  overflowVolumeMl: number;
  sourceNewState: ContainerLiquidState;
  destinationNewState: ContainerLiquidState;
  message: string;
  error?: string;
}

export interface IndicatorColorRule {
  minPH: number;
  maxPH: number;
  color: string;
  label: string;
}
