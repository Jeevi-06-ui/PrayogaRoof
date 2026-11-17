import { describe, it, expect } from 'vitest';
import {
  calculateRedoxTitrationState,
  REDOX_SYSTEM_SPECS,
} from '../src/services/chemistry/redoxTitrationModel';

describe('Redox Titration Scientific Model: Potassium Permanganate (Class 12)', () => {
  it('covers both standard Mohr’s salt and Oxalic acid titration systems', () => {
    expect(REDOX_SYSTEM_SPECS['kmno4-mohrs-salt']).toBeDefined();
    expect(REDOX_SYSTEM_SPECS['kmno4-oxalic-acid']).toBeDefined();
    expect(REDOX_SYSTEM_SPECS['kmno4-mohrs-salt'].moleRatioKMnO4ToAnalyte).toBe(1 / 5);
    expect(REDOX_SYSTEM_SPECS['kmno4-oxalic-acid'].moleRatioKMnO4ToAnalyte).toBe(2 / 5);
    expect(REDOX_SYSTEM_SPECS['kmno4-oxalic-acid'].requiresHeating).toBe(true);
  });

  it('correctly calculates Mohr’s salt equivalence volume and self-indicator pale pink endpoint', () => {
    // 20 mL of 0.05 M Mohr's salt vs 0.02 M KMnO4
    // V_eq = (0.05 * 20) / (5 * 0.02) = 1.0 / 0.10 = 10.0 mL
    const stateBefore = calculateRedoxTitrationState({
      system: 'kmno4-mohrs-salt',
      analyteVolumeMl: 20,
      analyteMolarityM: 0.05,
      titrantMolarityM: 0.02,
      titrantDeliveredMl: 5.0,
      acidAdded: true,
    });
    expect(stateBefore.equivalenceVolumeMl).toBe(10.0);
    expect(stateBefore.status).toBe('before-equivalence');
    expect(stateBefore.solutionAppearance).toContain('Faint Yellowish Tint');

    const stateEndpoint = calculateRedoxTitrationState({
      system: 'kmno4-mohrs-salt',
      analyteVolumeMl: 20,
      analyteMolarityM: 0.05,
      titrantMolarityM: 0.02,
      titrantDeliveredMl: 10.0,
      acidAdded: true,
    });
    expect(stateEndpoint.status).toBe('at-equivalence');
    expect(stateEndpoint.solutionColorHex).toBe('#fbcfe8'); // Pale pink
    expect(stateEndpoint.observation).toContain('ENDPOINT REACHED');
    expect(stateEndpoint.calculatedMolarityM).toBeCloseTo(0.02, 3);
    expect(stateEndpoint.calculatedStrengthGperL).toBeCloseTo(3.16, 1);

    const statePast = calculateRedoxTitrationState({
      system: 'kmno4-mohrs-salt',
      analyteVolumeMl: 20,
      analyteMolarityM: 0.05,
      titrantMolarityM: 0.02,
      titrantDeliveredMl: 12.0,
      acidAdded: true,
    });
    expect(statePast.status).toBe('past-equivalence');
    expect(statePast.solutionAppearance).toContain('Deep Magenta-Purple');
  });

  it('correctly calculates Oxalic acid equivalence volume and enforces 60-70°C heating requirement', () => {
    // 20 mL of 0.05 M Oxalic acid vs 0.02 M KMnO4
    // V_eq = (2 * 0.05 * 20) / (5 * 0.02) = 2.0 / 0.10 = 20.0 mL
    const coldState = calculateRedoxTitrationState({
      system: 'kmno4-oxalic-acid',
      analyteVolumeMl: 20,
      analyteMolarityM: 0.05,
      titrantMolarityM: 0.02,
      titrantDeliveredMl: 5.0,
      acidAdded: true,
      temperatureC: 25, // Cold, insufficient!
    });
    expect(coldState.isTempAdequate).toBe(false);
    expect(coldState.status).toBe('impaired');
    expect(coldState.observation).toContain('warming to 60-70°C');

    const warmState = calculateRedoxTitrationState({
      system: 'kmno4-oxalic-acid',
      analyteVolumeMl: 20,
      analyteMolarityM: 0.05,
      titrantMolarityM: 0.02,
      titrantDeliveredMl: 20.0,
      acidAdded: true,
      temperatureC: 65,
    });
    expect(warmState.isTempAdequate).toBe(true);
    expect(warmState.equivalenceVolumeMl).toBe(20.0);
    expect(warmState.status).toBe('at-equivalence');
    expect(warmState.solutionColorHex).toBe('#fbcfe8');
  });

  it('detects missing dilute H2SO4 acid and alerts student to brown MnO2 precipitation', () => {
    const unacidified = calculateRedoxTitrationState({
      system: 'kmno4-mohrs-salt',
      acidAdded: false,
      titrantDeliveredMl: 5.0,
    });
    expect(unacidified.status).toBe('impaired');
    expect(unacidified.solutionAppearance).toContain('Muddy Brown');
    expect(unacidified.observation).toContain('without dilute H₂SO₄');
  });

  it('records upper meniscus for intense dark KMnO4 burette readings', () => {
    const state = calculateRedoxTitrationState({
      titrantDeliveredMl: 10.45,
    });
    expect(state.upperMeniscusBuretteReadingMl).toBe(10.45);
  });
});
