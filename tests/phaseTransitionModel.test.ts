import { describe, it, expect } from 'vitest';
import {
  calculateMeltingPointState,
  calculateBoilingPointState,
  ORGANIC_LIQUID_SAMPLES,
} from '../src/services/chemistry/phaseTransitionModel';

describe('Phase 7: Phase Transition Models (Melting and Boiling Point)', () => {
  describe('Melting Point Determination Model', () => {
    it('verifies pure Benzoic Acid stays solid below 122°C and melts sharply at 122.4°C', () => {
      // Below melting point
      const solid = calculateMeltingPointState({
        sampleId: 'benzoic-acid',
        currentTemperatureC: 100.0,
      });
      expect(solid.phaseState).toBe('solid');
      expect(solid.liquidFraction).toBe(0.0);
      expect(solid.isMeltingComplete).toBe(false);

      // In the melting interval (122.0 - 122.8°C)
      const softening = calculateMeltingPointState({
        sampleId: 'benzoic-acid',
        currentTemperatureC: 122.4,
      });
      expect(softening.phaseState).toBe('softening');
      expect(softening.liquidFraction).toBeGreaterThan(0.0);
      expect(softening.liquidFraction).toBeLessThan(1.0);
      expect(softening.isMeltingUnderway).toBe(true);

      // Above melting point
      const liquid = calculateMeltingPointState({
        sampleId: 'benzoic-acid',
        currentTemperatureC: 125.0,
      });
      expect(liquid.phaseState).toBe('liquid');
      expect(liquid.liquidFraction).toBe(1.0);
      expect(liquid.isMeltingComplete).toBe(true);
    });

    it('models melting range depression for impure samples (Raoult / cryoscopic depression)', () => {
      const pure = calculateMeltingPointState({
        sampleId: 'benzoic-acid',
        currentTemperatureC: 117.0,
      });
      expect(pure.phaseState).toBe('solid'); // Pure benzoic acid is completely solid at 117°C

      const impure = calculateMeltingPointState({
        sampleId: 'impure-benzoic-acid',
        currentTemperatureC: 117.0,
      });
      // Impure sample melts between 114.5 and 118.5°C
      expect(impure.phaseState).toBe('softening');
      expect(impure.isDepressedMeltingRange).toBe(true);
      expect(impure.sample.impurityDepressionC).toBeCloseTo(5.9, 1);
    });

    it('verifies distinct sharp melting points for Urea and Naphthalene', () => {
      const ureaMelt = calculateMeltingPointState({
        sampleId: 'urea',
        currentTemperatureC: 133.0,
      });
      expect(ureaMelt.sample.trueMeltingPointC).toBe(133.0);
      expect(ureaMelt.phaseState).toBe('softening');

      const naphMelt = calculateMeltingPointState({
        sampleId: 'naphthalene',
        currentTemperatureC: 80.2,
      });
      expect(naphMelt.sample.trueMeltingPointC).toBe(80.2);
      expect(naphMelt.phaseState).toBe('softening');
    });
  });

  describe('Boiling Point Determination Model', () => {
    it('models ethanol vapor pressure and continuous bubble stream at 78.3°C', () => {
      // Sub-boiling at 50°C
      const sub = calculateBoilingPointState({
        liquidId: 'ethanol',
        currentTemperatureC: 50.0,
        isHeating: true,
      });
      expect(sub.boilingState).toBe('sub-boiling');
      expect(sub.isBoiling).toBe(false);
      expect(sub.vaporPressureKPa).toBeLessThan(101.325);

      // Pre-boiling (trapped air bubbles) at 70°C
      const pre = calculateBoilingPointState({
        liquidId: 'ethanol',
        currentTemperatureC: 70.0,
        isHeating: true,
      });
      expect(pre.boilingState).toBe('trapped-air-bubbles');
      expect(pre.isBoiling).toBe(false);

      // Continuous boiling at 78.3°C
      const boil = calculateBoilingPointState({
        liquidId: 'ethanol',
        currentTemperatureC: 78.5,
        isHeating: true,
      });
      expect(boil.boilingState).toBe('continuous-vapor-stream');
      expect(boil.isBoiling).toBe(true);
      expect(boil.bubbleFrequencyHz).toBeGreaterThan(5.0);
      expect(boil.vaporPressureKPa).toBeGreaterThanOrEqual(100.0);
    });

    it('simulates liquid re-entry into capillary upon cooling (boiling point capture)', () => {
      const cool = calculateBoilingPointState({
        liquidId: 'ethanol',
        currentTemperatureC: 78.0,
        isHeating: false,
        previouslyReachedBoiling: true,
      });
      expect(cool.boilingState).toBe('liquid-re-entry');
      expect(cool.isLiquidReEntryCaptured).toBe(true);
      expect(cool.status).toContain('LIQUID RE-ENTRY CAPTURED');
    });

    it('computes Clausius-Clapeyron atmospheric pressure correction for high/low barometric pressures', () => {
      // Standard pressure: 101.325 kPa => Water Tb = 100.0°C
      const std = calculateBoilingPointState({
        liquidId: 'water',
        currentTemperatureC: 100.0,
        ambientPressureKPa: 101.325,
      });
      expect(std.pressureCorrectedBoilingPointC).toBeCloseTo(100.0, 1);

      // Lower pressure at high altitude: 85.0 kPa => Water Tb < 100°C (~95°C)
      const alt = calculateBoilingPointState({
        liquidId: 'water',
        currentTemperatureC: 95.0,
        ambientPressureKPa: 85.0,
      });
      expect(alt.pressureCorrectedBoilingPointC).toBeLessThan(100.0);
      expect(alt.pressureCorrectedBoilingPointC).toBeGreaterThan(90.0);
    });

    it('verifies normal boiling points for volatile solvents (Acetone, Ethyl Acetate)', () => {
      expect(ORGANIC_LIQUID_SAMPLES['acetone'].normalBoilingPointC).toBe(56.1);
      expect(ORGANIC_LIQUID_SAMPLES['ethyl-acetate'].normalBoilingPointC).toBe(77.1);
    });
  });
});
