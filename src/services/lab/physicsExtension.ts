import { SubjectLabExtension, ConnectionValidationResult } from './types';
import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';
import { solveDCCircuit } from '../circuit/circuitSolver';

export const PHYSICS_EQUIPMENT: EquipmentDefinition[] = [
  {
    id: 'dc-battery',
    name: 'DC Chemical Battery',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Electrochemical DC cell with positive (+) anode and negative (-) cathode terminals.',
    iconName: 'BatteryCharging',
    defaultWidth: 140,
    defaultHeight: 90,
    rotatable: true,
    allowedRotations: [0, 90, 180, 270],
    ports: [
      {
        id: 'pos',
        name: '+ Positive Terminal',
        type: 'electrical-positive',
        xOffset: 35,
        yOffset: 90,
        direction: 'south',
        color: '#ef4444',
      },
      {
        id: 'neg',
        name: '- Negative Terminal',
        type: 'electrical-negative',
        xOffset: 105,
        yOffset: 90,
        direction: 'south',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'voltage',
        label: 'Cell Potential',
        type: 'number',
        defaultValue: 9.0,
        min: 1.5,
        max: 24,
        step: 0.5,
        unit: 'V',
        editable: true,
      },
      {
        id: 'powerSwitch',
        label: 'Circuit Active',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'battery',
    colorTheme: '#ea580c',
  },
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
    id: 'circuit-ground',
    name: 'Circuit Ground (0V)',
    subjectId: 'physics',
    category: 'component',
    description: 'Earth reference point providing a defined 0.0V potential baseline for electrical network calculations.',
    iconName: 'ArrowDown',
    defaultWidth: 90,
    defaultHeight: 80,
    rotatable: false,
    ports: [
      {
        id: 'gnd',
        name: 'Ground Node',
        type: 'electrical-negative',
        xOffset: 45,
        yOffset: 20,
        direction: 'north',
        color: '#10b981',
      },
    ],
    propertyDefinitions: [],
    renderType: 'ground',
    colorTheme: '#10b981',
  },
  {
    id: 'wire-junction',
    name: 'Wire Junction Node',
    subjectId: 'physics',
    category: 'component',
    description: 'Low-impedance 4-way electrical junction node to interconnect multiple parallel branches.',
    iconName: 'GitCommit',
    defaultWidth: 80,
    defaultHeight: 80,
    rotatable: false,
    ports: [
      {
        id: 'p1',
        name: 'Port North',
        type: 'electrical-positive',
        xOffset: 40,
        yOffset: 0,
        direction: 'north',
        color: '#64748b',
      },
      {
        id: 'p2',
        name: 'Port South',
        type: 'electrical-negative',
        xOffset: 40,
        yOffset: 80,
        direction: 'south',
        color: '#64748b',
      },
      {
        id: 'p3',
        name: 'Port West',
        type: 'electrical-positive',
        xOffset: 0,
        yOffset: 40,
        direction: 'west',
        color: '#64748b',
      },
      {
        id: 'p4',
        name: 'Port East',
        type: 'electrical-negative',
        xOffset: 80,
        yOffset: 40,
        direction: 'east',
        color: '#64748b',
      },
    ],
    propertyDefinitions: [],
    renderType: 'junction',
    colorTheme: '#64748b',
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
      'dc-battery',
      'standard-resistor',
      'dc-voltmeter',
      'dc-ammeter',
      'knife-switch',
      'wire-junction',
      'circuit-ground',
      'indicator-lamp',
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
        title: 'Precision Resistor',
        x: 420,
        y: 120,
        rotation: 0,
        width: 130,
        height: 80,
        properties: { resistance: 10 },
        state: { currentAmps: 0, voltageDrop: 0 },
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
        state: { measuredVoltage: 0 },
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
        state: { measuredCurrent: 0 },
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
        instruction: 'Wire the Power Supply (+) to the Ammeter (+), Ammeter (-) to the Resistor (p1), and Resistor (p2) return back to Power Supply (-).',
        targetGoalId: 'goal-loop',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Connect Voltmeter in Parallel',
        instruction: 'Wire the Voltmeter terminals directly across the resistor (pos to p1, neg to p2) to measure potential difference.',
        targetGoalId: 'goal-volt',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Vary Voltage and Record Observations',
        instruction: 'Increase power supply voltage from 2V to 10V in 2V increments. Observe how current (I = V/R) increases proportionally, validating V = IR.',
        targetGoalId: 'goal-readings',
      },
    ],
    goals: [
      {
        id: 'goal-wire',
        description: 'Place DC power source, resistor, and meters onto working bench.',
        isCompleted: false,
        validatorType: 'equipment-placed',
      },
      {
        id: 'goal-loop',
        description: 'Complete closed series circuit between battery, ammeter, and resistor.',
        isCompleted: false,
        validatorType: 'components-connected',
      },
      {
        id: 'goal-volt',
        description: 'Connect voltmeter in parallel across the resistor.',
        isCompleted: false,
        validatorType: 'components-connected',
      },
      {
        id: 'goal-readings',
        description: 'Record voltage & current data points in the notebook table and compare with V = IR.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Ohm's Law Verification:\n- Formula: V = I × R\n- Observation: As voltage (V) was increased, the current (I) scaled linearly, confirming constant resistance slope R = ΔV / ΔI.",
  },
  {
    experimentId: 'series-parallel-circuits',
    title: 'Series and Parallel Circuits Analysis',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'dc-power-supply',
      'dc-battery',
      'standard-resistor',
      'dc-voltmeter',
      'dc-ammeter',
      'knife-switch',
      'wire-junction',
      'circuit-ground',
      'indicator-lamp',
    ],
    initialObjects: [
      {
        id: 'ps-1',
        equipmentId: 'dc-power-supply',
        title: '12V DC Voltage Source',
        x: 80,
        y: 100,
        rotation: 0,
        width: 170,
        height: 120,
        properties: { voltage: 12.0, powerSwitch: true },
        state: { outputVoltage: 12.0, status: 'Active' },
      },
      {
        id: 'res-1',
        equipmentId: 'standard-resistor',
        title: 'Resistor R1 (6Ω)',
        x: 360,
        y: 80,
        rotation: 0,
        width: 130,
        height: 80,
        properties: { resistance: 6 },
        state: { currentAmps: 0, voltageDrop: 0 },
      },
      {
        id: 'res-2',
        equipmentId: 'standard-resistor',
        title: 'Resistor R2 (6Ω)',
        x: 360,
        y: 200,
        rotation: 0,
        width: 130,
        height: 80,
        properties: { resistance: 6 },
        state: { currentAmps: 0, voltageDrop: 0 },
      },
      {
        id: 'am-1',
        equipmentId: 'dc-ammeter',
        title: 'Main Circuit Ammeter',
        x: 80,
        y: 260,
        rotation: 0,
        width: 140,
        height: 110,
        properties: { maxScale: 5 },
        state: { measuredCurrent: 0 },
      },
      {
        id: 'vm-1',
        equipmentId: 'dc-voltmeter',
        title: 'Branch Voltmeter',
        x: 560,
        y: 140,
        rotation: 0,
        width: 140,
        height: 110,
        properties: { maxScale: 15 },
        state: { measuredVoltage: 0 },
      },
      {
        id: 'sw-1',
        equipmentId: 'knife-switch',
        title: 'Master Switch',
        x: 240,
        y: 340,
        rotation: 0,
        width: 120,
        height: 70,
        properties: { isClosed: true },
        state: { status: 'Closed' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'sp-step-1',
        stepNumber: 1,
        title: 'Examine DC Source and Resistors',
        instruction:
          'Observe the 12V DC power supply and two 6 Ω resistors (R1 and R2). Notice the master switch and measurement meters on the bench.',
      },
      {
        id: 'sp-step-2',
        stepNumber: 2,
        title: 'Construct Series Circuit (Req = R1 + R2 = 12 Ω)',
        instruction:
          'Connect the components sequentially: Power (+) to Ammeter (+), Ammeter (-) to R1 (p1), R1 (p2) to R2 (p1), R2 (p2) to Switch, and Switch back to Power (-). Observe total current drops to 1 A (12V / 12Ω).',
      },
      {
        id: 'sp-step-3',
        stepNumber: 3,
        title: 'Measure Series Voltage Drops (V1 + V2 = Vtotal)',
        instruction:
          'Connect the Voltmeter across R1 to observe 6V drop, then across R2 to observe 6V. Kirchhoff’s Voltage Law confirms: 6V + 6V = 12V.',
      },
      {
        id: 'sp-step-4',
        stepNumber: 4,
        title: 'Construct Parallel Network (1/Req = 1/R1 + 1/R2 -> Req = 3 Ω)',
        instruction:
          'Rewire R1 and R2 in parallel across the 12V supply using wire junctions. Observe total circuit current surges to 4 A (12V / 3Ω), with each branch carrying 2 A.',
      },
      {
        id: 'sp-step-5',
        stepNumber: 5,
        title: 'Log Comparison in Experiment Notebook',
        instruction:
          'Record equivalent resistance, total current, and branch behavior in your notebook. Notice parallel connection lowers overall circuit impedance while series increases it.',
      },
    ],
    goals: [
      {
        id: 'goal-series',
        description: 'Construct series circuit with two 6Ω resistors across 12V (verify 1A current, 6V drops, 12Ω Req).',
        isCompleted: false,
        validatorType: 'components-connected',
      },
      {
        id: 'goal-parallel',
        description: 'Construct parallel circuit with two 6Ω resistors across 12V (verify 4A current, 2A branch currents, 3Ω Req).',
        isCompleted: false,
        validatorType: 'components-connected',
      },
      {
        id: 'goal-compare',
        description: 'Log and compare series vs parallel equivalent resistances in the notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Series and Parallel Resistor Networks:\n- Series Formula: Req = R1 + R2 = 6Ω + 6Ω = 12Ω\n  Series Current at 12V: I = 12V / 12Ω = 1.0 A\n  Voltage drops: V1 = 6V, V2 = 6V (V_total = 12V)\n\n- Parallel Formula: 1/Req = 1/R1 + 1/R2 = 1/6 + 1/6 = 2/6 = 1/3 => Req = 3.0Ω\n  Parallel Current at 12V: I_total = 12V / 3Ω = 4.0 A\n  Branch currents: I1 = 12V / 6Ω = 2.0 A, I2 = 12V / 6Ω = 2.0 A",
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
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Electrical Circuit Simulation via Modified Nodal Analysis (MNA)
    const hasElectrical = objects.some((o) =>
      [
        'dc-power-supply',
        'dc-battery',
        'standard-resistor',
        'dc-voltmeter',
        'dc-ammeter',
        'knife-switch',
        'wire-junction',
        'circuit-ground',
        'indicator-lamp',
      ].includes(o.equipmentId)
    );

    if (hasElectrical) {
      const solverResult = solveDCCircuit(objects, connections);

      errors.push(...solverResult.errors);
      warnings.push(...solverResult.warnings);
      if (solverResult.topologySummary) {
        messages.push(solverResult.topologySummary);
      }
      messages.push(...solverResult.messages);

      // Map solved states onto objectStateUpdates
      for (const [objId, cState] of Object.entries(solverResult.componentStates)) {
        updates[objId] = {
          voltageDrop: cState.voltageDrop,
          currentAmps: cState.current,
          powerWatts: cState.power,
          isEnergized: cState.isEnergized,
          displayedReading:
            cState.displayReading !== undefined
              ? cState.displayReading
              : cState.voltageDrop || cState.current,
          measuredVoltage: cState.voltageDrop,
          measuredCurrent: cState.current,
          status: cState.statusText || (cState.isEnergized ? 'Energized' : 'Inactive'),
          connectionStatus: cState.statusText || 'Connected',
          ...(cState.extraProps || {}),
        };
      }
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
      valid: errors.length === 0,
      errors,
      warnings,
      messages: Array.from(new Set(messages)),
      objectStateUpdates: updates,
    };
  },
};
