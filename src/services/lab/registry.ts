import { SubjectLabExtension } from './types';
import { genericExtension } from './genericExtension';
import { physicsExtension } from './physicsExtension';
import { chemistryExtension } from './chemistryExtension';
import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';
import { SubjectId } from '../../types';

export const LAB_EXTENSIONS: Record<string, SubjectLabExtension> = {
  generic: genericExtension,
  physics: physicsExtension,
  chemistry: chemistryExtension,
};

export function getExtensionBySubject(subjectId: SubjectId | 'generic'): SubjectLabExtension {
  return LAB_EXTENSIONS[subjectId] || genericExtension;
}

export function getAllEquipmentCatalogue(subjectFilter?: SubjectId | 'generic'): EquipmentDefinition[] {
  if (subjectFilter) {
    const ext = LAB_EXTENSIONS[subjectFilter];
    return ext ? ext.getEquipmentCatalogue() : [];
  }

  // Combine generic, physics, and chemistry equipment
  const all: EquipmentDefinition[] = [];
  Object.values(LAB_EXTENSIONS).forEach((ext) => {
    all.push(...ext.getEquipmentCatalogue());
  });
  return all;
}

export function getEquipmentDefinition(id: string): EquipmentDefinition | undefined {
  return getAllEquipmentCatalogue().find((eq) => eq.id === id);
}

export function getLabDefinition(experimentId: string): LabDefinition | undefined {
  for (const ext of Object.values(LAB_EXTENSIONS)) {
    const found = ext.getLabDefinitions().find((lab) => lab.experimentId === experimentId);
    if (found) return found;
  }
  return undefined;
}

export function validateConnection(
  fromObj: WorkspaceObject,
  fromPort: PortDefinition,
  toObj: WorkspaceObject,
  toPort: PortDefinition,
  connections: WorkspaceConnection[],
  subjectId: SubjectId | 'generic' = 'generic'
) {
  const extension = getExtensionBySubject(subjectId);
  return extension.validateConnection(fromObj, fromPort, toObj, toPort, connections);
}

export function runSimulation(
  objects: WorkspaceObject[],
  connections: WorkspaceConnection[],
  subjectId: SubjectId | 'generic' = 'generic'
): SimulationResult {
  const extension = getExtensionBySubject(subjectId);
  return extension.evaluateSimulation(objects, connections);
}
