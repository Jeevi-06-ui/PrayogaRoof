import { describe, it, expect } from 'vitest';
import {
  calculateVernierReading,
  calculateCylinderVolume,
  calculateSphereVolume,
  calculateScrewGaugeReading,
  calculateWireCrossSection,
  calculateShoelaceArea,
  isPointInPolygon,
  evaluateLaminaArea,
  calculateSpherometerRadius,
  calculateBeamBalanceState,
  calculateRestingPoint,
  STANDARD_LAMINA_VERTICES,
} from '../src/services/physics/precisionMechanicsModel';

describe('Precision Mechanics Physical Models & Numerical Accuracy', () => {
  describe('1. Vernier Callipers Calculations', () => {
    it('calculates least count correctly for 10 and 20 divisions', () => {
      const reading10 = calculateVernierReading(25.4, { mainScalePitchMm: 1.0, vernierDivisions: 10 });
      expect(reading10.leastCountMm).toBe(0.1);

      const reading20 = calculateVernierReading(25.45, { mainScalePitchMm: 1.0, vernierDivisions: 20 });
      expect(reading20.leastCountMm).toBe(0.05);
    });

    it('correctly derives MSR and VCD for zero-error-free measurement', () => {
      // 25.4 mm => MSR = 25 mm, remainder = 0.4 mm, VCD = 4 (since 4 * 0.1 = 0.4)
      const res = calculateVernierReading(25.4, { zeroErrorMm: 0.0, vernierDivisions: 10 });
      expect(res.msrMm).toBe(25.0);
      expect(res.vcd).toBe(4);
      expect(res.observedReadingMm).toBe(25.4);
      expect(res.correctedReadingMm).toBe(25.4);
      expect(res.correctedReadingCm).toBe(2.54);
    });

    it('handles positive zero error by subtracting the error', () => {
      // If zero error is +0.2 mm, scale reads 25.6 mm when jaw is at 25.4 mm
      const res = calculateVernierReading(25.4, { zeroErrorMm: 0.2, vernierDivisions: 10 });
      expect(res.observedReadingMm).toBe(25.6);
      expect(res.zeroErrorMm).toBe(0.2);
      expect(res.zeroCorrectionMm).toBe(-0.2);
      expect(res.correctedReadingMm).toBe(25.4);
    });

    it('handles negative zero error by adding the correction', () => {
      // If zero error is -0.3 mm, scale reads 25.1 mm when jaw is at 25.4 mm
      const res = calculateVernierReading(25.4, { zeroErrorMm: -0.3, vernierDivisions: 10 });
      expect(res.observedReadingMm).toBe(25.1);
      expect(res.zeroErrorMm).toBe(-0.3);
      expect(res.zeroCorrectionMm).toBe(0.3);
      expect(res.correctedReadingMm).toBe(25.4);
    });

    it('calculates cylindrical volume accurately: V = (π/4)·d²·h', () => {
      // d = 20 mm = 2 cm, h = 50 mm = 5 cm => V = π * 1² * 5 ≈ 15.708 cm³
      const vol = calculateCylinderVolume(20.0, 50.0);
      expect(vol.volumeCm3).toBeCloseTo(15.708, 2);
      expect(vol.volumeMm3).toBeCloseTo(15707.96, 1);
    });

    it('calculates spherical volume accurately: V = (4/3)·π·r³', () => {
      // d = 20 mm => r = 10 mm = 1 cm => V = (4/3)·π·1³ ≈ 4.1888 cm³
      const vol = calculateSphereVolume(20.0);
      expect(vol.volumeCm3).toBeCloseTo(4.1888, 2);
    });
  });

  describe('2. Micrometer Screw Gauge Calculations', () => {
    it('calculates least count from pitch and circular divisions', () => {
      const sg100 = calculateScrewGaugeReading(0.46, { pitchMm: 1.0, circularDivisions: 100 });
      expect(sg100.leastCountMm).toBe(0.01);

      const sg50 = calculateScrewGaugeReading(0.46, { pitchMm: 0.5, circularDivisions: 50 });
      expect(sg50.leastCountMm).toBe(0.01);
    });

    it('correctly calculates PSR and CSR for wire measurement', () => {
      // Gap = 2.45 mm => PSR = 2.0 mm, remainder = 0.45 mm => CSR = 45
      const res = calculateScrewGaugeReading(2.45, { pitchMm: 1.0, circularDivisions: 100, zeroErrorDivisions: 0 });
      expect(res.psrMm).toBe(2.0);
      expect(res.csr).toBe(45);
      expect(res.observedReadingMm).toBe(2.45);
      expect(res.correctedReadingMm).toBe(2.45);
      expect(res.correctedReadingCm).toBe(0.245);
    });

    it('corrects positive circular zero error', () => {
      // 3 divisions positive error => +0.03 mm offset
      const res = calculateScrewGaugeReading(1.25, { zeroErrorDivisions: 3, circularDivisions: 100, pitchMm: 1.0 });
      expect(res.observedReadingMm).toBe(1.28);
      expect(res.zeroErrorMm).toBe(0.03);
      expect(res.correctedReadingMm).toBe(1.25);
    });

    it('corrects negative circular zero error', () => {
      // -4 divisions negative error => -0.04 mm offset
      const res = calculateScrewGaugeReading(0.46, { zeroErrorDivisions: -4, circularDivisions: 100, pitchMm: 1.0 });
      expect(res.observedReadingMm).toBe(0.42);
      expect(res.zeroErrorMm).toBe(-0.04);
      expect(res.correctedReadingMm).toBe(0.46);
    });

    it('calculates wire cross-sectional area: A = π·r²', () => {
      // d = 0.46 mm => r = 0.23 mm => A = π * (0.23)² ≈ 0.16619 mm²
      const wire = calculateWireCrossSection(0.46);
      expect(wire.areaMm2).toBeCloseTo(0.1662, 3);
      expect(wire.areaCm2).toBeCloseTo(0.001662, 5);
    });
  });

  describe('3. Area of an Irregular Lamina Model', () => {
    it('accurately computes exact polygon area via Gauss Shoelace formula', () => {
      // Simple 4x4 square centered at origin: vertices (-2,-2), (2,-2), (2,2), (-2,2) => Area = 16
      const square = [
        { x: -2, y: -2 },
        { x: 2, y: -2 },
        { x: 2, y: 2 },
        { x: -2, y: 2 },
      ];
      expect(calculateShoelaceArea(square)).toBe(16);

      // Triangle with base 6, height 4 => Area = 12
      const triangle = [
        { x: -3, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 4 },
      ];
      expect(calculateShoelaceArea(triangle)).toBe(12);
    });

    it('tests point inside vs outside polygon correctly using ray-casting', () => {
      const poly = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      expect(isPointInPolygon({ x: 5, y: 5 }, poly)).toBe(true);
      expect(isPointInPolygon({ x: -1, y: 5 }, poly)).toBe(false);
      expect(isPointInPolygon({ x: 15, y: 5 }, poly)).toBe(false);
    });

    it('evaluates irregular leaf lamina area on a 1 cm grid within acceptable uncertainty', () => {
      const shoelaceArea = calculateShoelaceArea(STANDARD_LAMINA_VERTICES);
      expect(shoelaceArea).toBeGreaterThan(15);
      expect(shoelaceArea).toBeLessThan(40);

      const gridEval = evaluateLaminaArea(STANDARD_LAMINA_VERTICES, 1.0, 0, 0);
      expect(gridEval.fullSquaresCount).toBeGreaterThan(0);
      expect(gridEval.moreThanHalfCount).toBeGreaterThan(0);
      expect(gridEval.calculatedAreaCm2).toBeGreaterThan(0);
      expect(gridEval.uncertaintyCm2).toBeGreaterThan(0);

      // Estimated area should be close to Shoelace theoretical benchmark (within 15% error)
      expect(gridEval.percentageError).toBeLessThan(15);
    });
  });

  describe('4. Spherometer & Radius of Curvature Calculations', () => {
    it('returns infinite radius for flat plane glass surface (sagitta h = 0)', () => {
      const plane = calculateSpherometerRadius(0.0, 0.0, { legDistanceMm: 40.0 });
      expect(plane.surfaceType).toBe('plane');
      expect(plane.sagittaMm).toBe(0);
      expect(plane.radiusOfCurvatureMm).toBe(Infinity);
      expect(plane.radiusOfCurvatureCm).toBe(Infinity);
    });

    it('calculates radius of curvature for convex watch glass: R = l²/(6h) + h/2', () => {
      // l = 40 mm, h = 2.03 mm
      // l²/(6h) = 1600 / 12.18 = 131.363 mm
      // h/2 = 1.015 mm => R = 132.378 mm = 13.24 cm
      const convex = calculateSpherometerRadius(2.03, 0.0, { legDistanceMm: 40.0 });
      expect(convex.surfaceType).toBe('convex');
      expect(convex.sagittaMm).toBeCloseTo(2.03, 2);
      expect(convex.radiusOfCurvatureMm).toBeCloseTo(132.38, 1);
      expect(convex.radiusOfCurvatureCm).toBeCloseTo(13.24, 1);
      expect(convex.isValidGeometry).toBe(true);
    });

    it('calculates radius of curvature for concave spherical mirror', () => {
      // On concave mirror, h1 is lower than plane h0: h1 = -1.34 mm, h0 = 0 => sagitta = 1.34 mm
      // l = 40 mm, h = 1.34 mm => l²/(6h) = 1600 / 8.04 = 199.0 mm
      // h/2 = 0.67 mm => R ≈ 199.67 mm ≈ 19.97 cm
      const concave = calculateSpherometerRadius(-1.34, 0.0, { legDistanceMm: 40.0 });
      expect(concave.surfaceType).toBe('concave');
      expect(concave.sagittaMm).toBeCloseTo(1.34, 2);
      expect(concave.radiusOfCurvatureCm).toBeCloseTo(19.97, 1);
      expect(concave.isValidGeometry).toBe(true);
    });

    it('flags physically invalid geometry when sagitta exceeds geometric boundaries', () => {
      // If h = 50 mm for leg separation 40 mm, it's physically impossible for sphere to sit on 3 legs
      const invalid = calculateSpherometerRadius(50.0, 0.0, { legDistanceMm: 40.0 });
      expect(invalid.isValidGeometry).toBe(false);
      expect(invalid.validationMessage).toBeDefined();
    });
  });

  describe('5. Physical Beam Balance Dynamics', () => {
    it('keeps pointer locked at zero and reports arrested when beam is arrested', () => {
      const state = calculateBeamBalanceState(25.0, 20.0, true);
      expect(state.isArrested).toBe(true);
      expect(state.status).toBe('arrested');
      expect(state.currentPointerAngleDeg).toBe(0);
    });

    it('detects mechanical equilibrium when masses match within 5 mg threshold', () => {
      const balanced = calculateBeamBalanceState(24.500, 24.502, false);
      expect(balanced.isBalanced).toBe(true);
      expect(balanced.status).toBe('balanced');
      expect(Math.abs(balanced.massDifferenceGrams)).toBeLessThanOrEqual(0.005);
    });

    it('tilts left when left pan mass is greater than right pan', () => {
      const leftHeavy = calculateBeamBalanceState(30.0, 20.0, false);
      expect(leftHeavy.status).toBe('tilted-left');
      expect(leftHeavy.massDifferenceGrams).toBe(-10.0);
      expect(leftHeavy.isBalanced).toBe(false);
    });

    it('tilts right when right pan mass is greater than left pan', () => {
      const rightHeavy = calculateBeamBalanceState(20.0, 35.0, false);
      expect(rightHeavy.status).toBe('tilted-right');
      expect(rightHeavy.massDifferenceGrams).toBe(15.0);
      expect(rightHeavy.isBalanced).toBe(false);
    });

    it('calculates resting point via method of oscillations: RP = (d1 + 2d2 + d3) / 4', () => {
      // Oscillations: -3.0, +2.6, -2.2 => (-3.0 + 5.2 - 2.2) / 4 = 0.0
      const rp = calculateRestingPoint(-3.0, 2.6, -2.2);
      expect(rp).toBe(0.0);

      // Asymmetric oscillation: -1.0, +4.0, 0.0 => (-1.0 + 8.0 + 0) / 4 = 1.75
      const rpAsym = calculateRestingPoint(-1.0, 4.0, 0.0);
      expect(rpAsym).toBe(1.75);
    });
  });
});
