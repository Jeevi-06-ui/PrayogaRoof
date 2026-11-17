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
import { calculateThinLens } from '../physics/opticsModel';
import { calculateMagneticField, simulateMagneticField } from '../physics/magnetismModel';
import { calculatePendulumState } from '../physics/mechanicsModel';

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
  {
    id: 'plotting-compass',
    name: 'Magnetic Plotting Compass',
    subjectId: 'physics',
    category: 'instrument',
    description:
      'Compact circular housing with a jeweled pivot supporting a lightweight magnetized steel needle that points along the net magnetic field vector B.',
    iconName: 'Compass',
    defaultWidth: 90,
    defaultHeight: 90,
    rotatable: false,
    ports: [
      {
        id: 'pivot',
        name: 'Needle Pivot Point',
        type: 'generic',
        xOffset: 45,
        yOffset: 45,
        direction: 'north',
        color: '#ef4444',
      },
    ],
    propertyDefinitions: [
      {
        id: 'frictionless',
        label: 'Frictionless Pivot',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'dampingFactor',
        label: 'Needle Damping',
        type: 'number',
        defaultValue: 1.0,
        min: 0.1,
        max: 5.0,
        step: 0.5,
        unit: 'x',
        editable: true,
      },
    ],
    renderType: 'compass',
    colorTheme: '#0d9488',
  },
  {
    id: 'digital-stopwatch',
    name: 'Digital Lab Precision Timer',
    subjectId: 'physics',
    category: 'instrument',
    description:
      'High-precision digital quartz laboratory stopwatch with millisecond precision and lap counter for oscillation timing.',
    iconName: 'Timer',
    defaultWidth: 130,
    defaultHeight: 90,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'isRunning',
        label: 'Timer Active',
        type: 'boolean',
        defaultValue: false,
        editable: true,
      },
      {
        id: 'elapsedTime',
        label: 'Elapsed Time',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 3600,
        step: 0.05,
        unit: 's',
        editable: true,
      },
    ],
    renderType: 'stopwatch',
    colorTheme: '#6366f1',
  },
  {
    id: 'optical-screen',
    name: 'Ground Glass Image Screen',
    subjectId: 'physics',
    category: 'optics',
    description:
      'Adjustable frosted glass screen mounted on optical bench upright to catch real inverted images formed by the convex lens.',
    iconName: 'Square',
    defaultWidth: 90,
    defaultHeight: 140,
    rotatable: false,
    ports: [
      {
        id: 'screen-center',
        name: 'Image Plane Center',
        type: 'optical-axis',
        xOffset: 45,
        yOffset: 70,
        direction: 'west',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'screenPosition',
        label: 'Bench Position',
        type: 'number',
        defaultValue: 80,
        min: 10,
        max: 150,
        step: 1,
        unit: 'cm',
        editable: true,
      },
    ],
    renderType: 'screen',
    colorTheme: '#0284c7',
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
    title: 'Convex Lens Image Formation & Ray Tracing',
    subjectId: 'physics',
    allowedEquipmentIds: ['convex-lens-bench', 'optical-target-light', 'optical-screen'],
    initialObjects: [
      {
        id: 'target-1',
        equipmentId: 'optical-target-light',
        title: 'Illuminated Arrow Target',
        x: 80,
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
        x: 340,
        y: 140,
        rotation: 0,
        width: 100,
        height: 140,
        properties: { focalLength: 15, benchPosition: 50 },
        state: { computedImageDistance: 30, magnification: -1.0 },
      },
      {
        id: 'screen-1',
        equipmentId: 'optical-screen',
        title: 'Ground Glass Observation Screen',
        x: 600,
        y: 135,
        rotation: 0,
        width: 90,
        height: 140,
        properties: { screenPosition: 80 },
        state: { isFocused: true, displayStatus: 'Sharp Inverted Image Focused' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'lens-step-1',
        stepNumber: 1,
        title: 'Position Object Target at 2F₁ (u = -30 cm)',
        instruction:
          'Set object distance u = 30 cm for the biconvex lens with focal length f = 15 cm. Notice that 2f = 30 cm.',
      },
      {
        id: 'lens-step-2',
        stepNumber: 2,
        title: 'Observe Conjugate Real Image at 2F₂ (v = +30 cm, m = -1.0)',
        instruction:
          'Observe the real inverted image formed at distance v = +30 cm on the transmission side. Magnification is exactly m = -1.0 (equal size, inverted).',
      },
      {
        id: 'lens-step-3',
        stepNumber: 3,
        title: 'Move Object Beyond 2F₁ (u = 45 cm)',
        instruction:
          'Adjust object distance to 45 cm (> 2f). Notice that the image shifts between F₂ and 2F₂ (v = +22.5 cm) and is real, inverted, and diminished (m = -0.5).',
      },
      {
        id: 'lens-step-4',
        stepNumber: 4,
        title: 'Move Object Between F₁ and 2F₁ (u = 20 cm)',
        instruction:
          'Move object to 20 cm (between 15 cm and 30 cm). The image moves beyond 2F₂ to v = +60 cm and becomes real, inverted, and magnified (m = -3.0).',
      },
      {
        id: 'lens-step-5',
        stepNumber: 5,
        title: 'Move Object Inside Focal Length (u = 10 cm < f)',
        instruction:
          'Move object inside the focal distance (u = 10 cm). The refracted rays diverge; their backward extensions form a virtual, erect, and magnified image (v = -30 cm, m = +3.0) acting as a magnifying glass.',
      },
      {
        id: 'lens-step-6',
        stepNumber: 6,
        title: 'Log Thin-Lens Observations in Experiment Notebook',
        instruction:
          'Record focal length f, object distance u, calculated image distance v, and magnification m in your notebook. Verify the thin lens equation: 1/f = 1/v - 1/u.',
      },
    ],
    goals: [
      {
        id: 'goal-lens-2f',
        description: 'Verify equal-size real image formation at u = 2f (v = 2f, m = -1.0).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-lens-magnified',
        description: 'Create a magnified real image with object between F and 2F (|m| > 1).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-lens-virtual',
        description: 'Produce a virtual, erect image by placing the object inside focal length (u < f).',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Thin Lens Formula & Sign Convention:\n- Formula: 1/f = 1/v - 1/u  =>  1/v = 1/f + 1/u\n- Magnification: m = v / u = h_image / h_object\n- Standard Cartesian Sign Convention (NCERT/CBSE):\n  * Real object distance: u is negative (u < 0)\n  * Convex lens focal length: f is positive (f > 0)\n  * Real image: v > 0 (right/transmission side, inverted, m < 0)\n  * Virtual image: v < 0 (left/incident side, erect, m > 0)\n\nKey Image Formation Cases:\n1. Object at 2F (u = -30cm, f = 15cm) => v = +30cm, m = -1.0 (Real, inverted, same size)\n2. Object beyond 2F (u = -45cm) => v = +22.5cm, m = -0.5 (Real, inverted, diminished)\n3. Object between F & 2F (u = -20cm) => v = +60cm, m = -3.0 (Real, inverted, magnified)\n4. Object at F (u = -15cm) => v -> infinity (Parallel refracted beam)\n5. Object inside F (u = -10cm) => v = -30cm, m = +3.0 (Virtual, erect, magnified - magnifying glass)",
  },
  {
    experimentId: 'magnetic-field',
    title: 'Magnetic Field Lines & Compass Plotting',
    subjectId: 'physics',
    allowedEquipmentIds: ['alnico-bar-magnet', 'plotting-compass'],
    initialObjects: [
      {
        id: 'mag-1',
        equipmentId: 'alnico-bar-magnet',
        title: 'Alnico Bar Magnet',
        x: 280,
        y: 180,
        rotation: 0,
        width: 150,
        height: 60,
        properties: { poleStrength: 1.0, angle: 0 },
        state: { status: 'Dipole Active (1.0 T, 0°)' },
      },
      {
        id: 'compass-1',
        equipmentId: 'plotting-compass',
        title: 'Plotting Compass (North Probe)',
        x: 120,
        y: 180,
        rotation: 0,
        width: 90,
        height: 90,
        properties: { frictionless: true },
        state: { needleAngleDeg: 180, status: 'Needle: 180°' },
      },
      {
        id: 'compass-2',
        equipmentId: 'plotting-compass',
        title: 'Plotting Compass (South Probe)',
        x: 480,
        y: 180,
        rotation: 0,
        width: 90,
        height: 90,
        properties: { frictionless: true },
        state: { needleAngleDeg: 0, status: 'Needle: 0°' },
      },
      {
        id: 'compass-3',
        equipmentId: 'plotting-compass',
        title: 'Plotting Compass (Equatorial Top)',
        x: 290,
        y: 60,
        rotation: 0,
        width: 90,
        height: 90,
        properties: { frictionless: true },
        state: { needleAngleDeg: 180, status: 'Needle: 180°' },
      },
      {
        id: 'compass-4',
        equipmentId: 'plotting-compass',
        title: 'Plotting Compass (Equatorial Bottom)',
        x: 290,
        y: 300,
        rotation: 0,
        width: 90,
        height: 90,
        properties: { frictionless: true },
        state: { needleAngleDeg: 180, status: 'Needle: 180°' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'mag-step-1',
        stepNumber: 1,
        title: 'Examine Bar Magnet Dipole Poles',
        instruction:
          'Identify the North-seeking pole (Red, +qm) and South-seeking pole (Blue, -qm) on the permanent bar magnet.',
      },
      {
        id: 'mag-step-2',
        stepNumber: 2,
        title: 'Observe Magnetic Compass Needle Alignment',
        instruction:
          'Notice how the four plotting compasses orient their red needles along the local magnetic vector B = B_N + B_S. The needle points away from the North pole and towards the South pole.',
      },
      {
        id: 'mag-step-3',
        stepNumber: 3,
        title: 'Trace External Magnetic Field Lines',
        instruction:
          'Follow the magnetic flux streamlines. Field lines emerge from the North pole, curve smoothly around through space, and enter the South pole, forming continuous closed loops.',
      },
      {
        id: 'mag-step-4',
        stepNumber: 4,
        title: 'Rotate Magnet or Reposition Compasses',
        instruction:
          'Drag the compasses closer to or further from the poles. Notice how field intensity B drops sharply with distance (dipole field B ~ 1/r³ at large distances).',
      },
      {
        id: 'mag-step-5',
        stepNumber: 5,
        title: 'Record Dipole Properties in Experiment Notebook',
        instruction:
          'Log your observations of field line density, direction of travel, and the non-intersecting property of magnetic field lines.',
      },
    ],
    goals: [
      {
        id: 'goal-mag-poles',
        description: 'Observe compass needle repulsion near North pole and attraction near South pole.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-mag-probe',
        description: 'Probe field lines at 4 or more positions around the magnet perimeter.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-mag-log',
        description: 'Record field characteristics and dipole model assumptions in the notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "2D Magnetic Field & Dipole Model:\n- Pole strength: q_m (North = +q_m, South = -q_m)\n- Net Field Vector: B_net(r) = B_N(r) + B_S(r)\n  * B_N = (μ0 / 4π) * q_m * (r - r_N) / |r - r_N|³ (directed away from North pole)\n  * B_S = -(μ0 / 4π) * q_m * (r - r_S) / |r - r_S|³ (directed toward South pole)\n- Compass needle rotates to angle: θ = atan2(B_net,y, B_net,x)\n\nKey Properties of Magnetic Field Lines:\n1. External lines emerge from North pole and enter South pole.\n2. Inside the magnet, lines continue from South to North, forming continuous loops.\n3. Line density represents magnetic flux density (field strength |B|).\n4. Field lines NEVER intersect (tangent indicates unique net field direction).\n5. Far-field magnitude falls off as 1/r³ for a magnetic dipole.",
  },
  {
    experimentId: 'simple-pendulum',
    title: 'Simple Pendulum & Gravitational Acceleration',
    subjectId: 'physics',
    allowedEquipmentIds: ['simple-pendulum-assembly', 'digital-stopwatch'],
    initialObjects: [
      {
        id: 'pend-1',
        equipmentId: 'simple-pendulum-assembly',
        title: 'Simple Pendulum Stand & Bob',
        x: 240,
        y: 70,
        rotation: 0,
        width: 120,
        height: 180,
        properties: { stringLength: 0.8, bobMass: 100, amplitudeAngle: 8 },
        state: { periodSeconds: 1.795, frequencyHz: 0.557, isMassIndependent: true },
      },
      {
        id: 'timer-1',
        equipmentId: 'digital-stopwatch',
        title: 'Digital Lab Precision Timer',
        x: 520,
        y: 90,
        rotation: 0,
        width: 130,
        height: 90,
        properties: { isRunning: false, elapsedTime: 0 },
        state: { measuredPeriod: 1.795 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'pend-step-1',
        stepNumber: 1,
        title: 'Set Suspension Length (L = 0.80 m)',
        instruction:
          'Inspect the clamp stand with suspension thread length L = 0.80 m and bob mass m = 100 g. Release angle is set to θ₀ = 8° (< 15°, within small-angle range).',
      },
      {
        id: 'pend-step-2',
        stepNumber: 2,
        title: 'Measure Oscillation Period (T = 2π√(L/g))',
        instruction:
          'Observe the oscillation period T = 1.80 s and natural frequency f = 0.56 Hz calculated from T = 2π√(L/g) with g = 9.80 m/s².',
      },
      {
        id: 'pend-step-3',
        stepNumber: 3,
        title: 'Verify Mass Independence (Change m to 200 g or 50 g)',
        instruction:
          'Modify the bob mass in the inspector from 100 g to 50 g or 200 g. Notice that the period T remains STRICTLY UNCHANGED! Mass cancels out completely because gravitational mass equals inertial mass.',
      },
      {
        id: 'pend-step-4',
        stepNumber: 4,
        title: 'Vary Length and Verify T ∝ √L',
        instruction:
          'Change suspension length L to 0.20 m (T = 0.90 s), then to 1.00 m (T = 2.01 s). Notice that period is directly proportional to √L.',
      },
      {
        id: 'pend-step-5',
        stepNumber: 5,
        title: 'Calculate Acceleration Due to Gravity (g = 4π²L / T²)',
        instruction:
          'Using the measured values of L and T, calculate g = 4π²L / T². Notice that it reliably yields g ≈ 9.80 m/s².',
      },
      {
        id: 'pend-step-6',
        stepNumber: 6,
        title: 'Record L vs T² Data in Experiment Notebook',
        instruction:
          'Log your measurements of L, T, and T² in the notebook. Plotting L vs T² yields a straight line whose slope is g / (4π²).',
      },
    ],
    goals: [
      {
        id: 'goal-pend-mass',
        description: 'Verify mass independence: period T does not change when bob mass m is altered.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-pend-length',
        description: 'Measure oscillation period for at least two different string lengths.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-pend-gravity',
        description: 'Calculate gravitational acceleration g = 4π²L / T² and record in notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Simple Pendulum Dynamics & Determination of g:\n- Equation of Motion: d²θ/dt² + (g/L)sinθ = 0\n- Small-Angle Approximation: For θ ≤ 15° (~0.26 rad), sinθ ≈ θ.\n  Equation becomes SHM: d²θ/dt² + (g/L)θ = 0\n- Time Period Formula: T = 2π√(L/g)\n- Natural Frequency: f = 1/T = (1/2π)√(g/L)\n- Acceleration due to gravity: g = 4π²L / T²\n\nCRITICAL PHYSICAL PROPERTY - MASS INDEPENDENCE:\nIn the pendulum equation, bob mass (m) cancels out identically because inertial mass equals gravitational mass. Therefore:\n∂T / ∂m = 0 (Period is strictly independent of mass).\n\nTheoretical Values (g = 9.80 m/s²):\n* L = 0.20 m => T = 0.898 s, T² = 0.806 s²\n* L = 0.50 m => T = 1.420 s, T² = 2.016 s²\n* L = 0.80 m => T = 1.795 s, T² = 3.222 s²\n* L = 1.00 m => T = 2.007 s, T² = 4.028 s²\n\nSlope of L vs T² graph = g / 4π² = 9.80 / 39.478 ≈ 0.248 m/s²",
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

    // 2. Optical Thin-Lens Geometrical Simulation
    const lenses = objects.filter((o) => o.equipmentId === 'convex-lens-bench');
    const targetSource = objects.find((o) => o.equipmentId === 'optical-target-light');
    const screen = objects.find((o) => o.equipmentId === 'optical-screen');

    for (const lens of lenses) {
      const f = Number(lens.properties.focalLength ?? 15);
      const u = targetSource ? Number(targetSource.properties.objectDistance ?? 30) : 30;
      const benchPos = Number(lens.properties.benchPosition ?? 50);

      const sim = calculateThinLens(f, u, 4, benchPos);

      updates[lens.id] = {
        computedImageDistance: sim.imageDistance,
        magnification: sim.magnification,
        imageHeight: sim.imageHeight,
        imageNature: sim.imageNature,
        imageCategory: sim.imageCategory,
        isReal: sim.isReal,
        isVirtual: sim.isVirtual,
        isAtInfinity: sim.isAtInfinity,
        f1Pos: sim.focalMarkers.F1,
        twoF1Pos: sim.focalMarkers.twoF1,
        f2Pos: sim.focalMarkers.F2,
        twoF2Pos: sim.focalMarkers.twoF2,
        status: `f = ${f} cm | u = -${u} cm => v = ${sim.imageDistance > 0 ? '+' : ''}${sim.imageDistance} cm`,
      };

      if (screen) {
        const screenPos = Number(screen.properties.screenPosition ?? 80);
        const isFocused = Math.abs(screenPos - (benchPos + sim.imageDistance)) < 2.5;
        updates[screen.id] = {
          isFocused,
          imagePresent: sim.isReal,
          displayStatus: isFocused ? 'Sharp Inverted Image Focused' : 'Blurred / Out of Focus',
        };
      }

      messages.push(
        `Convex Lens: u = -${u} cm, f = +${f} cm => Image v = ${sim.imageDistance > 0 ? '+' : ''}${sim.imageDistance} cm (m = ${sim.magnification}, ${sim.imageNature})`
      );
    }

    // 3. Magnetic Field Dipole & Plotting Compass Simulation
    const magnets = objects.filter((o) => o.equipmentId === 'alnico-bar-magnet');
    const compasses = objects.filter((o) => o.equipmentId === 'plotting-compass');

    if (magnets.length > 0) {
      const magnetConfigs = magnets.map((m) => ({
        id: m.id,
        x: m.x + (m.width || 150) / 2,
        y: m.y + (m.height || 60) / 2,
        length: m.width || 150,
        width: m.height || 60,
        angle: Number(m.rotation || m.properties.angle || 0),
        poleStrength: Number(m.properties.poleStrength || 1.0) * 1000,
      }));

      for (const mag of magnets) {
        const cfg = magnetConfigs.find((c) => c.id === mag.id)!;
        const magSim = simulateMagneticField(cfg);
        updates[mag.id] = {
          northX: magSim.poles.north.x,
          northY: magSim.poles.north.y,
          southX: magSim.poles.south.x,
          southY: magSim.poles.south.y,
          fieldLineCount: magSim.fieldLines.length,
          status: `Dipole Active (${(cfg.poleStrength / 1000).toFixed(1)} T, θ = ${cfg.angle}°)`,
        };
      }

      for (const compass of compasses) {
        const cx = compass.x + (compass.width || 90) / 2;
        const cy = compass.y + (compass.height || 90) / 2;
        const field = calculateMagneticField(cx, cy, magnetConfigs);
        updates[compass.id] = {
          needleAngleDeg: field.angleDeg,
          magneticFieldUT: field.magnitude,
          fieldBx: field.bx,
          fieldBy: field.by,
          status: `Needle: ${field.angleDeg}° | |B| = ${field.magnitude} µT`,
        };
      }

      if (compasses.length > 0) {
        messages.push(
          `Magnetic Field: ${magnets.length} magnet(s) active. ${compasses.length} compass(es) oriented along net magnetic vectors.`
        );
      }
    }

    // 4. Simple Pendulum Mechanics & Stopwatch Simulation
    const pendulums = objects.filter((o) => o.equipmentId === 'simple-pendulum-assembly');
    const stopwatches = objects.filter((o) => o.equipmentId === 'digital-stopwatch');

    for (const pend of pendulums) {
      const L = Number(pend.properties.stringLength ?? 0.8);
      const mGrams = Number(pend.properties.bobMass ?? 100);
      const mKg = mGrams / 1000;
      const theta0Deg = Number(pend.properties.amplitudeAngle ?? 8);

      const stopwatch = stopwatches[0];
      const elapsed = stopwatch ? Number(stopwatch.properties.elapsedTime ?? 0) : 0;

      const pendSim = calculatePendulumState(
        {
          lengthMeters: L,
          massKg: mKg,
          initialAngleDeg: theta0Deg,
        },
        elapsed
      );

      updates[pend.id] = {
        periodSeconds: pendSim.period,
        periodExact: pendSim.periodExact,
        frequencyHz: pendSim.frequency,
        angularFrequency: pendSim.angularFrequency,
        currentAngleDeg: pendSim.currentAngleDeg,
        completedCycles: pendSim.completedCycles,
        calculatedGravity: pendSim.calculatedGravity,
        isMassIndependent: true,
        status: `L = ${L.toFixed(2)}m, m = ${mGrams}g => T = ${pendSim.period.toFixed(2)}s, f = ${pendSim.frequency.toFixed(2)}Hz (Mass Independent)`,
      };

      if (stopwatch) {
        updates[stopwatch.id] = {
          cycleCount: pendSim.completedCycles,
          instantaneousAngle: pendSim.currentAngleDeg,
          measuredPeriod: pendSim.period,
        };
      }

      messages.push(
        `Simple Pendulum: L = ${L.toFixed(2)}m, m = ${mGrams}g => T = ${pendSim.period.toFixed(2)}s, f = ${pendSim.frequency.toFixed(2)}Hz (Mass Independent: changing m does not alter T)`
      );
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
