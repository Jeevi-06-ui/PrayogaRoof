# PrayogaProof — Biology Virtual Laboratory Ecosystem

## Overview

The **PrayogaProof Biology Virtual Laboratory** is a comprehensive, interactive, and mathematically validated learning platform built for CBSE Class 10 (Foundation), Class 11, Class 12, and NEET-UG aspirants. It provides students with hands-on, inquiry-driven biological experimentation without the logistical, safety, or ethical limitations of a traditional wet lab.

---

## Architecture & Directory Structure

```text
src/
├── pages/
│   └── BiologyPage.tsx                    # Subject dashboard with class filters, progress, NEET links
├── experiments/
│   └── biology/
│       ├── components/
│       │   ├── VirtualMicroscopeStudio.tsx# DIN achromatic microscope with 4x/10x/40x/100x objectives
│       │   ├── BiologicalWorkbench.tsx     # Wet-lab workbench with rack, water bath, and spotting tile
│       │   ├── BiologyLabWorkspace.tsx     # Master laboratory workspace switcher
│       │   ├── OsmosisLab.tsx              # Flagship Osmosis simulator (Potato + Thistle funnel)
│       │   ├── StomataLab.tsx              # Stomatal aperture & K+ ion flux simulator
│       │   ├── SalivaryAmylaseLab.tsx      # Starch enzyme kinetics & achromic point
│       │   ├── FoodTestingLab.tsx          # Iodine, Benedict's, Biuret, Sudan III assays
│       │   ├── SeedRespirationLab.tsx      # KOH respirometer & manometer displacement
│       │   ├── PhotosynthesisLab.tsx       # Hydrilla inverted funnel & bubble counting
│       │   ├── MitosisLab.tsx              # Allium cepa root squash & mitotic index
│       │   ├── MeiosisLab.tsx              # Prophase I sub-stages & crossing over
│       │   ├── MendelianGeneticsLab.tsx    # 2x2 & 4x4 Punnett squares with Chi-square
│       │   ├── DNAReplicationLab.tsx       # Replication fork, Helicase, Okazaki fragments
│       │   ├── GeneExpressionLab.tsx       # Central Dogma: Transcription & Translation
│       │   ├── HeartCirculationLab.tsx     # 4 chambers, cardiac cycle, ECG Lead II
│       │   ├── NephronLab.tsx              # Glomerular filtration, Henle loop, ADH
│       │   ├── ReflexArcLab.tsx            # Somatic reflex arc & latency counter
│       │   └── EcosystemEnergyFlowLab.tsx  # Lindeman's 10% law & biomagnification
│       └── index.ts                        # Master export barrel
├── services/
│   ├── experimentRegistry.ts               # Complete metadata for all 15 biology experiments
│   ├── lab/
│   │   ├── biologyExtension.ts             # Biology apparatus, stains, and lab definitions
│   │   └── registry.ts                     # Extension registration
│   └── learning/
│       └── simulationMediaRegistry.ts      # Voice narration scripts & viva questions
tests/
└── biologyScientificExperiments.test.tsx   # 27 comprehensive automated scientific tests
```

---

## The Two Reusable Environments

### 1. Virtual Microscope Studio (`VirtualMicroscopeStudio.tsx`)
- **DIN Achromatic Objectives:** 4x (Scanning, NA 0.10), 10x (Low Power, NA 0.25), 40x (High-Dry, NA 0.65), 100x (Oil Immersion, NA 1.25).
- **Physical Optical Blur Convolution:** Computes optical blur via focal distance formula:
  $$\text{Blur} = \min\left(16, \frac{|\text{focus} - \text{specimenDepth}|}{100} \times \frac{\text{power}}{10}\right)$$
- **Immersion Oil Mechanics:** High-refractive-index oil requirement enforced for 100x objective; lacking oil limits resolution and introduces spherical aberration.
- **Differential Staining:** Supports Safranin O (lignin/nuclei red), Methylene Blue (acidic cell components blue), Acetocarmine (chromatin crimson), Lugol's Iodine (starch amylose blue-black), and Native Unstained.
- **Mechanical Stage & Micrometer Scale Bar:** Smooth X/Y stage pan with calibrated $\mu\text{m}$ scale bar that rescales accurately with magnification.
- **Interactive Organelle Hotspots:** Clickable anatomical markers providing organelle functions and ultrastructure callouts.

