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
import {
  calculateVernierReading,
  calculateCylinderVolume,
  calculateSphereVolume,
  calculateScrewGaugeReading,
  calculateWireCrossSection,
  evaluateLaminaArea,
  calculateSpherometerRadius,
  calculateBeamBalanceState,
  STANDARD_LAMINA_VERTICES,
} from '../physics/precisionMechanicsModel';

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
  {
    id: 'vernier-calliper',
    name: 'Vernier Callipers',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Precision calliper with fixed and sliding jaws, main scale (1 mm pitch), 10-division vernier scale (0.1 mm LC), and depth probe.',
    iconName: 'Ruler',
    defaultWidth: 460,
    defaultHeight: 140,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'jawPosition',
        label: 'Jaw Separation (x)',
        type: 'number',
        defaultValue: 25.4,
        min: 0,
        max: 120,
        step: 0.1,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'zeroError',
        label: 'Zero Error (ZE)',
        type: 'number',
        defaultValue: 0.0,
        min: -1.0,
        max: 1.0,
        step: 0.1,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'vernierDivisions',
        label: 'Vernier Divisions',
        type: 'number',
        defaultValue: 10,
        min: 10,
        max: 20,
        step: 10,
        editable: true,
      },
      {
        id: 'measurementMode',
        label: 'Measurement Mode',
        type: 'select',
        defaultValue: 'external-jaws',
        options: [
          { label: 'External Jaws (Diameter/Length)', value: 'external-jaws' },
          { label: 'Internal Jaws (Inner Diameter)', value: 'internal-jaws' },
          { label: 'Depth Gauge Strip (Depth)', value: 'depth-gauge' },
        ],
        editable: true,
      },
      {
        id: 'grippedObject',
        label: 'Object in Jaws',
        type: 'select',
        defaultValue: 'metallic-cylinder',
        options: [
          { label: 'Metallic Cylinder (d = 25.4 mm, h = 52.0 mm)', value: 'metallic-cylinder' },
          { label: 'Steel Sphere (d = 18.6 mm)', value: 'steel-sphere' },
          { label: 'Hollow Beaker (ID = 48.2 mm, Depth = 64.5 mm)', value: 'beaker' },
          { label: 'Empty (Manual Jaw Slide)', value: 'none' },
        ],
        editable: true,
      },
    ],
    renderType: 'vernier-calliper',
    colorTheme: '#475569',
  },
  {
    id: 'test-cylinder',
    name: 'Metallic Specimen Cylinder',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Machined solid metallic test cylinder for diameter, height, and volume measurements.',
    iconName: 'Cylinder',
    defaultWidth: 90,
    defaultHeight: 120,
    rotatable: true,
    ports: [],
    propertyDefinitions: [
      {
        id: 'diameter',
        label: 'Diameter (d)',
        type: 'number',
        defaultValue: 25.4,
        min: 10,
        max: 60,
        step: 0.1,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'length',
        label: 'Height / Length (h)',
        type: 'number',
        defaultValue: 52.0,
        min: 20,
        max: 100,
        step: 0.1,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'material',
        label: 'Material',
        type: 'select',
        defaultValue: 'Brass',
        options: [
          { label: 'Brass (ρ = 8.5 g/cm³)', value: 'Brass' },
          { label: 'Steel (ρ = 7.8 g/cm³)', value: 'Steel' },
          { label: 'Aluminum (ρ = 2.7 g/cm³)', value: 'Aluminum' },
        ],
        editable: true,
      },
    ],
    renderType: 'test-cylinder',
    colorTheme: '#d97706',
  },
  {
    id: 'test-sphere',
    name: 'Metallic Test Sphere',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Precision spherical ball bearing for curvature, diameter, and volume determinations.',
    iconName: 'Circle',
    defaultWidth: 100,
    defaultHeight: 100,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'diameter',
        label: 'Diameter (d)',
        type: 'number',
        defaultValue: 18.6,
        min: 5,
        max: 40,
        step: 0.1,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'material',
        label: 'Material',
        type: 'select',
        defaultValue: 'Steel',
        options: [
          { label: 'Hardened Steel', value: 'Steel' },
          { label: 'Brass', value: 'Brass' },
          { label: 'Glass', value: 'Glass' },
        ],
        editable: true,
      },
    ],
    renderType: 'test-sphere',
    colorTheme: '#64748b',
  },
  {
    id: 'micrometer-screw-gauge',
    name: 'Micrometer Screw Gauge',
    subjectId: 'physics',
    category: 'instrument',
    description: 'High-precision micrometer with ratchet stop, linear pitch scale (1 mm pitch), and 100-division circular thimble (0.01 mm LC).',
    iconName: 'Crosshair',
    defaultWidth: 420,
    defaultHeight: 170,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'spindleGap',
        label: 'Spindle Gap (d)',
        type: 'number',
        defaultValue: 2.45,
        min: 0,
        max: 25.0,
        step: 0.01,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'pitch',
        label: 'Screw Pitch',
        type: 'number',
        defaultValue: 1.0,
        min: 0.5,
        max: 1.0,
        step: 0.5,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'circularDivisions',
        label: 'Circular Scale Divisions',
        type: 'number',
        defaultValue: 100,
        min: 50,
        max: 100,
        step: 50,
        editable: true,
      },
      {
        id: 'zeroErrorDivisions',
        label: 'Zero Error (Divisions)',
        type: 'number',
        defaultValue: 0,
        min: -10,
        max: 10,
        step: 1,
        unit: 'div',
        editable: true,
      },
      {
        id: 'grippedObject',
        label: 'Specimen in Gap',
        type: 'select',
        defaultValue: 'resistance-wire',
        options: [
          { label: 'Resistance Wire (d = 0.46 mm)', value: 'resistance-wire' },
          { label: 'Glass Plate Slide (t = 1.25 mm)', value: 'glass-plate' },
          { label: 'Lead Shot Sphere (d = 2.45 mm)', value: 'lead-shot' },
          { label: 'Empty (Manual Thimble Turning)', value: 'none' },
        ],
        editable: true,
      },
    ],
    renderType: 'screw-gauge',
    colorTheme: '#0f766e',
  },
  {
    id: 'gauge-wire',
    name: 'Specimen Resistance Wire',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Calibrated thin metallic wire on a laboratory spool for diameter and cross-sectional area analysis.',
    iconName: 'GitCommit',
    defaultWidth: 100,
    defaultHeight: 90,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'wireGauge',
        label: 'Nominal Gauge',
        type: 'select',
        defaultValue: '26 SWG (0.46 mm)',
        options: [
          { label: '26 SWG (0.46 mm)', value: '26 SWG (0.46 mm)' },
          { label: '30 SWG (0.31 mm)', value: '30 SWG (0.31 mm)' },
          { label: '22 SWG (0.71 mm)', value: '22 SWG (0.71 mm)' },
        ],
        editable: true,
      },
      {
        id: 'diameter',
        label: 'True Wire Diameter',
        type: 'number',
        defaultValue: 0.46,
        min: 0.1,
        max: 2.0,
        step: 0.01,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'material',
        label: 'Alloy',
        type: 'select',
        defaultValue: 'Nichrome',
        options: [
          { label: 'Nichrome (ρ = 1.10 × 10⁻⁶ Ω·m)', value: 'Nichrome' },
          { label: 'Constantan (ρ = 0.49 × 10⁻⁶ Ω·m)', value: 'Constantan' },
          { label: 'Copper (ρ = 1.68 × 10⁻⁸ Ω·m)', value: 'Copper' },
        ],
        editable: true,
      },
    ],
    renderType: 'gauge-wire',
    colorTheme: '#b45309',
  },
  {
    id: 'gauge-plate',
    name: 'Specimen Glass Slide / Metal Sheet',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Thin flat rectangular plate specimen for micrometer thickness measurements.',
    iconName: 'Square',
    defaultWidth: 100,
    defaultHeight: 90,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'thickness',
        label: 'Nominal Thickness',
        type: 'number',
        defaultValue: 1.25,
        min: 0.2,
        max: 5.0,
        step: 0.01,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'material',
        label: 'Specimen Type',
        type: 'select',
        defaultValue: 'Microscope Glass Slide',
        options: [
          { label: 'Microscope Glass Slide', value: 'Microscope Glass Slide' },
          { label: 'Aluminum Foil Sheet', value: 'Aluminum Foil Sheet' },
          { label: 'Cover Slip', value: 'Cover Slip' },
        ],
        editable: true,
      },
    ],
    renderType: 'gauge-plate',
    colorTheme: '#0284c7',
  },
  {
    id: 'irregular-lamina-specimen',
    name: 'Irregular Lamina Specimen',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Planar irregular specimen (leaf or acrylic shape) placed on graph paper for area integration.',
    iconName: 'Feather',
    defaultWidth: 180,
    defaultHeight: 220,
    rotatable: true,
    ports: [],
    propertyDefinitions: [
      {
        id: 'specimenType',
        label: 'Lamina Type',
        type: 'select',
        defaultValue: 'Ficus Leaf',
        options: [
          { label: 'Natural Ficus Leaf', value: 'Ficus Leaf' },
          { label: 'Maple Leaf Contour', value: 'Maple Leaf Contour' },
          { label: 'Curved Cardboard Lamina', value: 'Curved Cardboard Lamina' },
        ],
        editable: true,
      },
      {
        id: 'scaleFactor',
        label: 'Lamina Size Scale',
        type: 'number',
        defaultValue: 1.0,
        min: 0.7,
        max: 1.5,
        step: 0.1,
        editable: true,
      },
      {
        id: 'isTraced',
        label: 'Boundary Traced on Paper',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'irregular-lamina',
    colorTheme: '#15803d',
  },
  {
    id: 'graph-paper-grid',
    name: 'Millimeter Graph Paper Sheet',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Precision Cartesian graph grid with 1 cm major rulings and 1 mm minor divisions for square counting.',
    iconName: 'Grid',
    defaultWidth: 320,
    defaultHeight: 320,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'gridUnitCm',
        label: 'Square Unit Size',
        type: 'number',
        defaultValue: 1.0,
        min: 0.5,
        max: 2.0,
        step: 0.5,
        unit: 'cm',
        editable: true,
      },
      {
        id: 'highlightCovered',
        label: 'Highlight Enclosed Squares',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'graph-grid',
    colorTheme: '#059669',
  },
  {
    id: 'spherometer-instrument',
    name: 'Spherometer Instrument',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Equilateral tripod with precision micrometer screw (1 mm pitch, 100 circular divisions) for measuring sagitta and curvature.',
    iconName: 'Compass',
    defaultWidth: 260,
    defaultHeight: 260,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'legDistanceMm',
        label: 'Outer Leg Distance (l)',
        type: 'number',
        defaultValue: 40.0,
        min: 25.0,
        max: 60.0,
        step: 1.0,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'screwHeightMm',
        label: 'Central Screw Reading (h₁)',
        type: 'number',
        defaultValue: 2.03,
        min: -6.0,
        max: 10.0,
        step: 0.01,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'flatReferenceMm',
        label: 'Plane Slab Zero (h₀)',
        type: 'number',
        defaultValue: 0.0,
        min: -2.0,
        max: 2.0,
        step: 0.01,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'surfaceTarget',
        label: 'Placed On Surface',
        type: 'select',
        defaultValue: 'convex-watch-glass',
        options: [
          { label: 'Plane Glass Plate (Flat Reference)', value: 'plane-glass' },
          { label: 'Spherical Convex Watch Glass (R ≈ 13.5 cm)', value: 'convex-watch-glass' },
          { label: 'Spherical Concave Mirror (R ≈ 20.0 cm)', value: 'concave-mirror' },
        ],
        editable: true,
      },
    ],
    renderType: 'spherometer',
    colorTheme: '#7c3aed',
  },
  {
    id: 'curved-surface',
    name: 'Optical Curved Surface / Glass Slab',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Optical test surface (plane flat glass, convex watch glass, or concave spherical mirror) for spherometer contact.',
    iconName: 'Sun',
    defaultWidth: 150,
    defaultHeight: 110,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'surfaceProfile',
        label: 'Surface Geometry',
        type: 'select',
        defaultValue: 'Spherical Convex Watch Glass',
        options: [
          { label: 'Flat Plane Glass Plate', value: 'Flat Plane Glass Plate' },
          { label: 'Spherical Convex Watch Glass', value: 'Spherical Convex Watch Glass' },
          { label: 'Spherical Concave Mirror', value: 'Spherical Concave Mirror' },
        ],
        editable: true,
      },
      {
        id: 'nominalRadiusMm',
        label: 'True Curvature Radius',
        type: 'number',
        defaultValue: 135.0,
        min: 50.0,
        max: 300.0,
        step: 5.0,
        unit: 'mm',
        editable: true,
      },
    ],
    renderType: 'curved-surface',
    colorTheme: '#3b82f6',
  },
  {
    id: 'physical-beam-balance',
    name: 'Physical Beam Balance',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Equal-arm precision balance with agate knife-edge fulcrum, two suspended scale pans, and central oscillating pointer needle.',
    iconName: 'Scale',
    defaultWidth: 420,
    defaultHeight: 280,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'isArrested',
        label: 'Beam Arrestment Handle',
        type: 'boolean',
        defaultValue: false,
        editable: true,
      },
      {
        id: 'leftPanMassG',
        label: 'Left Pan Mass (m₁)',
        type: 'number',
        defaultValue: 24.50,
        min: 0,
        max: 200,
        step: 0.01,
        unit: 'g',
        editable: true,
      },
      {
        id: 'rightPanMassG',
        label: 'Right Pan Mass (m₂)',
        type: 'number',
        defaultValue: 20.00,
        min: 0,
        max: 200,
        step: 0.01,
        unit: 'g',
        editable: true,
      },
      {
        id: 'sensitivityGPerDiv',
        label: 'Sensitivity (g/division)',
        type: 'number',
        defaultValue: 0.01,
        min: 0.005,
        max: 0.05,
        step: 0.005,
        unit: 'g/div',
        editable: true,
      },
    ],
    renderType: 'beam-balance',
    colorTheme: '#b45309',
  },
  {
    id: 'weight-box',
    name: 'Analytical Weight Box',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Polished wooden case holding calibrated gram weights (1g–100g) and fractional milligram riders (10mg–500mg).',
    iconName: 'Box',
    defaultWidth: 180,
    defaultHeight: 120,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'selectedWeightG',
        label: 'Selected Weight to Add',
        type: 'number',
        defaultValue: 5.0,
        min: 0.01,
        max: 50.0,
        step: 0.5,
        unit: 'g',
        editable: true,
      },
      {
        id: 'targetPan',
        label: 'Place on Pan',
        type: 'select',
        defaultValue: 'right-pan',
        options: [
          { label: 'Right Pan (Standard Weights)', value: 'right-pan' },
          { label: 'Left Pan (Tare Counterweight)', value: 'left-pan' },
        ],
        editable: true,
      },
    ],
    renderType: 'weight-box',
    colorTheme: '#78350f',
  },
  {
    id: 'unknown-mass-specimen',
    name: 'Unknown Mass Specimen',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Machined metal cylinder or irregular specimen whose true mass is to be determined experimentally.',
    iconName: 'HelpCircle',
    defaultWidth: 90,
    defaultHeight: 100,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'actualMassG',
        label: 'Specimen Hidden Mass',
        type: 'number',
        defaultValue: 24.50,
        min: 5.0,
        max: 80.0,
        step: 0.5,
        unit: 'g',
        editable: true,
      },
      {
        id: 'material',
        label: 'Specimen Metal',
        type: 'select',
        defaultValue: 'Brass Solid Weight',
        options: [
          { label: 'Brass Solid Weight', value: 'Brass Solid Weight' },
          { label: 'Steel Component', value: 'Steel Component' },
          { label: 'Glass Stopper', value: 'Glass Stopper' },
        ],
        editable: true,
      },
    ],
    renderType: 'unknown-mass',
    colorTheme: '#64748b',
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
  {
    experimentId: 'vernier-callipers',
    title: 'Vernier Callipers – Measurement of Diameter, Depth & Volume',
    subjectId: 'physics',
    allowedEquipmentIds: ['vernier-calliper', 'test-cylinder', 'test-sphere'],
    initialObjects: [
      {
        id: 'calliper-1',
        equipmentId: 'vernier-calliper',
        title: 'Precision Vernier Callipers',
        x: 60,
        y: 80,
        rotation: 0,
        width: 460,
        height: 140,
        properties: {
          jawPosition: 25.4,
          zeroError: 0.0,
          vernierDivisions: 10,
          measurementMode: 'external-jaws',
          grippedObject: 'metallic-cylinder',
        },
        state: {
          leastCountMm: 0.1,
          msrMm: 25,
          vcd: 4,
          observedReadingMm: 25.4,
          correctedReadingMm: 25.4,
          volumeCm3: 26.347,
          status: 'Cylinder Gripped | d = 25.40 mm',
        },
      },
      {
        id: 'cyl-1',
        equipmentId: 'test-cylinder',
        title: 'Brass Specimen Cylinder',
        x: 550,
        y: 80,
        rotation: 0,
        width: 90,
        height: 120,
        properties: { diameter: 25.4, length: 52.0, material: 'Brass' },
        state: { volumeCm3: 26.347, massG: 223.95 },
      },
      {
        id: 'sphere-1',
        equipmentId: 'test-sphere',
        title: 'Steel Ball Bearing',
        x: 670,
        y: 80,
        rotation: 0,
        width: 90,
        height: 90,
        properties: { diameter: 18.6, material: 'Steel' },
        state: { volumeCm3: 3.37, massG: 26.28 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'vc-step-1',
        stepNumber: 1,
        title: 'Determine Vernier Least Count (LC)',
        instruction:
          'Observe the main scale divisions (1 MSD = 1.0 mm) and vernier divisions (10 VSD). Calculate LC = 1 MSD - 1 VSD = 1 mm - 0.9 mm = 0.1 mm = 0.01 cm.',
      },
      {
        id: 'vc-step-2',
        stepNumber: 2,
        title: 'Calibrate Zero Error with Jaws Closed',
        instruction:
          'Inspect the zero error property. When jaws touch (x = 0), verify that Vernier zero aligns with Main zero. If displaced to the right, subtract positive zero error.',
      },
      {
        id: 'vc-step-3',
        stepNumber: 3,
        title: 'Measure External Diameter of Brass Cylinder',
        instruction:
          'Grip the brass cylinder between lower jaws. Read the Main Scale Reading (MSR) before the vernier zero, and identify the Vernier Coincidence (VCD). Total = MSR + (VCD × LC).',
      },
      {
        id: 'vc-step-4',
        stepNumber: 4,
        title: 'Measure Length of Cylinder and Compute Volume',
        instruction:
          'Turn cylinder to measure its height h = 52.0 mm. Compute cross-sectional area and cylinder volume V = πd²h / 4.',
      },
      {
        id: 'vc-step-5',
        stepNumber: 5,
        title: 'Log Measurements in Laboratory Notebook',
        instruction:
          'Record diameter, length, zero correction, and calculated volume in your observation table.',
      },
    ],
    goals: [
      {
        id: 'goal-vc-lc',
        description: 'Verify vernier calliper least count LC = 0.1 mm and zero error.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-vc-measure',
        description: 'Measure cylinder diameter and height across multiple trials.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-vc-volume',
        description: 'Calculate cylinder volume V = πd²h / 4 and record in notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Vernier Callipers Measurements & Volume Determination:\n- Value of 1 Main Scale Division (MSD) = 1.0 mm = 0.1 cm\n- Number of Vernier Divisions (n) = 10\n- Least Count (LC) = 1 MSD / n = 1.0 mm / 10 = 0.1 mm = 0.01 cm\n\nZero Error Calibration:\n- Zero Error (ZE) = ± (Coincident division × LC)\n- Zero Correction (ZC) = -ZE\n- Corrected Reading = Observed Reading + ZC = MSR + (VCD × LC) - ZE\n\nVolume Formulas:\n- Cylinder: V = π·r²·h = (π / 4) · d² · h\n- Sphere: V = (4/3)·π·r³ = (π / 6) · d³",
  },
  {
    experimentId: 'screw-gauge',
    title: 'Micrometer Screw Gauge – Wire Diameter & Sheet Thickness',
    subjectId: 'physics',
    allowedEquipmentIds: ['micrometer-screw-gauge', 'gauge-wire', 'gauge-plate'],
    initialObjects: [
      {
        id: 'sg-1',
        equipmentId: 'micrometer-screw-gauge',
        title: 'Micrometer Screw Gauge',
        x: 60,
        y: 70,
        rotation: 0,
        width: 420,
        height: 170,
        properties: {
          spindleGap: 0.46,
          pitch: 1.0,
          circularDivisions: 100,
          zeroErrorDivisions: 0,
          grippedObject: 'resistance-wire',
        },
        state: {
          leastCountMm: 0.01,
          psrMm: 0.0,
          csr: 46,
          observedReadingMm: 0.46,
          correctedReadingMm: 0.46,
          crossSectionMm2: 0.1662,
          status: 'Wire Gripped | d = 0.460 mm',
        },
      },
      {
        id: 'wire-1',
        equipmentId: 'gauge-wire',
        title: 'Nichrome Resistance Wire',
        x: 520,
        y: 80,
        rotation: 0,
        width: 110,
        height: 100,
        properties: { diameter: 0.46, wireGauge: '26 SWG (0.46 mm)', material: 'Nichrome' },
        state: { areaMm2: 0.1662 },
      },
      {
        id: 'plate-1',
        equipmentId: 'gauge-plate',
        title: 'Glass Slide Plate',
        x: 660,
        y: 80,
        rotation: 0,
        width: 100,
        height: 100,
        properties: { thickness: 1.25, material: 'Microscope Glass Slide' },
        state: { thicknessMm: 1.25 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'sg-step-1',
        stepNumber: 1,
        title: 'Determine Pitch and Least Count',
        instruction:
          'Inspect screw pitch (1.0 mm advance per revolution) and 100 circular divisions. Least Count = Pitch / 100 = 0.01 mm = 0.001 cm.',
      },
      {
        id: 'sg-step-2',
        stepNumber: 2,
        title: 'Determine Zero Error and Ratchet Stop',
        instruction:
          'Rotate ratchet until spindle meets anvil. Check if circular zero matches sleeve reference line. Record zero error in circular divisions.',
      },
      {
        id: 'sg-step-3',
        stepNumber: 3,
        title: 'Measure Nichrome Wire Diameter',
        instruction:
          'Place resistance wire between anvil and spindle. Turn ratchet until 3 gentle clicks sound. Read Pitch Scale Reading (PSR) and Circular Scale Reading (CSR).',
      },
      {
        id: 'sg-step-4',
        stepNumber: 4,
        title: 'Calculate Cross-Sectional Area',
        instruction:
          'Apply zero correction: d = PSR + (CSR × LC) - ZE. Compute cross-sectional area A = πd² / 4.',
      },
      {
        id: 'sg-step-5',
        stepNumber: 5,
        title: 'Measure Glass Slide Thickness and Log Readings',
        instruction:
          'Switch specimen to Glass Slide (t = 1.25 mm) and record readings across multiple points to check uniformity.',
      },
    ],
    goals: [
      {
        id: 'goal-sg-lc',
        description: 'Calculate pitch and least count LC = 0.01 mm.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-sg-wire',
        description: 'Measure wire diameter and apply zero error correction.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-sg-area',
        description: 'Calculate wire cross-sectional area A = πd² / 4 and log to notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Micrometer Screw Gauge Measurements:\n- Pitch of screw = Distance moved / No. of full rotations = 1.0 mm\n- Total Circular Scale Divisions (N) = 100\n- Least Count (LC) = Pitch / N = 1.0 mm / 100 = 0.01 mm = 0.001 cm\n\nZero Error (ZE):\n- Positive Zero Error: 0 on circular scale is below reference line: ZE = +n × LC\n- Negative Zero Error: 0 on circular scale is above reference line: ZE = -(N - n) × LC\n- Zero Correction (ZC) = -ZE\n- Corrected Diameter = PSR + (CSR × LC) + ZC\n\nCross-sectional Area of Wire:\n- A = π · r² = (π / 4) · d²\nExample (d = 0.46 mm): A = (π/4)·(0.46)² = 0.1662 mm² = 1.662 × 10⁻³ cm²",
  },
  {
    experimentId: 'irregular-lamina',
    title: 'Area of an Irregular Lamina by Graph-Grid Integration',
    subjectId: 'physics',
    allowedEquipmentIds: ['graph-paper-grid', 'irregular-lamina-specimen'],
    initialObjects: [
      {
        id: 'grid-1',
        equipmentId: 'graph-paper-grid',
        title: 'Millimeter Graph Paper',
        x: 180,
        y: 40,
        rotation: 0,
        width: 380,
        height: 380,
        properties: { gridUnitCm: 1.0, highlightCovered: true },
        state: { fullSquares: 16, moreThanHalf: 8, halfSquares: 4, calculatedAreaCm2: 22.0 },
      },
      {
        id: 'lamina-1',
        equipmentId: 'irregular-lamina-specimen',
        title: 'Ficus Leaf Lamina',
        x: 280,
        y: 110,
        rotation: 0,
        width: 180,
        height: 220,
        properties: { specimenType: 'Ficus Leaf', scaleFactor: 1.0, isTraced: true },
        state: { theoreticalAreaCm2: 22.45, estimatedAreaCm2: 22.0 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'il-step-1',
        stepNumber: 1,
        title: 'Place Lamina Over Millimeter Graph Grid',
        instruction:
          'Position the irregular lamina (leaf specimen) over the Cartesian millimeter graph paper grid.',
      },
      {
        id: 'il-step-2',
        stepNumber: 2,
        title: 'Trace Closed Boundary Contour',
        instruction:
          'Ensure boundary tracing is active to lock the exact perimeter coordinates onto the grid coordinate frame.',
      },
      {
        id: 'il-step-3',
        stepNumber: 3,
        title: 'Count Fully Enclosed Squares (N₁)',
        instruction:
          'Enumerate squares that lie completely inside the boundary curve (> 75% covered). Mark with full weight = 1.',
      },
      {
        id: 'il-step-4',
        stepNumber: 4,
        title: 'Count Boundary Squares (N₂ and N₃)',
        instruction:
          'Count squares with more than half covered (N₂, weight = 1) and half covered (N₃, weight = 0.5). Neglect squares with less than half covered.',
      },
      {
        id: 'il-step-5',
        stepNumber: 5,
        title: 'Compute Estimated Area and Uncertainty',
        instruction:
          'Calculate Area A = (N₁ + N₂ + 0.5·N₃) × s². Compare with the theoretical geometric area derived by Gauss’s Shoelace algorithm.',
      },
    ],
    goals: [
      {
        id: 'goal-il-trace',
        description: 'Position and trace irregular lamina on graph paper.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-il-count',
        description: 'Enumerate full and partial grid squares systematically.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-il-area',
        description: 'Calculate area with uncertainty and record in laboratory notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Area of an Irregular Lamina by Graph-Grid Method:\n- Area of 1 graph square = s × s (for 1 cm grid, area = 1.0 cm²)\n\nCounting Convention:\n1. N₁ = Number of fully enclosed squares (weight = 1)\n2. N₂ = Number of squares with > 50% covered (weight = 1)\n3. N₃ = Number of squares with ~50% covered (weight = 0.5)\n4. Squares with < 50% covered are neglected (weight = 0)\n\nCalculation Formula:\n- Total Effective Squares N = N₁ + N₂ + 0.5 × N₃\n- Estimated Area A = N × s²\n- Boundary Uncertainty: ΔA ≈ ± 0.5 × (N₂ + N₃) × s²\n\nMathematical Benchmark:\nGauss's Shoelace formula evaluates exact polygon area:\nA_exact = 0.5 × |∑(x_i·y_{i+1} - x_{i+1}·y_i)|",
  },
  {
    experimentId: 'spherometer',
    title: 'Spherometer – Radius of Curvature of Spherical Surfaces',
    subjectId: 'physics',
    allowedEquipmentIds: ['spherometer-instrument', 'curved-surface'],
    initialObjects: [
      {
        id: 'sph-1',
        equipmentId: 'spherometer-instrument',
        title: 'Spherometer Instrument',
        x: 80,
        y: 80,
        rotation: 0,
        width: 260,
        height: 260,
        properties: {
          legDistanceMm: 40.0,
          screwHeightMm: 2.03,
          flatReferenceMm: 0.0,
          surfaceTarget: 'convex-watch-glass',
        },
        state: {
          leastCountMm: 0.01,
          sagittaMm: 2.03,
          radiusOfCurvatureCm: 13.23,
          surfaceType: 'convex',
          isValidGeometry: true,
          status: 'Convex Watch Glass | R = 13.23 cm',
        },
      },
      {
        id: 'surf-1',
        equipmentId: 'curved-surface',
        title: 'Spherical Convex Watch Glass',
        x: 420,
        y: 80,
        rotation: 0,
        width: 160,
        height: 110,
        properties: { surfaceProfile: 'Spherical Convex Watch Glass', nominalRadiusMm: 135.0 },
        state: { nominalRadiusCm: 13.5 },
      },
      {
        id: 'surf-plane',
        equipmentId: 'curved-surface',
        title: 'Flat Plane Glass Plate',
        x: 610,
        y: 80,
        rotation: 0,
        width: 150,
        height: 110,
        properties: { surfaceProfile: 'Flat Plane Glass Plate', nominalRadiusMm: 0 },
        state: { nominalRadiusCm: Infinity },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'sph-step-1',
        stepNumber: 1,
        title: 'Measure Outer Leg Separation (l)',
        instruction:
          'Measure the distance l between each pair of the three outer pointed legs on paper. Verify l = 40.0 mm.',
      },
      {
        id: 'sph-step-2',
        stepNumber: 2,
        title: 'Obtain Zero Reference on Flat Glass Slab (h₀)',
        instruction:
          'Place spherometer on plane flat glass plate. Turn central screw until all 4 legs touch the surface simultaneously. Record zero reading h₀.',
      },
      {
        id: 'sph-step-3',
        stepNumber: 3,
        title: 'Measure Sagitta on Convex Watch Glass (h₁)',
        instruction:
          'Place spherometer on the convex watch glass. Elevate central screw until its tip contacts the vertex. Record h₁ and compute sagitta h = |h₁ - h₀|.',
      },
      {
        id: 'sph-step-4',
        stepNumber: 4,
        title: 'Calculate Radius of Curvature (R = l² / 6h + h / 2)',
        instruction:
          'Substitute l = 40.0 mm and h = 2.03 mm into R = l²/(6h) + h/2. Verify geometric validity constraints.',
      },
      {
        id: 'sph-step-5',
        stepNumber: 5,
        title: 'Log Radius of Curvature in Notebook',
        instruction:
          'Record sagitta, radius of curvature, and percentage uncertainty in your laboratory notebook.',
      },
    ],
    goals: [
      {
        id: 'goal-sph-zero',
        description: 'Calibrate flat plane reference reading h₀.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-sph-sagitta',
        description: 'Measure sagitta h on convex or concave optical surface.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-sph-radius',
        description: 'Calculate radius of curvature R = l²/(6h) + h/2 and log to notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Spherometer & Radius of Curvature of Spherical Surface:\n- Pitch of central screw = 1.0 mm\n- Circular disc divisions = 100\n- Least Count (LC) = 1.0 mm / 100 = 0.01 mm = 0.001 cm\n\nGeometry of Equilateral Triangle Base:\n- Mean distance between any two outer legs = l\n- Circumradius of base circle: r = l / √3\n\nRadius of Curvature Formula:\nFrom right triangle on sphere: R² = r² + (R - h)²\n=> R² = (l² / 3) + R² - 2·R·h + h²\n=> 2·R·h = (l² / 3) + h²\n=> R = l² / (6·h) + h / 2\n\nExample Calculation:\n* l = 40.0 mm = 4.0 cm\n* h = 2.03 mm = 0.203 cm\n* l² / (6·h) = 1600 / 12.18 = 131.36 mm\n* h / 2 = 1.02 mm\n* R = 131.36 + 1.02 = 132.38 mm = 13.24 cm",
  },
  {
    experimentId: 'beam-balance',
    title: 'Physical Beam Balance – Mass Determination by Method of Oscillations',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'physical-beam-balance',
      'weight-box',
      'unknown-mass-specimen',
    ],
    initialObjects: [
      {
        id: 'bb-1',
        equipmentId: 'physical-beam-balance',
        title: 'Physical Beam Balance',
        x: 60,
        y: 60,
        rotation: 0,
        width: 420,
        height: 280,
        properties: {
          isArrested: true,
          leftPanMassG: 24.50,
          rightPanMassG: 20.00,
          sensitivityGPerDiv: 0.01,
        },
        state: {
          status: 'arrested',
          isBalanced: false,
          massDifferenceGrams: -4.50,
          currentPointerAngleDeg: 0,
        },
      },
      {
        id: 'wb-1',
        equipmentId: 'weight-box',
        title: 'Analytical Weight Box',
        x: 520,
        y: 60,
        rotation: 0,
        width: 180,
        height: 140,
        properties: { selectedWeightG: 5.0, targetPan: 'right-pan' },
        state: { availableWeights: '100g, 50g, 20g, 10g, 5g, 2g, 1g, mg riders' },
      },
      {
        id: 'unknown-1',
        equipmentId: 'unknown-mass-specimen',
        title: 'Unknown Brass Mass',
        x: 520,
        y: 220,
        rotation: 0,
        width: 110,
        height: 100,
        properties: { actualMassG: 24.50, material: 'Brass Solid Weight' },
        state: { placedOnPan: 'left-pan' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'bb-step-1',
        stepNumber: 1,
        title: 'Level Balance and Verify Zero Resting Point',
        instruction:
          'Ensure the balance base is level. Release the arrestment handle with empty pans and verify pointer oscillates symmetrically around 0.',
      },
      {
        id: 'bb-step-2',
        stepNumber: 2,
        title: 'Place Unknown Mass in Left Pan',
        instruction:
          'Arrest the beam before placing objects. Place the unknown mass specimen on the left scale pan.',
      },
      {
        id: 'bb-step-3',
        stepNumber: 3,
        title: 'Add Calibrated Weights to Right Pan',
        instruction:
          'Add standard weights from the weight box (e.g., 20g + 2g + 2g + 500mg = 24.50g) to the right scale pan using forceps.',
      },
      {
        id: 'bb-step-4',
        stepNumber: 4,
        title: 'Release Arrestment and Observe Oscillations',
        instruction:
          'Turn the arrestment lever to release the beam. Watch the pointer needle swing across the index scale and determine the resting point RP = (d₁ + 2d₂ + d₃) / 4.',
      },
      {
        id: 'bb-step-5',
        stepNumber: 5,
        title: 'Record Equilibrium Mass in Notebook',
        instruction:
          'When resting point aligns at 0.0 divisions (|Δm| ≤ 5 mg), mechanical equilibrium is achieved. Unknown mass = Total right weights.',
      },
    ],
    goals: [
      {
        id: 'goal-bb-arrest',
        description: 'Operate arrestment lever safely before and after weight changes.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-bb-balance',
        description: 'Counterbalance unknown mass with standard calibrated weights.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-bb-mass',
        description: 'Determine unknown mass to within ± 0.01 g and log to notebook.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Physical Beam Balance & Mass Determination:\n- Principle of Moments: Equilibrium occurs when clockwise torque equals counter-clockwise torque.\n  m_left × g × L = m_right × g × L  =>  m_left = m_right\n\nMethod of Oscillations (Resting Point):\n- When turning points on index scale are d₁, d₂, d₃:\n  Resting Point (RP) = (d₁ + 2·d₂ + d₃) / 4\n\nSensitivity of Balance:\n- Sensitivity S = Deflection in divisions per unit mass difference (divisions / mg).\n- Minimum detectable threshold = ± 0.005 g (5 mg).\n\nPrecautions:\n1. Never add or remove weights without arresting the beam first.\n2. Handle all weights with forceps, never bare fingers.\n3. Close glass doors during final oscillation readings to eliminate air drafts.",
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

    // 5. Vernier Callipers Precision Measurement Simulation
    const callipers = objects.filter((o) => o.equipmentId === 'vernier-calliper');
    const cylinders = objects.filter((o) => o.equipmentId === 'test-cylinder');
    const spheres = objects.filter((o) => o.equipmentId === 'test-sphere');

    for (const vc of callipers) {
      const mode = String(vc.properties.measurementMode ?? 'external-jaws');
      const gripped = String(vc.properties.grippedObject ?? 'metallic-cylinder');
      const zeroError = Number(vc.properties.zeroError ?? 0.0);
      const divisions = Number(vc.properties.vernierDivisions ?? 10);

      let targetDimensionMm = Number(vc.properties.jawPosition ?? 25.4);
      let specimenDesc = 'Empty Jaws';
      let derivedVolCm3 = 0;

      if (gripped === 'metallic-cylinder') {
        const cyl = cylinders[0];
        const d = cyl ? Number(cyl.properties.diameter ?? 25.4) : 25.4;
        const h = cyl ? Number(cyl.properties.length ?? 52.0) : 52.0;
        targetDimensionMm = mode === 'depth-gauge' ? h : d;
        specimenDesc = `Brass Cylinder (${mode === 'depth-gauge' ? `h = ${h} mm` : `d = ${d} mm`})`;
        derivedVolCm3 = calculateCylinderVolume(d, h).volumeCm3;
        if (cyl) {
          updates[cyl.id] = { volumeCm3: derivedVolCm3, status: `d = ${d} mm, h = ${h} mm` };
        }
      } else if (gripped === 'steel-sphere') {
        const sph = spheres[0];
        const d = sph ? Number(sph.properties.diameter ?? 18.6) : 18.6;
        targetDimensionMm = d;
        specimenDesc = `Steel Sphere (d = ${d} mm)`;
        derivedVolCm3 = calculateSphereVolume(d).volumeCm3;
        if (sph) {
          updates[sph.id] = { volumeCm3: derivedVolCm3, status: `d = ${d} mm` };
        }
      } else if (gripped === 'beaker') {
        targetDimensionMm = mode === 'depth-gauge' ? 64.5 : 48.2;
        specimenDesc = `Beaker (${mode === 'depth-gauge' ? 'Internal Depth' : 'Internal Diameter'})`;
      }

      const reading = calculateVernierReading(targetDimensionMm, {
        mainScalePitchMm: 1.0,
        vernierDivisions: divisions,
        zeroErrorMm: zeroError,
      });

      updates[vc.id] = {
        jawPositionMm: targetDimensionMm,
        leastCountMm: reading.leastCountMm,
        msrMm: reading.msrMm,
        vcd: reading.vcd,
        observedReadingMm: reading.observedReadingMm,
        zeroErrorMm: reading.zeroErrorMm,
        zeroCorrectionMm: reading.zeroCorrectionMm,
        correctedReadingMm: reading.correctedReadingMm,
        correctedReadingCm: reading.correctedReadingCm,
        volumeCm3: derivedVolCm3,
        status: `${specimenDesc} | Reading: ${reading.correctedReadingMm.toFixed(2)} mm (MSR=${reading.msrMm}, VCD=${reading.vcd})`,
      };

      messages.push(
        `Vernier Callipers: ${specimenDesc} => MSR = ${reading.msrMm} mm, VCD = ${reading.vcd}, Corrected = ${reading.correctedReadingMm.toFixed(2)} mm (LC = ${reading.leastCountMm} mm)`
      );
    }

    // 6. Micrometer Screw Gauge Measurement Simulation
    const screwGauges = objects.filter((o) => o.equipmentId === 'micrometer-screw-gauge');
    const wires = objects.filter((o) => o.equipmentId === 'gauge-wire');
    const plates = objects.filter((o) => o.equipmentId === 'gauge-plate');

    for (const sg of screwGauges) {
      const gripped = String(sg.properties.grippedObject ?? 'resistance-wire');
      const pitch = Number(sg.properties.pitch ?? 1.0);
      const circularDivs = Number(sg.properties.circularDivisions ?? 100);
      const zeroErrorDivs = Number(sg.properties.zeroErrorDivisions ?? 0);

      let targetGapMm = Number(sg.properties.spindleGap ?? 0.46);
      let specimenDesc = 'Empty Gap';
      let crossSectionMm2 = 0;

      if (gripped === 'resistance-wire') {
        const wire = wires[0];
        targetGapMm = wire ? Number(wire.properties.diameter ?? 0.46) : 0.46;
        specimenDesc = `Nichrome Wire (d = ${targetGapMm.toFixed(3)} mm)`;
        crossSectionMm2 = calculateWireCrossSection(targetGapMm).areaMm2;
        if (wire) {
          updates[wire.id] = { areaMm2: crossSectionMm2, status: `d = ${targetGapMm.toFixed(3)} mm` };
        }
      } else if (gripped === 'glass-plate') {
        const plate = plates[0];
        targetGapMm = plate ? Number(plate.properties.thickness ?? 1.25) : 1.25;
        specimenDesc = `Glass Slide (t = ${targetGapMm.toFixed(3)} mm)`;
        if (plate) {
          updates[plate.id] = { thicknessMm: targetGapMm, status: `t = ${targetGapMm.toFixed(3)} mm` };
        }
      } else if (gripped === 'lead-shot') {
        targetGapMm = 2.45;
        specimenDesc = 'Lead Shot Ball (d = 2.450 mm)';
      }

      const reading = calculateScrewGaugeReading(targetGapMm, {
        pitchMm: pitch,
        circularDivisions: circularDivs,
        zeroErrorDivisions: zeroErrorDivs,
      });

      updates[sg.id] = {
        spindleGapMm: targetGapMm,
        leastCountMm: reading.leastCountMm,
        psrMm: reading.psrMm,
        csr: reading.csr,
        observedReadingMm: reading.observedReadingMm,
        zeroErrorMm: reading.zeroErrorMm,
        zeroCorrectionMm: reading.zeroCorrectionMm,
        correctedReadingMm: reading.correctedReadingMm,
        correctedReadingCm: reading.correctedReadingCm,
        crossSectionMm2: crossSectionMm2,
        status: `${specimenDesc} | Reading: ${reading.correctedReadingMm.toFixed(3)} mm (PSR=${reading.psrMm}, CSR=${reading.csr})`,
      };

      messages.push(
        `Screw Gauge: ${specimenDesc} => PSR = ${reading.psrMm} mm, CSR = ${reading.csr}, Corrected = ${reading.correctedReadingMm.toFixed(3)} mm (LC = ${reading.leastCountMm} mm)`
      );
    }

    // 7. Area of an Irregular Lamina by Graph-Grid Integration Simulation
    const graphGrids = objects.filter((o) => o.equipmentId === 'graph-paper-grid');
    const laminas = objects.filter((o) => o.equipmentId === 'irregular-lamina-specimen');

    for (const grid of graphGrids) {
      const lamina = laminas[0];
      const gridUnitCm = Number(grid.properties.gridUnitCm ?? 1.0);

      if (lamina) {
        const scale = Number(lamina.properties.scaleFactor ?? 1.0);
        const scaledPolygon = STANDARD_LAMINA_VERTICES.map((p) => ({
          x: p.x * scale,
          y: p.y * scale,
        }));

        // Relative offset of lamina center over grid
        const dx = ((lamina.x + (lamina.width || 180) / 2) - (grid.x + (grid.width || 380) / 2)) / 35;
        const dy = ((lamina.y + (lamina.height || 220) / 2) - (grid.y + (grid.height || 380) / 2)) / 35;

        const areaResult = evaluateLaminaArea(scaledPolygon, gridUnitCm, dx, dy);

        updates[grid.id] = {
          fullSquares: areaResult.fullSquaresCount,
          moreThanHalf: areaResult.moreThanHalfCount,
          halfSquares: areaResult.halfSquaresCount,
          neglected: areaResult.neglectedCount,
          totalSquares: areaResult.totalSquaresCount,
          calculatedAreaCm2: areaResult.calculatedAreaCm2,
          uncertaintyCm2: areaResult.uncertaintyCm2,
          theoreticalAreaCm2: areaResult.theoreticalShoelaceAreaCm2,
          percentageError: areaResult.percentageError,
          status: `Area = ${areaResult.calculatedAreaCm2} ± ${areaResult.uncertaintyCm2} cm² (${areaResult.totalSquaresCount} sq)`,
        };

        updates[lamina.id] = {
          estimatedAreaCm2: areaResult.calculatedAreaCm2,
          theoreticalAreaCm2: areaResult.theoreticalShoelaceAreaCm2,
          uncertaintyCm2: areaResult.uncertaintyCm2,
          status: `Lamina Area: ${areaResult.calculatedAreaCm2} cm² (Gauss Exact: ${areaResult.theoreticalShoelaceAreaCm2} cm²)`,
        };

        messages.push(
          `Irregular Lamina: N₁ = ${areaResult.fullSquaresCount}, N₂ = ${areaResult.moreThanHalfCount}, N₃ = ${areaResult.halfSquaresCount} => Estimated Area = ${areaResult.calculatedAreaCm2} ± ${areaResult.uncertaintyCm2} cm² (Exact Shoelace = ${areaResult.theoreticalShoelaceAreaCm2} cm²)`
        );
      }
    }

    // 8. Spherometer & Radius of Curvature Simulation
    const spherometers = objects.filter((o) => o.equipmentId === 'spherometer-instrument');
    const surfaces = objects.filter((o) => o.equipmentId === 'curved-surface');

    for (const sph of spherometers) {
      const legDist = Number(sph.properties.legDistanceMm ?? 40.0);
      const target = String(sph.properties.surfaceTarget ?? 'convex-watch-glass');
      const flatRef = Number(sph.properties.flatReferenceMm ?? 0.0);

      let h1 = Number(sph.properties.screwHeightMm ?? 2.03);
      let targetDesc = 'Convex Watch Glass';

      if (target === 'plane-glass') {
        h1 = flatRef;
        targetDesc = 'Flat Plane Glass Plate';
      } else if (target === 'concave-mirror') {
        h1 = flatRef - 1.34;
        targetDesc = 'Concave Spherical Mirror';
      } else {
        h1 = flatRef + 2.03;
        targetDesc = 'Spherical Convex Watch Glass';
      }

      const sphResult = calculateSpherometerRadius(h1, flatRef, {
        legDistanceMm: legDist,
        pitchMm: 1.0,
        circularDivisions: 100,
      });

      updates[sph.id] = {
        legDistanceMm: legDist,
        leastCountMm: sphResult.leastCountMm,
        flatReadingMm: sphResult.flatReadingMm,
        curvedReadingMm: sphResult.curvedReadingMm,
        sagittaMm: sphResult.sagittaMm,
        surfaceType: sphResult.surfaceType,
        radiusOfCurvatureCm: sphResult.radiusOfCurvatureCm,
        radiusOfCurvatureMm: sphResult.radiusOfCurvatureMm,
        uncertaintyMm: sphResult.uncertaintyMm,
        isValidGeometry: sphResult.isValidGeometry,
        status: `${targetDesc} | h = ${sphResult.sagittaMm} mm => R = ${sphResult.radiusOfCurvatureCm === Infinity ? '∞' : `${sphResult.radiusOfCurvatureCm} cm`}`,
      };

      for (const surf of surfaces) {
        updates[surf.id] = {
          contactSagittaMm: sphResult.sagittaMm,
          measuredRadiusCm: sphResult.radiusOfCurvatureCm,
          status: `Placed Spherometer Contact: Sagitta h = ${sphResult.sagittaMm} mm`,
        };
      }

      messages.push(
        `Spherometer: l = ${legDist} mm, h = ${sphResult.sagittaMm} mm => Radius of Curvature R = ${sphResult.radiusOfCurvatureCm === Infinity ? '∞' : `${sphResult.radiusOfCurvatureCm} cm`} (${sphResult.surfaceType})`
      );
    }

    // 9. Physical Beam Balance Simulation
    const beamBalances = objects.filter((o) => o.equipmentId === 'physical-beam-balance');
    const unknownMasses = objects.filter((o) => o.equipmentId === 'unknown-mass-specimen');
    const weightBoxes = objects.filter((o) => o.equipmentId === 'weight-box');

    for (const bb of beamBalances) {
      const isArrested = bb.properties.isArrested !== false;
      const unknown = unknownMasses[0];
      const actualMass = unknown ? Number(unknown.properties.actualMassG ?? 24.50) : 24.50;

      const leftPanMass = Number(bb.properties.leftPanMassG ?? actualMass);
      const rightPanMass = Number(bb.properties.rightPanMassG ?? 20.00);
      const sensitivity = Number(bb.properties.sensitivityGPerDiv ?? 0.01);

      const bbState = calculateBeamBalanceState(
        leftPanMass,
        rightPanMass,
        isArrested,
        0,
        sensitivity
      );

      updates[bb.id] = {
        isArrested: bbState.isArrested,
        leftPanMassGrams: bbState.leftPanMassGrams,
        rightPanMassGrams: bbState.rightPanMassGrams,
        massDifferenceGrams: bbState.massDifferenceGrams,
        pointerRestingDivision: bbState.pointerRestingDivision,
        isBalanced: bbState.isBalanced,
        currentPointerAngleDeg: bbState.currentPointerAngleDeg,
        balanceStatus: bbState.status,
        status: bbState.isArrested
          ? 'Beam Arrested (Safe for Weight Placement)'
          : bbState.isBalanced
          ? `EQUILIBRIUM REACHED (m = ${bbState.rightPanMassGrams.toFixed(2)} g)`
          : `Imbalance: ${bbState.massDifferenceGrams > 0 ? '+' : ''}${bbState.massDifferenceGrams.toFixed(2)} g (${bbState.status})`,
      };

      for (const wb of weightBoxes) {
        updates[wb.id] = {
          currentTareG: rightPanMass,
          status: `Right Pan Loaded: ${rightPanMass.toFixed(2)} g`,
        };
      }

      if (unknown) {
        updates[unknown.id] = {
          trueMassG: actualMass,
          placedOnPan: 'left-pan',
          status: bbState.isBalanced
            ? `Determined Mass = ${rightPanMass.toFixed(2)} g (Exact = ${actualMass.toFixed(2)} g)`
            : `Testing on Left Pan (${actualMass.toFixed(2)} g)`,
        };
      }

      messages.push(
        `Beam Balance: Left = ${leftPanMass.toFixed(2)} g, Right = ${rightPanMass.toFixed(2)} g => Δm = ${bbState.massDifferenceGrams.toFixed(2)} g [${bbState.status}]`
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
