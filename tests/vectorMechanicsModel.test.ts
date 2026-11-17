import { describe, it, expect } from 'vitest';
import {
  calculateVectorAddition,
  calculateLimitingFriction,
  calculateInclinedPlanePhysics,
  calculateHookesLaw,
  calculateBoylesLaw,
  SURFACE_FRICTION_PRESETS,
  GRAVITY_STANDARD,
} from '../src/services/physics/vectorMechanicsModel';

describe('Phase 4: Vector Mechanics & Classical Physics Model Tests', () => {
  // --------------------------------------------------------------------------
  // 1. Parallelogram Law of Vectors
  // --------------------------------------------------------------------------
  describe('Parallelogram Law of Vectors', () => {
    it('calculates orthogonal forces (theta = 90 deg) via Pythagoras', () => {
      // 3N along X (0 deg), 4N along Y (90 deg) -> R = 5N at ~53.13 deg
      const res = calculateVectorAddition({
        forceP: 3.0,
        anglePDeg: 0,
        forceQ: 4.0,
        angleQDeg: 90,
      });

      expect(res.includedAngleDeg).toBe(90);
      expect(res.resultantMagnitude).toBeCloseTo(5.0, 2);
      expect(res.resultantAngleDeg).toBeCloseTo(53.1, 1);
      expect(res.angleAlphaDeg).toBeCloseTo(53.13, 1);
      expect(res.resultantComponentX).toBeCloseTo(3.0, 2);
      expect(res.resultantComponentY).toBeCloseTo(4.0, 2);
      expect(res.equilibrantMagnitude).toBeCloseTo(5.0, 2);
      expect(res.equilibrantAngleDeg).toBeCloseTo(233.1, 1);
    });

    it('calculates collinear forces: same direction (theta = 0 deg) and opposite (theta = 180 deg)', () => {
      const collinearSame = calculateVectorAddition({
        forceP: 2.5,
        anglePDeg: 30,
        forceQ: 1.5,
        angleQDeg: 30,
      });
      expect(collinearSame.includedAngleDeg).toBe(0);
      expect(collinearSame.resultantMagnitude).toBeCloseTo(4.0, 2);

      const collinearOpposite = calculateVectorAddition({
        forceP: 5.0,
        anglePDeg: 0,
        forceQ: 3.0,
        angleQDeg: 180,
      });
      expect(collinearOpposite.includedAngleDeg).toBe(180);
      expect(collinearOpposite.resultantMagnitude).toBeCloseTo(2.0, 2);
    });

    it('calculates 60 degree vector addition (P = Q = 5N)', () => {
      // R = sqrt(5^2 + 5^2 + 2*5*5*cos(60)) = sqrt(25 + 25 + 25) = sqrt(75) approx 8.66 N
      const res = calculateVectorAddition({
        forceP: 5.0,
        anglePDeg: 0,
        forceQ: 5.0,
        angleQDeg: 60,
      });
      expect(res.includedAngleDeg).toBe(60);
      expect(res.resultantMagnitude).toBeCloseTo(8.66, 2);
      expect(res.angleAlphaDeg).toBeCloseTo(30.0, 1); // Bisector for equal forces
    });

    it('evaluates balancing mass discrepancy and equilibrium validity', () => {
      // Theoretical R = 5.0 N -> requires ~509.85 grams weight to balance
      const resAccurate = calculateVectorAddition({
        forceP: 3.0,
        anglePDeg: 0,
        forceQ: 4.0,
        angleQDeg: 90,
        balancingMassGrams: (5.0 * 1000) / GRAVITY_STANDARD,
      });
      expect(resAccurate.percentageError).toBeLessThan(0.1);
      expect(resAccurate.isEquilibriumValid).toBe(true);

      const resInaccurate = calculateVectorAddition({
        forceP: 3.0,
        anglePDeg: 0,
        forceQ: 4.0,
        angleQDeg: 90,
        balancingMassGrams: 400, // significantly less than 509.8g
      });
      expect(resInaccurate.percentageError).toBeGreaterThan(15.0);
      expect(resInaccurate.isEquilibriumValid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Laws of Limiting Friction
  // --------------------------------------------------------------------------
  describe('Laws of Limiting Friction', () => {
    it('models static regime where friction matches pulling force before threshold', () => {
      // Block mass 200g, Wood on Wood (mu_s = 0.35)
      // Normal N = 0.2 * 9.80665 = 1.961 N
      // Limiting friction f_s,max = 0.35 * 1.961 = 0.686 N (~70g pan load)
      const res = calculateLimitingFriction({
        blockMassGrams: 200,
        addedMassGrams: 0,
        panMassGrams: 10,
        addedPanMassGrams: 30, // total 40g pan = 0.04 * 9.80665 = 0.392 N < 0.686 N
        surfacePair: 'wood-on-wood',
      });

      expect(res.totalBlockMassKg).toBeCloseTo(0.2, 3);
      expect(res.normalReactionN).toBeCloseTo(1.961, 2);
      expect(res.limitingFrictionN).toBeCloseTo(0.686, 2);
      expect(res.isMotionInitiated).toBe(false);
      expect(res.frictionForceN).toBeCloseTo(res.appliedPullingForceN, 3);
      expect(res.netForceN).toBe(0);
      expect(res.accelerationMs2).toBe(0);
    });

    it('transitions to kinetic regime when pulling force exceeds limiting friction', () => {
      // Same setup with 100g in pan (~0.98 N > 0.686 N)
      const res = calculateLimitingFriction({
        blockMassGrams: 200,
        addedMassGrams: 0,
        panMassGrams: 10,
        addedPanMassGrams: 90, // total 100g = 0.981 N
        surfacePair: 'wood-on-wood', // mu_k = 0.28 -> f_k = 0.28 * 1.961 = 0.549 N
      });

      expect(res.isMotionInitiated).toBe(true);
      expect(res.frictionForceN).toBeCloseTo(0.28 * res.normalReactionN, 2);
      expect(res.netForceN).toBeGreaterThan(0);
      expect(res.accelerationMs2).toBeGreaterThan(0);
    });

    it('demonstrates that friction is independent of contact area', () => {
      const broad = calculateLimitingFriction({
        blockMassGrams: 150,
        addedMassGrams: 50,
        panMassGrams: 20,
        addedPanMassGrams: 40,
        surfacePair: 'wood-on-wood',
        contactOrientation: 'broad-side',
      });
      const narrow = calculateLimitingFriction({
        blockMassGrams: 150,
        addedMassGrams: 50,
        panMassGrams: 20,
        addedPanMassGrams: 40,
        surfacePair: 'wood-on-wood',
        contactOrientation: 'narrow-edge',
      });

      expect(broad.limitingFrictionN).toBe(narrow.limitingFrictionN);
      expect(broad.normalReactionN).toBe(narrow.normalReactionN);
      expect(broad.contactAreaCm2).toBe(60);
      expect(narrow.contactAreaCm2).toBe(20);
    });

    it('verifies higher friction on rough sandpaper and lower on glass', () => {
      const sand = calculateLimitingFriction({
        blockMassGrams: 100,
        addedMassGrams: 0,
        panMassGrams: 0,
        addedPanMassGrams: 50,
        surfacePair: 'wood-on-sandpaper',
      });
      const glass = calculateLimitingFriction({
        blockMassGrams: 100,
        addedMassGrams: 0,
        panMassGrams: 0,
        addedPanMassGrams: 50,
        surfacePair: 'wood-on-glass',
      });

      expect(sand.limitingFrictionN).toBeGreaterThan(glass.limitingFrictionN);
      expect(sand.staticCoeff).toBe(SURFACE_FRICTION_PRESETS['wood-on-sandpaper'].staticCoeff);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Friction on an Inclined Plane
  // --------------------------------------------------------------------------
  describe('Friction on an Inclined Plane', () => {
    it('decomposes weight into normal and parallel components', () => {
      // 100g block at 30 deg incline
      // N = 0.1 * 9.80665 * cos(30) = 0.9807 * 0.8660 = 0.849 N
      // F_parallel = 0.1 * 9.80665 * sin(30) = 0.9807 * 0.5 = 0.490 N
      const res = calculateInclinedPlanePhysics({
        blockMassGrams: 100,
        inclineAngleDeg: 30,
        surfacePair: 'wood-on-wood',
      });

      expect(res.normalForceN).toBeCloseTo(0.849, 2);
      expect(res.parallelGravityN).toBeCloseTo(0.490, 2);
    });

    it('correctly calculates the angle of repose (theta_r = atan(mu_s))', () => {
      // Wood on Wood: mu_s = 0.35 -> theta_r = atan(0.35) = 19.29 degrees
      const res = calculateInclinedPlanePhysics({
        blockMassGrams: 100,
        inclineAngleDeg: 15,
        surfacePair: 'wood-on-wood',
      });

      expect(res.angleReposeDeg).toBeCloseTo(19.29, 1);
      expect(res.isSlidingDownSpontaneously).toBe(false);

      // Increase angle above angle of repose
      const resSliding = calculateInclinedPlanePhysics({
        blockMassGrams: 100,
        inclineAngleDeg: 25,
        surfacePair: 'wood-on-wood',
      });
      expect(resSliding.isSlidingDownSpontaneously).toBe(true);
      expect(resSliding.downwardAccelerationMs2).toBeGreaterThan(0);
    });

    it('calculates minimum effort to pull block up the incline', () => {
      // P_up = mg sin(theta) + mu_s * mg cos(theta)
      const res = calculateInclinedPlanePhysics({
        blockMassGrams: 200,
        inclineAngleDeg: 30,
        surfacePair: 'wood-on-wood',
        pullingEffortGrams: 180, // ~1.76 N effort
      });

      expect(res.minimumEffortToPullUpN).toBeGreaterThan(res.parallelGravityN);
      expect(res.appliedEffortN).toBeCloseTo((180 * GRAVITY_STANDARD) / 1000, 2);
      expect(res.isMovingUpwards).toBe(res.appliedEffortN >= res.minimumEffortToPullUpN);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Hooke's Law and Spring Constant
  // --------------------------------------------------------------------------
  describe("Hooke's Law and Spring Constant", () => {
    it('verifies linear extension F = k * x in elastic regime', () => {
      // k = 20 N/m, mass = 100g (0.1 kg) -> F = 0.9807 N
      // x = 0.9807 / 20 = 0.04903 m = 49.03 mm
      const res = calculateHookesLaw({
        springConstantNpm: 20,
        appliedMassGrams: 50,
        hangerMassGrams: 50, // total 100g
        unstretchedLengthMm: 100,
      });

      expect(res.totalSuspendedMassGrams).toBe(100);
      expect(res.appliedForceN).toBeCloseTo(0.981, 2);
      expect(res.extensionMm).toBeCloseTo(49.03, 1);
      expect(res.totalLengthMm).toBeCloseTo(149.03, 1);
      expect(res.restoringForceN).toBeCloseTo(-0.981, 2);
      expect(res.isWithinElasticLimit).toBe(true);
      expect(res.isPlasticDeformation).toBe(false);
    });

    it('calculates elastic potential energy U = 0.5 * k * x^2', () => {
      // U = 0.5 * 25 * (0.04)^2 = 0.5 * 25 * 0.0016 = 0.02 J
      const res = calculateHookesLaw({
        springConstantNpm: 25,
        appliedMassGrams: 52.0,
        hangerMassGrams: 50, // ~102g -> ~1.0 N -> x approx 0.04 m
      });
      expect(res.elasticPotentialEnergyJoules).toBeGreaterThan(0.015);
      expect(res.elasticPotentialEnergyJoules).toBeLessThan(0.025);
    });

    it('computes dynamic oscillation period T = 2*pi*sqrt(m/k)', () => {
      const res = calculateHookesLaw({
        springConstantNpm: 25,
        appliedMassGrams: 100,
        hangerMassGrams: 50, // total 150g + 15g eff = 165g = 0.165 kg
      });
      // T = 2*pi*sqrt(0.165 / 25) = 2*pi*0.08124 = 0.510 s
      expect(res.dynamicPeriodSeconds).toBeCloseTo(0.51, 1);
      expect(res.dynamicFrequencyHz).toBeCloseTo(1 / res.dynamicPeriodSeconds, 1);
    });

    it('detects elastic limit exceedance and plastic deformation flag', () => {
      const resYield = calculateHookesLaw({
        springConstantNpm: 20,
        appliedMassGrams: 800, // 850g total -> F = 8.33 N > 6.0 N limit
        elasticLimitNewtons: 6.0,
      });

      expect(resYield.isWithinElasticLimit).toBe(false);
      expect(resYield.isPlasticDeformation).toBe(true);
      // Beyond elastic limit, extension is greater than linear extrapolation
      expect(resYield.extensionMm).toBeGreaterThan((6.0 / 20) * 1000);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Boyle's Law
  // --------------------------------------------------------------------------
  describe("Boyle's Law", () => {
    it('verifies P * V = constant for ideal gas compression', () => {
      // Baseline: V0 = 60 mL at P0 = 101.325 kPa -> C = 6079.5 kPa*mL
      // At V = 30 mL (half volume), P should double to ~202.65 kPa
      const res30 = calculateBoylesLaw({
        volumeMl: 30,
        referenceVolumeMl: 60,
        atmosphericPressureKpa: 101.325,
      });

      expect(res30.pressureKpa).toBeCloseTo(202.65, 1);
      expect(res30.pressureAtm).toBeCloseTo(2.0, 1);
      expect(res30.pressureMmHg).toBeCloseTo(1520.0, 0);
      expect(res30.pvProductKpaMl).toBeCloseTo(6079.5, 0);
      expect(res30.manometerDeltaHeightMmHg).toBeCloseTo(760.0, 0); // +760 mmHg differential
    });

    it('verifies P * V = constant for gas expansion', () => {
      // At V = 120 mL (double volume), P should halve to ~50.66 kPa
      const res120 = calculateBoylesLaw({
        volumeMl: 120,
        referenceVolumeMl: 60,
        atmosphericPressureKpa: 101.325,
      });

      expect(res120.pressureKpa).toBeCloseTo(50.66, 1);
      expect(res120.pressureAtm).toBeCloseTo(0.5, 1);
      expect(res120.pvProductKpaMl).toBeCloseTo(6079.5, 0);
      expect(res120.manometerDeltaHeightMmHg).toBeCloseTo(-380.0, 0); // -380 mmHg sub-atmospheric
    });

    it('enforces safe boundary limits preventing physical singularity at V = 0', () => {
      const resMin = calculateBoylesLaw({
        volumeMl: 2, // invalid small volume below minimum 10 mL
      });
      expect(resMin.volumeMl).toBe(10.0);
      expect(resMin.isVolumeValid).toBe(false);
      expect(Number.isFinite(resMin.pressureKpa)).toBe(true);
    });

    it('calculates reciprocal volume 1/V for linear graphical plotting', () => {
      const res = calculateBoylesLaw({ volumeMl: 50 });
      expect(res.reciprocalVolumePerMl).toBeCloseTo(0.02, 4);
      expect(res.reciprocalVolumePerLiter).toBeCloseTo(20.0, 1);
    });
  });
});
