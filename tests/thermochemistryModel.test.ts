import { describe, it, expect } from 'vitest';
import {
  calculateCalorimetryState,
  THERMO_REACTIONS,
  THERMOCHEMISTRY_ASSUMPTIONS,
} from '../src/services/chemistry/thermochemistryModel';

describe('Thermochemistry & Calorimetry Model', () => {
  it('correctly models strong acid - strong base neutralization (HCl + NaOH)', () => {
    // 50 mL 1.0M HCl + 50 mL 1.0M NaOH (0.050 mol water formed)
    const state = calculateCalorimetryState({
      reactionType: 'neutralization-hcl-naoh',
      volumeAcidMl: 50,
      molarityAcid: 1.0,
      volumeBaseMl: 50,
      molarityBase: 1.0,
      initialTempC: 22.0,
      waterEquivalentW: 25.0,
      isMixed: true,
      elapsedSeconds: 25.0, // peak temperature reached
    });

    expect(state.molesReacted).toBeCloseTo(0.050, 3);
    expect(state.isExothermic).toBe(true);
    expect(THERMO_REACTIONS['neutralization-hcl-naoh'].theoreticalDeltaH).toBe(-57.32);
    expect(state.theoreticalDeltaH).toBe(-57.32);
    // Theoretical deltaT is ~6.46°C
    expect(state.theoreticalDeltaT).toBeGreaterThan(6.0);
    expect(state.theoreticalDeltaT).toBeLessThan(7.0);
    expect(state.peakTempC).toBeCloseTo(22.0 + state.theoreticalDeltaT, 1);
    expect(state.experimentalDeltaH).toBeCloseTo(-57.32, 0);
    expect(state.errorPercent).toBeLessThan(1.0);
    expect(state.observationStatus).toContain('Exothermic reaction');
  });

  it('reflects lower heat of neutralization for weak acid CH3COOH', () => {
    const weakState = calculateCalorimetryState({
      reactionType: 'neutralization-ch3cooh-naoh',
      volumeAcidMl: 50,
      molarityAcid: 1.0,
      volumeBaseMl: 50,
      molarityBase: 1.0,
      initialTempC: 22.0,
      waterEquivalentW: 25.0,
      isMixed: true,
      elapsedSeconds: 25.0,
    });

    expect(weakState.theoreticalDeltaH).toBe(-55.90);
    // Enthalpy is less negative (less heat evolved) than strong acid
    expect(Math.abs(weakState.theoreticalDeltaH)).toBeLessThan(57.32);
  });

  it('models endothermic enthalpy of solution for KNO3', () => {
    const kno3State = calculateCalorimetryState({
      reactionType: 'solution-kno3',
      volumeAcidMl: 100, // water
      molarityAcid: 0,
      volumeBaseMl: 5,
      molarityBase: 0.05,
      initialTempC: 22.0,
      waterEquivalentW: 25.0,
      isMixed: true,
      elapsedSeconds: 25.0,
    });

    expect(kno3State.isExothermic).toBe(false);
    expect(kno3State.theoreticalDeltaH).toBe(+35.60);
    expect(kno3State.theoreticalDeltaT).toBeLessThan(0); // temperature drops!
    expect(kno3State.observationStatus).toContain('Endothermic dissolution');
  });

  it('generates a full calorimetric cooling curve and exposes assumptions', () => {
    const state = calculateCalorimetryState({
      reactionType: 'neutralization-hcl-naoh',
      volumeAcidMl: 50,
      molarityAcid: 1.0,
      volumeBaseMl: 50,
      molarityBase: 1.0,
      initialTempC: 22.0,
      waterEquivalentW: 25.0,
      isMixed: true,
      elapsedSeconds: 25.0,
    });

    expect(state.coolingCurve.length).toBeGreaterThan(15);
    expect(state.coolingCurve[0].tempC).toBe(22.0); // initial
    expect(THERMOCHEMISTRY_ASSUMPTIONS.length).toBeGreaterThanOrEqual(4);
  });
});
