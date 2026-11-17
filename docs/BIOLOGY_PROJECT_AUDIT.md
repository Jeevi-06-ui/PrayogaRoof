# PrayogaProof — Biology Module Architecture & Repository Audit

**Biology Lead:** Hitesh  
**Development Branch:** `hitesh-biology`  
**Primary Owned Folder:** `src/experiments/biology/`  
**Phase Completed:** Phase 1 — Repository Inspection & Biology Architecture

---

## 1. Executive Summary & Audit Overview

PrayogaProof is a cross-platform virtual STEM laboratory application for Web, Android, and iOS (via Capacitor) designed for school students (CBSE Class 10, Class 11, Class 12, and NEET aspirants). The repository contains functional Physics (25 experiments) and Chemistry (27 experiments) modules, with Mathematics integrated via an isolated offline compatibility frame.

This audit establishes the baseline architectural contracts, dependencies, and integration interfaces for the **complete Biology learning ecosystem**, covering both the **Virtual Microscope Studio** and the **Biological Experiment Workbench**, alongside curriculum-aligned NCERT tracks and NEET-UG practice modules.

---

## 2. Comprehensive 12-Point Repository Audit

### 1. Existing React / Vite Project
- **Framework & Build System:** React 18.3.1 bundled with Vite 5.4.11 (`@vitejs/plugin-react` 4.3.4).
- **Architecture:** Client-side Single Page Application (SPA) with Progressive Web App (PWA) offline service worker caching (`public/sw.js`).
- **Build Performance:** Production build (`npm run build`) bundles in under 2.0 seconds into `dist/`.

