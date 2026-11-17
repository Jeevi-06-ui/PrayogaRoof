import { SubjectLabExtension, ConnectionValidationResult } from './types';
import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';

export const CHEMISTRY_EQUIPMENT: EquipmentDefinition[] = [
  {
    id: 'borosilicate-beaker',
    name: 'Borosilicate Beaker (250mL)',
    subjectId: 'chemistry',
    category: 'container',
    description: 'Graduated glass vessel for liquid containment, reagent dissolution, and solution mixing.',
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
        id: 'liquidVolume',
        label: 'Liquid Volume',
        type: 'number',
        defaultValue: 100,
        min: 0,
        max: 250,
        step: 10,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'reagentSolution',
        label: 'Contained Liquid',
        type: 'select',
        defaultValue: 'pure-water',
        options: [
          { label: 'Pure Distilled Water', value: 'pure-water' },
          { label: '0.1M Hydrochloric Acid (HCl)', value: 'hcl' },
          { label: '0.1M Sodium Hydroxide (NaOH)', value: 'naoh' },
          { label: 'Fresh Lemon Juice', value: 'lemon-juice' },
          { label: 'Copper(II) Sulphate (CuSO₄)', value: 'cuso4' },
          { label: 'Red Cabbage Extract', value: 'cabbage-extract' },
        ],
        editable: true,
      },
    ],
    renderType: 'beaker',
    colorTheme: '#059669',
  },
  {
    id: 'spotting-plate-cavities',
    name: 'Spotting Plate (12 Cavities)',
    subjectId: 'chemistry',
    category: 'container',
    description: 'White glazed porcelain tile with concave depressions for drop-scale colorimetric pH and indicator testing.',
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
    id: 'test-tube-rack',
    name: 'Borosilicate Test Tube',
    subjectId: 'chemistry',
    category: 'container',
    description: 'Cylindrical glass tube for small-scale displacement reactions and precipitation observation.',
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
      {
        id: 'base',
        name: 'Tube Base',
        type: 'generic',
        xOffset: 40,
        yOffset: 160,
        direction: 'south',
        color: '#64748b',
      },
    ],
    propertyDefinitions: [
      {
        id: 'liquidVolume',
        label: 'Volume in Tube',
        type: 'number',
        defaultValue: 20,
        min: 0,
        max: 50,
        step: 5,
        unit: 'mL',
        editable: true,
      },
      {
        id: 'solutionType',
        label: 'Solution',
        type: 'select',
        defaultValue: 'cuso4',
        options: [
          { label: '0.5M Copper Sulphate (CuSO₄)', value: 'cuso4' },
          { label: 'Pure Distilled Water', value: 'pure-water' },
          { label: 'Dilute Acetic Acid', value: 'acetic-acid' },
        ],
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
    description: 'Precision dropper to aspirate and deliver controlled drops (0.05 mL) to spotting cavities.',
    iconName: 'Pipette',
    defaultWidth: 90,
    defaultHeight: 150,
    rotatable: true,
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
        label: 'Drawn Reagent',
        type: 'select',
        defaultValue: 'universal-indicator',
        options: [
          { label: 'Universal Indicator Solution', value: 'universal-indicator' },
          { label: 'Red Cabbage Botanical Extract', value: 'cabbage-extract' },
          { label: 'Turmeric Indicator Solution', value: 'turmeric-solution' },
          { label: '0.1M Dilute HCl Droplets', value: 'hcl' },
          { label: '0.1M Dilute NaOH Droplets', value: 'naoh' },
        ],
        editable: true,
      },
      {
        id: 'dropCount',
        label: 'Drop Capacity',
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
    id: 'universal-ph-strip',
    name: 'Universal pH Test Strip',
    subjectId: 'chemistry',
    category: 'chemical',
    description: 'Chromatographic paper strip impregnated with indicator dyes for rapid colorimetric pH determination (0-14).',
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
    id: 'iron-nail-substrate',
    name: 'Cleaned Iron Nail (Fe)',
    subjectId: 'chemistry',
    category: 'component',
    description: 'Emery-sandpapered iron nail substrate for single displacement reactions in copper sulphate solution.',
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
    title: 'pH Testing with Universal Indicator',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'borosilicate-beaker',
      'spotting-plate-cavities',
      'pasteur-pipette-dropper',
      'universal-ph-strip',
    ],
    initialObjects: [
      {
        id: 'beaker-hcl',
        equipmentId: 'borosilicate-beaker',
        title: 'Beaker A (0.1M HCl)',
        x: 80,
        y: 120,
        rotation: 0,
        width: 130,
        height: 150,
        properties: { liquidVolume: 100, reagentSolution: 'hcl' },
        state: { samplePH: 1.2, liquidColor: '#e0f2fe' },
      },
      {
        id: 'plate-1',
        equipmentId: 'spotting-plate-cavities',
        title: 'Spotting Plate',
        x: 270,
        y: 140,
        rotation: 0,
        width: 180,
        height: 120,
        properties: {},
        state: { cavity1PH: 1.2, cavity1Color: '#ef4444' },
      },
      {
        id: 'pipette-1',
        equipmentId: 'pasteur-pipette-dropper',
        title: 'Universal Indicator Dropper',
        x: 520,
        y: 120,
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
        id: 'step-1',
        stepNumber: 1,
        title: 'Transfer Sample Droplets to Spotting Plate',
        instruction: 'Draw liquid from Beaker A (HCl) and deposit 2 drops into Cavity A1 of the Spotting Plate.',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Add Universal Indicator Droplet',
        instruction: 'Connect the Dropper tip to Cavity A1. Observe immediate red chromic shift characteristic of strong acids (pH 1-2).',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Verify with pH Strip',
        instruction: 'Select a pH test strip, immerse it in the sample, and read the resulting hex tint against the standardized spectrum scale.',
      },
    ],
    goals: [
      {
        id: 'goal-cavity',
        description: 'Introduce indicator drops to aqueous chemical sample.',
        isCompleted: false,
        validatorType: 'components-connected',
      },
    ],
    defaultNotebookNotes:
      'pH Testing Investigation:\n- HCl Sample: Universal indicator shifted to bright scarlet red (pH ~ 1.0, Strong Acid).\n- NaOH Sample: Shifted to deep royal purple (pH ~ 13.0, Strong Base).\n- Lemon Juice: Shifted to reddish-orange (pH ~ 2.5, Weak Organic Acid).',
  },
  {
    experimentId: 'displacement-reaction',
    title: 'Displacement Reaction (Iron in Copper Sulphate)',
    subjectId: 'chemistry',
    allowedEquipmentIds: [
      'test-tube-rack',
      'iron-nail-substrate',
    ],
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
        properties: { liquidVolume: 25, solutionType: 'cuso4' },
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
        state: { coatingDeposited: 'Reddish-brown elemental copper deposit', ironStatus: 'Displaced' },
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
        instruction: 'Over 15-20 minutes, observe blue Cu²⁺ fade to light green Fe²⁺ (FeSO₄) while reddish metallic copper plates onto the nail.',
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

    // Evaluate beakers
    const beakers = objects.filter((o) => o.equipmentId === 'borosilicate-beaker');
    for (const b of beakers) {
      const reagent = String(b.properties.reagentSolution ?? 'pure-water');
      let ph = 7.0;
      let color = '#e0f2fe';

      if (reagent === 'hcl') {
        ph = 1.2;
        color = '#fef2f2';
      } else if (reagent === 'naoh') {
        ph = 13.0;
        color = '#f0fdf4';
      } else if (reagent === 'lemon-juice') {
        ph = 2.4;
        color = '#fef9c3';
      } else if (reagent === 'cuso4') {
        ph = 4.0;
        color = '#38bdf8';
      } else if (reagent === 'cabbage-extract') {
        ph = 7.0;
        color = '#a855f7';
      }

      updates[b.id] = {
        samplePH: ph,
        liquidColor: color,
        solutionStatus: `${reagent.toUpperCase()} (pH ${ph})`,
      };
    }

    // Evaluate spotting plates
    const plates = objects.filter((o) => o.equipmentId === 'spotting-plate-cavities');
    const droppers = objects.filter((o) => o.equipmentId === 'pasteur-pipette-dropper');

    for (const p of plates) {
      const plateUpdates: Record<string, string | number | boolean> = {};

      // Check if dropper is connected to cavity
      for (const d of droppers) {
        const isConnectedToPlate = connections.some(
          (c) =>
            (c.fromObjectId === d.id && c.toObjectId === p.id) ||
            (c.fromObjectId === p.id && c.toObjectId === d.id)
        );

        if (isConnectedToPlate) {
          const reagent = String(d.properties.drawnReagent ?? 'universal-indicator');
          plateUpdates.cavityStatus = `Dispensed: ${reagent}`;
          plateUpdates.testedReaction = 'Colorimetric Shift Visible';
          messages.push(`Spotting cavity active with ${reagent}.`);
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
      warnings: [],
      messages,
      objectStateUpdates: updates,
    };
  },
};
