# PrayogaProof | Interactive STEM Virtual Laboratory

[![CI Pipeline](https://github.com/prayogaproof/prayogaproof/actions/workflows/ci.yml/badge.svg)](https://github.com/prayogaproof/prayogaproof/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%205.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Capacitor Mobile](https://img.shields.io/badge/Capacitor-Android%20%7C%20iOS-orange.svg)](https://capacitorjs.com/)

**PrayogaProof** is a cross-platform, free-form interactive STEM virtual laboratory designed to bring hands-on scientific experimentation to school students worldwide, especially in underserved, rural, and resource-constrained communities.

Styled after professional networking and systems simulators like Cisco Packet Tracer, students can drag, arrange, connect, and manipulate real scientific apparatus on an interactive 2D canvas, observe scientifically authentic responses, and document their observations in a digital lab notebook.

---

## 🌟 Supported Subjects & Experiments (Phase 1–7)

### ⚡ Physics Laboratory (Active — 5 Experiments)
1. **Ohm's Law Verification:** Build closed DC circuits with batteries, resistors, ammeters, and voltmeters to verify $V = I \cdot R$.
2. **Series & Parallel Circuits:** Construct multi-resistor topologies; observe equivalent resistance $R_{eq}$, branch currents, and Kirchhoff voltage drops.
3. **Convex Lens Optics & Ray Tracing:** Position illuminated objects along an optical bench, adjust focal length, and observe real/virtual conjugate image formation based on the Gaussian lens equation $\frac{1}{f} = \frac{1}{v} - \frac{1}{u}$.
4. **Magnetic Field Lines & Compass Plotting:** Place Alnico bar magnets, position plotting compasses, change dipole polarity, and trace magnetic vector field lines.
5. **Simple Pendulum Mechanics:** Adjust suspension length and bob mass, measure harmonic oscillation period ($T = 2\pi\sqrt{\frac{L}{g}}$), and verify Galilean mass-independence ($\frac{dT}{dm} = 0$).

### 🧪 Chemistry Virtual Workbench (Active — 5 Experiments)
1. **pH Determination:** Test mineral acids, organic acids, neutral solvents, and caustic alkalis with universal indicator solutions and chromatic pH scale strips.
2. **Natural Acid-Base Indicators:** Investigate color changes using natural botanical extracts (curcumin in turmeric and anthocyanins in red cabbage).
3. **Paper Chromatography:** Observe ascending capillary migration of inks and dyes on cellulose strips; calculate standard Retention Factor ($R_f$) values.
4. **Single Displacement Reaction:** Immerse iron nails into copper sulphate solution; observe time-dependent redox kinetics ($\text{Fe} + \text{CuSO}_4 \rightarrow \text{FeSO}_4 + \text{Cu}$) and mass transfer.
5. **Crystallisation & Separation:** Heat copper sulphate solutions to evaporate solvent, track temperature-dependent solubility $S(T)$, induce supersaturation, and harvest blue triclinic crystals.

### 🧬 Biology & 📐 Mathematics
- **Status:** Reserved integration slots marked **"Coming Soon"**. Modular extension points are preserved without altering core architecture.

---

## 🛠️ Technology Stack

- **Core Framework:** [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Build Tooling:** [Vite 5](https://vitejs.dev/)
- **Interactive 2D Canvas:** [React Konva](https://konvajs.org/docs/react/) + HTML5 Canvas
- **Styling & UI:** [Tailwind CSS 3](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
- **Routing:** [React Router 6](https://reactrouter.com/) (Single-Page App routing)
- **Local Persistence:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [`idb`](https://github.com/jakearchibald/idb)
- **Offline Capabilities:** Progressive Web App (PWA) manifest and custom Service Worker
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + [Playwright](https://playwright.dev/)
- **Mobile Container:** [Capacitor 6](https://capacitorjs.com/) for native Android & iOS packaging

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `v10.x` or later

### Installation
```bash
# Clone the repository
git clone https://github.com/prayogaproof/prayogaproof.git
cd prayogaproof

# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## 🧪 Comprehensive Quality Assurance

PrayogaProof enforces a rigorous automated testing pipeline covering static analysis, scientific benchmark models, component rendering, and full end-to-end browser workflows:

```bash
# 1. Run ESLint static analysis
npm run lint

# 2. Strict TypeScript compiler check
npm run typecheck

# 3. Vitest unit & integration test suites (155 tests)
npm test

# 4. Playwright End-to-End browser tests (Desktop & Mobile Chrome)
npm run test:e2e

# 5. Production bundle build
npm run build
```

For more details on test cases and scientific benchmark equations, see [TESTING.md](TESTING.md).

---

## 📱 Cross-Platform Packaging

### Progressive Web App (Offline Web)
PrayogaProof includes a production Service Worker (`public/sw.js`) and manifest (`public/manifest.json`).
- Core application shell and static assets are cached locally.
- Dynamic offline SPA navigation fallback routes any direct URL (e.g. `/workspace/ohms-law`) to the cached shell.
- Full IndexedDB storage ensures student experiments, notebook notes, and profiles persist entirely offline.

### Android Application (Capacitor)
The Android native wrapper is pre-configured in `android/`:
```bash
# 1. Build production web bundle and sync native assets
npm run cap:build:android

# 2. Open project in Android Studio
npm run cap:open:android
```
- In Android Studio, build the Debug or Signed Release APK/AAB via **Build > Build Bundle(s) / APK(s)**.

### iOS Application (Capacitor)
The iOS native wrapper is pre-configured in `ios/`:
```bash
# 1. Build production web bundle and sync native assets
npm run cap:build:ios

# 2. Open project in Xcode (macOS only)
npm run cap:open:ios
```
- In Xcode, select your development team and run on a connected iPhone or simulator.

---

## 🌐 Web Deployment (Vercel)

PrayogaProof is ready for one-click deployment on [Vercel](https://vercel.com/) or any modern static web host. The repository includes a production `vercel.json` with SPA routing rewrites and hardened HTTP security headers:

```bash
# Build production output
npm run build

# Output directory: dist/
```

---

## 📂 Project Architecture

```
prayogaproof/
├── .github/
│   ├── workflows/ci.yml           # Automated CI workflow (Node 20/22, Lint, Test, E2E)
│   └── PULL_REQUEST_TEMPLATE.md   # Pull request review checklist
├── android/                       # Capacitor Android native project
├── ios/                           # Capacitor iOS native project
├── docs/
│   ├── ARCHITECTURE.md            # Deep technical architectural design
│   └── EXPERIMENT_MODULE_GUIDE.md # Guide to implementing new experiments
├── e2e/
│   └── experiments.spec.ts        # Playwright E2E browser test suite
├── public/
│   ├── favicon.svg                # Brand vector icon
│   ├── manifest.json              # PWA web manifest
│   └── sw.js                      # Production offline Service Worker
├── src/
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, MobileNav, Breadcrumbs
│   │   ├── shared/                # ErrorBoundary, Modal, Button, Tabs
│   │   └── workspace/             # UniversalLabWorkspace, Toolbar, Canvas, Inspector
│   ├── context/                   # StudentContext, ThemeContext
│   ├── pages/                     # LandingPage, Dashboard, SubjectDetail, Workspace
│   ├── services/
│   │   ├── circuit/               # Modified Nodal Analysis (MNA) circuit solver
│   │   ├── physics/               # Optics, magnetism, and pendulum physics models
│   │   ├── chemistry/             # Reaction kinetics, stoichiometry, chromatography
│   │   ├── lab/                   # Lab registry, physics & chemistry extensions
│   │   └── studentProgressService.ts # IndexedDB persistence engine
│   ├── types/                     # TypeScript domain models and interfaces
│   ├── App.tsx                    # Route definitions and ErrorBoundary wrapper
│   └── main.tsx                   # App entrypoint and SW registration
├── tests/                         # 19 comprehensive Vitest test suites (155 tests)
├── capacitor.config.ts            # Capacitor native packaging configuration
├── playwright.config.ts           # Playwright E2E configuration
├── vercel.json                    # Vercel SPA rewrites and security headers
├── CONTRIBUTING.md                # Contribution guidelines and coding conventions
├── TESTING.md                     # QA testing guide and benchmark matrix
└── README.md                      # Product overview and instructions
```

---

## 🤝 Contributing

Contributions to PrayogaProof are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming conventions, commit formats, and the PR review process.

---

## 📄 License

PrayogaProof is open-source software licensed under the [MIT License](LICENSE).