### 2. TypeScript Configuration
- **Compiler:** TypeScript 5.6.3 (`tsc -b`).
- **Configs:** `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.
- **Paths:** Path alias `@/` mapped to `./src` in `vite.config.ts`.
- **Strictness:** Strict mode enabled, enforcing typed component props, domain interfaces, and null-safety.

### 3. Existing Routing and Navigation
- **Routing Engine:** `react-router-dom` 6.28.0 with `<BrowserRouter>` in `src/App.tsx`.
- **Master Shell:** `<AppLayout>` in `src/components/layout/AppLayout.tsx` providing a unified sticky header (`Header.tsx`), collapsible sidebar (`Sidebar.tsx`), and mobile bottom navigation (`MobileNav.tsx`).
- **Subject Routes:**
  - `/subjects/physics` $\to$ `PhysicsPage.tsx` (25 experiments)
  - `/subjects/chemistry` $\to$ `ChemistryPage.tsx` (27 experiments)
  - `/subjects/mathematics` $\to$ `MathematicsPage.tsx` (12 simulators + curriculum)
  - `/subjects/biology` $\to$ Currently routed to `ComingSoonPage.tsx` (to be transitioned to `BiologyPage.tsx` in subsequent phases).
  - `/workspace/:experimentId` $\to$ `WorkspacePage.tsx` (Universal Lab Workspace).

### 4. Shared Laboratory Workspace Architecture
- **Interactive Stage:** Multi-layer HTML5 Canvas powered by `react-konva` 18.2.10 and `konva` 9.3.16.
- **Components:**
  - `UniversalLabWorkspace.tsx`: Master three-panel coordinator.
  - `WorkspaceToolbar.tsx`: Mode switching (Guided vs. Free Lab), simulation execution (Start, Pause, Reset), Undo/Redo stack triggers, and report export.
  - `LabCanvas.tsx`: Multi-layer interactive canvas supporting drag-and-drop, touch controls, zoom, pan, and grid snapping.
  - `CanvasObject.tsx`: Specialized rendering for instruments, glassware, optical paths, and biochemical vessels.
  - `ObjectInspectorPanel.tsx`: Right panel for selected equipment properties, variable controls, sensor readouts, and notebook auto-logging.
  - `WorkspaceHistoryManager.ts`: Robust in-memory Undo/Redo stack with a 30-state cap.

### 5. Scientific Simulation Interfaces
- **Extension Contracts:** Defined in `src/services/lab/types.ts`:
  - `SubjectLabExtension`: `getEquipmentCatalogue()`, `getLabDefinitions()`, `validateConnection()`, `evaluateSimulation()`.
- **Registry:** `src/services/lab/registry.ts` exposes `LAB_EXTENSIONS`, providing pluggable extension slots for `physics`, `chemistry`, and now `biology`.

### 6. Shared Experiment Registry
- **File:** `src/services/experimentRegistry.ts`.
- **Curriculum Metadata:** Type `ExperimentMetadata` enforces structured metadata:
  - `id`, `title`, `subjectId`, `classLevel`, `implementationStatus`, `difficulty`, `gradeLevel`, `curriculumTags`, `learningObjectives`, `apparatus`, `safetyGuidelines`, `guidedModeOverview`, `freeLabOverview`.
- **Status:** 52 active platform experiments (25 Physics, 27 Chemistry). Biology has 15 mandatory experiments specified in the syllabus.

### 7. Student Progress, Analytics & Quiz Services
- **Context:** `StudentContext.tsx` (`useStudent()`) backed by `studentProgressService.ts`.
- **State Tracked:**
  - Completed experiments, in-progress experiments, trial records, quiz scores, XP points, and daily streak tracking.
- **Evaluation Question Banks:** Centralized in `conceptualQuestions.ts`.

### 8. IndexedDB and Offline Persistence
- **Storage Layer:** `idb` 8.0.0 managing database `prayogaproof-storage` (Version 1).
- **Stores:** `student_profile`, `experiment_progress`, `workspaces`, `app_settings`.
- **PWA Service Worker:** `public/sw.js` (v1.1.0) caching core application shell, assets, and offline navigation requests with a cache-first with stale-while-revalidate strategy.

### 9. Backend Status
- **Current State:** **Zero backend**. The entire application operates completely client-side and offline-first.
- **Proposed Future Backend:** Section 18 outlines an optional future Node.js/Express/PostgreSQL backend with Prisma ORM for cloud backup and multi-device sync, to be implemented only upon Team Lead approval.

### 10. Dependencies
- **Core:** `react`, `react-dom`, `react-router-dom`, `konva`, `react-konva`, `lucide-react`, `idb`, `clsx`, `tailwind-merge`.
- **Mobile Packaging:** `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`.
- **Zero Heavy External Dependencies:** Pure HTML5 Canvas 2D for high-speed rendering; no bloated WebGL or Three.js dependencies.

### 11. Git Branch and Uncommitted Changes
- **Branch:** `hitesh-biology` branched cleanly from `suhaas-mathematics` (commit `1d46118`).
- **Working Tree:** Clean, verified with zero uncommitted alterations.

### 12. Existing Test & Verification Suite
- **Unit & Integration:** Vitest 2.1.8 with `jsdom` and `@testing-library/react`. 47 test files with 364 passing tests.
- **Browser End-to-End:** Playwright 1.65.1 with 98 automated browser scenarios across Chromium, WebKit, and mobile viewport simulations.

---

## 3. Gap Analysis: What Exists vs. What Is Missing for Biology

| Architectural Area | Existing in PrayogaProof | Missing / Required for Biology | Biology Solution |
| :--- | :--- | :--- | :--- |
| **Virtual Microscope** | Optics simulation for lenses/mirrors (Physics). | Optical microscope body, slide stage, Abbe diffraction limit model, focal plane blur convolution, and biological specimen slide catalog. | Built `microscopeEngine.ts` and `MicroscopeStudio.tsx` with 4x, 10x, 40x, 100x oil immersion objectives. |
| **Osmosis & Tonicity** | Chemical equilibrium and reaction kinetics (Chemistry). | Semi-permeable membrane physics, van 't Hoff osmotic equation ($\Psi_s = -iCRT$), turgor pressure ($\Psi_p$), and plasmolysis dynamics. | Built `osmosisModel.ts` implementing thermodynamic water potential and volume kinetics. |
| **Enzyme Kinetics** | Qualitative acid/base rates. | Salivary amylase starch digestion model, pH optimum ($6.8$), thermal denaturation ($>55^\circ\text{C}$), and iodine indicator colorimetric scale. | Create `salivaryAmylaseModel.ts` in Phase 3. |
| **Genetics Engines** | Circuit solvers & stoich solvers. | Punnett square matrix generator, Mendelian monohybrid/dihybrid cross solver, gamete combination algorithm, and 1:2:1 / 3:1 ratio calculator. | Create `geneticsModel.ts` in Phase 4. |
| **Molecular Biology** | N/A | DNA replication fork animation, complementary base pairing ($A=T, G\equiv C$), leading/lagging Okazaki synthesis, and genetic code codon transcription/translation engine. | Create `molecularBiologyModel.ts` in Phase 4 & 5. |
| **Physiology & Anatomy** | Electrical circuits. | 4-chambered cardiac cycle with directional valve hydraulics, nephron ultrafiltration/countercurrent multiplier, and reflex arc neural conduction model. | Create `physiologyModel.ts` in Phase 5. |
| **NEET-UG Question Bank** | Foundation and standard CBSE questions. | 300+ NCERT-verified NEET-UG practice questions, assertion-reason items, and timed mock test engine with official marking (+4 / -1). | Create `neetQuestionBank.ts` and `NeetArena.tsx` in Phase 7. |
| **Offline Biology Tutor** | Static tooltips. | Context-aware deterministic rule-based pedagogical tutor with misconception identification and remedial pathways. | Create `biologyTutorService.ts` in Phase 9. |

---

## 4. Shared Interfaces Biology Will Use

1. **`SubjectLabExtension` Interface (`src/services/lab/types.ts`):**  
   Biology registers `biologyExtension` exposing biological equipment (`compound-microscope`, `glass-slide`, `dialysis-tubing`, `petri-dish`, `respirometer-chamber`, etc.) and evaluation functions.
2. **`StudentContext` (`src/context/StudentContext.tsx`):**  
   Tracks completed Biology experiments, trials, quiz results, and awards XP.
3. **`idb` Persistence (`src/services/db.ts`):**  
   Stores saved biological workspace states, trial observation logs, and practical reports in IndexedDB store `workspaces`.
4. **`Breadcrumbs` & Shared Components:**  
   Reuses `Breadcrumbs`, `Badge`, `Button`, `StatCard`, `Modal`, `Tabs`, and `LoadingSpinner` for 100% design system visual consistency.
5. **Parent Service Worker (`public/sw.js`):**  
   Pre-caches all biological vector assets, SVG specimen templates, and offline learning scripts.
