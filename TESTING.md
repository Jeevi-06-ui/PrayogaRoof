# PrayogaProof Quality Assurance & Testing Guide

This document outlines the testing architecture, benchmark verification matrices, and command reference for **PrayogaProof**.

---

## 1. Testing Architecture Overview

PrayogaProof employs a multi-tiered testing strategy:

```
+-------------------------------------------------------------+
|              E2E Tests (Playwright)                         |
|   Desktop Chromium & Mobile Chrome (Touch, Viewports, Nav)  |
+-------------------------------------------------------------+
|              Integration Tests (Vitest + RTL)               |
|   10 Experiment Routes, Toolbars, Inspectors, Persistence   |
+-------------------------------------------------------------+
|              Unit & Scientific Benchmark Tests              |
|   MNA Circuit Solver, Optics, Mechanics, Chemistry Kinetics  |
+-------------------------------------------------------------+
|              Static Verification (ESLint + TypeScript)      |
|   tsc -b strict checking, ESLint clean rules                |
+-------------------------------------------------------------+
```

---

## 2. Test Execution Command Reference

| Command | Purpose | Tools Used |
| :--- | :--- | :--- |
| `npm test` | Run all 19 unit & integration test suites | Vitest + RTL |
| `npm run test:watch` | Interactive TDD watcher | Vitest |
| `npm run test:e2e` | Run end-to-end browser tests | Playwright |
| `npm run lint` | Static code analysis | ESLint |
| `npm run typecheck` | Strict compiler type verification | TypeScript (`tsc -b`) |
| `npm run build` | Production bundle verification | Vite + TypeScript |

---

## 3. Scientific Benchmark Matrix

### Physics Laboratory
1. **Ohm's Law ($V = I \cdot R$):**
   - 12 V DC source across $4\ \Omega$ standard resistor yields exactly $3.0\ \text{A}$ ($Req = 4.0\ \Omega$).
   - 12 V DC source across $6\ \Omega$ standard resistor yields exactly $2.0\ \text{A}$ ($Req = 6.0\ \Omega$).
2. **Series & Parallel Networks:**
   - Series resistors ($R_1 = 6\ \Omega, R_2 = 6\ \Omega$): $R_{eq} = 12\ \Omega$, current $1.0\ \text{A}$, voltage drop $6\ \text{V}$ per resistor.
   - Parallel resistors ($R_1 = 6\ \Omega, R_2 = 6\ \Omega$): $R_{eq} = 3\ \Omega$, current $4.0\ \text{A}$, branch currents $2.0\ \text{A}$ each.
3. **Thin-Lens Optics ($\frac{1}{f} = \frac{1}{v} - \frac{1}{u}$):**
   - $f = 15\ \text{cm}, u = -30\ \text{cm} \ (2f) \implies v = +30\ \text{cm}$, magnification $m = -1.0$, inverted real image.
   - $f = 15\ \text{cm}, u = -45\ \text{cm} \ (> 2f) \implies v = +22.5\ \text{cm}$, magnification $m = -0.5$, diminished real image.
   - $f = 15\ \text{cm}, u = -10\ \text{cm} \ (< f) \implies v = -30\ \text{cm}$, erect magnified virtual image.
4. **Simple Pendulum Mechanics ($T = 2\pi\sqrt{\frac{L}{g}}$):**
   - $L = 1.0\ \text{m}, g = 9.80665\ \text{m/s}^2 \implies T \approx 2.006\ \text{s}$.
   - Rigorous mass invariance check: Period $T$ remains identical when bob mass varies from $20\ \text{g}$ to $2500\ \text{g}$ ($\frac{dT}{dm} = 0$).

### Chemistry Laboratory
1. **pH Scale & Indicators:**
   - $0.1\ \text{M}\ \text{HCl} \implies \text{pH} = 1.0$, scarlet red with universal indicator.
   - Pure Distilled $\text{H}_2\text{O} \implies \text{pH} = 7.0$, emerald green.
   - $0.1\ \text{M}\ \text{NaOH} \implies \text{pH} = 13.0$, royal purple.
2. **Displacement Reaction ($\text{Fe} + \text{CuSO}_4 \rightarrow \text{FeSO}_4 + \text{Cu}$):**
   - Single displacement kinetics: nail gains net mass ($M_{\text{Cu}} = 63.55 > M_{\text{Fe}} = 55.85$), solution transitions from royal blue to pale green.
3. **Crystallisation Yield & Solubility:**
   - Solubility $S(T) = 14.3 + 0.25T + 0.003T^2$.
   - Verifies supersaturation nucleation and recovery yield calculations during cooling.
