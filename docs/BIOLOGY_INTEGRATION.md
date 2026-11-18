# PrayogaProof — Biology Module Integration Guide

This document explains how the Biology Virtual Laboratory is integrated into the core architecture of PrayogaProof across routing, state management, laboratory workspaces, simulation media, viva voce grading, and mobile packaging.

---

## 1. Application Routing Integration

### `src/App.tsx`
The primary subject route is wired directly to the newly created `BiologyPage`:
```tsx
import BiologyPage from './pages/BiologyPage';

// Inside AppRoutes:
<Route path="subjects/biology" element={<BiologyPage />} />
```
This replaces the legacy `<ComingSoonPage subjectId="biology" />` placeholder, restoring immediate access from navigation headers, sidebars, and home screen subject cards.

---

## 2. Subject Dashboard (`src/pages/BiologyPage.tsx`)

`BiologyPage` serves as the entry portal for the Biology ecosystem:
- **Class Filtering:** Responsive tabs for `All`, `Foundation (Class 10)`, `Class 11`, and `Class 12`.
- **Search & Tag Filtering:** Full-text search and NCERT/NEET category tag filters.
- **Flagship Experiment Spotlight:** Prominent interactive card for the Osmosis experiment (`bio-osmosis`) featuring quick launch into guided or free lab modes.
- **Microscope Quick-Launch:** Dedicated shortcut to open the DIN Achromatic Virtual Microscope Studio.
- **NEET Preparation Banner:** Curated high-yield NEET biology topics and direct revision links.

---

## 3. Central Experiment Registry (`src/services/experimentRegistry.ts`)

Biology is registered as an active subject alongside Physics, Chemistry, and Mathematics:
```typescript
{
  id: 'biology',
  name: 'Biology',
  description: 'Explore the living world through virtual dissections, microscopy, and physiological simulations',
  color: 'emerald',
  icon: 'Microscope',
  totalExperiments: 15,
  availableExperiments: 15,
  status: 'active',
  curriculum: ['CBSE Class 10', 'CBSE Class 11', 'CBSE Class 12', 'NEET']
}
```
All 15 experiments are fully registered in the `EXPERIMENTS` array with comprehensive metadata:
- Class levels (`foundation`, `class-11`, `class-12`)
- Categories (Plant Physiology, Cell Biology, Molecular Genetics, Human Physiology, Ecology)
- Complete apparatus and reagent lists
- Guided step-by-step procedures and observation parameters
- Learning outcomes aligned with NCERT standards

---

## 4. Universal Lab Workspace & Biology Extension

### `src/services/lab/biologyExtension.ts`
Extends `SubjectLabExtension` with biological apparatus definitions:
- `compound-microscope`, `test-tube-rack`, `spotting-tile-12well`, `water-bath`, `thistle-funnel-osmometer`, `conical-flask-respirometer`, `photosynthesis-funnel`, `dissection-tray`
- Staining reagents: Safranin O, Methylene Blue, Acetocarmine, Lugol's Iodine, Sudan III, Benedict's, Biuret.

### `src/services/lab/registry.ts`
Registered in the master lab extension registry:
```typescript
import { biologyExtension } from './biologyExtension';

export const LAB_EXTENSIONS: Record<string, SubjectLabExtension> = {
  physics: physicsExtension,
  chemistry: chemistryExtension,
  biology: biologyExtension,
};
```

---

## 5. Experiment Workspace Switcher (`BiologyLabWorkspace.tsx`)

In both `src/pages/ExperimentDetailPage.tsx` and `src/pages/WorkspacePage.tsx`, Biology experiments route directly through `BiologyLabWorkspace`:
```tsx
{experiment.subjectId === 'biology' ? (
  <BiologyLabWorkspace
    experimentId={experiment.id}
    experimentTitle={experiment.title}
    defaultMode="dedicated"
  />
) : (
  <UniversalLabWorkspace experiment={experiment} mode={labMode} />
)}
```
`BiologyLabWorkspace` provides seamless 3-way mode switching:
1. **Dedicated Scientific Simulator:** Launches the custom mathematical simulation engine for the specific experiment.
2. **Virtual Microscope Studio:** Mounts specimen slides on the DIN achromatic stage with fine/coarse focus, oil immersion, and differential staining.
3. **Biological Workbench:** Wet lab workbench with test tube rack, thermostatic heating water bath, and 12-well spotting tile.

---

## 6. Simulation Media & Voice Viva Voce System

### `src/services/learning/simulationMediaRegistry.ts`
Every Biology experiment offers the standardized 5-tab pedagogical experience:
- **7 Pedagogical Video/Audio Segments:**
  1. Introduction & Historical Context (`intro`)
  2. Theoretical Foundation & Laws (`theory`)
  3. Apparatus & Reagent Overview (`apparatus`)
  4. Step-by-Step Procedure (`procedure`)
  5. Worked Example & Calculation (`worked-example`)
  6. Detailed Scientific Explanation (`explanation`)
  7. Common Mistakes & Precautions (`mistakes`)
- **Speech Synthesis Engine:** Fully compatible with browser and mobile audio unlock policies, offering audible English narration for all segments.
- **Viva Voce Assessment (40 Marks):** 5 randomized syllabus questions (8 marks each) mapped with `relevantSegmentId` to provide instantaneous audio-visual remediation upon incorrect answers.

---

## 7. Cross-Platform Mobile Packaging (Capacitor)

The Biology module compiles seamlessly into native Android and iOS applications:
- **Build Synchronization:**
  ```bash
  npm run build
  node app/scripts/sync.mjs
  ```
  Copies all web assets into `app/android/app/src/main/assets/public/` and `app/ios/App/App/public/`.
- **Android APK Build:**
  ```bash
  node app/scripts/build-apk.mjs
  ```
  Produces standalone installable package `app/builds/android/PrayogaProof-debug.apk` (5.27 MB).
- **Touch & Mobile Optimizations:**
  - Micro-touch sliders for coarse/fine focus knobs.
  - Multi-touch drag-and-drop support for test tube rack and spotting tiles.
  - Responsive layout adapts effortlessly to mobile, tablet, and desktop viewports.
