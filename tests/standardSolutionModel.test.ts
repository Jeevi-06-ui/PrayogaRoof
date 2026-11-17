import { describe, it, expect } from 'vitest';
import {
  calculateRequiredMass,
  calculateStandardSolutionState,
} from '../src/services/chemistry/standardSolutionModel';

describe('Standard Solution Preparation Model (Class 11)', () => {
  it('calculates theoretical mass for 250 mL of 0.1M oxalic acid dihydrate', () => {
    // w = 0.1 * 126.07 * 250 / 1000 = 3.15175 g
    const mass = calculateRequiredMass('oxalic-acid', 0.1, 250.0);
    expect(mass).toBeCloseTo(3.1518, 3);
  });

  it('calculates theoretical mass for 250 mL of 0.1M sodium carbonate', () => {
    // w = 0.1 * 105.99 * 250 / 1000 = 2.64975 g
    const mass = calculateRequiredMass('sodium-carbonate', 0.1, 250.0);
    expect(mass).toBeCloseTo(2.6498, 3);
  });

  it('evaluates ready standard solution with accurate molarity and small error', () => {
    const state = calculateStandardSolutionState({
      soluteType: 'oxalic-acid',
      targetMolarityM: 0.1,
      weighedMassGrams: 3.152,
      actualLiquidVolumeMl: 250.0,
      isDissolved: true,
      isStoppered: true,
      isInvertedHomogeneous: true,
    });

    expect(state.isMeniscusAligned).toBe(true);
    expect(state.actualMolarityM).toBeCloseTo(0.1, 2);
    expect(state.actualNormalityN).toBeCloseTo(0.2, 2);
    expect(state.stageStatus).toBe('ready');
    expect(state.feedbackText).toContain('successfully prepared');
  });

  it('detects unaligned meniscus or incomplete filling', () => {
    const state = calculateStandardSolutionState({
      soluteType: 'oxalic-acid',
      targetMolarityM: 0.1,
      weighedMassGrams: 3.152,
      actualLiquidVolumeMl: 210.0, // underfilled
    });

    expect(state.isMeniscusAligned).toBe(false);
    expect(state.stageStatus).toBe('filling');
    expect(state.feedbackText).toContain('Dilute carefully');
  });
});
