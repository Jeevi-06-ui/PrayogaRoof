import { describe, it, expect } from 'vitest';
import {
  calculateConcaveMirror,
  calculateConvexMirror,
  calculateConcaveLens,
  calculatePrismRefraction,
  calculateDiodeCharacteristics,
} from '../src/services/physics/advancedOpticsAndSemiconductorModel';

describe('Phase 6: Advanced Optics & Semiconductor Diode Model Tests', () => {
  // =========================================================================
  // 1. CONCAVE MIRROR TESTS
  // =========================================================================
  describe('Focal Length of a Concave Mirror', () => {
    it('calculates real inverted image beyond C when object is between F and C', () => {
      // f = 15 cm (signed: -15 cm), u = 20 cm
      // 1/v = 1/f - 1/u = -1/15 - (-1/20) = -1/15 + 1/20 = -1/60 => v = -60 cm
      const res = calculateConcaveMirror({
        focalLengthCm: 15.0,
        objectDistanceCm: 20.0,
        objectHeightCm: 4.0,
      });

      expect(res.focalLengthCm).toBe(-15.0);
      expect(res.magnitudeFocalLengthCm).toBe(15.0);
      expect(res.radiusOfCurvatureCm).toBe(30.0);
      expect(res.imageDistanceCm).toBe(-60.0);
      expect(res.linearMagnification).toBe(-3.0);
      expect(res.imageHeightCm).toBe(-12.0);
      expect(res.imageNature).toBe('Real, Inverted');
      expect(res.imageCategory).toBe('between-c-and-f');
      expect(res.isReal).toBe(true);
      expect(res.canCatchOnScreen).toBe(true);
      expect(res.rayPaths.length).toBeGreaterThanOrEqual(2);
    });

    it('calculates real inverted image of identical size when object is at center of curvature C (u = 2f)', () => {
      // f = 15 cm, u = 30 cm (at C = 2f)
      // 1/v = -1/15 + 1/30 = -1/30 => v = -30 cm, m = -1
      const res = calculateConcaveMirror({
        focalLengthCm: 15.0,
        objectDistanceCm: 30.0,
        objectHeightCm: 4.0,
      });

      expect(res.imageDistanceCm).toBe(-30.0);
      expect(res.linearMagnification).toBe(-1.0);
      expect(res.imageHeightCm).toBe(-4.0);
      expect(res.imageCategory).toBe('at-c');
      expect(res.isReal).toBe(true);
    });

    it('calculates virtual erect magnified image behind mirror when object is inside focus (u < f)', () => {
      // f = 15 cm, u = 10 cm
      // 1/v = -1/15 - (-1/10) = -1/15 + 1/10 = 1/30 => v = +30 cm, m = +3.0
      const res = calculateConcaveMirror({
        focalLengthCm: 15.0,
        objectDistanceCm: 10.0,
        objectHeightCm: 4.0,
      });

      expect(res.imageDistanceCm).toBe(30.0);
      expect(res.linearMagnification).toBe(3.0);
      expect(res.imageHeightCm).toBe(12.0);
      expect(res.imageNature).toBe('Virtual, Erect');
      expect(res.imageCategory).toBe('between-f-and-p');
      expect(res.isVirtual).toBe(true);
      expect(res.canCatchOnScreen).toBe(false);
    });

    it('handles object at focus (u = f) forming parallel rays towards infinity', () => {
      const res = calculateConcaveMirror({
        focalLengthCm: 15.0,
        objectDistanceCm: 15.0,
      });

      expect(res.isAtInfinity).toBe(true);
      expect(res.imageNature).toContain('Infinity');
    });
  });

  // =========================================================================
  // 2. CONVEX MIRROR TESTS
  // =========================================================================
  describe('Focal Length of a Convex Mirror', () => {
    it('always produces virtual, erect, diminished image behind the mirror', () => {
      // f = +15 cm, u = 30 cm
      // 1/v = 1/f - 1/u = 1/15 - (-1/30) = 1/15 + 1/30 = 3/30 = 1/10 => v = +10 cm
      // m = -v/u = -10 / (-30) = +0.33
      const res = calculateConvexMirror({
        focalLengthCm: 15.0,
        objectDistanceCm: 30.0,
        objectHeightCm: 6.0,
      });

      expect(res.focalLengthCm).toBe(15.0);
      expect(res.imageDistanceCm).toBe(10.0);
      expect(res.linearMagnification).toBeCloseTo(0.33, 2);
      expect(res.imageHeightCm).toBeCloseTo(2.0, 1);
      expect(res.imageNature).toBe('Virtual, Erect');
      expect(res.isVirtual).toBe(true);
      expect(res.isReal).toBe(false);
      expect(res.canCatchOnScreen).toBe(false);
      expect(res.rayPaths.length).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // 3. CONCAVE LENS TESTS
  // =========================================================================
  describe('Focal Length of a Concave Lens', () => {
    it('always produces virtual, erect, diminished image on the incident side', () => {
      // f = -15 cm, u = 30 cm
      // 1/v = 1/f + 1/u = -1/15 + (-1/30) = -3/30 = -1/10 => v = -10 cm
      // m = v/u = -10 / (-30) = +0.33
      const res = calculateConcaveLens({
        focalLengthCm: 15.0,
        objectDistanceCm: 30.0,
        objectHeightCm: 6.0,
        auxiliaryConvexFocalLengthCm: 10.0,
      });

      expect(res.focalLengthCm).toBe(-15.0);
      expect(res.imageDistanceCm).toBe(-10.0);
      expect(res.linearMagnification).toBeCloseTo(0.33, 2);
      expect(res.imageHeightCm).toBeCloseTo(2.0, 1);
      expect(res.imageNature).toBe('Virtual, Erect');
      expect(res.isVirtual).toBe(true);
      expect(res.auxiliaryLensMethod.combinedFocalLengthCm).toBe(30.0);
    });
  });

  // =========================================================================
  // 4. PRISM REFRACTION & MINIMUM DEVIATION TESTS
  // =========================================================================
  describe('Refractive Index of a Prism – Minimum Deviation', () => {
    it('calculates refraction angles and deviation through 60-degree crown glass prism', () => {
      // A = 60 deg, mu = 1.52, i1 = 48.0 deg
      const res = calculatePrismRefraction({
        angleOfIncidenceDeg: 48.0,
        prismAngleDeg: 60.0,
        refractiveIndex: 1.52,
      });

      expect(res.prismAngleDeg).toBe(60.0);
      expect(res.refractiveIndexMu).toBe(1.52);
      expect(res.angleOfIncidenceDeg).toBe(48.0);
      expect(res.firstRefractionAngleDeg).toBeCloseTo(29.3, 1); // sin(r1) = sin(48)/1.52 => r1 = 29.3 deg
      expect(res.secondIncidentAngleDeg).toBeCloseTo(30.7, 1); // r2 = 60 - 29.3 = 30.7 deg
      expect(res.angleOFDeviationDeg).toBeCloseTo(39.0, 0.5);
      expect(res.minimumDeviationDeg).toBeCloseTo(38.9, 0.5);
      expect(res.calculatedRefractiveIndex).toBeCloseTo(1.52, 2);
      expect(res.curvePoints.length).toBeGreaterThanOrEqual(5);
    });

    it('accurately detects minimum deviation condition (i = e, r1 = r2)', () => {
      // At Dm: r1 = r2 = 30 deg => sin(i_m) = 1.52 * sin(30) = 0.76 => i_m = 49.46 deg
      const res = calculatePrismRefraction({
        angleOfIncidenceDeg: 49.5,
        prismAngleDeg: 60.0,
        refractiveIndex: 1.52,
      });

      expect(res.isMinimumDeviation).toBe(true);
      expect(res.status).toContain('MINIMUM DEVIATION REACHED');
    });

    it('detects total internal reflection when angle of incidence causes r2 > critical angle', () => {
      // Very small incidence angle i1 = 25 deg causes r1 ~ 16 deg, so r2 = 60 - 16 = 44 deg > critical angle 41.1 deg
      const res = calculatePrismRefraction({
        angleOfIncidenceDeg: 25.0,
        prismAngleDeg: 60.0,
        refractiveIndex: 1.52,
      });

      expect(res.isTotalInternalReflection).toBe(true);
      expect(res.status).toContain('TOTAL INTERNAL REFLECTION');
    });
  });

  // =========================================================================
  // 5. P-N JUNCTION DIODE CHARACTERISTICS TESTS
  // =========================================================================
  describe('P-N Junction Diode – I-V Characteristics', () => {
    it('models Silicon diode forward bias with knee threshold at 0.7V', () => {
      // Below knee: 0.4V
      const subRes = calculateDiodeCharacteristics({
        semiconductorMaterial: 'silicon',
        biasMode: 'forward',
        appliedVoltageVolts: 0.4,
      });
      expect(subRes.kneeVoltageVolts).toBe(0.7);
      expect(subRes.isConducting).toBe(false);
      expect(subRes.circuitCurrentMilliAmps).toBeLessThan(0.1);

      // Above knee: 1.5V with 100 Ohm series resistor
      const condRes = calculateDiodeCharacteristics({
        semiconductorMaterial: 'silicon',
        biasMode: 'forward',
        appliedVoltageVolts: 1.5,
        seriesResistanceOhms: 100.0,
      });
      expect(condRes.isConducting).toBe(true);
      expect(condRes.circuitCurrentMilliAmps).toBeGreaterThan(5.0);
      expect(condRes.dynamicResistanceOhms).toBe(15.0);
      expect(condRes.status).toContain('FORWARD CONDUCTION');
    });

    it('models Germanium diode forward bias with lower knee at 0.3V', () => {
      const geRes = calculateDiodeCharacteristics({
        semiconductorMaterial: 'germanium',
        biasMode: 'forward',
        appliedVoltageVolts: 0.8,
      });
      expect(geRes.kneeVoltageVolts).toBe(0.3);
      expect(geRes.isConducting).toBe(true);
    });

    it('models Reverse bias saturation current and breakdown threshold', () => {
      // Normal reverse bias: 5V
      const revRes = calculateDiodeCharacteristics({
        semiconductorMaterial: 'silicon',
        biasMode: 'reverse',
        appliedVoltageVolts: 5.0,
      });
      expect(revRes.isBreakdown).toBe(false);
      expect(revRes.circuitCurrentMicroAmps).toBeLessThan(1.0); // Microamperes leakage only

      // Reverse breakdown: 30V
      const brkRes = calculateDiodeCharacteristics({
        semiconductorMaterial: 'silicon',
        biasMode: 'reverse',
        appliedVoltageVolts: 30.0,
      });
      expect(brkRes.isBreakdown).toBe(true);
      expect(brkRes.circuitCurrentMicroAmps).toBeGreaterThan(50.0); // Avalanche surge
      expect(brkRes.status).toContain('REVERSE BREAKDOWN');
    });
  });
});
