# PrayogaProof — Complete Biology Development Roadmap

**Branch:** `hitesh-biology`  
**Lead Engineer:** Hitesh  
**Target Curriculum:** CBSE Class 10 Science (Biology), CBSE Class 11 & 12 Biology, NEET-UG Aspirants

---

```mermaid
flowchart LR
    P1["Phase 1\nAudit & Architecture"] --> P2["Phase 2\nMicroscope & Workbench"]
    P2 --> P3["Phase 3\nLabs 1–5 (Flagship Osmosis)"]
    P3 --> P4["Phase 4\nLabs 6–10 (Genetics & Cells)"]
    P4 --> P5["Phase 5\nLabs 11–15 (Physiology & Ecology)"]
    P5 --> P6["Phase 6\nCurriculum Tracks (10-12)"]
    P6 --> P7["Phase 7\nNEET Practice Arena"]
    P7 --> P8["Phase 8\nCBSE Assessments"]
    P8 --> P9["Phase 9\nAI Tutor & Voice/Video"]
    P9 --> P10["Phase 10\nReports & Analytics"]
    P10 --> P11["Phase 11\nShared Backend Sync"]
    P11 --> P12["Phase 12\nFinal Release QA"]
```

---

## Phase Breakdown & Acceptance Criteria

### Phase 1 — Repository Audit & Biology Architecture *(CURRENT)*
- [x] Comprehensive 12-point inspection of repository configuration, routing, dependencies, and test runners.
- [x] Establish typed domain contracts in `src/experiments/biology/types/biologyTypes.ts`.
- [x] Implement flagship scientific models:
  - `osmosisModel.ts` (van 't Hoff water potential, cell volume kinetics, plasmolysis).
  - `microscopeEngine.ts` (Abbe diffraction resolving power, depth-of-field focal blur, specimen slide catalog).
- [x] Create comprehensive documentation:
  - `BIOLOGY_PROJECT_AUDIT.md`
  - `BIOLOGY_ROADMAP.md`
  - `BIOLOGY_EXPERIMENT_MATRIX.md`
  - `BIOLOGY_SCIENTIFIC_VALIDATION.md`
  - `BIOLOGY_INTEGRATION.md`
- [x] Automated unit test suite with 100% pass rate (`biologyOsmosisModel.test.ts`, `biologyMicroscopeEngine.test.ts`).

### Phase 2 — Interactive Microscope Studio & Experiment Workbench
- Build `MicroscopeStudio.tsx`:
  - 4x, 10x, 40x, 100x oil objective revolver with color-coded DIN rings.
  - Dual coarse/fine coaxial focus knobs, stage X/Y positioners, iris diaphragm illumination control.
  - Slide clip loading and slide selection carousel with 5 NCERT specimen slides.
  - Real-time optical focal blur canvas convolution and organelle inspection callouts.
- Build `BiologicalWorkbench.tsx`:
  - Three-panel layout: Biology equipment sidebar, Konva drag-and-drop workspace stage, and inspector auto-log panel.
  - Mode toggle: Guided Step-by-Step vs. Free Lab Mode.
  - Standard Undo/Redo and experiment state reset controls.

### Phase 3 — First Five Biology Experiments
1. **Osmosis (`Osmosis.jsx`):** Interactive plant cell and animal RBC model, adjustable internal/external molarity (0–1.5 M), turgor pressure vs. plasmolysis animation, dynamic water flux graphs.
2. **Stomata & Transpiration (`Stomata.jsx`):** Leaf epidermis epidermal peel, kidney-shaped guard cells, light/humidity controls, stomatal aperture kinematics, transpiration rate meter.
3. **Salivary Amylase (`SalivaryAmylase.jsx`):** Starch-amylase digestion kinetics, temperature bath ($0\text{--}100^\circ\text{C}$), pH buffer control ($3\text{--}10$), iodine test coloration scale (deep blue-black $\to$ red-violet $\to$ yellow-brown achromic point).
4. **Food Component Testing (`FoodTesting.jsx`):** Virtual assays for Starch (Iodine), Proteins (Biuret), and Fats (Emulsion & grease spot), testing 5 real food substrates.
5. **Respiration in Germinating Seeds (`SeedRespiration.jsx`):** Sealed respirometer chamber, germinating vs. boiled control seeds, $\text{O}_2$ consumption manometer, $\text{CO}_2$ absorption by $\text{KOH}$.

### Phase 4 — Experiments 6 to 10 (Genetics & Cell Biology)
6. **Photosynthesis (`Photosynthesis.jsx`):** Hydrilla bubble counting assay, variable light intensity (lux), $\text{CO}_2$ ($\text{NaHCO}_3$ conc), Blackman's principle of limiting factors curve.
7. **Mitosis (`Mitosis.jsx`):** Onion root tip squash stages (Prophase, Metaphase, Anaphase, Telophase, Cytokinesis) with chromosome tracking and spindle assembly.
8. **Meiosis (`Meiosis.jsx`):** Reduction division, homologous pairing, crossing over in Pachytene, Meiosis I/II segregation, and 4 haploid gamete formation.
9. **Mendelian Genetics (`MendelianGenetics.jsx`):** Monohybrid and dihybrid Punnett square generator, parental allele selection, 1:2:1 genotype and 3:1 phenotype ratios with statistical validation.
10. **DNA Replication (`DNAReplication.jsx`):** Semiconservative replication fork, Helicase unzipping, RNA Primase, DNA Polymerase III 5' $\to$ 3' synthesis, leading vs. lagging Okazaki fragment ligation by DNA Ligase.

### Phase 5 — Experiments 11 to 15 (Physiology & Ecology)
11. **Transcription & Translation (`GeneExpression.jsx`):** DNA template reading, mRNA codon transcription ($A\to U, T\to A, C\to G, G\to C$), ribosome translation, tRNA anticodon pairing, polypeptide chain synthesis with Start (AUG) and Stop (UAA, UAG, UGA) codons.
12. **Human Heart & Circulation (`HeartCirculation.jsx`):** Interactive 4-chambered heart, atrioventricular and semilunar valves, deoxygenated systemic vs. oxygenated pulmonary blood flow paths, synchronized cardiac cycle (systole/diastole).
13. **Nephron & Urine Formation (`Nephron.jsx`):** Glomerular ultrafiltration, Bowman's capsule, proximal convoluted tubule reabsorption, Henle loop countercurrent multiplier, distal tubule secretion, and ADH-mediated water conservation.
14. **Reflex Arc (`ReflexArc.jsx`):** Sensory receptor stimulus, afferent action potential conduction, dorsal root ganglion, spinal cord interneuron integration, efferent motor neuron stimulation, effector muscle twitch.
15. **Ecosystem Energy Flow (`EcosystemEnergyFlow.jsx`):** Multi-trophic food web, Lindeman's 10% ecological energy transfer efficiency, trophic biomass/energy pyramids, and ecological perturbation simulations.

### Phase 6 — Complete CBSE Classes 10, 11 & 12 Curriculum Mapping
- Interactive lesson viewer for all NCERT units:
  - Class 10: Life Processes, Control & Coordination, Reproduction, Heredity, Our Environment.
  - Class 11: Living World, Plant & Animal Morphology, Cell Biology, Plant Physiology, Human Physiology.
  - Class 12: Reproduction, Genetics & Evolution, Biotechnology, Ecology & Environment.
- Original annotated SVG diagrams, common student misconceptions, key definitions, and NCERT line-by-line summaries.

### Phase 7 — NEET-UG Biology Preparation Arena
- 300+ NCERT-verified questions: single-correct MCQs, assertion-reason items, diagram labelling, and case-based questions.
- Timed mock exam interface: 90-question standard NEET format, official marking scheme (+4 / -1), question palette, and detailed step-by-step rationales.

### Phase 8 — CBSE Assessments & Practical Viva
- Class-specific CBSE board pattern questions: Very Short Answer (VSA), Short Answer (SA), Long Answer (LA), and Case-Based Questions with detailed marking rubrics.
- Interactive Viva Voce audio-prompt examiner for school practical exams.

### Phase 9 — AI Biology Tutor & Wrong-Answer Remediation
- Level 1 Offline Rule-Based Tutor: Deterministic concept explanations, NCERT references, and misconception correction.
- Level 2 Online AI Tutor Adapter: Structured prompt interfaces for future secure backend integration without exposing client credentials.
- Multi-step wrong answer teaching engine: Identifies root misconceptions, provides visual hints, and delivers remedial practice.
- Spoken voice explanations with speed controls and verified educational video integration.

### Phase 10 — Practical Reports, Bookmarks, Analytics & Gamification
- One-click Practical Report Generator exporting formatted PDF/printable experiment records with student observations, controlled variables, graphs, and conclusions.
- Progress dashboard tracking completed experiments, chapters, NEET accuracy, and milestone badges.

### Phase 11 — Shared Backend Expansion (Subject to Team Lead Approval)
- Architecture proposal for optional multi-device cloud synchronization, server-side examination grading, and student profiles using Node.js/PostgreSQL.

### Phase 12 — Final Release QA & Production Polish
- Full test pass across all unit, component, and E2E suites.
- Cross-platform Android & iOS Capacitor verification, mobile responsiveness, and clean production build.
