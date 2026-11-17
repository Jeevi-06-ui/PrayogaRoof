# Experiment Module Developer Guide

This guide walks through creating and registering a new experiment within **PrayogaProof**, or extending the system to future subjects such as Biology or Mathematics.

---

## 1. Overview of the Extension System

PrayogaProof uses a modular Subject Extension architecture:

```
src/services/lab/
  ├── types.ts                # SubjectLabExtension interface definition
  ├── registry.ts             # Central extension registry and dispatch
  ├── genericExtension.ts     # Fallback / generic workspace tools
  ├── physicsExtension.ts     # Physics tools (circuits, optics, mechanics)
  └── chemistryExtension.ts   # Chemistry tools (glassware, reagents, reactions)
```

Each subject implements the `SubjectLabExtension` interface:

```typescript
export interface SubjectLabExtension {
  subjectId: SubjectId | 'generic';
  getEquipmentCatalogue: () => EquipmentDefinition[];
  getLabDefinitions: () => LabDefinition[];
  validateConnection: (
    fromObj: WorkspaceObject,
    fromPort: PortDefinition,
    toObj: WorkspaceObject,
    toPort: PortDefinition,
    connections: WorkspaceConnection[]
  ) => { valid: boolean; message?: string };
  runSimulation: (
    objects: WorkspaceObject[],
    connections: WorkspaceConnection[],
    labDef?: LabDefinition
  ) => SimulationResult;
}
```

---

## 2. Step-by-Step: Adding a New Experiment

### Step 1: Define the Scientific Model
Create a pure computational model in `src/services/<subject>/`:

```typescript
// src/services/physics/waveOpticsModel.ts
export interface DoubleSlitInput {
  wavelengthNm: number;
  slitSeparationMm: number;
  screenDistanceM: number;
}

export function calculateDoubleSlitPattern(params: DoubleSlitInput) {
  // Pure mathematical equation: fringe width beta = lambda * D / d
  const betaMm = (params.wavelengthNm * 1e-6 * params.screenDistanceM) / (params.slitSeparationMm * 1e-3);
  return { fringeWidthMm: betaMm };
}
```

### Step 2: Write Deterministic Benchmark Tests
Create a test in `tests/waveOpticsModel.test.ts` testing known physics cases before touching any UI code:

```typescript
it('calculates fringe width accurately for green light (532 nm)', () => {
  const result = calculateDoubleSlitPattern({
    wavelengthNm: 532,
    slitSeparationMm: 0.25,
    screenDistanceM: 1.0,
  });
  expect(result.fringeWidthMm).toBeCloseTo(2.128, 2);
});
```

### Step 3: Define Equipment
Add apparatus definitions into `src/services/lab/<subject>Extension.ts`:

```typescript
{
  id: 'laser-diode',
  name: 'Monochromatic Laser Diode (532nm)',
  category: 'optics',
  width: 90,
  height: 50,
  ports: [
    { id: 'beam-out', name: 'Beam', type: 'optical', x: 90, y: 25, direction: 'right' }
  ],
  defaultProperties: {
    wavelength: 532,
    powerMw: 5,
  },
  propertyDefinitions: [
    { key: 'wavelength', label: 'Wavelength (nm)', type: 'number', min: 400, max: 750, step: 1 }
  ]
}
```

### Step 4: Add Lab Definition
Register the experiment with guided steps, questions, and initial objects:

```typescript
{
  experimentId: 'double-slit-interference',
  subjectId: 'physics',
  title: 'Young’s Double-Slit Experiment',
  description: 'Investigate wave-nature of light and interference fringe patterns.',
  allowedEquipmentIds: ['laser-diode', 'double-slit-slide', 'observation-screen'],
  guidedSteps: [
    { id: 'step-1', title: 'Mount Laser Diode', instruction: 'Drag laser diode to the left rail.' },
  ],
  defaultNotebookNotes: 'Observations on fringe spacing:\n...',
}
```

### Step 5: Register the Route
Add the experiment route in `src/App.tsx`:
```tsx
<Route path="/workspace/double-slit-interference" element={<UniversalLabWorkspace experimentId="double-slit-interference" />} />
```

---

## 3. Future Subject Integration (Biology & Mathematics)

To activate Biology or Mathematics in future phases:
1. Create `src/services/lab/biologyExtension.ts` implementing `SubjectLabExtension`.
2. Register the extension in `LAB_EXTENSIONS` in `src/services/lab/registry.ts`.
3. In `src/pages/SubjectDetailPage.tsx`, toggle the subject status from `'coming-soon'` to `'active'`.
4. The core universal workspace, history stack, storage, and cross-platform mobile packaging will immediately support the new subject without any core architectural refactoring.
