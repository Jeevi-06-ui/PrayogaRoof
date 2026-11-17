import { describe, it, expect } from 'vitest';
import {
  calculateTitrationState,
  generateTitrationCurve,
} from '../src/services/chemistry/titrationModel';

describe('Acid-Base Titration Model (Class 11)', () => {
  describe('Oxalic Acid vs NaOH (Diprotic Weak Acid vs Strong Base)', () => {
    it('calculates initial pH of 0.1M oxalic acid before titration begins', () => {
      const state = calculateTitrationState({
        system: 'oxalic-acid-naoh',
        analyteVolumeMl: 20.0,
        analyteMolarityM: 0.1,
        titrantMolarityM: 0.1,
        titrantDeliveredMl: 0.0,
      });

      expect(state.ph).toBeLessThan(2.0);
      expect(state.isAtEndpoint).toBe(false);
      expect(state.status).toBe('before-equivalence');
      expect(state.solutionColorHex).toBe('#f8fafc'); // Colorless
      expect(state.equivalenceVolumeMl).toBe(40.0); // 2 * 0.1 * 20 / 0.1 = 40 mL
    });

    it('detects equivalence endpoint at 40.0 mL with permanent pale pink color', () => {
      const state = calculateTitrationState({
        system: 'oxalic-acid-naoh',
        analyteVolumeMl: 20.0,
        analyteMolarityM: 0.1,
        titrantMolarityM: 0.1,
        titrantDeliveredMl: 40.0,
        indicator: 'phenolphthalein',
      });

      expect(state.isAtEndpoint).toBe(true);
      expect(state.status).toBe('at-equivalence');
      expect(state.ph).toBeGreaterThanOrEqual(8.2);
      expect(state.ph).toBeLessThanOrEqual(9.0);
      expect(state.solutionColorHex).toBe('#fbcfe8'); // Pale pink
      expect(state.indicatorColorName).toContain('Pale Pink');
      expect(state.observation).toContain('ENDPOINT REACHED');
    });

    it('identifies over-titrated alkaline solution with magenta coloration', () => {
      const state = calculateTitrationState({
        system: 'oxalic-acid-naoh',
        analyteVolumeMl: 20.0,
        analyteMolarityM: 0.1,
        titrantMolarityM: 0.1,
        titrantDeliveredMl: 45.0,
        indicator: 'phenolphthalein',
      });

      expect(state.isAtEndpoint).toBe(false);
      expect(state.status).toBe('past-equivalence');
      expect(state.ph).toBeGreaterThan(11.0);
      expect(state.solutionColorHex).toBe('#ec4899'); // Deep magenta
    });
  });

  describe('HCl vs NaOH (Strong Acid vs Strong Base)', () => {
    it('calculates equivalence point at 20.0 mL with pH 7.0', () => {
      const state = calculateTitrationState({
        system: 'hcl-naoh',
        analyteVolumeMl: 20.0,
        analyteMolarityM: 0.1,
        titrantMolarityM: 0.1,
        titrantDeliveredMl: 20.0,
      });

      expect(state.equivalenceVolumeMl).toBe(20.0);
      expect(state.ph).toBe(7.0);
      expect(state.isAtEndpoint).toBe(true);
    });

    it('supports methyl orange indicator transitions', () => {
      const acidic = calculateTitrationState({
        system: 'hcl-naoh',
        titrantDeliveredMl: 0.0,
        indicator: 'methyl-orange',
      });
      expect(acidic.solutionColorHex).toBe('#ef4444'); // Red

      const alkaline = calculateTitrationState({
        system: 'hcl-naoh',
        titrantDeliveredMl: 30.0,
        indicator: 'methyl-orange',
      });
      expect(alkaline.solutionColorHex).toBe('#eab308'); // Bright Yellow
    });
  });

  it('generates smooth titration curve data points', () => {
    const points = generateTitrationCurve('oxalic-acid-naoh', 20.0, 0.1, 0.1, 50.0);
    expect(points.length).toBeGreaterThan(50);
    expect(points[0].volumeMl).toBe(0);
    expect(points[0].ph).toBeLessThan(3.0);
    expect(points[points.length - 1].ph).toBeGreaterThan(10.0);
  });
});
