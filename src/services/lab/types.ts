import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';
import { SubjectId } from '../../types';

export interface ConnectionValidationResult {
  allowed: boolean;
  reason?: string;
  suggestedColor?: string;
}

export interface SubjectLabExtension {
  subjectId: SubjectId | 'generic';
  name: string;
  getEquipmentCatalogue: () => EquipmentDefinition[];
  getLabDefinitions: () => LabDefinition[];
  validateConnection: (
    fromObj: WorkspaceObject,
    fromPort: PortDefinition,
    toObj: WorkspaceObject,
    toPort: PortDefinition,
    existingConnections: WorkspaceConnection[]
  ) => ConnectionValidationResult;
  evaluateSimulation: (
    objects: WorkspaceObject[],
    connections: WorkspaceConnection[],
    deltaMs?: number
  ) => SimulationResult;
}
