import { SubjectLabExtension, ConnectionValidationResult } from './types';
import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';
import {
  createContainerWithSubstance,
  recomputeMixtureProperties,
  STANDARD_ROOM_TEMP,
} from '../chemistry/chemistryEngine';
import { ContainerLiquidState } from '../chemistry/chemistryTypes';

export const REAGENT_OPTIONS = [
  { label: 'Pure Distilled Water (H₂O)', value: 'pure-water' },
  { label: '0.1M Hydrochloric Acid (HCl)', value: 'hcl' },
  { label: '0.1M Sodium Hydroxide (NaOH)', value: 'naoh' },
  { label: 'Fresh Lemon Juice (Citric Acid)', value: 'lemon-juice' },
  { label: 'Dilute Acetic Acid (Vinegar)', value: 'acetic-acid' },
  { label: '0.1M Sodium Bicarbonate (NaHCO₃)', value: 'baking-soda' },
  { label: 'Household Soap Solution', value: 'soap-solution' },
  { label: 'Natural Turmeric Indicator', value: 'turmeric-indicator' },
  { label: 'Natural Red Cabbage Extract', value: 'red-cabbage-indicator' },
  { label: 'Universal Indicator Solution', value: 'universal-indicator' },
  { label: '0.5M Copper(II) Sulphate (CuSO₄)', value: 'cuso4' },
];

