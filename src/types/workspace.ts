import { SubjectId } from './index';

export type EquipmentCategory =
  | 'instrument'
  | 'component'
  | 'sensor'
  | 'container'
  | 'chemical'
  | 'optics'
  | 'mechanics'
  | 'accessory';

export type PortType =
  | 'electrical-positive'
  | 'electrical-negative'
  | 'fluid-in'
  | 'fluid-out'
  | 'optical-axis'
  | 'mechanical-pin'
  | 'generic';

export interface PortDefinition {
  id: string;
  name: string;
  type: PortType;
  xOffset: number; // Offset in px or normalized (0 to width)
  yOffset: number; // Offset in px or normalized (0 to height)
  direction?: 'north' | 'south' | 'east' | 'west';
  color?: string;
}

export type PropertyValueType = 'number' | 'string' | 'boolean' | 'select' | 'color';

export interface PropertyDefinition {
  id: string;
  label: string;
  type: PropertyValueType;
  defaultValue: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string | number }>;
  editable?: boolean;
  description?: string;
}

export interface EquipmentDefinition {
  id: string;
  name: string;
  subjectId: SubjectId | 'generic';
  category: EquipmentCategory;
  description: string;
  iconName: string;
  defaultWidth: number;
  defaultHeight: number;
  rotatable: boolean;
  allowedRotations?: number[]; // e.g. [0, 90, 180, 270]
  ports: PortDefinition[];
  propertyDefinitions: PropertyDefinition[];
  renderType:
    | 'power-supply'
    | 'battery'
    | 'ground'
    | 'junction'
    | 'resistor'
    | 'meter'
    | 'switch'
    | 'lamp'
    | 'lens'
    | 'optical-source'
    | 'pendulum'
    | 'magnet'
    | 'compass'
    | 'stopwatch'
    | 'screen'
    | 'beaker'
    | 'test-tube'
    | 'spotting-plate'
    | 'pipette'
    | 'ph-strip'
    | 'flask'
    | 'cylinder'
    | 'stirrer'
    | 'funnel'
    | 'filter-paper'
    | 'thermometer'
    | 'reagent-bottle'
    | 'burner'
    | 'chromatography-paper'
    | 'developing-chamber'
    | 'chromatography-ruler'
    | 'iron-nail'
    | 'evaporating-dish'
    | 'watch-glass'
    | 'vernier-calliper'
    | 'test-cylinder'
    | 'test-sphere'
    | 'screw-gauge'
    | 'gauge-wire'
    | 'gauge-plate'
    | 'irregular-lamina'
    | 'graph-grid'
    | 'spherometer'
    | 'curved-surface'
    | 'beam-balance'
    | 'weight-box'
    | 'unknown-mass'
    | 'force-board'
    | 'pulley-weight'
    | 'friction-board'
    | 'friction-block'
    | 'inclined-plane'
    | 'incline-slider'
    | 'helical-spring-stand'
    | 'slotted-weight-hanger'
    | 'boyle-cylinder'
    | 'resistance-wire-board'
    | 'metre-bridge-board'
    | 'moving-coil-galvanometer'
    | 'decade-resistance-box'
    | 'ammeter-voltmeter-calibrator'
    | 'concave-mirror'
    | 'convex-mirror'
    | 'concave-lens'
    | 'optical-prism'
    | 'pn-diode-board'
    | 'thiele-tube'
    | 'boiling-tube'
    | 'chemical-balance'
    | 'graduated-burette'
    | 'acid-bench'
    | 'equilibrium-vessel'
    | 'volumetric-flask'
    | 'titration-bench'
    | 'salt-analysis-bench'
    | 'element-detection-bench'
    | 'colloid-bench'
    | 'kinetics-bench'
    | 'calorimeter-bench'
    | 'daniell-cell-bench'
    | 'generic-box'
    | 'sensor-probe';
  colorTheme?: string;
}

export interface WorkspaceObject {
  id: string;
  equipmentId: string;
  title: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  properties: Record<string, string | number | boolean>;
  state: Record<string, string | number | boolean>;
}

export interface WorkspaceConnection {
  id: string;
  fromObjectId: string;
  fromPortId: string;
  toObjectId: string;
  toPortId: string;
  color?: string;
  type: 'wire' | 'fluid-tube' | 'optical-ray' | 'mechanical-link' | 'generic';
}

export type WorkspaceActionType =
  | 'ADD_OBJECT'
  | 'MOVE_OBJECT'
  | 'ROTATE_OBJECT'
  | 'DELETE_OBJECT'
  | 'UPDATE_PROPERTY'
  | 'ADD_CONNECTION'
  | 'DELETE_CONNECTION'
  | 'RESET_WORKSPACE'
  | 'LOAD_WORKSPACE'
  | 'BATCH_ACTION';

export interface WorkspaceAction {
  type: WorkspaceActionType;
  description: string;
  timestamp: number;
  payload: {
    previousObjects?: WorkspaceObject[];
    currentObjects?: WorkspaceObject[];
    previousConnections?: WorkspaceConnection[];
    currentConnections?: WorkspaceConnection[];
    objectId?: string;
    connectionId?: string;
    propertyKey?: string;
    previousValue?: string | number | boolean;
    newValue?: string | number | boolean;
  };
}

export interface MeasurementRecord {
  id: string;
  timestamp: string;
  label: string;
  value: string | number;
  unit: string;
  notes?: string;
}

export interface LabNotebook {
  observations: string;
  measurements: MeasurementRecord[];
  conclusions: string;
  lastUpdated: string;
}

export interface GuidedStep {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  targetGoalId?: string;
  hint?: string;
  expectedEquipmentIds?: string[];
}

export interface LabGoal {
  id: string;
  description: string;
  isCompleted: boolean;
  validatorType: 'equipment-placed' | 'components-connected' | 'property-matched' | 'generic';
  validatorParams?: Record<string, any>;
}

export interface LabDefinition {
  experimentId: string;
  title: string;
  subjectId: SubjectId | 'generic';
  allowedEquipmentIds: string[];
  initialObjects?: WorkspaceObject[];
  initialConnections?: WorkspaceConnection[];
  guidedSteps: GuidedStep[];
  goals: LabGoal[];
  defaultNotebookNotes?: string;
}

export interface SimulationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  messages: string[];
  objectStateUpdates: Record<string, Record<string, string | number | boolean>>;
  activeMeasurements?: MeasurementRecord[];
}

export type LabMode = 'guided' | 'freelab';
