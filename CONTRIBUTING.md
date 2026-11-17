# Contributing to PrayogaProof

Thank you for your interest in contributing to **PrayogaProof**, a cross-platform interactive STEM laboratory designed to democratize high-quality experimental education for school students worldwide.

---

## 1. Branching Strategy & Workflow

To maintain production stability and rigorous pedagogical quality:

1. **Main Branch Protection:** The `main` branch is protected. Direct commits are restricted. All changes land via reviewed Pull Requests.
2. **Branch Naming Conventions:**
   - Features: `feat/<domain>-<short-description>` (e.g. `feat/physics-wave-optics`)
   - Bug Fixes: `fix/<issue-description>` (e.g. `fix/beaker-overflow-calc`)
   - Documentation: `docs/<topic>` (e.g. `docs/cap-android-guide`)
   - Quality & Tests: `test/<suite-name>` (e.g. `test/circuit-benchmarks`)

---

## 2. Commit Message Guidelines

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short imperative summary>

[optional body explaining motivation and scientific formulas]
```

**Allowed Types:**
- `feat`: A new experiment, equipment, or workspace capability.
- `fix`: A bug fix or simulation accuracy correction.
- `docs`: Documentation updates only.
- `test`: Adding or updating test suites.
- `refactor`: Code improvements without behavior changes.
- `perf`: Computational performance improvements in physics/chemistry solvers.
- `chore`: Tooling, build config, or dependency updates.

---

## 3. Architecture & Coding Principles

1. **Simulation Outside Rendering:**
   Never embed scientific simulation or differential equation solvers directly inside React Konva rendering components or hooks. Keep solvers as pure, deterministic functions in `src/services/<domain>/`.
2. **Deterministic Modeling:**
   Use explicit physical equations (e.g., Modified Nodal Analysis for circuits, Gaussian thin-lens equation, stoichiometric mass conservation). Document all approximations (such as small-angle harmonic approximations).
3. **Cross-Platform Compatibility:**
   All components must support both desktop pointer events (mouse/drag) and mobile touch events (`touchstart`, `touchmove`, `touchend`).
4. **Offline First:**
   All experiments must work seamlessly without active internet connectivity. All assets and state persistence must be handled via Service Worker caching and local IndexedDB.
5. **No Breaking Changes to Reserved Domains:**
   Biology and Mathematics integration slots must remain reserved as "Coming Soon" until their official phase kickoff.

---

## 4. Local Development & Verification

Before submitting a Pull Request, run the local verification suite:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Code formatting & linting
npm run lint

# 4. Strict TypeScript validation
npm run typecheck

# 5. Vitest unit and integration suites
npm test

# 6. Playwright end-to-end tests
npm run test:e2e

# 7. Production build test
npm run build

# 8. Capacitor native asset sync
npm run cap:sync
```
