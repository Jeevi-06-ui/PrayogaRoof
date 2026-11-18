# PrayogaProof — Laboratory Demonstration Architecture (Phase A & B Report)

**Date:** November 18, 2026  
**Status:** Completed & Fully Verified  
**Scope:** Reusable Visual Demonstration Controller, Dynamic Registry, Player Controls, and Ohm's Law Golden Reference  
**Test Suite:** 54 Test Files Passed | 509 Tests Passed (100% Pass Rate)

---

## 1. Executive Summary

This phase fulfills the fundamental architecture requested in the Master Demonstration Specification:
- Replaces generic video/theory placeholders with **genuine, step-by-step procedural demonstrations executed directly on the real virtual laboratory canvas**.
- Uses the **exact same apparatus definitions, ports, connection rules, and scientific calculation models** that students encounter in manual experiment mode.
- Isolates demonstration execution on a temporary, disposable canvas state so student progress, saved bench workspaces, and local IndexedDB records are never mutated.
- Supplies a golden reference implementation for **Ohm's Law** exercising all 10 procedural steps.
- Establishes the infrastructure ready to extend across all remaining 67 experiments (Physics: 25, Chemistry: 27, Biology: 15, Mathematics).

---

## 2. Phase A: Experiment Canvas APIs & Subsystem Inspection

