import { describe, it, expect } from 'vitest';
import {
  calculateWireResistivity,
  calculateMetreBridge,
  calculateGalvanometerFom,
  calculateGalvanometerToVoltmeter,
  calculateGalvanometerToAmmeter,
  WIRE_MATERIAL_PRESETS,
} from '../src/services/physics/advancedElectromagnetismModel';

describe('Phase 5: Advanced Electromagnetism & Metrology Model Tests', () => {
  // --------------------------------------------------------------------------
  // 1. Resistivity of a Wire Using the V-I Method
  // --------------------------------------------------------------------------
  describe('Resistivity of a Wire Using the V-I Method', () => {
    it('calculates wire resistance and resistivity for standard Constantan wire', () => {
      // 100 cm constantan wire, diameter 0.50 mm, applied voltage 2.0 V
      // A = pi * (0.0005/2)^2 = 1.9635e-7 m^2
      // R = 4.9e-7 * 1.0 / 1.9635e-7 = 2.495 Ohm
      // I = 2.0 / 2.495 = 0.8015 A
      const res = calculateWireResistivity({
        material: 'constantan',
        wireLengthCm: 100,
        wireDiameterMm: 0.50,
        appliedVoltageVolts: 2.0,
      });

      expect(res.wireLengthMeters).toBe(1.0);
      expect(res.theoreticalResistanceOhms).toBeCloseTo(2.495, 2);
      expect(res.measuredCurrentAmps).toBeCloseTo(0.802, 2);
      expect(res.calculatedResistanceOhms).toBeCloseTo(2.495, 2);
      expect(res.calculatedResistivityOhmMeter).toBeCloseTo(4.9e-7, 8);
      expect(res.percentageError).toBeLessThan(0.5);
      expect(res.isValidDimensions).toBe(true);
    });

    it('verifies higher resistance for Nichrome wire and lower for Copper', () => {
      const nichrome = calculateWireResistivity({
        material: 'nichrome',
        wireLengthCm: 100,
        wireDiameterMm: 0.50,
        appliedVoltageVolts: 2.0,
      });
      const copper = calculateWireResistivity({
        material: 'copper',
        wireLengthCm: 100,
        wireDiameterMm: 0.50,
        appliedVoltageVolts: 2.0,
      });

      expect(nichrome.theoreticalResistanceOhms).toBeGreaterThan(copper.theoreticalResistanceOhms);
      expect(copper.measuredCurrentAmps).toBeGreaterThan(nichrome.measuredCurrentAmps);
      expect(nichrome.standardResistivityOhmMeter).toBe(WIRE_MATERIAL_PRESETS.nichrome.standardResistivityOhmMeter);
    });

    it('handles zero voltage gracefully without division by zero', () => {
      const res = calculateWireResistivity({
        material: 'constantan',
        wireLengthCm: 100,
        wireDiameterMm: 0.50,
        appliedVoltageVolts: 0.0,
      });
      expect(res.measuredCurrentAmps).toBe(0);
      expect(res.theoreticalResistanceOhms).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Metre Bridge – Unknown Resistance
  // --------------------------------------------------------------------------
  describe('Metre Bridge – Unknown Resistance', () => {
    it('calculates null point at exactly 50 cm when R = X', () => {
      // Known R = 10 Ohm, Unknown X = 10 Ohm -> Null point l = 50.0 cm
      const res = calculateMetreBridge({
        knownResistanceR: 10.0,
        unknownResistanceX: 10.0,
        jockeyPositionCm: 50.0,
      });

      expect(res.nullBalanceLengthCm).toBe(50.0);
      expect(res.isBalanced).toBe(true);
      expect(res.galvanometerDeflectionDivisions).toBe(0);
      expect(res.galvanometerVoltageMv).toBeCloseTo(0, 1);
      expect(res.calculatedUnknownX).toBeCloseTo(10.0, 1);
      expect(res.balanceStatus).toBe('null-balanced');
    });

    it('detects left vs right deflection when jockey is moved off-balance', () => {
      // Known R = 20 Ohm, Unknown X = 30 Ohm -> l_null = (100 * 20)/(20 + 30) = 40.0 cm
      const at30cm = calculateMetreBridge({
        knownResistanceR: 20.0,
        unknownResistanceX: 30.0,
        jockeyPositionCm: 30.0, // Left of null point
      });
      expect(at30cm.nullBalanceLengthCm).toBe(40.0);
      expect(at30cm.isBalanced).toBe(false);
      expect(at30cm.galvanometerDeflectionDivisions).toBeGreaterThan(0);
      expect(at30cm.balanceStatus).toBe('deflected-right');

      const at50cm = calculateMetreBridge({
        knownResistanceR: 20.0,
        unknownResistanceX: 30.0,
        jockeyPositionCm: 50.0, // Right of null point
      });
      expect(at50cm.isBalanced).toBe(false);
      expect(at50cm.galvanometerDeflectionDivisions).toBeLessThan(0);
      expect(at50cm.balanceStatus).toBe('deflected-left');
    });

    it('computes unknown resistance accurately from null balance length', () => {
      // If R = 15 Ohm and null point is found at l = 60.0 cm:
      // X = R * (100 - l) / l = 15 * (40 / 60) = 10.0 Ohm
      const res = calculateMetreBridge({
        knownResistanceR: 15.0,
        unknownResistanceX: 10.0,
        jockeyPositionCm: 60.0,
      });
      expect(res.nullBalanceLengthCm).toBe(60.0);
      expect(res.calculatedUnknownX).toBe(10.0);
      expect(res.percentageError).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Galvanometer Resistance and Figure of Merit
  // --------------------------------------------------------------------------
  describe('Galvanometer Resistance and Figure of Merit (Half Deflection Method)', () => {
    it('models half-deflection condition and calculates G and k', () => {
      // True G = 60 Ohm, k = 2.0e-5 A/div, N = 30 divisions
      // E = 2.0 V, R = 3273 Ohm
      // I_open = 2.0 / (3273 + 60) = 2.0 / 3333 = 6.0e-4 A = 30 divisions
      // With S = 61 Ohm (approx G):
      // G_calc = R * S / (R - S) = 3273 * 61 / (3273 - 61) = 199653 / 3212 = 62.15 Ohm
      const resOpen = calculateGalvanometerFom({
        galvanometerTrueResistanceG: 60.0,
        figureOfMeritK: 2.0e-5,
        highResistanceBoxR: 3273.0,
        lowShuntResistanceS: 60.0,
        isShuntKeyClosed: false,
        batteryEmfVolts: 2.0,
      });
      expect(resOpen.fullDeflectionThetaDivisions).toBe(30);
      expect(resOpen.isHalfDeflectionReached).toBe(false);

      const resShunt = calculateGalvanometerFom({
        galvanometerTrueResistanceG: 60.0,
        figureOfMeritK: 2.0e-5,
        highResistanceBoxR: 3273.0,
        lowShuntResistanceS: 60.0,
        isShuntKeyClosed: true,
        batteryEmfVolts: 2.0,
      });
      expect(resShunt.halfDeflectionThetaPrimeDivisions).toBe(15);
      expect(resShunt.isHalfDeflectionReached).toBe(true);
      expect(resShunt.calculatedGalvanometerResistanceG).toBeCloseTo(61.1, 0);
      expect(resShunt.calculatedFigureOfMeritK).toBeCloseTo(2.0e-5, 6);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Conversion of Galvanometer into a Voltmeter
  // --------------------------------------------------------------------------
  describe('Conversion of Galvanometer into a Voltmeter', () => {
    it('calculates series multiplier resistance Rs = (V / Ig) - G', () => {
      // G = 100 Ohm, k = 2.0e-5 A/div, N = 30 div -> Ig = 30 * 2.0e-5 = 6.0e-4 A (0.6 mA)
      // Desired range V = 3.0 V
      // Rs = (3.0 / 6.0e-4) - 100 = 5000 - 100 = 4900 Ohm
      const res = calculateGalvanometerToVoltmeter({
        galvanometerResistanceG: 100.0,
        figureOfMeritK: 2.0e-5,
        scaleDivisionsN: 30,
        targetMaxVoltageRangeVolts: 3.0,
        installedSeriesResistanceRs: 4900.0,
        appliedTestVoltageVolts: 1.5, // Half scale -> 15 divisions
      });

      expect(res.fullScaleCurrentIgAmps).toBeCloseTo(0.0006, 5);
      expect(res.requiredSeriesResistanceRs).toBe(4900.0);
      expect(res.isCorrectMultiplier).toBe(true);
      expect(res.totalMeterResistanceOhms).toBe(5000.0);
      expect(res.galvanometerDeflectionDivisions).toBe(15);
      expect(res.measuredVoltageVolts).toBe(1.5);
      expect(res.voltageErrorVolts).toBe(0.0);
      expect(res.isOverloaded).toBe(false);
    });

    it('detects voltage overload when applied voltage exceeds range', () => {
      const res = calculateGalvanometerToVoltmeter({
        galvanometerResistanceG: 100.0,
        figureOfMeritK: 2.0e-5,
        targetMaxVoltageRangeVolts: 3.0,
        installedSeriesResistanceRs: 4900.0,
        appliedTestVoltageVolts: 4.5, // 150% of range
      });

      expect(res.galvanometerDeflectionDivisions).toBe(30); // Pinned to full scale
      expect(res.isOverloaded).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Conversion of Galvanometer into an Ammeter
  // --------------------------------------------------------------------------
  describe('Conversion of Galvanometer into an Ammeter', () => {
    it('calculates parallel shunt resistance S = (Ig * G) / (I - Ig)', () => {
      // G = 50 Ohm, k = 2.0e-5 A/div, N = 30 div -> Ig = 6.0e-4 A
      // Desired current range I = 1.0 A
      // S = (6.0e-4 * 50) / (1.0 - 6.0e-4) = 0.030 / 0.9994 = 0.030018 Ohm (approx 0.030 Ohm)
      const res = calculateGalvanometerToAmmeter({
        galvanometerResistanceG: 50.0,
        figureOfMeritK: 2.0e-5,
        scaleDivisionsN: 30,
        targetMaxCurrentRangeAmps: 1.0,
        installedShuntResistanceS: 0.030,
        appliedCircuitCurrentAmps: 0.5, // Half scale -> 15 divisions
      });

      expect(res.fullScaleCurrentIgAmps).toBeCloseTo(0.0006, 5);
      expect(res.requiredShuntResistanceS).toBeCloseTo(0.030, 3);
      expect(res.isCorrectShunt).toBe(true);
      expect(res.galvanometerDeflectionDivisions).toBe(15);
      expect(res.measuredCurrentAmps).toBeCloseTo(0.5, 2);
      expect(res.isOverloaded).toBe(false);
    });

    it('detects current overload when circuit current exceeds maximum range', () => {
      const res = calculateGalvanometerToAmmeter({
        galvanometerResistanceG: 50.0,
        figureOfMeritK: 2.0e-5,
        targetMaxCurrentRangeAmps: 1.0,
        installedShuntResistanceS: 0.030,
        appliedCircuitCurrentAmps: 1.8, // 180% of rated range
      });

      expect(res.galvanometerDeflectionDivisions).toBe(30);
      expect(res.isOverloaded).toBe(true);
    });
  });
});
