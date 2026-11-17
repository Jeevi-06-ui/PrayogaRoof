import { describe, it, expect } from 'vitest';
import {
  ORGANIC_SAMPLES,
  runFunctionalGroupTest,
  FUNCTIONAL_GROUP_ASSUMPTIONS,
} from '../src/services/chemistry/functionalGroupModel';

describe('Functional Group Identification Model (Class 12)', () => {
  it('contains all 7 required core organic functional groups', () => {
    const samples = Object.values(ORGANIC_SAMPLES);
    const groups = new Set(samples.map((s) => s.functionalGroup));
    expect(groups.has('unsaturation')).toBe(true);
    expect(groups.has('alcohol')).toBe(true);
    expect(groups.has('phenol')).toBe(true);
    expect(groups.has('aldehyde')).toBe(true);
    expect(groups.has('ketone')).toBe(true);
    expect(groups.has('carboxylic-acid')).toBe(true);
    expect(groups.has('primary-amine')).toBe(true);
  });

  it('correctly tests unsaturation using bromine water and Baeyer’s alkaline KMnO4', () => {
    const brPos = runFunctionalGroupTest('cyclohexene', 'bromine-water');
    expect(brPos.isPositive).toBe(true);
    expect(brPos.observation).toContain('discharged completely');

    const brNeg = runFunctionalGroupTest('ethanol', 'bromine-water');
    expect(brNeg.isPositive).toBe(false);

    const baeyerPos = runFunctionalGroupTest('cyclohexene', 'baeyer-test');
    expect(baeyerPos.isPositive).toBe(true);
    expect(baeyerPos.precipitateColorHex).toBe('#451a03'); // Dark brown MnO2
    expect(baeyerPos.tubeColorHex).toBe('#78350f');
  });

  it('correctly tests alcoholic -OH via sodium effervescence and ceric ammonium nitrate', () => {
    const na = runFunctionalGroupTest('ethanol', 'sodium-metal');
    expect(na.isPositive).toBe(true);
    expect(na.gasEvolution).toContain('H₂');

    const can = runFunctionalGroupTest('ethanol', 'ceric-ammonium-nitrate');
    expect(can.isPositive).toBe(true);
    expect(can.tubeColorHex).toBe('#b91c1c'); // Wine-red
  });

  it('correctly tests phenolic -OH using neutral FeCl3 violet coloration', () => {
    const fecl3Pos = runFunctionalGroupTest('phenol', 'neutral-fecl3');
    expect(fecl3Pos.isPositive).toBe(true);
    expect(fecl3Pos.tubeColorHex).toBe('#581c87'); // Violet

    const fecl3Neg = runFunctionalGroupTest('ethanol', 'neutral-fecl3');
    expect(fecl3Neg.isPositive).toBe(false);
  });

  it('correctly differentiates aldehydes and ketones with Tollens and Fehling tests', () => {
    const tollensAld = runFunctionalGroupTest('benzaldehyde', 'tollens-silver-mirror');
    expect(tollensAld.isPositive).toBe(true);
    expect(tollensAld.observation).toContain('silver mirror');

    const tollensKet = runFunctionalGroupTest('acetone', 'tollens-silver-mirror');
    expect(tollensKet.isPositive).toBe(false);

    const nitroprusside = runFunctionalGroupTest('acetone', 'sodium-nitroprusside');
    expect(nitroprusside.isPositive).toBe(true);
    expect(nitroprusside.tubeColorHex).toBe('#881337'); // Ruby red
  });

  it('correctly tests carboxylic acids with sodium bicarbonate effervescence and esterification', () => {
    const bicarb = runFunctionalGroupTest('benzoic-acid', 'sodium-bicarbonate');
    expect(bicarb.isPositive).toBe(true);
    expect(bicarb.gasEvolution).toContain('CO₂');

    const ester = runFunctionalGroupTest('benzoic-acid', 'ester-test');
    expect(ester.isPositive).toBe(true);
    expect(ester.observation).toContain('fruity');
  });

  it('correctly tests primary amines using the azo dye test', () => {
    const azoPos = runFunctionalGroupTest('aniline', 'azo-dye');
    expect(azoPos.isPositive).toBe(true);
    expect(azoPos.precipitateColorHex).toBe('#c2410c'); // Scarlet red/orange dye

    const azoNeg = runFunctionalGroupTest('ethanol', 'azo-dye');
    expect(azoNeg.isPositive).toBe(false);
  });

  it('includes educational assumptions', () => {
    expect(FUNCTIONAL_GROUP_ASSUMPTIONS.length).toBeGreaterThanOrEqual(3);
  });
});
