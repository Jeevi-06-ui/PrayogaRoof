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
import {
  calculateVectorAddition,
  calculateLimitingFriction,
  calculateInclinedPlanePhysics,
  calculateHookesLaw,
  calculateBoylesLaw,
  SurfacePair,
} from '../physics/vectorMechanicsModel';
import {
  calculateWireResistivity,
  calculateMetreBridge,
  calculateGalvanometerFom,
  calculateGalvanometerToVoltmeter,
  calculateGalvanometerToAmmeter,
  WireMaterial,
} from '../physics/advancedElectromagnetismModel';

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
  {
    id: 'gravesand-force-board',
    name: "Gravesand's Vector Force Board",
    subjectId: 'physics',
    category: 'instrument',
    description: 'Vertical drawing board with dual low-friction pulleys, protractor degree scale, central ring, and coplanar tension strings.',
    iconName: 'Activity',
    defaultWidth: 460,
    defaultHeight: 340,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'forceP',
        label: 'Force P (Left Pulley Tension)',
        type: 'number',
        defaultValue: 3.0,
        min: 0.5,
        max: 10.0,
        step: 0.5,
        unit: 'N',
        editable: true,
      },
      {
        id: 'anglePDeg',
        label: 'Angle of P (θ₁ relative to horizontal)',
        type: 'number',
        defaultValue: 35.0,
        min: 0.0,
        max: 180.0,
        step: 1.0,
        unit: '°',
        editable: true,
      },
      {
        id: 'forceQ',
        label: 'Force Q (Right Pulley Tension)',
        type: 'number',
        defaultValue: 4.0,
        min: 0.5,
        max: 10.0,
        step: 0.5,
        unit: 'N',
        editable: true,
      },
      {
        id: 'angleQDeg',
        label: 'Angle of Q (θ₂ relative to horizontal)',
        type: 'number',
        defaultValue: 125.0,
        min: 0.0,
        max: 180.0,
        step: 1.0,
        unit: '°',
        editable: true,
      },
      {
        id: 'balancingMassGrams',
        label: 'Central Equilibrant Weight S',
        type: 'number',
        defaultValue: 500.0,
        min: 50.0,
        max: 1000.0,
        step: 10.0,
        unit: 'g',
        editable: true,
      },
      {
        id: 'showParallelogram',
        label: 'Show Vector Parallelogram',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'showComponents',
        label: 'Show X-Y Vector Components',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'force-board',
    colorTheme: '#3b82f6',
  },
  {
    id: 'vector-pulley-weight',
    name: 'Suspended Weight Hanger',
    subjectId: 'physics',
    category: 'component',
    description: 'Calibrated weight hanger with stacked 50g slotted disc weights suspended over low-friction pulley.',
    iconName: 'Layers',
    defaultWidth: 100,
    defaultHeight: 180,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'hangerMassG',
        label: 'Hanger Mass',
        type: 'number',
        defaultValue: 50.0,
        unit: 'g',
        editable: false,
      },
      {
        id: 'slottedDiscsCount',
        label: 'Number of 50g Discs',
        type: 'number',
        defaultValue: 4,
        min: 0,
        max: 10,
        step: 1,
        unit: 'discs',
        editable: true,
      },
    ],
    renderType: 'pulley-weight',
    colorTheme: '#d97706',
  },
  {
    id: 'friction-track',
    name: 'Horizontal Friction Track & Pulley',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Horizontal testing plane with interchangeable contact surfaces (wood, glass, sandpaper) and low-friction end pulley.',
    iconName: 'Maximize2',
    defaultWidth: 480,
    defaultHeight: 180,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'surfacePair',
        label: 'Surface Material Pair',
        type: 'select',
        defaultValue: 'wood-on-wood',
        options: [
          { label: 'Wood on Polished Wood (μs = 0.35, μk = 0.28)', value: 'wood-on-wood' },
          { label: 'Wood on Glass Plate (μs = 0.22, μk = 0.18)', value: 'wood-on-glass' },
          { label: 'Wood on Rough Sandpaper (μs = 0.65, μk = 0.52)', value: 'wood-on-sandpaper' },
          { label: 'Brass on Polished Steel (μs = 0.30, μk = 0.24)', value: 'metal-on-metal' },
        ],
        editable: true,
      },
      {
        id: 'trackLengthCm',
        label: 'Track Active Length',
        type: 'number',
        defaultValue: 60.0,
        unit: 'cm',
        editable: false,
      },
    ],
    renderType: 'friction-board',
    colorTheme: '#64748b',
  },
  {
    id: 'friction-slider-block',
    name: 'Wooden Friction Block with Hook',
    subjectId: 'physics',
    category: 'component',
    description: 'Rectangular wooden block with brass pulling hook, broad/narrow faces, and weight placement peg.',
    iconName: 'Box',
    defaultWidth: 150,
    defaultHeight: 110,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'blockMassG',
        label: 'Block Tare Mass',
        type: 'number',
        defaultValue: 150.0,
        unit: 'g',
        editable: false,
      },
      {
        id: 'addedMassG',
        label: 'Added Masses on Block',
        type: 'number',
        defaultValue: 50.0,
        min: 0.0,
        max: 500.0,
        step: 50.0,
        unit: 'g',
        editable: true,
      },
      {
        id: 'panMassG',
        label: 'Pulling Pan Tare Mass',
        type: 'number',
        defaultValue: 20.0,
        unit: 'g',
        editable: false,
      },
      {
        id: 'addedPanMassG',
        label: 'Weights Added to Pan',
        type: 'number',
        defaultValue: 50.0,
        min: 0.0,
        max: 400.0,
        step: 5.0,
        unit: 'g',
        editable: true,
      },
      {
        id: 'contactOrientation',
        label: 'Contact Face Orientation',
        type: 'select',
        defaultValue: 'broad-side',
        options: [
          { label: 'Broad Face (Area = 60 cm²)', value: 'broad-side' },
          { label: 'Narrow Edge (Area = 20 cm²)', value: 'narrow-edge' },
        ],
        editable: true,
      },
    ],
    renderType: 'friction-block',
    colorTheme: '#b45309',
  },
  {
    id: 'inclined-plane-ramp',
    name: 'Variable-Angle Inclined Plane',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Hinged incline track with protractor angle quadrant arc, elevation clamp, and top pulley.',
    iconName: 'TrendingUp',
    defaultWidth: 460,
    defaultHeight: 280,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'inclineAngleDeg',
        label: 'Incline Angle (θ)',
        type: 'number',
        defaultValue: 20.0,
        min: 0.0,
        max: 60.0,
        step: 0.5,
        unit: '°',
        editable: true,
      },
      {
        id: 'surfacePair',
        label: 'Plane Surface Pair',
        type: 'select',
        defaultValue: 'wood-on-wood',
        options: [
          { label: 'Wood on Wood (μs = 0.35, Angle of Repose = 19.3°)', value: 'wood-on-wood' },
          { label: 'Wood on Glass (μs = 0.22, Angle of Repose = 12.4°)', value: 'wood-on-glass' },
          { label: 'Wood on Sandpaper (μs = 0.65, Angle of Repose = 33.0°)', value: 'wood-on-sandpaper' },
        ],
        editable: true,
      },
      {
        id: 'pullingEffortGrams',
        label: 'Counterbalance Mass in Pan',
        type: 'number',
        defaultValue: 0.0,
        min: 0.0,
        max: 500.0,
        step: 10.0,
        unit: 'g',
        editable: true,
      },
      {
        id: 'showResolutions',
        label: 'Show Force Vector Resolutions',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'inclined-plane',
    colorTheme: '#475569',
  },
  {
    id: 'incline-slider-box',
    name: 'Inclined Plane Slider Box',
    subjectId: 'physics',
    category: 'component',
    description: 'Friction slider block with towing hook positioned on the inclined plane slope.',
    iconName: 'Box',
    defaultWidth: 120,
    defaultHeight: 80,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'blockMassG',
        label: 'Block Mass',
        type: 'number',
        defaultValue: 200.0,
        min: 50.0,
        max: 500.0,
        step: 25.0,
        unit: 'g',
        editable: true,
      },
      {
        id: 'sliderType',
        label: 'Specimen Type',
        type: 'select',
        defaultValue: 'Wooden Slider Block',
        options: [
          { label: 'Wooden Slider Block', value: 'Wooden Slider Block' },
          { label: 'Brass Roller (Low Rolling Friction)', value: 'Brass Roller' },
        ],
        editable: true,
      },
    ],
    renderType: 'incline-slider',
    colorTheme: '#854d0e',
  },
  {
    id: 'helical-spring-stand',
    name: 'Helical Spring on Mirror Scale',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Rigid vertical retort stand holding a coiled helical steel spring, red index pointer, and vertical millimeter mirror scale.',
    iconName: 'Activity',
    defaultWidth: 260,
    defaultHeight: 460,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'springConstantNpm',
        label: 'Spring Constant (k)',
        type: 'number',
        defaultValue: 25.0,
        min: 10.0,
        max: 50.0,
        step: 1.0,
        unit: 'N/m',
        editable: true,
      },
      {
        id: 'unstretchedLengthMm',
        label: 'Unstretched Baseline Length (L₀)',
        type: 'number',
        defaultValue: 120.0,
        min: 80.0,
        max: 180.0,
        step: 5.0,
        unit: 'mm',
        editable: false,
      },
      {
        id: 'appliedMassG',
        label: 'Slotted Load on Hanger',
        type: 'number',
        defaultValue: 100.0,
        min: 0.0,
        max: 500.0,
        step: 50.0,
        unit: 'g',
        editable: true,
      },
      {
        id: 'hangerMassG',
        label: 'Hanger Tare Mass',
        type: 'number',
        defaultValue: 50.0,
        unit: 'g',
        editable: false,
      },
      {
        id: 'elasticLimitN',
        label: 'Elastic Proportionality Limit',
        type: 'number',
        defaultValue: 6.0,
        unit: 'N',
        editable: false,
      },
    ],
    renderType: 'helical-spring-stand',
    colorTheme: '#0284c7',
  },
  {
    id: 'slotted-mass-hanger',
    name: 'Slotted Mass Hanger (50g sets)',
    subjectId: 'physics',
    category: 'component',
    description: 'Precision brass mass hanger with five removable 50g slotted weights.',
    iconName: 'Layers',
    defaultWidth: 100,
    defaultHeight: 160,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'hangerTareG',
        label: 'Hanger Mass',
        type: 'number',
        defaultValue: 50.0,
        unit: 'g',
        editable: false,
      },
      {
        id: 'discsCount',
        label: 'Number of Slotted Discs',
        type: 'number',
        defaultValue: 2,
        min: 0,
        max: 8,
        step: 1,
        unit: 'discs',
        editable: true,
      },
    ],
    renderType: 'slotted-weight-hanger',
    colorTheme: '#ca8a04',
  },
  {
    id: 'boyles-law-cylinder',
    name: "Boyle's Law Piston Cylinder & Gauge",
    subjectId: 'physics',
    category: 'instrument',
    description: 'Airtight graduated glass gas cylinder with movable piston, pressure dial gauge, and volume scale.',
    iconName: 'Gauge',
    defaultWidth: 420,
    defaultHeight: 320,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'volumeMl',
        label: 'Enclosed Gas Volume (V)',
        type: 'number',
        defaultValue: 60.0,
        min: 15.0,
        max: 120.0,
        step: 1.0,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'atmosphericPressureKpa',
        label: 'Ambient Atmospheric Pressure (P₀)',
        type: 'number',
        defaultValue: 101.325,
        min: 90.0,
        max: 110.0,
        step: 0.5,
        unit: 'kPa',
        editable: false,
      },
      {
        id: 'temperatureC',
        label: 'Isothermal Temperature (T)',
        type: 'number',
        defaultValue: 25.0,
        min: 10.0,
        max: 40.0,
        step: 1.0,
        unit: '°C',
        editable: false,
      },
      {
        id: 'gasType',
        label: 'Enclosed Gas',
        type: 'select',
        defaultValue: 'Dry Atmospheric Air',
        options: [
          { label: 'Dry Atmospheric Air (Ideal Approximation)', value: 'Dry Atmospheric Air' },
          { label: 'Nitrogen (N₂)', value: 'Nitrogen' },
          { label: 'Argon (Ar)', value: 'Argon' },
        ],
        editable: true,
      },
    ],
    renderType: 'boyle-cylinder',
    colorTheme: '#059669',
  },
  {
    id: 'resistance-wire-board',
    name: 'Resistance Wire Specimen Board',
    subjectId: 'physics',
    category: 'component',
    description: 'Calibrated specimen resistance wire mounted over millimeter scale with brass binding posts and screw gauge diameter tool.',
    iconName: 'Zap',
    defaultWidth: 440,
    defaultHeight: 180,
    rotatable: false,
    ports: [
      {
        id: 'p1',
        name: 'Terminal A (+)',
        type: 'electrical-positive',
        xOffset: 20,
        yOffset: 90,
        direction: 'west',
        color: '#ef4444',
      },
      {
        id: 'p2',
        name: 'Terminal B (-)',
        type: 'electrical-negative',
        xOffset: 420,
        yOffset: 90,
        direction: 'east',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'material',
        label: 'Wire Material',
        type: 'select',
        defaultValue: 'constantan',
        options: [
          { label: 'Constantan (ρ = 4.9 × 10⁻⁷ Ω·m)', value: 'constantan' },
          { label: 'Nichrome (ρ = 1.1 × 10⁻⁶ Ω·m)', value: 'nichrome' },
          { label: 'Manganin (ρ = 4.4 × 10⁻⁷ Ω·m)', value: 'manganin' },
          { label: 'Commercial Copper (ρ = 1.7 × 10⁻⁸ Ω·m)', value: 'copper' },
        ],
        editable: true,
      },
      {
        id: 'wireLengthCm',
        label: 'Wire Length (L)',
        type: 'number',
        defaultValue: 100.0,
        min: 20.0,
        max: 150.0,
        step: 5.0,
        unit: 'cm',
        editable: true,
      },
      {
        id: 'wireDiameterMm',
        label: 'Wire Diameter (d measured by screw gauge)',
        type: 'number',
        defaultValue: 0.50,
        min: 0.15,
        max: 1.00,
        step: 0.01,
        unit: 'mm',
        editable: true,
      },
      {
        id: 'appliedVoltage',
        label: 'Applied Voltage Across Wire',
        type: 'number',
        defaultValue: 2.0,
        min: 0.0,
        max: 6.0,
        step: 0.2,
        unit: 'V',
        editable: true,
      },
    ],
    renderType: 'resistance-wire-board',
    colorTheme: '#d97706',
  },
  {
    id: 'metre-bridge-board',
    name: 'Standard Metre Bridge Apparatus',
    subjectId: 'physics',
    category: 'instrument',
    description: '1-meter uniform manganin wire on wooden base with Left/Right gaps, sliding knife-edge jockey, and central galvanometer terminal.',
    iconName: 'Maximize2',
    defaultWidth: 520,
    defaultHeight: 240,
    rotatable: false,
    ports: [
      {
        id: 'termA',
        name: 'Battery Terminal A',
        type: 'electrical-positive',
        xOffset: 25,
        yOffset: 200,
        direction: 'west',
        color: '#ef4444',
      },
      {
        id: 'termB',
        name: 'Battery Terminal B',
        type: 'electrical-negative',
        xOffset: 495,
        yOffset: 200,
        direction: 'east',
        color: '#1e293b',
      },
      {
        id: 'termD',
        name: 'Galvanometer Terminal D',
        type: 'electrical-positive',
        xOffset: 260,
        yOffset: 50,
        direction: 'north',
        color: '#3b82f6',
      },
    ],
    propertyDefinitions: [
      {
        id: 'knownResistanceR',
        label: 'Left Gap Known Resistance Box (R)',
        type: 'number',
        defaultValue: 15.0,
        min: 1.0,
        max: 100.0,
        step: 1.0,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'unknownResistanceX',
        label: 'Right Gap Unknown Resistance Coil (X)',
        type: 'number',
        defaultValue: 10.0,
        min: 1.0,
        max: 100.0,
        step: 0.5,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'jockeyPositionCm',
        label: 'Sliding Jockey Contact Position (l)',
        type: 'number',
        defaultValue: 60.0,
        min: 1.0,
        max: 99.0,
        step: 0.5,
        unit: 'cm',
        editable: true,
      },
      {
        id: 'supplyVoltage',
        label: 'Battery DC Supply',
        type: 'number',
        defaultValue: 2.0,
        min: 1.0,
        max: 4.0,
        step: 0.5,
        unit: 'V',
        editable: false,
      },
    ],
    renderType: 'metre-bridge-board',
    colorTheme: '#78350f',
  },
  {
    id: 'moving-coil-galvanometer',
    name: 'Moving Coil Galvanometer (30-0-30)',
    subjectId: 'physics',
    category: 'instrument',
    description: 'High-sensitivity center-zero Weston galvanometer with mirror scale, knife-edge pointer, and shunt terminals.',
    iconName: 'Compass',
    defaultWidth: 260,
    defaultHeight: 280,
    rotatable: false,
    ports: [
      {
        id: 'pos',
        name: 'Positive Terminal (+)',
        type: 'electrical-positive',
        xOffset: 65,
        yOffset: 245,
        direction: 'south',
        color: '#ef4444',
      },
      {
        id: 'neg',
        name: 'Negative Terminal (-)',
        type: 'electrical-negative',
        xOffset: 195,
        yOffset: 245,
        direction: 'south',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'coilResistanceG',
        label: 'Galvanometer Coil Resistance (G)',
        type: 'number',
        defaultValue: 60.0,
        min: 20.0,
        max: 200.0,
        step: 1.0,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'figureOfMeritK',
        label: 'Figure of Merit (k)',
        type: 'number',
        defaultValue: 2.0e-5,
        unit: 'A/div',
        editable: false,
      },
      {
        id: 'highResistanceBoxR',
        label: 'Series High Resistance (R in Half-Deflection)',
        type: 'number',
        defaultValue: 3273.0,
        min: 500.0,
        max: 10000.0,
        step: 50.0,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'lowShuntResistanceS',
        label: 'Shunt Resistance (S in Half-Deflection)',
        type: 'number',
        defaultValue: 60.0,
        min: 10.0,
        max: 200.0,
        step: 1.0,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'isShuntKeyClosed',
        label: 'Shunt Key K2 (Closed for Half-Deflection)',
        type: 'boolean',
        defaultValue: false,
        editable: true,
      },
    ],
    renderType: 'moving-coil-galvanometer',
    colorTheme: '#2563eb',
  },
  {
    id: 'decade-resistance-box',
    name: 'Precision Decade Resistance Box',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Laboratory resistance box with non-inductive brass blocks and non-inductive bifilar wound coils.',
    iconName: 'Cpu',
    defaultWidth: 240,
    defaultHeight: 160,
    rotatable: false,
    ports: [
      {
        id: 'p1',
        name: 'Terminal 1',
        type: 'electrical-positive',
        xOffset: 35,
        yOffset: 135,
        direction: 'south',
        color: '#ef4444',
      },
      {
        id: 'p2',
        name: 'Terminal 2',
        type: 'electrical-negative',
        xOffset: 205,
        yOffset: 135,
        direction: 'south',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'resistance',
        label: 'Introduced Resistance',
        type: 'number',
        defaultValue: 15.0,
        min: 1.0,
        max: 10000.0,
        step: 1.0,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'boxType',
        label: 'Resistance Box Range',
        type: 'select',
        defaultValue: 'Fractional & Standard (1 - 100 Ω)',
        options: [
          { label: 'Fractional & Standard (1 - 100 Ω)', value: 'Fractional & Standard (1 - 100 Ω)' },
          { label: 'High Resistance (100 - 10,000 Ω)', value: 'High Resistance (100 - 10,000 Ω)' },
        ],
        editable: true,
      },
    ],
    renderType: 'decade-resistance-box',
    colorTheme: '#78350f',
  },
  {
    id: 'ammeter-voltmeter-calibrator',
    name: 'Meter Conversion & Calibration Test Bench',
    subjectId: 'physics',
    category: 'instrument',
    description: 'Calibration potential divider circuit board with reference digital LCD meter and variable voltage/current driver.',
    iconName: 'Sliders',
    defaultWidth: 440,
    defaultHeight: 280,
    rotatable: false,
    ports: [
      {
        id: 'pos',
        name: 'Input Signal (+)',
        type: 'electrical-positive',
        xOffset: 40,
        yOffset: 140,
        direction: 'west',
        color: '#ef4444',
      },
      {
        id: 'neg',
        name: 'Input Signal (-)',
        type: 'electrical-negative',
        xOffset: 400,
        yOffset: 140,
        direction: 'east',
        color: '#1e293b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'conversionMode',
        label: 'Conversion Target Instrument',
        type: 'select',
        defaultValue: 'voltmeter',
        options: [
          { label: 'Voltmeter Conversion (Series Multiplier Rs)', value: 'voltmeter' },
          { label: 'Ammeter Conversion (Parallel Shunt S)', value: 'ammeter' },
        ],
        editable: true,
      },
      {
        id: 'galvanometerResistanceG',
        label: 'Galvanometer Coil Resistance (G)',
        type: 'number',
        defaultValue: 100.0,
        min: 20.0,
        max: 200.0,
        step: 5.0,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'targetFullScaleRange',
        label: 'Desired Full-Scale Range (V in Volts or I in Amps)',
        type: 'number',
        defaultValue: 3.0,
        min: 0.5,
        max: 10.0,
        step: 0.5,
        unit: 'V or A',
        editable: true,
      },
      {
        id: 'installedResistorValue',
        label: 'Installed Resistor Value (Rs in Ω or Shunt S in Ω)',
        type: 'number',
        defaultValue: 4900.0,
        min: 0.001,
        max: 20000.0,
        step: 1.0,
        unit: 'Ω',
        editable: true,
      },
      {
        id: 'appliedTestSignal',
        label: 'Applied Calibration Test Signal (V or I)',
        type: 'number',
        defaultValue: 1.5,
        min: 0.0,
        max: 10.0,
        step: 0.1,
        unit: 'V or A',
        editable: true,
      },
    ],
    renderType: 'ammeter-voltmeter-calibrator',
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
  {
    experimentId: 'parallelogram-law',
    title: 'Parallelogram Law of Vectors',
    subjectId: 'physics',
    allowedEquipmentIds: ['gravesand-force-board', 'vector-pulley-weight'],
    initialObjects: [
      {
        id: 'fb-1',
        equipmentId: 'gravesand-force-board',
        title: "Gravesand's Force Board",
        x: 60,
        y: 60,
        rotation: 0,
        width: 480,
        height: 360,
        properties: {
          forceP: 3.0,
          anglePDeg: 35.0,
          forceQ: 4.0,
          angleQDeg: 125.0,
          balancingMassGrams: 509.8,
          showParallelogram: true,
          showComponents: true,
        },
        state: {
          resultantMagnitudeN: 5.0,
          resultantAngleDeg: 80.0,
          includedAngleDeg: 90.0,
          equilibrantN: 5.0,
          percentageError: 0.0,
          isBalanced: true,
        },
      },
      {
        id: 'pw-left',
        equipmentId: 'vector-pulley-weight',
        title: 'Force P Slotted Weights (300g)',
        x: 580,
        y: 60,
        rotation: 0,
        width: 110,
        height: 180,
        properties: {
          hangerMassG: 50.0,
          slottedDiscsCount: 5,
        },
        state: { totalWeightN: 3.0 },
      },
      {
        id: 'pw-right',
        equipmentId: 'vector-pulley-weight',
        title: 'Force Q Slotted Weights (400g)',
        x: 580,
        y: 260,
        rotation: 0,
        width: 110,
        height: 180,
        properties: {
          hangerMassG: 50.0,
          slottedDiscsCount: 7,
        },
        state: { totalWeightN: 4.0 },
      },
    ],
    guidedSteps: [
      {
        id: 'par-step-1',
        stepNumber: 1,
        title: 'Set Tension Force P on Left Pulley (3.0 N)',
        instruction:
          'Adjust Force P to 3.0 N (or 300g load) and angle θ₁ to 35.0° on the vector force board.',
      },
      {
        id: 'par-step-2',
        stepNumber: 2,
        title: 'Set Tension Force Q on Right Pulley (4.0 N)',
        instruction:
          'Adjust Force Q to 4.0 N and angle θ₂ to 125.0°. The included angle between forces is θ = 90.0°.',
      },
      {
        id: 'par-step-3',
        stepNumber: 3,
        title: 'Construct the Vector Parallelogram',
        instruction:
          'Enable "Show Vector Parallelogram". Vectors P and Q form adjacent sides OA and OB of the parallelogram.',
      },
      {
        id: 'par-step-4',
        stepNumber: 4,
        title: 'Measure Resultant Diagonal R and Direction α',
        instruction:
          'Read the diagonal OC. For orthogonal forces 3N and 4N, theoretical R = √(3² + 4²) = 5.00 N at angle α ≈ 53.1° from P.',
      },
      {
        id: 'par-step-5',
        stepNumber: 5,
        title: 'Counterbalance with Central Equilibrant Weight S',
        instruction:
          'Attach balancing weight S = 510g (≈ 5.0 N) in the central pan. Verify static equilibrium (percentage error < 1%).',
      },
    ],
    goals: [
      {
        id: 'goal-par-setup',
        description: 'Configure concurrent coplanar forces P and Q on Gravesand’s board.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-par-resultant',
        description: 'Verify resultant magnitude R using analytical formula R = √(P² + Q² + 2PQ cos θ).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-par-equilibrium',
        description: 'Balance central knot with equilibrant force S opposite to R.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Parallelogram Law of Vectors:\n- If two coplanar forces acting simultaneously at a point are represented in magnitude and direction by two adjacent sides of a parallelogram, their resultant is represented in magnitude and direction by the diagonal passing through their common point of action.\n\nFormulas:\n- Resultant Magnitude: R = √(P² + Q² + 2·P·Q·cos θ)\n- Angle with Force P: tan α = (Q·sin θ) / (P + Q·cos θ)\n- Equilibrant Condition: P + Q + S = 0  =>  S = -R\n- Percentage Discrepancy: |R_theoretical - S_observed| / R_theoretical × 100%",
  },
  {
    experimentId: 'limiting-friction',
    title: 'Laws of Limiting Friction',
    subjectId: 'physics',
    allowedEquipmentIds: ['friction-track', 'friction-slider-block'],
    initialObjects: [
      {
        id: 'ft-1',
        equipmentId: 'friction-track',
        title: 'Horizontal Friction Bench',
        x: 60,
        y: 80,
        rotation: 0,
        width: 500,
        height: 200,
        properties: {
          surfacePair: 'wood-on-wood',
          trackLengthCm: 60.0,
        },
        state: { status: 'Horizontal Surface Ready' },
      },
      {
        id: 'fb-slider',
        equipmentId: 'friction-slider-block',
        title: 'Wooden Friction Block',
        x: 140,
        y: 110,
        rotation: 0,
        width: 170,
        height: 120,
        properties: {
          blockMassG: 150.0,
          addedMassG: 50.0,
          panMassG: 20.0,
          addedPanMassG: 50.0,
          contactOrientation: 'broad-side',
        },
        state: {
          normalReactionN: 1.961,
          limitingFrictionN: 0.686,
          appliedPullingForceN: 0.686,
          isMotionInitiated: false,
          frictionForceN: 0.686,
        },
      },
    ],
    guidedSteps: [
      {
        id: 'fric-step-1',
        stepNumber: 1,
        title: 'Inspect Surface Material and Slider Block',
        instruction:
          'Set surface to "Wood on Polished Wood" (μs = 0.35, μk = 0.28). Block tare mass is 150g.',
      },
      {
        id: 'fric-step-2',
        stepNumber: 2,
        title: 'Configure Total Normal Reaction N',
        instruction:
          'Add 50g mass to block (total mass 200g). Normal reaction N = M_total × g = 0.200 × 9.8 = 1.961 N.',
      },
      {
        id: 'fric-step-3',
        stepNumber: 3,
        title: 'Add Pulling Mass in Pan Stepwise',
        instruction:
          'Gradually add masses in pan (20g tare + 40g, 45g, 50g). Observe static friction balancing applied force.',
      },
      {
        id: 'fric-step-4',
        stepNumber: 4,
        title: 'Identify Limiting Friction Threshold (f_s,max)',
        instruction:
          'At total pan mass = 70g (applied force ≈ 0.686 N), motion initiates. Limiting friction f_s,max = μs × N.',
      },
      {
        id: 'fric-step-5',
        stepNumber: 5,
        title: 'Test Area Independence (Broad Face vs Narrow Edge)',
        instruction:
          'Switch contact face to "Narrow Edge" (Area = 20 cm²). Verify that limiting friction remains identical at 0.686 N.',
      },
    ],
    goals: [
      {
        id: 'goal-fric-normal',
        description: 'Vary normal reaction N by adding slotted masses to slider block.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-fric-limit',
        description: 'Determine the threshold pulling mass where sliding motion begins.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-fric-coeff',
        description: 'Verify constant coefficient of static friction μs = f_s,max / N.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Laws of Limiting Friction:\n1. Limiting static friction (f_s,max) is directly proportional to normal reaction (N): f_s,max = μs × N.\n2. The coefficient of static friction depends only on the nature of materials in contact.\n3. Friction is independent of the apparent contact area within normal pressures.\n\nRegimes:\n- Static Regime (F_pull < f_s,max): f = F_pull, a = 0 (equilibrium).\n- Kinetic Regime (F_pull ≥ f_s,max): f_k = μk × N (μk < μs), accelerating motion.",
  },
  {
    experimentId: 'inclined-plane-friction',
    title: 'Friction on an Inclined Plane',
    subjectId: 'physics',
    allowedEquipmentIds: ['inclined-plane-ramp', 'incline-slider-box'],
    initialObjects: [
      {
        id: 'ip-ramp',
        equipmentId: 'inclined-plane-ramp',
        title: 'Adjustable Incline Track',
        x: 60,
        y: 60,
        rotation: 0,
        width: 480,
        height: 320,
        properties: {
          inclineAngleDeg: 15.0,
          surfacePair: 'wood-on-wood',
          pullingEffortGrams: 0.0,
          showResolutions: true,
        },
        state: {
          normalForceN: 1.894,
          parallelGravityN: 0.508,
          angleReposeDeg: 19.29,
          isSlidingDown: false,
        },
      },
      {
        id: 'ip-slider',
        equipmentId: 'incline-slider-box',
        title: 'Slider Block (200g)',
        x: 220,
        y: 160,
        rotation: 0,
        width: 130,
        height: 80,
        properties: {
          blockMassG: 200.0,
          sliderType: 'Wooden Slider Block',
        },
        state: { status: 'Stationary on Incline' },
      },
    ],
    guidedSteps: [
      {
        id: 'inc-step-1',
        stepNumber: 1,
        title: 'Configure Slider Block Mass (200g)',
        instruction:
          'Set slider block mass to 200g on a wooden inclined plane (μs = 0.35).',
      },
      {
        id: 'inc-step-2',
        stepNumber: 2,
        title: 'Slowly Elevate Incline Angle θ',
        instruction:
          'Increase slope angle θ in 1° steps from 10° to 18°. Notice how normal reaction mg cos θ decreases while parallel force mg sin θ increases.',
      },
      {
        id: 'inc-step-3',
        stepNumber: 3,
        title: 'Capture the Angle of Repose (θ_r)',
        instruction:
          'At θ = 19.3°, parallel gravity balances limiting friction: mg sin θ = μs mg cos θ. Tan(19.3°) = 0.35 = μs. Block begins sliding.',
      },
      {
        id: 'inc-step-4',
        stepNumber: 4,
        title: 'Inspect Force Vector Resolution Overlay',
        instruction:
          'Observe the vector breakdown: Normal N = mg cos θ perpendicular to ramp, Tangential F_par = mg sin θ down ramp.',
      },
      {
        id: 'inc-step-5',
        stepNumber: 5,
        title: 'Measure Pulling Effort Required to Ascend Incline',
        instruction:
          'Add counter-mass in pan. Notice effort required to pull block upward: P_up = mg(sin θ + μ cos θ).',
      },
    ],
    goals: [
      {
        id: 'goal-inc-angle',
        description: 'Determine the angle of repose θ_r for the slider-ramp pair.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-inc-repose',
        description: 'Verify the relationship μs = tan θ_r.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-inc-resolution',
        description: 'Analyze perpendicular and parallel components of weight on an incline.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Friction on an Inclined Plane & Angle of Repose:\n- Gravity Resolution:\n  Normal Component (perpendicular to plane): N = m·g·cos θ\n  Tangential Component (down the plane): F_parallel = m·g·sin θ\n\nAngle of Repose (θ_r):\n- The angle at which the object begins to slide down under its own weight without external assistance:\n  m·g·sin θ_r = f_s,max = μs·m·g·cos θ_r\n  =>  tan θ_r = μs  =>  θ_r = arctan(μs)\n\nAscending Incline:\n- Effort to pull up: P_up = m·g·(sin θ + μ·cos θ)",
  },
  {
    experimentId: 'hookes-law',
    title: "Hooke's Law and Spring Constant",
    subjectId: 'physics',
    allowedEquipmentIds: ['helical-spring-stand', 'slotted-mass-hanger'],
    initialObjects: [
      {
        id: 'spring-stand-1',
        equipmentId: 'helical-spring-stand',
        title: 'Helical Spring on Mirror Scale',
        x: 100,
        y: 40,
        rotation: 0,
        width: 280,
        height: 480,
        properties: {
          springConstantNpm: 25.0,
          unstretchedLengthMm: 120.0,
          appliedMassG: 100.0,
          hangerMassG: 50.0,
          elasticLimitN: 6.0,
        },
        state: {
          appliedForceN: 1.471,
          extensionMm: 58.84,
          totalLengthMm: 178.84,
          restoringForceN: -1.471,
          isWithinElasticLimit: true,
          dynamicPeriodSeconds: 0.51,
        },
      },
      {
        id: 'hanger-weights-1',
        equipmentId: 'slotted-mass-hanger',
        title: 'Slotted Mass Hanger',
        x: 440,
        y: 120,
        rotation: 0,
        width: 120,
        height: 180,
        properties: {
          hangerTareG: 50.0,
          discsCount: 2,
        },
        state: { totalMassG: 150.0 },
      },
    ],
    guidedSteps: [
      {
        id: 'hook-step-1',
        stepNumber: 1,
        title: 'Record Unstretched Baseline Pointer Position (L₀)',
        instruction:
          'Observe the red pointer needle on the vertical mirror scale. Initial zero-load position is L₀ = 120.0 mm.',
      },
      {
        id: 'hook-step-2',
        stepNumber: 2,
        title: 'Attach Hanger with Initial Mass (50g)',
        instruction:
          'Suspend the 50g hanger. Force F = 0.050 × 9.8 = 0.49 N. Extension x = F / k = 0.49 / 25 = 19.6 mm.',
      },
      {
        id: 'hook-step-3',
        stepNumber: 3,
        title: 'Add Slotted Masses Stepwise (100g to 250g)',
        instruction:
          'Add 50g slotted discs one by one. Record Total Mass (m), Stretching Force (F = mg), and Pointer Position (L).',
      },
      {
        id: 'hook-step-4',
        stepNumber: 4,
        title: 'Calculate Spring Constant (k = ΔF / Δx)',
        instruction:
          'From slope of Load vs Extension curve, determine spring constant k = 25.0 N/m. Verify linearity.',
      },
      {
        id: 'hook-step-5',
        stepNumber: 5,
        title: 'Observe Dynamic Oscillation Period T = 2π√(m/k)',
        instruction:
          'Displace mass slightly and observe harmonic oscillation period (T ≈ 0.51 s). Verify dynamic spring constant.',
      },
    ],
    goals: [
      {
        id: 'goal-hook-linearity',
        description: 'Verify linear relationship between stretching force F and extension x.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-hook-k',
        description: 'Calculate spring stiffness k = ΔF / Δx from experimental data pairs.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-hook-limit',
        description: 'Confirm operation within elastic proportionality limits.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Hooke's Law and Spring Constant:\n- Principle: Within elastic limits, extension x is directly proportional to stretching force F:\n  F = k · x\n  where k is the spring constant (stiffness in N/m).\n\nFormulas:\n- Stretching Force: F = m_total × g = (m_hanger + m_slotted) × 9.8 m/s²\n- Extension: x = L - L₀\n- Spring Constant: k = ΔF / Δx\n- Elastic Potential Energy: U = ½ k · x²\n- Dynamic Oscillation: T = 2π √((m + m_eff) / k)\n\nAssumptions:\n- Ideal linear elasticity within proportional limit.\n- Spring mass correction m_eff ≈ ⅓ m_spring.\n- No permanent plastic set under permissible laboratory loads.",
  },
  {
    experimentId: 'boyles-law',
    title: "Boyle's Law Verification",
    subjectId: 'physics',
    allowedEquipmentIds: ['boyles-law-cylinder'],
    initialObjects: [
      {
        id: 'boyle-cyl-1',
        equipmentId: 'boyles-law-cylinder',
        title: "Boyle's Law Piston Cylinder & Gauge",
        x: 100,
        y: 60,
        rotation: 0,
        width: 440,
        height: 340,
        properties: {
          volumeMl: 60.0,
          atmosphericPressureKpa: 101.325,
          temperatureC: 25.0,
          gasType: 'Dry Atmospheric Air',
        },
        state: {
          pressureKpa: 101.33,
          pressureAtm: 1.0,
          pressureMmHg: 760.0,
          pvProductKpaMl: 6079.5,
          reciprocalVolumePerMl: 0.01667,
          manometerDeltaHeightMmHg: 0.0,
        },
      },
    ],
    guidedSteps: [
      {
        id: 'boyle-step-1',
        stepNumber: 1,
        title: 'Establish Reference State at Atmospheric Pressure',
        instruction:
          'Set volume V₀ = 60.0 mL. Ambient pressure is P₀ = 101.325 kPa (1.0 atm = 760 mmHg). Initial P × V = 6079.5 kPa·mL.',
      },
      {
        id: 'boyle-step-2',
        stepNumber: 2,
        title: 'Compress Piston to 45.0 mL and Observe Pressure',
        instruction:
          'Move the piston inward to 45.0 mL. Watch the dial pressure gauge rise to ~135.1 kPa (~1.33 atm).',
      },
      {
        id: 'boyle-step-3',
        stepNumber: 3,
        title: 'Compress to Half Volume (30.0 mL)',
        instruction:
          'Compress volume to 30.0 mL. Observe that pressure doubles to 202.7 kPa (2.0 atm = 1520 mmHg). P × V remains constant.',
      },
      {
        id: 'boyle-step-4',
        stepNumber: 4,
        title: 'Expand Piston to 90.0 mL and 120.0 mL',
        instruction:
          'Draw piston outward to 90 mL and 120 mL. Pressure drops to 67.5 kPa (0.67 atm) and 50.7 kPa (0.50 atm).',
      },
      {
        id: 'boyle-step-5',
        stepNumber: 5,
        title: 'Verify P × V Constant and 1/V Linear Relation',
        instruction:
          'Verify that P × V product remains constant across all volumes, and that P versus 1/V is a straight line.',
      },
    ],
    goals: [
      {
        id: 'goal-boyle-pv',
        description: 'Verify that P × V product is constant for isothermal gas compression/expansion.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-boyle-halving',
        description: 'Demonstrate that halving volume doubles absolute gas pressure.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-boyle-linear',
        description: 'Confirm linear relation between pressure P and reciprocal volume 1/V.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Boyle's Law for an Ideal Gas:\n- Statement: For a fixed mass of enclosed gas at constant temperature, absolute pressure is inversely proportional to volume:\n  P ∝ 1/V   =>   P · V = Constant (C)\n\nFormulas:\n- P₁ · V₁ = P₂ · V₂\n- Absolute Pressure: P_total = P_atmospheric + P_gauge = 760 mmHg + Δh_Hg\n- Reciprocal Volume: 1/V (mL⁻¹)\n- Work Done in Isothermal Compression: W = nRT · ln(V₂ / V₁)\n\nGraphical Signatures:\n- P vs V curve: Rectangular hyperbola (isotherm at T = 298 K).\n- P vs 1/V curve: Straight line passing through the origin with slope C = P·V.",
  },
  {
    experimentId: 'resistivity-vi-method',
    title: 'Resistivity of a Wire Using the V-I Method',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'resistance-wire-board',
      'dc-power-supply',
      'dc-battery',
      'dc-ammeter',
      'dc-voltmeter',
      'knife-switch',
      'wire-junction',
    ],
    initialObjects: [
      {
        id: 'wire-board-1',
        equipmentId: 'resistance-wire-board',
        title: 'Resistance Wire & Metre Scale Board',
        x: 80,
        y: 60,
        rotation: 0,
        width: 440,
        height: 260,
        properties: {
          material: 'Constantan',
          lengthCm: 100.0,
          diameterMm: 0.5,
          appliedVoltage: 2.0,
          wireTemperatureC: 25.0,
        },
        state: {
          resistanceOhms: 2.5,
          currentAmps: 0.8,
          resistivityOhmMetre: 4.9e-7,
          crossSectionalAreaM2: 1.9635e-7,
          status: 'Constantan wire: L = 100.0 cm, d = 0.50 mm => R = 2.50 Ω, I = 0.800 A',
        },
      },
      {
        id: 'dc-ps-1',
        equipmentId: 'dc-power-supply',
        title: 'Regulated DC Power Supply',
        x: 550,
        y: 60,
        rotation: 0,
        width: 160,
        height: 140,
        properties: { voltage: 2.0, maxCurrent: 3.0 },
        state: { outputVoltage: 2.0 },
      },
      {
        id: 'ammeter-1',
        equipmentId: 'dc-ammeter',
        title: 'DC Milliammeter / Ammeter',
        x: 550,
        y: 220,
        rotation: 0,
        width: 140,
        height: 140,
        properties: { internalResistance: 0.05, currentRange: '0-3A' },
        state: { current: 0.8 },
      },
      {
        id: 'voltmeter-1',
        equipmentId: 'dc-voltmeter',
        title: 'DC Voltmeter',
        x: 550,
        y: 380,
        rotation: 0,
        width: 140,
        height: 140,
        properties: { internalResistance: 100000, voltageRange: '0-5V' },
        state: { voltage: 2.0 },
      },
    ],
    guidedSteps: [
      {
        id: 'res-step-1',
        stepNumber: 1,
        title: 'Measure Wire Diameter with Screw Gauge',
        instruction:
          'Inspect the specimen wire diameter d = 0.50 mm. The cross-sectional area is A = π(d/2)² = 1.963 × 10⁻⁷ m².',
      },
      {
        id: 'res-step-2',
        stepNumber: 2,
        title: 'Set Active Wire Length on Graduated Scale',
        instruction:
          'Tighten sliding contact posts to set active wire length L = 100.0 cm (1.0 m) along the calibrated metre scale.',
      },
      {
        id: 'res-step-3',
        stepNumber: 3,
        title: 'Apply DC Voltage (V) and Record Current (I)',
        instruction:
          'Set DC supply to 2.0 V. Observe that circuit current reads 0.800 A on the series ammeter.',
      },
      {
        id: 'res-step-4',
        stepNumber: 4,
        title: 'Calculate Resistance from V-I Ratio (Ohm’s Law)',
        instruction:
          'Calculate wire resistance R = V / I = 2.0 V / 0.800 A = 2.50 Ω. Note that resistance scales directly with length L.',
      },
      {
        id: 'res-step-5',
        stepNumber: 5,
        title: 'Calculate Specific Resistance (Resistivity ρ)',
        instruction:
          'Compute resistivity ρ = (R × A) / L = (2.50 × 1.9635×10⁻⁷) / 1.0 = 4.91 × 10⁻⁷ Ω·m, confirming Constantan (Eureka) alloy.',
      },
    ],
    goals: [
      {
        id: 'goal-res-geometry',
        description: 'Accurately measure wire geometry (length L and diameter d) and determine cross-sectional area A.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-res-vi-slope',
        description: 'Verify linear V-I Ohm’s Law relationship and determine wire resistance R = V/I.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-res-resistivity',
        description: 'Compute specific resistance (resistivity ρ = R·A / L) and compare with standard reference tables.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Resistivity of a Wire Using the V-I Method:\n- Principle: By Ohm's Law, current I is proportional to potential difference V across a conductor at constant temperature:\n  R = V / I\n\nSpecific Resistance (Resistivity):\n- Resistance depends on length L, cross-sectional area A, and material resistivity ρ:\n  R = ρ · L / A   =>   ρ = (R · A) / L\n\nFormulas:\n- Cross-sectional Area: A = π · (d / 2)² = π · d² / 4 (m²)\n- Resistance: R = V / I (Ω)\n- Specific Resistance: ρ = (R · A) / L (Ω·m)\n- Temperature Correction: R_T = R₀ · [1 + α · (T - T₀)]\n\nStandard Resistivity Values:\n- Constantan (Eureka): ~4.9 × 10⁻⁷ Ω·m\n- Nichrome: ~1.1 × 10⁻⁶ Ω·m\n- Manganin: ~4.8 × 10⁻⁷ Ω·m\n- Copper: ~1.68 × 10⁻⁸ Ω·m",
  },
  {
    experimentId: 'metre-bridge',
    title: 'Metre Bridge – Determination of Unknown Resistance',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'metre-bridge-board',
      'decade-resistance-box',
      'moving-coil-galvanometer',
      'dc-battery',
      'knife-switch',
    ],
    initialObjects: [
      {
        id: 'metre-bridge-1',
        equipmentId: 'metre-bridge-board',
        title: 'Metre Bridge with Jockey & Scale',
        x: 60,
        y: 60,
        rotation: 0,
        width: 480,
        height: 260,
        properties: {
          knownResistanceR: 5.0,
          unknownResistanceX: 5.0,
          jockeyPositionCm: 50.0,
          bridgeSupplyVoltage: 2.0,
        },
        state: {
          unknownResistanceX: 5.0,
          isBalanced: true,
          galvanometerDeflectionDivisions: 0.0,
          galvanometerDirection: 'center',
          nullPointCm: 50.0,
          calculatedResistanceX: 5.0,
          status: 'BALANCED: Jockey at null point l = 50.0 cm => X = 5.00 Ω',
        },
      },
      {
        id: 'galv-1',
        equipmentId: 'moving-coil-galvanometer',
        title: 'Moving-Coil Galvanometer (30-0-30)',
        x: 560,
        y: 60,
        rotation: 0,
        width: 200,
        height: 200,
        properties: { coilResistanceG: 100.0, totalDivisions: 30, fullScaleCurrentMicroAmps: 600.0 },
        state: { deflectionDivisions: 0.0, status: 'Null Balance: 0 div' },
      },
      {
        id: 'res-box-1',
        equipmentId: 'decade-resistance-box',
        title: 'Standard Resistance Box (R)',
        x: 560,
        y: 280,
        rotation: 0,
        width: 200,
        height: 130,
        properties: { resistance: 5.0, boxType: 'Fractional & Standard (1 - 100 Ω)' },
        state: { resistance: 5.0 },
      },
    ],
    guidedSteps: [
      {
        id: 'mb-step-1',
        stepNumber: 1,
        title: 'Introduce Known Standard Resistance R in Left Gap',
        instruction:
          'Set resistance box R = 5.0 Ω in the left bridge gap. Make sure plugs are tight to eliminate contact resistance.',
      },
      {
        id: 'mb-step-2',
        stepNumber: 2,
        title: 'Connect Unknown Resistor Coil X in Right Gap',
        instruction:
          'Connect the specimen wire coil X across the right gap terminals between central brass strip and right strip.',
      },
      {
        id: 'mb-step-3',
        stepNumber: 3,
        title: 'Verify Opposite Galvanometer Deflections',
        instruction:
          'Tap jockey lightly near l = 5 cm (needle kicks left) and l = 95 cm (needle kicks right) to confirm circuit continuity.',
      },
      {
        id: 'mb-step-4',
        stepNumber: 4,
        title: 'Slide Jockey to Locate Null Balance Point (l)',
        instruction:
          'Slide the knife-edge jockey gently along the 100 cm wire until galvanometer deflection becomes exactly 0 divisions at l = 50.0 cm.',
      },
      {
        id: 'mb-step-5',
        stepNumber: 5,
        title: 'Calculate Unknown Resistance X',
        instruction:
          'Calculate unknown resistance using Wheatstone bridge formula: X = R × (100 - l) / l = 5.0 × (50 / 50) = 5.00 Ω.',
      },
    ],
    goals: [
      {
        id: 'goal-mb-wheatstone',
        description: 'Verify Wheatstone bridge null deflection condition P / Q = R / S at balance.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-mb-null-point',
        description: 'Accurately determine balancing wire length l where galvanometer current Ig = 0.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-mb-calc-x',
        description: 'Calculate unknown resistance X = R·(100 - l) / l with maximum bridge sensitivity near 50 cm.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Metre Bridge (Wheatstone Bridge Principle):\n- Principle: Four resistances P, Q, R, and S form a closed loop. Bridge is balanced when galvanometer current Ig = 0:\n  P / Q = R / S\n\nMetre Bridge Setup:\n- Wire length: L_total = 100 cm\n- Left segment: P = σ · l\n- Right segment: Q = σ · (100 - l)\n- Therefore: (σ · l) / [σ · (100 - l)] = R / X\n  => X = R · (100 - l) / l\n\nPrecautions & End Corrections:\n- Jockey must be pressed gently, never dragged along the wire.\n- Value of R should be chosen so balance point lies between 40 cm and 60 cm for maximum Wheatstone sensitivity.\n- End resistance corrections α and β can be accounted for: X = R · (100 - l + β) / (l + α).",
  },
  {
    experimentId: 'galvanometer-figure-of-merit',
    title: 'Galvanometer Resistance and Figure of Merit',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'moving-coil-galvanometer',
      'decade-resistance-box',
      'dc-battery',
      'knife-switch',
      'standard-resistor',
    ],
    initialObjects: [
      {
        id: 'galv-fom-1',
        equipmentId: 'moving-coil-galvanometer',
        title: 'Deadbeat Moving-Coil Galvanometer',
        x: 70,
        y: 70,
        rotation: 0,
        width: 220,
        height: 220,
        properties: { coilResistanceG: 100.0, totalDivisions: 30, fullScaleCurrentMicroAmps: 600.0 },
        state: {
          deflectionDivisions: 30.0,
          figureOfMeritK: 0.00002,
          calculatedCoilResistanceG: 100.0,
          status: 'Initial deflection θ = 30.0 div (R = 4900 Ω, Key K2 Open)',
        },
      },
      {
        id: 'res-box-high',
        equipmentId: 'decade-resistance-box',
        title: 'High Resistance Box (R)',
        x: 320,
        y: 70,
        rotation: 0,
        width: 210,
        height: 130,
        properties: { resistance: 4900.0, boxType: 'High Resistance (100 - 10,000 Ω)' },
        state: { resistance: 4900.0 },
      },
      {
        id: 'res-box-shunt',
        equipmentId: 'decade-resistance-box',
        title: 'Shunt Resistance Box (S)',
        x: 320,
        y: 230,
        rotation: 0,
        width: 210,
        height: 130,
        properties: { resistance: 100.0, boxType: 'Fractional & Standard (1 - 100 Ω)' },
        state: { resistance: 100.0 },
      },
      {
        id: 'dc-cell-1',
        equipmentId: 'dc-battery',
        title: 'Standard Leclanché Cell (1.5V)',
        x: 560,
        y: 150,
        rotation: 0,
        width: 140,
        height: 140,
        properties: { voltage: 1.5, internalResistance: 0.1 },
        state: { voltage: 1.5 },
      },
    ],
    guidedSteps: [
      {
        id: 'fom-step-1',
        stepNumber: 1,
        title: 'Set High Resistance R with Shunt Key Open',
        instruction:
          'With key K2 open, set high series resistance R = 4900 Ω so that the needle deflects to an even full scale θ = 30 divisions.',
      },
      {
        id: 'fom-step-2',
        stepNumber: 2,
        title: 'Close Shunt Key K2 Across Galvanometer',
        instruction:
          'Close key K2 to introduce parallel shunt resistance S = 100 Ω across the galvanometer coil terminals.',
      },
      {
        id: 'fom-step-3',
        stepNumber: 3,
        title: 'Adjust Shunt S for Half-Deflection (θ / 2)',
        instruction:
          'Adjust S until pointer deflection drops to exactly half of initial deflection: θ / 2 = 15 divisions.',
      },
      {
        id: 'fom-step-4',
        stepNumber: 4,
        title: 'Calculate Galvanometer Coil Resistance G',
        instruction:
          'Compute coil resistance using half-deflection formula: G = (R × S) / (R - S) = (4900 × 100) / (4900 - 100) = 102.1 Ω ≈ 100 Ω.',
      },
      {
        id: 'fom-step-5',
        stepNumber: 5,
        title: 'Determine Figure of Merit (k) and Full-Scale Current (Ig)',
        instruction:
          'Calculate Figure of Merit k = E / [(R + G) × θ] = 1.5 / [(4900 + 100) × 30] = 20.0 µA/div, and Ig = n × k = 30 × 20 µA = 600 µA.',
      },
    ],
    goals: [
      {
        id: 'goal-fom-initial-theta',
        description: 'Obtain steady initial galvanometer deflection θ using high resistance box R.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-fom-half-deflection',
        description: 'Apply shunt resistance S to achieve exact half-deflection θ / 2 and compute coil resistance G.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-fom-figure-of-merit',
        description: 'Calculate Figure of Merit k = E / [(R + G)·θ] and full-scale deflection current Ig = n·k.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Galvanometer Resistance & Figure of Merit (Half-Deflection Method):\n- Principle: In a pivoted moving coil galvanometer, restoring torque balances magnetic torque: C · θ = N · I · A · B\n  => I = (C / NAB) · θ = k · θ\n  where k is the Figure of Merit (current required for unit deflection).\n\nHalf-Deflection Method:\n- When shunt S is open: I₁ = E / (R + G) = k · θ\n- When shunt S is closed: Total current I₂ = E / [R + (GS)/(G+S)]\n  Current through galvanometer: Ig = I₂ · [S / (G + S)] = k · (θ / 2)\n- Setting Ig = ½ I₁ leads to:\n  G = (R · S) / (R - S)\n  Since R ≫ S, G ≈ S\n\nFigure of Merit:\n- k = E / [(R + G) · θ]  (Amperes/division or µA/div)\n- Full-Scale Deflection Current: Ig = n · k  (where n is total scale divisions, typically 30).",
  },
  {
    experimentId: 'galvanometer-voltmeter',
    title: 'Conversion of Galvanometer into a Voltmeter',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'ammeter-voltmeter-calibrator',
      'moving-coil-galvanometer',
      'decade-resistance-box',
      'dc-power-supply',
      'dc-voltmeter',
    ],
    initialObjects: [
      {
        id: 'calibrator-v-1',
        equipmentId: 'ammeter-voltmeter-calibrator',
        title: 'Voltmeter Conversion Calibration Rig',
        x: 60,
        y: 70,
        rotation: 0,
        width: 440,
        height: 280,
        properties: {
          conversionMode: 'voltmeter',
          galvanometerResistanceG: 100.0,
          targetFullScaleRange: 3.0,
          installedResistorValue: 4900.0,
          appliedTestSignal: 1.5,
        },
        state: {
          requiredSeriesResistanceRs: 4900.0,
          effectiveVoltmeterResistance: 5000.0,
          scaleDeflectionDivisions: 15.0,
          measuredVoltage: 1.5,
          isOverload: false,
          status: 'Voltmeter Conversion: Rs = 4900.0 Ω, θ = 15.0 / 30 div (V = 1.50 V)',
        },
      },
      {
        id: 'galv-v-1',
        equipmentId: 'moving-coil-galvanometer',
        title: 'Converted Galvanometer Unit',
        x: 530,
        y: 70,
        rotation: 0,
        width: 220,
        height: 220,
        properties: { coilResistanceG: 100.0, totalDivisions: 30, fullScaleCurrentMicroAmps: 600.0 },
        state: { deflectionDivisions: 15.0, status: 'Reading: 15.0 div (1.50 V)' },
      },
    ],
    guidedSteps: [
      {
        id: 'gv-step-1',
        stepNumber: 1,
        title: 'Identify Galvanometer Parameters',
        instruction:
          'Galvanometer has coil resistance G = 100 Ω, total scale divisions n = 30, and full-scale current Ig = 600 µA (0.0006 A).',
      },
      {
        id: 'gv-step-2',
        stepNumber: 2,
        title: 'Select Desired Voltage Range (V)',
        instruction:
          'Set target maximum voltmeter range V = 3.0 V for measuring DC potential differences.',
      },
      {
        id: 'gv-step-3',
        stepNumber: 3,
        title: 'Calculate Required Series Multiplier Resistance (Rs)',
        instruction:
          'Calculate multiplier resistance: Rs = (V / Ig) - G = (3.0 / 0.0006) - 100 = 5000 - 100 = 4900 Ω.',
      },
      {
        id: 'gv-step-4',
        stepNumber: 4,
        title: 'Connect Multiplier Rs in Series with Galvanometer Coil',
        instruction:
          'Install high multiplier resistance Rs = 4900 Ω in series. Total voltmeter resistance becomes Rv = Rs + G = 5000 Ω.',
      },
      {
        id: 'gv-step-5',
        stepNumber: 5,
        title: 'Calibrate and Verify Against Reference Voltmeter',
        instruction:
          'Apply calibration test voltage 1.5 V. Confirm meter pointer deflects to 15 divisions (half scale), matching 1.50 V exactly.',
      },
    ],
    goals: [
      {
        id: 'goal-gv-calculate-rs',
        description: 'Calculate series multiplier resistance Rs = (V / Ig) - G for the desired voltage range.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-gv-assemble',
        description: 'Assemble converted voltmeter with series multiplier and determine effective resistance Rv = Rs + G.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-gv-calibration',
        description: 'Calibrate readings against standard reference voltmeter and verify overload detection when V > V_max.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Conversion of Galvanometer into a Voltmeter:\n- Principle: A galvanometer is converted into a voltmeter by connecting a high resistance (Rs) in series with its coil.\n\nFormulas:\n- Full Scale Voltage: V = Ig · (G + Rs)\n- Required Multiplier: Rs = (V / Ig) - G\n- Total Voltmeter Resistance: Rv = Rs + G\n- Voltage Sensitivity: Sv = θ / V = 1 / (Rv · k)\n\nCharacteristics of an Ideal Voltmeter:\n- An ideal voltmeter has infinite electrical resistance (Rv → ∞) so that it draws negligible current from the circuit under test.",
  },
  {
    experimentId: 'galvanometer-ammeter',
    title: 'Conversion of Galvanometer into an Ammeter',
    subjectId: 'physics',
    allowedEquipmentIds: [
      'ammeter-voltmeter-calibrator',
      'moving-coil-galvanometer',
      'decade-resistance-box',
      'dc-power-supply',
      'dc-ammeter',
    ],
    initialObjects: [
      {
        id: 'calibrator-a-1',
        equipmentId: 'ammeter-voltmeter-calibrator',
        title: 'Ammeter Conversion Calibration Rig',
        x: 60,
        y: 70,
        rotation: 0,
        width: 440,
        height: 280,
        properties: {
          conversionMode: 'ammeter',
          galvanometerResistanceG: 100.0,
          targetFullScaleRange: 3.0,
          installedResistorValue: 0.020004,
          appliedTestSignal: 1.5,
        },
        state: {
          requiredShuntResistanceS: 0.020004,
          effectiveAmmeterResistance: 0.02,
          scaleDeflectionDivisions: 15.0,
          measuredCurrent: 1.5,
          isOverload: false,
          status: 'Ammeter Conversion: Shunt S = 0.02000 Ω, θ = 15.0 / 30 div (I = 1.50 A)',
        },
      },
      {
        id: 'galv-a-1',
        equipmentId: 'moving-coil-galvanometer',
        title: 'Converted Galvanometer Unit',
        x: 530,
        y: 70,
        rotation: 0,
        width: 220,
        height: 220,
        properties: { coilResistanceG: 100.0, totalDivisions: 30, fullScaleCurrentMicroAmps: 600.0 },
        state: { deflectionDivisions: 15.0, status: 'Reading: 15.0 div (1.50 A)' },
      },
    ],
    guidedSteps: [
      {
        id: 'ga-step-1',
        stepNumber: 1,
        title: 'Identify Galvanometer Parameters',
        instruction:
          'Galvanometer has coil resistance G = 100 Ω, total scale divisions n = 30, and full-scale current Ig = 600 µA (0.0006 A).',
      },
      {
        id: 'ga-step-2',
        stepNumber: 2,
        title: 'Select Desired Current Range (I)',
        instruction:
          'Set target ammeter full-scale range I = 3.0 A for measuring branch circuit currents.',
      },
      {
        id: 'ga-step-3',
        stepNumber: 3,
        title: 'Calculate Required Parallel Shunt Resistance (S)',
        instruction:
          'Calculate shunt resistance: S = (Ig × G) / (I - Ig) = (0.0006 × 100) / (3.0 - 0.0006) = 0.06 / 2.9994 ≈ 0.020004 Ω.',
      },
      {
        id: 'ga-step-4',
        stepNumber: 4,
        title: 'Connect Shunt S in Parallel Across Galvanometer Coil',
        instruction:
          'Connect the low-resistance shunt strip in parallel. Effective ammeter resistance is RA = (G × S) / (G + S) ≈ 0.0200 Ω.',
      },
      {
        id: 'ga-step-5',
        stepNumber: 5,
        title: 'Calibrate and Verify Against Reference Ammeter',
        instruction:
          'Apply calibration test current 1.5 A. Confirm meter pointer deflects to 15 divisions (half scale), matching 1.50 A exactly.',
      },
    ],
    goals: [
      {
        id: 'goal-ga-calculate-shunt',
        description: 'Calculate required shunt resistance S = (Ig·G) / (I - Ig) for the chosen current range.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-ga-assemble',
        description: 'Assemble converted ammeter with parallel shunt and determine effective resistance RA = (G·S)/(G+S).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-ga-calibration',
        description: 'Calibrate readings against standard reference ammeter and verify overload detection when I > I_max.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Conversion of Galvanometer into an Ammeter:\n- Principle: A galvanometer is converted into an ammeter by connecting a low resistance (shunt S) in parallel with its coil.\n\nFormulas:\n- Potential Difference Across Coil and Shunt:\n  Ig · G = (I - Ig) · S\n  => S = (Ig · G) / (I - Ig)\n- Total Ammeter Resistance:\n  RA = (G · S) / (G + S) ≈ S (since S ≪ G)\n- Current Sensitivity: Si = θ / I = n / I\n\nCharacteristics of an Ideal Ammeter:\n- An ideal ammeter has zero electrical resistance (RA → 0) so that connecting it in series does not disturb the circuit current.",
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

    // 10. Parallelogram Law of Vectors Simulation
    const forceBoards = objects.filter((o) => o.equipmentId === 'gravesand-force-board');
    for (const fb of forceBoards) {
      const p = Number(fb.properties.forceP ?? 3.0);
      const angleP = Number(fb.properties.anglePDeg ?? 35.0);
      const q = Number(fb.properties.forceQ ?? 4.0);
      const angleQ = Number(fb.properties.angleQDeg ?? 125.0);
      const balMassG = Number(fb.properties.balancingMassGrams ?? 509.8);

      const vecRes = calculateVectorAddition({
        forceP: p,
        anglePDeg: angleP,
        forceQ: q,
        angleQDeg: angleQ,
        balancingMassGrams: balMassG,
      });

      updates[fb.id] = {
        forceP: vecRes.forceP,
        anglePDeg: vecRes.anglePDeg,
        forceQ: vecRes.forceQ,
        angleQDeg: vecRes.angleQDeg,
        includedAngleDeg: vecRes.includedAngleDeg,
        resultantMagnitudeN: vecRes.resultantMagnitude,
        resultantAngleDeg: vecRes.resultantAngleDeg,
        angleAlphaDeg: vecRes.angleAlphaDeg,
        resultantComponentX: vecRes.resultantComponentX,
        resultantComponentY: vecRes.resultantComponentY,
        equilibrantN: vecRes.equilibrantMagnitude,
        equilibrantAngleDeg: vecRes.equilibrantAngleDeg,
        percentageError: vecRes.percentageError,
        isBalanced: vecRes.isEquilibriumValid,
        status: vecRes.isEquilibriumValid
          ? `EQUILIBRIUM VERIFIED: R = ${vecRes.resultantMagnitude} N at ${vecRes.resultantAngleDeg}° (Error: ${vecRes.percentageError}%)`
          : `Imbalanced Knot: R = ${vecRes.resultantMagnitude} N, Equilibrant = ${vecRes.experimentalBalancingForceN} N (Error: ${vecRes.percentageError}%)`,
      };

      messages.push(
        `Vector Board: P = ${p} N (${angleP}°), Q = ${q} N (${angleQ}°), θ = ${vecRes.includedAngleDeg}° => Resultant R = ${vecRes.resultantMagnitude} N at ${vecRes.resultantAngleDeg}°`
      );
    }

    // 11. Laws of Limiting Friction Simulation
    const frictionTracks = objects.filter((o) => o.equipmentId === 'friction-track');
    const frictionBlocks = objects.filter((o) => o.equipmentId === 'friction-slider-block');

    for (const fb of frictionBlocks) {
      const parentTrack = frictionTracks[0];
      const surfacePair = (parentTrack ? String(parentTrack.properties.surfacePair ?? 'wood-on-wood') : 'wood-on-wood') as SurfacePair;
      const blockMassG = Number(fb.properties.blockMassG ?? 150.0);
      const addedMassG = Number(fb.properties.addedMassG ?? 50.0);
      const panMassG = Number(fb.properties.panMassG ?? 20.0);
      const addedPanMassG = Number(fb.properties.addedPanMassG ?? 50.0);
      const orientation = String(fb.properties.contactOrientation ?? 'broad-side') as 'broad-side' | 'narrow-edge';

      const fricRes = calculateLimitingFriction({
        blockMassGrams: blockMassG,
        addedMassGrams: addedMassG,
        panMassGrams: panMassG,
        addedPanMassGrams: addedPanMassG,
        surfacePair,
        contactOrientation: orientation,
      });

      updates[fb.id] = {
        totalBlockMassKg: fricRes.totalBlockMassKg,
        normalReactionN: fricRes.normalReactionN,
        staticCoeff: fricRes.staticCoeff,
        kineticCoeff: fricRes.kineticCoeff,
        limitingFrictionN: fricRes.limitingFrictionN,
        appliedPullingForceN: fricRes.appliedPullingForceN,
        isMotionInitiated: fricRes.isMotionInitiated,
        frictionForceN: fricRes.frictionForceN,
        netForceN: fricRes.netForceN,
        accelerationMs2: fricRes.accelerationMs2,
        contactAreaCm2: fricRes.contactAreaCm2,
        status: fricRes.isMotionInitiated
          ? `SLIDING ACCELERATION: a = ${fricRes.accelerationMs2.toFixed(2)} m/s² (f_k = ${fricRes.frictionForceN.toFixed(2)} N)`
          : `STATIC EQUILIBRIUM: f_s = ${fricRes.frictionForceN.toFixed(2)} N (Limiting f_s,max = ${fricRes.limitingFrictionN.toFixed(2)} N)`,
      };

      if (parentTrack) {
        updates[parentTrack.id] = {
          activeSurface: surfacePair,
          muStatic: fricRes.staticCoeff,
          muKinetic: fricRes.kineticCoeff,
          status: `Active Track: ${surfacePair} (μs = ${fricRes.staticCoeff}, μk = ${fricRes.kineticCoeff})`,
        };
      }

      messages.push(
        `Friction: N = ${fricRes.normalReactionN.toFixed(2)} N, Applied = ${fricRes.appliedPullingForceN.toFixed(2)} N, Limit = ${fricRes.limitingFrictionN.toFixed(2)} N => ${fricRes.isMotionInitiated ? 'Moving' : 'Static'}`
      );
    }

    // 12. Friction on an Inclined Plane Simulation
    const inclinedRamps = objects.filter((o) => o.equipmentId === 'inclined-plane-ramp');
    const inclineSliders = objects.filter((o) => o.equipmentId === 'incline-slider-box');

    for (const ramp of inclinedRamps) {
      const slider = inclineSliders[0];
      const blockMassG = slider ? Number(slider.properties.blockMassG ?? 200.0) : 200.0;
      const angleDeg = Number(ramp.properties.inclineAngleDeg ?? 20.0);
      const surfacePair = String(ramp.properties.surfacePair ?? 'wood-on-wood') as SurfacePair;
      const effortG = Number(ramp.properties.pullingEffortGrams ?? 0.0);

      const incRes = calculateInclinedPlanePhysics({
        blockMassGrams: blockMassG,
        inclineAngleDeg: angleDeg,
        surfacePair,
        pullingEffortGrams: effortG,
      });

      updates[ramp.id] = {
        inclineAngleDeg: incRes.inclineAngleDeg,
        normalForceN: incRes.normalForceN,
        parallelGravityN: incRes.parallelGravityN,
        staticCoeff: incRes.staticCoeff,
        kineticCoeff: incRes.kineticCoeff,
        limitingFrictionN: incRes.limitingFrictionN,
        angleReposeDeg: incRes.angleReposeDeg,
        isSlidingDownSpontaneously: incRes.isSlidingDownSpontaneously,
        downwardFrictionN: incRes.downwardFrictionN,
        netDownwardForceN: incRes.netDownwardForceN,
        downwardAccelerationMs2: incRes.downwardAccelerationMs2,
        minimumEffortToPullUpN: incRes.minimumEffortToPullUpN,
        appliedEffortN: incRes.appliedEffortN,
        isMovingUpwards: incRes.isMovingUpwards,
        status: incRes.isSlidingDownSpontaneously
          ? `SLIDING DOWNWARD (θ = ${incRes.inclineAngleDeg}° > θ_repose = ${incRes.angleReposeDeg}°, a = ${incRes.downwardAccelerationMs2.toFixed(2)} m/s²)`
          : incRes.isMovingUpwards
          ? `MOVING UPWARD (Effort = ${incRes.appliedEffortN.toFixed(2)} N ≥ ${incRes.minimumEffortToPullUpN.toFixed(2)} N)`
          : `STATIONARY ON INCLINE (θ = ${incRes.inclineAngleDeg}° < θ_repose = ${incRes.angleReposeDeg}°)`,
      };

      if (slider) {
        updates[slider.id] = {
          normalForceN: incRes.normalForceN,
          parallelForceN: incRes.parallelGravityN,
          status: incRes.isSlidingDownSpontaneously
            ? 'Sliding Downward'
            : incRes.isMovingUpwards
            ? 'Ascending Incline'
            : 'Static on Slope',
        };
      }

      messages.push(
        `Inclined Plane: θ = ${angleDeg}°, θ_repose = ${incRes.angleReposeDeg}°, N = ${incRes.normalForceN.toFixed(2)} N, F_par = ${incRes.parallelGravityN.toFixed(2)} N`
      );
    }

    // 13. Hooke's Law and Spring Constant Simulation
    const springStands = objects.filter((o) => o.equipmentId === 'helical-spring-stand');
    const springHangers = objects.filter((o) => o.equipmentId === 'slotted-mass-hanger');

    for (const ss of springStands) {
      const k = Number(ss.properties.springConstantNpm ?? 25.0);
      const appliedMassG = Number(ss.properties.appliedMassG ?? 100.0);
      const hangerMassG = Number(ss.properties.hangerMassG ?? 50.0);
      const unstretchedMm = Number(ss.properties.unstretchedLengthMm ?? 120.0);
      const elasticLimitN = Number(ss.properties.elasticLimitN ?? 6.0);

      const hookeRes = calculateHookesLaw({
        springConstantNpm: k,
        appliedMassGrams: appliedMassG,
        hangerMassGrams: hangerMassG,
        unstretchedLengthMm: unstretchedMm,
        elasticLimitNewtons: elasticLimitN,
      });

      updates[ss.id] = {
        springConstantNpm: hookeRes.springConstantNpm,
        totalSuspendedMassGrams: hookeRes.totalSuspendedMassGrams,
        appliedForceN: hookeRes.appliedForceN,
        extensionMm: hookeRes.extensionMm,
        totalLengthMm: hookeRes.totalLengthMm,
        restoringForceN: hookeRes.restoringForceN,
        elasticPotentialEnergyJoules: hookeRes.elasticPotentialEnergyJoules,
        isWithinElasticLimit: hookeRes.isWithinElasticLimit,
        isPlasticDeformation: hookeRes.isPlasticDeformation,
        dynamicPeriodSeconds: hookeRes.dynamicPeriodSeconds,
        dynamicFrequencyHz: hookeRes.dynamicFrequencyHz,
        status: hookeRes.isPlasticDeformation
          ? `PLASTIC DEFORMATION! Load exceeds yield limit (${hookeRes.appliedForceN.toFixed(2)} N > ${elasticLimitN} N)`
          : `ELASTIC EQUILIBRIUM: F = ${hookeRes.appliedForceN.toFixed(2)} N, Extension x = ${hookeRes.extensionMm.toFixed(1)} mm (k = ${k} N/m)`,
      };

      for (const sh of springHangers) {
        updates[sh.id] = {
          totalMassG: hookeRes.totalSuspendedMassGrams,
          totalForceN: hookeRes.appliedForceN,
          status: `Hanger Load: ${hookeRes.totalSuspendedMassGrams} g (${hookeRes.appliedForceN.toFixed(2)} N)`,
        };
      }

      messages.push(
        `Hooke's Law: Load = ${hookeRes.totalSuspendedMassGrams} g (F = ${hookeRes.appliedForceN.toFixed(2)} N) => Extension x = ${hookeRes.extensionMm.toFixed(1)} mm (L = ${hookeRes.totalLengthMm.toFixed(1)} mm)`
      );
    }

    // 14. Boyle's Law Simulation
    const boyleCylinders = objects.filter((o) => o.equipmentId === 'boyles-law-cylinder');

    for (const bc of boyleCylinders) {
      const vol = Number(bc.properties.volumeMl ?? 60.0);
      const pAtm = Number(bc.properties.atmosphericPressureKpa ?? 101.325);
      const tempC = Number(bc.properties.temperatureC ?? 25.0);
      const tempK = tempC + 273.15;

      const boyleRes = calculateBoylesLaw({
        volumeMl: vol,
        atmosphericPressureKpa: pAtm,
        temperatureKelvin: tempK,
        referenceVolumeMl: 60.0,
      });

      updates[bc.id] = {
        volumeMl: boyleRes.volumeMl,
        volumeLiters: boyleRes.volumeLiters,
        reciprocalVolumePerMl: boyleRes.reciprocalVolumePerMl,
        reciprocalVolumePerLiter: boyleRes.reciprocalVolumePerLiter,
        pressureKpa: boyleRes.pressureKpa,
        pressureAtm: boyleRes.pressureAtm,
        pressureMmHg: boyleRes.pressureMmHg,
        manometerDeltaHeightMmHg: boyleRes.manometerDeltaHeightMmHg,
        pvProductKpaMl: boyleRes.pvProductKpaMl,
        pvProductJoules: boyleRes.pvProductJoules,
        temperatureKelvin: boyleRes.temperatureKelvin,
        status: `V = ${boyleRes.volumeMl} mL => P = ${boyleRes.pressureKpa.toFixed(1)} kPa (${boyleRes.pressureAtm.toFixed(2)} atm) | P·V = ${boyleRes.pvProductKpaMl.toFixed(0)} kPa·mL`,
      };

      messages.push(
        `Boyle's Law: V = ${boyleRes.volumeMl} mL => P = ${boyleRes.pressureKpa.toFixed(1)} kPa (${boyleRes.pressureAtm.toFixed(2)} atm), P·V = ${boyleRes.pvProductKpaMl.toFixed(0)} kPa·mL`
      );
    }

    // 15. Resistivity of Wire (V-I Method) Simulation
    const wireBoards = objects.filter((o) => o.equipmentId === 'resistance-wire-board');
    for (const wb of wireBoards) {
      const lengthCm = Number(wb.properties.wireLengthCm ?? wb.properties.lengthCm ?? 100.0);
      const diameterMm = Number(wb.properties.wireDiameterMm ?? wb.properties.diameterMm ?? 0.5);
      const material = (wb.properties.material as WireMaterial) ?? 'constantan';
      const appliedVoltage = Number(wb.properties.appliedVoltage ?? 2.0);
      const wireTempC = Number(wb.properties.wireTemperatureC ?? 25.0);

      const res = calculateWireResistivity({
        wireLengthCm: lengthCm,
        wireDiameterMm: diameterMm,
        material,
        appliedVoltageVolts: appliedVoltage,
        temperatureC: wireTempC,
      });

      updates[wb.id] = {
        resistanceOhms: res.calculatedResistanceOhms,
        currentAmps: res.measuredCurrentAmps,
        crossSectionalAreaM2: res.crossSectionalAreaM2,
        resistivityOhmMetre: res.calculatedResistivityOhmMeter,
        powerDissipatedWatts: res.measuredVoltageVolts * res.measuredCurrentAmps,
        status: `${res.materialName} Wire: L = ${lengthCm.toFixed(1)} cm, d = ${diameterMm.toFixed(2)} mm => R = ${res.calculatedResistanceOhms.toFixed(2)} Ω, I = ${res.measuredCurrentAmps.toFixed(3)} A (ρ = ${res.calculatedResistivityOhmMeter.toExponential(3)} Ω·m)`,
      };

      const ammeters = objects.filter((o) => o.equipmentId === 'dc-ammeter');
      for (const am of ammeters) {
        updates[am.id] = {
          current: res.measuredCurrentAmps,
          status: `Reading: ${res.measuredCurrentAmps.toFixed(3)} A`,
        };
      }
      const voltmeters = objects.filter((o) => o.equipmentId === 'dc-voltmeter');
      for (const vm of voltmeters) {
        updates[vm.id] = {
          voltage: res.measuredVoltageVolts,
          status: `Reading: ${res.measuredVoltageVolts.toFixed(2)} V`,
        };
      }

      messages.push(
        `Wire Resistivity: ${res.materialName} (L = ${lengthCm.toFixed(1)} cm, d = ${diameterMm.toFixed(2)} mm) => R = ${res.calculatedResistanceOhms.toFixed(2)} Ω, ρ = ${res.calculatedResistivityOhmMeter.toExponential(3)} Ω·m`
      );
    }

    // 16. Metre Bridge Simulation
    const metreBridges = objects.filter((o) => o.equipmentId === 'metre-bridge-board');
    for (const mb of metreBridges) {
      const knownR = Number(mb.properties.knownResistanceR ?? 5.0);
      const unknownX = Number(mb.properties.unknownResistanceX ?? 5.0);
      const jockeyPos = Number(mb.properties.jockeyPositionCm ?? 50.0);
      const supplyV = Number(mb.properties.bridgeSupplyVoltage ?? mb.properties.supplyVoltage ?? 2.0);

      const mbRes = calculateMetreBridge({
        knownResistanceR: knownR,
        unknownResistanceX: unknownX,
        jockeyPositionCm: jockeyPos,
        supplyVoltageVolts: supplyV,
      });

      const directionStr =
        mbRes.balanceStatus === 'null-balanced'
          ? 'center'
          : mbRes.balanceStatus === 'deflected-left'
            ? 'left'
            : 'right';

      updates[mb.id] = {
        unknownResistanceX: mbRes.unknownResistanceX,
        isBalanced: mbRes.isBalanced,
        galvanometerDeflectionDivisions: mbRes.galvanometerDeflectionDivisions,
        galvanometerDirection: directionStr,
        nullPointCm: mbRes.nullBalanceLengthCm,
        calculatedResistanceX: mbRes.calculatedUnknownX,
        status: mbRes.isBalanced
          ? `BALANCED NULL POINT: l = ${mbRes.jockeyPositionCm.toFixed(1)} cm => X = ${mbRes.calculatedUnknownX.toFixed(2)} Ω (Ig = 0)`
          : `Jockey at ${mbRes.jockeyPositionCm.toFixed(1)} cm: Deflection ${directionStr.toUpperCase()} (${Math.abs(mbRes.galvanometerDeflectionDivisions).toFixed(1)} div, null at ${mbRes.nullBalanceLengthCm.toFixed(1)} cm)`,
      };

      const galvanometers = objects.filter((o) => o.equipmentId === 'moving-coil-galvanometer');
      for (const g of galvanometers) {
        updates[g.id] = {
          deflectionDivisions: mbRes.galvanometerDeflectionDivisions,
          status: mbRes.isBalanced
            ? 'Null Balance: 0.0 div'
            : `Deflection: ${mbRes.galvanometerDeflectionDivisions.toFixed(1)} div (${directionStr})`,
        };
      }

      messages.push(
        `Metre Bridge: Jockey at ${mbRes.jockeyPositionCm.toFixed(1)} cm (Null at ${mbRes.nullBalanceLengthCm.toFixed(1)} cm) => Deflection: ${mbRes.galvanometerDeflectionDivisions.toFixed(1)} div, Calculated X = ${mbRes.calculatedUnknownX.toFixed(2)} Ω`
      );
    }

    // 17. Galvanometer Resistance & Figure of Merit (Half Deflection)
    const calibrators = objects.filter((o) => o.equipmentId === 'ammeter-voltmeter-calibrator');
    const galvFomObjects = objects.filter(
      (o) => o.equipmentId === 'moving-coil-galvanometer' && metreBridges.length === 0 && calibrators.length === 0
    );
    const highBox = objects.find(
      (o) => o.equipmentId === 'decade-resistance-box' && String(o.properties.boxType).includes('High')
    );
    const shuntBox = objects.find(
      (o) => o.equipmentId === 'decade-resistance-box' && String(o.properties.boxType).includes('Fractional')
    );
    const knifeSwitches = objects.filter((o) => o.equipmentId === 'knife-switch');
    const shuntKeyClosed = knifeSwitches.some(
      (k) => k.properties.closed === true || k.state?.isClosed === true
    );

    for (const g of galvFomObjects) {
      const gCoil = Number(g.properties.coilResistanceG ?? 100.0);
      const totalDiv = Number(g.properties.totalDivisions ?? 30);
      const highR = Number(highBox?.properties.resistance ?? g.properties.highResistanceBoxR ?? 4900.0);
      const shuntS = Number(shuntBox?.properties.resistance ?? g.properties.lowShuntResistanceS ?? 100.0);
      const isClosed = Boolean(g.properties.isShuntKeyClosed ?? shuntKeyClosed);
      const battery = objects.find((o) => o.equipmentId === 'dc-battery');
      const emf = Number(battery?.properties.voltage ?? 1.5);

      const fomRes = calculateGalvanometerFom({
        galvanometerTrueResistanceG: gCoil,
        figureOfMeritK: 2.0e-5,
        scaleDivisionsN: totalDiv,
        highResistanceBoxR: highR,
        lowShuntResistanceS: shuntS,
        isShuntKeyClosed: isClosed,
        batteryEmfVolts: emf,
      });

      const currentDeflection = isClosed
        ? fomRes.halfDeflectionThetaPrimeDivisions
        : fomRes.fullDeflectionThetaDivisions;

      updates[g.id] = {
        deflectionDivisions: currentDeflection,
        calculatedCoilResistanceG: fomRes.calculatedGalvanometerResistanceG,
        halfDeflectionResistanceS: shuntS,
        figureOfMeritK: fomRes.calculatedFigureOfMeritK,
        fullScaleCurrentMicroAmps: fomRes.fullScaleCurrentMicroAmps,
        currentMicroAmps: fomRes.galvanometerCurrentMicroAmps,
        status: `θ = ${currentDeflection.toFixed(1)} div, G = ${fomRes.calculatedGalvanometerResistanceG.toFixed(1)} Ω, k = ${(fomRes.calculatedFigureOfMeritK * 1e6).toFixed(1)} µA/div`,
      };

      messages.push(
        `Galvanometer FOM: R = ${highR} Ω, S = ${shuntS} Ω (Key ${isClosed ? 'CLOSED' : 'OPEN'}) => θ = ${currentDeflection.toFixed(1)} div, G = ${fomRes.calculatedGalvanometerResistanceG.toFixed(1)} Ω, k = ${(fomRes.calculatedFigureOfMeritK * 1e6).toFixed(1)} µA/div`
      );
    }

    // 18. Meter Conversion & Calibration Simulation
    for (const cal of calibrators) {
      const mode = (cal.properties.conversionMode as 'voltmeter' | 'ammeter') ?? 'voltmeter';
      const gCoil = Number(cal.properties.galvanometerResistanceG ?? 100.0);
      const range = Number(cal.properties.targetFullScaleRange ?? 3.0);
      const installedR = Number(
        cal.properties.installedResistorValue ?? (mode === 'voltmeter' ? 4900.0 : 0.020004)
      );
      const testSignal = Number(cal.properties.appliedTestSignal ?? 1.5);

      if (mode === 'voltmeter') {
        const vRes = calculateGalvanometerToVoltmeter({
          galvanometerResistanceG: gCoil,
          figureOfMeritK: 2.0e-5,
          scaleDivisionsN: 30,
          targetMaxVoltageRangeVolts: range,
          installedSeriesResistanceRs: installedR,
          appliedTestVoltageVolts: testSignal,
        });

        updates[cal.id] = {
          requiredSeriesResistanceRs: vRes.requiredSeriesResistanceRs,
          effectiveVoltmeterResistance: vRes.totalMeterResistanceOhms,
          scaleDeflectionDivisions: vRes.galvanometerDeflectionDivisions,
          measuredVoltage: vRes.measuredVoltageVolts,
          isOverload: vRes.isOverloaded,
          status: vRes.isOverloaded
            ? `OVERLOAD! Applied voltage (${testSignal.toFixed(2)} V) exceeds range (${range.toFixed(1)} V)`
            : `Voltmeter: Rs = ${vRes.requiredSeriesResistanceRs.toFixed(1)} Ω, θ = ${vRes.galvanometerDeflectionDivisions.toFixed(1)} div (V = ${vRes.measuredVoltageVolts.toFixed(2)} V, Rv = ${vRes.totalMeterResistanceOhms.toFixed(0)} Ω)`,
        };

        if (vRes.isOverloaded) {
          warnings.push(
            `Voltmeter Overload: Applied ${testSignal.toFixed(2)} V exceeds full-scale limit ${range.toFixed(1)} V.`
          );
        }

        const calGalvs = objects.filter((o) => o.equipmentId === 'moving-coil-galvanometer');
        for (const g of calGalvs) {
          updates[g.id] = {
            deflectionDivisions: vRes.galvanometerDeflectionDivisions,
            status: `Reading: ${vRes.galvanometerDeflectionDivisions.toFixed(1)} div (${vRes.measuredVoltageVolts.toFixed(2)} V)`,
          };
        }

        messages.push(
          `Voltmeter Calibration: Rs = ${vRes.requiredSeriesResistanceRs.toFixed(1)} Ω => Test ${testSignal.toFixed(2)} V yields ${vRes.galvanometerDeflectionDivisions.toFixed(1)} div`
        );
      } else {
        const aRes = calculateGalvanometerToAmmeter({
          galvanometerResistanceG: gCoil,
          figureOfMeritK: 2.0e-5,
          scaleDivisionsN: 30,
          targetMaxCurrentRangeAmps: range,
          installedShuntResistanceS: installedR,
          appliedCircuitCurrentAmps: testSignal,
        });

        updates[cal.id] = {
          requiredShuntResistanceS: aRes.requiredShuntResistanceS,
          effectiveAmmeterResistance: aRes.totalAmmeterResistanceOhms,
          scaleDeflectionDivisions: aRes.galvanometerDeflectionDivisions,
          measuredCurrent: aRes.measuredCurrentAmps,
          isOverload: aRes.isOverloaded,
          status: aRes.isOverloaded
            ? `OVERLOAD! Applied current (${testSignal.toFixed(2)} A) exceeds range (${range.toFixed(1)} A)`
            : `Ammeter: Shunt S = ${aRes.requiredShuntResistanceS.toFixed(5)} Ω, θ = ${aRes.galvanometerDeflectionDivisions.toFixed(1)} div (I = ${aRes.measuredCurrentAmps.toFixed(2)} A, Ra = ${aRes.totalAmmeterResistanceOhms.toFixed(3)} Ω)`,
        };

        if (aRes.isOverloaded) {
          warnings.push(
            `Ammeter Overload: Applied ${testSignal.toFixed(2)} A exceeds full-scale limit ${range.toFixed(1)} A.`
          );
        }

        const calGalvs = objects.filter((o) => o.equipmentId === 'moving-coil-galvanometer');
        for (const g of calGalvs) {
          updates[g.id] = {
            deflectionDivisions: aRes.galvanometerDeflectionDivisions,
            status: `Reading: ${aRes.galvanometerDeflectionDivisions.toFixed(1)} div (${aRes.measuredCurrentAmps.toFixed(2)} A)`,
          };
        }

        messages.push(
          `Ammeter Calibration: Shunt S = ${aRes.requiredShuntResistanceS.toFixed(5)} Ω => Test ${testSignal.toFixed(2)} A yields ${aRes.galvanometerDeflectionDivisions.toFixed(1)} div`
        );
      }
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
