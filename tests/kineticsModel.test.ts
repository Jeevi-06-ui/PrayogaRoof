import { describe, it, expect } from 'vitest';
import {
  calculateKineticsState,
  calculateTemperatureFactor,
  KINETICS_ASSUMPTIONS,
} from '../src/services/chemistry/kineticsModel';

describe('Chemical Kinetics Model (Na2S2O3 + HCl)', () => {
  it('calculates initial unreacted state before reaction start', () => {
    const state = calculateKineticsState({
      stockThiosulphateM: 0.10,
      volumeThiosulphateMl: 50,
      volumeWaterMl: 0,
      volumeHclMl: 10,
      temperatureC: 25,
      elapsedSeconds: 0,
      isReactionStarted: false,
    });

    expect(state.crossObscured).toBe(false);
    expect(state.crossVisibilityPercent).toBe(100);
    expect(state.turbidityPercent).toBe(0);
    expect(state.effectiveThioM).toBeCloseTo(0.0833, 3);
    expect(state.timeToObscureSec).toBeCloseTo(16.0, 0);
  });

  it('demonstrates concentration dependence of reaction rate (1/t)', () => {
    // High concentration (50 mL Thio): shorter time to obscure
    const highConc = calculateKineticsState({
      volumeThiosulphateMl: 50,
      volumeWaterMl: 0,
      volumeHclMl: 10,
      temperatureC: 25,
      elapsedSeconds: 0,
      isReactionStarted: true,
    });

    // Low concentration (10 mL Thio): much longer time to obscure
    const lowConc = calculateKineticsState({
      volumeThiosulphateMl: 10,
      volumeWaterMl: 40,
      volumeHclMl: 10,
      temperatureC: 25,
      elapsedSeconds: 0,
      isReactionStarted: true,
    });

    expect(highConc.timeToObscureSec).toBeLessThan(lowConc.timeToObscureSec);
    expect(highConc.ratePerSec).toBeGreaterThan(lowConc.ratePerSec);
    // 5x higher concentration produces ~5x higher rate
    expect(highConc.ratePerSec / lowConc.ratePerSec).toBeCloseTo(5.0, 1);
  });

  it('verifies cross obscuration and turbidity progress over time', () => {
    // At t = 8s out of 16s (50% progress)
    const midReaction = calculateKineticsState({
      volumeThiosulphateMl: 50,
      volumeWaterMl: 0,
      volumeHclMl: 10,
      temperatureC: 25,
      elapsedSeconds: 8.0,
      isReactionStarted: true,
    });

    expect(midReaction.crossObscured).toBe(false);
    expect(midReaction.turbidityPercent).toBeCloseTo(50, 0);
    expect(midReaction.crossVisibilityPercent).toBeCloseTo(50, 0);

    // At t = 16s (complete obscuration)
    const endReaction = calculateKineticsState({
      volumeThiosulphateMl: 50,
      volumeWaterMl: 0,
      volumeHclMl: 10,
      temperatureC: 25,
      elapsedSeconds: 16.0,
      isReactionStarted: true,
    });

    expect(endReaction.crossObscured).toBe(true);
    expect(endReaction.crossVisibilityPercent).toBe(0);
    expect(endReaction.observationStatus).toContain('CRITICAL ENDPOINT REACHED');
    expect(endReaction.sulphurPrecipitateGrams).toBeGreaterThan(0.01);
  });

  it('demonstrates Arrhenius temperature acceleration', () => {
    const factor25 = calculateTemperatureFactor(25);
    const factor35 = calculateTemperatureFactor(35);
    const factor45 = calculateTemperatureFactor(45);

    expect(factor25).toBeCloseTo(1.0, 1);
    // Rate approximately doubles every 10°C
    expect(factor35).toBeGreaterThan(1.7);
    expect(factor35).toBeLessThan(2.3);
    expect(factor45).toBeGreaterThan(3.2);

    const warmState = calculateKineticsState({
      volumeThiosulphateMl: 50,
      volumeWaterMl: 0,
      volumeHclMl: 10,
      temperatureC: 45,
      elapsedSeconds: 0,
      isReactionStarted: true,
    });
    expect(warmState.timeToObscureSec).toBeLessThan(6.0); // much faster than 16.0s
  });

  it('provides standard 5-point calibration dataset', () => {
    const state = calculateKineticsState({
      volumeThiosulphateMl: 50,
      volumeWaterMl: 0,
      volumeHclMl: 10,
      elapsedSeconds: 0,
      isReactionStarted: false,
    });

    expect(state.standardSeries.length).toBe(5);
    expect(state.standardSeries[0].flaskId).toBe('A');
    expect(state.standardSeries[4].flaskId).toBe('E');
    expect(KINETICS_ASSUMPTIONS.length).toBeGreaterThanOrEqual(4);
  });
});
