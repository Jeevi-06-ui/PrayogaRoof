import { SubjectLabExtension, ConnectionValidationResult } from './types';
import {
  EquipmentDefinition,
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  SimulationResult,
  LabDefinition,
} from '../../types';

// =========================================================================
// BIOLOGY EQUIPMENT CATALOGUE
// =========================================================================

export const BIOLOGY_EQUIPMENT_CATALOGUE: EquipmentDefinition[] = [
  {
    id: 'bio-microscope-compound',
    name: 'Compound Optical Microscope (4x-100x Oil)',
    category: 'instrument',
    subjectId: 'biology',
    description: 'High-resolution binocular compound microscope with revolving nosepiece, coarse/fine focusing, and Abbe condenser.',
    iconName: 'Microscope',
    defaultWidth: 140,
    defaultHeight: 180,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'stage-mount', name: 'Mechanical Stage', type: 'generic', xOffset: 70, yOffset: 120, direction: 'north', color: '#10b981' },
      { id: 'light-source', name: 'Substage Illumination', type: 'optical-axis', xOffset: 70, yOffset: 170, direction: 'south', color: '#f59e0b' },
    ],
    propertyDefinitions: [
      {
        id: 'magnification',
        label: 'Objective Lens',
        type: 'select',
        defaultValue: '10x',
        options: [
          { label: '4x Scanning (Red)', value: '4x' },
          { label: '10x Low Power (Yellow)', value: '10x' },
          { label: '40x High Power (Blue)', value: '40x' },
          { label: '100x Oil Immersion (White)', value: '100x' },
        ],
      },
      { id: 'coarseFocus', label: 'Coarse Focus Knob', type: 'number', defaultValue: 50, min: 0, max: 100, step: 1 },
      { id: 'fineFocus', label: 'Fine Focus Knob', type: 'number', defaultValue: 50, min: 0, max: 100, step: 1 },
      { id: 'illuminationLux', label: 'Substage Iris & Lamp', type: 'number', defaultValue: 80, min: 0, max: 100, step: 1 },
    ],
  },
  {
    id: 'bio-slide-prepared',
    name: 'Prepared Biological Microscope Slide',
    category: 'component',
    subjectId: 'biology',
    description: 'Precision mounted specimen slide on standard 75x25mm glass slide with coverslip.',
    iconName: 'Layers',
    defaultWidth: 90,
    defaultHeight: 50,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'slide-dock', name: 'Slide Stage Dock', type: 'generic', xOffset: 45, yOffset: 25, direction: 'north', color: '#10b981' },
    ],
    propertyDefinitions: [
      {
        id: 'specimenType',
        label: 'Specimen Mount',
        type: 'select',
        defaultValue: 'onion-peel',
        options: [
          { label: 'Onion Epidermal Peel', value: 'onion-peel' },
          { label: 'Human Cheek Epithelium', value: 'cheek-epithelium' },
          { label: 'Leaf Stomata Epidermis', value: 'stomata-peel' },
          { label: 'Root Tip Mitosis Squash', value: 'root-tip-mitosis' },
          { label: 'Human Peripheral Blood Smear', value: 'blood-smear' },
        ],
      },
      {
        id: 'stain',
        label: 'Biological Stain',
        type: 'select',
        defaultValue: 'safranin',
        options: [
          { label: 'Safranin O (Pink-Red)', value: 'safranin' },
          { label: 'Methylene Blue', value: 'methylene-blue' },
          { label: 'Acetocarmine', value: 'acetocarmine' },
          { label: 'Lugol Iodine', value: 'iodine' },
          { label: 'Unstained Mount', value: 'unstained' },
        ],
      },
    ],
  },
  {
    id: 'bio-osmometer-funnel',
    name: 'Thistle Funnel Osmometer Setup',
    category: 'instrument',
    subjectId: 'biology',
    description: 'Long-stem thistle funnel tied with selectively permeable parchment membrane, inverted in a water beaker.',
    iconName: 'FlaskRound',
    defaultWidth: 110,
    defaultHeight: 190,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'funnel-top', name: 'Funnel Capillary Stem', type: 'fluid-out', xOffset: 55, yOffset: 10, direction: 'north', color: '#38bdf8' },
      { id: 'funnel-reservoir', name: 'Membrane Bulb', type: 'fluid-in', xOffset: 55, yOffset: 170, direction: 'south', color: '#0284c7' },
    ],
    propertyDefinitions: [
      { id: 'sucroseConcentrationPercent', label: 'Internal Sucrose Concentration (%)', type: 'number', defaultValue: 20, min: 0, max: 60, step: 5 },
      { id: 'initialLiquidLevelMm', label: 'Initial Meniscus Height (mm)', type: 'number', defaultValue: 15, min: 0, max: 100, step: 1 },
    ],
  },
  {
    id: 'bio-potato-osmometer',
    name: 'Potato Tuber Cavity Osmometer',
    category: 'instrument',
    subjectId: 'biology',
    description: 'Peeled Solanum tuberosum block with flat bottom and central cavity containing hypertonic sucrose solution.',
    iconName: 'Box',
    defaultWidth: 120,
    defaultHeight: 110,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'potato-cavity', name: 'Internal Cavity Reservoir', type: 'fluid-in', xOffset: 60, yOffset: 40, direction: 'north', color: '#38bdf8' },
      { id: 'potato-base', name: 'Petri Dish Interface', type: 'fluid-out', xOffset: 60, yOffset: 100, direction: 'south', color: '#0284c7' },
    ],
    propertyDefinitions: [
      { id: 'sugarMolarity', label: 'Sugar Solution Molarity (M)', type: 'number', defaultValue: 0.5, min: 0, max: 2, step: 0.1 },
      { id: 'isBoiledControl', label: 'Boiled Dead Tissue Control', type: 'boolean', defaultValue: false },
    ],
  },
  {
    id: 'bio-respirometer-flask',
    name: 'Conical Seed Respirometer with Manometer',
    category: 'instrument',
    subjectId: 'biology',
    description: 'Airtight conical flask with suspended KOH tube and delivery tube connected to a capillary U-tube manometer.',
    iconName: 'FlaskConical',
    defaultWidth: 150,
    defaultHeight: 160,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'flask-chamber', name: 'Seed Chamber', type: 'fluid-in', xOffset: 50, yOffset: 90, direction: 'north', color: '#38bdf8' },
      { id: 'manometer-arm', name: 'Capillary Manometer Dip', type: 'fluid-out', xOffset: 130, yOffset: 140, direction: 'east', color: '#ef4444' },
    ],
    propertyDefinitions: [
      {
        id: 'seedState',
        label: 'Seed Condition',
        type: 'select',
        defaultValue: 'germinating',
        options: [
          { label: 'Germinating Gram Seeds', value: 'germinating' },
          { label: 'Boiled Control Seeds', value: 'boiled-dead' },
          { label: 'Dry Dormant Seeds', value: 'dry-dormant' },
        ],
      },
      { id: 'kohPresent', label: 'KOH CO2 Absorption Tube', type: 'boolean', defaultValue: true },
      { id: 'seedMassGrams', label: 'Seed Quantity (g)', type: 'number', defaultValue: 50, min: 10, max: 150, step: 10 },
    ],
  },
  {
    id: 'bio-photosynthesis-apparatus',
    name: 'Hydrilla Photosynthesis Chamber & Gas Funnel',
    category: 'instrument',
    subjectId: 'biology',
    description: 'Inverted funnel over fresh Hydrilla sprigs inside water beaker topped with an inverted gas collection tube.',
    iconName: 'Sun',
    defaultWidth: 140,
    defaultHeight: 180,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'funnel-stem', name: 'Gas Collection Neck', type: 'fluid-out', xOffset: 70, yOffset: 25, direction: 'north', color: '#10b981' },
      { id: 'beaker-water', name: 'Aqueous Media Reservoir', type: 'fluid-in', xOffset: 70, yOffset: 140, direction: 'south', color: '#38bdf8' },
    ],
    propertyDefinitions: [
      { id: 'lightIntensityLux', label: 'Light Intensity (Lux)', type: 'number', defaultValue: 1000, min: 0, max: 3000, step: 100 },
      { id: 'bicarbonatePercent', label: 'Sodium Bicarbonate CO2 Source (%)', type: 'number', defaultValue: 0.5, min: 0, max: 2.0, step: 0.1 },
      { id: 'waterTempC', label: 'Bath Temperature (°C)', type: 'number', defaultValue: 25, min: 5, max: 55, step: 1 },
    ],
  },
  {
    id: 'bio-spotting-tile-12well',
    name: 'Porcelain Spotting Tile (12 Wells)',
    category: 'container',
    subjectId: 'biology',
    description: 'Glazed white porcelain plate with 12 round depressions for serial colorimetric testing with iodine or reagents.',
    iconName: 'Grid',
    defaultWidth: 160,
    defaultHeight: 90,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'well-row1', name: 'Wells 1-6', type: 'fluid-in', xOffset: 80, yOffset: 30, direction: 'north', color: '#38bdf8' },
      { id: 'well-row2', name: 'Wells 7-12', type: 'fluid-in', xOffset: 80, yOffset: 65, direction: 'south', color: '#38bdf8' },
    ],
    propertyDefinitions: [
      {
        id: 'reagent',
        label: 'Indicator Reagent',
        type: 'select',
        defaultValue: 'iodine',
        options: [
          { label: "Lugol's Iodine", value: 'iodine' },
          { label: "Benedict's Solution", value: 'benedict' },
          { label: 'Biuret Reagent', value: 'biuret' },
        ],
      },
    ],
  },
  {
    id: 'bio-reagent-dispenser',
    name: 'Biological Reagent Dropping Bottle',
    category: 'container',
    subjectId: 'biology',
    description: 'Amber glass reagent bottle with ground-in glass dropper pipette.',
    iconName: 'Pipette',
    defaultWidth: 70,
    defaultHeight: 110,
    rotatable: false,
    renderType: 'generic-box',
    ports: [
      { id: 'dropper-tip', name: 'Dropper Nozzle', type: 'fluid-out', xOffset: 35, yOffset: 105, direction: 'south', color: '#38bdf8' },
    ],
    propertyDefinitions: [
      {
        id: 'reagentId',
        label: 'Reagent Type',
        type: 'select',
        defaultValue: 'iodine-lugol',
        options: [
          { label: "Lugol's Iodine Solution", value: 'iodine-lugol' },
          { label: "Benedict's Qualitative Reagent", value: 'benedict-reagent' },
          { label: 'Biuret Reagent (NaOH + CuSO4)', value: 'biuret-reagent' },
          { label: 'Sudan III Lipid Stain', value: 'sudan-iii' },
          { label: 'Salivary Amylase Enzyme Solution', value: 'salivary-amylase' },
          { label: '1% Starch Suspension', value: 'starch-1pct' },
          { label: 'Egg Albumin Protein Solution', value: 'albumin-solution' },
          { label: '20% Sucrose Solution', value: 'sucrose-20pct' },
        ],
      },
    ],
  },
];

