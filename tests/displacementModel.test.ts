import { describe, it, expect } from 'vitest';
import {
  calculateDisplacementState,
  DISPLACEMENT_SAFETY_NOTES,
} from '../src/services/chemistry/displacementModel';

describe('Displacement Reaction Scientific Model (Fe in CuSO4)', () => {
  it('models unimmersed iron nail in non-reactive baseline state', () => {
    const state = calculateDisplacementState(15, false);
    expect(state.progressPercent).toBe(0);
    expect(state.solutionColor).toBe('#2563eb'); // Unchanged royal blue
    expect(state.nailColor).toBe('#64748b'); // Silvery gray iron
    expect(state.depositedCopperGrams).toBe(0);
    expect(state.dissolvedIronGrams).toBe(0);
    expect(state.netMassChangeGrams).toBe(0);
    expect(state.appearanceDescription).toContain('withdrawn from solution');
  });

  it('models time-dependent single displacement kinetics and color shift', () => {
    // Immediate immersion (t = 0)
    const state0 = calculateDisplacementState(0, true);
    expect(state0.progressPercent).toBe(0);
    expect(state0.solutionColor).toBe('#2563eb'); // Royal blue

    // 5 minutes immersion
    const state5 = calculateDisplacementState(5, true);
    expect(state5.progressPercent).toBeGreaterThan(0);
    expect(state5.progressPercent).toBeLessThan(50);
    expect(state5.depositedCopperGrams).toBeGreaterThan(0);

    // 20 minutes immersion (extensive reaction)
    const state20 = calculateDisplacementState(20, true);
    expect(state20.progressPercent).toBeGreaterThanOrEqual(80);
    expect(state20.solutionColor).toBe('#86efac'); // Pale green FeSO4
    expect(state20.nailColor).toBe('#9a3412'); // Reddish-brown copper crust
    expect(state20.appearanceDescription).toContain('copper');

    // 30 minutes immersion (reaction plateau)
    const state30 = calculateDisplacementState(30, true);
    expect(state30.progressPercent).toBe(100);
  });

  it('verifies stoichiometric mass changes (net mass gain due to M_Cu > M_Fe)', () => {
    const state = calculateDisplacementState(20, true);

    // Copper molar mass (63.55) > Iron molar mass (55.85)
    expect(state.depositedCopperGrams).toBeGreaterThan(state.dissolvedIronGrams);
    expect(state.netMassChangeGrams).toBeGreaterThan(0);
    expect(state.netMassChangeGrams).toBeCloseTo(
      state.depositedCopperGrams - state.dissolvedIronGrams,
      2
    );

    // Balanced equation check
    expect(state.redoxEquation).toBe('Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)');
  });

  it('exposes educational safety and GHS hazard notes', () => {
    expect(DISPLACEMENT_SAFETY_NOTES.hazardStatements).toBeDefined();
    expect(DISPLACEMENT_SAFETY_NOTES.ghsCodes).toContain('GHS07');
    expect(DISPLACEMENT_SAFETY_NOTES.ghsCodes).toContain('GHS09');
    expect(DISPLACEMENT_SAFETY_NOTES.educationalDisclaimer).toContain('Virtual simulation');
  });
});
