import { SubjectLabExtension, ConnectionValidationResult } from './types';
import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';

export const GENERIC_EQUIPMENT: EquipmentDefinition[] = [
  {
    id: 'generic-signal-generator',
    name: 'Generic Signal Generator',
    subjectId: 'generic',
    category: 'instrument',
    description: 'Generates a configurable demo numeric signal. Edit its frequency/voltage property to observe real-time telemetry changes.',
    iconName: 'Activity',
    defaultWidth: 160,
    defaultHeight: 110,
    rotatable: true,
    allowedRotations: [0, 90, 180, 270],
    ports: [
      {
        id: 'out',
        name: 'Signal Out',
        type: 'generic',
        xOffset: 160,
        yOffset: 55,
        direction: 'east',
        color: '#3b82f6',
      },
    ],
    propertyDefinitions: [
      {
        id: 'outputSignal',
        label: 'Signal Amplitude',
        type: 'number',
        defaultValue: 5.0,
        min: 0,
        max: 50,
        step: 0.5,
        unit: 'V',
        editable: true,
        description: 'Primary output amplitude of the generic generator.',
      },
      {
        id: 'frequencyHz',
        label: 'Oscillation Frequency',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 100,
        step: 1,
        unit: 'Hz',
        editable: true,
        description: 'Frequency of the cyclic test signal.',
      },
      {
        id: 'powerSwitch',
        label: 'Power Switch',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'generic-box',
    colorTheme: '#2563eb',
  },
  {
    id: 'generic-probe-monitor',
    name: 'Generic Display Monitor',
    subjectId: 'generic',
    category: 'sensor',
    description: 'Receives and displays signals from connected instruments via its attachment port.',
    iconName: 'Laptop',
    defaultWidth: 160,
    defaultHeight: 110,
    rotatable: true,
    allowedRotations: [0, 90, 180, 270],
    ports: [
      {
        id: 'in',
        name: 'Input Port',
        type: 'generic',
        xOffset: 0,
        yOffset: 55,
        direction: 'west',
        color: '#10b981',
      },
    ],
    propertyDefinitions: [
      {
        id: 'sensitivityMultiplier',
        label: 'Gain Scale',
        type: 'number',
        defaultValue: 1.0,
        min: 0.1,
        max: 5.0,
        step: 0.1,
        unit: 'x',
        editable: true,
        description: 'Multiplier applied to incoming raw signal reading.',
      },
      {
        id: 'channelLabel',
        label: 'Channel Name',
        type: 'string',
        defaultValue: 'CH-1 Monitor',
        editable: true,
      },
    ],
    renderType: 'meter',
    colorTheme: '#059669',
  },
  {
    id: 'generic-link-repeater',
    name: 'Signal Coupler / Repeater',
    subjectId: 'generic',
    category: 'component',
    description: 'Dual-port generic bridge component allowing multi-hop connections between equipment.',
    iconName: 'GitFork',
    defaultWidth: 140,
    defaultHeight: 90,
    rotatable: true,
    ports: [
      {
        id: 'in',
        name: 'Inlet Port',
        type: 'generic',
        xOffset: 0,
        yOffset: 45,
        direction: 'west',
        color: '#6366f1',
      },
      {
        id: 'out',
        name: 'Outlet Port',
        type: 'generic',
        xOffset: 140,
        yOffset: 45,
        direction: 'east',
        color: '#6366f1',
      },
    ],
    propertyDefinitions: [
      {
        id: 'attenuationLoss',
        label: 'Signal Loss',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 10,
        step: 1,
        unit: '%',
        editable: true,
      },
    ],
    renderType: 'generic-box',
    colorTheme: '#4f46e5',
  },
];

export const GENERIC_LAB_DEFINITIONS: LabDefinition[] = [
  {
    experimentId: 'generic-demo',
    title: 'Universal Interactive Workspace Demo',
    subjectId: 'generic',
    allowedEquipmentIds: [
      'generic-signal-generator',
      'generic-probe-monitor',
      'generic-link-repeater',
    ],
    initialObjects: [
      {
        id: 'obj-gen-gen1',
        equipmentId: 'generic-signal-generator',
        title: 'Signal Source A',
        x: 140,
        y: 160,
        rotation: 0,
        width: 160,
        height: 110,
        properties: {
          outputSignal: 12.0,
          frequencyHz: 20,
          powerSwitch: true,
        },
        state: {
          activeSignalValue: 12.0,
          statusLabel: 'Transmitting',
        },
      },
      {
        id: 'obj-gen-mon1',
        equipmentId: 'generic-probe-monitor',
        title: 'Display Monitor B',
        x: 480,
        y: 160,
        rotation: 0,
        width: 160,
        height: 110,
        properties: {
          sensitivityMultiplier: 1.0,
          channelLabel: 'CH-1 Monitor',
        },
        state: {
          displayedReading: 0,
          connectionStatus: 'Disconnected',
        },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Position and Move Equipment',
        instruction:
          'Click and drag the Signal Generator or Display Monitor anywhere on the canvas. On mobile devices, touch and drag.',
        targetGoalId: 'goal-move',
        hint: 'You can also tap the tool palette to add additional instruments.',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Connect the Two Instruments',
        instruction:
          'Click or tap on the "Signal Out" port (blue dot on the generator) and connect it to the "Input Port" (green dot on the monitor).',
        targetGoalId: 'goal-connect',
        hint: 'A connecting line will anchor the two instruments together.',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Edit Numeric Property in Inspector',
        instruction:
          'Select the Signal Generator, open the Right Inspector panel, and change "Signal Amplitude" from 12V to another value (e.g. 24V).',
        targetGoalId: 'goal-property',
        hint: 'Notice how the display monitor updates its readout in real-time.',
      },
    ],
    goals: [
      {
        id: 'goal-move',
        description: 'Reposition an instrument on the working canvas.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-connect',
        description: 'Connect the Signal Generator to the Display Monitor.',
        isCompleted: false,
        validatorType: 'components-connected',
      },
      {
        id: 'goal-property',
        description: 'Modify an instrument numeric property using the Inspector.',
        isCompleted: false,
        validatorType: 'property-matched',
      },
    ],
    defaultNotebookNotes:
      'Universal Interactive Workspace Generic Demo:\n- Demonstrated equipment dragging and positioning.\n- Demonstrated port connection topology.\n- Demonstrated real-time inspector property mutation.',
  },
];

export const genericExtension: SubjectLabExtension = {
  subjectId: 'generic',
  name: 'Generic Demonstration Workbench',
  getEquipmentCatalogue: () => GENERIC_EQUIPMENT,
  getLabDefinitions: () => GENERIC_LAB_DEFINITIONS,
  validateConnection: (
    fromObj: WorkspaceObject,
    fromPort: PortDefinition,
    toObj: WorkspaceObject,
    toPort: PortDefinition,
    existingConnections: WorkspaceConnection[]
  ): ConnectionValidationResult => {
    if (fromObj.id === toObj.id) {
      return { allowed: false, reason: 'Cannot connect an instrument to its own port.' };
    }

    const alreadyConnected = existingConnections.some(
      (c) =>
        (c.fromObjectId === fromObj.id &&
          c.fromPortId === fromPort.id &&
          c.toObjectId === toObj.id &&
          c.toPortId === toPort.id) ||
        (c.fromObjectId === toObj.id &&
          c.fromPortId === toPort.id &&
          c.toObjectId === fromObj.id &&
          c.toPortId === fromPort.id)
    );

    if (alreadyConnected) {
      return { allowed: false, reason: 'These ports are already connected.' };
    }

    return { allowed: true, suggestedColor: '#3b82f6' };
  },
  evaluateSimulation: (
    objects: WorkspaceObject[],
    connections: WorkspaceConnection[]
  ): SimulationResult => {
    const updates: Record<string, Record<string, string | number | boolean>> = {};
    const messages: string[] = [];

    // Find all generators
    for (const obj of objects) {
      if (obj.equipmentId === 'generic-signal-generator') {
        const powerOn = obj.properties.powerSwitch !== false;
        const amplitude = Number(obj.properties.outputSignal ?? 0);
        updates[obj.id] = {
          activeSignalValue: powerOn ? amplitude : 0,
          statusLabel: powerOn ? 'Transmitting' : 'Power Off',
        };
      }
    }

    // Propagate signal to connected monitors
    for (const obj of objects) {
      if (obj.equipmentId === 'generic-probe-monitor') {
        // Find if any connection connects to this monitor's 'in' port
        const inbound = connections.filter(
          (c) =>
            (c.toObjectId === obj.id && c.toPortId === 'in') ||
            (c.fromObjectId === obj.id && c.fromPortId === 'in')
        );

        if (inbound.length > 0) {
          let receivedVal = 0;
          for (const conn of inbound) {
            const senderId = conn.fromObjectId === obj.id ? conn.toObjectId : conn.fromObjectId;
            const sender = objects.find((o) => o.id === senderId);
            if (sender) {
              const senderVal = Number(
                updates[sender.id]?.activeSignalValue ?? sender.properties.outputSignal ?? 0
              );
              receivedVal += senderVal;
            }
          }

          const multiplier = Number(obj.properties.sensitivityMultiplier ?? 1.0);
          const finalReading = Number((receivedVal * multiplier).toFixed(2));

          updates[obj.id] = {
            displayedReading: finalReading,
            connectionStatus: `Connected (${receivedVal}V raw × ${multiplier})`,
          };
          messages.push(`Display Monitor received signal: ${finalReading} units.`);
        } else {
          updates[obj.id] = {
            displayedReading: 0,
            connectionStatus: 'Disconnected (No cable plugged)',
          };
        }
      }
    }

    return {
      valid: true,
      errors: [],
      warnings: [],
      messages,
      objectStateUpdates: updates,
    };
  },
};