### 2.1 Workspace & Canvas Engine Architecture
- **Universal Canvas (`LabCanvas.tsx` / `UniversalLabWorkspace.tsx`):**
  - Driven by `services/lab/registry.ts`, backed by subject extensions (`physicsExtension.ts`, `chemistryExtension.ts`, `biologyExtension.ts`).
  - Renders apparatus nodes (`CanvasObject.tsx`), interactive connection wires (`CanvasConnections.tsx`), and real-time inspector overlays.
  - Calls `runSimulation(objects, connections, subjectId)` to evaluate physical and chemical systems (Ohm's law circuit solver, lenses/mirrors ray-optics, kinematics, titrations, pH equilibria, stoichiometry, displacement, etc.).

### 2.2 Biology Laboratory Workspace
- Complex biological experiments (e.g. `bio-stomata`, `bio-mitosis`, `bio-heart-circulation`, `bio-osmosis`) utilize high-fidelity domain canvases (`BiologyLabWorkspace.tsx`, `VirtualMicroscopeStudio.tsx`, `GeneExpressionLab.tsx`).
- For biological demonstrations, the controller architecture accommodates process variable manipulation, structural inspection, and physiological timelines.

### 2.3 Mathematics Module Architecture
- Integrated in `public/math-module` via an offline-first responsive iframe bridge (`MathModulePage.tsx`).
- Covers 18 syllabus mathematical simulators (Quadratic Equations, Trigonometric Ratios, Statistics, 3D Geometry, Conic Sections, Calculus, Riemann Sums, Vectors, etc.).

---

## 3. Phase B: Reusable Demonstration Controller & Player Infrastructure

### 3.1 Scriptable Action Controller (`src/services/demonstrations/controller.ts`)
The `DemoController` manages deterministic timeline playback and state reconstruction without side effects. Supported actions include:
- `select`: Visually highlights the apparatus in the equipment catalogue.
- `add`: Spawns the required tool at coordinates `(x, y)` on the canvas.
- `move`: Smoothly animates equipment across the canvas over an exact millisecond duration.
- `rotate`: Rotates apparatus to valid physical orientations (e.g. lenses, mirrors, prism angles).
- `set`: Programmatically adjusts parameters (voltage, resistance, mass, slit width, chemical reagent, initial temperature).
- `connect`: Wires electrical terminals or joins fluid ports according to validated connection rules.
- `disconnect`: Removes wires or fluid couplings to simulate open circuits or setup adjustments.
- `transfer`: Transfers exact milliliter volumes of chemical reagents between containers, calculating dilution, pH changes, and substance conservation via `chemistryEngine.ts`.
- `run`: Triggers the scientific simulation engine to calculate real meter readings, derived physical quantities, or visual chemical shifts.

### 3.2 Dynamic Demonstration Registry (`src/services/demonstrations/registry.ts`)
- Centralized registry providing `getDemonstrationScript(experimentId)`, `hasDemonstrationScript(experimentId)`, and `registerDemonstrationScript(experimentId, script)`.
- Eliminates hardcoded component branching, enabling lazy loading of experiment demonstration scripts as each subject phase is completed.

### 3.3 Full-Featured Demonstration Player (`src/components/demonstrations/DemonstrationPlayer.tsx`)
Features all 16 required player capabilities:
1. **Play / Pause / Resume:** Smooth requestAnimationFrame loop synchronized with elapsed step duration.
2. **Replay Step:** Re-runs the current step from $t = 0$ with audio replay.
3. **Stop:** Resets the demonstration to Step 1 in a paused state.
4. **Previous / Next Step:** Instant deterministic seeking forward or backward with complete state reconstruction.
5. **Playback Speed:** 0.5×, 1.0×, 1.5×, 2.0× speed modifiers that dynamically scale animation delta and speech utterance rates.
6. **Narration Toggle:** Audio on/off checkbox; falls back seamlessly to caption-only playback if audio is disabled or fails.
7. **Captions Display:** Prominent dark-mode caption card presenting spoken dialogue in real time.
8. **Progress Bar:** `<progress max="1">` indicator reflecting overall demonstration progress.
9. **Fullscreen:** Container fullscreen toggle with graceful degradation if unpermitted by the browser.
10. **Step Dropdown:** Quick navigation to any of the 10 procedural steps.
11. **Live Model Measurements:** Displays real solver measurements (e.g. current in Amperes, potential in Volts).
12. **Mathematical Calculations Card:** Renders derived calculations using real model values (e.g. $R = V / I = 12.00\text{ V} / 2.00\text{ A} = 6.00\text{ }\Omega$).
13. **Common Mistakes Demonstration:** Real simulation of student pitfalls (e.g. open return wire causing 0 A current, followed by diagnosis and repair).
14. **Try It Yourself:** One-click launch into an empty, clean practice workspace without touching student's saved workbench.
15. **Return to Lab:** Switches back to student's continuously mounted interactive workspace.
16. **Full Transcript:** Collapsible `<details>` element with all 10 step titles and narrated paragraphs for accessibility and offline reading.

---

## 4. Golden Reference Demonstration: Ohm's Law (`ohmsLaw.ts`)

| Step # | Title | Visual Canvas Interaction | Voice Narration & Scientific Content |
| :--- | :--- | :--- | :--- |
| **Step 1** | Introduction & Objective | Clean canvas | Objective: Verify Ohm's law using identical laboratory apparatus to the interactive workspace. |
| **Step 2** | Equipment Selection | Highlights 4 tools in catalogue | Selects DC power supply, precision resistor, DC ammeter, and DC voltmeter. |
| **Step 3** | Apparatus Placement | Smooth placement animation | Moves supply (left), resistor (right), ammeter (series), voltmeter (parallel). |
| **Step 4** | Circuit Wiring | Connects 5 wire segments | Connects supply pos $\to$ ammeter $\to$ resistor $\to$ supply neg; voltmeter across resistor. |
| **Step 5** | Run Simulation | Adjusts voltage to 12V, R to 6Ω | Switches on circuit; existing circuit solver evaluates state. |
| **Step 6** | Read Measurements | Live meters display values | Reads 2.00 A current and 12.00 V potential difference from live solver. |
| **Step 7** | Mathematical Calculation | Formula card pops up | Calculates $R = V / I = 12.00\text{ V} / 2.00\text{ A} = 6.00\text{ }\Omega$. |
| **Step 8** | Comparative Trial | Adjusts voltage to 6V, re-runs | Evaluates $V = 6.00\text{ V}, I = 1.00\text{ A} \implies R = 6.00\text{ }\Omega$ (constant ratio). |
| **Step 9** | Common Mistake Diagnosis | Disconnects return wire | Shows open circuit (0 A), explains consequence, repairs connection and recovers 1 A. |
| **Step 10** | Student Practice | Clean practice call-to-action | "Try It Yourself" opens a clean practice workspace. |

---

## 5. Two Clear Actions & Viva Voce Remediation Deep-Linking

### 5.1 Primary Actions on Every Experiment Page
Every experiment detail page ([`ExperimentDetailPage.tsx`](file:///Users/jeevithp/Desktop/PrayogaRoof-Final/src/pages/ExperimentDetailPage.tsx)) prominently renders:
- **Button 1: "Perform Experiment":** Opens the interactive laboratory canvas for manual hands-on work.
- **Button 2: "Load Simulation":** Opens the step-by-step visual demonstration section.

### 5.2 Viva Voce Remediation Routing
When a student answers incorrectly or selects "I Don't Know" on any of the 5 syllabus viva questions:
1. Scientific explanation is revealed alongside remediation hints.
2. Clicking **"Review Simulation Explanation with Voice"** routes directly to **Load Simulation**.
3. Automatically seeks to the exact relevant demonstration step (e.g. Step 8 for V-I proportionality, Step 9 for open-circuit errors).
4. Audio explanation plays, with a one-click button to **"Return to Viva Question"** to retry.

---

## 6. Automated Verification Results

- **Unit & Integration Tests:** 54 test files passed, 509 tests passed (100%).
- **Demonstration Controller Tests (`tests/demonstrationController.test.ts`):** 9/9 passed.
- **Narration Tests (`tests/simulationNarration.test.tsx`):** 13/13 passed.
- **Learning System Tests (`tests/simulationLearningSystem.test.tsx`):** 16/16 passed.
- **TypeScript Typecheck:** 0 errors (`tsc -b` clean).
- **Vite Production Build:** Lazy bundle `dist/assets/DemonstrationPlayer-BTNYJLv0.js` generated (12.60 kB).
- **Native Android APK:** Compiled at `app/builds/android/PrayogaProof-debug.apk` (5.35 MB).
