import { describe, it, expect } from 'vitest';
import {
  ORGANIC_COMPOUND_CATALOGUE,
  runOrganicElementTest,
} from '../src/services/chemistry/organicElementModel';

describe('Qualitative Detection of Elements in Organic Compounds (Class 11)', () => {
  it('detects Nitrogen in Urea using Prussian Blue test', () => {
    const urea = ORGANIC_COMPOUND_CATALOGUE['urea'];
    expect(urea.elementsPresent.nitrogen).toBe(true);
    expect(urea.elementsPresent.sulphur).toBe(false);

    const nTest = runOrganicElementTest('urea', 'nitrogen-prussian-blue');
    expect(nTest.isPositive).toBe(true);
    expect(nTest.precipitateLabel).toContain('Prussian Blue');

    const sTest = runOrganicElementTest('urea', 'sulphur-nitroprusside');
    expect(sTest.isPositive).toBe(false);
  });

  it('detects both Nitrogen and Sulphur in Thiourea', () => {
    const nTest = runOrganicElementTest('thiourea', 'nitrogen-prussian-blue');
    expect(nTest.isPositive).toBe(true);

    const sNitro = runOrganicElementTest('thiourea', 'sulphur-nitroprusside');
    expect(sNitro.isPositive).toBe(true);
    expect(sNitro.precipitateLabel?.toLowerCase()).toContain('purple');

    const sLead = runOrganicElementTest('thiourea', 'sulphur-lead-acetate');
    expect(sLead.isPositive).toBe(true);
    expect(sLead.precipitateLabel).toContain('PbS');
  });

  it('differentiates halogens: Chlorine (white AgCl), Bromine (pale yellow AgBr), and Iodine (yellow AgI)', () => {
    const clTest = runOrganicElementTest('chlorobenzene', 'halogen-silver-nitrate');
    expect(clTest.isPositive).toBe(true);
    expect(clTest.precipitateLabel).toContain('White curdy AgCl');

    const brTest = runOrganicElementTest('bromobenzene', 'halogen-silver-nitrate');
    expect(brTest.isPositive).toBe(true);
    expect(brTest.precipitateLabel).toContain('Pale yellow AgBr');

    const iTest = runOrganicElementTest('iodobenzene', 'halogen-silver-nitrate');
    expect(iTest.isPositive).toBe(true);
    expect(iTest.precipitateLabel).toContain('Bright yellow AgI');
  });

  it('confirms negative tests for pure Benzoic Acid (C, H, O only)', () => {
    const nTest = runOrganicElementTest('benzoic-acid', 'nitrogen-prussian-blue');
    expect(nTest.isPositive).toBe(false);

    const sTest = runOrganicElementTest('benzoic-acid', 'sulphur-nitroprusside');
    expect(sTest.isPositive).toBe(false);

    const hTest = runOrganicElementTest('benzoic-acid', 'halogen-silver-nitrate');
    expect(hTest.isPositive).toBe(false);
  });
});
