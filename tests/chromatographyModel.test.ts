import { describe, it, expect } from 'vitest';
import {
  calculateSolventFront,
  calculatePigmentPositions,
  calculateRf,
  getInkSampleDefinition,
  CHROMATOGRAPHY_ASSUMPTIONS,
} from '../src/services/chemistry/chromatographyModel';

describe('Chromatography Scientific Model', () => {
  it('calculates advancing capillary solvent front using Lucas-Washburn kinetics', () => {
    // At t = 0, solvent front is 0
    expect(calculateSolventFront(0, 100)).toBe(0);

    // Front increases monotonically with time
    const front30 = calculateSolventFront(30, 100);
    const front60 = calculateSolventFront(60, 100);
    const front90 = calculateSolventFront(90, 100);

    expect(front30).toBeGreaterThan(0);
    expect(front60).toBeGreaterThan(front30);
    expect(front90).toBeGreaterThan(front60);

    // Front asymptotically approaches maximum allowable front (100 mm)
    expect(front90).toBeLessThanOrEqual(100);
    const frontLarge = calculateSolventFront(600, 100);
    expect(frontLarge).toBeCloseTo(100, 0);
  });

  it('correctly calculates Retention Factor (Rf = distance solute / distance solvent)', () => {
    expect(calculateRf(28, 100)).toBe(0.28);
    expect(calculateRf(55, 100)).toBe(0.55);
    expect(calculateRf(82, 100)).toBe(0.82);

    // Edge cases
    expect(calculateRf(0, 100)).toBe(0);
    expect(calculateRf(50, 0)).toBe(0);
  });

  it('computes realistic pigment separations for all 4 registered inks', () => {
    const frontMm = 80;

    // 1. Black Ink (Yellow, Red, Cyan)
    const blackSpots = calculatePigmentPositions('black-ink', frontMm);
    expect(blackSpots.length).toBe(3);
    expect(blackSpots[0].pigmentName).toContain('Yellow');
    expect(blackSpots[1].pigmentName).toContain('Red');
    expect(blackSpots[2].pigmentName).toContain('Blue');
    expect(blackSpots[0].rf).toBeLessThan(blackSpots[1].rf);
    expect(blackSpots[1].rf).toBeLessThan(blackSpots[2].rf);
    expect(blackSpots[2].distanceMm).toBeCloseTo(0.82 * frontMm, 1);

    // 2. Green Marker Ink (Tartrazine & Brilliant Blue)
    const greenSpots = calculatePigmentPositions('green-ink', frontMm);
    expect(greenSpots.length).toBe(2);
    expect(greenSpots[0].pigmentName).toContain('Tartrazine');
    expect(greenSpots[1].pigmentName).toContain('Brilliant Blue');

    // 3. Brown Calligraphy Ink (Orange, Crimson, Indigo)
    const brownSpots = calculatePigmentPositions('brown-ink', frontMm);
    expect(brownSpots.length).toBe(3);

    // 4. Spinach Chloroplast Extract (Carotenes, Xanthophylls, Chlorophyll a, b)
    const plantSpots = calculatePigmentPositions('plant-extract', frontMm);
    expect(plantSpots.length).toBe(4);
    expect(plantSpots[3].pigmentName).toContain('Carotene');
    expect(plantSpots[3].rf).toBeCloseTo(0.95, 2);

    // 5. Class 12 Inorganic Cation Separation (Pb2+ and Cd2+)
    const cationSpots = calculatePigmentPositions('class12-cation-mixture', frontMm);
    expect(cationSpots.length).toBe(2);
    expect(cationSpots[0].pigmentName).toContain('Lead');
    expect(cationSpots[1].pigmentName).toContain('Cadmium');
    expect(cationSpots[0].rf).toBeCloseTo(0.38, 2);
    expect(cationSpots[1].rf).toBeCloseTo(0.72, 2);
  });

  it('handles zero solvent front (uneluted spot at origin)', () => {
    const spots = calculatePigmentPositions('black-ink', 0);
    expect(spots.length).toBe(3);
    spots.forEach((s) => {
      expect(s.distanceMm).toBe(0);
      expect(s.rf).toBeGreaterThan(0);
    });
  });

  it('exposes documented chromatographic model assumptions', () => {
    expect(CHROMATOGRAPHY_ASSUMPTIONS.paperGrade).toBe('Whatman No. 1 pure cellulose');
    expect(CHROMATOGRAPHY_ASSUMPTIONS.assumptions.length).toBeGreaterThanOrEqual(4);
    expect(getInkSampleDefinition('black-ink')).toBeDefined();
    expect(getInkSampleDefinition('unknown-sample')).toBeUndefined();
  });
});