export const CHEMISTRY_EQUIPMENT: EquipmentDefinition[] = [
  {
    id: 'borosilicate-beaker',
    name: 'Borosilicate Beaker (250mL)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Standard 250 mL wide-mouth cylindrical borosilicate vessel with pour spout for dissolving and mixing.',
    iconName: 'FlaskConical',
    defaultWidth: 130,
    defaultHeight: 150,
    rotatable: false,
    ports: [
      {
        id: 'top-in',
        name: 'Beaker Rim (Inlet)',
        type: 'fluid-in',
        xOffset: 65,
        yOffset: 0,
        direction: 'north',
        color: '#38bdf8',
      },
      {
        id: 'pour-spout',
        name: 'Pour Spout (Outlet)',
        type: 'fluid-out',
        xOffset: 130,
        yOffset: 25,
        direction: 'east',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Container Capacity',
        type: 'number',
        defaultValue: 250,
        min: 250,
        max: 250,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Liquid Volume',
        type: 'number',
        defaultValue: 100,
        min: 0,
        max: 250,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Contained Liquid',
        type: 'select',
        defaultValue: 'pure-water',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'beaker',
    colorTheme: '#059669',
  },
  {
    id: 'beaker-100ml',
    name: 'Borosilicate Beaker (100mL)',
    subjectId: 'chemistry',
    category: 'container',
    description: 'Compact 100 mL graduated glass beaker ideal for small volume reagent aliquots.',
    iconName: 'FlaskConical',
    defaultWidth: 110,
    defaultHeight: 130,
    rotatable: false,
    ports: [
      {
        id: 'top-in',
        name: 'Beaker Rim (Inlet)',
        type: 'fluid-in',
        xOffset: 55,
        yOffset: 0,
        direction: 'north',
        color: '#38bdf8',
      },
      {
        id: 'pour-spout',
        name: 'Pour Spout (Outlet)',
        type: 'fluid-out',
        xOffset: 110,
        yOffset: 20,
        direction: 'east',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Container Capacity',
        type: 'number',
        defaultValue: 100,
        min: 100,
        max: 100,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Liquid Volume',
        type: 'number',
        defaultValue: 40,
        min: 0,
        max: 100,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Contained Liquid',
        type: 'select',
        defaultValue: 'pure-water',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'beaker',
    colorTheme: '#059669',
  },
  {
    id: 'beaker-50ml',
    name: 'Borosilicate Beaker (50mL)',
    subjectId: 'chemistry',
    category: 'container',
    description: 'Small 50 mL micro-beaker designed for indicator stock and concentrated solutions.',
    iconName: 'FlaskConical',
    defaultWidth: 95,
    defaultHeight: 115,
    rotatable: false,
    ports: [
      {
        id: 'top-in',
        name: 'Beaker Rim (Inlet)',
        type: 'fluid-in',
        xOffset: 47,
        yOffset: 0,
        direction: 'north',
        color: '#38bdf8',
      },
      {
        id: 'pour-spout',
        name: 'Pour Spout (Outlet)',
        type: 'fluid-out',
        xOffset: 95,
        yOffset: 18,
        direction: 'east',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Container Capacity',
        type: 'number',
        defaultValue: 50,
        min: 50,
        max: 50,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Liquid Volume',
        type: 'number',
        defaultValue: 25,
        min: 0,
        max: 50,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Contained Liquid',
        type: 'select',
        defaultValue: 'turmeric-indicator',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'beaker',
    colorTheme: '#059669',
  },
  {
    id: 'conical-flask',
    name: 'Erlenmeyer Conical Flask (250mL)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Conical glass flask with narrow neck designed for swirling and titration without risk of spillage.',
    iconName: 'FlaskConical',
    defaultWidth: 130,
    defaultHeight: 160,
    rotatable: false,
    ports: [
      {
        id: 'mouth',
        name: 'Flask Mouth (Inlet)',
        type: 'fluid-in',
        xOffset: 65,
        yOffset: 0,
        direction: 'north',
        color: '#38bdf8',
      },
      {
        id: 'pour',
        name: 'Lip Pour (Outlet)',
        type: 'fluid-out',
        xOffset: 85,
        yOffset: 15,
        direction: 'east',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Flask Capacity',
        type: 'number',
        defaultValue: 250,
        min: 250,
        max: 250,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Liquid Volume',
        type: 'number',
        defaultValue: 80,
        min: 0,
        max: 250,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Contained Liquid',
        type: 'select',
        defaultValue: 'pure-water',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'flask',
    colorTheme: '#0284c7',
  },
  {
    id: 'graduated-measuring-cylinder',
    name: 'Graduated Measuring Cylinder (100mL)',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Tall vertical calibrated cylinder with 1 mL graduation marks for precise liquid volume transfers.',
    iconName: 'Gauge',
    defaultWidth: 90,
    defaultHeight: 180,
    rotatable: false,
    ports: [
      {
        id: 'top-in',
        name: 'Cylinder Top (Inlet)',
        type: 'fluid-in',
        xOffset: 45,
        yOffset: 0,
        direction: 'north',
        color: '#06b6d4',
      },
      {
        id: 'spout',
        name: 'Pour Spout (Outlet)',
        type: 'fluid-out',
        xOffset: 60,
        yOffset: 10,
        direction: 'east',
        color: '#06b6d4',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Cylinder Capacity',
        type: 'number',
        defaultValue: 100,
        min: 100,
        max: 100,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Volume in Cylinder',
        type: 'number',
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Measured Liquid',
        type: 'select',
        defaultValue: 'pure-water',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'cylinder',
    colorTheme: '#0891b2',
  },
  {
    id: 'test-tube-rack',
    name: 'Borosilicate Test Tube (50mL)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Cylindrical round-bottom glass tube for qualitative chemical reactions and color checks.',
    iconName: 'FlaskConical',
    defaultWidth: 80,
    defaultHeight: 160,
    rotatable: false,
    ports: [
      {
        id: 'mouth',
        name: 'Tube Opening (Inlet)',
        type: 'fluid-in',
        xOffset: 40,
        yOffset: 0,
        direction: 'north',
        color: '#06b6d4',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Tube Capacity',
        type: 'number',
        defaultValue: 50,
        min: 50,
        max: 50,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Volume in Tube',
        type: 'number',
        defaultValue: 15,
        min: 0,
        max: 50,
        step: 1,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Contained Liquid',
        type: 'select',
        defaultValue: 'pure-water',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'test-tube',
    colorTheme: '#0284c7',
  },
  {
    id: 'pasteur-pipette-dropper',
    name: 'Graduated Pipette / Dropper',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Precision dropper with rubber bulb to aspirate and deliver dropwise quantities (0.05 mL per drop).',
    iconName: 'Pipette',
    defaultWidth: 90,
    defaultHeight: 150,
    rotatable: false,
    ports: [
      {
        id: 'tip',
        name: 'Dropper Dispense Tip',
        type: 'fluid-out',
        xOffset: 45,
        yOffset: 150,
        direction: 'south',
        color: '#0284c7',
      },
    ],
    propertyDefinitions: [
      {
        id: 'drawnReagent',
        label: 'Aspirated Reagent',
        type: 'select',
        defaultValue: 'universal-indicator',
        options: REAGENT_OPTIONS,
        editable: true,
      },
      {
        id: 'dropCount',
        label: 'Aspirated Drops',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 1,
        unit: 'drops',
        editable: true,
      },
    ],
    renderType: 'pipette',
    colorTheme: '#0284c7',
  },
  {
    id: 'glass-stirring-rod',
    name: 'Glass Stirring Rod',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Solid borosilicate rod with rounded ends for gentle mixing, reagent dissolution, and decanting.',
    iconName: 'Maximize2',
    defaultWidth: 70,
    defaultHeight: 140,
    rotatable: false,
    ports: [
      {
        id: 'stir-tip',
        name: 'Stir Tip',
        type: 'generic',
        xOffset: 35,
        yOffset: 140,
        direction: 'south',
        color: '#94a3b8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'isStirring',
        label: 'Active Agitation',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'stirrer',
    colorTheme: '#64748b',
  },
  {
    id: 'filter-funnel',
    name: 'Conical Filter Funnel',
    subjectId: 'chemistry',
    category: 'accessory',
    description:
      '60-degree glass cone with narrow stem for gravity filtration and spill-free container pouring.',
    iconName: 'Filter',
    defaultWidth: 100,
    defaultHeight: 120,
    rotatable: false,
    ports: [
      {
        id: 'top-cone',
        name: 'Funnel Mouth',
        type: 'fluid-in',
        xOffset: 50,
        yOffset: 0,
        direction: 'north',
        color: '#38bdf8',
      },
      {
        id: 'stem-tip',
        name: 'Funnel Stem',
        type: 'fluid-out',
        xOffset: 50,
        yOffset: 120,
        direction: 'south',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'filterPaperSeated',
        label: 'Filter Paper Installed',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'funnel',
    colorTheme: '#0284c7',
  },
  {
    id: 'circular-filter-paper',
    name: 'Qualitative Filter Paper Cone',
    subjectId: 'chemistry',
    category: 'accessory',
    description:
      'Medium-porosity folded cellulose paper cone for particulate separation and residue retention.',
    iconName: 'Circle',
    defaultWidth: 80,
    defaultHeight: 80,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'porosityGrade',
        label: 'Filter Grade',
        type: 'string',
        defaultValue: 'Whatman No. 1 (11µm)',
        editable: false,
      },
    ],
    renderType: 'filter-paper',
    colorTheme: '#f8fafc',
  },
  {
    id: 'universal-ph-strip',
    name: 'Universal pH Indicator Test Strip',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Chromatographic paper strip with chemical dye pad that turns specific colors across pH 0-14.',
    iconName: 'Layers',
    defaultWidth: 100,
    defaultHeight: 90,
    rotatable: true,
    ports: [
      {
        id: 'pad',
        name: 'Indicator Test Pad',
        type: 'fluid-in',
        xOffset: 50,
        yOffset: 90,
        direction: 'south',
        color: '#f59e0b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'isDipped',
        label: 'Immersed in Sample',
        type: 'boolean',
        defaultValue: false,
        editable: true,
      },
    ],
    renderType: 'ph-strip',
    colorTheme: '#f59e0b',
  },
  {
    id: 'chemical-thermometer',
    name: 'Laboratory Chemical Thermometer',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Glass mercury/red-alcohol immersion thermometer (-10°C to 110°C) with 0.5°C subdivisions.',
    iconName: 'Thermometer',
    defaultWidth: 60,
    defaultHeight: 180,
    rotatable: false,
    ports: [
      {
        id: 'bulb',
        name: 'Sensor Bulb',
        type: 'generic',
        xOffset: 30,
        yOffset: 175,
        direction: 'south',
        color: '#ef4444',
      },
    ],
    propertyDefinitions: [
      {
        id: 'displayedTemp',
        label: 'Temperature',
        type: 'number',
        defaultValue: 25.0,
        min: -10,
        max: 110,
        step: 0.5,
        unit: '°C',
        editable: true,
      },
    ],
    renderType: 'thermometer',
    colorTheme: '#ef4444',
  },
  {
    id: 'reagent-bottle',
    name: 'Chemical Reagent Stock Bottle (150mL)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Amber glass specimen bottle with ground glass stopper and standard GHS hazard labeling.',
    iconName: 'FlaskConical',
    defaultWidth: 110,
    defaultHeight: 150,
    rotatable: false,
    ports: [
      {
        id: 'pour-neck',
        name: 'Bottle Mouth',
        type: 'fluid-out',
        xOffset: 55,
        yOffset: 10,
        direction: 'north',
        color: '#d97706',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Bottle Capacity',
        type: 'number',
        defaultValue: 150,
        min: 150,
        max: 150,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Remaining Stock',
        type: 'number',
        defaultValue: 120,
        min: 0,
        max: 150,
        step: 10,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Stock Solution',
        type: 'select',
        defaultValue: 'hcl',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'reagent-bottle',
    colorTheme: '#b45309',
  },
  {
    id: 'spotting-plate-cavities',
    name: 'Porcelain Spotting Plate (12 Cavities)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Glazed white ceramic tile with concave depressions for micro-scale colorimetric indicator comparisons.',
    iconName: 'Grid',
    defaultWidth: 180,
    defaultHeight: 120,
    rotatable: false,
    ports: [
      {
        id: 'cavity-1',
        name: 'Cavity A1',
        type: 'fluid-in',
        xOffset: 30,
        yOffset: 35,
        direction: 'north',
        color: '#10b981',
      },
      {
        id: 'cavity-2',
        name: 'Cavity A2',
        type: 'fluid-in',
        xOffset: 90,
        yOffset: 35,
        direction: 'north',
        color: '#10b981',
      },
      {
        id: 'cavity-3',
        name: 'Cavity A3',
        type: 'fluid-in',
        xOffset: 150,
        yOffset: 35,
        direction: 'north',
        color: '#10b981',
      },
      {
        id: 'cavity-4',
        name: 'Cavity B1',
        type: 'fluid-in',
        xOffset: 30,
        yOffset: 85,
        direction: 'south',
        color: '#10b981',
      },
      {
        id: 'cavity-5',
        name: 'Cavity B2',
        type: 'fluid-in',
        xOffset: 90,
        yOffset: 85,
        direction: 'south',
        color: '#10b981',
      },
      {
        id: 'cavity-6',
        name: 'Cavity B3',
        type: 'fluid-in',
        xOffset: 150,
        yOffset: 85,
        direction: 'south',
        color: '#10b981',
      },
    ],
    propertyDefinitions: [
      {
        id: 'cavityMaterial',
        label: 'Porcelain Surface',
        type: 'string',
        defaultValue: 'Glazed White Ceramic',
        editable: false,
      },
    ],
    renderType: 'spotting-plate',
    colorTheme: '#e2e8f0',
  },
  {
    id: 'iron-nail-substrate',
    name: 'Cleaned Iron Nail (Fe)',
    subjectId: 'chemistry',
    category: 'component',
    description:
      'Emery-sandpapered iron nail substrate for single displacement reactions in copper sulphate solution.',
    iconName: 'RefreshCw',
    defaultWidth: 110,
    defaultHeight: 70,
    rotatable: true,
    ports: [
      {
        id: 'tip',
        name: 'Metal Contact Point',
        type: 'generic',
        xOffset: 110,
        yOffset: 35,
        direction: 'east',
        color: '#64748b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'isImmersed',
        label: 'Suspended in Solution',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'immersionTimeMinutes',
        label: 'Immersion Elapsed',
        type: 'number',
        defaultValue: 15,
        min: 0,
        max: 60,
        step: 5,
        unit: 'mins',
        editable: true,
      },
    ],
    renderType: 'generic-box',
    colorTheme: '#475569',
  },
];

export const CHEMISTRY_LAB_DEFINITIONS: LabDefinition[] = [
  {
    experimentId: 'ph-testing',
    title: 'pH Testing with Universal Indicator & Test Strips',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'beaker-100ml',
      'beaker-50ml',
      'borosilicate-beaker',
      'conical-flask',
      'graduated-measuring-cylinder',
      'spotting-plate-cavities',
      'pasteur-pipette-dropper',
      'universal-ph-strip',
      'chemical-thermometer',
      'reagent-bottle',
    ],
    initialObjects: [
      {
        id: 'beaker-hcl',
        equipmentId: 'beaker-100ml',
        title: 'Beaker A: 0.1M HCl',
        x: 60,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 40, reagentSolution: 'hcl' },
        state: { samplePH: 1.0, liquidColor: '#f8fafc', chemicalComposition: '0.1M HCl(aq)' },
      },
      {
        id: 'beaker-naoh',
        equipmentId: 'beaker-100ml',
        title: 'Beaker B: 0.1M NaOH',
        x: 200,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 40, reagentSolution: 'naoh' },
        state: { samplePH: 13.0, liquidColor: '#f8fafc', chemicalComposition: '0.1M NaOH(aq)' },
      },
      {
        id: 'beaker-water',
        equipmentId: 'beaker-100ml',
        title: 'Beaker C: Distilled H₂O',
        x: 340,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 50, reagentSolution: 'pure-water' },
        state: { samplePH: 7.0, liquidColor: '#e0f2fe', chemicalComposition: 'Pure H₂O(l)' },
      },
      {
        id: 'plate-1',
        equipmentId: 'spotting-plate-cavities',
        title: 'Spotting Plate',
        x: 480,
        y: 120,
        rotation: 0,
        width: 180,
        height: 120,
        properties: {},
        state: { cavityStatus: 'Ready for micro-testing' },
      },
      {
        id: 'pipette-1',
        equipmentId: 'pasteur-pipette-dropper',
        title: 'Universal Indicator Dropper',
        x: 690,
        y: 100,
        rotation: 0,
        width: 90,
        height: 150,
        properties: { drawnReagent: 'universal-indicator', dropCount: 3 },
        state: { status: 'Ready to Dispense' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'ph-step-1',
        stepNumber: 1,
        title: 'Inspect Stock Acid, Base, and Neutral Solutions',
        instruction:
          'Observe the three 100mL beakers containing 0.1M Hydrochloric Acid (Strong Acid), 0.1M Sodium Hydroxide (Strong Base), and Pure Distilled Water (Neutral).',
      },
      {
        id: 'ph-step-2',
        stepNumber: 2,
        title: 'Dispense Aliquots into Spotting Plate Cavities',
        instruction:
          'Use the pipette or transfer liquid action to transfer 2-3 drops of each chemical into separate spotting plate cavities.',
      },
      {
        id: 'ph-step-3',
        stepNumber: 3,
        title: 'Add Universal Indicator Droplet',
        instruction:
          'Introduce Universal Indicator into the acid cavity. Observe immediate bright scarlet red shift (pH 1.0). Add to the base cavity and observe deep royal purple/violet (pH 13.0).',
      },
      {
        id: 'ph-step-4',
        stepNumber: 4,
        title: 'Verify Neutral Water Sample',
        instruction:
          'Add Universal Indicator to the water cavity. The emerald green color confirms neutrality (pH 7.0, [H⁺] = [OH⁻] = 10⁻⁷ M).',
      },
      {
        id: 'ph-step-5',
        stepNumber: 5,
        title: 'Test Weak Acids and Bases (Lemon Juice & Baking Soda)',
        instruction:
          'In the inspector, select Lemon Juice (pH ~ 2.2, orange-yellow) and Sodium Bicarbonate (pH ~ 8.4, blue-green) to observe intermediate spectrum transitions.',
      },
      {
        id: 'ph-step-6',
        stepNumber: 6,
        title: 'Record pH Measurements in Experiment Notebook',
        instruction:
          'Log your chemical observations, sample pH values, and color transitions into the notebook. Compare your results with standard pH scale references.',
      },
    ],
    goals: [
      {
        id: 'goal-acid-ph',
        description: 'Test strong acid (0.1M HCl) with indicator (verify pH ~ 1.0, scarlet red).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-base-ph',
        description: 'Test strong base (0.1M NaOH) with indicator (verify pH ~ 13.0, deep violet).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-neutral-ph',
        description: 'Verify pure distilled water is neutral (pH = 7.0, emerald green).',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "pH Scale & Universal Indicator Observations:\n- pH Definition: pH = -log10[H+]  (Kw = [H+][OH-] = 1.0 × 10^-14 at 25°C)\n\nColor Spectrum & Standard Values:\n1. 0.1M Hydrochloric Acid (HCl): pH = 1.0 | Color: Scarlet Red | Strong Mineral Acid\n2. Fresh Lemon Juice (Citric Acid): pH = 2.2 | Color: Red-Orange | Weak Organic Acid\n3. Dilute Vinegar (Acetic Acid): pH = 2.9 | Color: Orange | Weak Organic Acid\n4. Pure Distilled Water (H2O): pH = 7.0 | Color: Emerald Green | Neutral Solvent\n5. 0.1M Sodium Bicarbonate (NaHCO3): pH = 8.4 | Color: Cyan / Blue-Green | Weak Hydrolyzed Base\n6. Soap Solution: pH = 9.2 | Color: Blue | Mild Surfactant Alkali\n7. 0.1M Sodium Hydroxide (NaOH): pH = 13.0 | Color: Deep Royal Purple | Caustic Strong Alkali\n\nEducational Safety Note: Virtual simulation for educational inquiry. Always wear eye protection and gloves in physical laboratories.",
  },
  {
    experimentId: 'natural-indicators',
    title: 'Natural Acid-Base Indicators (Turmeric & Red Cabbage)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'beaker-100ml',
      'beaker-50ml',
      'conical-flask',
      'graduated-measuring-cylinder',
      'spotting-plate-cavities',
      'pasteur-pipette-dropper',
      'glass-stirring-rod',
      'reagent-bottle',
    ],
    initialObjects: [
      {
        id: 'beaker-turmeric',
        equipmentId: 'beaker-100ml',
        title: 'Turmeric Indicator (Curcumin)',
        x: 60,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 35, reagentSolution: 'turmeric-indicator' },
        state: { samplePH: 7.0, liquidColor: '#eab308', indicatorType: 'turmeric' },
      },
      {
        id: 'beaker-cabbage',
        equipmentId: 'beaker-100ml',
        title: 'Red Cabbage Extract (Anthocyanin)',
        x: 200,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 35, reagentSolution: 'red-cabbage-indicator' },
        state: { samplePH: 7.0, liquidColor: '#9333ea', indicatorType: 'red-cabbage' },
      },
      {
        id: 'beaker-naoh',
        equipmentId: 'beaker-100ml',
        title: 'Alkaline Reagent (0.1M NaOH)',
        x: 340,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 40, reagentSolution: 'naoh' },
        state: { samplePH: 13.0, liquidColor: '#f8fafc' },
      },
      {
        id: 'flask-test',
        equipmentId: 'conical-flask',
        title: 'Reaction Conical Flask',
        x: 480,
        y: 95,
        rotation: 0,
        width: 130,
        height: 160,
        properties: { capacityMl: 250, liquidVolume: 30, reagentSolution: 'turmeric-indicator' },
        state: { samplePH: 7.0, liquidColor: '#eab308' },
      },
      {
        id: 'stirrer-1',
        equipmentId: 'glass-stirring-rod',
        title: 'Glass Stirring Rod',
        x: 650,
        y: 110,
        rotation: 0,
        width: 70,
        height: 140,
        properties: { isStirring: true },
        state: { status: 'Ready to Stir' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'nat-step-1',
        stepNumber: 1,
        title: 'Examine Botanical Indicators (Turmeric & Red Cabbage)',
        instruction:
          'Observe the golden yellow Turmeric solution (curcumin pigment) and royal purple Red Cabbage extract (anthocyanin flavylium pigment).',
      },
      {
        id: 'nat-step-2',
        stepNumber: 2,
        title: 'Add Alkaline Base to Turmeric Indicator',
        instruction:
          'Pour or transfer 10 mL of 0.1M NaOH into the Reaction Flask containing Turmeric. Observe the immediate chromic transition from golden yellow to deep reddish-brown (curcumin keto-enol shift in base).',
      },
      {
        id: 'nat-step-3',
        stepNumber: 3,
        title: 'Neutralize with Acid to Restore Yellow Color',
        instruction:
          'Add 0.1M HCl acid to the reddish-brown mixture and stir with the glass rod. As acid neutralizes the base (H⁺ + OH⁻ → H₂O), the solution shifts back to yellow!',
      },
      {
        id: 'nat-step-4',
        stepNumber: 4,
        title: 'Test Red Cabbage Anthocyanin Indicator',
        instruction:
          'Test Red Cabbage extract with acid (turns bright red/pink at pH < 3) and alkali (turns green or yellowish-green at pH > 10).',
      },
      {
        id: 'nat-step-5',
        stepNumber: 5,
        title: 'Record Natural Indicator Observations in Notebook',
        instruction:
          'Log observations of turmeric and red cabbage color behavior in your notebook. Document why turmeric is an effective test for bases and why curry stains turn red when washed with soap.',
      },
    ],
    goals: [
      {
        id: 'goal-turmeric-base',
        description: 'Observe Turmeric shift from yellow to reddish-brown in basic solution (pH ≥ 7.5).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-turmeric-neutralize',
        description: 'Neutralize basic turmeric with acid to restore the original yellow color.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-cabbage-spectrum',
        description: 'Observe Red Cabbage extract shift in acidic (red) and basic (green) media.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Natural Acid-Base Indicators Investigation:\n\n1. Turmeric Indicator (Curcumin - Curcuma longa):\n- Acidic medium (HCl, lemon juice): Yellow (no change)\n- Neutral medium (water): Yellow\n- Alkaline/Basic medium (NaOH, baking soda, soap): Deep Reddish-Brown (pH ≥ 7.5)\n- Reversible Neutralization: Adding acid neutralizes OH- ions, restoring the golden yellow color.\n- Practical connection: Curry stains on clothing turn reddish-brown when scrubbed with alkaline laundry soap.\n\n2. Red Cabbage Indicator (Anthocyanins - Brassica oleracea):\n- Strongly Acidic (pH 1-2, 0.1M HCl): Bright Scarlet Red (Flavylium cation)\n- Weakly Acidic (pH 3-5, vinegar, lemon): Pink / Magenta\n- Neutral (pH 6-7.5, water): Royal Purple / Violet\n- Weakly Alkaline (pH 8-10, baking soda): Blue-Green / Cyan\n- Strongly Alkaline (pH 11-14, 0.1M NaOH): Grass Green to Yellowish-Green",
  },
  {
    experimentId: 'displacement-reaction',
    title: 'Displacement Reaction (Iron in Copper Sulphate)',
    subjectId: 'chemistry',
    allowedEquipmentIds: ['test-tube-rack', 'iron-nail-substrate', 'borosilicate-beaker'],
    initialObjects: [
      {
        id: 'tube-cu',
        equipmentId: 'test-tube-rack',
        title: 'Test Tube (CuSO₄ Sol.)',
        x: 180,
        y: 120,
        rotation: 0,
        width: 80,
        height: 160,
        properties: { capacityMl: 50, liquidVolume: 25, reagentSolution: 'cuso4' },
        state: { solutionColor: '#2563eb', reactionStatus: 'Pre-immersion' },
      },
      {
        id: 'nail-1',
        equipmentId: 'iron-nail-substrate',
        title: 'Clean Iron Nail',
        x: 360,
        y: 160,
        rotation: 0,
        width: 110,
        height: 70,
        properties: { isImmersed: true, immersionTimeMinutes: 20 },
        state: {
          coatingDeposited: 'Reddish-brown elemental copper deposit',
          ironStatus: 'Displaced',
        },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'fe-step-1',
        stepNumber: 1,
        title: 'Suspend Iron Nail into Blue Copper Sulphate',
        instruction: 'Place clean iron nail into the test tube containing 0.5M CuSO4.',
      },
      {
        id: 'fe-step-2',
        stepNumber: 2,
        title: 'Observe Chemical Displacement',
        instruction:
          'Over 15-20 minutes, observe blue Cu²⁺ fade to light green Fe²⁺ (FeSO₄) while reddish metallic copper plates onto the nail.',
      },
    ],
    goals: [
      {
        id: 'goal-redox',
        description: 'Verify iron displacement reaction Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s).',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      'Displacement Reaction: Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s). Iron is more reactive than copper, displacing copper from copper sulphate solution. Blue solution fades to pale green iron sulphate, and reddish-brown copper deposits on the iron nail.',
  },
];

export const chemistryExtension: SubjectLabExtension = {
  subjectId: 'chemistry',
  name: 'Chemistry Laboratory Workbench',
  getEquipmentCatalogue: () => CHEMISTRY_EQUIPMENT,
  getLabDefinitions: () => CHEMISTRY_LAB_DEFINITIONS,
  validateConnection: (
    fromObj: WorkspaceObject,
    fromPort: PortDefinition,
    toObj: WorkspaceObject,
    toPort: PortDefinition,
    existingConnections: WorkspaceConnection[]
  ): ConnectionValidationResult => {
    if (fromObj.id === toObj.id) {
      return { allowed: false, reason: 'Cannot connect a container to its own port.' };
    }

    const isFromFluid = fromPort.type === 'fluid-in' || fromPort.type === 'fluid-out';
    const isToFluid = toPort.type === 'fluid-in' || toPort.type === 'fluid-out';

    if (!isFromFluid && !isToFluid && fromPort.type !== 'generic' && toPort.type !== 'generic') {
      return { allowed: false, reason: 'Incompatible chemical port type.' };
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
      return { allowed: false, reason: 'Chemical fluid transfer already established.' };
    }

    return { allowed: true, suggestedColor: '#0ea5e9' };
  },
  evaluateSimulation: (
    objects: WorkspaceObject[],
    connections: WorkspaceConnection[]
  ): SimulationResult => {
    const updates: Record<string, Record<string, string | number | boolean>> = {};
    const messages: string[] = [];
    const warnings: string[] = [];

    // Evaluate all containers (beakers, flasks, cylinders, tubes, reagent bottles)
    const containerTypes = [
      'borosilicate-beaker',
      'beaker-100ml',
      'beaker-50ml',
      'conical-flask',
      'graduated-measuring-cylinder',
      'test-tube-rack',
      'reagent-bottle',
    ];

    for (const obj of objects) {
      if (containerTypes.includes(obj.equipmentId)) {
        const capacity = Number(obj.properties.capacityMl ?? 100);
        const volume = Number(obj.properties.liquidVolume ?? 0);
        const reagentId = String(obj.properties.reagentSolution ?? 'pure-water');

        // Check if liquid volume exceeds capacity
        if (volume > capacity) {
          warnings.push(
            `OVERFLOW WARNING in ${obj.title}: Liquid volume (${volume} mL) exceeds physical capacity (${capacity} mL)!`
          );
        }

        let state: ContainerLiquidState;
        if (
          obj.properties.mixtureComponentsJson &&
          typeof obj.properties.mixtureComponentsJson === 'string'
        ) {
          try {
            const parsedComps = JSON.parse(obj.properties.mixtureComponentsJson);
            state = recomputeMixtureProperties({
              capacityMl: capacity,
              totalVolumeMl: volume,
              temperatureC: STANDARD_ROOM_TEMP,
              ph: 7.0,
              color: '#e2e8f0',
              components: parsedComps,
              isStirred: true,
              reactionState: 'homogeneous',
              observationText: '',
              isOverflow: volume > capacity,
            });
          } catch {
            state = createContainerWithSubstance(reagentId, volume, capacity);
          }
        } else {
          state = createContainerWithSubstance(reagentId, volume, capacity);
        }

        updates[obj.id] = {
          capacityMl: capacity,
          liquidVolume: state.totalVolumeMl,
          samplePH: state.ph,
          liquidColor: state.color,
          temperatureC: state.temperatureC,
          reactionState: state.reactionState,
          observationText: state.observationText,
          chemicalComposition:
            state.components.map((c) => `${c.substanceName} (${c.volumeMl}mL)`).join(' + ') ||
            'Empty',
          fillPercentage: Number(((state.totalVolumeMl / capacity) * 100).toFixed(1)),
          status: `${state.observationText}`,
        };
      }
    }

    // Evaluate spotting plates and droppers
    const plates = objects.filter((o) => o.equipmentId === 'spotting-plate-cavities');
    const droppers = objects.filter((o) => o.equipmentId === 'pasteur-pipette-dropper');

    for (const p of plates) {
      const plateUpdates: Record<string, string | number | boolean> = {};

      for (const d of droppers) {
        const isConnectedToPlate = connections.some(
          (c) =>
            (c.fromObjectId === d.id && c.toObjectId === p.id) ||
            (c.fromObjectId === p.id && c.toObjectId === d.id)
        );

        if (isConnectedToPlate) {
          const reagent = String(d.properties.drawnReagent ?? 'universal-indicator');
          plateUpdates.cavityStatus = `Dispensed: ${reagent}`;
          plateUpdates.testedReaction = 'Colorimetric Shift Active';
          messages.push(`Spotting plate cavity received ${reagent} droplets.`);
        }
      }

      updates[p.id] = plateUpdates;
    }

    // Evaluate displacement reaction (iron nail + cuso4)
    const tubes = objects.filter((o) => o.equipmentId === 'test-tube-rack');
    const nails = objects.filter((o) => o.equipmentId === 'iron-nail-substrate');

    for (const nail of nails) {
      const timeElapsed = Number(nail.properties.immersionTimeMinutes ?? 15);
      const isImmersed = nail.properties.isImmersed !== false;

      if (isImmersed && timeElapsed >= 10) {
        updates[nail.id] = {
          reactionProgress: 'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s) active',
          coatingAppearance: 'Reddish-brown metallic Cu crust formed',
          reactionState: 'Complete',
        };

        for (const t of tubes) {
          updates[t.id] = {
            solutionColor: '#86efac', // Pale green FeSO4
            chemicalComposition: 'Iron(II) sulphate (FeSO₄) + Elemental Copper',
          };
        }
      }
    }

    return {
      valid: true,
      errors: [],
      warnings,
      messages: Array.from(new Set(messages)),
      objectStateUpdates: updates,
    };
  },
};
