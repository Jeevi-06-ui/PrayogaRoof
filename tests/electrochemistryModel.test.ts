import { describe, it, expect } from 'vitest';
import {
  calculateDaniellCellState,
  HALF_CELLS,
  ELECTROCHEMISTRY_ASSUMPTIONS,
} from '../src/services/chemistry/electrochemistryModel';

describe('Electrochemistry & Daniell Cell Model', () => {
  it('correctly sets up standard Daniell cell potentials', () => {
    expect(HALF_CELLS['zinc'].standardReductionPotential).toBe(-0.763);
    expect(HALF_CELLS['copper'].standardReductionPotential).toBe(+0.340);
  });

  it('measures 0.000 V when salt bridge is absent (open circuit)', () => {
    const openCell = calculateDaniellCellState({
      zincConcentrationM: 1.0,
      copperConcentrationM: 1.0,
      saltBridgeInserted: false,
    });

    expect(openCell.circuitClosed).toBe(false);
    expect(openCell.measuredEmfVolts).toBe(0.0);
    expect(openCell.voltmeterReadingText).toContain('Open Circuit');
    expect(openCell.observationStatus).toContain('Salt bridge is absent');
  });

  it('calculates standard EMF of 1.100 V for 1.0M Zn2+ and 1.0M Cu2+', () => {
    const stdCell = calculateDaniellCellState({
      zincConcentrationM: 1.0,
      copperConcentrationM: 1.0,
      saltBridgeInserted: true,
      temperatureC: 25.0,
    });

    expect(stdCell.circuitClosed).toBe(true);
    expect(stdCell.standardEmfVolts).toBeCloseTo(1.103, 2);
    expect(stdCell.measuredEmfVolts).toBeCloseTo(1.103, 2);
    expect(stdCell.logQ).toBe(0);
  });

  it('verifies Nernst equation concentration dependence', () => {
    // 0.1M Zn2+ and 1.0M Cu2+ -> logQ = -1 -> EMF increases by ~0.0296 V -> ~1.133 V
    const cell01Zn = calculateDaniellCellState({
      zincConcentrationM: 0.1,
      copperConcentrationM: 1.0,
      saltBridgeInserted: true,
      temperatureC: 25.0,
    });
    expect(cell01Zn.logQ).toBe(-1);
    expect(cell01Zn.measuredEmfVolts).toBeGreaterThan(1.103);
    expect(cell01Zn.measuredEmfVolts).toBeCloseTo(1.133, 2);

    // 1.0M Zn2+ and 0.1M Cu2+ -> logQ = +1 -> EMF decreases by ~0.0296 V -> ~1.073 V
    const cell01Cu = calculateDaniellCellState({
      zincConcentrationM: 1.0,
      copperConcentrationM: 0.1,
      saltBridgeInserted: true,
      temperatureC: 25.0,
    });
    expect(cell01Cu.logQ).toBe(1);
    expect(cell01Cu.measuredEmfVolts).toBeLessThan(1.103);
    expect(cell01Cu.measuredEmfVolts).toBeCloseTo(1.073, 2);
  });

  it('handles reverse polarity connection', () => {
    const revCell = calculateDaniellCellState({
      zincConcentrationM: 1.0,
      copperConcentrationM: 1.0,
      saltBridgeInserted: true,
      voltmeterPolarityReversed: true,
    });

    expect(revCell.measuredEmfVolts).toBeCloseTo(-1.103, 2);
    expect(revCell.observationStatus).toContain('Reverse Polarity');
  });

  it('exposes standard 5-point calibration points and assumptions', () => {
    const cell = calculateDaniellCellState({
      zincConcentrationM: 1.0,
      copperConcentrationM: 1.0,
      saltBridgeInserted: true,
    });

    expect(cell.standardNernstPoints.length).toBe(5);
    expect(ELECTROCHEMISTRY_ASSUMPTIONS.length).toBeGreaterThanOrEqual(4);
  });
});
