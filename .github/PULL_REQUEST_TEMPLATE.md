## Summary of Changes

Describe the purpose, scientific scope, and user-facing impact of this Pull Request.

### Target Module / Domain
- [ ] Core Workspace & Interactive Canvas
- [ ] Physics Laboratory Engine
- [ ] Chemistry Laboratory Engine
- [ ] Offline PWA & Storage (IndexedDB)
- [ ] Mobile Capacitor (Android / iOS)
- [ ] Documentation / CI

---

## Verification & Testing Matrix

Please confirm the following quality assurance checks have run locally and passed:

- [ ] `npm run lint` — ESLint passes with 0 errors
- [ ] `npm run typecheck` — TypeScript strict type checks pass (`tsc -b`)
- [ ] `npm test` — Vitest unit and integration suites pass (100% test coverage for scientific models)
- [ ] `npm run test:e2e` — Playwright headless browser tests pass on desktop and mobile viewports
- [ ] `npm run build` — Vite production build completes cleanly
- [ ] `npx cap sync` — Capacitor native assets sync without error

---

## Scientific & Pedagogical Validation
- Have physical and chemical equations been documented with references and assumptions?
- Does this PR maintain domain solver isolation outside React rendering loops?
- Are edge cases (e.g., divide-by-zero, negative volumes, disconnected nodes) handled gracefully?

---

## Screenshots / Evidence (if applicable)
Add screenshots, recordings, or console logs demonstrating correct interaction.
