import { describe, it, expect } from 'vitest';
import {
  calculateSolubility,
  calculateCrystallisation,
  CRYSTALLISATION_ASSUMPTIONS,
} from '../src/services/chemistry/crystallisationModel';

describe('Crystallisation Scientific Model (CuSO4 Solubility & Nucleation)', () => {
  it('calculates temperature-dependent solubility S(T) accurately', () => {
    // S(T) = 14.3 + 0.25*T + 0.003*T^2
    const sol20 = calculateSolubility(20);
    expect(sol20).toBeCloseTo(14.3 + 0.25 * 20 + 0.003 * 400, 1); // ~20.5 g/100mL

    const sol50 = calculateSolubility(50);
    expect(sol50).toBeGreaterThan(sol20);

    const sol85 = calculateSolubility(85);
    expect(sol85).toBeCloseTo(14.3 + 0.25 * 85 + 0.003 * 7225, 1); // ~57.2 g/100mL

    const sol100 = calculateSolubility(100);
    expect(sol100).toBeCloseTo(69.3, 1);
  });

  it('detects unsaturated solution prior to evaporation', () => {
    // 5g solute in 50 mL water at 50°C
    const state = calculateCrystallisation({
      initialSoluteMassG: 5,
      initialWaterVolumeMl: 50,
      temperatureC: 50,
      evaporationTimeMins: 0,
      isHeating: false,
    });

    expect(state.saturationStatus).toBe('unsaturated');
    expect(state.saturationRatio).toBeLessThan(1.0);
    expect(state.crystalYieldGrams).toBe(0);
    expect(state.crystalGrowthPercent).toBe(0);
  });

  it('models thermal solvent evaporation and supersaturation crystal nucleation', () => {
    // 20g solute in 50 mL water heated at 85°C for 15 mins (vigorous evaporation)
    const state = calculateCrystallisation({
      initialSoluteMassG: 20,
      initialWaterVolumeMl: 50,
      temperatureC: 85,
      evaporationTimeMins: 15,
      isHeating: true,
    });

    // Solvent evaporated from 50 mL down to ~20 mL
    expect(state.remainingWaterMl).toBeLessThan(50);
    expect(state.saturationStatus).toBe('supersaturated');
    expect(state.saturationRatio).toBeGreaterThanOrEqual(1.0);

    // Yields copper sulphate pentahydrate crystals
    expect(state.crystalYieldGrams).toBeGreaterThan(0);
    expect(state.crystalGrowthPercent).toBeGreaterThan(0);
    expect(state.crystalDescription).toContain('triclinic');
  });

  it('exposes documented crystallisation assumptions and hydrate stoichiometry', () => {
    expect(CRYSTALLISATION_ASSUMPTIONS.crystalHabit).toContain('Triclinic pinacoidal');
    expect(CRYSTALLISATION_ASSUMPTIONS.hydrateFormula).toBe('CuSO₄·5H₂O');
    expect(CRYSTALLISATION_ASSUMPTIONS.hydrateMolarMass).toBe(249.68);
    expect(CRYSTALLISATION_ASSUMPTIONS.anhydrousMolarMass).toBe(159.61);
    expect(CRYSTALLISATION_ASSUMPTIONS.assumptions.length).toBeGreaterThanOrEqual(4);
  });
});
