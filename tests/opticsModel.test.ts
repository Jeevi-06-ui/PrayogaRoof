import { describe, it, expect } from 'vitest';
import { calculateThinLens } from '../src/services/physics/opticsModel';

describe('Physics Model: Thin-Lens Geometrical Optics (Convex Lens)', () => {
  it('correctly calculates conjugate real image at 2F (u = 2f)', () => {
    // For f = 15 cm and u = 30 cm (2f)
    const result = calculateThinLens(15, 30, 4, 75);

    expect(result.focalLength).toBe(15);
    expect(result.objectDistance).toBe(30);
    expect(result.imageDistance).toBe(30);
    expect(result.magnification).toBe(-1.0);
    expect(result.imageHeight).toBe(-4.0);
    expect(result.imageNature).toBe('Real, Inverted');
    expect(result.imageCategory).toBe('at-2f');
    expect(result.isReal).toBe(true);
    expect(result.isVirtual).toBe(false);
    expect(result.isAtInfinity).toBe(false);
  });

  it('correctly calculates diminished real image beyond 2F (u > 2f)', () => {
    // For f = 15 cm and u = 45 cm (3f)
    // 1/v = 1/15 - 1/45 = 2/45 => v = 22.5 cm
    const result = calculateThinLens(15, 45, 4, 75);

    expect(result.imageDistance).toBe(22.5);
    expect(result.magnification).toBe(-0.5);
    expect(result.imageHeight).toBe(-2.0);
    expect(result.imageNature).toBe('Real, Inverted');
    expect(result.imageCategory).toBe('beyond-2f');
    expect(result.isReal).toBe(true);
  });

  it('correctly calculates magnified real image between F and 2F (f < u < 2f)', () => {
    // For f = 15 cm and u = 20 cm
    // 1/v = 1/15 - 1/20 = 1/60 => v = 60 cm
    const result = calculateThinLens(15, 20, 4, 75);

    expect(result.imageDistance).toBe(60);
    expect(result.magnification).toBe(-3.0);
    expect(result.imageHeight).toBe(-12.0);
    expect(result.imageNature).toBe('Real, Inverted');
    expect(result.imageCategory).toBe('between-f-and-2f');
    expect(result.isReal).toBe(true);
  });

  it('correctly calculates virtual magnified erect image inside focal length (u < f)', () => {
    // For f = 15 cm and u = 10 cm (magnifying glass)
    // 1/v = 1/15 - 1/10 = -1/30 => v = -30 cm (virtual, on incident side)
    const result = calculateThinLens(15, 10, 4, 75);

    expect(result.imageDistance).toBe(-30);
    expect(result.magnification).toBe(3.0); // positive magnification = erect
    expect(result.imageHeight).toBe(12.0);
    expect(result.imageNature).toBe('Virtual, Erect');
    expect(result.imageCategory).toBe('inside-f');
    expect(result.isVirtual).toBe(true);
    expect(result.isReal).toBe(false);
  });

  it('handles edge case: object at focal point (u = f) forming image at infinity', () => {
    // For f = 15 cm and u = 15 cm
    const result = calculateThinLens(15, 15, 4, 75);

    expect(result.isAtInfinity).toBe(true);
    expect(result.imageNature).toBe('At Infinity (Parallel Rays)');
    expect(result.imageCategory).toBe('at-f');
    expect(result.rayPaths.length).toBeGreaterThan(0);
  });

  it('computes accurate focal markers along the optical bench rail', () => {
    const benchX = 80;
    const f = 20;
    const result = calculateThinLens(f, 40, 4, benchX);

    expect(result.focalMarkers.twoF1).toBe(40); // 80 - 40
    expect(result.focalMarkers.F1).toBe(60); // 80 - 20
    expect(result.focalMarkers.F2).toBe(100); // 80 + 20
    expect(result.focalMarkers.twoF2).toBe(120); // 80 + 40
  });

  it('generates geometrical ray tracing coordinates for ray paths', () => {
    const result = calculateThinLens(15, 30, 4, 75);

    expect(result.rayPaths.length).toBeGreaterThanOrEqual(2);
    const parallelRay = result.rayPaths.find((r) => r.id === 'ray-1');
    const centralRay = result.rayPaths.find((r) => r.id === 'ray-2');

    expect(parallelRay).toBeDefined();
    expect(centralRay).toBeDefined();
    expect(parallelRay!.points.length).toBeGreaterThanOrEqual(6);
    expect(centralRay!.points.length).toBeGreaterThanOrEqual(4);
  });

  it('documents scientific assumptions and thin lens formula summary', () => {
    const result = calculateThinLens(15, 30, 4, 75);

    expect(result.formulaSummary).toContain('1/f = 1/v - 1/u');
    expect(result.assumptions.length).toBeGreaterThanOrEqual(3);
    expect(result.assumptions.some((a) => a.includes('Paraxial'))).toBe(true);
    expect(result.assumptions.some((a) => a.includes('Thin lens'))).toBe(true);
  });
});
