# PrayogaProof — Biology Module Integration Architecture

**Branch:** `hitesh-biology`  
**Biology Lead:** Hitesh  
**Primary Folder:** `src/experiments/biology/`

---

## 1. Architectural Principles

1. **Strict Non-Destructive Extension:**  
   The Biology module adds new capabilities to PrayogaProof without modifying or regressing existing Physics (25 experiments), Chemistry (27 experiments), or Mathematics (12 simulators).
2. **Standardized Shared Infrastructure:**  
   Reuses the core PrayogaProof layout (`<AppLayout>`), header (`Header.tsx`), sidebar (`Sidebar.tsx`), student context (`StudentContext.tsx`), and IndexedDB storage (`db.ts`).
3. **Dual Laboratory Paradigms:**  
   - **Microscope Studio:** Dedicated high-resolution specimen observation studio for cellular and histological experiments.
   - **Biological Workbench:** Drag-and-drop apparatus assembly for experimental physiology, genetics, and biochemical assays on the shared multi-layer Konva canvas.

---

## 2. Directory Structure

```
src/experiments/biology/
├── index.ts                      # Clean external exports
├── types/
│   └── biologyTypes.ts           # Complete typed domain contracts
├── models/
│   ├── osmosisModel.ts           # Water potential & plasmolysis engine (Flagship)
│   ├── microscopeEngine.ts       # Abbe diffraction & focal convolution engine
│   ├── enzymeKineticsModel.ts    # Salivary amylase starch digestion (Phase 3)
│   ├── geneticsModel.ts          # Punnett square combinatorics (Phase 4)
│   ├── molecularBiologyModel.ts  # Replication & transcription/translation (Phase 4/5)
│   └── physiologyModel.ts        # Cardiac, nephron & reflex conduction (Phase 5)
├── components/
│   ├── microscope/
│   │   ├── MicroscopeStudio.tsx  # Interactive optical microscope studio
│   │   ├── MicroscopeTurret.tsx  # Objective lens revolver (4x, 10x, 40x, 100x)
│   │   ├── SpecimenCanvas.tsx    # Multi-layer optical stage & organelle callouts
│   │   └── SlideSelector.tsx     # Slide tray and preparation mounts
│   └── workbench/
│       ├── BiologicalWorkbench.tsx # Shared 3-panel experimental laboratory
│       ├── BiologyToolbar.tsx    # Guided vs Free lab, run/pause/reset controls
│       └── BiologyInspector.tsx  # Property controls and auto-logging
├── curriculum/
│   ├── class10Biology.ts         # Life Processes, Control, Reproduction, Heredity
│   ├── class11Biology.ts         # Morphology, Cell Cycle, Plant & Human Physiology
│   ├── class12Biology.ts         # Genetics, Evolution, Biotech, Ecology
│   └── neetQuestionBank.ts       # 300+ NCERT-verified NEET-UG practice MCQs
└── services/
    ├── biologyTutorService.ts    # Offline rule-based tutor & misconception engine
    ├── practicalReportService.ts # PDF/print laboratory record generator
    └── wrongAnswerEngine.ts      # Multi-step diagnostic remediation
```

---

## 3. Integration with Shared Laboratory Registry (`src/services/lab/`)

### Registering `biologyExtension`:
In `src/services/lab/registry.ts`, the `LAB_EXTENSIONS` object maps each subject:
```typescript
import { biologyExtension } from '../../experiments/biology/services/biologyExtension';

export const LAB_EXTENSIONS: Record<string, SubjectLabExtension> = {
  generic: genericExtension,
  physics: physicsExtension,
  chemistry: chemistryExtension,
  biology: biologyExtension, // Pluggable biology laboratory extension
};
```

### Biological Apparatus Definitions:
- `compound-microscope`: Optical body, revolving nosepiece, coarse/fine adjustment.
- `glass-slide`: Prepared and wet mount slides with specimen coverslips.
- `dialysis-tubing`: Semipermeable membrane tube for osmosis demonstrations.
- `petri-dish`: Culture dish with agar / nutrient media.
- `respirometer-chamber`: Sealed chamber with KOH tube and U-tube manometer.
- `staining-tray`: Dropwise safranin, methylene blue, acetocarmine, and iodine.
- `hydrilla-beaker`: Photosynthesis inverted funnel and test-tube bubble trap.
- `punnett-board`: Genetics allele drag-and-drop matrix board.

---

## 4. Routing & Subject Integration

### 1. `src/App.tsx`:
When Phase 2 is reached, the route `/subjects/biology` will transition from `ComingSoonPage` to `BiologyPage`:
```tsx
<Route path="subjects/biology" element={<BiologyPage />} />
```

### 2. `src/services/experimentRegistry.ts`:
Updating `SUBJECTS` metadata for Biology:
```typescript
  {
    id: 'biology',
    name: 'Biology',
    tagline: 'Cellular Systems, Physiology & Genetics',
    description: 'Virtual microscopy, cellular processes, enzyme kinetics, genetics, and physiological dissection models.',
    status: 'active',
    accentColor: '#16a34a',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    totalExperiments: 15,
    availableExperiments: 15,
    iconName: 'Dna',
  }
```

---

## 5. Persistence & Offline Caching Architecture

1. **IndexedDB Schema (`src/services/db.ts`):**
   - Biology experiment saves, trial comparisons, and practical reports are serialized into the standard `workspaces` object store using unique IDs (`bio_osmosis_save_1`, `bio_mitosis_report_1`).
   - Student quiz scores, completed milestones, and XP integrate seamlessly with `student_profile` and `experiment_progress`.
2. **PWA Service Worker (`public/sw.js`):**
   - All Biology SVG slide assets, microscope vector graphics, and question bank JSON data will be pre-cached in `CORE_ASSETS` (`prayogaproof-core-v1.2.0`), guaranteeing zero-dependency 100% offline functionality.

---

## 6. Testing Strategy

- **Unit Tests (`tests/biology*Model.test.ts`):** Deterministic mathematical verification of all scientific algorithms with zero UI dependencies.
- **Component Tests (`tests/biology*Integration.test.tsx`):** Verification of DOM rendering, controls, parameter changes, and report generation via React Testing Library.
- **E2E Browser Tests (`e2e/biology.spec.ts`):** Playwright automated browser tests executing full laboratory workflows on mobile, tablet, and desktop viewports.