### 2. Biological Workbench (`BiologicalWorkbench.tsx`)
- **Apparatus Rack:** Modular rack holding standard rimmed borosilicate test tubes ($16 \times 150\,\text{mm}$), thistle funnels, and transfer pipettes.
- **Thermostatic Water Bath:** Controllable heating element capable of maintaining target incubation temperatures (e.g., $37^\circ\text{C}$ enzymatic, $90^\circ\text{C}$ Benedict's boiling).
- **12-Well Porcelain Spotting Tile:** Serial spot-testing wells for timed kinetic sampling (ideal for salivary amylase achromic point tracking).
- **Colorimetric Transition Engine:** Real-time solution color transitions mirroring organic chemical reactions.

---

## 15 Interactive Experiment Simulators

| ID | Title | Class Level | Primary Paradigm | Core Concepts Covered |
| :--- | :--- | :--- | :--- | :--- |
| `bio-osmosis` | Osmosis in Plant Cells | Class 10 (Foundation) | Workbench + Graphing | Potato cavity, Thistle funnel, van 't Hoff water potential, turgor pressure |
| `bio-stomata` | Stomatal Distribution & Transpiration | Class 10 (Foundation) | Microscope Studio | Guard cell turgor, $K^+$ ion pump mechanics, radial microfibrils, transpiration flux |
| `bio-salivary-amylase` | Salivary Amylase Action on Starch | Class 10 (Foundation) | Spotting Tile Workbench | Temperature/pH bell-curve kinetics, achromic point, Iodine reaction |
| `bio-food-testing` | Tests for Biochemical Nutrients | Class 10 (Foundation) | Workbench + Water Bath | Iodine (starch), Benedict's (reducing sugars), Biuret (protein), Sudan III (lipids) |
| `bio-seed-respiration` | Respiration in Germinating Seeds | Class 10 (Foundation) | Specialized Respirometer | Aerobic respiration, $CO_2$ absorption by $20\%\,\text{KOH}$, manometer $\Delta h$ |
| `bio-photosynthesis` | Light Intensity & Photosynthesis | Class 11 | Optical Funnel Simulator | Hydrilla sprigs, bubble counting, Blackman's Law of Limiting Factors, glowing splint |
| `bio-mitosis` | Mitosis in Onion Root Tip Cells | Class 11 | Microscope Studio | Allium cepa root squash, Prophase/Metaphase/Anaphase/Telophase, Mitotic Index |
| `bio-meiosis` | Meiosis Stages in Flower Bud | Class 11 | Microscope Studio | Prophase I sub-stages, synapsis, chiasmata crossing over, reductional division |
| `bio-mendelian-genetics` | Mendelian Monohybrid & Dihybrid Crosses | Class 12 | Matrix & Punnett Engine | Allelic inheritance, 3:1 & 9:3:3:1 ratios, Chi-Square goodness-of-fit |
| `bio-dna-replication` | DNA Replication Mechanism | Class 12 | Molecular Animation Engine | Helicase unwinding, leading strand, lagging Okazaki fragments, DNA Ligase |
| `bio-gene-expression` | Transcription & Translation | Class 12 | Molecular Engine | Central Dogma, mRNA transcription, triplet codon ribosome translation |
| `bio-heart-circulation` | Human Heart & Double Circulation | Class 11 | Dynamic Cardiac Studio | 4 chambers, AV/SL valves, cardiac cycle phases, ECG Lead II, LUB-DUB sounds |
| `bio-nephron` | Structure & Function of Nephron | Class 11 | Renal Countercurrent Engine | Glomerular ultrafiltration, PCT reabsorption, Henle loop, ADH regulation |
| `bio-reflex-arc` | Reflex Arc & Nerve Conduction | Class 11 | Neuromuscular Stimulator | Somatic reflex arc, receptor, afferent axon, interneuron, efferent motor, latency |
| `bio-ecosystem-energy` | Ecosystem Energy Flow & Biomagnification | Class 12 | Trophic Pyramid Studio | Lindeman's 10% law, solar input partition, biomass pyramids, DDT magnification |

---

## Standardized 5-Tab Pedagogical Workflow

Each of the 15 Biology experiments is structured around PrayogaProof's five connected learning modes:
1. **Overview:** Syllabus alignment (CBSE & NEET-UG), theoretical foundations, apparatus definitions, and safety guidelines.
2. **Virtual Lab:** Dedicated interactive simulator with toggleable mode for Virtual Microscope or Biological Workbench.
3. **Load Simulation:** Video and voice narration module powered by Web Speech Synthesis with dedicated audio unlock controls and 7 synchronized pedagogical segments.
4. **Observations:** Quantitative data entry tables, calculated error deviations, and interactive dynamic graphing.
5. **Viva & Results:** 5 randomized syllabus questions (8 marks each = 40 marks total) with immediate feedback and voice remediation linking back to specific video segments.

---

## Verification & Testing

To execute automated tests across the Biology ecosystem:
```bash
# Run all biology-specific scientific tests
npm test -- tests/biologyScientificExperiments.test.tsx

# Run full project test suite (52 test suites, 433 tests)
npm test

# Run TypeScript static typecheck
npm run typecheck

# Build web distribution and mobile APK
npm run build
node app/scripts/sync.mjs
node app/scripts/build-apk.mjs
```
