import { SubjectLabExtension, ConnectionValidationResult } from './types';
import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';

export const PHYSICS_EQUIPMENT: EquipmentDefinition[] = [
  {
    id: 'dc-power-supply',
    name: 'DC Power Supply',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Adjustable DC voltage generator with isolated positive (+) and negative (-) banana binding posts.',
    iconName: 'Zap',
    defaultWidth: 170,
    defaultHeight: 120,
    rotatable: true,
    allowedRotations: [0, 90, 180, 270],
    ports: [
      {
        id: 'pos',
        name: '+ Positive Terminal',
        type: 'electrical-positive',
        xOffset: 45,
        yOffset: 120,
        direction: 'south',
        color: '#ef4444',
      },
      {
        id: 'neg',
        name: '- Negative Terminal',
        type: 'electrical-negative',
        xOffset: 125,
        yOffset: 120,
        direction: 'south',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'voltage',
        label: 'Output Voltage',
        type: 'number',
        defaultValue: 6.0,
        min: 0,
        max: 24,
        step: 0.5,
        unit: 'V',
        editable: true,
      },
      {
        id: 'powerSwitch',
        label: 'Main Switch',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'power-supply',
    colorTheme: '#2563eb',
  },
  {
    id: 'standard-resistor',
    name: 'Precision Resistor',
    subjectId: 'physics',
    category: 'component',
    description: 'Wire-wound standard resistor coil with dual screw terminals.',
    iconName: 'Activity',
    defaultWidth: 130,
    defaultHeight: 80,
    rotatable: true,
    ports: [
      {
        id: 'p1',
        name: 'Terminal 1',
        type: 'electrical-positive',
        xOffset: 0,
        yOffset: 40,
        direction: 'west',
        color: '#64748b',
      },
      {
        id: 'p2',
        name: 'Terminal 2',
        type: 'electrical-negative',
        xOffset: 130,
        yOffset: 40,
        direction: 'east',
        color: '#64748b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'resistance',
        label: 'Resistance (R)',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 1000,
        step: 1,
        unit: 'Ω',
        editable: true,
      },
    ],
    renderType: 'resistor',
    colorTheme: '#0284c7',
  },
  {
    id: 'dc-voltmeter',
    name: 'DC Voltmeter',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Analog needle meter calibrated to measure electrical potential difference across circuit nodes in parallel.',
    iconName: 'Activity',
    defaultWidth: 140,
    defaultHeight: 110,
    rotatable: true,
    ports: [
      {
        id: 'pos',
        name: '+ Terminal',
        type: 'electrical-positive',
        xOffset: 35,
        yOffset: 110,
        direction: 'south',
        color: '#ef4444',
      },
      {
        id: 'neg',
        name: '- Terminal',
        type: 'electrical-negative',
        xOffset: 105,
        yOffset: 110,
        direction: 'south',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'maxScale',
        label: 'Full Scale Range',
        type: 'number',
        defaultValue: 15,
        min: 3,
        max: 30,
        step: 1,
        unit: 'V',
        editable: false,
      },
    ],
    renderType: 'meter',
    colorTheme: '#2563eb',
  },
  {
    id: 'dc-ammeter',
    name: 'DC Ammeter',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Low internal resistance meter configured in series to monitor electric current.',
    iconName: 'Activity',
    defaultWidth: 140,
    defaultHeight: 110,
    rotatable: true,
    ports: [
      {
        id: 'pos',
        name: '+ Terminal',
        type: 'electrical-positive',
        xOffset: 35,
        yOffset: 110,
        direction: 'south',
        color: '#ef4444',
      },
      {
        id: 'neg',
        name: '- Terminal',
        type: 'electrical-negative',
        xOffset: 105,
        yOffset: 110,
        direction: 'south',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'maxScale',
        label: 'Full Scale Range',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 0.5,
        unit: 'A',
        editable: false,
      },
    ],
    renderType: 'meter',
    colorTheme: '#1d4ed8',
  },
  {
    id: 'knife-switch',
    name: 'Single Pole Plug Key',
    subjectId: 'physics',
    category: 'component',
    description: 'Plug key to establish or break electrical circuit continuity.',
    iconName: 'ToggleLeft',
    defaultWidth: 120,
    defaultHeight: 70,
    rotatable: true,
    ports: [
      {
        id: 'p1',
        name: 'Contact A',
        type: 'electrical-positive',
        xOffset: 0,
        yOffset: 35,
        direction: 'west',
        color: '#64748b',
      },
      {
        id: 'p2',
        name: 'Contact B',
        type: 'electrical-negative',
        xOffset: 120,
        yOffset: 35,
        direction: 'east',
        color: '#64748b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'isClosed',
        label: 'Key Inserted (Closed)',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'switch',
    colorTheme: '#475569',
  },
  {
    id: 'indicator-lamp',
    name: 'Miniature Lamp (6V)',
    subjectId: 'physics',
    category: 'component',
    description: 'Incandescent indicator lamp that glows when adequate current passes through its filament.',
    iconName: 'SunMedium',
    defaultWidth: 110,
    defaultHeight: 90,
    rotatable: true,
    ports: [
      {
        id: 'p1',
        name: 'Lead 1',
        type: 'electrical-positive',
        xOffset: 0,
        yOffset: 45,
        direction: 'west',
        color: '#eab308',
      },
      {
        id: 'p2',
        name: 'Lead 2',
        type: 'electrical-negative',
        xOffset: 110,
        yOffset: 45,
        direction: 'east',
        color: '#eab308',
      },
    ],
    propertyDefinitions: [
      {
        id: 'ratedVoltage',
        label: 'Rated Voltage',
        type: 'number',
        defaultValue: 6.0,
        unit: 'V',
        editable: false,
      },
    ],
    renderType: 'lamp',
    colorTheme: '#eab308',
  },
  {
    id: 'convex-lens-bench',
    name: 'Optical Convex Lens',
    subjectId: 'physics',
    category: 'optics',
    description: 'Double-convex spherical glass lens mounted on an adjustable optical bench carrier.',
    iconName: 'SunMedium',
    defaultWidth: 100,
    defaultHeight: 140,
    rotatable: false,
    ports: [
      {
        id: 'opt-in',
        name: 'Front Optical Face',
        type: 'optical-axis',
        xOffset: 0,
        yOffset: 70,
        direction: 'west',
        color: '#38bdf8',
      },
      {
        id: 'opt-out',
        name: 'Rear Optical Face',
        type: 'optical-axis',
        xOffset: 100,
        yOffset: 70,
        direction: 'east',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'focalLength',
        label: 'Focal Length (f)',
        type: 'number',
        defaultValue: 15,
        min: 5,
        max: 50,
        step: 1,
        unit: 'cm',
        editable: true,
      },
      {
        id: 'benchPosition',
        label: 'Rail Position',
        type: 'number',
        defaultValue: 50,
        min: 0,
        max: 150,
        step: 1,
        unit: 'cm',
        editable: true,
      },
    ],
    renderType: 'lens',
    colorTheme: '#0284c7',
  },
  {
    id: 'optical-target-light',
    name: 'Illuminated Object Source',
    subjectId: 'physics',
    category: 'optics',
    description: 'Illuminated wire mesh target arrow producing collimated light rays along the optical axis.',
    iconName: 'SunMedium',
    defaultWidth: 110,
    defaultHeight: 120,
    rotatable: false,
    ports: [
      {
        id: 'beam-out',
        name: 'Light Beam Outlet',
        type: 'optical-axis',
        xOffset: 110,
        yOffset: 60,
        direction: 'east',
        color: '#facc15',
      },
    ],
    propertyDefinitions: [
      {
        id: 'objectDistance',
        label: 'Object Distance (u)',
        type: 'number',
        defaultValue: 30,
        min: 5,
        max: 100,
        step: 1,
        unit: 'cm',
        editable: true,
      },
      {
        id: 'lampIntensity',
        label: 'Lamp Brightness',
        type: 'number',
        defaultValue: 100,
        min: 0,
        max: 100,
        step: 5,
        unit: '%',
        editable: true,
      },
    ],
    renderType: 'optical-source',
    colorTheme: '#ca8a04',
  },
  {
    id: 'simple-pendulum-assembly',
    name: 'Simple Pendulum Rig',
    subjectId: 'physics',
    category: 'mechanics',
    description: 'Spherical metal bob suspended from a split-cork stand clamp for period measurement.',
    iconName: 'Clock',
    defaultWidth: 120,
    defaultHeight: 180,
    rotatable: false,
    ports: [
      {
        id: 'anchor',
        name: 'Stand Clamp Point',
        type: 'mechanical-pin',
        xOffset: 60,
        yOffset: 10,
        direction: 'north',
        color: '#64748b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'stringLength',
        label: 'Suspension Length (L)',
        type: 'number',
        defaultValue: 0.8,
        min: 0.2,
        max: 2.0,
        step: 0.05,
        unit: 'm',
        editable: true,
      },
      {
        id: 'bobMass',
        label: 'Bob Mass (m)',
        type: 'number',
        defaultValue: 100,
        min: 20,
        max: 500,
        step: 10,
        unit: 'g',
        editable: true,
      },
      {
        id: 'amplitudeAngle',
        label: 'Initial Deflection (θ)',
        type: 'number',
        defaultValue: 6,
        min: 1,
        max: 15,
        step: 1,
        unit: '°',
        editable: true,
      },
    ],
    renderType: 'pendulum',
    colorTheme: '#475569',
  },
  {
    id: 'alnico-bar-magnet',
    name: 'Alnico Bar Magnet',
    subjectId: 'physics',
    category: 'component',
    description: 'Permanent magnetic dipole with marked North and South poles.',
    iconName: 'Compass',
    defaultWidth: 150,
    defaultHeight: 60,
    rotatable: true,
    ports: [
      {
        id: 'north',
        name: 'North Pole [N]',
        type: 'generic',
        xOffset: 0,
        yOffset: 30,
        direction: 'west',
        color: '#ef4444',
      },
      {
        id: 'south',
        name: 'South Pole [S]',
        type: 'generic',
        xOffset: 150,
        yOffset: 30,
        direction: 'east',
        color: '#3b82f6',
      },
    ],
    propertyDefinitions: [
      {
        id: 'poleStrength',
        label: 'Dipole Strength',
        type: 'number',
        defaultValue: 0.5,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        unit: 'Tesla',
        editable: true,
      },
    ],
    renderType: 'magnet',
    colorTheme: '#ef4444',
  },
];

export const PHYSICS_LAB_DEFINITIONS: LabDefinition[] = [
  {
    experimentId: 'ohms-law',
    title: "Ohm's Law Verification",
    subjectId: 'physics',
    allowedEquipmentIds: [
      'dc-power-supply',
      'standard-resistor',
      'dc-voltmeter',
      'dc-ammeter',
      'knife-switch',
    ],
    initialObjects: [
      {
        id: 'ps-1',
        equipmentId: 'dc-power-supply',
        title: 'DC Power Source',
        x: 100,
        y: 120,
        rotation: 0,
        width: 170,
        height: 120,
        properties: { voltage: 5.0, powerSwitch: true },
        state: { outputVoltage: 5.0, status: 'Active' },
      },
      {
        id: 'res-1',
        equipmentId: 'standard-resistor',
        title: 'Unknown Resistor',
        x: 420,
        y: 120,
        rotation: 0,
        width: 130,
        height: 80,
        properties: { resistance: 10 },
        state: { currentAmps: 0.5, voltageDrop: 5.0 },
      },
      {
        id: 'vm-1',
        equipmentId: 'dc-voltmeter',
        title: 'Parallel Voltmeter',
        x: 420,
        y: 280,
        rotation: 0,
        width: 140,
        height: 110,
        properties: { maxScale: 15 },
        state: { measuredVoltage: 5.0 },
      },
      {
        id: 'am-1',
        equipmentId: 'dc-ammeter',
        title: 'Series Ammeter',
        x: 100,
        y: 280,
        rotation: 0,
        width: 140,
        height: 110,
        properties: { maxScale: 3 },
        state: { measuredCurrent: 0.5 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Inspect DC Source and Resistor',
        instruction: 'Examine the DC Power Supply and the Resistor. Ensure resistance is set to a standard value (e.g. 10Ω).',
        targetGoalId: 'goal-wire',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Form Series Circuit Loop',
        instruction: 'Wire the Power Supply (+) to the Ammeter (+), Ammeter (-) to the Resistor, and Resistor return back to Power Supply (-).',
        targetGoalId: 'goal-loop',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Connect Voltmeter in Parallel',
        instruction: 'Wire the Voltmeter terminals directly across the resistor to measure voltage difference.',
        targetGoalId: 'goal-volt',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Vary Voltage and Record Observations',
        instruction: 'Increase power supply voltage from 2V to 10V in 2V increments. Observe how current (I = V/R) increases proportionally.',
        targetGoalId: 'goal-readings',
      },
    ],
    goals: [
      {
        id: 'goal-wire',
        description: 'Place electrical components onto working bench.',
        isCompleted: false,
        validatorType: 'equipment-placed',
      },
      {
        id: 'goal-loop',
        description: 'Complete closed circuit between battery, ammeter, and resistor.',
        isCompleted: false,
        validatorType: 'components-connected',
      },
      {
        id: 'goal-volt',
        description: 'Connect voltmeter in parallel across resistor.',
        isCompleted: false,
        validatorType: 'components-connected',
      },
      {
        id: 'goal-readings',
        description: 'Record 3 distinct voltage & current data points in the notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Ohm's Law Verification:\n- Formula: V = I × R\n- Observation: As voltage (V) was increased, the current (I) scaled linearly, confirming constant resistance slope R = ΔV / ΔI.",
  },
  {
    experimentId: 'convex-lens',
    title: 'Convex Lens Image Formation',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'convex-lens-bench',
      'optical-target-light',
    ],
    initialObjects: [
      {
        id: 'target-1',
        equipmentId: 'optical-target-light',
        title: 'Illuminated Arrow Target',
        x: 100,
        y: 160,
        rotation: 0,
        width: 110,
        height: 120,
        properties: { objectDistance: 30, lampIntensity: 100 },
        state: { uCm: 30 },
      },
      {
        id: 'lens-1',
        equipmentId: 'convex-lens-bench',
        title: 'Biconvex Lens (f=15cm)',
        x: 380,
        y: 150,
        rotation: 0,
        width: 100,
        height: 140,
        properties: { focalLength: 15, benchPosition: 50 },
        state: { computedImageDistance: 30, magnification: -1.0 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'lens-step-1',
        stepNumber: 1,
        title: 'Position Object Target at 2F',
        instruction: 'For a lens with focal length f = 15cm, set object distance u = 30cm (2f).',
      },
      {
        id: 'lens-step-2',
        stepNumber: 2,
        title: 'Observe Conjugate Real Image',
        instruction: 'Notice that image forms at v = 30cm with identical size (magnification m = -1.0, real and inverted).',
      },
    ],
    goals: [
      {
        id: 'goal-focal',
        description: 'Verify 1/f = 1/v - 1/u lens formula for real image formation.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
  },
];

export const physicsExtension: SubjectLabExtension = {
  subjectId: 'physics',
  name: 'Physics Laboratory Workbench',
  getEquipmentCatalogue: () => PHYSICS_EQUIPMENT,
  getLabDefinitions: () => PHYSICS_LAB_DEFINITIONS,
  validateConnection: (
    fromObj: WorkspaceObject,
    fromPort: PortDefinition,
    toObj: WorkspaceObject,
    toPort: PortDefinition,
    existingConnections: WorkspaceConnection[]
  ): ConnectionValidationResult => {
    if (fromObj.id === toObj.id) {
      return { allowed: false, reason: 'Cannot connect an instrument to its own terminal.' };
    }

    // Check optical vs electrical mismatches
    const isFromElectrical =
      fromPort.type === 'electrical-positive' || fromPort.type === 'electrical-negative';
    const isToElectrical =
      toPort.type === 'electrical-positive' || toPort.type === 'electrical-negative';

    const isFromOptical = fromPort.type === 'optical-axis';
    const isToOptical = toPort.type === 'optical-axis';

    if (isFromElectrical && isToOptical) {
      return {
        allowed: false,
        reason: 'Cannot connect an electrical wire to an optical lens rail.',
      };
    }
    if (isFromOptical && isToElectrical) {
      return {
        allowed: false,
        reason: 'Cannot connect an optical beam to an electrical binding post.',
      };
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
      return { allowed: false, reason: 'These terminals are already connected.' };
    }

    const wireColor =
      fromPort.type === 'electrical-positive' || toPort.type === 'electrical-positive'
        ? '#ef4444'
        : '#1e293b';

    return { allowed: true, suggestedColor: wireColor };
  },
  evaluateSimulation: (
    objects: WorkspaceObject[],
    connections: WorkspaceConnection[]
  ): SimulationResult => {
    const updates: Record<string, Record<string, string | number | boolean>> = {};
    const messages: string[] = [];

    // Find Power Supply
    const ps = objects.find((o) => o.equipmentId === 'dc-power-supply');
    const isPowerOn = ps ? ps.properties.powerSwitch !== false : false;
    const voltage = ps && isPowerOn ? Number(ps.properties.voltage ?? 0) : 0;

    if (ps) {
      updates[ps.id] = {
        outputVoltage: voltage,
        status: isPowerOn ? (voltage > 0 ? 'Active (Supplying DC)' : 'Standby (0V)') : 'Power Off',
      };
    }

    // Evaluate connected resistors
    const resistors = objects.filter((o) => o.equipmentId === 'standard-resistor');
    for (const res of resistors) {
      const resistance = Number(res.properties.resistance ?? 10);

      // Check if resistor is connected to power supply
      const isConnected = connections.some(
        (c) =>
          (c.fromObjectId === res.id || c.toObjectId === res.id) &&
          (c.fromObjectId === ps?.id || c.toObjectId === ps?.id)
      );

      const effectiveVoltage = isConnected && isPowerOn ? voltage : 0;
      const current = resistance > 0 ? Number((effectiveVoltage / resistance).toFixed(3)) : 0;

      updates[res.id] = {
        voltageDrop: effectiveVoltage,
        currentAmps: current,
        powerWatts: Number((effectiveVoltage * current).toFixed(3)),
      };
    }

    // Evaluate voltmeters
    const voltmeters = objects.filter((o) => o.equipmentId === 'dc-voltmeter');
    for (const vm of voltmeters) {
      const isWired = connections.some((c) => c.fromObjectId === vm.id || c.toObjectId === vm.id);
      const measured = isWired && isPowerOn ? voltage : 0;
      updates[vm.id] = {
        measuredVoltage: Number(measured.toFixed(2)),
      };
    }

    // Evaluate ammeters
    const ammeters = objects.filter((o) => o.equipmentId === 'dc-ammeter');
    for (const am of ammeters) {
      const firstRes = resistors[0];
      const rVal = firstRes ? Number(firstRes.properties.resistance ?? 10) : 10;
      const isWired = connections.some((c) => c.fromObjectId === am.id || c.toObjectId === am.id);
      const measured = isWired && isPowerOn && rVal > 0 ? Number((voltage / rVal).toFixed(3)) : 0;
      updates[am.id] = {
        measuredCurrent: measured,
      };
    }

    // Evaluate convex lens optical formula: 1/f = 1/v - 1/u => 1/v = 1/f + 1/u
    // In optical sign convention, u is negative (-u) => 1/v = 1/f - 1/u
    const lenses = objects.filter((o) => o.equipmentId === 'convex-lens-bench');
    const targetSource = objects.find((o) => o.equipmentId === 'optical-target-light');

    for (const lens of lenses) {
      const f = Number(lens.properties.focalLength ?? 15);
      const u = targetSource ? Number(targetSource.properties.objectDistance ?? 30) : 30;

      // 1/v = 1/f - 1/u
      if (u > f) {
        const v = Number(((f * u) / (u - f)).toFixed(1));
        const magnification = Number((-v / u).toFixed(2));
        updates[lens.id] = {
          computedImageDistance: v,
          magnification,
          imageNature: 'Real, Inverted',
        };
      } else if (u === f) {
        updates[lens.id] = {
          computedImageDistance: 999,
          magnification: -999,
          imageNature: 'At Infinity (Parallel Rays)',
        };
      } else {
        const v = Number(((f * u) / (u - f)).toFixed(1));
        const magnification = Number((-v / u).toFixed(2));
        updates[lens.id] = {
          computedImageDistance: Math.abs(v),
          magnification: Math.abs(magnification),
          imageNature: 'Virtual, Erect & Magnified',
        };
      }
    }

    // Evaluate simple pendulum period: T = 2 * pi * sqrt(L / g)
    const pendulums = objects.filter((o) => o.equipmentId === 'simple-pendulum-assembly');
    for (const pend of pendulums) {
      const L = Number(pend.properties.stringLength ?? 0.8);
      const g = 9.80665;
      const period = Number((2 * Math.PI * Math.sqrt(L / g)).toFixed(3));
      const freq = Number((1 / period).toFixed(3));
      updates[pend.id] = {
        periodSeconds: period,
        frequencyHz: freq,
      };
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
