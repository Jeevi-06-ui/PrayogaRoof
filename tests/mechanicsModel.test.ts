import { describe, it, expect } from 'vitest';
import {
  calculatePendulumPeriod,
  calculateFiniteAmplitudePeriod,
  calculatePendulumState,
  STANDARD_GRAVITY,
} from '../src/services/physics/mechanicsModel';

describe('Physics Model: Simple Pendulum Mechanics & Harmonic Motion', () => {
  it('calculates the standard small-angle period T = 2*pi*sqrt(L/g)', () => {
    // For L = 1.0 m and standard gravity g = 9.80665 m/s^2
    // T = 2 * pi * sqrt(1.0 / 9.80665) = 2.0064 s
    const period = calculatePendulumPeriod(1.0, STANDARD_GRAVITY);

    expect(period).toBeCloseTo(2.006, 2);
  });

  it('CRITICAL SCIENTIFIC TEST: period is STRICTLY INDEPENDENT of bob mass (dT/dm = 0)', () => {
    const stringLength = 0.8; // meters
    const massesInGrams = [20, 50, 100, 200, 500, 1000, 2500];

    // Compute period for each mass
    const periods = massesInGrams.map((massG) => {
      const state = calculatePendulumState({
        lengthMeters: stringLength,
        massKg: massG / 1000,
        initialAngleDeg: 10,
        gravity: STANDARD_GRAVITY,
      });
      return state.period;
    });

    // Every single mass must yield the EXACT same period!
    const baselinePeriod = periods[0];
    for (let i = 1; i < periods.length; i++) {
      expect(periods[i]).toBe(baselinePeriod);
    }

    // Verify frequency is also invariant
    const stateLight = calculatePendulumState({ lengthMeters: 0.8, massKg: 0.05, initialAngleDeg: 8 });
    const stateHeavy = calculatePendulumState({ lengthMeters: 0.8, massKg: 1.5, initialAngleDeg: 8 });

    expect(stateLight.period).toBe(stateHeavy.period);
    expect(stateLight.frequency).toBe(stateHeavy.frequency);
    expect(stateLight.angularFrequency).toBe(stateHeavy.angularFrequency);
  });

  it('verifies square-root length scaling: T is proportional to sqrt(L)', () => {
    const L1 = 0.25; // meters
    const L2 = 1.0; // 4 * L1

    const T1 = calculatePendulumPeriod(L1);
    const T2 = calculatePendulumPeriod(L2);

    // Quadrupling length must exactly double the period
    expect(T2 / T1).toBeCloseTo(2.0, 3);
  });

  it('correctly calculates local acceleration due to gravity from L and T: g = 4*pi^2*L / T^2', () => {
    const length = 0.8; // 80 cm
    const state = calculatePendulumState({
      lengthMeters: length,
      massKg: 0.1,
      initialAngleDeg: 8,
      gravity: STANDARD_GRAVITY,
    });

    // Simulated calculated gravity from formula
    expect(state.calculatedGravity).toBeCloseTo(9.81, 1);
  });

  it('evaluates small-angle approximation accuracy (< 0.5% error at 15 degrees)', () => {
    const length = 1.0;
    const T0 = calculatePendulumPeriod(length);
    const T_15deg = calculateFiniteAmplitudePeriod(length, 15); // Legendre expansion

    const percentError = ((T_15deg - T0) / T0) * 100;

    // Small angle error at 15 deg must be less than 0.5%
    expect(percentError).toBeLessThan(0.5);
    expect(percentError).toBeGreaterThan(0);
  });

  it('generates harmonic oscillation time series theta(t) = theta0 * cos(omega * t)', () => {
    const state = calculatePendulumState(
      {
        lengthMeters: 0.8,
        massKg: 0.1,
        initialAngleDeg: 10,
      },
      0, // t = 0
      4.0, // 4 seconds duration
      50 // 50 samples
    );

    expect(state.timeSeries.length).toBe(51);

    // At t = 0, angle must equal release amplitude theta_0
    expect(state.timeSeries[0].angleDeg).toBeCloseTo(10, 1);

    // At t = T/2, angle must be close to -theta_0
    const halfPeriodTime = state.period / 2;
    const halfCycleState = calculatePendulumState(
      { lengthMeters: 0.8, massKg: 0.1, initialAngleDeg: 10 },
      halfPeriodTime
    );
    expect(halfCycleState.currentAngleDeg).toBeCloseTo(-10, 1);

    // At t = T, angle must return to +theta_0
    const fullCycleState = calculatePendulumState(
      { lengthMeters: 0.8, massKg: 0.1, initialAngleDeg: 10 },
      state.period
    );
    expect(fullCycleState.currentAngleDeg).toBeCloseTo(10, 1);
  });

  it('accurately counts completed full oscillation cycles', () => {
    const length = 0.8; // period ~ 1.795 s
    const period = calculatePendulumPeriod(length);

    // At t = 0 -> 0 cycles
    const s0 = calculatePendulumState({ lengthMeters: length, massKg: 0.1, initialAngleDeg: 8 }, 0);
    expect(s0.completedCycles).toBe(0);

    // At t = 2.5 * T -> 2 completed cycles
    const s2 = calculatePendulumState(
      { lengthMeters: length, massKg: 0.1, initialAngleDeg: 8 },
      period * 2.5
    );
    expect(s2.completedCycles).toBe(2);

    // At t = 5.1 * T -> 5 completed cycles
    const s5 = calculatePendulumState(
      { lengthMeters: length, massKg: 0.1, initialAngleDeg: 8 },
      period * 5.1
    );
    expect(s5.completedCycles).toBe(5);
  });

  it('documents idealized physical assumptions in the output', () => {
    const state = calculatePendulumState({ lengthMeters: 0.8, massKg: 0.1, initialAngleDeg: 10 });

    expect(state.assumptions.length).toBeGreaterThanOrEqual(4);
    expect(state.assumptions.some((a) => a.includes('massless'))).toBe(true);
    expect(state.assumptions.some((a) => a.includes('Mass independence'))).toBe(true);
    expect(state.formulaSummary).toContain('T = 2*pi*sqrt(L/g)');
  });
});
