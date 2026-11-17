import { describe, it, expect } from 'vitest';
import {
  createContainerWithSubstance,
  transferLiquid,
  stirContainer,
} from '../src/services/chemistry/chemistryEngine';
import { evaluateIndicatorColor } from '../src/services/chemistry/chemicalRegistry';

describe('Phase 5: Chemical Reactions, Neutralization & Indicator Color Transitions', () => {
  describe('Stoichiometric Neutralization: HCl + NaOH -> NaCl + H2O', () => {
    it('achieves exact neutral pH = 7.0 when equal moles of 0.1M HCl and 0.1M NaOH are combined', () => {
      // Container A: 50 mL of 0.1M HCl (0.005 moles H+)
      const acidContainer = createContainerWithSubstance('hcl', 50, 250);
      // Container B: 50 mL of 0.1M NaOH (0.005 moles OH-)
      const baseContainer = createContainerWithSubstance('naoh', 50, 250);

      // Pour 50 mL of NaOH into the acid container
      const result = transferLiquid(baseContainer, acidContainer, 50);
      expect(result.success).toBe(true);

      const mixedState = result.destinationNewState;
      expect(mixedState.totalVolumeMl).toBe(100);
      expect(mixedState.ph).toBe(7.0);
      expect(mixedState.reactionState).toBe('neutralized');
      expect(mixedState.observationText).toContain('Neutralization Complete');
    });

    it('exhibits exothermic temperature rise during neutralization', () => {
      const acidContainer = createContainerWithSubstance('hcl', 50, 250);
      const baseContainer = createContainerWithSubstance('naoh', 50, 250);

      const initialTemp = acidContainer.temperatureC; // 25.0 °C
      const result = transferLiquid(baseContainer, acidContainer, 50);

      const mixedState = result.destinationNewState;
      // Neutralization of 0.005 moles in 100 mL releases heat
      expect(mixedState.temperatureC).toBeGreaterThan(initialTemp);
    });

    it('remains acidic (pH < 7.0) when acid is in stoichiometric excess', () => {
      // 50 mL of 0.1M HCl (0.005 mol H+) + 20 mL of 0.1M NaOH (0.002 mol OH-)
      const acidContainer = createContainerWithSubstance('hcl', 50, 250);
      const baseContainer = createContainerWithSubstance('naoh', 50, 250);

      const result = transferLiquid(baseContainer, acidContainer, 20);
      const mixedState = result.destinationNewState;

      // Net H+ = 0.003 mol in 70 mL -> [H+] ≈ 0.0428 M -> pH ≈ 1.37
      expect(mixedState.ph).toBeLessThan(7.0);
      expect(mixedState.ph).toBeGreaterThan(1.0);
      expect(mixedState.reactionState).toBe('acid-shifted');
    });

    it('becomes basic (pH > 7.0) when base is in stoichiometric excess', () => {
      // 20 mL of 0.1M HCl (0.002 mol H+) + 50 mL of 0.1M NaOH (0.005 mol OH-)
      const baseContainer = createContainerWithSubstance('naoh', 50, 250);
      const acidContainer = createContainerWithSubstance('hcl', 50, 250);

      const result = transferLiquid(acidContainer, baseContainer, 20);
      const mixedState = result.destinationNewState;

      // Net OH- = 0.003 mol in 70 mL -> [OH-] ≈ 0.0428 M -> pOH ≈ 1.37 -> pH ≈ 12.63
      expect(mixedState.ph).toBeGreaterThan(7.0);
      expect(mixedState.reactionState).toBe('base-shifted');
    });
  });

  describe('Universal Indicator Spectrum Rules', () => {
    it('returns scarlet/red for strongly acidic pH <= 2', () => {
      const shift1 = evaluateIndicatorColor('universal', 1.0);
      expect(shift1.label).toContain('Scarlet Red');
      expect(shift1.color.toLowerCase()).toBe('#ef4444');
    });

    it('returns orange/yellow for weakly acidic pH 3 to 6', () => {
      const shift3 = evaluateIndicatorColor('universal', 3.5);
      expect(shift3.label).toContain('Orange');
      const shift6 = evaluateIndicatorColor('universal', 5.5);
      expect(shift6.label).toContain('Yellow');
    });

    it('returns emerald green for neutral pH = 7.0', () => {
      const shift7 = evaluateIndicatorColor('universal', 7.0);
      expect(shift7.label).toContain('Emerald Green');
      expect(shift7.color.toLowerCase()).toBe('#22c55e');
    });

    it('returns blue to violet for basic pH 8 to 14', () => {
      const shift9 = evaluateIndicatorColor('universal', 9.0);
      expect(shift9.label).toContain('Blue');
      const shift13 = evaluateIndicatorColor('universal', 13.0);
      expect(shift13.label).toContain('Deep Violet');
    });
  });

  describe('Natural Indicator 1: Turmeric (Curcumin)', () => {
    it('remains yellow in acidic and neutral solutions (pH < 7.5)', () => {
      const acidShift = evaluateIndicatorColor('turmeric', 2.0);
      expect(acidShift.label).toContain('Bright Yellow');
      expect(acidShift.color.toLowerCase()).toBe('#eab308');

      const neutralShift = evaluateIndicatorColor('turmeric', 7.0);
      expect(neutralShift.label).toContain('Bright Yellow');
    });

    it('shifts to deep reddish-brown in basic solutions (pH >= 7.5)', () => {
      const baseShift = evaluateIndicatorColor('turmeric', 8.5);
      expect(baseShift.label).toContain('Reddish-Brown');
      expect(baseShift.color.toLowerCase()).toBe('#991b1b');

      const strongBaseShift = evaluateIndicatorColor('turmeric', 13.0);
      expect(strongBaseShift.label).toContain('Reddish-Brown');
    });

    it('demonstrates reversible chromic shift when base is neutralized by acid', () => {
      // Step 1: Base beaker with turmeric turns reddish-brown
      const baseBeaker = createContainerWithSubstance('naoh', 40, 250);
      const turmericStock = createContainerWithSubstance('turmeric-indicator', 10, 100);

      // Add 5 mL turmeric to base beaker
      const turnRedResult = transferLiquid(turmericStock, baseBeaker, 5);
      expect(turnRedResult.destinationNewState.ph).toBeGreaterThan(7.5);
      expect(turnRedResult.destinationNewState.color.toLowerCase()).toBe('#991b1b'); // Red-brown
      expect(turnRedResult.destinationNewState.observationText).toContain('Deep reddish-brown');

      // Step 2: Add excess HCl to neutralize and acidify
      const acidStock = createContainerWithSubstance('hcl', 80, 250);
      const neutralizedResult = transferLiquid(acidStock, turnRedResult.destinationNewState, 60);

      // Reversible shift: pH is now acidic (< 7.0), color reverts to yellow!
      expect(neutralizedResult.destinationNewState.ph).toBeLessThan(7.0);
      expect(neutralizedResult.destinationNewState.color.toLowerCase()).toBe('#eab308'); // Yellow restored
      expect(neutralizedResult.destinationNewState.observationText).toContain('Retains yellow color');
    });
  });

  describe('Natural Indicator 2: Red Cabbage (Anthocyanin)', () => {
    it('displays full 5-tier anthocyanin color transitions', () => {
      // 1. Strong acid: Red
      const red = evaluateIndicatorColor('red-cabbage', 1.5);
      expect(red.label).toContain('Bright Red');
      expect(red.color.toLowerCase()).toBe('#dc2626');

      // 2. Mild acid: Pink
      const pink = evaluateIndicatorColor('red-cabbage', 4.0);
      expect(pink.label).toContain('Pink');
      expect(pink.color.toLowerCase()).toBe('#d946ef');

      // 3. Neutral: Purple/Violet
      const purple = evaluateIndicatorColor('red-cabbage', 7.0);
      expect(purple.label).toContain('Purple');
      expect(purple.color.toLowerCase()).toBe('#9333ea');

      // 4. Weak alkali: Blue
      const blueGreen = evaluateIndicatorColor('red-cabbage', 9.0);
      expect(blueGreen.label).toContain('Blue');
      expect(blueGreen.color.toLowerCase()).toBe('#0284c7');

      // 5. Strong alkali: Greenish-yellow
      const greenYellow = evaluateIndicatorColor('red-cabbage', 12.0);
      expect(greenYellow.label).toContain('Green');
      expect(greenYellow.color.toLowerCase()).toBe('#16a34a');
    });
  });

  describe('Solution Agitation with Stirrer', () => {
    it('sets container state to stirred and maintains chemical equilibrium', () => {
      const container = createContainerWithSubstance('hcl', 50, 100);
      const stirred = stirContainer(container);
      expect(stirred.isStirred).toBe(true);
      expect(stirred.ph).toBe(container.ph);
    });
  });
});
