import { describe, it, expect } from 'vitest';
import {
  createEmptyContainer,
  createContainerWithSubstance,
  transferLiquid,
} from '../src/services/chemistry/chemistryEngine';

describe('Phase 5: Chemical Liquid Transfer & Substance Conservation', () => {
  it('creates empty containers with zero volume and dry neutral state', () => {
    const emptyBeaker = createEmptyContainer(250);
    expect(emptyBeaker.capacityMl).toBe(250);
    expect(emptyBeaker.totalVolumeMl).toBe(0);
    expect(emptyBeaker.components).toHaveLength(0);
    expect(emptyBeaker.ph).toBe(7.0);
    expect(emptyBeaker.observationText).toContain('empty');
  });

  it('creates container with specified initial substance and calculates moles accurately', () => {
    // 100 mL of 0.1M HCl in a 250 mL beaker
    const hclContainer = createContainerWithSubstance('hcl', 100, 250);
    expect(hclContainer.capacityMl).toBe(250);
    expect(hclContainer.totalVolumeMl).toBe(100);
    expect(hclContainer.components).toHaveLength(1);
    expect(hclContainer.components[0].substanceId).toBe('hcl');
    // Moles = M * (V / 1000) = 0.1 * (100 / 1000) = 0.01 moles
    expect(hclContainer.components[0].moles).toBeCloseTo(0.01, 5);
    expect(hclContainer.ph).toBeCloseTo(1.0, 1);
  });

  it('transfers an exact volume from source to destination container', () => {
    const source = createContainerWithSubstance('pure-water', 80, 100);
    const dest = createEmptyContainer(100);

    const result = transferLiquid(source, dest, 30);
    expect(result.success).toBe(true);
    expect(result.transferredVolumeMl).toBe(30);
    expect(result.sourceRemainingMl).toBe(50);
    expect(result.destinationTotalMl).toBe(30);
    expect(result.overflowOccurred).toBe(false);
  });

  it('strictly conserves total substance moles during liquid transfer', () => {
    // Source: 60 mL of 0.1M NaOH (0.006 moles)
    const source = createContainerWithSubstance('naoh', 60, 100);
    const dest = createEmptyContainer(250);

    const initialSourceMoles = source.components.reduce((sum, c) => sum + c.moles, 0);
    expect(initialSourceMoles).toBeCloseTo(0.006, 5);

    // Pour 25 mL
    const result = transferLiquid(source, dest, 25);
    expect(result.success).toBe(true);

    const sourceMolesAfter = result.sourceNewState.components.reduce((s, c) => s + c.moles, 0);
    const destMolesAfter = result.destinationNewState.components.reduce((s, c) => s + c.moles, 0);

    // Substance conservation law: moles(source) + moles(dest) === initial moles
    expect(sourceMolesAfter + destMolesAfter).toBeCloseTo(initialSourceMoles, 6);
    expect(sourceMolesAfter).toBeCloseTo(0.1 * (35 / 1000), 5);
    expect(destMolesAfter).toBeCloseTo(0.1 * (25 / 1000), 5);
  });

  it('rejects non-positive and NaN transfer volumes safely', () => {
    const source = createContainerWithSubstance('pure-water', 50, 100);
    const dest = createEmptyContainer(100);

    const zeroResult = transferLiquid(source, dest, 0);
    expect(zeroResult.success).toBe(false);
    expect(zeroResult.error).toBe('INVALID_VOLUME');
    expect(zeroResult.message).toContain('greater than 0');

    const negResult = transferLiquid(source, dest, -15);
    expect(negResult.success).toBe(false);
    expect(negResult.error).toBe('INVALID_VOLUME');
  });

  it('guards against empty source container (no negative volumes allowed)', () => {
    const emptySource = createEmptyContainer(100);
    const dest = createEmptyContainer(100);

    const result = transferLiquid(emptySource, dest, 20);
    expect(result.success).toBe(false);
    expect(result.error).toBe('SOURCE_EMPTY');
    expect(result.sourceRemainingMl).toBe(0);
  });

  it('clamps transfer to available liquid when requested volume exceeds source volume', () => {
    // Source only has 15 mL
    const source = createContainerWithSubstance('lemon-juice', 15, 100);
    const dest = createEmptyContainer(100);

    // Request 50 mL
    const result = transferLiquid(source, dest, 50);
    expect(result.success).toBe(true);
    expect(result.transferredVolumeMl).toBe(15);
    expect(result.sourceRemainingMl).toBe(0);
    expect(result.destinationTotalMl).toBe(15);
  });

  it('detects container overflow and caps liquid volume to destination capacity', () => {
    // Destination already has 80 mL in a 100 mL container
    const source = createContainerWithSubstance('pure-water', 60, 100);
    const dest = createContainerWithSubstance('pure-water', 80, 100);

    // Pour 40 mL -> total would be 120 mL, exceeding 100 mL by 20 mL
    const result = transferLiquid(source, dest, 40);
    expect(result.success).toBe(true);
    expect(result.overflowOccurred).toBe(true);
    expect(result.overflowVolumeMl).toBe(20);
    expect(result.destinationTotalMl).toBe(100); // capped at capacity
    expect(result.message).toContain('OVERFLOWED');
    expect(result.destinationNewState.isOverflow).toBe(true);
  });
});
