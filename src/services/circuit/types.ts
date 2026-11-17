export interface ElectricalTerminal {
  objectId: string;
  portId: string;
}

export interface SolvedComponentState {
  voltageDrop: number; // in Volts
  current: number; // in Amperes
  power: number; // in Watts
  isEnergized: boolean;
  displayReading?: number;
  displayUnits?: string;
  statusText?: string;
  extraProps?: Record<string, string | number | boolean>;
}

export interface CircuitSolverResult {
  isValid: boolean;
  isOpenCircuit: boolean;
  isShortCircuit: boolean;
  hasVoltageSource: boolean;
  totalVoltage: number; // in Volts
  totalCurrent: number; // in Amperes
  equivalentResistance: number; // in Ohms
  nodeVoltages: Record<number, number>; // node index -> Volts
  componentStates: Record<string, SolvedComponentState>;
  errors: string[];
  warnings: string[];
  messages: string[];
  topologySummary: string;
}

export interface ConceptualQuestion {
  id: string;
  experimentId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