// =========================================================================
// 15 BIOLOGY LAB DEFINITIONS
// =========================================================================

export const BIOLOGY_LAB_DEFINITIONS: LabDefinition[] = [
  // 1. Osmosis & Cell Water Potential
  {
    experimentId: 'bio-osmosis',
    title: 'Osmosis & Cell Water Potential Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-osmometer-funnel', 'bio-potato-osmometer', 'bio-reagent-dispenser'],
    initialObjects: [
      {
        id: 'obj-osmometer-1',
        equipmentId: 'bio-osmometer-funnel',
        title: 'Thistle Funnel Osmometer',
        x: 180,
        y: 120,
        rotation: 0,
        width: 110,
        height: 190,
        properties: { sucroseConcentrationPercent: 20, initialLiquidLevelMm: 20, currentLiquidLevelMm: 45 },
        state: { meniscusHeight: 45 },
      },
      {
        id: 'obj-potato-1',
        equipmentId: 'bio-potato-osmometer',
        title: 'Potato Cavity Osmometer',
        x: 420,
        y: 150,
        rotation: 0,
        width: 120,
        height: 110,
        properties: { sugarMolarity: 0.5, isBoiledControl: false, liquidRiseMm: 12 },
        state: { liquidRiseMm: 12 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Inspect Osmometer Bulb', instruction: 'Examine the semipermeable membrane separating 20% sucrose from pure water.' },
      { id: 'step-2', stepNumber: 2, title: 'Observe Solvent Influx', instruction: 'Track water potential gradient driving endosmosis and capillary rise.' },
      { id: 'step-3', stepNumber: 3, title: 'Test Boiled Potato Control', instruction: 'Compare live potato turgor against boiled dead tissue where membrane integrity is destroyed.' },
    ],
    goals: [
      { id: 'goal-osmosis-1', description: 'Observe meniscus elevation in thistle osmometer', isCompleted: false, validatorType: 'generic' },
    ],
    defaultNotebookNotes: 'Potato osmometer: live potato showed significant liquid rise (endosmosis); boiled control showed 0 rise.',
  },

  // 2. Stomata & Transpiration Mechanics
  {
    experimentId: 'bio-stomata',
    title: 'Stomata & Transpiration Mechanics Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-microscope-compound', 'bio-slide-prepared'],
    initialObjects: [
      {
        id: 'obj-microscope-stomata',
        equipmentId: 'bio-microscope-compound',
        title: 'Optical Microscope',
        x: 260,
        y: 100,
        rotation: 0,
        width: 140,
        height: 180,
        properties: { magnification: '40x', coarseFocus: 48, fineFocus: 52 },
        state: { inFocus: true },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Mount Leaf Epidermal Peel', instruction: 'Place Tradescantia lower peel on the mechanical stage and focus with 10x then 40x objective.' },
      { id: 'step-2', stepNumber: 2, title: 'Identify Stomatal Apparatus', instruction: 'Locate paired guard cells, stomatal aperture, and adjacent chloroplast-free epidermal cells.' },
      { id: 'step-3', stepNumber: 3, title: 'Evaluate Guard Cell Turgor', instruction: 'Vary light and relative humidity to study K+ ion uptake and stomatal pore dilation.' },
    ],
    goals: [
      { id: 'goal-stomata-1', description: 'Identify guard cells and stomatal pore under 40x', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 3. Salivary Amylase Action & Digestion Factors
  {
    experimentId: 'bio-salivary-amylase',
    title: 'Salivary Amylase Action & Enzyme Kinetics Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-spotting-tile-12well', 'bio-reagent-dispenser'],
    initialObjects: [
      {
        id: 'obj-tile-1',
        equipmentId: 'bio-spotting-tile-12well',
        title: 'Spotting Tile',
        x: 250,
        y: 140,
        rotation: 0,
        width: 160,
        height: 90,
        properties: { reagent: 'iodine', activeWellIndex: 4 },
        state: { achromicReached: false },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Incubate Amylase with Starch', instruction: 'Maintain reaction at 37°C in pH 6.8 buffer.' },
      { id: 'step-2', stepNumber: 2, title: 'Serial Spotting onto Iodine', instruction: 'Transfer one drop every 60 seconds into consecutive wells on the spotting tile.' },
      { id: 'step-3', stepNumber: 3, title: 'Determine Achromic Point', instruction: 'Record the elapsed time when iodine ceases to turn blue-black and remains pale yellow.' },
    ],
    goals: [
      { id: 'goal-amylase-1', description: 'Identify achromic point on spotting tile', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 4. Food Component Testing
  {
    experimentId: 'bio-food-testing',
    title: 'Food Component Qualitative Biochemical Assays',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-spotting-tile-12well', 'bio-reagent-dispenser'],
    initialObjects: [
      {
        id: 'obj-food-dispenser-1',
        equipmentId: 'bio-reagent-dispenser',
        title: 'Iodine Dropper Bottle',
        x: 220,
        y: 130,
        rotation: 0,
        width: 70,
        height: 110,
        properties: { reagentId: 'iodine-lugol' },
        state: { dropsDispensed: 0 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Carbohydrate Assay', instruction: 'Test starch with Lugol iodine (blue-black) and reducing sugars with heated Benedict solution (red Cu2O).' },
      { id: 'step-2', stepNumber: 2, title: 'Protein Biuret Assay', instruction: 'Add 10% NaOH and 1% CuSO4 to albumin extract to observe purple biuret complex.' },
      { id: 'step-3', stepNumber: 3, title: 'Lipid Emulsion Test', instruction: 'Stain oil droplets with Sudan III to observe scarlet red lipid globules.' },
    ],
    goals: [
      { id: 'goal-food-1', description: 'Complete qualitative assays for starch, protein, and fat', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 5. Respiration in Germinating Seeds
  {
    experimentId: 'bio-seed-respiration',
    title: 'Aerobic Respiration in Germinating Seeds Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-respirometer-flask'],
    initialObjects: [
      {
        id: 'obj-respirometer-1',
        equipmentId: 'bio-respirometer-flask',
        title: 'Seed Respirometer',
        x: 280,
        y: 120,
        rotation: 0,
        width: 150,
        height: 160,
        properties: { seedState: 'germinating', seedMassGrams: 50, kohPresent: true, liquidRiseCm: 4.8 },
        state: { liquidRiseCm: 4.8 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Setup Respirometer', instruction: 'Load 50 g germinating gram seeds into airtight conical flask with 20% KOH vial.' },
      { id: 'step-2', stepNumber: 2, title: 'Measure Manometer Ascent', instruction: 'Track the rise of colored water in the delivery tube caused by oxygen consumption.' },
      { id: 'step-3', stepNumber: 3, title: 'Confirm CO2 Absorption', instruction: 'Verify that 2KOH + CO2 -> K2CO3 + H2O creates partial vacuum driving water column upward.' },
    ],
    goals: [
      { id: 'goal-respiration-1', description: 'Observe oxygen consumption manometer rise', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 6. Photosynthesis & Limiting Factors
  {
    experimentId: 'bio-photosynthesis',
    title: 'Photosynthesis & Oxygen Evolution Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-photosynthesis-apparatus'],
    initialObjects: [
      {
        id: 'obj-photosynth-1',
        equipmentId: 'bio-photosynthesis-apparatus',
        title: 'Hydrilla Photosynthesis Chamber',
        x: 270,
        y: 110,
        rotation: 0,
        width: 140,
        height: 180,
        properties: { lightIntensityLux: 1200, bicarbonatePercent: 0.5, bubbleRatePerMin: 24 },
        state: { bubblesPerMin: 24 },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Submerge Hydrilla Sprigs', instruction: 'Invert glass funnel over cut sprigs with freshly severed ends directed upwards.' },
      { id: 'step-2', stepNumber: 2, title: 'Quantify Bubble Evolution', instruction: 'Count oxygen bubbles discharged per minute as light intensity and bicarbonate are modulated.' },
      { id: 'step-3', stepNumber: 3, title: 'Verify Blackman’s Law', instruction: 'Observe that bubble rate plateaus when CO2 or temperature becomes the limiting factor.' },
    ],
    goals: [
      { id: 'goal-photosynthesis-1', description: 'Measure oxygen bubble evolution rate', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 7. Mitosis Cell Division in Onion Root Tip
  {
    experimentId: 'bio-mitosis',
    title: 'Mitosis Stages & Mitotic Index Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-microscope-compound', 'bio-slide-prepared'],
    initialObjects: [
      {
        id: 'obj-microscope-mitosis',
        equipmentId: 'bio-microscope-compound',
        title: 'Root Tip Mitosis Microscope',
        x: 260,
        y: 100,
        rotation: 0,
        width: 140,
        height: 180,
        properties: { magnification: '100x', oilApplied: true, coarseFocus: 52, fineFocus: 50 },
        state: { inFocus: true },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Examine Meristem Squash', instruction: 'Inspect Allium cepa root tip stained with acetocarmine under 100x oil immersion.' },
      { id: 'step-2', stepNumber: 2, title: 'Identify Sequential Phases', instruction: 'Distinguish Prophase, Metaphase plate, Anaphase sister chromatid migration, and Telophase.' },
      { id: 'step-3', stepNumber: 3, title: 'Compute Mitotic Index', instruction: 'Calculate the ratio of dividing cells to total counted meristematic cells.' },
    ],
    goals: [
      { id: 'goal-mitosis-1', description: 'Identify Metaphase and Anaphase stages in root tip', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 8. Meiosis & Chromosomal Crossing Over
  {
    experimentId: 'bio-meiosis',
    title: 'Meiosis & Genetic Recombination Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-microscope-compound', 'bio-slide-prepared'],
    initialObjects: [
      {
        id: 'obj-microscope-meiosis',
        equipmentId: 'bio-microscope-compound',
        title: 'Meiosis Stage Microscope',
        x: 260,
        y: 100,
        rotation: 0,
        width: 140,
        height: 180,
        properties: { magnification: '100x', oilApplied: true },
        state: { inFocus: true },
      },
    ],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Inspect Prophase I Sub-stages', instruction: 'Trace Leptotene, Zygotene synapsis, Pachytene crossing over, and Diplotene chiasmata.' },
      { id: 'step-2', stepNumber: 2, title: 'Observe Reductional Segregation', instruction: 'Follow homologous chromosome disjunction at Anaphase I resulting in haploid dyads.' },
      { id: 'step-3', stepNumber: 3, title: 'Analyze Gamete Diversity', instruction: 'Examine 4 genetically recombinant haploid microspores produced after Meiosis II.' },
    ],
    goals: [
      { id: 'goal-meiosis-1', description: 'Observe crossing over and reductional division', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 9. Mendelian Genetics & Punnett Square
  {
    experimentId: 'bio-mendelian-genetics',
    title: 'Mendelian Genetics & Punnett Square Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: ['bio-slide-prepared'],
    initialObjects: [],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Monohybrid Cross', instruction: 'Cross heterozygous tall pea plants (Tt × Tt) to verify 3:1 phenotypic and 1:2:1 genotypic ratios.' },
      { id: 'step-2', stepNumber: 2, title: 'Dihybrid Cross', instruction: 'Cross dihybrid RrYy plants to generate 16-cell Punnett matrix and verify 9:3:3:1 assortment.' },
      { id: 'step-3', stepNumber: 3, title: 'Chi-Square Goodness-of-Fit', instruction: 'Compute χ² statistic comparing observed progeny counts against theoretical Mendelian frequencies.' },
    ],
    goals: [
      { id: 'goal-genetics-1', description: 'Compute 3:1 and 9:3:3:1 Mendelian ratios', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 10. DNA Replication Fork
  {
    experimentId: 'bio-dna-replication',
    title: 'DNA Replication Fork & Molecular Synthesis Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: [],
    initialObjects: [],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Unwind Parental Double Helix', instruction: 'Activate DNA Helicase to separate duplex DNA into leading and lagging template strands.' },
      { id: 'step-2', stepNumber: 2, title: 'Synthesize Complementary Strands', instruction: 'Observe continuous 5′-to-3′ synthesis on leading strand and discontinuous Okazaki fragment synthesis on lagging strand.' },
      { id: 'step-3', stepNumber: 3, title: 'Ligate and Seal Strands', instruction: 'DNA Polymerase I excises RNA primers; DNA Ligase seals the phosphodiester backbone.' },
    ],
    goals: [
      { id: 'goal-dna-1', description: 'Model leading and lagging strand synthesis', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 11. Gene Expression (Central Dogma)
  {
    experimentId: 'bio-gene-expression',
    title: 'Gene Expression (Transcription & Translation) Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: [],
    initialObjects: [],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Transcribe Template DNA', instruction: 'RNA Polymerase synthesizes single-stranded mRNA from 3′-to-5′ template strand.' },
      { id: 'step-2', stepNumber: 2, title: 'Ribosomal Initiation & Elongation', instruction: '40S/60S ribosome binds 5′ cap, recognizes AUG start codon, and coordinates aminoacyl-tRNA docking.' },
      { id: 'step-3', stepNumber: 3, title: 'Terminate Polypeptide Chain', instruction: 'Release factor binds stop codon (UAA, UAG, or UGA) to release synthesized polypeptide.' },
    ],
    goals: [
      { id: 'goal-expression-1', description: 'Synthesize polypeptide chain from mRNA transcript', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 12. Human Heart & Blood Circulation
  {
    experimentId: 'bio-heart-circulation',
    title: 'Human Heart Hemodynamics & Cardiac Cycle Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: [],
    initialObjects: [],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Examine 4-Chamber Anatomy', instruction: 'Trace blood path: Vena Cava -> RA -> RV -> Pulmonary Artery -> Lungs -> Pulmonary Veins -> LA -> LV -> Aorta.' },
      { id: 'step-2', stepNumber: 2, title: 'Step Through Cardiac Cycle', instruction: 'Observe coordinated atrial systole, ventricular isovolumetric contraction, and ventricular ejection.' },
      { id: 'step-3', stepNumber: 3, title: 'Correlate ECG and Heart Sounds', instruction: 'Match P-QRS-T waves with valve closure LUB (AV valves) and DUB (semilunar valves).' },
    ],
    goals: [
      { id: 'goal-heart-1', description: 'Correlate cardiac valves with systemic circulation', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 13. Nephron Physiology & Urine Formation
  {
    experimentId: 'bio-nephron',
    title: 'Nephron Physiology & Countercurrent Mechanism Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: [],
    initialObjects: [],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Glomerular Ultrafiltration', instruction: 'Observe afferent arteriole filtration yielding GFR of ~125 mL/min driven by net filtration pressure.' },
      { id: 'step-2', stepNumber: 2, title: 'Tubular Reabsorption in PCT & Henle', instruction: 'Reabsorb 100% glucose and examine osmotic countercurrent multiplier gradient (300 to 1200 mOsm/L).' },
      { id: 'step-3', stepNumber: 3, title: 'Hormonal ADH Regulation', instruction: 'Modulate vasopressin / ADH to regulate water permeability in collecting duct.' },
    ],
    goals: [
      { id: 'goal-nephron-1', description: 'Examine countercurrent medullary osmotic gradient', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 14. Reflex Arc & Neural Pathway
  {
    experimentId: 'bio-reflex-arc',
    title: 'Reflex Arc & Neural Pathway Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: [],
    initialObjects: [],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Stimulate Sensory Receptor', instruction: 'Apply thermal or mechanical patellar tap stimulus to trigger action potential.' },
      { id: 'step-2', stepNumber: 2, title: 'Afferent Conduction to Spinal Cord', instruction: 'Propagate nerve impulse via dorsal root ganglion to spinal interneuron in dorsal horn.' },
      { id: 'step-3', stepNumber: 3, title: 'Efferent Motor Response', instruction: 'Transmit command via ventral motor neuron to neuromuscular junction causing effector muscle twitch.' },
    ],
    goals: [
      { id: 'goal-reflex-1', description: 'Trace reflex arc action potential to effector muscle', isCompleted: false, validatorType: 'generic' },
    ],
  },

  // 15. Ecosystem Energy Flow & Trophic Pyramids
  {
    experimentId: 'bio-ecosystem-energy',
    title: 'Ecosystem Energy Flow & Lindeman’s 10% Law Laboratory',
    subjectId: 'biology',
    allowedEquipmentIds: [],
    initialObjects: [],
    initialConnections: [],
    guidedSteps: [
      { id: 'step-1', stepNumber: 1, title: 'Solar Energy Influx', instruction: 'Input 1,000,000 J radiant solar energy and observe 1% photosynthetic fixation (10,000 J) by producers.' },
      { id: 'step-2', stepNumber: 2, title: 'Apply Lindeman’s 10% Rule', instruction: 'Trace trophic efficiency: 1,000 J in herbivores, 100 J in primary carnivores, 10 J in apex predators.' },
      { id: 'step-3', stepNumber: 3, title: 'Simulate Trophic Cascade & Toxins', instruction: 'Introduce non-biodegradable pesticide (DDT) and observe progressive biomagnification.' },
    ],
    goals: [
      { id: 'goal-ecosystem-1', description: 'Verify Lindeman 10% energy transfer rule across trophic levels', isCompleted: false, validatorType: 'generic' },
    ],
  },
];

// =========================================================================
// BIOLOGY EXTENSION IMPLEMENTATION
// =========================================================================

export const biologyExtension: SubjectLabExtension = {
  subjectId: 'biology',
  name: 'Biology Virtual Laboratory Extension',

  getEquipmentCatalogue: () => BIOLOGY_EQUIPMENT_CATALOGUE,

  getLabDefinitions: () => BIOLOGY_LAB_DEFINITIONS,

  validateConnection: (
    _fromObj: WorkspaceObject,
    fromPort: PortDefinition,
    _toObj: WorkspaceObject,
    toPort: PortDefinition
  ): ConnectionValidationResult => {
    // Check if ports are compatible
    if (fromPort.type !== toPort.type) {
      return {
        allowed: false,
        reason: `Port mismatch: cannot connect ${fromPort.type} port to ${toPort.type} port.`,
      };
    }

    return {
      allowed: true,
      suggestedColor: '#10b981', // Biology emerald green
    };
  },

  evaluateSimulation: (
    objects: WorkspaceObject[],
    _connections: WorkspaceConnection[]
  ): SimulationResult => {
    return {
      valid: true,
      errors: [],
      warnings: [],
      messages: [
        `Biology simulation running: ${objects.length} apparatus units on laboratory bench.`,
      ],
      objectStateUpdates: {},
    };
  },
};
