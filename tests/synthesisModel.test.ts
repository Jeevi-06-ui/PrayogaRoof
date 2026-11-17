import { describe, it, expect } from 'vitest';
import {
  SYNTHESIS_CATALOG,
  calculateSynthesisState,
  SYNTHESIS_ASSUMPTIONS,
} from '../src/services/chemistry/synthesisModel';

describe('Inorganic & Organic Synthesis Scientific Model (Class 12)', () => {
  it('contains all 4 required preparation targets with complete chemical specifications', () => {
    const ids = ['mohrs-salt', 'potash-alum', 'acetanilide', 'dibenzalacetone'] as const;
    for (const id of ids) {
      const spec = SYNTHESIS_CATALOG[id];
      expect(spec).toBeDefined();
      expect(spec.name).toBeTruthy();
      expect(spec.balancedEquation).toBeTruthy();
      expect(spec.theoreticalYieldGrams).toBeGreaterThan(0);
      expect(spec.expectedPracticalYieldGrams).toBeGreaterThan(0);
      expect(spec.crystalHabit).toBeTruthy();
      expect(spec.crystalColor).toBeTruthy();
      expect(spec.meltingOrDecompPointC).toBeGreaterThan(0);
      expect(spec.safetyNote).toBeTruthy();
    }
  });

  it('correctly models Mohr’s salt equimolar synthesis, acidification, and monoclinic crystal formation', () => {
    const mix = calculateSynthesisState({
      compoundId: 'mohrs-salt',
      stage: 'reactant-mixing',
      isAcidified: true,
    });
    expect(mix.solutionAppearance).toContain('aqueous');
    expect(mix.isAcidified).toBe(true);

    const heat = calculateSynthesisState({
      compoundId: 'mohrs-salt',
      stage: 'acidified-heating',
      heatingDurationMin: 12,
    });
    expect(heat.solutionAppearance).toContain('crystallisation point');

    const cool = calculateSynthesisState({
      compoundId: 'mohrs-salt',
      stage: 'crystallisation-cooling',
      coolingDurationMin: 15,
    });
    expect(cool.crystalFormed).toBe(true);
    expect(cool.crystalMassGrams).toBeGreaterThan(7.0);
    expect(cool.practicalYieldPercent).toBeGreaterThan(75);

    const final = calculateSynthesisState({
      compoundId: 'mohrs-salt',
      stage: 'filtration-drying',
      isAcidified: true,
    });
    expect(final.spec.crystalHabit).toContain('Monoclinic');
    expect(final.purityPercent).toBe(98.5);
  });

  it('correctly simulates Potash Alum octahedral crystal habit and recovery', () => {
    const final = calculateSynthesisState({
      compoundId: 'potash-alum',
      stage: 'filtration-drying',
    });
    expect(final.spec.crystalHabit.toLowerCase()).toContain('octahedral');
    expect(final.crystalMassGrams).toBeCloseTo(11.2, 0.5);
    expect(final.practicalYieldPercent).toBeGreaterThan(80);
  });

  it('correctly simulates Acetanilide nucleophilic acyl substitution, melting point 114°C', () => {
    const final = calculateSynthesisState({
      compoundId: 'acetanilide',
      stage: 'filtration-drying',
      isAcidified: true,
    });
    expect(final.spec.name).toContain('Acetanilide');
    expect(final.meltingPointObservedC).toBe(114);
    expect(final.spec.crystalHabit).toContain('leaflets');
  });

  it('correctly simulates Dibenzalacetone Claisen-Schmidt condensation and yellow crystals', () => {
    const final = calculateSynthesisState({
      compoundId: 'dibenzalacetone',
      stage: 'filtration-drying',
      isAcidified: true,
    });
    expect(final.spec.crystalHabit).toContain('yellow');
    expect(final.meltingPointObservedC).toBe(112);
  });

  it('provides explicit educational assumptions', () => {
    expect(SYNTHESIS_ASSUMPTIONS.length).toBeGreaterThanOrEqual(3);
  });
});
