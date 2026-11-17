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
import {
  calculateSolventFront,
  calculatePigmentPositions,
} from '../chemistry/chromatographyModel';
import { calculateDisplacementState } from '../chemistry/displacementModel';
import { calculateCrystallisation } from '../chemistry/crystallisationModel';
import {
  calculateMeltingPointState,
  calculateBoilingPointState,
} from '../chemistry/phaseTransitionModel';
import { compareEquimolarAcids } from '../chemistry/acidStrengthModel';
import {
  calculateFeSCNEquilibrium,
  calculateNO2N2O4Equilibrium,
  EquilibriumSystemType,
} from '../chemistry/equilibriumModel';
import {
  calculateTitrationState,
  TitrationSystemType,
  TitrationIndicator,
} from '../chemistry/titrationModel';
import {
  calculateStandardSolutionState,
  StandardSoluteType,
} from '../chemistry/standardSolutionModel';
import {
  runSaltAnalysisTest,
  SaltSampleId,
  SaltTestId,
} from '../chemistry/saltAnalysisModel';
import {
  runOrganicElementTest,
  OrganicSampleId,
  OrganicElementTestId,
} from '../chemistry/organicElementModel';
import {
  calculateColloidState,
  SolType,
  CoagulatingElectrolyte,
} from '../chemistry/colloidModel';
import { calculateKineticsState } from '../chemistry/kineticsModel';
import {
  calculateCalorimetryState,
  CalorimeterReactionType,
} from '../chemistry/thermochemistryModel';
import { calculateDaniellCellState } from '../chemistry/electrochemistryModel';
import {
  calculateSynthesisState,
  CompoundSynthesisId,
  SynthesisStage,
} from '../chemistry/synthesisModel';
import {
  runFunctionalGroupTest,
  FunctionalGroupTestId,
} from '../chemistry/functionalGroupModel';
import {
  runFoodTest,
  FoodSampleId,
  FoodTestId,
} from '../chemistry/foodTestingModel';
import {
  calculateRedoxTitrationState,
  RedoxTitrationSystem,
} from '../chemistry/redoxTitrationModel';

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
  { label: '0.5M Iron(II) Sulphate (FeSO₄)', value: 'feso4' },
  { label: 'Chromatography Mobile Phase (Water/Ethanol 80:20)', value: 'water-ethanol-eluent' },
  { label: 'Fresh Orange Juice (pH 3.6)', value: 'orange-juice' },
  { label: 'Fresh Tomato Extract (pH 4.3)', value: 'tomato-juice' },
  { label: 'Natural Apple Juice (pH 3.9)', value: 'apple-juice' },
  { label: '0.1M Ammonium Chloride (NH₄Cl, pH 5.13)', value: 'nh4cl-solution' },
  { label: '0.1M Sodium Acetate (CH₃COONa, pH 8.87)', value: 'ch3coona-solution' },
  { label: '0.1M Sodium Chloride (NaCl, pH 7.0)', value: 'nacl-solution' },
  { label: 'Acetate Buffer Solution (pH 4.74)', value: 'acetate-buffer' },
  { label: 'Pure Benzoic Acid Crystals (m.p. 122.4°C)', value: 'benzoic-acid-solid' },
  { label: 'Pure Urea Granules (m.p. 133.0°C)', value: 'urea-solid' },
  { label: 'Pure Naphthalene Flakes (m.p. 80.2°C)', value: 'naphthalene-solid' },
  { label: 'Impure Benzoic Acid (5% Cinnamic Acid)', value: 'impure-benzoic-acid' },
  { label: 'Absolute Ethanol (b.p. 78.3°C)', value: 'ethanol-liquid' },
  { label: 'Pure Acetone (b.p. 56.1°C)', value: 'acetone-liquid' },
  { label: 'Pure Ethyl Acetate (b.p. 77.1°C)', value: 'ethyl-acetate-liquid' },
  { label: 'Magnesium Metal Ribbon', value: 'mg-ribbon' },
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
    defaultWidth: 120,
    defaultHeight: 60,
    rotatable: true,
    ports: [
      {
        id: 'tip',
        name: 'Metal Contact Point',
        type: 'generic',
        xOffset: 120,
        yOffset: 30,
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
        defaultValue: 20,
        min: 0,
        max: 30,
        step: 2,
        unit: 'mins',
        editable: true,
      },
    ],
    renderType: 'iron-nail',
    colorTheme: '#475569',
  },
  {
    id: 'chromatography-paper-strip',
    name: 'Chromatography Paper Strip (Whatman No. 1)',
    subjectId: 'chemistry',
    category: 'accessory',
    description:
      'Grade 1 pure cellulose chromatography paper strip (15cm x 3cm) for ascending mobile phase dye separation.',
    iconName: 'Layers',
    defaultWidth: 110,
    defaultHeight: 220,
    rotatable: false,
    ports: [
      {
        id: 'bottom-wick',
        name: 'Solvent Contact Line',
        type: 'fluid-in',
        xOffset: 55,
        yOffset: 220,
        direction: 'south',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'sampleInk',
        label: 'Spot Sample Ink',
        type: 'select',
        defaultValue: 'black-ink',
        options: [
          { label: 'Black Sketch Pen Ink (Yellow, Red, Cyan)', value: 'black-ink' },
          { label: 'Green Marker Ink (Tartrazine & Blue)', value: 'green-ink' },
          { label: 'Brown Calligraphy Ink (Orange, Crimson, Indigo)', value: 'brown-ink' },
          { label: 'Spinach Leaf Chloroplast Extract (Carotenes, Chlorophylls)', value: 'plant-extract' },
        ],
        editable: true,
      },
      {
        id: 'elapsedSeconds',
        label: 'Development Elapsed',
        type: 'number',
        defaultValue: 60,
        min: 0,
        max: 120,
        step: 5,
        unit: 's',
        editable: true,
      },
      {
        id: 'isDeveloping',
        label: 'Ascending Migration Active',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'chromatography-paper',
    colorTheme: '#0284c7',
  },
  {
    id: 'developing-chamber',
    name: 'Chromatography Developing Chamber (with Lid)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Heavy-wall cylindrical glass developing tank with ground-glass airtight lid maintaining solvent vapor saturation.',
    iconName: 'FlaskConical',
    defaultWidth: 140,
    defaultHeight: 240,
    rotatable: false,
    ports: [
      {
        id: 'chamber-inlet',
        name: 'Chamber Mouth',
        type: 'fluid-in',
        xOffset: 70,
        yOffset: 15,
        direction: 'north',
        color: '#06b6d4',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Chamber Volume',
        type: 'number',
        defaultValue: 200,
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Solvent Pool Level',
        type: 'number',
        defaultValue: 25,
        min: 10,
        max: 50,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Eluent Mobile Phase',
        type: 'select',
        defaultValue: 'water-ethanol-eluent',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'developing-chamber',
    colorTheme: '#0891b2',
  },
  {
    id: 'chromatography-ruler',
    name: 'Metric Chromatography Measurement Ruler',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Transparent 100 mm metric laboratory ruler for measuring pigment migration distance and solvent front from baseline.',
    iconName: 'Ruler',
    defaultWidth: 50,
    defaultHeight: 200,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'scaleUnits',
        label: 'Graduation Units',
        type: 'string',
        defaultValue: 'Millimeters (0 - 100 mm)',
        editable: false,
      },
    ],
    renderType: 'chromatography-ruler',
    colorTheme: '#3b82f6',
  },
  {
    id: 'porcelain-evaporating-dish',
    name: 'Porcelain Evaporating Dish (China Dish)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Glazed white ceramic shallow basin with pour spout designed for thermal evaporation, solution concentration, and crystallisation.',
    iconName: 'Disc',
    defaultWidth: 140,
    defaultHeight: 90,
    rotatable: false,
    ports: [
      {
        id: 'dish-pour-spout',
        name: 'Pour Lip',
        type: 'fluid-out',
        xOffset: 135,
        yOffset: 30,
        direction: 'east',
        color: '#0ea5e9',
      },
    ],
    propertyDefinitions: [
      {
        id: 'solutionTemperatureC',
        label: 'Solution Temperature',
        type: 'number',
        defaultValue: 85,
        min: 20,
        max: 100,
        step: 5,
        unit: '°C',
        editable: true,
      },
      {
        id: 'soluteMassGrams',
        label: 'CuSO₄ Solute Added',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 40,
        step: 2,
        unit: 'g',
        editable: true,
      },
      {
        id: 'initialWaterVolumeMl',
        label: 'Initial Solvent Volume',
        type: 'number',
        defaultValue: 50,
        min: 20,
        max: 100,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'evaporationTimeMins',
        label: 'Evaporation Time',
        type: 'number',
        defaultValue: 15,
        min: 0,
        max: 30,
        step: 2,
        unit: 'mins',
        editable: true,
      },
      {
        id: 'isHeating',
        label: 'Heating Applied',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'evaporating-dish',
    colorTheme: '#0284c7',
  },
  {
    id: 'bunsen-burner-tripod',
    name: 'Bunsen Burner & Wire Gauze Stand',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Laboratory gas burner with adjustable air collar, steel tripod stand, and ceramic-centered wire gauze for uniform thermal distribution.',
    iconName: 'Flame',
    defaultWidth: 110,
    defaultHeight: 140,
    rotatable: false,
    ports: [
      {
        id: 'gauze-stand',
        name: 'Wire Gauze Heating Plate',
        type: 'generic',
        xOffset: 55,
        yOffset: 15,
        direction: 'north',
        color: '#f97316',
      },
    ],
    propertyDefinitions: [
      {
        id: 'flameActive',
        label: 'Heating Flame',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'heatingPowerWatts',
        label: 'Thermal Power',
        type: 'number',
        defaultValue: 450,
        min: 150,
        max: 800,
        step: 50,
        unit: 'W',
        editable: true,
      },
    ],
    renderType: 'burner',
    colorTheme: '#ea580c',
  },
  {
    id: 'watch-glass',
    name: 'Borosilicate Watch Glass (Cooling Cover)',
    subjectId: 'chemistry',
    category: 'accessory',
    description:
      'Concave circular borosilicate glass disk placed over the evaporating dish to retard dust and foster slow, undisturbed crystal growth.',
    iconName: 'Disc',
    defaultWidth: 100,
    defaultHeight: 50,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'isCoveringDish',
        label: 'Cover Placed over Dish',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'watch-glass',
    colorTheme: '#38bdf8',
  },
  {
    id: 'graduated-burette-50ml',
    name: 'Graduated Burette on Retort Stand (50mL)',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Precision 50 mL graduated glass burette with Teflon stopcock and 0.1 mL scale divisions for quantitative acid-base titrations and volumetric dispensing.',
    iconName: 'Pipette',
    defaultWidth: 90,
    defaultHeight: 280,
    rotatable: false,
    ports: [
      {
        id: 'top-in',
        name: 'Burette Top Inlet',
        type: 'fluid-in',
        xOffset: 45,
        yOffset: 0,
        direction: 'north',
        color: '#38bdf8',
      },
      {
        id: 'tip-out',
        name: 'Dispensing Tip Outlet',
        type: 'fluid-out',
        xOffset: 45,
        yOffset: 280,
        direction: 'south',
        color: '#38bdf8',
      },
    ],
    propertyDefinitions: [
      {
        id: 'capacityMl',
        label: 'Total Capacity',
        type: 'number',
        defaultValue: 50,
        min: 50,
        max: 50,
        unit: 'mL',
        editable: false,
      },
      {
        id: 'liquidVolume',
        label: 'Current Liquid Volume',
        type: 'number',
        defaultValue: 50,
        min: 0,
        max: 50,
        step: 0.5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'deliveredVolumeMl',
        label: 'Delivered Volume (Titre)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 50,
        step: 0.1,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'stopcockOpen',
        label: 'Stopcock Valve Open',
        type: 'boolean',
        defaultValue: false,
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Titrant Solution',
        type: 'select',
        defaultValue: 'hcl',
        options: REAGENT_OPTIONS,
        editable: true,
      },
    ],
    renderType: 'graduated-burette',
    colorTheme: '#0284c7',
  },
  {
    id: 'digital-analytical-balance',
    name: 'Digital Analytical Balance (0.001g)',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'High-precision electronic laboratory balance with electromagnetic force restoration, digital tare button, and milligram resolution.',
    iconName: 'Scale',
    defaultWidth: 170,
    defaultHeight: 130,
    rotatable: false,
    ports: [
      {
        id: 'pan-surface',
        name: 'Weighing Pan Surface',
        type: 'generic',
        xOffset: 85,
        yOffset: 45,
        direction: 'north',
        color: '#64748b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'sampleMassGrams',
        label: 'Sample Mass on Pan',
        type: 'number',
        defaultValue: 5.25,
        min: 0,
        max: 210,
        step: 0.001,
        unit: 'g',
        editable: true,
      },
      {
        id: 'tareOffsetGrams',
        label: 'Tare Offset Mass',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 210,
        step: 0.001,
        unit: 'g',
        editable: true,
      },
      {
        id: 'tarePressed',
        label: 'Tare Button Pressed (Zero Pan)',
        type: 'boolean',
        defaultValue: false,
        editable: true,
      },
      {
        id: 'watchGlassPlaced',
        label: 'Weighing Dish on Pan',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'chemical-balance',
    colorTheme: '#475569',
  },
  {
    id: 'thiele-melting-apparatus',
    name: 'Thiele Tube Melting Point Apparatus',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Standard Thiele tube apparatus filled with liquid paraffin for uniform convective heat circulation, equipped with a precision thermometer and sample capillary tube.',
    iconName: 'Flame',
    defaultWidth: 180,
    defaultHeight: 260,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'sampleId',
        label: 'Organic Solid Sample',
        type: 'select',
        defaultValue: 'benzoic-acid-solid',
        options: [
          { label: 'Pure Benzoic Acid (m.p. 122.4°C)', value: 'benzoic-acid-solid' },
          { label: 'Pure Urea (m.p. 133.0°C)', value: 'urea-solid' },
          { label: 'Pure Naphthalene (m.p. 80.2°C)', value: 'naphthalene-solid' },
          { label: 'Impure Benzoic Acid (5% Cinnamic Acid, m.p. 114.5-118.5°C)', value: 'impure-benzoic-acid' },
        ],
        editable: true,
      },
      {
        id: 'currentTempC',
        label: 'Paraffin Bath Temperature',
        type: 'number',
        defaultValue: 110,
        min: 20,
        max: 200,
        step: 0.5,
        unit: '°C',
        editable: true,
      },
      {
        id: 'isHeating',
        label: 'Bunsen Burner Heating',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'heatingRateDegPerSec',
        label: 'Heating Rate',
        type: 'number',
        defaultValue: 1.0,
        min: 0.5,
        max: 3.0,
        step: 0.5,
        unit: '°C/s',
        editable: true,
      },
    ],
    renderType: 'thiele-tube',
    colorTheme: '#d97706',
  },
  {
    id: 'boiling-point-apparatus',
    name: 'Inverted Capillary Boiling Point Apparatus',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Siwoloboff micro-boiling tube assembly with inverted capillary tube sealed at top, immersed in a paraffin heating bath with digital thermometer.',
    iconName: 'Flame',
    defaultWidth: 180,
    defaultHeight: 260,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'liquidId',
        label: 'Volatile Liquid Sample',
        type: 'select',
        defaultValue: 'ethanol-liquid',
        options: [
          { label: 'Absolute Ethanol (b.p. 78.3°C)', value: 'ethanol-liquid' },
          { label: 'Pure Acetone (b.p. 56.1°C)', value: 'acetone-liquid' },
          { label: 'Pure Ethyl Acetate (b.p. 77.1°C)', value: 'ethyl-acetate-liquid' },
          { label: 'Pure Distilled Water (b.p. 100.0°C)', value: 'pure-water' },
        ],
        editable: true,
      },
      {
        id: 'bathTempC',
        label: 'Bath Temperature',
        type: 'number',
        defaultValue: 70,
        min: 20,
        max: 150,
        step: 0.5,
        unit: '°C',
        editable: true,
      },
      {
        id: 'isHeating',
        label: 'Heating Active',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'barometricPressureKPa',
        label: 'Atmospheric Pressure',
        type: 'number',
        defaultValue: 101.325,
        min: 70.0,
        max: 110.0,
        step: 0.5,
        unit: 'kPa',
        editable: true,
      },
    ],
    renderType: 'boiling-tube',
    colorTheme: '#2563eb',
  },
  {
    id: 'acid-comparison-bench',
    name: 'Acid Strength & Kinetics Comparator Bench',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Dual-cell reaction comparison station testing equimolar strong acid (HCl) vs weak acid (CH₃COOH) with live [H⁺] meters, dissociation degree α, and magnesium reaction effervescence kinetics.',
    iconName: 'Activity',
    defaultWidth: 280,
    defaultHeight: 200,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'concentrationM',
        label: 'Acid Concentration',
        type: 'number',
        defaultValue: 0.1,
        min: 0.001,
        max: 1.0,
        step: 0.01,
        unit: 'M',
        editable: true,
      },
      {
        id: 'solutionVolumeMl',
        label: 'Solution Volume per Cell',
        type: 'number',
        defaultValue: 50,
        min: 10,
        max: 100,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'magnesiumAdded',
        label: 'Magnesium Ribbon Added',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'mgMassMg',
        label: 'Magnesium Ribbon Mass',
        type: 'number',
        defaultValue: 24.3,
        min: 5,
        max: 100,
        step: 1,
        unit: 'mg',
        editable: true,
      },
    ],
    renderType: 'acid-bench',
    colorTheme: '#4f46e5',
  },
  {
    id: 'closed-equilibrium-chamber',
    name: 'Closed Chemical Equilibrium Reaction Chamber',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Sealed reaction cell modeling reversible dynamic chemical equilibria with Le Chatelier perturbations (Fe³⁺/SCN⁻ complexation or NO₂/N₂O₄ compression & temperature shifts).',
    iconName: 'Activity',
    defaultWidth: 260,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'systemType',
        label: 'Reversible Reaction System',
        type: 'select',
        defaultValue: 'fe-scn',
        options: [
          { label: 'Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺ (Blood-Red Complex)', value: 'fe-scn' },
          { label: '2NO₂(g) ⇌ N₂O₄(g) (Reddish-Brown Vapor to Colorless)', value: 'no2-n2o4' },
        ],
        editable: true,
      },
      {
        id: 'temperatureC',
        label: 'Chamber Temperature',
        type: 'number',
        defaultValue: 25,
        min: 0,
        max: 80,
        step: 1,
        unit: '°C',
        editable: true,
      },
      {
        id: 'addedFe3PlusM',
        label: 'Perturbation: Added Fe³⁺ Concentration',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 0.01,
        step: 0.001,
        unit: 'M',
        editable: true,
      },
      {
        id: 'addedSCNMinusM',
        label: 'Perturbation: Added SCN⁻ Concentration',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 0.01,
        step: 0.001,
        unit: 'M',
        editable: true,
      },
      {
        id: 'addedFluorideM',
        label: 'Perturbation: Added F⁻ (Fe³⁺ Sequestration)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 0.01,
        step: 0.001,
        unit: 'M',
        editable: true,
      },
      {
        id: 'gasVolumeL',
        label: 'Gaseous Volume / Piston Compression',
        type: 'number',
        defaultValue: 1.0,
        min: 0.2,
        max: 4.0,
        step: 0.1,
        unit: 'L',
        editable: true,
      },
    ],
    renderType: 'equilibrium-vessel',
    colorTheme: '#dc2626',
  },
  {
    id: 'volumetric-flask-250ml',
    name: 'Volumetric Measuring Flask (250mL Class A)',
    subjectId: 'chemistry',
    category: 'container',
    description:
      'Precision Class A 250 mL volumetric flask with elongated neck, ground glass stopper, and single circular graduation mark for standard solution preparation.',
    iconName: 'FlaskConical',
    defaultWidth: 150,
    defaultHeight: 240,
    rotatable: false,
    ports: [
      {
        id: 'mouth',
        name: 'Flask Mouth',
        type: 'fluid-in',
        xOffset: 75,
        yOffset: 0,
        direction: 'north',
        color: '#0284c7',
      },
    ],
    propertyDefinitions: [
      {
        id: 'soluteType',
        label: 'Primary Standard Solute',
        type: 'select',
        defaultValue: 'oxalic-acid',
        options: [
          { label: 'Oxalic Acid Dihydrate (H₂C₂O₄·2H₂O, Mw=126.07)', value: 'oxalic-acid' },
          { label: 'Anhydrous Sodium Carbonate (Na₂CO₃, Mw=105.99)', value: 'sodium-carbonate' },
        ],
        editable: true,
      },
      {
        id: 'targetMolarity',
        label: 'Target Solution Molarity',
        type: 'number',
        defaultValue: 0.1,
        min: 0.05,
        max: 0.5,
        step: 0.05,
        unit: 'M',
        editable: true,
      },
      {
        id: 'weighedMassGrams',
        label: 'Weighed Solute Mass',
        type: 'number',
        defaultValue: 3.152,
        min: 0,
        max: 20,
        step: 0.001,
        unit: 'g',
        editable: true,
      },
      {
        id: 'liquidVolume',
        label: 'Dilution Liquid Volume',
        type: 'number',
        defaultValue: 250.0,
        min: 0,
        max: 260,
        step: 0.5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'isDissolved',
        label: 'Solute Completely Dissolved',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'isStoppered',
        label: 'Ground-Glass Stopper Fitted',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'isInvertedHomogeneous',
        label: 'Inverted to Homogenize',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'volumetric-flask',
    colorTheme: '#0284c7',
  },
  {
    id: 'titration-workbench',
    name: 'Precision Acid-Base Titration Workbench',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Integrated titration setup featuring a 50 mL graduated burette on retort stand mounted over an Erlenmeyer conical flask with magnetic swirling, drop control, and indicator spectrophotometry.',
    iconName: 'Pipette',
    defaultWidth: 280,
    defaultHeight: 280,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'system',
        label: 'Titration Reaction System',
        type: 'select',
        defaultValue: 'oxalic-acid-naoh',
        options: [
          { label: 'Oxalic Acid (H₂C₂O₄, diprotic) vs NaOH (strong base)', value: 'oxalic-acid-naoh' },
          { label: 'Hydrochloric Acid (HCl, strong acid) vs NaOH', value: 'hcl-naoh' },
        ],
        editable: true,
      },
      {
        id: 'analyteVolumeMl',
        label: 'Analyte Volume in Conical Flask',
        type: 'number',
        defaultValue: 20.0,
        min: 10,
        max: 50,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'analyteMolarityM',
        label: 'Analyte Acid Molarity',
        type: 'number',
        defaultValue: 0.1,
        min: 0.02,
        max: 0.5,
        step: 0.01,
        unit: 'M',
        editable: true,
      },
      {
        id: 'titrantMolarityM',
        label: 'Titrant (NaOH) Molarity',
        type: 'number',
        defaultValue: 0.1,
        min: 0.02,
        max: 0.5,
        step: 0.01,
        unit: 'M',
        editable: true,
      },
      {
        id: 'titrantDeliveredMl',
        label: 'Titrant Delivered from Burette',
        type: 'number',
        defaultValue: 0.0,
        min: 0,
        max: 50,
        step: 0.1,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'indicator',
        label: 'Endpoint Indicator',
        type: 'select',
        defaultValue: 'phenolphthalein',
        options: [
          { label: 'Phenolphthalein (Colorless -> Pale Pink, pH 8.3-10)', value: 'phenolphthalein' },
          { label: 'Methyl Orange (Red -> Yellow-Orange, pH 3.1-4.4)', value: 'methyl-orange' },
        ],
        editable: true,
      },
      {
        id: 'isSwirling',
        label: 'Flask Continuous Swirling Active',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
    ],
    renderType: 'titration-bench',
    colorTheme: '#ec4899',
  },
  {
    id: 'salt-analysis-workbench',
    name: 'Systematic Qualitative Salt Analysis Workbench',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Multi-tube qualitative salt testing station supporting preliminary, dry heating, flame, acid radical group, and cation group separation tests (Groups 0 to VI).',
    iconName: 'FlaskConical',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'selectedSalt',
        label: 'Inorganic Unknown Salt Sample',
        type: 'select',
        defaultValue: 'nh4cl',
        options: [
          { label: 'Ammonium Chloride (NH₄Cl - Group 0)', value: 'nh4cl' },
          { label: 'Lead(II) Nitrate (Pb(NO₃)₂ - Group I)', value: 'pb-no3-2' },
          { label: 'Copper(II) Sulphate (CuSO₄ - Group II)', value: 'cuso4' },
          { label: 'Iron(II) Sulphate (FeSO₄ - Group III)', value: 'feso4' },
          { label: 'Aluminium Chloride (AlCl₃ - Group III)', value: 'alcl3' },
          { label: 'Zinc Sulphate (ZnSO₄ - Group IV)', value: 'znso4' },
          { label: 'Calcium Chloride (CaCl₂ - Group V)', value: 'cacl2' },
          { label: 'Magnesium Sulphate (MgSO₄ - Group VI)', value: 'mgso4' },
          { label: 'Calcium Phosphate (Ca₃(PO₄)₂ - Group V + PO₄³⁻)', value: 'ca3_po4_2' },
          { label: 'Magnesium Oxalate (MgC₂O₄ - Group VI + C₂O₄²⁻)', value: 'mg_c2o4' },
          { label: 'Ferric Phosphate (FePO₄ - Group III + PO₄³⁻)', value: 'fe_po4' },
          { label: 'Barium Chloride (BaCl₂ - Group V + Cl⁻)', value: 'ba_cl2' },
        ],
        editable: true,
      },
      {
        id: 'currentTest',
        label: 'Systematic Analytical Test',
        type: 'select',
        defaultValue: 'physical',
        options: [
          { label: '1. Physical & Visual Examination', value: 'physical' },
          { label: '2. Dry Heating Test', value: 'dry-heating' },
          { label: '3. Flame Test (Conc. HCl Paste)', value: 'flame-test' },
          { label: '4. Dilute H₂SO₄ Acid Radicals Test', value: 'dilute-acid' },
          { label: '5. Concentrated H₂SO₄ Acid Radicals Test', value: 'conc-acid' },
          { label: '6. Anion Confirmatory Test (AgNO₃/BaCl₂/Brown Ring)', value: 'anion-confirmatory' },
          { label: '7. Systematic Cation Group Separation Test', value: 'cation-group-test' },
          { label: '8. Cation Confirmatory Wet Test', value: 'cation-confirmatory' },
          { label: '9. Ammonium Molybdate Test for Phosphate Radical', value: 'phosphate-molybdate' },
          { label: '10. Phosphate Elimination Protocol (NaOAc + FeCl₃)', value: 'phosphate-elimination' },
          { label: '11. Oxalate Redox Decolorization (Acidified KMnO₄)', value: 'oxalate-kmno4' },
        ],
        editable: true,
      },
    ],
    renderType: 'salt-analysis-bench',
    colorTheme: '#10b981',
  },
  {
    id: 'element-detection-workbench',
    name: 'Organic Element Detection Workbench (Lassaigne Extract)',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Safe virtual testing station detecting Nitrogen, Sulphur, and Halogens (Cl, Br, I) in organic compounds using simulated pre-fused Lassaigne sodium extract aliquots.',
    iconName: 'ShieldAlert',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'selectedSample',
        label: 'Organic Test Compound',
        type: 'select',
        defaultValue: 'urea',
        options: [
          { label: 'Urea (NH₂CONH₂ - Amide)', value: 'urea' },
          { label: 'Thiourea (NH₂CSNH₂ - Thioamide)', value: 'thiourea' },
          { label: 'Sulphanilic Acid (H₂N-C₆H₄-SO₃H)', value: 'sulphanilic-acid' },
          { label: 'Chlorobenzene (C₆H₅Cl - Aryl Chloride)', value: 'chlorobenzene' },
          { label: 'Bromobenzene (C₆H₅Br - Aryl Bromide)', value: 'bromobenzene' },
          { label: 'Iodobenzene (C₆H₅I - Aryl Iodide)', value: 'iodobenzene' },
          { label: 'Benzoic Acid (C₆H₅COOH - Pure C, H, O)', value: 'benzoic-acid' },
        ],
        editable: true,
      },
      {
        id: 'currentTest',
        label: 'Extract Detection Procedure',
        type: 'select',
        defaultValue: 'nitrogen-prussian-blue',
        options: [
          { label: '1. Prussian Blue Test for Nitrogen (FeSO₄ + FeCl₃)', value: 'nitrogen-prussian-blue' },
          { label: '2. Sodium Nitroprusside Test for Sulphur (Purple)', value: 'sulphur-nitroprusside' },
          { label: '3. Lead Acetate Test for Sulphur (Black PbS)', value: 'sulphur-lead-acetate' },
          { label: '4. Silver Nitrate Test for Halogens (AgNO₃ + NH₄OH)', value: 'halogen-silver-nitrate' },
        ],
        editable: true,
      },
    ],
    renderType: 'element-detection-bench',
    colorTheme: '#6366f1',
  },
  {
    id: 'colloid-apparatus',
    name: 'Colloid & Tyndall Effect Analysis Assembly',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Colloidal sol preparation and optical scattering station with 650nm red laser emitter, particle viewer, and Hardy-Schulze electrolyte coagulant dropper.',
    iconName: 'FlaskConical',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'solType',
        label: 'Colloidal Dispersion Sample',
        type: 'select',
        defaultValue: 'feoh3-sol',
        options: [
          { label: 'Hydrated Ferric Hydroxide Sol [Fe(OH)₃ / Fe³⁺] (Positive Lyophobic)', value: 'feoh3-sol' },
          { label: 'Soluble Starch Sol (Hydrated Lyophilic)', value: 'starch-sol' },
          { label: 'Arsenious Sulphide Sol [As₂S₃ / S²⁻] (Negative Lyophobic)', value: 'as2s3-sol' },
          { label: 'Aqueous Sodium Chloride (True Solution <1 nm)', value: 'true-solution-nacl' },
        ],
        editable: true,
      },
      {
        id: 'laserActive',
        label: 'Transverse Laser Pointer (650 nm)',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'electrolyte',
        label: 'Coagulating Electrolyte (Hardy-Schulze)',
        type: 'select',
        defaultValue: 'none',
        options: [
          { label: 'None (Pure Sol)', value: 'none' },
          { label: 'K₄[Fe(CN)₆] (0.01M - Quadrivalent Anion)', value: 'k4fe_cn6' },
          { label: 'Na₂SO₄ (0.1M - Divalent Anion)', value: 'na2so4' },
          { label: 'NaCl (0.5M - Monovalent Anion)', value: 'nacl' },
          { label: 'AlCl₃ (0.01M - Trivalent Cation)', value: 'alcl3' },
          { label: 'BaCl₂ (0.05M - Divalent Cation)', value: 'bacl2' },
        ],
        editable: true,
      },
      {
        id: 'electrolyteVolumeMl',
        label: 'Electrolyte Volume (mL)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 10,
        step: 0.5,
        unit: 'mL',
        editable: true,
      },
    ],
    renderType: 'colloid-bench',
    colorTheme: '#881337',
  },
  {
    id: 'kinetics-cross-bench',
    name: 'Chemical Kinetics Reaction Vessel (Tile with Black Cross)',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Reaction station for Na2S2O3 + HCl featuring a glazed white tile marked with a black cross (+), top-down opacity observer, and integrated digital stopwatch.',
    iconName: 'Clock',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'volumeThiosulphateMl',
        label: '0.1M Na₂S₂O₃ Volume (mL)',
        type: 'number',
        defaultValue: 50,
        min: 10,
        max: 50,
        step: 10,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'volumeWaterMl',
        label: 'Distilled Water Volume (mL)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 40,
        step: 10,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'volumeHclMl',
        label: '1.0M HCl Volume (mL)',
        type: 'number',
        defaultValue: 10,
        min: 5,
        max: 20,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'temperatureC',
        label: 'Reaction Temperature (°C)',
        type: 'number',
        defaultValue: 25,
        min: 15,
        max: 60,
        step: 5,
        unit: '°C',
        editable: true,
      },
      {
        id: 'isReactionStarted',
        label: 'Start Chemical Reaction & Timer',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'elapsedSeconds',
        label: 'Elapsed Time (s)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 120,
        step: 1,
        unit: 's',
        editable: true,
      },
    ],
    renderType: 'kinetics-bench',
    colorTheme: '#eab308',
  },
  {
    id: 'calorimeter-assembly',
    name: 'Insulated Polystyrene Cup Calorimeter Assembly',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Polystyrene Dewar cup calorimeter equipped with precision differential Beckman thermometer, mechanical stirrer, and digital temperature-time recorder.',
    iconName: 'Activity',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'reactionType',
        label: 'Calorimeter Reaction / Process',
        type: 'select',
        defaultValue: 'neutralization-hcl-naoh',
        options: [
          { label: 'Neutralization: 1.0M HCl + 1.0M NaOH (Strong Acid-Base)', value: 'neutralization-hcl-naoh' },
          { label: 'Neutralization: 1.0M CH₃COOH + 1.0M NaOH (Weak Acid-Base)', value: 'neutralization-ch3cooh-naoh' },
          { label: 'Enthalpy of Solution: KNO₃ (Endothermic)', value: 'solution-kno3' },
          { label: 'Enthalpy of Solution: CuSO₄·5H₂O (Endothermic)', value: 'solution-cuso4' },
        ],
        editable: true,
      },
      {
        id: 'volumeAcidMl',
        label: 'Acid / Solvent Volume (mL)',
        type: 'number',
        defaultValue: 50,
        min: 10,
        max: 100,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'volumeBaseMl',
        label: 'Base / Solute Volume (mL)',
        type: 'number',
        defaultValue: 50,
        min: 5,
        max: 100,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'waterEquivalentW',
        label: 'Calorimeter Water Equivalent W (J/K)',
        type: 'number',
        defaultValue: 25,
        min: 10,
        max: 60,
        step: 5,
        unit: 'J/K',
        editable: true,
      },
      {
        id: 'isMixed',
        label: 'Mix Reactants Inside Calorimeter',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'elapsedSeconds',
        label: 'Elapsed Time Since Mixing (s)',
        type: 'number',
        defaultValue: 25,
        min: 0,
        max: 120,
        step: 5,
        unit: 's',
        editable: true,
      },
    ],
    renderType: 'calorimeter-bench',
    colorTheme: '#ef4444',
  },
  {
    id: 'daniell-cell-apparatus',
    name: 'Galvanic Daniell Cell Assembly with Salt Bridge',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Two-compartment electrochemical cell containing zinc and copper electrodes immersed in ZnSO4 and CuSO4, joined by an inverted U-tube salt bridge with a digital voltmeter.',
    iconName: 'Zap',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'zincConcentrationM',
        label: 'Zn²⁺ Anode Concentration (M)',
        type: 'select',
        defaultValue: 1.0,
        options: [
          { label: '0.01 M ZnSO₄', value: 0.01 },
          { label: '0.10 M ZnSO₄', value: 0.1 },
          { label: '1.00 M ZnSO₄ (Standard)', value: 1.0 },
        ],
        editable: true,
      },
      {
        id: 'copperConcentrationM',
        label: 'Cu²⁺ Cathode Concentration (M)',
        type: 'select',
        defaultValue: 1.0,
        options: [
          { label: '0.01 M CuSO₄', value: 0.01 },
          { label: '0.10 M CuSO₄', value: 0.1 },
          { label: '1.00 M CuSO₄ (Standard)', value: 1.0 },
        ],
        editable: true,
      },
      {
        id: 'saltBridgeInserted',
        label: 'Agar-Agar KCl Salt Bridge Inserted',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'voltmeterPolarityReversed',
        label: 'Reverse Voltmeter Terminal Leads',
        type: 'boolean',
        defaultValue: false,
        editable: true,
      },
      {
        id: 'temperatureC',
        label: 'Cell Temperature (°C)',
        type: 'number',
        defaultValue: 25,
        min: 10,
        max: 50,
        step: 5,
        unit: '°C',
        editable: true,
      },
    ],
    renderType: 'daniell-cell-bench',
    colorTheme: '#0284c7',
  },
  {
    id: 'inorganic-synth-assembly',
    name: 'Inorganic Double Salt Synthesis Assembly',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Controlled virtual preparation station for inorganic double salts (Mohr’s Salt and Potash Alum) with heating, crystallization, and recovery tracking.',
    iconName: 'FlaskConical',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'compoundId',
        label: 'Target Double Salt',
        type: 'select',
        defaultValue: 'mohrs-salt',
        options: [
          { label: 'Mohr’s Salt [FeSO₄·(NH₄)₂SO₄·6H₂O]', value: 'mohrs-salt' },
          { label: 'Potash Alum [K₂SO₄·Al₂(SO₄)₃·24H₂O]', value: 'potash-alum' },
        ],
        editable: true,
      },
      {
        id: 'stage',
        label: 'Synthesis Workflow Stage',
        type: 'select',
        defaultValue: 'reactant-mixing',
        options: [
          { label: '1. Reactant Dissolution & Mixing', value: 'reactant-mixing' },
          { label: '2. Acidified Heating & Concentration', value: 'acidified-heating' },
          { label: '3. Undisturbed Cooling & Crystallisation', value: 'crystallisation-cooling' },
          { label: '4. Filtration, Drying & Yield Analysis', value: 'filtration-drying' },
        ],
        editable: true,
      },
      {
        id: 'isAcidified',
        label: 'Add Dilute H₂SO₄ (Prevents Oxidation/Hydrolysis)',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'heatingDurationMin',
        label: 'Heating & Concentration Time (min)',
        type: 'number',
        defaultValue: 10,
        min: 0,
        max: 20,
        step: 2,
        unit: 'min',
        editable: true,
      },
      {
        id: 'coolingDurationMin',
        label: 'Slow Undisturbed Cooling Time (min)',
        type: 'number',
        defaultValue: 15,
        min: 0,
        max: 30,
        step: 5,
        unit: 'min',
        editable: true,
      },
    ],
    renderType: 'synthesis-bench',
    colorTheme: '#10b981',
  },
  {
    id: 'organic-synth-assembly',
    name: 'Organic Compound Synthesis Station',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Controlled simulation of organic synthesis (Acetanilide acetylation & Dibenzalacetone Claisen-Schmidt condensation) with crystal habit and melting point validation.',
    iconName: 'FlaskConical',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'compoundId',
        label: 'Target Organic Compound',
        type: 'select',
        defaultValue: 'acetanilide',
        options: [
          { label: 'Acetanilide (Nucleophilic Acyl Substitution, MP 114°C)', value: 'acetanilide' },
          { label: 'Dibenzalacetone (Claisen-Schmidt Condensation, MP 112°C)', value: 'dibenzalacetone' },
        ],
        editable: true,
      },
      {
        id: 'stage',
        label: 'Preparation Stage',
        type: 'select',
        defaultValue: 'reactant-mixing',
        options: [
          { label: '1. Reagent Dissolution & Catalyst Addition', value: 'reactant-mixing' },
          { label: '2. Controlled Heating / Shaking', value: 'acidified-heating' },
          { label: '3. Ice-Bath Cooling & Nucleation', value: 'crystallisation-cooling' },
          { label: '4. Buchner Suction Filtration & MP Testing', value: 'filtration-drying' },
        ],
        editable: true,
      },
      {
        id: 'isAcidified',
        label: 'Optimal Catalytic Condition Maintained',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'heatingDurationMin',
        label: 'Reaction Duration (min)',
        type: 'number',
        defaultValue: 10,
        min: 0,
        max: 20,
        step: 2,
        unit: 'min',
        editable: true,
      },
      {
        id: 'coolingDurationMin',
        label: 'Crystallization Cooling Duration (min)',
        type: 'number',
        defaultValue: 15,
        min: 0,
        max: 30,
        step: 5,
        unit: 'min',
        editable: true,
      },
    ],
    renderType: 'synthesis-bench',
    colorTheme: '#8b5cf6',
  },
  {
    id: 'functional-group-workbench',
    name: 'Organic Functional Group Identification Workbench',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Comprehensive testing station identifying 7 core functional groups (Unsaturation, Alcohol, Phenol, Aldehyde, Ketone, Carboxylic Acid, Primary Amine) via 11 diagnostic tests.',
    iconName: 'TestTube',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'selectedSample',
        label: 'Organic Unknown Sample',
        type: 'select',
        defaultValue: 'cyclohexene',
        options: [
          { label: 'Sample A: Cyclohexene (Alkene)', value: 'cyclohexene' },
          { label: 'Sample B: Ethanol (Primary Alcohol)', value: 'ethanol' },
          { label: 'Sample C: Phenol (Aromatic Hydroxyl)', value: 'phenol' },
          { label: 'Sample D: Benzaldehyde (Aromatic Aldehyde)', value: 'benzaldehyde' },
          { label: 'Sample E: Acetone (Aliphatic Ketone)', value: 'acetone' },
          { label: 'Sample F: Benzoic Acid (Carboxylic Acid)', value: 'benzoic-acid' },
          { label: 'Sample G: Aniline (Primary Aromatic Amine)', value: 'aniline' },
        ],
        editable: true,
      },
      {
        id: 'selectedTest',
        label: 'Diagnostic Chemical Test',
        type: 'select',
        defaultValue: 'bromine-water',
        options: [
          { label: '1. Bromine Water Test (Unsaturation)', value: 'bromine-water' },
          { label: '2. Baeyer’s Test (Cold alk. KMnO₄)', value: 'baeyer-test' },
          { label: '3. Sodium Metal Effervescence Test', value: 'sodium-metal' },
          { label: '4. Ceric Ammonium Nitrate Test (CAN)', value: 'ceric-ammonium-nitrate' },
          { label: '5. Neutral FeCl₃ Violet Coloration Test', value: 'neutral-fecl3' },
          { label: '6. Tollens’ Reagent (Silver Mirror)', value: 'tollens-silver-mirror' },
          { label: '7. Fehling’s Solution (Red Cu₂O ppt)', value: 'fehling-solution' },
          { label: '8. Sodium Nitroprusside (Ruby Red)', value: 'sodium-nitroprusside' },
          { label: '9. Sodium Bicarbonate (NaHCO₃ CO₂)', value: 'sodium-bicarbonate' },
          { label: '10. Esterification Fruity Odor Test', value: 'ester-test' },
          { label: '11. Azo Dye Test (β-Naphthol Coupling)', value: 'azo-dye' },
        ],
        editable: true,
      },
    ],
    renderType: 'functional-group-bench',
    colorTheme: '#f59e0b',
  },
  {
    id: 'food-testing-workbench',
    name: 'Food Component Testing Workbench',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'Biochemical qualitative testing station detecting carbohydrates, proteins, and fats in real-world food matrices via 7 standardized reactions.',
    iconName: 'Apple',
    defaultWidth: 320,
    defaultHeight: 240,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'selectedSample',
        label: 'Food Matrix / Substrate Extract',
        type: 'select',
        defaultValue: 'glucose',
        options: [
          { label: 'Glucose Solution (Monosaccharide)', value: 'glucose' },
          { label: 'Potato Starch Suspension (Polysaccharide)', value: 'potato-starch' },
          { label: 'Egg Albumin Dispersion (Globular Protein)', value: 'egg-albumin' },
          { label: 'Fresh Whole Milk (Emulsion: Protein + Fat + Lactose)', value: 'milk' },
          { label: 'Refined Vegetable Oil (Triglyceride Lipids)', value: 'vegetable-oil' },
        ],
        editable: true,
      },
      {
        id: 'selectedTest',
        label: 'Biochemical Nutrient Test',
        type: 'select',
        defaultValue: 'molisch-test',
        options: [
          { label: '1. Molisch’s General Carbohydrate Test (Violet Ring)', value: 'molisch-test' },
          { label: '2. Fehling’s Reducing Sugar Test (Red Cu₂O ppt)', value: 'fehling-test' },
          { label: '3. Iodine Starch Test (Blue-Black Amylose Helix)', value: 'iodine-test' },
          { label: '4. Biuret Protein Test (Copper-Peptide Violet Complex)', value: 'biuret-test' },
          { label: '5. Ninhydrin Test (Ruhemann’s Purple α-Amino Chromophore)', value: 'ninhydrin-test' },
          { label: '6. Translucent Grease Spot Test (Non-Volatile Lipid)', value: 'translucent-spot' },
          { label: '7. Acrolein Test (Glycerol Dehydration with KHSO₄)', value: 'acrolein-test' },
        ],
        editable: true,
      },
    ],
    renderType: 'food-testing-bench',
    colorTheme: '#ec4899',
  },
  {
    id: 'redox-titration-assembly',
    name: 'KMnO₄ Redox Titration Assembly with Upper Meniscus Indicator',
    subjectId: 'chemistry',
    category: 'instrument',
    description:
      'High-precision virtual redox titration assembly for potassium permanganate against standard Mohr’s salt and oxalic acid with self-indicator pale pink detection and upper meniscus reading.',
    iconName: 'Pipette',
    defaultWidth: 320,
    defaultHeight: 260,
    rotatable: false,
    ports: [],
    propertyDefinitions: [
      {
        id: 'system',
        label: 'Redox Titration System',
        type: 'select',
        defaultValue: 'kmno4-mohrs-salt',
        options: [
          { label: 'KMnO₄ vs Mohr’s Salt [FeSO₄·(NH₄)₂SO₄·6H₂O]', value: 'kmno4-mohrs-salt' },
          { label: 'KMnO₄ vs Standard Oxalic Acid [(COOH)₂·2H₂O]', value: 'kmno4-oxalic-acid' },
        ],
        editable: true,
      },
      {
        id: 'analyteVolumeMl',
        label: 'Analyte Volume Pipetted (mL)',
        type: 'select',
        defaultValue: 20,
        options: [
          { label: '10.0 mL Pipette', value: 10 },
          { label: '20.0 mL Pipette (Standard)', value: 20 },
          { label: '25.0 mL Pipette', value: 25 },
        ],
        editable: true,
      },
      {
        id: 'analyteMolarityM',
        label: 'Standard Analyte Molarity (M)',
        type: 'select',
        defaultValue: 0.05,
        options: [
          { label: 'M/50 (0.020 M)', value: 0.02 },
          { label: 'M/20 (0.050 M - Standard)', value: 0.05 },
          { label: 'M/10 (0.100 M)', value: 0.1 },
        ],
        editable: true,
      },
      {
        id: 'titrantMolarityM',
        label: 'KMnO₄ Stock Solution Molarity (M)',
        type: 'number',
        defaultValue: 0.02,
        min: 0.005,
        max: 0.1,
        step: 0.005,
        unit: 'M',
        editable: false,
      },
      {
        id: 'titrantDeliveredMl',
        label: 'KMnO₄ Delivered from Burette (mL)',
        type: 'number',
        defaultValue: 0.0,
        min: 0.0,
        max: 50.0,
        step: 0.2,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'acidAdded',
        label: 'Dilute H₂SO₄ Added (~20 mL 1:4)',
        type: 'boolean',
        defaultValue: true,
        editable: true,
      },
      {
        id: 'temperatureC',
        label: 'Conical Flask Temperature (°C)',
        type: 'number',
        defaultValue: 25,
        min: 15,
        max: 85,
        step: 5,
        unit: '°C',
        editable: true,
      },
    ],
    renderType: 'redox-titration-bench',
    colorTheme: '#a21caf',
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
    experimentId: 'paper-chromatography',
    title: 'Paper Chromatography (Separation of Inks & Pigments)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'chromatography-paper-strip',
      'developing-chamber',
      'chromatography-ruler',
      'pasteur-pipette-dropper',
      'beaker-100ml',
      'beaker-50ml',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'chamber-1',
        equipmentId: 'developing-chamber',
        title: 'Developing Chamber (with Lid)',
        x: 80,
        y: 80,
        rotation: 0,
        width: 140,
        height: 240,
        properties: {
          capacityMl: 200,
          liquidVolume: 25,
          reagentSolution: 'water-ethanol-eluent',
        },
        state: { chamberStatus: 'Vapor-saturated atmosphere' },
      },
      {
        id: 'paper-1',
        equipmentId: 'chromatography-paper-strip',
        title: 'Whatman #1 Chromatography Strip',
        x: 280,
        y: 80,
        rotation: 0,
        width: 110,
        height: 220,
        properties: {
          sampleInk: 'black-ink',
          elapsedSeconds: 60,
          isDeveloping: true,
        },
        state: { developmentStatus: 'Ascending Capillary Migration Active' },
      },
      {
        id: 'ruler-1',
        equipmentId: 'chromatography-ruler',
        title: 'Metric Chromatography Ruler (100mm)',
        x: 440,
        y: 90,
        rotation: 0,
        width: 50,
        height: 200,
        properties: {},
        state: { scale: '0 - 100 mm' },
      },
      {
        id: 'beaker-ink',
        equipmentId: 'beaker-100ml',
        title: 'Ink Sample Beaker',
        x: 550,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: {
          capacityMl: 100,
          liquidVolume: 30,
          reagentSolution: 'pure-water',
        },
        state: { samplePH: 7.0 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'chrom-step-1',
        stepNumber: 1,
        title: 'Prepare Developing Chamber Mobile Phase',
        instruction:
          'Inspect the developing chamber containing 25 mL of 80:20 water-ethanol eluent. Keep the chamber lid tightly sealed to ensure a vapor-saturated atmosphere.',
      },
      {
        id: 'chrom-step-2',
        stepNumber: 2,
        title: 'Draw Pencil Baseline & Spot Ink Sample',
        instruction:
          'On the chromatography paper strip, a pencil baseline is drawn ~20 mm from the bottom edge. Deposit a concentrated micro-drop of sample ink (Black Ink) on the origin mark.',
      },
      {
        id: 'chrom-step-3',
        stepNumber: 3,
        title: 'Suspend Paper Strip in Chamber',
        instruction:
          'Suspend the paper strip vertically into the chamber. Crucial: The bottom edge must touch the solvent, but the sample ink spot MUST remain above the liquid surface.',
      },
      {
        id: 'chrom-step-4',
        stepNumber: 4,
        title: 'Monitor Ascending Capillary Migration',
        instruction:
          'Watch the mobile phase ascend through the cellulose fibers via capillary action. As solvent moves, constituent dye pigments partition between stationary cellulose and ascending eluent.',
      },
      {
        id: 'chrom-step-5',
        stepNumber: 5,
        title: 'Measure Solvent Front and Pigment Bands',
        instruction:
          'Use the metric ruler to measure the distance from the baseline to the solvent front, and to the center of each separated dye band (Yellow, Crimson Red, Cyan Blue).',
      },
      {
        id: 'chrom-step-6',
        stepNumber: 6,
        title: 'Calculate Rf (Retention Factor) Values',
        instruction:
          'Compute Rf = (distance traveled by pigment) / (distance traveled by solvent front). Notice that Rf values are characteristic of each solute in a given solvent system.',
      },
    ],
    goals: [
      {
        id: 'goal-chamber-prep',
        description: 'Set up developing chamber with water-ethanol eluent mobile phase.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-paper-develop',
        description: 'Develop paper strip with ink sample (run development time ≥ 45s).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-rf-measurement',
        description: 'Measure pigment distances and solvent front to calculate Rf values.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Paper Chromatography Analysis (Whatman No. 1 Cellulose Paper):\n- Separation Mechanism: Partition chromatography between stationary phase (cellulose-bound water) and ascending mobile phase (80:20 H2O:Ethanol eluent).\n- Retention Factor Formula: Rf = (Distance traveled by pigment from baseline) / (Distance traveled by solvent front from baseline)\n\nObserved Rf Values (Standard Calibration):\n1. Black Sketch Pen Ink:\n   - Yellow Pigment: Rf ≈ 0.28 (Stronger adsorption to cellulose)\n   - Crimson Red: Rf ≈ 0.55 (Moderate partitioning)\n   - Cyan Blue: Rf ≈ 0.82 (High solubility in mobile phase)\n2. Green Marker Ink:\n   - Tartrazine Yellow: Rf ≈ 0.30\n   - Brilliant Blue FCF: Rf ≈ 0.78\n3. Brown Calligraphy Ink:\n   - Orange: Rf ≈ 0.32 | Crimson: Rf ≈ 0.58 | Indigo: Rf ≈ 0.85\n\nAssumptions & Theoretical Notes:\n- Capillary flow follows Lucas-Washburn diffusion kinetics: d(t) = d_max * (1 - e^(-t/tau)).\n- Constant partition coefficient K = Cs/Cm assumed throughout paper length.\n- Chamber is sealed; solvent evaporation during ascent is negligible.",
  },
  {
    experimentId: 'displacement-reaction',
    title: 'Displacement Reaction (Iron in Copper Sulphate)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'test-tube-rack',
      'iron-nail-substrate',
      'borosilicate-beaker',
      'beaker-100ml',
      'pasteur-pipette-dropper',
    ],
    initialObjects: [
      {
        id: 'tube-cu',
        equipmentId: 'test-tube-rack',
        title: 'Reaction Tube (0.5M CuSO₄)',
        x: 100,
        y: 110,
        rotation: 0,
        width: 80,
        height: 160,
        properties: { capacityMl: 50, liquidVolume: 30, reagentSolution: 'cuso4' },
        state: { solutionColor: '#2563eb', reactionStatus: 'Pre-immersion' },
      },
      {
        id: 'tube-control',
        equipmentId: 'test-tube-rack',
        title: 'Control Tube (0.5M CuSO₄)',
        x: 260,
        y: 110,
        rotation: 0,
        width: 80,
        height: 160,
        properties: { capacityMl: 50, liquidVolume: 30, reagentSolution: 'cuso4' },
        state: { solutionColor: '#2563eb', reactionStatus: 'Unreacted Reference' },
      },
      {
        id: 'nail-1',
        equipmentId: 'iron-nail-substrate',
        title: 'Clean Iron Nail (Fe)',
        x: 420,
        y: 130,
        rotation: 0,
        width: 120,
        height: 60,
        properties: { isImmersed: true, immersionTimeMinutes: 20 },
        state: {
          coatingDeposited: 'Reddish-brown elemental copper deposit',
          ironStatus: 'Displaced',
        },
      },
      {
        id: 'beaker-wash',
        equipmentId: 'beaker-100ml',
        title: 'Distilled H₂O Rinse',
        x: 580,
        y: 120,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 50, reagentSolution: 'pure-water' },
        state: { samplePH: 7.0 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'disp-step-1',
        stepNumber: 1,
        title: 'Prepare Two Matched Test Tubes with CuSO₄',
        instruction:
          'Observe the two test tubes containing 30 mL of 0.5M Copper(II) Sulphate solution. Both display a brilliant royal blue hue due to hydrated [Cu(H₂O)₆]²⁺ complex ions.',
      },
      {
        id: 'disp-step-2',
        stepNumber: 2,
        title: 'Inspect Sandpapered Iron Nail',
        instruction:
          'Examine the clean iron nail. Sandpapering with emery paper removes passive iron oxide (rust) film, exposing active metallic iron (Fe) for redox electron transfer.',
      },
      {
        id: 'disp-step-3',
        stepNumber: 3,
        title: 'Immerse Iron Nail into Reaction Tube',
        instruction:
          'Suspend the iron nail into the first test tube. Keep the second test tube unreacted as a visual color comparison control.',
      },
      {
        id: 'disp-step-4',
        stepNumber: 4,
        title: 'Observe Single Displacement Kinetics',
        instruction:
          'Over 15 to 20 minutes, observe the solution color gradually shifting from deep blue to pale green due to formation of iron(II) sulphate [Fe²⁺(aq)].',
      },
      {
        id: 'disp-step-5',
        stepNumber: 5,
        title: 'Examine Deposited Elemental Copper',
        instruction:
          'Notice the formation of a granular reddish-brown deposit on the iron nail surface. This is metallic copper (Cu) displaced from solution by the more reactive iron.',
      },
      {
        id: 'disp-step-6',
        stepNumber: 6,
        title: 'Analyze Redox Stoichiometry & Mass Change',
        instruction:
          'Write the balanced equation: Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s). Because Cu (63.55 g/mol) is heavier than Fe (55.85 g/mol), the coated nail shows a net mass increase!',
      },
    ],
    goals: [
      {
        id: 'goal-immersion',
        description: 'Immerse clean iron nail into 0.5M copper(II) sulphate solution for at least 15 minutes.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-color-change',
        description: 'Observe solution color shift from blue (Cu²⁺) to pale green (Fe²⁺ FeSO₄ formation).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-copper-deposit',
        description: 'Observe reddish-brown metallic copper deposition on iron nail and record observations.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Displacement Reaction Investigation:\n- Balanced Chemical Equation: Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s)\n- Ionic Net Equation: Fe(s) + Cu²⁺(aq) -> Fe²⁺(aq) + Cu(s)\n\nRedox Half-Reactions:\n1. Oxidation (Anode): Fe(s) -> Fe²⁺(aq) + 2e⁻  [Standard oxidation potential E° = +0.44 V]\n2. Reduction (Cathode): Cu²⁺(aq) + 2e⁻ -> Cu(s)  [Standard reduction potential E° = +0.34 V]\n- Net Cell Potential: E°cell = +0.78 V (> 0, thermodynamically spontaneous)\n\nReactivity Series Justification:\n- Iron (Fe) is positioned above Copper (Cu) in the metal activity series (K > Na > Ca > Mg > Al > Zn > Fe > Pb > [H] > Cu > Ag > Au).\n- Iron readily loses valence electrons to Cu²⁺ ions, displacing copper from solution.\n\nStoichiometric Mass Changes:\n- Dissolved Iron: 1 mole Fe = 55.85 g\n- Deposited Copper: 1 mole Cu = 63.55 g\n- Net mass gain of nail: Δm = (63.55 - 55.85) = +7.70 g per mole of iron reacted.\n\nSafety Note: Virtual simulation for educational inquiry. Copper sulphate is classified as harmful and hazardous to aquatic environments; handle with care in laboratories.",
  },
  {
    experimentId: 'crystallisation',
    title: 'Crystallisation of Copper Sulphate',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'bunsen-burner-tripod',
      'porcelain-evaporating-dish',
      'glass-stirring-rod',
      'watch-glass',
      'borosilicate-beaker',
      'beaker-100ml',
      'chemical-thermometer',
    ],
    initialObjects: [
      {
        id: 'burner-1',
        equipmentId: 'bunsen-burner-tripod',
        title: 'Bunsen Burner & Wire Gauze',
        x: 80,
        y: 100,
        rotation: 0,
        width: 110,
        height: 140,
        properties: { flameActive: true, heatingPowerWatts: 450 },
        state: { thermalStatus: 'Active Gas Flame' },
      },
      {
        id: 'dish-1',
        equipmentId: 'porcelain-evaporating-dish',
        title: 'China Dish (CuSO₄ Solution)',
        x: 260,
        y: 110,
        rotation: 0,
        width: 140,
        height: 90,
        properties: {
          solutionTemperatureC: 85,
          soluteMassGrams: 20,
          initialWaterVolumeMl: 50,
          evaporationTimeMins: 15,
          isHeating: true,
        },
        state: { crystallisationState: 'Heating & Concentrating Solution' },
      },
      {
        id: 'rod-1',
        equipmentId: 'glass-stirring-rod',
        title: 'Glass Stirring Rod',
        x: 440,
        y: 110,
        rotation: 0,
        width: 70,
        height: 140,
        properties: { isStirring: true },
        state: { status: 'Agitating Solution' },
      },
      {
        id: 'watchglass-1',
        equipmentId: 'watch-glass',
        title: 'Watch Glass Cover',
        x: 570,
        y: 130,
        rotation: 0,
        width: 100,
        height: 50,
        properties: { isCoveringDish: true },
        state: { coverStatus: 'Cooling Cover Ready' },
      },
      {
        id: 'thermometer-1',
        equipmentId: 'chemical-thermometer',
        title: 'Chemical Thermometer',
        x: 700,
        y: 90,
        rotation: 0,
        width: 60,
        height: 180,
        properties: { displayedTemp: 85 },
        state: { currentTemp: '85.0 °C' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'crys-step-1',
        stepNumber: 1,
        title: 'Prepare Hot Copper Sulphate Solution',
        instruction:
          'Observe the porcelain evaporating dish placed on the wire gauze tripod. 20 g of crude copper sulphate is dissolved in 50 mL of water, creating a blue solution.',
      },
      {
        id: 'crys-step-2',
        stepNumber: 2,
        title: 'Apply Thermal Heating to Evaporate Solvent',
        instruction:
          'Ignite the Bunsen burner. As heat raises the solution temperature to 80-85°C, solvent water evaporates, steadily concentrating the dissolved solute.',
      },
      {
        id: 'crys-step-3',
        stepNumber: 3,
        title: 'Stir Continuously with Glass Rod',
        instruction:
          'Agitate the boiling solution with the glass stirring rod to maintain uniform temperature and prevent crusting at the basin perimeter.',
      },
      {
        id: 'crys-step-4',
        stepNumber: 4,
        title: 'Test for Crystallisation Point',
        instruction:
          'Periodically dip the glass rod tip into the hot solution and withdraw it into the air. When a crust of tiny crystals forms rapidly on the rod, the crystallisation point is reached!',
      },
      {
        id: 'crys-step-5',
        stepNumber: 5,
        title: 'Cover with Watch Glass & Cool Undisturbed',
        instruction:
          'Turn off the burner. Cover the dish with a watch glass to prevent dust contamination and facilitate slow, uniform cooling without disturbance.',
      },
      {
        id: 'crys-step-6',
        stepNumber: 6,
        title: 'Harvest Pure Triclinic Blue Crystals',
        instruction:
          'As temperature drops to 20°C, solubility decreases sharply. Pure, well-formed blue triclinic crystals of copper sulphate pentahydrate (CuSO₄·5H₂O) separate out from the mother liquor.',
      },
    ],
    goals: [
      {
        id: 'goal-heating-sol',
        description: 'Heat CuSO₄ solution to elevated temperature (≥ 70°C) with active evaporation.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-crystallisation-point',
        description: 'Reach saturation / supersaturation threshold (saturation ratio ≥ 1.0).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-crystal-growth',
        description: 'Cool undisturbed to yield triclinic blue copper sulphate pentahydrate crystals.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Crystallisation & Purification of Copper Sulphate:\n- Principle: Purification technique based on the steep temperature dependency of solute solubility in water.\n- Crystal Habit: Triclinic pinacoidal blue crystals of Copper(II) Sulphate Pentahydrate (CuSO4·5H2O).\n\nSolubility Model: S(T) = 14.3 + 0.25*T + 0.003*T²  [g anhydrous CuSO4 / 100 mL H2O]\n- At 20°C (Room Temp): S(20) ≈ 20.5 g / 100 mL\n- At 85°C (Hot Solution): S(85) ≈ 57.2 g / 100 mL\n\nCrystallisation vs Simple Evaporation to Dryness:\n- Evaporation to dryness traps all soluble and insoluble impurities in the residue.\n- Slow crystallisation allows pure CuSO4·5H2O lattice growth while impurities remain dissolved in the mother liquor.\n\nStoichiometry of Pentahydrate Hydration:\n- Molar mass anhydrous CuSO4 = 159.61 g/mol\n- Molar mass pentahydrate CuSO4·5H2O = 249.68 g/mol\n- Yield multiplier: 249.68 / 159.61 = 1.564 g hydrate per g anhydrous solute\n\nSafety Precautions: Virtual laboratory simulation. In physical labs, use crucible tongs to handle hot porcelain dishes and wear splash-proof goggles.",
  },
  {
    experimentId: 'basic-lab-techniques',
    title: 'Basic Laboratory Techniques & Volumetric Transfer',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'borosilicate-beaker',
      'beaker-100ml',
      'beaker-50ml',
      'conical-flask',
      'graduated-measuring-cylinder',
      'pasteur-pipette-dropper',
      'glass-stirring-rod',
      'glass-funnel',
      'fluted-filter-paper',
      'graduated-burette-50ml',
      'digital-analytical-balance',
      'reagent-bottle',
      'watch-glass',
    ],
    initialObjects: [
      {
        id: 'burette-stand-1',
        equipmentId: 'graduated-burette-50ml',
        title: 'Graduated Burette (50 mL)',
        x: 80,
        y: 60,
        rotation: 0,
        width: 90,
        height: 280,
        properties: { capacityMl: 50, liquidVolume: 50, deliveredVolumeMl: 0, stopcockOpen: false, reagentSolution: 'hcl' },
        state: { meniscusReading: 0, status: 'Burette filled to 0.00 mL mark' },
      },
      {
        id: 'flask-receiver-1',
        equipmentId: 'conical-flask',
        title: 'Titration Conical Flask (150 mL)',
        x: 75,
        y: 350,
        rotation: 0,
        width: 100,
        height: 120,
        properties: { capacityMl: 150, liquidVolume: 0, reagentSolution: 'pure-water' },
        state: { fillPercentage: 0, status: 'Clean receiving vessel' },
      },
      {
        id: 'balance-1',
        equipmentId: 'digital-analytical-balance',
        title: 'Digital Analytical Balance',
        x: 320,
        y: 120,
        rotation: 0,
        width: 170,
        height: 130,
        properties: { sampleMassGrams: 5.000, tareOffsetGrams: 0, tarePressed: false, watchGlassPlaced: true },
        state: { displayedMassGrams: 20.320, status: 'Gross weight with watch glass' },
      },
      {
        id: 'cylinder-1',
        equipmentId: 'graduated-measuring-cylinder',
        title: 'Graduated Cylinder (100 mL)',
        x: 540,
        y: 100,
        rotation: 0,
        width: 90,
        height: 160,
        properties: { capacityMl: 100, liquidVolume: 25, reagentSolution: 'pure-water' },
        state: { fillPercentage: 25, status: '25.0 mL aliquot measured' },
      },
      {
        id: 'beaker-water-source',
        equipmentId: 'beaker-100ml',
        title: 'Stock Beaker (Distilled H₂O)',
        x: 690,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 75, reagentSolution: 'pure-water' },
        state: { samplePH: 7.0, status: 'Purified solvent reserve' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'blt-step-1',
        stepNumber: 1,
        title: 'Digital Balance Calibration and Taring',
        instruction:
          'Place the watch glass on the analytical balance pan. Press the Tare button to zero the balance, compensating for the tare weight so that subsequent readings reflect only the net sample mass.',
      },
      {
        id: 'blt-step-2',
        stepNumber: 2,
        title: 'Meniscus Reading in Graduated Cylinder',
        instruction:
          'Pour water into the measuring cylinder. Position your eye at the same horizontal level as the liquid surface to read the bottom of the concave meniscus, eliminating parallax error.',
      },
      {
        id: 'blt-step-3',
        stepNumber: 3,
        title: 'Inspect and Fill the 50 mL Burette',
        instruction:
          'Ensure the Teflon stopcock is closed (horizontal). Fill the burette with 0.1M HCl solution above the zero graduation, then tap gently to dislodge any air bubbles trapped in the delivery tip.',
      },
      {
        id: 'blt-step-4',
        stepNumber: 4,
        title: 'Deliver Measured Titre into Conical Flask',
        instruction:
          'Position the conical flask beneath the burette jet. Open the stopcock valve to deliver liquid. Observe the descending meniscus and close the valve exactly when the desired volume has been dispensed.',
      },
      {
        id: 'blt-step-5',
        stepNumber: 5,
        title: 'Gravimetric Verification of Transferred Aliquot',
        instruction:
          'Transfer the dispensed volume to the tared balance. Given that the density of dilute aqueous solutions at 25°C is ~1.000 g/mL, verify that 20.0 mL corresponds to ~20.000 g.',
      },
    ],
    goals: [
      {
        id: 'goal-tare-balance',
        description: 'Zero the digital balance using the tare feature to measure net mass.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-burette-delivery',
        description: 'Open the burette stopcock and deliver a measured volume into the receiving flask.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-volumetric-accuracy',
        description: 'Verify volume reading from meniscus alignment without parallax error.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Basic Laboratory Techniques — Observations & Principles:\n1. Parallax Elimination:\n- Transparent aqueous liquids form a concave meniscus due to glass wetting (adhesive forces > cohesive forces).\n- Always align the eye perpendicular to the graduated scale and read the lowest point of the concave meniscus.\n- For mercury or opaque liquids, read the upper convex boundary.\n\n2. Analytical Weighing Principles:\n- Gross Mass = Tare (vessel mass) + Net Mass (sample mass)\n- Electronic tare subtraction: Displayed Mass = Gross Mass - Tare Mass\n- Never weigh warm objects: convection currents inside draft shield exert upward aerodynamic buoyant forces.\n\n3. Volumetric Glassware Classification:\n- TD (To Deliver): Burettes and volumetric pipettes calibrated to release specified volume with drainage retention.\n- TC (To Contain): Volumetric flasks and measuring cylinders calibrated to hold exact specified volume.\n\n4. Laboratory Safety:\n- Always add acid to water, never water to acid (exothermic hydration hazard).\n- Lubricate glass tubing with water/glycerin before inserting through rubber corks.",
  },
  {
    experimentId: 'melting-point',
    title: 'Melting Point Determination with Thiele’s Tube',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'thiele-melting-apparatus',
      'bunsen-burner',
      'chemical-thermometer',
      'reagent-bottle',
    ],
    initialObjects: [
      {
        id: 'thiele-1',
        equipmentId: 'thiele-melting-apparatus',
        title: 'Thiele Tube Paraffin Assembly',
        x: 180,
        y: 80,
        rotation: 0,
        width: 180,
        height: 260,
        properties: { sampleId: 'benzoic-acid-solid', currentTempC: 118, isHeating: true, heatingRateDegPerSec: 1.0 },
        state: { meltFraction: 0, phase: 'solid', status: 'Pre-heating paraffin bath' },
      },
      {
        id: 'burner-thiele-1',
        equipmentId: 'bunsen-burner',
        title: 'Bunsen Burner (Side-Arm)',
        x: 215,
        y: 360,
        rotation: 0,
        width: 110,
        height: 100,
        properties: { isLit: true, flameType: 'non-luminous', burnerPower: 350 },
        state: { status: 'Gentle heating under triangular circulation loop' },
      },
      {
        id: 'reagent-benzoic',
        equipmentId: 'reagent-bottle',
        title: 'Sample: Pure Benzoic Acid',
        x: 480,
        y: 120,
        rotation: 0,
        width: 90,
        height: 120,
        properties: { reagentSolution: 'benzoic-acid-solid', capacityMl: 100, liquidVolume: 50 },
        state: { status: 'Dry crystalline standard (m.p. 122.4°C)' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'mp-step-1',
        stepNumber: 1,
        title: 'Capillary Packing and Thiele Tube Setup',
        instruction:
          'Ensure the organic solid sample is pulverized into fine powder. Pack into a thin-walled capillary tube sealed at one end to a height of 2-3 mm. Attach to the thermometer bulb with a rubber band above the liquid paraffin level.',
      },
      {
        id: 'mp-step-2',
        stepNumber: 2,
        title: 'Convection Loop Heating in Thiele Tube',
        instruction:
          'Apply the non-luminous Bunsen flame specifically to the triangular side-arm of the Thiele tube. This sets up continuous thermal convection currents, maintaining uniform bath temperature without mechanical stirring.',
      },
      {
        id: 'mp-step-3',
        stepNumber: 3,
        title: 'Observe Solid Softening (Melting Onset)',
        instruction:
          'As bath temperature approaches the expected melting point, slow the heating rate to ~1°C/min. Watch the opaque powder in the capillary closely for the first signs of sintering (formation of tiny droplets).',
      },
      {
        id: 'mp-step-4',
        stepNumber: 4,
        title: 'Record Sharp Melting Point and Meniscus Formation',
        instruction:
          'Record the temperature at which the entire sample transforms into a completely clear, transparent liquid meniscus. Pure Benzoic Acid melts sharply at 122.0 - 122.8°C.',
      },
      {
        id: 'mp-step-5',
        stepNumber: 5,
        title: 'Investigate Melting Point Depression with Impurities',
        instruction:
          'Select the Impure Benzoic Acid sample (containing 5% cinnamic acid). Observe that melting begins much earlier (~114.5°C) and spans a wide range (114.5 - 118.5°C), demonstrating the colligative effect of foreign solutes.',
      },
    ],
    goals: [
      {
        id: 'goal-heat-thiele',
        description: 'Heat paraffin bath to the melting point transition range.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-detect-liquefaction',
        description: 'Observe phase change from solid crystals to transparent liquid meniscus.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-purity-assessment',
        description: 'Distinguish between sharp melting (pure solid) and wide depressed range (impure mixture).',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Melting Point Determination — Experimental Record:\n\n1. Physical Principle:\n- Melting point is the temperature at which solid and liquid phases of a substance coexist in thermodynamic equilibrium at 1 atm:\n  Solid ⇌ Liquid  (ΔG_fus = ΔH_fus - T_m·ΔS_fus = 0  ==>  T_m = ΔH_fus / ΔS_fus)\n\n2. Standard Calibration Reference Values:\n- Benzoic Acid (C₆H₅COOH): 122.4°C (Literature sharp range: 122.0 - 122.8°C)\n- Urea ((NH₂)₂CO): 133.0°C (Literature sharp range: 132.5 - 133.5°C)\n- Naphthalene (C₁₀H₈): 80.2°C (Literature sharp range: 80.0 - 80.5°C)\n- Impure Benzoic Acid (5% Cinnamic Acid): 114.5 - 118.5°C (Depressed onset and broad range)\n\n3. Criterion of Purity:\n- Pure organic compounds melt sharply within a narrow range of 0.5 - 1.0°C.\n- Soluble impurities disrupt crystal lattice regularity, lowering the chemical potential and melting temperature (Freezing Point Depression: ΔT_f = K_f · m).\n\n4. Thiele Tube Convection Mechanism:\n- Heating the triangular arm creates a density gradient: warmer paraffin rises along the arm and flows down the main tube, ensuring uniform bath temperature without turbulent mechanical stirring.",
  },
  {
    experimentId: 'boiling-point',
    title: 'Boiling Point Determination by Inverted Capillary Method',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'boiling-point-apparatus',
      'bunsen-burner',
      'chemical-thermometer',
      'reagent-bottle',
    ],
    initialObjects: [
      {
        id: 'boiling-apparatus-1',
        equipmentId: 'boiling-point-apparatus',
        title: 'Siwoloboff Boiling Apparatus',
        x: 180,
        y: 80,
        rotation: 0,
        width: 180,
        height: 260,
        properties: { liquidId: 'ethanol-liquid', bathTempC: 75, isHeating: true, barometricPressureKPa: 101.325 },
        state: { bubbleStream: 'slow-occasional-bubbles', status: 'Pre-heating oil bath' },
      },
      {
        id: 'burner-bp-1',
        equipmentId: 'bunsen-burner',
        title: 'Bunsen Burner',
        x: 215,
        y: 360,
        rotation: 0,
        width: 110,
        height: 100,
        properties: { isLit: true, flameType: 'non-luminous', burnerPower: 300 },
        state: { status: 'Regulated indirect bath heating' },
      },
      {
        id: 'reagent-ethanol',
        equipmentId: 'reagent-bottle',
        title: 'Volatile Sample: Absolute Ethanol',
        x: 480,
        y: 120,
        rotation: 0,
        width: 90,
        height: 120,
        properties: { reagentSolution: 'ethanol-liquid', capacityMl: 100, liquidVolume: 50 },
        state: { status: 'Pure volatile alcohol (b.p. 78.3°C)' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'bp-step-1',
        stepNumber: 1,
        title: 'Prepare Micro-Boiling Tube and Inverted Capillary',
        instruction:
          'Place ~1 mL of the test liquid into a fusion tube. Insert a micro-capillary tube sealed at one end with its open end pointing downward into the liquid (Siwoloboff’s method).',
      },
      {
        id: 'bp-step-2',
        stepNumber: 2,
        title: 'Submerge Assembly in Heating Bath',
        instruction:
          'Fasten the fusion tube to the thermometer bulb so that the liquid sample level coincides with the thermometer mercury reservoir. Immerse into the paraffin oil bath.',
      },
      {
        id: 'bp-step-3',
        stepNumber: 3,
        title: 'Observe Air Bubble Expansion on Heating',
        instruction:
          'Apply gentle indirect heat. Trapped air inside the inverted capillary expands according to Charles’s Law (V ∝ T), releasing occasional slow bubbles from the open tip.',
      },
      {
        id: 'bp-step-4',
        stepNumber: 4,
        title: 'Identify Continuous Rapid Vapor Bubble Stream',
        instruction:
          'As temperature reaches the boiling point, the liquid’s vapor pressure equals external atmospheric pressure. A rapid, continuous train of vapor bubbles streams out of the capillary tip.',
      },
      {
        id: 'bp-step-5',
        stepNumber: 5,
        title: 'Extinguish Flame and Capture Liquid Re-entry Temperature',
        instruction:
          'Remove the flame. The bath cools slowly. The instant the rapid bubble stream ceases and liquid rushes up into the capillary tube, record the exact thermometer reading: this is the true boiling point.',
      },
    ],
    goals: [
      {
        id: 'goal-reach-boiling-stream',
        description: 'Heat sample liquid until a continuous rapid vapor bubble stream emerges.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-detect-liquid-suction',
        description: 'Capture the exact boiling point at the moment liquid rushes into the capillary on cooling.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-barometric-correction',
        description: 'Understand vapor pressure equilibrium and Clausius-Clapeyron atmospheric pressure dependence.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Boiling Point Determination — Experimental Record:\n\n1. Thermodynamic Definition:\n- The boiling point is the temperature at which the saturated vapor pressure of a liquid equals the surrounding barometric pressure:\n  P_vap(T_b) = P_atm\n\n2. Siwoloboff Inverted Capillary Mechanism:\n- The inverted sealed capillary acts as a vapor bubble nucleation site.\n- Stage 1 (T < T_b): Trapped air expands slowly (Charles's law), producing sporadic bubbles.\n- Stage 2 (T ≥ T_b): Liquid vapor pressure P_vap ≥ P_atm. Pure sample vapor continuously displaces liquid from the capillary, producing an uninterrupted stream of bubbles.\n- Stage 3 (Cooling): As soon as T drops below T_b by even 0.1°C, P_vap falls below P_atm, causing atmospheric pressure to abruptly force liquid up inside the capillary bore. This marks the true equilibrium boiling point.\n\n3. Standard Atmospheric Reference Values (101.325 kPa):\n- Absolute Ethanol (C₂H₅OH): 78.3°C\n- Pure Acetone (CH₃COCH₃): 56.1°C\n- Pure Ethyl Acetate (CH₃COOCH₂CH₃): 77.1°C\n- Pure Distilled Water (H₂O): 100.0°C\n\n4. Pressure Correction (Clausius-Clapeyron):\n- ln(P₂/P₁) = -ΔH_vap/R · (1/T₂ - 1/T₁)\n- In high altitude regions where barometric pressure is lower than 1 atm, liquids boil at correspondingly reduced temperatures.",
  },
  {
    experimentId: 'crystallisation-class11',
    title: 'Purification of Impure Samples by Fractional Crystallisation',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'borosilicate-beaker',
      'beaker-100ml',
      'beaker-50ml',
      'conical-flask',
      'glass-funnel',
      'fluted-filter-paper',
      'glass-stirring-rod',
      'porcelain-evaporating-dish',
      'watch-glass',
      'bunsen-burner',
      'digital-analytical-balance',
      'reagent-bottle',
    ],
    initialObjects: [
      {
        id: 'dish-impure-sample',
        equipmentId: 'porcelain-evaporating-dish',
        title: 'Porcelain Evaporating Dish',
        x: 100,
        y: 120,
        rotation: 0,
        width: 140,
        height: 90,
        properties: { soluteMassGrams: 20, initialWaterVolumeMl: 40, solutionTemperatureC: 85, evaporationTimeMins: 15, isHeating: true },
        state: { saturationStatus: 'supersaturated', crystalYieldGrams: 16.5, status: 'Crystallisation Point Reached' },
      },
      {
        id: 'burner-crys-c11',
        equipmentId: 'bunsen-burner',
        title: 'Bunsen Burner Stand',
        x: 115,
        y: 250,
        rotation: 0,
        width: 110,
        height: 100,
        properties: { isLit: true, flameType: 'non-luminous', burnerPower: 350 },
        state: { status: 'Concentrating hot filtered solution' },
      },
      {
        id: 'funnel-setup',
        equipmentId: 'glass-funnel',
        title: 'Hot Water Funnel & Fluted Paper',
        x: 320,
        y: 110,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { isFilterPaperPresent: true, funnelStatus: 'Clean' },
        state: { status: 'Hot gravity filtration active' },
      },
      {
        id: 'flask-receiver-c11',
        equipmentId: 'conical-flask',
        title: 'Receiver Conical Flask',
        x: 325,
        y: 260,
        rotation: 0,
        width: 100,
        height: 120,
        properties: { capacityMl: 150, liquidVolume: 40, reagentSolution: 'cuso4' },
        state: { fillPercentage: 27, status: 'Hot clear filtrate collected' },
      },
      {
        id: 'balance-crys',
        equipmentId: 'digital-analytical-balance',
        title: 'Analytical Balance (Yield Check)',
        x: 520,
        y: 120,
        rotation: 0,
        width: 170,
        height: 130,
        properties: { sampleMassGrams: 16.500, tareOffsetGrams: 15.320, tarePressed: false, watchGlassPlaced: true },
        state: { displayedMassGrams: 16.500, status: 'Pure dry crystal mass: 16.500 g' },
      },
      {
        id: 'watch-glass-cover',
        equipmentId: 'watch-glass',
        title: 'Watch Glass Cover',
        x: 720,
        y: 130,
        rotation: 0,
        width: 100,
        height: 50,
        properties: { isCoveringDish: true },
        state: { status: 'Placed over dish for undisturbed cooling' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'c11-crys-step-1',
        stepNumber: 1,
        title: 'Dissolve Impure Sample in Minimum Boiling Solvent',
        instruction:
          'Weigh 20.0 g of the impure sample (copper sulphate or benzoic acid with insoluble dust/sand). Dissolve in minimum quantity (~40 mL) of boiling distilled water with continuous stirring.',
      },
      {
        id: 'c11-crys-step-2',
        stepNumber: 2,
        title: 'Rapid Hot Gravity Filtration',
        instruction:
          'Filter the boiling solution immediately through fluted filter paper in a preheated glass funnel. The insoluble grit and particulate matter remain on the filter paper while the hot clear solution passes through.',
      },
      {
        id: 'c11-crys-step-3',
        stepNumber: 3,
        title: 'Concentrate Filtrate to Crystallisation Point',
        instruction:
          'Heat the filtrate gently in a porcelain dish to evaporate excess solvent until the crystallisation point is reached: a glass rod dipped into the hot solution and blown dry develops an opaque crust of micro-crystals.',
      },
      {
        id: 'c11-crys-step-4',
        stepNumber: 4,
        title: 'Undisturbed Slow Cooling',
        instruction:
          'Extinguish the flame. Cover the dish with a watch glass and allow the saturated solution to cool undisturbed at room temperature. Slow cooling permits orderly crystal lattice growth without trapping mother liquor.',
      },
      {
        id: 'c11-crys-step-5',
        stepNumber: 5,
        title: 'Separate, Dry, and Weigh Pure Crystals',
        instruction:
          'Filter off mother liquor using vacuum/suction filtration. Dry the purified crystals between folds of filter paper and weigh on the analytical balance to determine percentage recovery yield.',
      },
    ],
    goals: [
      {
        id: 'goal-hot-filtration',
        description: 'Filter boiling solution through fluted paper to eliminate insoluble impurities.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-saturation-point',
        description: 'Evaporate to crystallisation point where solute saturation ratio reaches ≥ 1.0.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-percentage-yield',
        description: 'Calculate percentage recovery yield: (mass of dry pure crystals / initial crude mass) × 100%.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Fractional Crystallisation & Purification — Laboratory Record:\n\n1. Recrystallisation Principles:\n- Differential temperature solubility coefficient: The compound must have high solubility at solvent boiling point and low solubility at room/ice temperature.\n- Separation of Impurities:\n  a) Insoluble impurities removed during hot gravity filtration.\n  b) Soluble impurities remain dissolved in mother liquor during cooling because their concentrations remain well below their saturation limits.\n\n2. Recovery Yield Calculation:\n- Initial Crude Sample Mass: 20.000 g\n- Insoluble Residue on Filter: 1.800 g\n- Purified Dry Crystals Harvested: 16.500 g\n- Percentage Recovery Yield = (16.500 g / 20.000 g) × 100% = 82.5%\n\n3. Fluted Filter Paper Advantage:\n- Fluted folding increases effective surface area and creates air channels between paper and funnel cone, drastically accelerating filtration velocity before premature cooling causes clogging.\n\n4. Crystallisation Point Test:\n- Dip a clean glass stirring rod into the simmering solution, withdraw it, and blow gently. Appearance of a thin white/translucent crystalline film verifies that the solution has reached the saturation threshold.",
  },
  {
    experimentId: 'ph-determination',
    title: 'pH Determination of Fruit Juices, Salts & Buffers',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'beaker-100ml',
      'beaker-50ml',
      'spotting-plate-cavities',
      'pasteur-pipette-dropper',
      'universal-ph-strip',
      'reagent-bottle',
    ],
    initialObjects: [
      {
        id: 'spot-plate-ph',
        equipmentId: 'spotting-plate-cavities',
        title: 'Porcelain Spotting Plate',
        x: 60,
        y: 110,
        rotation: 0,
        width: 180,
        height: 120,
        properties: {},
        state: { cavityStatus: 'Ready for micro-aliquots' },
      },
      {
        id: 'beaker-orange',
        equipmentId: 'beaker-50ml',
        title: 'Orange Juice (pH 3.6)',
        x: 270,
        y: 80,
        rotation: 0,
        width: 90,
        height: 110,
        properties: { capacityMl: 50, liquidVolume: 25, reagentSolution: 'orange-juice' },
        state: { samplePH: 3.6, liquidColor: '#f97316', status: 'Citrus juice sample' },
      },
      {
        id: 'beaker-nh4cl',
        equipmentId: 'beaker-50ml',
        title: '0.1M NH₄Cl (pH 5.13)',
        x: 380,
        y: 80,
        rotation: 0,
        width: 90,
        height: 110,
        properties: { capacityMl: 50, liquidVolume: 25, reagentSolution: 'nh4cl-solution' },
        state: { samplePH: 5.13, liquidColor: '#f8fafc', status: 'Acidic salt solution' },
      },
      {
        id: 'beaker-ch3coona',
        equipmentId: 'beaker-50ml',
        title: '0.1M CH₃COONa (pH 8.87)',
        x: 490,
        y: 80,
        rotation: 0,
        width: 90,
        height: 110,
        properties: { capacityMl: 50, liquidVolume: 25, reagentSolution: 'ch3coona-solution' },
        state: { samplePH: 8.87, liquidColor: '#f8fafc', status: 'Basic salt solution' },
      },
      {
        id: 'beaker-buffer',
        equipmentId: 'beaker-50ml',
        title: 'Acetate Buffer (pH 4.74)',
        x: 600,
        y: 80,
        rotation: 0,
        width: 90,
        height: 110,
        properties: { capacityMl: 50, liquidVolume: 25, reagentSolution: 'acetate-buffer' },
        state: { samplePH: 4.74, liquidColor: '#f8fafc', status: 'Equimolar buffer standard' },
      },
      {
        id: 'pipette-ph-1',
        equipmentId: 'pasteur-pipette-dropper',
        title: 'Universal Indicator Dropper',
        x: 710,
        y: 90,
        rotation: 0,
        width: 90,
        height: 150,
        properties: { drawnReagent: 'universal-indicator', dropCount: 2 },
        state: { status: 'Dispensing indicator dye' },
      },
      {
        id: 'strip-ph-1',
        equipmentId: 'universal-ph-strip',
        title: 'Narrow-Range pH Strip',
        x: 270,
        y: 240,
        rotation: 0,
        width: 90,
        height: 150,
        properties: { dippedInSample: 'orange-juice' },
        state: { indicatedPH: 3.6, colorHex: '#f97316', status: 'pH 3.6 (Orange: Citric/Ascorbic)' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'phd-step-1',
        stepNumber: 1,
        title: 'Dispense Aliquots into Porcelain Spotting Plate',
        instruction:
          'Using clean droppers, transfer 3 drops of each test solution (Orange Juice, 0.1M NH₄Cl, 0.1M CH₃COONa, Acetate Buffer) into separate labeled cavities of the spotting plate.',
      },
      {
        id: 'phd-step-2',
        stepNumber: 2,
        title: 'Apply Universal Indicator & Match Color Chart',
        instruction:
          'Add 1 drop of Universal Indicator to each cavity. Compare the developed hue against the standard pH color scale: Orange Juice yields bright orange (pH ~3.6); NH₄Cl yields yellow-green (pH ~5.1); CH₃COONa yields blue-green (pH ~8.9).',
      },
      {
        id: 'phd-step-3',
        stepNumber: 3,
        title: 'Verify Salt Hydrolysis Equilibrium',
        instruction:
          'Observe that NH₄Cl (salt of weak base + strong acid) hydrolyzes acidic (pH 5.13) via NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺. In contrast, CH₃COONa (salt of weak acid + strong base) hydrolyzes alkaline (pH 8.87) via CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻.',
      },
      {
        id: 'phd-step-4',
        stepNumber: 4,
        title: 'Evaluate Buffer Capacity with Acetate Buffer',
        instruction:
          'Test the acetate buffer solution (pH 4.74). Notice how its equimolar composition of acetic acid and sodium acetate maintains constant pH, resisting hydronium/hydroxide shifts according to the Henderson-Hasselbalch relation.',
      },
    ],
    goals: [
      {
        id: 'goal-measure-fruit-juice',
        description: 'Determine the pH of natural fruit juice using indicator colorimetry.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-salt-hydrolysis',
        description: 'Contrast acidic cation hydrolysis in NH₄Cl against basic anion hydrolysis in CH₃COONa.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-buffer-action',
        description: 'Verify buffer action and Henderson-Hasselbalch equilibrium in acetate buffer.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Quantitative pH Determination — Experimental Record:\n\n1. Mathematical Formulation:\n- pH = -log₁₀[H₃O⁺]  |  pOH = -log₁₀[OH⁻]  |  pH + pOH = 14.00 (at 25°C, Kw = 1.0 × 10⁻¹⁴)\n\n2. Tested Solutions & Chemical Equivalence:\n- Fresh Orange Juice: pH 3.6 (Citric acid C₆H₈O₇ + Ascorbic acid C₆H₈O₆)\n- Fresh Tomato Extract: pH 4.3 (Citric + Malic acids)\n- Natural Apple Juice: pH 3.9 (Predominantly L-malic acid)\n\n3. Salt Hydrolysis Mechanics:\n- Ammonium Chloride (NH₄Cl): Salt of Strong Acid (HCl) + Weak Base (NH₄OH)\n  NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺  ==>  pH = 7 - 0.5(pKb + log C) = 7 - 0.5(4.74 + (-1)) = 5.13  (Acidic)\n- Sodium Acetate (CH₃COONa): Salt of Weak Acid (CH₃COOH) + Strong Base (NaOH)\n  CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻  ==>  pH = 7 + 0.5(pKa + log C) = 7 + 0.5(4.74 + (-1)) = 8.87  (Basic)\n- Sodium Chloride (NaCl): Neutral, neither ion hydrolyzes appreciably ==> pH 7.00\n\n4. Buffer Solutions (Henderson-Hasselbalch):\n- Acidic Buffer: pH = pKa + log([Salt]/[Acid])\n- For equimolar 0.1M CH₃COOH + 0.1M CH₃COONa:\n  pH = 4.74 + log(0.1/0.1) = 4.74 + 0 = 4.74\n- Addition of small amounts of strong acid is neutralized by CH₃COO⁻; addition of base is neutralized by CH₃COOH.",
  },
  {
    experimentId: 'strong-vs-weak-acids',
    title: 'Strong vs Weak Acids: Equilibrium Ionisation & Reaction Kinetics',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'acid-comparison-bench',
      'beaker-100ml',
      'graduated-measuring-cylinder',
      'pasteur-pipette-dropper',
      'universal-ph-strip',
      'reagent-bottle',
    ],
    initialObjects: [
      {
        id: 'acid-bench-1',
        equipmentId: 'acid-comparison-bench',
        title: 'Acid Comparison Comparator Bench',
        x: 180,
        y: 80,
        rotation: 0,
        width: 280,
        height: 200,
        properties: { concentrationM: 0.1, solutionVolumeMl: 50, magnesiumAdded: true, mgMassMg: 24.3 },
        state: {
          strongPH: 1.0,
          weakPH: 2.88,
          hydroniumRatio: 76.1,
          strongAlphaPercent: 100,
          weakAlphaPercent: 1.31,
          totalHydrogenYieldMl: 24.0,
          status: 'HCl (α=100%, pH 1.0) vs CH₃COOH (α=1.31%, pH 2.88). [H⁺] ratio: 76.1×',
        },
      },
      {
        id: 'beaker-hcl-stock',
        equipmentId: 'beaker-100ml',
        title: 'Stock: 0.1M HCl (aq)',
        x: 520,
        y: 90,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 60, reagentSolution: 'hcl' },
        state: { samplePH: 1.0, status: 'Strong mineral acid (α = 1.00)' },
      },
      {
        id: 'beaker-acetic-stock',
        equipmentId: 'beaker-100ml',
        title: 'Stock: 0.1M CH₃COOH (aq)',
        x: 660,
        y: 90,
        rotation: 0,
        width: 110,
        height: 130,
        properties: { capacityMl: 100, liquidVolume: 60, reagentSolution: 'acetic-acid' },
        state: { samplePH: 2.88, status: 'Weak organic acid (Ka = 1.75 × 10⁻⁵)' },
      },
      {
        id: 'strip-acid-1',
        equipmentId: 'universal-ph-strip',
        title: 'HCl Indicator Strip',
        x: 190,
        y: 320,
        rotation: 0,
        width: 90,
        height: 150,
        properties: { dippedInSample: 'hcl' },
        state: { indicatedPH: 1.0, colorHex: '#ef4444', status: 'Scarlet Red (pH 1.0)' },
      },
      {
        id: 'strip-acid-2',
        equipmentId: 'universal-ph-strip',
        title: 'CH₃COOH Indicator Strip',
        x: 340,
        y: 320,
        rotation: 0,
        width: 90,
        height: 150,
        properties: { dippedInSample: 'acetic-acid' },
        state: { indicatedPH: 2.88, colorHex: '#f97316', status: 'Orange (pH 2.88)' },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'swa-step-1',
        stepNumber: 1,
        title: 'Configure Equimolar Acid Solutions',
        instruction:
          'Set up 0.1M Hydrochloric Acid and 0.1M Acetic Acid in the comparative test chambers. Both solutions have identical total molar solute concentration (0.10 mol/L).',
      },
      {
        id: 'swa-step-2',
        stepNumber: 2,
        title: 'Measure and Contrast Equilibrium pH',
        instruction:
          'Record the measured pH: HCl registers pH 1.00 ([H⁺] = 0.100 M), whereas CH₃COOH registers pH 2.88 ([H⁺] = 0.00131 M). Despite equal molarity, the strong acid possesses ~76.1 times higher free hydronium ion concentration!',
      },
      {
        id: 'swa-step-3',
        stepNumber: 3,
        title: 'Calculate Degree of Dissociation (α)',
        instruction:
          'Strong HCl is completely ionised (α = 1.00 = 100%). Acetic acid exists in dynamic dissociation equilibrium: CH₃COOH ⇌ CH₃COO⁻ + H⁺ with Ka = 1.75 × 10⁻⁵, giving an ionisation degree of only α = 1.31% at 0.1M.',
      },
      {
        id: 'swa-step-4',
        stepNumber: 4,
        title: 'Add Magnesium Metal Strips and Compare Reaction Rates',
        instruction:
          'Introduce identical 24.3 mg strips of cleaned magnesium ribbon into both vessels simultaneously. Observe that HCl produces vigorous, rapid hydrogen gas effervescence while CH₃COOH exhibits a mild, gentle bubbling rate.',
      },
      {
        id: 'swa-step-5',
        stepNumber: 5,
        title: 'Verify Stoichiometric Equivalence of Total Hydrogen Evolved',
        instruction:
          'Notice that when the magnesium completely reacts (limiting reactant: 1.0 mmol Mg), BOTH vessels produce exactly 24.0 mL of H₂ gas at STP. This proves: Acid strength governs the REACTION RATE, while stoichiometric amount determines TOTAL YIELD.',
      },
    ],
    goals: [
      {
        id: 'goal-compare-ph',
        description: 'Measure and compare the pH of equimolar strong and weak acid solutions.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-calculate-alpha',
        description: 'Calculate degree of dissociation α for weak acetic acid using Ostwald’s dilution law.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-kinetics-vs-stoichiometry',
        description: 'Verify that initial effervescence rate depends on [H⁺] while total H₂ yield depends on stoichiometry.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Strong vs Weak Acids — Ionisation Equilibrium & Kinetics:\n\n1. Ionisation Models:\n- Strong Acid (HCl): Full dissociation (single arrow)\n  HCl(aq) + H₂O(l) ⟶ H₃O⁺(aq) + Cl⁻(aq)\n  At C = 0.1M: [H₃O⁺] = 0.100 M ==> pH = -log(0.1) = 1.00  |  α = 100%\n\n- Weak Acid (CH₃COOH): Reversible dissociation equilibrium\n  CH₃COOH(aq) + H₂O(l) ⇌ H₃O⁺(aq) + CH₃COO⁻(aq)\n  Ka = [H₃O⁺][CH₃COO⁻] / [CH₃COOH] = (C·α²) / (1 - α) ≈ C·α² = 1.75 × 10⁻⁵\n  At C = 0.1M: α = √(Ka/C) = √(1.75×10⁻⁵ / 0.1) = 0.01323 (1.32%)\n  [H₃O⁺] = C·α = 0.001314 M ==> pH = -log(0.001314) = 2.88\n\n2. Ostwald's Dilution Law:\n- As solution concentration decreases, the degree of dissociation α increases:\n  At 0.1M: α = 1.31%, pH = 2.88\n  At 0.01M: α = 4.10%, pH = 3.39\n  At 0.001M: α = 12.4%, pH = 3.91\n\n3. Reaction Kinetics with Active Metals (Magnesium Ribbon):\n  Mg(s) + 2H⁺(aq) ⟶ Mg²⁺(aq) + H₂(g)↑\n- Rate Law: Rate = k · [H⁺] · Surface_Area\n  Ratio of initial effervescence rates = [H⁺]_HCl / [H⁺]_acetic = 0.100 / 0.001314 = 76.1×\n\n4. Critical Scientific Distinction:\n- ACID STRENGTH: Governed by Ka / [H⁺], dictating initial reaction velocity and pH.\n- ACID CAPACITY / AMOUNT: Governed by total available moles (C × V), dictating total neutralisation titre and gas volume evolved.",
  },
  {
    experimentId: 'chemical-equilibrium',
    title: 'Chemical Equilibrium: Le Chatelier’s Principle & Dynamic Reversibility',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'closed-equilibrium-chamber',
      'beaker-100ml',
      'test-tube-rack',
      'pasteur-pipette-dropper',
      'chemical-thermometer',
    ],
    initialObjects: [
      {
        id: 'eq-chamber-1',
        equipmentId: 'closed-equilibrium-chamber',
        title: 'Reaction Equilibrium Vessel',
        x: 180,
        y: 100,
        rotation: 0,
        width: 260,
        height: 240,
        properties: {
          systemType: 'fe-scn',
          temperatureC: 25,
          addedFe3PlusM: 0,
          addedSCNMinusM: 0,
          addedFluorideM: 0,
          gasVolumeL: 1.0,
        },
        state: {},
      },
      {
        id: 'reagent-pipette-1',
        equipmentId: 'pasteur-pipette-dropper',
        title: 'Perturbation Dropper',
        x: 480,
        y: 120,
        rotation: 0,
        width: 45,
        height: 160,
        properties: {
          drawnReagent: 'feso4',
          dropCount: 10,
        },
        state: {},
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'step-baseline-eq',
        stepNumber: 1,
        title: 'Observe Dynamic Solution Equilibrium',
        instruction:
          'Observe the baseline blood-red color of the iron(III)-thiocyanate complex Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺ at 25°C with equilibrium constant Kc = 138 M⁻¹.',
      },
      {
        id: 'step-concentrate-fe',
        stepNumber: 2,
        title: 'Perturb Reactant Concentration (Add Fe³⁺)',
        instruction:
          'Increase added Fe³⁺ concentration to 0.005 M. Notice how Q < Kc shifts the equilibrium forward, producing a darker deep blood-red coloration.',
      },
      {
        id: 'step-sequestration-f',
        stepNumber: 3,
        title: 'Sequestration with Fluoride Ions (F⁻)',
        instruction:
          'Add fluoride ions (0.005 M). Fluoride forms the ultra-stable, colorless [FeF₆]³⁻ complex, effectively depleting free Fe³⁺ and forcing the equilibrium in reverse.',
      },
      {
        id: 'step-temperature-shift',
        stepNumber: 4,
        title: 'Evaluate Temperature Effect (van ’t Hoff)',
        instruction:
          'Because the forward reaction is exothermic (ΔH° = -24.2 kJ/mol), chilling to 5°C increases Kc and shifts forward, whereas heating to 60°C shifts reverse.',
      },
      {
        id: 'step-gas-compression',
        stepNumber: 5,
        title: 'Evaluate Gaseous Compression (2 NO₂ ⇌ N₂O₄)',
        instruction:
          'Switch the system to 2NO₂(g) ⇌ N₂O₄(g). Decrease volume to 0.5 L to increase pressure and observe the forward shift toward fewer gas moles (colorless N₂O₄).',
      },
    ],
    goals: [
      {
        id: 'goal-concentration-shift',
        description: 'Demonstrate Le Chatelier shift by perturbing reactant and complexing agent concentrations.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-temperature-shift',
        description: 'Verify the van ’t Hoff temperature dependency for exothermic reversible systems.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-gaseous-equilibrium',
        description: 'Verify volume and pressure shifts in 2NO₂(g) ⇌ N₂O₄(g) gas equilibrium.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Chemical Equilibrium & Le Chatelier's Principle — Experimental Record:\n\n1. Solution Complex Reversible Equilibrium:\n  Fe³⁺(aq, pale yellow) + SCN⁻(aq, colorless) ⇌ [Fe(SCN)]²⁺(aq, blood-red)\n- Equilibrium Constant: Kc = [[Fe(SCN)]²⁺] / ([Fe³⁺][SCN⁻]) = 138 M⁻¹ at 25°C (298.15 K)\n- Enthalpy Change: ΔH° = -24.2 kJ/mol (Exothermic)\n\n2. Perturbations Observed:\n- Addition of Fe³⁺ or SCN⁻: Increases reactant concentrations, causing Q < Kc. By Le Chatelier’s principle, the system shifts forward to consume excess reactants, intensifying blood-red absorbance (Beer-Lambert Law at 450 nm).\n- Addition of F⁻: Fluoride reacts with Fe³⁺ to form the extremely stable, colorless [FeF₆]³⁻ complex (Kf ~ 10¹⁵). This depletes free Fe³⁺ ions. By Le Chatelier’s principle, the equilibrium shifts in reverse, causing complete decolorization to pale yellow.\n- Effect of Temperature (van 't Hoff equation):\n  ln(Kc₂/Kc₁) = (-ΔH°/R) · (1/T₂ - 1/T₁)\n  Because ΔH° < 0: Lowering temperature increases Kc (favoring forward blood-red complex); heating decreases Kc (favoring dissociation).\n\n3. Gaseous Equilibrium System:\n  2 NO₂(g, reddish-brown) ⇌ N₂O₄(g, colorless)  |  ΔH° = -57.2 kJ/mol\n- Pressure / Volume Compression: Compressing gas volume increases total pressure. The equilibrium shifts toward the side with fewer moles of gas (2 mol NO₂ ⟶ 1 mol N₂O₄), lightening the amber vapor intensity.\n- Temperature: Heating favors endothermic reverse dissociation into dark brown NO₂; cooling favors forward synthesis of colorless N₂O₄.",
  },
  {
    experimentId: 'standard-solution-prep',
    title: 'Preparation of a Standard Solution of Oxalic Acid (0.1 M / 250 mL)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'volumetric-flask-250ml',
      'digital-analytical-balance',
      'borosilicate-beaker',
      'glass-stirring-rod',
      'filter-funnel',
      'pasteur-pipette-dropper',
      'reagent-bottle',
      'watch-glass',
    ],
    initialObjects: [
      {
        id: 'vol-flask-1',
        equipmentId: 'volumetric-flask-250ml',
        title: '250 mL Volumetric Flask',
        x: 180,
        y: 80,
        rotation: 0,
        width: 150,
        height: 240,
        properties: {
          soluteType: 'oxalic-acid',
          targetMolarity: 0.1,
          weighedMassGrams: 3.152,
          liquidVolume: 250.0,
          isDissolved: true,
          isStoppered: true,
          isInvertedHomogeneous: true,
        },
        state: {},
      },
      {
        id: 'analytical-balance-1',
        equipmentId: 'digital-analytical-balance',
        title: 'Analytical Balance',
        x: 420,
        y: 160,
        rotation: 0,
        width: 170,
        height: 130,
        properties: {
          sampleMassGrams: 3.152,
          tareOffsetGrams: 0,
          tarePressed: false,
          watchGlassPlaced: true,
        },
        state: {},
      },
      {
        id: 'prep-beaker-1',
        equipmentId: 'borosilicate-beaker',
        title: 'Dissolution Beaker (250mL)',
        x: 30,
        y: 150,
        rotation: 0,
        width: 130,
        height: 150,
        properties: {
          liquidVolume: 50,
          reagentSolution: 'pure-water',
        },
        state: {},
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'step-calculate-mass',
        stepNumber: 1,
        title: 'Calculate Solute Mass Required',
        instruction:
          'For 250 mL of 0.1 M Oxalic Acid Dihydrate (Mw = 126.07 g/mol): w = (M * Mw * V) / 1000 = (0.1 * 126.07 * 250) / 1000 = 3.152 g.',
      },
      {
        id: 'step-weigh-solute',
        stepNumber: 2,
        title: 'Weigh Solute on Analytical Balance',
        instruction:
          'Place watch glass on balance pan, press Tare to zero the reading, and weigh out exactly 3.152 g of pure oxalic acid crystals.',
      },
      {
        id: 'step-dissolve-beaker',
        stepNumber: 3,
        title: 'Dissolve in Beaker with Stirring Rod',
        instruction:
          'Transfer weighed crystals into a beaker containing ~50 mL distilled water. Stir thoroughly until completely dissolved.',
      },
      {
        id: 'step-transfer-dilute',
        stepNumber: 4,
        title: 'Transfer to Volumetric Flask & Align Meniscus',
        instruction:
          'Transfer quantitatively through a funnel. Rinse beaker and funnel. Add distilled water until the bottom of the curved meniscus sits tangent to the etched 250 mL line.',
      },
      {
        id: 'step-homogenize-flask',
        stepNumber: 5,
        title: 'Stopper and Invert for Homogeneity',
        instruction:
          'Insert ground-glass stopper firmly and invert the flask 10 times to ensure uniform concentration throughout the 250 mL volume.',
      },
    ],
    goals: [
      {
        id: 'goal-stoichiometry-calc',
        description: 'Accurately calculate solute mass required for target molarity and volume.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-meniscus-alignment',
        description: 'Align the curved liquid meniscus precisely with the graduation ring.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-standard-solution-accuracy',
        description: 'Produce standard solution with less than 0.5% concentration error.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Preparation of Standard Solution of Oxalic Acid — Experimental Record:\n\n1. Primary Standard Solute Data:\n- Solute: Oxalic Acid Dihydrate (H₂C₂O₄·2H₂O)\n- Molar Mass (Mw): 126.07 g/mol\n- Basicity: 2 (Diprotic acid: H₂C₂O₄ + 2NaOH ⟶ Na₂C₂O₄ + 2H₂O)\n- Equivalent Weight: 126.07 / 2 = 63.035 g/equiv\n\n2. Mass Calculation Formula:\n  w = (M · Mw · V) / 1000\n  For M = 0.100 M and V = 250.0 mL:\n  w = (0.100 × 126.07 × 250.0) / 1000 = 3.15175 g ≈ 3.152 g\n  (For 0.05 M solution: w = 1.576 g)\n\n3. Quantitative Analytical Steps:\n- Watch glass tared on analytical balance with 0.001 g resolution.\n- Weighed crystals dissolved in ~50 mL warm distilled water.\n- Transferred quantitatively via funnel; rinsings collected in 250 mL Class-A volumetric flask.\n- Diluted dropwise with dropper until bottom of meniscus is exactly tangent to etched ring.\n- Stoppered and inverted 10 times to ensure uniform diffusion.\n\n4. Verified Outcome:\n- Actual Molarity M = (w_actual × 1000) / (Mw × V_actual) = 0.1000 M\n- Normality N = M × basicity = 0.1000 × 2 = 0.2000 N\n- Error Percentage: < 0.1%",
  },
  {
    experimentId: 'acid-base-titration',
    title: 'Determination of NaOH Strength by Titration against Standard Oxalic Acid',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'titration-workbench',
      'graduated-burette-50ml',
      'conical-flask',
      'pasteur-pipette-dropper',
      'chemical-thermometer',
    ],
    initialObjects: [
      {
        id: 'titration-station-1',
        equipmentId: 'titration-workbench',
        title: 'Precision Titration Assembly',
        x: 180,
        y: 60,
        rotation: 0,
        width: 280,
        height: 280,
        properties: {
          system: 'oxalic-acid-naoh',
          analyteVolumeMl: 20.0,
          analyteMolarityM: 0.1,
          titrantMolarityM: 0.1,
          titrantDeliveredMl: 0.0,
          indicator: 'phenolphthalein',
          isSwirling: true,
        },
        state: {},
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'step-setup-analyte',
        stepNumber: 1,
        title: 'Measure Standard Acid into Conical Flask',
        instruction:
          'Pipette out 20.0 mL of standard 0.1 M oxalic acid into the conical flask and add 2 drops of phenolphthalein indicator.',
      },
      {
        id: 'step-zero-burette',
        stepNumber: 2,
        title: 'Fill Burette with Sodium Hydroxide',
        instruction:
          'Fill burette with ~0.1 M NaOH solution and adjust the liquid level to 0.0 mL, ensuring no air bubbles are trapped in the tip.',
      },
      {
        id: 'step-approach-endpoint',
        stepNumber: 3,
        title: 'Titrate with Continuous Swirling',
        instruction:
          'Open the stopcock and deliver NaOH titrant dropwise while swirling continuously. Observe transient pink flashes disappearing as acid neutralizes base.',
      },
      {
        id: 'step-detect-endpoint',
        stepNumber: 4,
        title: 'Detect Sharp Permanent Pale Pink Endpoint',
        instruction:
          'Add titrant drop-by-drop until a single drop imparts a faint permanent pale pink coloration that persists for at least 30 seconds (Veq = 40.0 mL).',
      },
      {
        id: 'step-calculate-strength',
        stepNumber: 5,
        title: 'Calculate NaOH Molarity and Gram Strength',
        instruction:
          'Apply the stoichiometric relation: 2 * Ma * Va = Mb * Vb. Hence, Mb = (2 * 0.1 * 20.0) / 40.0 = 0.100 M. Strength = Mb * 40.0 = 4.00 g/L.',
      },
    ],
    goals: [
      {
        id: 'goal-detect-titration-endpoint',
        description: 'Detect the sharp equivalence point using phenolphthalein indicator.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-concordant-titre',
        description: 'Determine concordant titre volume within ±0.1 mL.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-calculate-molarity',
        description: 'Calculate unknown base molarity and strength in g/L.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Determination of NaOH Molarity & Strength by Oxalic Acid Titration — Experimental Record:\n\n1. Chemical Reaction & Stoichiometry:\n  H₂C₂O₄·2H₂O + 2 NaOH ⟶ Na₂C₂O₄ + 4 H₂O\n- Stoichiometric Mole Ratio: 1 mol oxalic acid neutralizes 2 mol NaOH.\n- Acid: Oxalic acid (Diprotic weak acid, Ma = 0.100 M, Va = 20.0 mL)\n- Base: Sodium hydroxide (Strong base, Mb = ?, Vb = Titre volume)\n\n2. Mathematical Equivalence:\n  (Ma · Va) / n_acid = (Mb · Vb) / n_base\n  (0.100 × 20.0) / 1 = (Mb × Vb) / 2\n  ==> Mb = (2 × Ma × Va) / Vb = (2 × 0.100 × 20.0) / Vb = 4.00 / Vb\n\n3. Titration Observations:\n- Indicator: Phenolphthalein (2 drops)\n- Color Change: Colorless ⟶ Permanent Pale Pink\n- pH at Equivalence Point: pH ≈ 8.4 (Alkaline salt hydrolysis of C₂O₄²⁻)\n- Concordant Titre Volume Vb: 40.0 mL\n\n4. Calculations:\n- Molarity of NaOH: Mb = 4.00 / 40.0 = 0.100 M\n- Strength of NaOH: S = Mb × Mw(NaOH) = 0.100 × 40.00 = 4.00 g/L\n\n5. Precautions:\n- Avoid over-titration into deep magenta (pH > 10).\n- Ensure no air bubbles in burette nozzle before initial reading.\n- Swirl continuously to ensure rapid equilibration.",
  },
  {
    experimentId: 'salt-analysis-class11',
    title: 'Qualitative Analysis of Inorganic Salts: Systematic Radicals Identification',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'salt-analysis-workbench',
      'test-tube-rack',
      'pasteur-pipette-dropper',
      'glass-stirring-rod',
      'chemical-thermometer',
    ],
    initialObjects: [
      {
        id: 'salt-bench-1',
        equipmentId: 'salt-analysis-workbench',
        title: 'Qualitative Analysis Workbench',
        x: 160,
        y: 80,
        rotation: 0,
        width: 320,
        height: 240,
        properties: {
          selectedSalt: 'nh4cl',
          currentTest: 'physical',
        },
        state: {},
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'step-physical-exam',
        stepNumber: 1,
        title: 'Physical Examination of Sample',
        instruction:
          'Observe color, crystalline form, and odor. Blue indicates Cu²⁺; light green indicates Fe²⁺; white indicates absence of colored transition metal ions.',
      },
      {
        id: 'step-dry-heating',
        stepNumber: 2,
        title: 'Dry Heating Test in Ignition Tube',
        instruction:
          'Heat a pinch of dry salt in an ignition tube. Sublimation indicates NH₄⁺; decrepitation with brown NO₂ gas indicates Pb(NO₃)₂; water vapor indicates hydrated crystals.',
      },
      {
        id: 'step-flame-test',
        stepNumber: 3,
        title: 'Flame Test (Conc. HCl Paste)',
        instruction:
          'Moisten sample with concentrated HCl on a platinum/nichrome loop. Brick-red flame indicates Ca²⁺; bluish-green indicates Cu²⁺; dull bluish-white indicates Pb²⁺.',
      },
      {
        id: 'step-acid-radicals',
        stepNumber: 4,
        title: 'Systematic Anion Tests (Dilute & Conc. H₂SO₄)',
        instruction:
          'Test with dilute H₂SO₄ for CO₃²⁻, then conc. H₂SO₄ for Cl⁻ (pungent fumes giving dense white clouds with NH₄OH) or NO₃⁻ (brown fumes with copper turnings).',
      },
      {
        id: 'step-cation-group',
        stepNumber: 5,
        title: 'Systematic Cation Group Separation',
        instruction:
          'Determine the cation group from Original Solution (OS): Zero (NH₄⁺), Group I (Pb²⁺), Group II (Cu²⁺), Group III (Fe²⁺, Al³⁺), Group IV (Zn²⁺), Group V (Ca²⁺), Group VI (Mg²⁺).',
      },
      {
        id: 'step-confirmatory-tests',
        stepNumber: 6,
        title: 'Perform Confirmatory Wet Tests',
        instruction:
          'Run wet confirmatory tests for both the identified acid radical and basic radical to establish definitive chemical identity.',
      },
    ],
    goals: [
      {
        id: 'goal-identify-anion',
        description: 'Correctly identify the acid radical (anion) using group reagents and confirmatory tests.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-identify-cation',
        description: 'Correctly identify the basic radical (cation) using systematic group separation.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-salt-deduction',
        description: 'Synthesize observations and write the complete empirical formula and chemical name of the salt.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Systematic Qualitative Salt Analysis — Experimental Record:\n\n1. Standard Catalogue of Salts Investigated:\n- NH₄Cl: Zero Group cation (NH₄⁺), Conc H₂SO₄ anion (Cl⁻)\n- Pb(NO₃)₂: Group I cation (Pb²⁺), Conc H₂SO₄ anion (NO₃⁻)\n- CuSO₄·5H₂O: Group II cation (Cu²⁺), Independent anion (SO₄²⁻)\n- FeSO₄·7H₂O: Group III cation (Fe²⁺), Independent anion (SO₄²⁻)\n- AlCl₃: Group III cation (Al³⁺), Conc H₂SO₄ anion (Cl⁻)\n- ZnSO₄·7H₂O: Group IV cation (Zn²⁺), Independent anion (SO₄²⁻)\n- CaCl₂: Group V cation (Ca²⁺), Conc H₂SO₄ anion (Cl⁻)\n- MgSO₄·7H₂O: Group VI cation (Mg²⁺), Independent anion (SO₄²⁻)\n\n2. Anion Group Classification & Confirmatory Tests:\n- Chloride (Cl⁻): Conc H₂SO₄ ⟶ HCl gas (dense white fumes with NH₄OH rod).\n  Confirmatory: Acidify OS with dil HNO₃ + AgNO₃ ⟶ Curdy white AgCl precipitate soluble in dil NH₄OH.\n- Sulphate (SO₄²⁻): Independent radical.\n  Confirmatory: Acidify OS with dil HCl + BaCl₂ ⟶ Dense white BaSO₄ precipitate insoluble in conc HCl.\n- Nitrate (NO₃⁻): Conc H₂SO₄ + Cu turnings ⟶ Dense reddish-brown NO₂ gas; solution turns blue.\n  Confirmatory (Brown Ring Test): OS + freshly prepared FeSO₄ + conc H₂SO₄ along side of tube ⟶ Dark brown ring of [Fe(H₂O)₅(NO)]SO₄ at junction.\n\n3. Cation Group Separation Reagents & Outcomes:\n- Zero Group (NH₄⁺): Heat with NaOH ⟶ NH₃ gas evolved (turns Nessler's reagent brown).\n- Group I (Pb²⁺): OS + dil HCl ⟶ White PbCl₂ ppt (soluble in hot water; KI gives golden yellow PbI₂ spangles).\n- Group II (Cu²⁺): Acidified OS + H₂S ⟶ Black CuS ppt (excess NH₄OH gives deep azure-blue [Cu(NH₃)₄]²⁺).\n- Group III (Fe²⁺, Al³⁺): OS + NH₄Cl + NH₄OH ⟶ Dirty green Fe(OH)₂ (Turnbull's blue with K₃[Fe(CN)₆]) or gelatinous white Al(OH)₃ (blue lake test).\n- Group IV (Zn²⁺): Group III filtrate + H₂S ⟶ Grayish-white ZnS ppt (soluble in NaOH to clear zincate).\n- Group V (Ca²⁺): OS + NH₄Cl + NH₄OH + (NH₄)₂CO₃ ⟶ White CaCO₃ ppt (brick-red flame; ammonium oxalate gives white CaC₂O₄ ppt).\n- Group VI (Mg²⁺): Group V filtrate + NH₄OH + Na₂HPO₄ ⟶ White crystalline Mg(NH₄)PO₄ ppt (Magneson gives sky blue lake).",
  },
  {
    experimentId: 'organic-element-detection',
    title: 'Qualitative Detection of Nitrogen, Sulphur, and Halogens in Organic Compounds',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'element-detection-workbench',
      'test-tube-rack',
      'pasteur-pipette-dropper',
      'glass-stirring-rod',
    ],
    initialObjects: [
      {
        id: 'element-bench-1',
        equipmentId: 'element-detection-workbench',
        title: 'Lassaigne Extract Testing Station',
        x: 160,
        y: 80,
        rotation: 0,
        width: 320,
        height: 240,
        properties: {
          selectedSample: 'urea',
          currentTest: 'nitrogen-prussian-blue',
        },
        state: {},
      },
    ],
    initialConnections: [],
    guidedSteps: [
      {
        id: 'step-fusion-principle',
        stepNumber: 1,
        title: 'Understand Lassaigne Sodium Fusion Principle',
        instruction:
          'Organic elements covalently bound in compounds are converted during sodium fusion into water-soluble ionic sodium salts: C, N ⟶ NaCN; S ⟶ Na₂S; Halogens ⟶ NaX (X = Cl, Br, I).',
      },
      {
        id: 'step-test-nitrogen',
        stepNumber: 2,
        title: 'Prussian Blue Test for Nitrogen',
        instruction:
          'Add FeSO₄ and NaOH to Lassaigne filtrate, boil, cool, acidify with dilute H₂SO₄, and add FeCl₃. Observe brilliant Prussian Blue precipitate Fe₄[Fe(CN)₆]₃.',
      },
      {
        id: 'step-test-sulphur-nitro',
        stepNumber: 3,
        title: 'Sodium Nitroprusside Test for Sulphur',
        instruction:
          'Select Thiourea or Sulphanilic acid. Add freshly prepared Sodium Nitroprusside solution to Lassaigne filtrate. Observe immediate magnificent purple/violet coloration.',
      },
      {
        id: 'step-test-sulphur-lead',
        stepNumber: 4,
        title: 'Lead Acetate Test for Sulphur',
        instruction:
          'Acidify filtrate with acetic acid, then add lead acetate solution. Observe a dense black precipitate of Lead Sulphide (PbS).',
      },
      {
        id: 'step-test-halogens',
        stepNumber: 5,
        title: 'Silver Nitrate Test for Halogens',
        instruction:
          'Select Chlorobenzene, Bromobenzene, or Iodobenzene. Boil filtrate with HNO₃, cool, add AgNO₃. Differentiate Cl (curdy white, soluble in NH₄OH), Br (pale yellow), I (bright yellow).',
      },
    ],
    goals: [
      {
        id: 'goal-detect-nitrogen',
        description: 'Detect presence of Nitrogen via Prussian Blue coloration.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-detect-sulphur',
        description: 'Detect presence of Sulphur using nitroprusside and lead acetate tests.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-differentiate-halogens',
        description: 'Differentiate Chlorine, Bromine, and Iodine by silver halide precipitate colors and solubility.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Detection of Elements (N, S, Halogens) in Organic Compounds — Experimental Record:\n\n1. Principle of Lassaigne's Test (Sodium Fusion Extract):\n  Covalent organic molecules do not ionize in aqueous solution. Fusion with metallic sodium converts covalently bound extra elements into ionic sodium salts:\n- Nitrogen: Na + C + N ⟶ NaCN (Sodium cyanide)\n- Sulphur: 2 Na + S ⟶ Na₂S (Sodium sulphide)\n- Halogens: Na + X ⟶ NaX (Sodium halide, where X = Cl, Br, I)\n- Nitrogen + Sulphur together: Na + C + N + S ⟶ NaSCN (Sodium thiocyanate)\n\n2. Test for Nitrogen (Prussian Blue Reaction):\n  6 NaCN + FeSO₄ ⟶ Na₄[Fe(CN)₆] + Na₂SO₄\n  3 Na₄[Fe(CN)₆] + 4 FeCl₃ ⟶ Fe₄[Fe(CN)₆]₃(s, Prussian Blue) + 12 NaCl\n- Observation: Brilliant Prussian blue precipitate confirms Nitrogen.\n\n3. Tests for Sulphur:\n- Sodium Nitroprusside Test:\n  Na₂S + Na₂[Fe(CN)₅NO] ⟶ Na₄[Fe(CN)₅NOS] (Brilliant purple/violet complex)\n- Lead Acetate Test:\n  Na₂S + (CH₃COO)₂Pb ⟶ PbS(s, black precipitate) + 2 CH₃COONa\n\n4. Tests for Halogens (Silver Nitrate Test):\n- Boiling with conc. HNO₃ first is essential if N or S is present, to expel HCN and H₂S, which would otherwise precipitate black Ag₂S or white AgCN.\n- Chlorine: Curdy white precipitate of AgCl, completely soluble in dilute NH₄OH.\n  AgCl + 2 NH₄OH ⟶ [Ag(NH₃)₂]Cl(aq) + 2 H₂O\n- Bromine: Pale yellow precipitate of AgBr, sparingly soluble in dilute NH₄OH.\n- Iodine: Canary yellow precipitate of AgI, completely insoluble in dilute NH₄OH.\n\n5. Test Organic Samples Summary:\n- Urea (NH₂CONH₂): Nitrogen POSITIVE, Sulphur NEGATIVE, Halogens NEGATIVE\n- Thiourea (NH₂CSNH₂): Nitrogen POSITIVE, Sulphur POSITIVE, Halogens NEGATIVE\n- Sulphanilic Acid (H₂N-C₆H₄-SO₃H): Nitrogen POSITIVE, Sulphur POSITIVE, Halogens NEGATIVE\n- Chlorobenzene (C₆H₅Cl): Halogen (Chlorine) POSITIVE, Nitrogen & Sulphur NEGATIVE\n- Bromobenzene (C₆H₅Br): Halogen (Bromine) POSITIVE, Nitrogen & Sulphur NEGATIVE\n- Iodobenzene (C₆H₅I): Halogen (Iodine) POSITIVE, Nitrogen & Sulphur NEGATIVE\n- Benzoic Acid (C₆H₅COOH): All Extra Elements NEGATIVE (Pure C, H, O).",
  },
  {
    experimentId: 'surface-chemistry',
    title: 'Surface Chemistry (Colloid Preparation & Tyndall Scattering)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'colloid-apparatus',
      'borosilicate-beaker',
      'pasteur-pipette-dropper',
      'glass-stirring-rod',
    ],
    initialObjects: [
      {
        id: 'colloid-bench-1',
        equipmentId: 'colloid-apparatus',
        title: 'Colloidal Analysis Assembly',
        x: 140,
        y: 80,
        rotation: 0,
        width: 340,
        height: 250,
        properties: {
          solType: 'feoh3-sol',
          laserActive: true,
          electrolyte: 'none',
          electrolyteVolumeMl: 0,
        },
        state: {
          solName: 'Hydrated Ferric Hydroxide Sol [Fe(OH)₃ / Fe³⁺]',
          tyndallIntensityPercent: 92,
          coagulationStatus: 'stable-colloid',
        },
      },
      {
        id: 'beaker-sol-1',
        equipmentId: 'borosilicate-beaker',
        title: 'Distilled Water Stock',
        x: 520,
        y: 90,
        rotation: 0,
        width: 100,
        height: 120,
        properties: { capacityMl: 250 },
        state: { liquidColorHex: '#38bdf8' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-surf-1',
        stepNumber: 1,
        title: 'Prepare Positive Fe(OH)₃ Lyophobic Sol',
        instruction:
          'Observe the deep reddish-brown ferric hydroxide sol formed by hydrolysis of 2% FeCl₃ in vigorously boiling water: FeCl₃ + 3H₂O → Fe(OH)₃(sol) + 3HCl.',
      },
      {
        id: 'step-surf-2',
        stepNumber: 2,
        title: 'Observe Tyndall Scattering Effect',
        instruction:
          'With the transverse 650 nm laser pointer ACTIVE, observe the intense illuminated Tyndall scattering cone produced by colloidal particles.',
      },
      {
        id: 'step-surf-3',
        stepNumber: 3,
        title: 'Contrast with True Solution and Lyophilic Sol',
        instruction:
          'Switch sample to Aqueous NaCl (true solution, <1 nm) to confirm the complete absence of a Tyndall cone, then to Starch Sol to observe moderate scattering.',
      },
      {
        id: 'step-surf-4',
        stepNumber: 4,
        title: 'Investigate Hardy-Schulze Coagulation Rule',
        instruction:
          'Return to Fe(OH)₃ positive sol and add K₄[Fe(CN)₆] containing quadrivalent [Fe(CN)₆]⁴⁻ anions to induce rapid complete coagulation and precipitation.',
      },
    ],
    goals: [
      {
        id: 'goal-tyndall-scatter',
        description: 'Verify the Tyndall effect occurs exclusively in colloidal systems (1 - 1000 nm) and is absent in true solutions.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-hardy-schulze',
        description: 'Demonstrate that coagulating power scales with the valence of the opposing ion (Hardy-Schulze rule).',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Surface Chemistry & Colloids Practical Notes:\n\n1. Classification of Colloidal Systems:\n- Lyophobic Sols (Solvent-hating): Irreversible, unstable, easily coagulated by trace electrolytes. Examples: Fe(OH)₃ (+ve sol stabilized by adsorbed Fe³⁺), As₂S₃ (-ve sol stabilized by adsorbed S²⁻).\n- Lyophilic Sols (Solvent-loving): Reversible, highly stable due to extensive hydration shell. Example: Starch sol.\n- True Solutions: Molecular/ionic size < 1 nm; transparent; completely pass through filter paper and cellophane membrane.\n\n2. Optical Properties — Tyndall Effect:\n- Colloidal particles scatter incident light transversely if diameter is comparable to wavelength and refractive index differs from dispersion medium.\n- Lyophobic Fe(OH)₃: High refractive index contrast ⟶ Intense luminous Tyndall beam.\n- Lyophilic Starch: Low refractive index contrast due to solvation sheath ⟶ Moderate Tyndall cone.\n- True Solution (NaCl): Particle size < 1 nm ⟶ Zero Tyndall scattering (beam passes invisibly).\n\n3. Coagulation & Hardy-Schulze Rule:\n- Coagulating power is proportional to the valence of the coagulating counter-ion.\n- For Positive Fe(OH)₃ sol: Coagulating power: [Fe(CN)₆]⁴⁻ (valence 4) ≫ SO₄²⁻ (valence 2) ≫ Cl⁻ (valence 1).\n- Coagulating values: [Fe(CN)₆]⁴⁻ ~ 0.09 mmol/L, SO₄²⁻ ~ 0.4 mmol/L, Cl⁻ ~ 9.5 mmol/L.",
  },
  {
    experimentId: 'chemical-kinetics',
    title: 'Chemical Kinetics (Na2S2O3 + HCl Concentration & Rate Study)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'kinetics-cross-bench',
      'graduated-cylinder-50ml',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'kinetics-bench-1',
        equipmentId: 'kinetics-cross-bench',
        title: 'Kinetics Cross Obscuration Station',
        x: 140,
        y: 80,
        rotation: 0,
        width: 340,
        height: 250,
        properties: {
          volumeThiosulphateMl: 50,
          volumeWaterMl: 0,
          volumeHclMl: 10,
          temperatureC: 25,
          isReactionStarted: true,
          elapsedSeconds: 0,
        },
        state: {
          effectiveThioM: 0.0833,
          timeToObscureSec: 16.0,
          ratePerSec: 0.0625,
          crossObscured: false,
          crossVisibilityPercent: 100,
        },
      },
      {
        id: 'beaker-kin-stock',
        equipmentId: 'borosilicate-beaker',
        title: '0.1M Na₂S₂O₃ Stock Solution',
        x: 520,
        y: 90,
        rotation: 0,
        width: 100,
        height: 120,
        properties: { capacityMl: 250 },
        state: { liquidColorHex: '#fef08a' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-kin-1',
        stepNumber: 1,
        title: 'Flask A: High Concentration Run (50 mL Thiosulphate)',
        instruction:
          'Set 50 mL of 0.1M Na₂S₂O₃ and 0 mL water. Mix with 10 mL 1.0M HCl and observe the rapid formation of colloidal sulphur obscuring the black cross mark in ~16 seconds.',
      },
      {
        id: 'step-kin-2',
        stepNumber: 2,
        title: 'Flask B: Diluted Run (40 mL Thiosulphate + 10 mL Water)',
        instruction:
          'Reduce thiosulphate volume to 40 mL and add 10 mL distilled water. Notice that lower reactant concentration increases obscuration time to ~20 seconds.',
      },
      {
        id: 'step-kin-3',
        stepNumber: 3,
        title: 'Flasks C, D, and E Serial Dilutions',
        instruction:
          'Test 30 mL, 20 mL, and 10 mL thiosulphate volumes. Record times: 27s, 40s, and 80s respectively.',
      },
      {
        id: 'step-kin-4',
        stepNumber: 4,
        title: 'Plot 1/t vs Concentration & Temperature Effect',
        instruction:
          'Plot Rate (1/t) versus [Na₂S₂O₃]. A straight line passing through origin confirms first-order kinetics. Vary temperature to 35°C and 45°C to observe Arrhenius rate acceleration.',
      },
    ],
    goals: [
      {
        id: 'goal-rate-conc',
        description: 'Prove that reaction rate is directly proportional to concentration of sodium thiosulphate (Rate ∝ 1/t ∝ [Na₂S₂O₃]).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-arrhenius-temp',
        description: 'Verify that increasing reaction temperature substantially increases the reaction rate constant k.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Chemical Kinetics — Reaction between Sodium Thiosulphate and Hydrochloric Acid:\n\n1. Chemical Equation:\n  Na₂S₂O₃(aq) + 2 HCl(aq) ⟶ 2 NaCl(aq) + SO₂(g) + S(s, colloidal sulphur) + H₂O(l)\n\n2. Principle of Measurement:\n- Elemental sulphur forms a fine milky yellow colloidal suspension.\n- The flask is placed over a white glazed tile with a bold black cross mark (+).\n- As sulphur particles accumulate, light transmission decreases.\n- Time (t) taken for the cross to become completely obscured from above is recorded.\n- Reaction rate is taken as inversely proportional to obscuration time: Rate ∝ 1 / t.\n\n3. Experimental Data Matrix (Standard Run at 25°C, total volume = 60 mL):\n- Flask A: 50 mL Thio + 0 mL H₂O ⟶ [Na₂S₂O₃] = 0.0833 M ⟶ t = 16.0 s ⟶ Rate = 0.0625 s⁻¹\n- Flask B: 40 mL Thio + 10 mL H₂O ⟶ [Na₂S₂O₃] = 0.0667 M ⟶ t = 20.0 s ⟶ Rate = 0.0500 s⁻¹\n- Flask C: 30 mL Thio + 20 mL H₂O ⟶ [Na₂S₂O₃] = 0.0500 M ⟶ t = 26.7 s ⟶ Rate = 0.0375 s⁻¹\n- Flask D: 20 mL Thio + 30 mL H₂O ⟶ [Na₂S₂O₃] = 0.0333 M ⟶ t = 40.0 s ⟶ Rate = 0.0250 s⁻¹\n- Flask E: 10 mL Thio + 40 mL H₂O ⟶ [Na₂S₂O₃] = 0.0167 M ⟶ t = 80.0 s ⟶ Rate = 0.0125 s⁻¹\n\n4. Conclusion:\n- The plot of 1/t against [Na₂S₂O₃] gives a straight line passing through the origin.\n- Hence, Rate = k [Na₂S₂O₃]¹ (First order reaction with respect to thiosulphate).",
  },
  {
    experimentId: 'thermochemistry',
    title: 'Thermochemistry (Enthalpy of Neutralization)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'calorimeter-assembly',
      'graduated-cylinder-50ml',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'calorimeter-1',
        equipmentId: 'calorimeter-assembly',
        title: 'Polystyrene Cup Calorimeter Assembly',
        x: 140,
        y: 80,
        rotation: 0,
        width: 340,
        height: 250,
        properties: {
          reactionType: 'neutralization-hcl-naoh',
          volumeAcidMl: 50,
          volumeBaseMl: 50,
          waterEquivalentW: 25,
          isMixed: true,
          elapsedSeconds: 25,
        },
        state: {
          theoreticalDeltaH: -57.32,
          experimentalDeltaH: -57.32,
          currentTempC: 28.5,
          peakTempC: 28.5,
          heatEvolvedJoules: 2866,
        },
      },
      {
        id: 'beaker-thermo-base',
        equipmentId: 'borosilicate-beaker',
        title: '1.0M NaOH Stock',
        x: 520,
        y: 90,
        rotation: 0,
        width: 100,
        height: 120,
        properties: { capacityMl: 250 },
        state: { liquidColorHex: '#e0f2fe' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-therm-1',
        stepNumber: 1,
        title: 'Equilibrate Reagent Temperatures',
        instruction:
          'Measure 50 mL of 1.0M HCl in the calorimeter cup and 50 mL of 1.0M NaOH in a measuring cylinder. Confirm both are at steady initial temperature (22.0°C).',
      },
      {
        id: 'step-therm-2',
        stepNumber: 2,
        title: 'Rapid Mixing Inside Insulated Cup',
        instruction:
          'Quickly pour the 1.0M NaOH into the calorimeter cup, insert the differential Beckman thermometer and stirrer, and stir smoothly.',
      },
      {
        id: 'step-therm-3',
        stepNumber: 3,
        title: 'Record Peak Exothermic Temperature Rise',
        instruction:
          'Monitor temperature rising sharply to ~28.5°C (ΔT = +6.5°C) before beginning slow cooling.',
      },
      {
        id: 'step-therm-4',
        stepNumber: 4,
        title: 'Calculate Enthalpy of Neutralization ΔH_neut',
        instruction:
          'Calculate total heat capacity C = (100 g × 4.184 J/g·K + 25 J/K) = 443.4 J/K, heat evolved q = C × ΔT = 2866 J, and ΔH_neut = -q / 0.050 mol = -57.3 kJ/mol.',
      },
    ],
    goals: [
      {
        id: 'goal-enthalpy-calc',
        description: 'Accurately determine enthalpy of neutralization of strong acid with strong base and verify theoretical constant -57.32 kJ/mol.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-water-equiv',
        description: 'Account for calorimeter water equivalent W in the calorimetric heat balance equation.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Thermochemistry — Enthalpy of Neutralization of Strong Acid (HCl) and Strong Base (NaOH):\n\n1. Theory & Chemical Principle:\n- Strong acids and strong bases are completely ionised in dilute aqueous solution.\n- Neutralization is fundamentally the union of hydrated hydronium and hydroxide ions to form water:\n  H⁺(aq) + OH⁻(aq) ⟶ H₂O(l)\n- Since neither the spectator cation (Na⁺) nor anion (Cl⁻) participate, standard enthalpy of neutralization for any strong acid with any strong base is constant: ΔH°_neut = -57.32 kJ/mol.\n\n2. Formulae:\n- Heat capacity of calorimetric system: C_total = (m_sol × c_water + W)\n  where m_sol = V_HCl + V_NaOH = 50 + 50 = 100 g, c = 4.184 J/(g·K), W = 25.0 J/K.\n- Heat evolved: q = C_total × ΔT = (100 × 4.184 + 25) × 6.46 = 443.4 × 6.46 ≈ 2866 Joules.\n- Moles of water formed: n = 0.050 L × 1.0 mol/L = 0.050 moles.\n- Enthalpy of Neutralization: ΔH_neut = -q / (n × 1000) = -2866 / 50 = -57.32 kJ/mol.\n\n3. Weak Acid Comparison (CH₃COOH + NaOH):\n- Measured ΔH_neut = -55.90 kJ/mol.\n- The lower value (~1.4 kJ/mol less exothermic) is due to heat absorbed in complete ionization of acetic acid: ΔH_dissociation(CH₃COOH) = +1.42 kJ/mol.",
  },
  {
    experimentId: 'electrochemistry',
    title: 'Electrochemistry (Galvanic Daniell Cell & Nernst Equation)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'daniell-cell-apparatus',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'daniell-cell-1',
        equipmentId: 'daniell-cell-apparatus',
        title: 'Galvanic Daniell Cell Assembly',
        x: 140,
        y: 80,
        rotation: 0,
        width: 340,
        height: 250,
        properties: {
          zincConcentrationM: 1.0,
          copperConcentrationM: 1.0,
          saltBridgeInserted: true,
          voltmeterPolarityReversed: false,
          temperatureC: 25,
        },
        state: {
          standardEmfVolts: 1.103,
          measuredEmfVolts: 1.103,
          voltmeterReadingText: '+1.103 V',
          circuitClosed: true,
        },
      },
      {
        id: 'beaker-cu-sol',
        equipmentId: 'borosilicate-beaker',
        title: '1.0M CuSO₄ Catholyte Stock',
        x: 520,
        y: 90,
        rotation: 0,
        width: 100,
        height: 120,
        properties: { capacityMl: 250 },
        state: { liquidColorHex: '#0284c7' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-dan-1',
        stepNumber: 1,
        title: 'Construct Standard Daniell Cell (1.0M / 1.0M)',
        instruction:
          'Immerse zinc electrode into 1.0M ZnSO₄ (anode) and copper electrode into 1.0M CuSO₄ (cathode). Connect terminals to high-impedance digital voltmeter.',
      },
      {
        id: 'step-dan-2',
        stepNumber: 2,
        title: 'Insert Agar-Agar KCl Salt Bridge',
        instruction:
          'Insert the U-tube salt bridge to complete the electrochemical circuit. Observe the voltmeter read standard cell EMF E° = +1.103 V (circuit was open 0.000 V without salt bridge).',
      },
      {
        id: 'step-dan-3',
        stepNumber: 3,
        title: 'Vary [Zn²⁺] Concentration (Nernst Equation Verification)',
        instruction:
          'Decrease [Zn²⁺] to 0.1M and 0.01M with [Cu²⁺] constant at 1.0M. Observe cell potential increase to +1.133 V and +1.162 V respectively (slope = -0.0296 V per decade).',
      },
      {
        id: 'step-dan-4',
        stepNumber: 4,
        title: 'Vary [Cu²⁺] and Check Terminal Polarity',
        instruction:
          'Change [Cu²⁺] to 0.1M to observe EMF drop to +1.073 V. Reverse voltmeter terminal leads to observe the sign invert to negative potential.',
      },
    ],
    goals: [
      {
        id: 'goal-nernst-equation',
        description: 'Verify the Nernst equation EMF dependence on reaction quotient Q = [Zn²⁺] / [Cu²⁺].',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-salt-bridge-function',
        description: 'Understand that the salt bridge maintains electrical neutrality by ion migration and prevents liquid junction potential.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Electrochemistry — Galvanic Daniell Cell Investigation:\n\n1. Half-Cell Electrochemical Reactions:\n- Anode (Oxidation):  Zn(s) ⟶ Zn²⁺(aq) + 2 e⁻   [E°_ox = +0.763 V, E°_red = -0.763 V]\n- Cathode (Reduction): Cu²⁺(aq) + 2 e⁻ ⟶ Cu(s)   [E°_red = +0.340 V]\n- Overall Cell Reaction: Zn(s) + Cu²⁺(aq) ⟶ Zn²⁺(aq) + Cu(s)  (n = 2 moles of electrons)\n\n2. Standard Cell Potential (EMF):\n  E°_cell = E°_cathode - E°_anode = +0.340 V - (-0.763 V) = +1.103 V (≈ 1.10 V)\n\n3. Nernst Equation at 298.15 K (25°C):\n  E_cell = E°_cell - (0.05916 / n) × log₁₀([Zn²⁺] / [Cu²⁺])\n  E_cell = 1.103 - 0.02958 × log₁₀([Zn²⁺] / [Cu²⁺])\n\n4. Concentration Dependence Table:\n- [Zn²⁺] = 0.01 M, [Cu²⁺] = 1.0 M ⟶ log₁₀(0.01) = -2 ⟶ E_cell = 1.103 - 0.0296(-2) = +1.162 V\n- [Zn²⁺] = 0.10 M, [Cu²⁺] = 1.0 M ⟶ log₁₀(0.10) = -1 ⟶ E_cell = 1.103 - 0.0296(-1) = +1.133 V\n- [Zn²⁺] = 1.00 M, [Cu²⁺] = 1.0 M ⟶ log₁₀(1.00) =  0 ⟶ E_cell = 1.103 V\n- [Zn²⁺] = 1.00 M, [Cu²⁺] = 0.1 M ⟶ log₁₀(10.0) = +1 ⟶ E_cell = 1.103 - 0.0296(+1) = +1.073 V\n- [Zn²⁺] = 1.00 M, [Cu²⁺] = 0.01 M ⟶ log₁₀(100) = +2 ⟶ E_cell = 1.103 - 0.0296(+2) = +1.044 V\n\n5. Function of the Salt Bridge:\n- Contains agar-agar gel saturated with KCl (inert electrolyte with equal transport numbers for K⁺ and Cl⁻).\n- Cl⁻ ions migrate into zinc half-cell to neutralize excess Zn²⁺ ions.\n- K⁺ ions migrate into copper half-cell to replace consumed Cu²⁺ ions.\n- Prevents accumulation of positive and negative charges, sustaining current flow.",
  },
  {
    experimentId: 'paper-chromatography-class12',
    title: 'Paper Chromatography (Class 12 Inorganic Cation & Leaf Pigment Separation)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'chromatography-paper-strip',
      'developing-chamber',
      'chromatography-ruler',
      'pasteur-pipette-dropper',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'chamber-c12-1',
        equipmentId: 'developing-chamber',
        title: 'Developing Tank with n-Butanol:Acetic Acid',
        x: 100,
        y: 80,
        rotation: 0,
        width: 140,
        height: 250,
        properties: { solventType: 'n-butanol-acetic-acid', liquidLevelPercent: 20 },
        state: { chamberStatus: 'Saturated with eluent vapor' },
      },
      {
        id: 'paper-c12-1',
        equipmentId: 'chromatography-paper-strip',
        title: 'Whatman #1 Strip (Cations Pb²⁺ & Cd²⁺)',
        x: 270,
        y: 80,
        rotation: 0,
        width: 110,
        height: 220,
        properties: {
          sampleInk: 'class12-cation-mixture',
          elapsedSeconds: 60,
          isDeveloping: true,
        },
        state: { developmentStatus: 'Ascending Capillary Migration Active' },
      },
      {
        id: 'ruler-c12-1',
        equipmentId: 'chromatography-ruler',
        title: 'Metric Chromatography Ruler (100mm)',
        x: 430,
        y: 90,
        rotation: 0,
        width: 50,
        height: 200,
        properties: { rulerLengthMm: 100 },
        state: { measurementTarget: 'Lead & Cadmium Spot Fronts' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-chrom12-1',
        stepNumber: 1,
        title: 'Deposit Micro-Drop of Cation Mixture',
        instruction:
          'On Whatman No. 1 paper strip, draw a pencil baseline 2 cm above bottom edge. Spot a concentrated drop containing Pb²⁺ and Cd²⁺ nitrates and dry gently.',
      },
      {
        id: 'step-chrom12-2',
        stepNumber: 2,
        title: 'Ascending Capillary Development',
        instruction:
          'Suspend paper in developing chamber containing n-butanol : acetic acid : water (4:1:5). Mobile phase ascends by capillary action for ~60 seconds to ~80 mm.',
      },
      {
        id: 'step-chrom12-3',
        stepNumber: 3,
        title: 'Spray Development with Ammonium Sulphide',
        instruction:
          'Dry the chromatogram and spray with yellow ammonium sulphide (NH₄)₂S inside fume hood. Pb²⁺ precipitates as brown-black PbS and Cd²⁺ as bright canary-yellow CdS.',
      },
      {
        id: 'step-chrom12-4',
        stepNumber: 4,
        title: 'Measure Distances & Calculate Rf Values',
        instruction:
          'Measure distance of each colored spot from the baseline using the metric ruler. Compute Rf = distance spot / solvent front. For Pb²⁺: Rf ≈ 0.38; For Cd²⁺: Rf ≈ 0.72.',
      },
    ],
    goals: [
      {
        id: 'goal-cation-separation',
        description: 'Separate inorganic metal cations (Pb²⁺, Cd²⁺) using ascending partition chromatography and chemical spray reagent visualization.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-rf-metal-ions',
        description: 'Accurately determine retention factors (Rf) to characterize unknown inorganic components in a mixture.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Paper Chromatography Analysis — Class 12 Advanced Separation:\n\n1. Separation of Inorganic Metal Cations (Pb²⁺ and Cd²⁺):\n- Stationary Phase: Water adsorbed on cellulose fibers of Whatman No. 1 paper.\n- Mobile Phase: n-Butanol : Acetic Acid : Water (4:1:5 upper organic phase).\n- Visualization: Metal ions are colorless. Sprayed with freshly prepared yellow ammonium sulphide solution (NH₄)₂S:\n  Pb²⁺ + S²⁻ ⟶ PbS(s, brown-black spot, Rf ≈ 0.38)\n  Cd²⁺ + S²⁻ ⟶ CdS(s, bright canary yellow spot, Rf ≈ 0.72)\n\n2. Separation of Photosynthetic Spinach Leaf Pigments:\n- Extraction: Fresh spinach leaves ground in acetone : petroleum ether (1:9).\n- Mobile Phase: Petroleum ether : Acetone : Benzene (85:10:5).\n- Pigment Bands observed from origin to solvent front:\n  1. Chlorophyll b (Olive green): Rf ≈ 0.35 (strong hydrogen bonding with cellulose)\n  2. Chlorophyll a (Blue green): Rf ≈ 0.48\n  3. Xanthophyll (Yellow): Rf ≈ 0.70\n  4. Carotene (Orange-yellow): Rf ≈ 0.95 (non-polar hydrocarbon, moves almost with solvent front)\n\n3. Rf Calculation Formula:\n  Rf = Distance traveled by solute from baseline / Distance traveled by solvent front from baseline.",
  },
  {
    experimentId: 'inorganic-compound-prep',
    title: 'Preparation of Inorganic Compounds: Double Salts (Mohr’s Salt & Potash Alum)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'inorganic-synth-assembly',
      'borosilicate-beaker',
      'glass-stirring-rod',
      'evaporating-dish',
      'bunsen-burner-stand',
      'chemical-analytical-balance',
      'graduated-measuring-cylinder',
      'funnel-stand-assembly',
      'qualitative-filter-paper',
      'watch-glass-dish',
    ],
    initialObjects: [
      {
        id: 'inorganic-synth-1',
        equipmentId: 'inorganic-synth-assembly',
        title: 'Double Salt Synthesis Station',
        x: 240,
        y: 140,
        rotation: 0,
        width: 320,
        height: 240,
        properties: {
          compoundId: 'mohrs-salt',
          stage: 'reactant-mixing',
          isAcidified: true,
          heatingDurationMin: 10,
          coolingDurationMin: 15,
        },
        state: { status: 'Reactants equimolarly mixed with dilute H₂SO₄.' },
      },
      {
        id: 'beaker-prep-1',
        equipmentId: 'borosilicate-beaker',
        title: 'Dissolution Beaker (250 mL)',
        x: 600,
        y: 140,
        rotation: 0,
        width: 110,
        height: 140,
        properties: { liquidVolume: 50, reagentSolution: 'pure-water' },
        state: { contents: 'Warm deionized water solvent' },
      },
      {
        id: 'burner-prep-1',
        equipmentId: 'bunsen-burner-stand',
        title: 'Bunsen Heating Stand',
        x: 600,
        y: 320,
        rotation: 0,
        width: 100,
        height: 120,
        properties: { burnerFlameActive: true, flameIntensity: 'medium' },
        state: { flameStatus: 'Heating at moderate evaporation rate' },
      },
      {
        id: 'dish-prep-1',
        equipmentId: 'evaporating-dish',
        title: 'Porcelain Crystallizing Dish',
        x: 80,
        y: 140,
        rotation: 0,
        width: 110,
        height: 80,
        properties: { liquidVolume: 30, containedLiquid: 'pure-water' },
        state: { status: 'Ready for undisturbed cooling' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-inorg-1',
        stepNumber: 1,
        title: 'Equimolar Dissolution of Simple Salts',
        instruction:
          'Dissolve equimolar quantities of primary sulphates (FeSO₄·7H₂O and (NH₄)₂SO₄ for Mohr’s Salt; K₂SO₄ and Al₂(SO₄)₃ for Potash Alum) in minimal hot deionized water.',
      },
      {
        id: 'step-inorg-2',
        stepNumber: 2,
        title: 'Acidification with Dilute Sulphuric Acid',
        instruction:
          'Add 2-3 mL of dilute H₂SO₄ to prevent oxidation of Fe²⁺ to Fe³⁺ and hydrolysis of Al³⁺ into gelatinous Al(OH)₃ during boiling.',
      },
      {
        id: 'step-inorg-3',
        stepNumber: 3,
        title: 'Heating to Crystallization Point',
        instruction:
          'Concentrate solution until a crust forms on the tip of a cold glass rod dipped in the solution. Do not over-boil to dryness.',
      },
      {
        id: 'step-inorg-4',
        stepNumber: 4,
        title: 'Undisturbed Cooling & Crystal Recovery',
        instruction:
          'Allow solution to cool slowly and undisturbed in a porcelain basin. Filter separated crystals, dry between filter papers, and compute percentage yield.',
      },
    ],
    goals: [
      {
        id: 'goal-double-salt-stoich',
        description: 'Prepare an inorganic double salt maintaining strict 1:1 equimolar stoichiometry of constituent salts.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-protective-acidification',
        description: 'Apply dilute H₂SO₄ acidification to inhibit aerial oxidation and hydrolytic decomposition.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-crystal-habit-analysis',
        description: 'Isolate crystals, observe characteristic morphology (monoclinic prisms or regular octahedra), and compute practical yield.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Preparation of Inorganic Double Salts (Mohr’s Salt & Potash Alum):\n\n1. Mohr’s Salt [FeSO₄·(NH₄)₂SO₄·6H₂O] (Ferrous Ammonium Sulphate):\n- Category: Double salt formed by stoichiometric combination of equimolar FeSO₄ and (NH₄)₂SO₄.\n- Chemical Equation:\n  FeSO₄·7H₂O(s) + (NH₄)₂SO₄(s) ⟶ FeSO₄·(NH₄)₂SO₄·6H₂O(s) + H₂O(l)\n- Role of Dilute H₂SO₄:\n  Fe²⁺ ions hydrolyze in neutral water: Fe²⁺ + 2H₂O ⇌ Fe(OH)₂ + 2H⁺. Fe(OH)₂ is rapidly oxidized by atmospheric air to basic ferric sulphate [Fe(OH)SO₄] (muddy brown). Adding H₂SO₄ suppresses this hydrolysis via Le Chatelier’s principle.\n- Crystal Habit: Light sea-green monoclinic prisms.\n- Theoretical Yield: ~9.88 g (from 7.0 g FeSO₄·7H₂O and 3.33 g (NH₄)₂SO₄); Practical Yield: ~8.45 g (85.5%).\n\n2. Potash Alum [K₂SO₄·Al₂(SO₄)₃·24H₂O] (Fitkari):\n- Category: Double sulphate of a monovalent cation (K⁺) and a trivalent cation (Al³⁺).\n- Chemical Equation:\n  K₂SO₄(s) + Al₂(SO₄)₃·18H₂O(s) + 6H₂O(l) ⟶ K₂SO₄·Al₂(SO₄)₃·24H₂O(s)\n- Role of Dilute H₂SO₄: Prevents hydrolysis of Al₂(SO₄)₃ into gelatinous Al(OH)₃.\n- Crystal Habit: Colorless, transparent, sparkling octahedral crystals.\n- Yield: ~11.2 g (from 2.5 g K₂SO₄ and 9.55 g Al₂(SO₄)₃·18H₂O); Practical Yield: ~82.5%.\n\n3. Percentage Yield Formula:\n  Yield (%) = (Practical mass recovered / Theoretical stoichiometric mass) × 100%.",
  },
  {
    experimentId: 'organic-compound-prep',
    title: 'Preparation of Organic Compounds (Acetanilide & Dibenzalacetone)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'organic-synth-assembly',
      'conical-flask',
      'borosilicate-beaker',
      'glass-stirring-rod',
      'bunsen-burner-stand',
      'chemical-analytical-balance',
      'graduated-measuring-cylinder',
      'funnel-stand-assembly',
      'qualitative-filter-paper',
      'thermometer-mercury-c',
    ],
    initialObjects: [
      {
        id: 'organic-synth-1',
        equipmentId: 'organic-synth-assembly',
        title: 'Organic Synthesis Station',
        x: 240,
        y: 140,
        rotation: 0,
        width: 320,
        height: 240,
        properties: {
          compoundId: 'acetanilide',
          stage: 'reactant-mixing',
          isAcidified: true,
          heatingDurationMin: 10,
          coolingDurationMin: 15,
        },
        state: { status: 'Reactants mixed: ready for nucleophilic acyl substitution.' },
      },
      {
        id: 'conical-prep-1',
        equipmentId: 'conical-flask',
        title: 'Reaction Flask (250 mL)',
        x: 600,
        y: 140,
        rotation: 0,
        width: 130,
        height: 160,
        properties: { liquidVolume: 40, reagentSolution: 'pure-water' },
        state: { contents: 'Reaction medium' },
      },
      {
        id: 'thermometer-prep-1',
        equipmentId: 'thermometer-mercury-c',
        title: 'Precision Thermometer',
        x: 80,
        y: 140,
        rotation: 0,
        width: 30,
        height: 180,
        properties: { currentTemperature: 25 },
        state: { temperatureStatus: 'Monitoring reaction temperature' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-org-1',
        stepNumber: 1,
        title: 'Controlled Reagent Dissolution',
        instruction:
          'Measure stoichiometric quantities of reactants (aniline + acetic anhydride in glacial acetic acid / Zn dust for Acetanilide; benzaldehyde + acetone in aqueous ethanolic NaOH for Dibenzalacetone).',
      },
      {
        id: 'step-org-2',
        stepNumber: 2,
        title: 'Controlled Heating / Agitation',
        instruction:
          'Gently reflux or stir reaction mixture. For acetanilide: zinc dust acts as reducing agent preventing aerial oxidation of aniline to colored quinhydrones.',
      },
      {
        id: 'step-org-3',
        stepNumber: 3,
        title: 'Ice Cooling & Nucleated Crystallization',
        instruction:
          'Pour warm reaction mixture into cold ice-water with rapid stirring. Crude product precipitates instantly as solid flakes / leaflets.',
      },
      {
        id: 'step-org-4',
        stepNumber: 4,
        title: 'Filtration & Purity Verification',
        instruction:
          'Filter crystals using Buchner / conical funnel, wash with ice-cold water, dry, and verify purity via melting point determination.',
      },
    ],
    goals: [
      {
        id: 'goal-organic-prep-mechanism',
        description: 'Simulate organic functional group transformations (nucleophilic acyl substitution or crossed aldol condensation).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-crystallization-recovery',
        description: 'Precipitate and isolate organic crystals from solution using solvent drowning and cold crystallization.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-purity-mp-check',
        description: 'Determine product melting point to confirm identity and high chemical purity.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Preparation of Organic Compounds (Safe Virtual Simulation):\n\n1. Synthesis of Acetanilide:\n- Reaction Type: Nucleophilic Acyl Substitution (Acetylation of Primary Aromatic Amine).\n- Chemical Equation:\n  C₆H₅NH₂(l) + (CH₃CO)₂O(l) ⎯(CH₃COOH / Zn dust)⎯→ C₆H₅NHCOCH₃(s) + CH₃COOH(l)\n- Role of Zinc Dust: Acts as mild reducing agent; prevents atmospheric oxidation of aniline into dark purplish colored quinone/aminophenol derivatives.\n- Isolation: Poured into ice-cold water; acetanilide precipitates as glistening white leaflets.\n- Melting Point: 114°C (sharp).\n- Practical Yield: ~82%.\n\n2. Synthesis of Dibenzalacetone:\n- Reaction Type: Crossed Aldol Condensation (Claisen-Schmidt Condensation).\n- Chemical Equation:\n  2 C₆H₅CHO + CH₃COCH₃ ⎯(NaOH / Ethanol, 20-25°C)⎯→ C₆H₅-CH=CH-CO-CH=CH-C₆H₅(s) + 2 H₂O\n- Mechanism: Acetone enolate attacks benzaldehyde carbonyl; dehydration yields conjugated unsaturated ketone.\n- Crystal Habit: Bright yellow glistening flakes.\n- Melting Point: 112°C.\n- Practical Yield: ~75%.",
  },
  {
    experimentId: 'functional-group-identification',
    title: 'Systematic Identification of Organic Functional Groups',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'functional-group-workbench',
      'test-tube-borosilicate',
      'pasteur-pipette-dropper',
      'bunsen-burner-stand',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'fg-bench-1',
        equipmentId: 'functional-group-workbench',
        title: 'Functional Group Testing Workbench',
        x: 240,
        y: 140,
        rotation: 0,
        width: 320,
        height: 240,
        properties: {
          selectedSample: 'cyclohexene',
          selectedTest: 'bromine-water',
        },
        state: { status: 'Ready for diagnostic qualitative analysis.' },
      },
      {
        id: 'test-tube-fg-1',
        equipmentId: 'test-tube-borosilicate',
        title: 'Diagnostic Reaction Tube',
        x: 600,
        y: 140,
        rotation: 0,
        width: 45,
        height: 160,
        properties: { liquidVolume: 5, containedLiquid: 'pure-water' },
        state: { reactionStatus: 'Monitoring color change / precipitate' },
      },
      {
        id: 'dropper-fg-1',
        equipmentId: 'pasteur-pipette-dropper',
        title: 'Analytical Reagent Dropper',
        x: 80,
        y: 140,
        rotation: 0,
        width: 28,
        height: 120,
        properties: { aspirating: false },
        state: { status: 'Reagent delivery' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-fg-1',
        stepNumber: 1,
        title: 'Test for Unsaturation (>C=C< / -C≡C-)',
        instruction:
          'Treat sample with Bromine Water or cold alkaline 1% KMnO₄ (Baeyer’s reagent). Instant discharge of reddish-brown bromine or formation of brown MnO₂ precipitate confirms unsaturation.',
      },
      {
        id: 'step-fg-2',
        stepNumber: 2,
        title: 'Test for Alcoholic and Phenolic Hydroxyl (-OH)',
        instruction:
          'Test with anhydrous sodium metal (H₂ effervescence). Differentiate aliphatic alcohols (Ceric Ammonium Nitrate gives wine-red complex) from phenols (Neutral FeCl₃ gives violet coloration).',
      },
      {
        id: 'step-fg-3',
        stepNumber: 3,
        title: 'Test for Carbonyl Groups (-CHO vs >C=O)',
        instruction:
          'Test with 2,4-DNP (yellow/orange hydrazone ppt). Differentiate aldehydes (Tollens silver mirror & Fehling red Cu₂O) from ketones (Sodium Nitroprusside gives ruby-red coloration).',
      },
      {
        id: 'step-fg-4',
        stepNumber: 4,
        title: 'Test for Carboxylic Acid (-COOH) & Primary Amine (-NH₂)',
        instruction:
          'Carboxylic acids give vigorous CO₂ effervescence with NaHCO₃ and fruity esters on warming with ethanol/H₂SO₄. Primary amines give brilliant scarlet azo dyes upon diazotization and alkaline β-naphthol coupling.',
      },
    ],
    goals: [
      {
        id: 'goal-fg-unsaturation',
        description: 'Identify unsaturation using bromine water decolorization and Baeyer cold alkaline permanganate test.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-fg-alcohol-phenol',
        description: 'Differentiate alcohols and phenols using ceric ammonium nitrate and neutral ferric chloride reactions.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-fg-carbonyl-acid-amine',
        description: 'Identify aldehydes, ketones, carboxylic acids, and primary amines using Tollens, nitroprusside, NaHCO₃, and azo dye tests.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Qualitative Analysis of Organic Functional Groups (Class 12):\n\n1. Unsaturation (>C=C<):\n- Bromine Water: Reddish-brown Br₂ decolorized completely without HBr fumes.\n- Baeyer’s Test: Cold 1% alkaline KMnO₄ discharged; brown MnO₂ precipitate formed.\n\n2. Alcoholic Hydroxyl (-OH):\n- Sodium Metal: Brisk H₂ effervescence (burns with pop sound): 2ROH + 2Na ⟶ 2RONa + H₂↑.\n- Ceric Ammonium Nitrate (CAN): Formation of an intense wine-red coordination complex (NH₄)₂[Ce(OR)(NO₃)₅].\n\n3. Phenolic Hydroxyl (Ar-OH):\n- Neutral FeCl₃ Test: Deep violet / purple coloration due to [Fe(OC₆H₅)₆]³⁻ complex.\n- Contrast: Does NOT give CO₂ with NaHCO₃ (weaker acid than carbonic acid, pKa ~ 10).\n\n4. Aldehydic Carbonyl (-CHO):\n- Tollens’ Test (Ammoniacal Silver Nitrate): Silver mirror coats clean inner glass wall:\n  R-CHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ ⟶ R-COO⁻ + 2Ag(s)↓ + 4NH₃ + 2H₂O.\n- Fehling’s Test: Alkaline Cu²⁺ reduced to red Cu₂O precipitate on boiling.\n\n5. Ketonic Carbonyl (>C=O):\n- Negative Tollens & Fehling tests.\n- Sodium Nitroprusside Test: Addition of Na₂[Fe(CN)₅NO] + NaOH gives an intense ruby-red coloration.\n\n6. Carboxylic Acid (-COOH):\n- Sodium Bicarbonate Test: Instant vigorous effervescence of CO₂ gas turning lime water milky:\n  R-COOH + NaHCO₃ ⟶ R-COONa + H₂O + CO₂↑.\n- Ester Test: Warming with ethanol and conc. H₂SO₄ yields sweet fruity fragrance.\n\n7. Primary Aromatic Amine (-NH₂):\n- Azo Dye Test: Dissolve in dil. HCl, cool to 0-5°C, add NaNO₂ (forming C₆H₅N₂⁺Cl⁻), then pour into ice-cold alkaline β-naphthol. A brilliant scarlet-red / orange azo dye precipitates immediately.",
  },
  {
    experimentId: 'food-component-testing',
    title: 'Qualitative Testing of Food Components (Carbohydrates, Proteins, Fats)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'food-testing-workbench',
      'test-tube-borosilicate',
      'pasteur-pipette-dropper',
      'bunsen-burner-stand',
      'qualitative-filter-paper',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'food-bench-1',
        equipmentId: 'food-testing-workbench',
        title: 'Food Component Testing Station',
        x: 240,
        y: 140,
        rotation: 0,
        width: 320,
        height: 240,
        properties: {
          selectedSample: 'glucose',
          selectedTest: 'molisch-test',
        },
        state: { status: 'Substrate ready for nutrient testing.' },
      },
      {
        id: 'test-tube-food-1',
        equipmentId: 'test-tube-borosilicate',
        title: 'Nutrient Assay Tube',
        x: 600,
        y: 140,
        rotation: 0,
        width: 45,
        height: 160,
        properties: { liquidVolume: 5, containedLiquid: 'pure-water' },
        state: { assayStatus: 'Biochemical color formation' },
      },
      {
        id: 'paper-food-1',
        equipmentId: 'qualitative-filter-paper',
        title: 'Filter Paper (Grease Spot Test)',
        x: 80,
        y: 140,
        rotation: 0,
        width: 90,
        height: 90,
        properties: { porosity: 'medium' },
        state: { paperStatus: 'Inspecting optical translucency' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-food-1',
        stepNumber: 1,
        title: 'General Carbohydrate Detection (Molisch’s Test)',
        instruction:
          'Add 2 drops of 1% α-naphthol in alcohol to sample. Incline tube and pour conc. H₂SO₄ down side. A distinct reddish-violet / purple ring at interface confirms carbohydrate.',
      },
      {
        id: 'step-food-2',
        stepNumber: 2,
        title: 'Reducing Sugars vs Polysaccharides',
        instruction:
          'Boil with equal parts Fehling A & B: reducing sugars (glucose, lactose) give brick-red Cu₂O precipitate. Treat starch suspension with dilute iodine solution: deep blue-black color confirms helical amylose.',
      },
      {
        id: 'step-food-3',
        stepNumber: 3,
        title: 'Protein Detection (Biuret & Ninhydrin Tests)',
        instruction:
          'Add dil. NaOH and 1% CuSO₄: violet-purple coloration (Biuret) confirms peptide bonds. Warm with ninhydrin solution: blue-violet Ruhemann’s purple confirms free α-amino acids.',
      },
      {
        id: 'step-food-4',
        stepNumber: 4,
        title: 'Fats and Oils Testing (Spot & Acrolein Tests)',
        instruction:
          'Press drop of sample between filter paper folds: permanent translucent greasy spot confirms non-volatile lipid. Heat with solid KHSO₄: pungent irritating acrolein vapor confirms glycerol esters.',
      },
    ],
    goals: [
      {
        id: 'goal-carbohydrate-assays',
        description: 'Detect general carbohydrates with Molisch reagent and differentiate reducing monosaccharides from starch.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-protein-assays',
        description: 'Demonstrate peptide bond copper chelation (Biuret) and α-amino acid chromophore formation (Ninhydrin).',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-lipid-assays',
        description: 'Validate fats and oils using permanent optical translucency and KHSO₄ glycerol dehydration to acrolein.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Biochemical Analysis of Food Macro-Nutrients:\n\n1. Carbohydrates:\n- Molisch’s Test: Conc. H₂SO₄ dehydrates hexoses/pentoses to hydroxymethylfurfural/furfural, which condenses with α-naphthol to form a characteristic violet-purple ring.\n- Fehling’s Test: Free hemiacetal reducing groups reduce alkaline Cu²⁺ tartrate to red Cu₂O precipitate.\n- Iodine Test: Iodine molecules (I₃⁻/I₅⁻) slip inside the helical core of amylose, forming a reversible deep blue-black charge-transfer inclusion complex (bleaches on heating).\n\n2. Proteins:\n- Biuret Test: In alkaline medium, Cu²⁺ coordinates with 4 peptide bond nitrogen atoms (-CONH-), forming a square-planar violet coordination complex.\n- Ninhydrin Test: α-Amino acids undergo oxidative deamination and decarboxylation, reacting with another ninhydrin molecule to produce Ruhemann’s purple pigment (λmax ~ 570 nm).\n\n3. Fats and Oils:\n- Translucent Spot Test: Triglycerides penetrate cellulose paper fibers, matching their refractive index (~1.47) and creating a permanent translucent grease window.\n- Acrolein Test: Heating glycerol backbone with KHSO₄ produces sharp, pungent, irritating propenal (acrolein) vapors:\n  CH₂(OH)-CH(OH)-CH₂(OH) ⎯(KHSO₄, Δ)⎯→ CH₂=CH-CHO + 2H₂O.",
  },
  {
    experimentId: 'redox-titration-kmno4',
    title: 'Redox Titration: Potassium Permanganate vs Mohr’s Salt & Oxalic Acid',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'redox-titration-assembly',
      'graduated-titration-burette',
      'conical-flask',
      'pasteur-pipette-dropper',
      'borosilicate-beaker',
      'bunsen-burner-stand',
      'thermometer-mercury-c',
      'chemical-analytical-balance',
    ],
    initialObjects: [
      {
        id: 'redox-titration-1',
        equipmentId: 'redox-titration-assembly',
        title: 'KMnO₄ Redox Titration Assembly',
        x: 240,
        y: 130,
        rotation: 0,
        width: 320,
        height: 260,
        properties: {
          system: 'kmno4-mohrs-salt',
          analyteVolumeMl: 20,
          analyteMolarityM: 0.05,
          titrantMolarityM: 0.02,
          titrantDeliveredMl: 0.0,
          acidAdded: true,
          temperatureC: 25,
        },
        state: { status: 'Burette filled with KMnO₄. Upper meniscus recorded.' },
      },
      {
        id: 'conical-titr-1',
        equipmentId: 'conical-flask',
        title: 'Titration Flask (250 mL)',
        x: 600,
        y: 140,
        rotation: 0,
        width: 130,
        height: 160,
        properties: { liquidVolume: 40, reagentSolution: 'pure-water' },
        state: { contents: '20 mL analyte + 20 mL dilute H₂SO₄' },
      },
      {
        id: 'thermometer-titr-1',
        equipmentId: 'thermometer-mercury-c',
        title: 'Monitoring Thermometer',
        x: 80,
        y: 140,
        rotation: 0,
        width: 30,
        height: 180,
        properties: { currentTemperature: 25 },
        state: { temperatureStatus: 'Checking 60-70°C for oxalic acid' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-redox-1',
        stepNumber: 1,
        title: 'Burette Preparation & Upper Meniscus Reading',
        instruction:
          'Rinse and fill burette with potassium permanganate (KMnO₄) solution. Note that because KMnO₄ is dark purple and opaque, the UPPER meniscus is read instead of the lower meniscus.',
      },
      {
        id: 'step-redox-2',
        stepNumber: 2,
        title: 'Pipetting Analyte & Acidification',
        instruction:
          'Pipette 20.0 mL of standard Mohr’s salt or oxalic acid into a clean conical flask. Add one full test tube (~20 mL) of dilute H₂SO₄ (1:4). Note: HCl and HNO₃ cannot be used.',
      },
      {
        id: 'step-redox-3',
        stepNumber: 3,
        title: 'Warming Requirement (Oxalic Acid Only)',
        instruction:
          'For oxalic acid titration, warm flask contents to 60-70°C before titrating to overcome high activation energy. Mohr’s salt does not require heating.',
      },
      {
        id: 'step-redox-4',
        stepNumber: 4,
        title: 'Titration to Self-Indicator Endpoint',
        instruction:
          'Run KMnO₄ slowly while continuously swirling flask. Each drop decolorizes instantly until the stoichiometric equivalence point is reached, where a single excess drop imparts a permanent faint pink tint.',
      },
      {
        id: 'step-redox-5',
        stepNumber: 5,
        title: 'Stoichiometric Calculations',
        instruction:
          'Calculate KMnO₄ molarity using: M₁V₁ = (M₂V₂)/5 for Mohr’s salt, or (M₁V₁)/2 = (M₂V₂)/5 for oxalic acid. Compute strength in g/L = Molarity × 158.034.',
      },
    ],
    goals: [
      {
        id: 'goal-upper-meniscus-reading',
        description: 'Read the upper meniscus accurately for the intensely dark colored KMnO₄ titrant.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-self-indicator-endpoint',
        description: 'Detect the self-indicator endpoint marked by the appearance of the first permanent pale pink coloration.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-redox-stoichiometry-calc',
        description: 'Compute precise molarity and strength in g/L based on balanced ionic redox stoichiometry equations.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Redox Titration: Potassium Permanganate (KMnO₄) — Theory & Stoichiometry:\n\n1. Self-Indicator Principle:\n- KMnO₄ acts as its own indicator. In acidic solution, intense purple MnO₄⁻ is reduced to virtually colorless Mn²⁺:\n  MnO₄⁻ + 8H⁺ + 5e⁻ ⟶ Mn²⁺ (almost colorless) + 4H₂O (E° = +1.51 V).\n- Endpoint: The moment all reducing agent is oxidized, a single drop of excess KMnO₄ imparts a permanent faint pink coloration lasting >30 seconds.\n- Upper Meniscus: Due to intense dark purple coloration, the top boundary (upper meniscus) is recorded.\n\n2. Titration against Mohr’s Salt [FeSO₄·(NH₄)₂SO₄·6H₂O]:\n- Ionic Equation: MnO₄⁻ + 5Fe²⁺ + 8H⁺ ⟶ Mn²⁺ + 5Fe³⁺ + 4H₂O\n- Stoichiometric Ratio: 1 mol KMnO₄ ≡ 5 mol Fe²⁺\n- Formula: M₁V₁ = (M₂V₂) / 5  ⟹  M(KMnO₄) = (M₂ × V₂) / (5 × V₁)\n- Ambient Temperature: Carried out at room temperature without warming.\n\n3. Titration against Standard Oxalic Acid [(COOH)₂·2H₂O]:\n- Ionic Equation: 2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ ⎯(60-70°C)⎯→ 2Mn²⁺ + 10CO₂↑ + 8H₂O\n- Stoichiometric Ratio: 2 mol KMnO₄ ≡ 5 mol C₂O₄²⁻\n- Formula: (M₁V₁) / 2 = (M₂V₂) / 5  ⟹  M(KMnO₄) = (2 × M₂ × V₂) / (5 × V₁)\n- Why Heating to 60-70°C is Mandatory: Reaction has a high activation energy due to mutual electrostatic repulsion between negative MnO₄⁻ and C₂O₄²⁻ ions. Heating accelerates the reaction until generated Mn²⁺ acts as an autocatalyst.\n\n4. Why Dilute H₂SO₄ is Used (and NOT HCl or HNO₃):\n- HCl is oxidized by KMnO₄ to toxic chlorine gas (2MnO₄⁻ + 10Cl⁻ + 16H⁺ ⟶ 2Mn²⁺ + 5Cl₂ + 8H₂O), causing high KMnO₄ consumption.\n- HNO₃ is itself a strong oxidizing agent that oxidizes Fe²⁺ or oxalate independently, causing low KMnO₄ consumption.\n- H₂SO₄ does not react with KMnO₄ and does not act as an independent oxidant under titration conditions.",
  },
  {
    experimentId: 'salt-analysis-class12',
    title: 'Systematic Qualitative Salt Analysis with Interfering Radicals (Class 12)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'salt-analysis-workbench',
      'test-tube-borosilicate',
      'pasteur-pipette-dropper',
      'bunsen-burner-stand',
      'watch-glass-dish',
      'funnel-stand-assembly',
      'qualitative-filter-paper',
      'borosilicate-beaker',
    ],
    initialObjects: [
      {
        id: 'salt-bench-12',
        equipmentId: 'salt-analysis-workbench',
        title: 'Class 12 Qualitative Salt Workbench',
        x: 240,
        y: 140,
        rotation: 0,
        width: 320,
        height: 240,
        properties: {
          selectedSalt: 'ca3_po4_2',
          currentTest: 'phosphate-molybdate',
        },
        state: { status: 'Testing for interfering acid radicals and elimination.' },
      },
      {
        id: 'test-tube-salt-12',
        equipmentId: 'test-tube-borosilicate',
        title: 'Precipitation Test Tube',
        x: 600,
        y: 140,
        rotation: 0,
        width: 45,
        height: 160,
        properties: { liquidVolume: 5, containedLiquid: 'pure-water' },
        state: { tubeStatus: 'Ammonium molybdate canary-yellow test' },
      },
      {
        id: 'watch-glass-salt-12',
        equipmentId: 'watch-glass-dish',
        title: 'Flame Test Watch Glass',
        x: 80,
        y: 140,
        rotation: 0,
        width: 80,
        height: 25,
        properties: { solidSamplePresent: true },
        state: { glassStatus: 'Conc. HCl paste preparation' },
      },
    ],
    guidedSteps: [
      {
        id: 'step-salt12-1',
        stepNumber: 1,
        title: 'Preliminary & Flame Test Examination',
        instruction:
          'Examine physical state, color, and perform Bunsen flame test with conc. HCl paste (Ca²⁺ gives brick-red; Ba²⁺ gives apple-green flame).',
      },
      {
        id: 'step-salt12-2',
        stepNumber: 2,
        title: 'Detection of Interfering Radicals (PO₄³⁻ and C₂O₄²⁻)',
        instruction:
          'Boil with conc. HNO₃ and add excess ammonium molybdate: canary-yellow precipitate confirms Phosphate. Warm acidified solution with KMnO₄: brisk decolorization with CO₂ effervescence confirms Oxalate.',
      },
      {
        id: 'step-salt12-3',
        stepNumber: 3,
        title: 'Phosphate Elimination Protocol',
        instruction:
          'To Group II filtrate, add NH₄OH until neutral, acidify with acetic acid, add sodium acetate buffer, and add neutral FeCl₃ until reddish-brown. Boil and filter off FePO₄ and basic ferric acetate precipitate.',
      },
      {
        id: 'step-salt12-4',
        stepNumber: 4,
        title: 'Systematic Cation Group Analysis on Phosphate-Free Filtrate',
        instruction:
          'Analyze the phosphate-free filtrate through Groups IV, V, and VI without risk of premature phosphate precipitation. Confirm Ca²⁺ with ammonium oxalate and Ba²⁺ with K₂CrO₄.',
      },
    ],
    goals: [
      {
        id: 'goal-interfering-radical-detection',
        description: 'Detect interfering acid radicals (PO₄³⁻, C₂O₄²⁻) that disrupt alkaline group separation.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-phosphate-elimination',
        description: 'Execute the sodium acetate buffer / FeCl₃ phosphate elimination method before Group III.',
        isCompleted: false,
        validatorType: 'generic',
      },
      {
        id: 'goal-cation-identification-grp5-6',
        description: 'Successfully isolate and confirm Group V/VI cations (Ca²⁺, Ba²⁺, Mg²⁺) in the cleared filtrate.',
        isCompleted: false,
        validatorType: 'generic',
      },
    ],
    defaultNotebookNotes:
      "Qualitative Salt Analysis with Interfering Radicals (CBSE Class 12):\n\n1. What are Interfering Acid Radicals?\n- Radicals like Phosphate (PO₄³⁻), Oxalate (C₂O₄²⁻), Fluoride (F⁻), and Borate (BO₃³⁻).\n- Why they Interfere: In acidic medium (Groups I and II), the phosphates and oxalates of all metals are soluble. However, in Group III, addition of NH₄Cl + NH₄OH raises pH to ~8.5-9.0. In basic medium, the phosphates and oxalates of Group IV (Zn²⁺, Mn²⁺, Ni²⁺, Co²⁺), Group V (Ba²⁺, Sr²⁺, Ca²⁺), and Group VI (Mg²⁺) are insoluble!\n- Consequence: They precipitate prematurely along with Group III hydroxides, completely confusing the cation scheme.\n\n2. Phosphate Detection & Elimination Protocol:\n- Detection: Boil salt solution with 2 mL conc. HNO₃ + excess ammonium molybdate. A dense canary-yellow precipitate of (NH₄)₃[P(Mo₃O₁₀)₄] confirms PO₄³⁻.\n- Elimination Procedure (Sodium Acetate - FeCl₃ Method):\n  1. Take Group II filtrate, boil off H₂S, add conc. HNO₃ and boil.\n  2. Add NH₄OH dropwise until neutral, then add dilute acetic acid.\n  3. Add sodium acetate buffer (CH₃COONa) to fix pH at ~4.5.\n  4. Add neutral FeCl₃ solution dropwise until a reddish-brown color persists.\n  5. Boil and filter hot: Fe³⁺ selectively precipitates all phosphate as insoluble FePO₄ (yellow-white), while excess Fe³⁺ precipitates as brown basic ferric acetate Fe(OH)₂(CH₃COO).\n  6. The clear filtrate is now 100% phosphate-free and contains Group IV, V, and VI cations ready for normal separation!\n\n3. Confirmatory Tests for Selected Class 12 Cations:\n- Calcium (Ca²⁺): Brick-red flame; with ammonium oxalate in acetic acid gives fine white precipitate of CaC₂O₄.\n- Barium (Ba²⁺): Apple-green flame; with K₂CrO₄ in acetic acid gives bright yellow precipitate of BaCrO₄.\n- Magnesium (Mg²⁺): Magneson reagent in basic solution yields a striking sky-blue precipitate / lake.",
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

    // Evaluate all containers (beakers, flasks, cylinders, tubes, reagent bottles, chamber, dish)
    const containerTypes = [
      'borosilicate-beaker',
      'beaker-100ml',
      'beaker-50ml',
      'conical-flask',
      'graduated-measuring-cylinder',
      'test-tube-rack',
      'reagent-bottle',
      'developing-chamber',
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

    // Evaluate chromatography paper strips
    const papers = objects.filter((o) => o.equipmentId === 'chromatography-paper-strip');
    for (const paper of papers) {
      const sampleInk = String(paper.properties.sampleInk ?? 'black-ink');
      const elapsedSeconds = Number(paper.properties.elapsedSeconds ?? 60);
      const isDeveloping = paper.properties.isDeveloping !== false;

      const effectiveSeconds = isDeveloping ? elapsedSeconds : 0;
      const frontMm = calculateSolventFront(effectiveSeconds, 100);
      const spots = calculatePigmentPositions(sampleInk, frontMm);
      const rfText = spots
        .map((s) => `${s.pigmentName} (Rf=${s.rf.toFixed(2)})`)
        .join(', ');

      updates[paper.id] = {
        sampleInk,
        elapsedSeconds: effectiveSeconds,
        solventFrontMm: Number(frontMm.toFixed(1)),
        pigmentSpotsJson: JSON.stringify(spots),
        rfSummary: rfText,
        status:
          effectiveSeconds > 0
            ? `Solvent front: ${frontMm.toFixed(1)} mm. Bands: ${rfText}`
            : 'Dry chromatography strip at origin line',
      };
      messages.push(`Chromatography paper: Solvent front advanced to ${frontMm.toFixed(1)} mm.`);
    }

    // Evaluate displacement reaction (iron nail + copper sulphate)
    const tubes = objects.filter((o) => o.equipmentId === 'test-tube-rack');
    const nails = objects.filter((o) => o.equipmentId === 'iron-nail-substrate');

    for (const nail of nails) {
      const timeElapsed = Number(nail.properties.immersionTimeMinutes ?? 20);
      const isImmersed = nail.properties.isImmersed !== false;

      const dispState = calculateDisplacementState(timeElapsed, isImmersed);

      updates[nail.id] = {
        isImmersed,
        immersionTimeMinutes: timeElapsed,
        reactionProgressPercent: dispState.progressPercent,
        nailSurfaceColor: dispState.nailColor,
        solutionColor: dispState.solutionColor,
        depositedCopperGrams: dispState.depositedCopperGrams,
        dissolvedIronGrams: dispState.dissolvedIronGrams,
        netNailMassChangeGrams: dispState.netMassChangeGrams,
        redoxEquation: dispState.redoxEquation,
        reactionStatus: dispState.appearanceDescription,
        coatingAppearance: dispState.appearanceDescription,
        status: dispState.appearanceDescription,
      };

      if (isImmersed) {
        messages.push(
          `Displacement reaction: ${dispState.progressPercent}% progress (${dispState.depositedCopperGrams}g Cu deposited).`
        );
      }

      // Update reaction test tube
      for (const t of tubes) {
        if (t.id === 'tube-cu' || t.properties.reagentSolution === 'cuso4') {
          updates[t.id] = {
            solutionColor: dispState.solutionColor,
            molarityCuSO4: dispState.molarityCuSO4,
            molarityFeSO4: dispState.molarityFeSO4,
            chemicalComposition:
              dispState.progressPercent > 50
                ? '0.5M FeSO₄(aq) + Cu(s) deposit'
                : 'CuSO₄(aq) + FeSO₄(aq)',
            observationText:
              dispState.progressPercent > 0
                ? `Color shifted to ${dispState.solutionColor} (Fe²⁺ ion formation)`
                : 'Initial blue CuSO₄ solution',
          };
        }
      }
    }

    // Evaluate evaporating dishes (crystallisation)
    const dishes = objects.filter((o) => o.equipmentId === 'porcelain-evaporating-dish');
    for (const dish of dishes) {
      const tempC = Number(dish.properties.solutionTemperatureC ?? 85);
      const soluteG = Number(dish.properties.soluteMassGrams ?? 20);
      const waterMl = Number(dish.properties.initialWaterVolumeMl ?? 50);
      const evapMins = Number(dish.properties.evaporationTimeMins ?? 15);
      const isHeating = dish.properties.isHeating !== false;

      const crysState = calculateCrystallisation({
        initialSoluteMassG: soluteG,
        initialWaterVolumeMl: waterMl,
        temperatureC: tempC,
        evaporationTimeMins: evapMins,
        isHeating,
      });

      updates[dish.id] = {
        solutionTemperatureC: tempC,
        remainingWaterMl: crysState.remainingWaterMl,
        saturationRatio: crysState.saturationRatio,
        saturationStatus: crysState.saturationStatus,
        crystalYieldGrams: crysState.crystalYieldGrams,
        crystalGrowthPercent: crysState.crystalGrowthPercent,
        crystalDescription: crysState.crystalDescription,
        liquidVolume: crysState.remainingWaterMl,
        liquidColor: '#2563eb',
        status:
          crysState.saturationStatus === 'supersaturated'
            ? `Crystallisation Active: ${crysState.crystalYieldGrams.toFixed(1)}g crystals formed`
            : crysState.saturationStatus === 'saturated'
              ? 'At Crystallisation Point (Saturated Solution)'
              : 'Unsaturated Solution',
      };

      if (crysState.saturationStatus === 'supersaturated') {
        messages.push(
          `Crystallisation: ${crysState.crystalYieldGrams.toFixed(1)}g pure CuSO₄·5H₂O crystals nucleated.`
        );
      }
    }

    // Evaluate graduated burettes
    const burettes = objects.filter((o) => o.equipmentId === 'graduated-burette-50ml');
    for (const b of burettes) {
      const capacity = Number(b.properties.capacityMl ?? 50);
      const stopcockOpen = Boolean(b.properties.stopcockOpen ?? false);
      let delivered = Number(b.properties.deliveredVolumeMl ?? 0);
      if (stopcockOpen && delivered < capacity) {
        delivered = Math.min(capacity, delivered + 0.1);
      }
      const remaining = Math.max(0, capacity - delivered);
      const meniscus = Number(delivered.toFixed(2));
      const reagent = String(b.properties.reagentSolution ?? 'hcl');

      updates[b.id] = {
        capacityMl: capacity,
        liquidVolume: Number(remaining.toFixed(2)),
        deliveredVolumeMl: meniscus,
        meniscusReading: meniscus,
        reagentSolution: reagent,
        stopcockOpen,
        status: `Burette reading: ${meniscus.toFixed(2)} mL delivered (${remaining.toFixed(2)} mL remaining in burette)`,
      };
      if (stopcockOpen) {
        messages.push(`Burette dispensing: Meniscus at ${meniscus.toFixed(2)} mL.`);
      }
    }

    // Evaluate digital analytical balances
    const balances = objects.filter((o) => o.equipmentId === 'digital-analytical-balance');
    for (const bal of balances) {
      const sampleMass = Number(bal.properties.sampleMassGrams ?? 0);
      const tareOffset = Number(bal.properties.tareOffsetGrams ?? 0);
      const tarePressed = Boolean(bal.properties.tarePressed ?? false);
      const dishPlaced = Boolean(bal.properties.watchGlassPlaced ?? true);
      const dishMass = dishPlaced ? 15.320 : 0;

      let effectiveTare = tareOffset;
      if (tarePressed) {
        effectiveTare = dishMass + sampleMass;
      }
      const grossMass = dishMass + sampleMass;
      const netMass = Math.max(0, grossMass - effectiveTare);

      updates[bal.id] = {
        grossMassGrams: Number(grossMass.toFixed(3)),
        netMassGrams: Number(netMass.toFixed(3)),
        displayedMassGrams: Number(netMass.toFixed(3)),
        tareOffsetGrams: Number(effectiveTare.toFixed(3)),
        tarePressed: false,
        status: `Analytical Balance: ${netMass.toFixed(3)} g ${effectiveTare > 0 ? '[TARED (NET)]' : '[GROSS]'}`,
      };
      messages.push(`Analytical balance display: ${netMass.toFixed(3)} g`);
    }

    // Evaluate Thiele melting point apparatuses
    const thieleApparatuses = objects.filter((o) => o.equipmentId === 'thiele-melting-apparatus');
    for (const thiele of thieleApparatuses) {
      const rawSampleId = String(thiele.properties.sampleId ?? 'benzoic-acid-solid');
      const sampleId = rawSampleId.replace('-solid', '');
      const currentTemp = Number(thiele.properties.currentTempC ?? 110);
      const isHeating = thiele.properties.isHeating !== false;
      const heatingRate = Number(thiele.properties.heatingRateDegPerSec ?? 1.0);

      const mpState = calculateMeltingPointState({ sampleId, currentTemperatureC: currentTemp });

      const phase =
        mpState.phaseState === 'liquid'
          ? 'liquid'
          : mpState.phaseState === 'softening'
            ? 'coexistence'
            : 'solid';

      updates[thiele.id] = {
        sampleName: mpState.sample.name,
        meltingPointC: mpState.sample.trueMeltingPointC,
        meltingRangeText: mpState.observedMeltingRangeText,
        currentTempC: currentTemp,
        isHeating,
        heatingRateDegPerSec: heatingRate,
        meltFraction: Number((mpState.liquidFraction * 100).toFixed(1)),
        phase,
        isMelting: mpState.isMeltingUnderway,
        meniscusAppearance: mpState.isMeltingComplete
          ? 'Clear liquid meniscus formed'
          : mpState.isMeltingUnderway
            ? 'Droplet formation / sintering'
            : 'Opaque crystalline powder',
        observation: mpState.status,
        status: `T = ${currentTemp.toFixed(1)}°C: ${phase.toUpperCase()} (${mpState.status})`,
      };

      if (mpState.isMeltingUnderway || mpState.isMeltingComplete) {
        messages.push(
          `Melting transition for ${mpState.sample.name} at ${currentTemp.toFixed(1)}°C: ${mpState.status}`
        );
      }
    }

    // Evaluate boiling point inverted capillary apparatuses
    const boilingApparatuses = objects.filter((o) => o.equipmentId === 'boiling-point-apparatus');
    for (const bp of boilingApparatuses) {
      const rawLiquidId = String(bp.properties.liquidId ?? 'ethanol-liquid');
      const liquidId = rawLiquidId.replace('-liquid', '');
      const bathTemp = Number(bp.properties.bathTempC ?? 78.3);
      const isHeating = bp.properties.isHeating !== false;
      const pressureKPa = Number(bp.properties.barometricPressureKPa ?? 101.325);

      const bpState = calculateBoilingPointState({
        liquidId,
        currentTemperatureC: bathTemp,
        ambientPressureKPa: pressureKPa,
        isHeating,
      });

      const bubbleStream =
        bpState.boilingState === 'continuous-vapor-stream'
          ? 'continuous-rapid-stream'
          : bpState.boilingState === 'trapped-air-bubbles'
            ? 'slow-occasional-bubbles'
            : bpState.boilingState === 'liquid-re-entry'
              ? 'liquid-re-entry'
              : 'none';

      updates[bp.id] = {
        liquidName: bpState.sample.name,
        standardBoilingPointC: bpState.sample.normalBoilingPointC,
        correctedBoilingPointC: bpState.pressureCorrectedBoilingPointC,
        vaporPressureKPa: bpState.vaporPressureKPa,
        bubbleStream,
        bubbleFrequencyHz: bpState.bubbleFrequencyHz,
        liquidEnteredCapillary: bpState.isLiquidReEntryCaptured,
        capillaryObservation: bpState.status,
        status: `Bath T = ${bathTemp.toFixed(1)}°C: ${bubbleStream.toUpperCase()} — ${bpState.status}`,
      };

      if (bpState.isBoiling) {
        messages.push(
          `Rapid continuous vapor stream issuing from capillary at ${bathTemp.toFixed(1)}°C for ${bpState.sample.name}.`
        );
      } else if (bpState.isLiquidReEntryCaptured) {
        messages.push(
          `True boiling point reached! Liquid sucked up into capillary at ${bathTemp.toFixed(1)}°C.`
        );
      }
    }

    // Evaluate acid comparison bench
    const acidBenches = objects.filter(
      (o) => o.equipmentId === 'acid-bench' || o.equipmentId === 'acid-comparison-bench'
    );
    for (const bench of acidBenches) {
      const concM = Number(bench.properties.concentrationM ?? 0.1);
      const volMl = Number(bench.properties.solutionVolumeMl ?? 50);

      const comparison = compareEquimolarAcids(concM);

      updates[bench.id] = {
        concentrationM: concM,
        solutionVolumeMl: volMl,
        strongAcidName: comparison.strongAcid.acidName,
        strongPH: comparison.strongAcid.ph,
        strongAlpha: comparison.strongAcid.degreeOfIonisationAlpha,
        strongAlphaPercent: comparison.strongAcid.percentIonisation,
        strongHydroniumM: comparison.strongAcid.hydroniumConcentrationM,
        strongEffervescence: comparison.strongAcid.magnesiumReaction.effervescenceIntensity,
        strongH2YieldMl: comparison.strongAcid.magnesiumReaction.totalH2GasVolumeMl,

        weakAcidName: comparison.weakAcid.acidName,
        weakPH: comparison.weakAcid.ph,
        weakAlpha: comparison.weakAcid.degreeOfIonisationAlpha,
        weakAlphaPercent: comparison.weakAcid.percentIonisation,
        weakHydroniumM: comparison.weakAcid.hydroniumConcentrationM,
        weakEffervescence: comparison.weakAcid.magnesiumReaction.effervescenceIntensity,
        weakH2YieldMl: comparison.weakAcid.magnesiumReaction.totalH2GasVolumeMl,

        hydroniumRatio: comparison.hydroniumRatio,
        totalHydrogenYieldMl: comparison.strongAcid.magnesiumReaction.totalH2GasVolumeMl,
        kineticInsight: comparison.pedagogicalTakeaway,
        status: `HCl pH ${comparison.strongAcid.ph.toFixed(2)} (α=100%) vs CH₃COOH pH ${comparison.weakAcid.ph.toFixed(2)} (α=${comparison.weakAcid.percentIonisation.toFixed(2)}%). [H⁺] ratio: ${comparison.hydroniumRatio.toFixed(1)}×`,
      };

      messages.push(
        `Acid Comparison (${concM}M): HCl [H⁺]=${comparison.strongAcid.hydroniumConcentrationM.toFixed(3)}M vs CH₃COOH [H⁺]=${comparison.weakAcid.hydroniumConcentrationM.toExponential(2)}M.`
      );
    }

    // Evaluate closed chemical equilibrium chambers
    const equilibriumChambers = objects.filter((o) => o.equipmentId === 'closed-equilibrium-chamber');
    for (const chamber of equilibriumChambers) {
      const sysType = (chamber.properties.systemType as EquilibriumSystemType) ?? 'fe-scn';
      const tempC = Number(chamber.properties.temperatureC ?? 25);

      if (sysType === 'fe-scn') {
        const addedFe = Number(chamber.properties.addedFe3PlusM ?? 0);
        const addedSCN = Number(chamber.properties.addedSCNMinusM ?? 0);
        const addedF = Number(chamber.properties.addedFluorideM ?? 0);

        const eqState = calculateFeSCNEquilibrium({
          temperatureC: tempC,
          addedFe3PlusM: addedFe,
          addedSCNMinusM: addedSCN,
          addedFluorideM: addedF,
        });

        updates[chamber.id] = {
          system: 'fe-scn',
          temperatureC: tempC,
          kc: eqState.kc,
          equilibriumComplexM: eqState.equilibriumComplexM,
          absorbance450nm: eqState.absorbance450nm,
          colorHex: eqState.colorHex,
          shiftDirection: eqState.shiftDirection,
          opticalAppearance: eqState.opticalAppearance,
          explanation: eqState.explanation,
          status: `T = ${tempC}°C, Kc = ${eqState.kc}: ${eqState.opticalAppearance}`,
        };

        messages.push(`Fe-SCN Equilibrium (T=${tempC}°C): ${eqState.opticalAppearance}`);
      } else {
        const gasVol = Number(chamber.properties.gasVolumeL ?? 1.0);
        const eqState = calculateNO2N2O4Equilibrium({
          temperatureC: tempC,
          volumeLiters: gasVol,
        });

        updates[chamber.id] = {
          system: 'no2-n2o4',
          temperatureC: tempC,
          volumeLiters: gasVol,
          totalPressureAtm: eqState.totalPressureAtm,
          partialPressureNO2Atm: eqState.partialPressureNO2Atm,
          partialPressureN2O4Atm: eqState.partialPressureN2O4Atm,
          kp: eqState.kp,
          brownIntensityPercent: eqState.brownIntensityPercent,
          colorHex: eqState.colorHex,
          shiftDirection: eqState.shiftDirection,
          opticalAppearance: eqState.opticalAppearance,
          explanation: eqState.explanation,
          status: `P = ${eqState.totalPressureAtm} atm, V = ${gasVol} L: ${eqState.opticalAppearance}`,
        };

        messages.push(`NO₂-N₂O₄ Equilibrium (V=${gasVol}L, P=${eqState.totalPressureAtm}atm): ${eqState.opticalAppearance}`);
      }
    }

    // Evaluate volumetric flasks (standard solution preparation)
    const volumetricFlasks = objects.filter((o) => o.equipmentId === 'volumetric-flask-250ml');
    for (const flask of volumetricFlasks) {
      const soluteType = (flask.properties.soluteType as StandardSoluteType) ?? 'oxalic-acid';
      const targetMolarity = Number(flask.properties.targetMolarity ?? 0.1);
      const weighedMass = Number(flask.properties.weighedMassGrams ?? 3.152);
      const liquidVol = Number(flask.properties.liquidVolume ?? 250.0);
      const isDissolved = flask.properties.isDissolved !== false;
      const isStoppered = flask.properties.isStoppered !== false;
      const isInverted = flask.properties.isInvertedHomogeneous !== false;

      const solState = calculateStandardSolutionState({
        soluteType,
        targetMolarityM: targetMolarity,
        flaskCapacityMl: 250.0,
        weighedMassGrams: weighedMass,
        actualLiquidVolumeMl: liquidVol,
        isDissolved,
        isStoppered,
        isInvertedHomogeneous: isInverted,
      });

      updates[flask.id] = {
        soluteName: solState.solute.name,
        targetMolarityM: targetMolarity,
        theoreticalMassGrams: solState.theoreticalMassRequiredGrams,
        weighedMassGrams: weighedMass,
        liquidVolumeMl: liquidVol,
        actualMolarityM: solState.actualMolarityM,
        actualNormalityN: solState.actualNormalityN,
        percentageError: solState.percentageError,
        isMeniscusAligned: solState.isMeniscusAligned,
        stageStatus: solState.stageStatus,
        feedbackText: solState.feedbackText,
        status: `${solState.solute.name} Solution: ${solState.actualMolarityM} M (${solState.actualNormalityN} N) — ${solState.stageStatus.toUpperCase()}`,
      };

      messages.push(`Standard Solution: ${solState.feedbackText}`);
    }

    // Evaluate titration workbenches
    const titrationBenches = objects.filter((o) => o.equipmentId === 'titration-workbench');
    for (const bench of titrationBenches) {
      const system = (bench.properties.system as TitrationSystemType) ?? 'oxalic-acid-naoh';
      const va = Number(bench.properties.analyteVolumeMl ?? 20.0);
      const ma = Number(bench.properties.analyteMolarityM ?? 0.1);
      const mb = Number(bench.properties.titrantMolarityM ?? 0.1);
      const vb = Number(bench.properties.titrantDeliveredMl ?? 0.0);
      const indicator = (bench.properties.indicator as TitrationIndicator) ?? 'phenolphthalein';

      const titState = calculateTitrationState({
        system,
        analyteVolumeMl: va,
        analyteMolarityM: ma,
        titrantMolarityM: mb,
        titrantDeliveredMl: vb,
        indicator,
      });

      updates[bench.id] = {
        system,
        analyteVolumeMl: va,
        analyteMolarityM: ma,
        titrantMolarityM: mb,
        titrantDeliveredMl: vb,
        totalVolumeMl: titState.totalVolumeMl,
        equivalenceVolumeMl: titState.equivalenceVolumeMl,
        ph: titState.ph,
        hPlusM: titState.hPlusM,
        dpH_dV: titState.dpH_dV,
        isAtEndpoint: titState.isAtEndpoint,
        statusLabel: titState.status,
        indicator,
        solutionColorHex: titState.solutionColorHex,
        indicatorColorName: titState.indicatorColorName,
        observation: titState.observation,
        status: `Titre V = ${vb.toFixed(1)} mL (Veq = ${titState.equivalenceVolumeMl.toFixed(1)} mL): pH ${titState.ph.toFixed(2)} [${titState.indicatorColorName}]`,
      };

      if (titState.isAtEndpoint) {
        messages.push(`TITRATION ENDPOINT: ${titState.observation}`);
      } else {
        messages.push(`Titration: ${titState.observation}`);
      }
    }

    // Evaluate salt analysis workbenches
    const saltBenches = objects.filter((o) => o.equipmentId === 'salt-analysis-workbench');
    for (const bench of saltBenches) {
      const selectedSalt = (bench.properties.selectedSalt as SaltSampleId) ?? 'nh4cl';
      const currentTest = (bench.properties.currentTest as SaltTestId) ?? 'physical';

      const outcome = runSaltAnalysisTest(selectedSalt, currentTest);

      updates[bench.id] = {
        selectedSalt,
        currentTest,
        testName: outcome.testName,
        procedure: outcome.procedure,
        observation: outcome.observation,
        inference: outcome.inference,
        tubeColorHex: outcome.tubeColorHex,
        precipitateColorHex: outcome.precipitateColorHex ?? '',
        precipitateLabel: outcome.precipitateLabel ?? '',
        gasEvolution: outcome.gasEvolution ?? '',
        flameColorHex: outcome.flameColorHex ?? '',
        chemicalEquation: outcome.chemicalEquation,
        status: `${outcome.testName}: ${outcome.observation} (Inference: ${outcome.inference})`,
      };

      messages.push(`Salt Analysis (${outcome.testName}): ${outcome.inference}`);
    }

    // Evaluate organic element detection workbenches
    const elementBenches = objects.filter((o) => o.equipmentId === 'element-detection-workbench');
    for (const bench of elementBenches) {
      const selectedSample = (bench.properties.selectedSample as OrganicSampleId) ?? 'urea';
      const currentTest = (bench.properties.currentTest as OrganicElementTestId) ?? 'nitrogen-prussian-blue';

      const outcome = runOrganicElementTest(selectedSample, currentTest);

      updates[bench.id] = {
        selectedSample,
        currentTest,
        testName: outcome.testName,
        targetElement: outcome.targetElement,
        procedure: outcome.procedure,
        observation: outcome.observation,
        inference: outcome.inference,
        isPositive: outcome.isPositive,
        tubeColorHex: outcome.tubeColorHex,
        precipitateColorHex: outcome.precipitateColorHex ?? '',
        precipitateLabel: outcome.precipitateLabel ?? '',
        chemicalEquation: outcome.chemicalEquation,
        status: `${outcome.testName}: ${outcome.observation} (${outcome.isPositive ? 'POSITIVE' : 'NEGATIVE'})`,
      };

      messages.push(`Organic Element Test (${outcome.targetElement}): ${outcome.inference}`);
    }

    // Evaluate colloid and surface chemistry apparatus
    const colloidBenches = objects.filter((o) => o.equipmentId === 'colloid-apparatus');
    for (const bench of colloidBenches) {
      const solType = (bench.properties.solType as SolType) ?? 'feoh3-sol';
      const laserActive = Boolean(bench.properties.laserActive ?? true);
      const electrolyte = (bench.properties.electrolyte as CoagulatingElectrolyte) ?? 'none';
      const electrolyteVolumeMl = Number(bench.properties.electrolyteVolumeMl ?? 0);

      const colloidState = calculateColloidState({
        solType,
        laserActive,
        electrolyte,
        electrolyteVolumeMl,
      });

      updates[bench.id] = {
        solType,
        solName: colloidState.sol.name,
        solCategory: colloidState.sol.category,
        solCharge: colloidState.sol.charge,
        laserActive,
        tyndallIntensityPercent: colloidState.tyndallIntensityPercent,
        tyndallConeVisible: colloidState.tyndallConeVisible,
        tyndallObservation: colloidState.tyndallObservation,
        coagulationStatus: colloidState.coagulationStatus,
        coagulationObservation: colloidState.coagulationObservation,
        effectiveColor: colloidState.effectiveColor,
        status: `${colloidState.sol.name}: ${colloidState.coagulationStatus} (Tyndall: ${colloidState.tyndallIntensityPercent}%)`,
      };

      messages.push(`Colloid (${colloidState.sol.name}): Tyndall ${colloidState.tyndallIntensityPercent}%, Status: ${colloidState.coagulationStatus}`);
    }

    // Evaluate kinetics reaction vessels
    const kineticsBenches = objects.filter((o) => o.equipmentId === 'kinetics-cross-bench');
    for (const bench of kineticsBenches) {
      const volumeThio = Number(bench.properties.volumeThiosulphateMl ?? 50);
      const volumeWater = Number(bench.properties.volumeWaterMl ?? 0);
      const volumeHcl = Number(bench.properties.volumeHclMl ?? 10);
      const tempC = Number(bench.properties.temperatureC ?? 25);
      const isStarted = Boolean(bench.properties.isReactionStarted ?? false);
      const elapsed = Number(bench.properties.elapsedSeconds ?? 0);

      const kinState = calculateKineticsState({
        stockThiosulphateM: 0.10,
        volumeThiosulphateMl: volumeThio,
        volumeWaterMl: volumeWater,
        volumeHclMl: volumeHcl,
        temperatureC: tempC,
        elapsedSeconds: elapsed,
        isReactionStarted: isStarted,
      });

      updates[bench.id] = {
        volumeThiosulphateMl: volumeThio,
        volumeWaterMl: volumeWater,
        effectiveThioM: kinState.effectiveThioM,
        timeToObscureSec: kinState.timeToObscureSec,
        ratePerSec: kinState.ratePerSec,
        turbidityPercent: kinState.turbidityPercent,
        crossObscured: kinState.crossObscured,
        crossVisibilityPercent: kinState.crossVisibilityPercent,
        observationStatus: kinState.observationStatus,
        solutionColor: kinState.solutionColor,
        sulphurPrecipitateGrams: kinState.sulphurPrecipitateGrams,
        status: kinState.crossObscured
          ? `CROSS OBSCURED at t = ${kinState.timeToObscureSec}s (Rate: ${kinState.ratePerSec} s⁻¹)`
          : isStarted
          ? `Reacting: Visibility ${kinState.crossVisibilityPercent}% (${elapsed.toFixed(1)}s / ${kinState.timeToObscureSec}s)`
          : 'Ready: Cross mark clearly visible through solution',
      };

      messages.push(`Kinetics: [Na2S2O3] = ${kinState.effectiveThioM} M -> Obscuration in ${kinState.timeToObscureSec}s`);
    }

    // Evaluate calorimeter assemblies
    const calorimeters = objects.filter((o) => o.equipmentId === 'calorimeter-assembly');
    for (const cal of calorimeters) {
      const reactionType = (cal.properties.reactionType as CalorimeterReactionType) ?? 'neutralization-hcl-naoh';
      const vAcid = Number(cal.properties.volumeAcidMl ?? 50);
      const vBase = Number(cal.properties.volumeBaseMl ?? 50);
      const mAcid = Number(cal.properties.molarityAcid ?? 1.0);
      const mBase = Number(cal.properties.molarityBase ?? 1.0);
      const wEq = Number(cal.properties.waterEquivalentW ?? 25.0);
      const isMixed = Boolean(cal.properties.isMixed ?? false);
      const elapsed = Number(cal.properties.elapsedSeconds ?? 0);

      const calState = calculateCalorimetryState({
        reactionType,
        volumeAcidMl: vAcid,
        volumeBaseMl: vBase,
        molarityAcid: mAcid,
        molarityBase: mBase,
        initialTempC: 22.0,
        waterEquivalentW: wEq,
        isMixed,
        elapsedSeconds: elapsed,
      });

      updates[cal.id] = {
        reactionName: calState.reaction.name,
        molesReacted: calState.molesReacted,
        theoreticalDeltaH: calState.theoreticalDeltaH,
        experimentalDeltaH: calState.experimentalDeltaH,
        errorPercent: calState.errorPercent,
        currentTempC: calState.currentTempC,
        peakTempC: calState.peakTempC,
        heatEvolvedJoules: calState.heatEvolvedJoules,
        observationStatus: calState.observationStatus,
        status: isMixed
          ? `T = ${calState.currentTempC}°C (Peak: ${calState.peakTempC}°C, ΔH: ${calState.experimentalDeltaH} kJ/mol)`
          : 'Equilibrated: Ready for mixing reactants',
      };

      messages.push(`Calorimeter (${calState.reaction.name}): ΔH = ${calState.experimentalDeltaH} kJ/mol (Theoretical: ${calState.theoreticalDeltaH} kJ/mol)`);
    }

    // Evaluate Daniell electrochemical cells
    const daniellCells = objects.filter((o) => o.equipmentId === 'daniell-cell-apparatus');
    for (const cell of daniellCells) {
      const znConc = Number(cell.properties.zincConcentrationM ?? 1.0);
      const cuConc = Number(cell.properties.copperConcentrationM ?? 1.0);
      const saltBridge = Boolean(cell.properties.saltBridgeInserted ?? true);
      const revPol = Boolean(cell.properties.voltmeterPolarityReversed ?? false);

      const cellState = calculateDaniellCellState({
        zincConcentrationM: znConc,
        copperConcentrationM: cuConc,
        saltBridgeInserted: saltBridge,
        temperatureC: 25.0,
        voltmeterPolarityReversed: revPol,
      });

      updates[cell.id] = {
        standardEmfVolts: cellState.standardEmfVolts,
        measuredEmfVolts: cellState.measuredEmfVolts,
        voltmeterReadingText: cellState.voltmeterReadingText,
        reactionQuotientQ: cellState.reactionQuotientQ,
        logQ: cellState.logQ,
        circuitClosed: cellState.circuitClosed,
        observationStatus: cellState.observationStatus,
        status: `EMF: ${cellState.voltmeterReadingText} | [Zn²⁺]/[Cu²⁺] = ${znConc}/${cuConc} M (logQ = ${cellState.logQ})`,
      };

      messages.push(`Daniell Cell: EMF = ${cellState.voltmeterReadingText}`);
    }

    // Evaluate Inorganic and Organic Synthesis Benches
    const synthBenches = objects.filter(
      (o) => o.equipmentId === 'inorganic-synth-assembly' || o.equipmentId === 'organic-synth-assembly'
    );
    for (const bench of synthBenches) {
      const compoundId =
        (bench.properties.compoundId as CompoundSynthesisId) ??
        (bench.equipmentId === 'inorganic-synth-assembly' ? 'mohrs-salt' : 'acetanilide');
      const stage = (bench.properties.stage as SynthesisStage) ?? 'reactant-mixing';
      const isAcidified = bench.properties.isAcidified !== false;
      const heatMin = Number(bench.properties.heatingDurationMin ?? 10);
      const coolMin = Number(bench.properties.coolingDurationMin ?? 15);

      const synthState = calculateSynthesisState({
        compoundId,
        stage,
        isAcidified,
        heatingDurationMin: heatMin,
        coolingDurationMin: coolMin,
      });

      updates[bench.id] = {
        compoundName: synthState.spec.name,
        currentStage: synthState.currentStage,
        solutionAppearance: synthState.solutionAppearance,
        crystalFormed: synthState.crystalFormed,
        crystalMassGrams: synthState.crystalMassGrams,
        practicalYieldPercent: synthState.practicalYieldPercent,
        purityPercent: synthState.purityPercent,
        meltingPointObservedC: synthState.meltingPointObservedC,
        crystalHabit: synthState.spec.crystalHabit,
        crystalColor: synthState.spec.crystalColor,
        status: synthState.statusMessage,
      };

      messages.push(`${synthState.spec.name} (${stage}): ${synthState.statusMessage}`);
    }

    // Evaluate Functional Group Identification Workbench
    const fgBenches = objects.filter((o) => o.equipmentId === 'functional-group-workbench');
    for (const bench of fgBenches) {
      const sampleId = String(bench.properties.selectedSample ?? 'cyclohexene');
      const testId = (bench.properties.selectedTest as FunctionalGroupTestId) ?? 'bromine-water';

      const outcome = runFunctionalGroupTest(sampleId, testId);

      updates[bench.id] = {
        sampleName: outcome.sampleName,
        testName: outcome.testName,
        isPositive: outcome.isPositive,
        tubeColorHex: outcome.tubeColorHex,
        precipitateColorHex: outcome.precipitateColorHex ?? '',
        gasEvolution: outcome.gasEvolution ?? '',
        observation: outcome.observation,
        inference: outcome.inference,
        chemicalEquation: outcome.chemicalEquation,
        status: `${outcome.sampleName} - ${outcome.testName}: ${outcome.isPositive ? 'POSITIVE' : 'NEGATIVE'}`,
      };

      messages.push(
        `Functional Group Test (${outcome.sampleName}): ${outcome.isPositive ? 'POSITIVE' : 'NEGATIVE'} - ${outcome.inference}`
      );
    }

    // Evaluate Food Component Testing Workbench
    const foodBenches = objects.filter((o) => o.equipmentId === 'food-testing-workbench');
    for (const bench of foodBenches) {
      const sampleId = (bench.properties.selectedSample as FoodSampleId) ?? 'glucose';
      const testId = (bench.properties.selectedTest as FoodTestId) ?? 'molisch-test';

      const outcome = runFoodTest(sampleId, testId);

      updates[bench.id] = {
        sampleName: outcome.sampleName,
        testName: outcome.testName,
        nutrientTarget: outcome.nutrientTarget,
        isPositive: outcome.isPositive,
        tubeColorHex: outcome.tubeColorHex,
        ringOrPptHex: outcome.ringOrPptHex ?? '',
        observation: outcome.observation,
        inference: outcome.inference,
        limitationNote: outcome.limitationNote,
        chemicalPrinciple: outcome.chemicalPrinciple,
        status: `${outcome.sampleName} - ${outcome.testName}: ${outcome.isPositive ? 'POSITIVE' : 'NEGATIVE'}`,
      };

      messages.push(
        `Food Test (${outcome.sampleName}): ${outcome.isPositive ? 'POSITIVE' : 'NEGATIVE'} - ${outcome.nutrientTarget}`
      );
    }

    // Evaluate Redox Titration Assembly
    const redoxTitrs = objects.filter((o) => o.equipmentId === 'redox-titration-assembly');
    for (const bench of redoxTitrs) {
      const system = (bench.properties.system as RedoxTitrationSystem) ?? 'kmno4-mohrs-salt';
      const analyteVol = Number(bench.properties.analyteVolumeMl ?? 20);
      const analyteM = Number(bench.properties.analyteMolarityM ?? 0.05);
      const titrantM = Number(bench.properties.titrantMolarityM ?? 0.02);
      const deliveredMl = Number(bench.properties.titrantDeliveredMl ?? 0);
      const acidAdded = bench.properties.acidAdded !== false;
      const tempC = Number(bench.properties.temperatureC ?? (system === 'kmno4-oxalic-acid' ? 65 : 25));

      const redoxState = calculateRedoxTitrationState({
        system,
        analyteVolumeMl: analyteVol,
        analyteMolarityM: analyteM,
        titrantMolarityM: titrantM,
        titrantDeliveredMl: deliveredMl,
        acidAdded,
        temperatureC: tempC,
      });

      updates[bench.id] = {
        systemName: redoxState.systemName,
        analyteName: redoxState.analyteName,
        status: redoxState.status,
        equivalenceVolumeMl: redoxState.equivalenceVolumeMl,
        titrantDeliveredMl: redoxState.titrantDeliveredMl,
        upperMeniscusReading: redoxState.upperMeniscusBuretteReadingMl,
        solutionColorHex: redoxState.solutionColorHex,
        solutionAppearance: redoxState.solutionAppearance,
        calculatedMolarityM: redoxState.calculatedMolarityM,
        calculatedStrengthGperL: redoxState.calculatedStrengthGperL,
        observation: redoxState.observation,
        reactionEquation: redoxState.reactionEquation,
      };

      messages.push(
        `KMnO₄ Titration (${redoxState.analyteName}): V_delivered = ${deliveredMl} mL / V_eq = ${redoxState.equivalenceVolumeMl} mL (${redoxState.status})`
      );
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
