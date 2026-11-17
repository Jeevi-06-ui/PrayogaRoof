import { describe, it, expect } from 'vitest';
import {
  calculateFeSCNEquilibrium,
  calculateNO2N2O4Equilibrium,
} from '../src/services/chemistry/equilibriumModel';

describe('Chemical Equilibrium Models (Class 11)', () => {
  describe('Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺ (Solution Complex)', () => {
    it('calculates standard room temperature equilibrium state', () => {
      const state = calculateFeSCNEquilibrium({ temperatureC: 25 });
      expect(state.system).toBe('fe-scn');
      expect(state.temperatureC).toBe(25);
      expect(state.kc).toBeGreaterThan(100);
      expect(state.equilibriumComplexM).toBeGreaterThan(0);
      expect(state.absorbance450nm).toBeGreaterThan(0);
      expect(state.colorHex).toBe('#dc2626');
    });

    it('shifts forward and intensifies blood-red color upon adding Fe³⁺', () => {
      const standard = calculateFeSCNEquilibrium();
      const perturbed = calculateFeSCNEquilibrium({ addedFe3PlusM: 0.005 });
      expect(perturbed.equilibriumComplexM).toBeGreaterThan(standard.equilibriumComplexM);
      expect(perturbed.absorbance450nm).toBeGreaterThan(standard.absorbance450nm);
      expect(perturbed.shiftDirection).toBe('forward');
      expect(perturbed.colorHex).toBe('#7f1d1d');
    });

    it('shifts forward when cooled due to exothermic nature (ΔH° < 0)', () => {
      const coldState = calculateFeSCNEquilibrium({ temperatureC: 5 });
      const standardState = calculateFeSCNEquilibrium({ temperatureC: 25 });
      expect(coldState.kc).toBeGreaterThan(standardState.kc);
      expect(coldState.shiftDirection).toBe('forward');
    });

    it('decolorizes blood-red solution when Fluoride is added by sequestering Fe³⁺', () => {
      const state = calculateFeSCNEquilibrium({ addedFluorideM: 0.01 });
      expect(state.shiftDirection).toBe('reverse');
      expect(state.colorHex).toBe('#fef08a');
      expect(state.opticalAppearance).toContain('[FeF₆]³⁻');
    });
  });

  describe('2NO₂(g) ⇌ N₂O₄(g) (Gas Equilibrium)', () => {
    it('calculates standard room temperature gaseous equilibrium', () => {
      const state = calculateNO2N2O4Equilibrium({ temperatureC: 25, volumeLiters: 1.0 });
      expect(state.system).toBe('no2-n2o4');
      expect(state.kp).toBeGreaterThan(5);
      expect(state.totalPressureAtm).toBeGreaterThan(0);
      expect(state.molesNO2).toBeGreaterThan(0);
      expect(state.molesN2O4).toBeGreaterThan(0);
    });

    it('shifts forward toward fewer gas moles (N₂O₄) upon volume compression', () => {
      const compressed = calculateNO2N2O4Equilibrium({ volumeLiters: 0.5 });
      expect(compressed.shiftDirection).toBe('forward');
      expect(compressed.explanation).toContain('fewer gas moles');
    });

    it('shifts reverse toward dark brown NO₂ upon heating', () => {
      const hotState = calculateNO2N2O4Equilibrium({ temperatureC: 80 });
      expect(hotState.shiftDirection).toBe('reverse');
      expect(hotState.colorHex).toBe('#78350f');
      expect(hotState.explanation).toContain('endothermic reverse direction');
    });

    it('shifts forward toward colorless N₂O₄ upon chilling', () => {
      const chilledState = calculateNO2N2O4Equilibrium({ temperatureC: 0 });
      expect(chilledState.shiftDirection).toBe('forward');
      expect(chilledState.colorHex).toBe('#fef08a');
    });
  });
});
