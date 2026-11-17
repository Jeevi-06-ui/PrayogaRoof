import { describe, it, expect } from 'vitest';
import {
  calculateAcidIonisation,
  compareEquimolarAcids,
} from '../src/services/chemistry/acidStrengthModel';

describe('Phase 7: Strong vs Weak Acids Ionisation and Kinetics Model', () => {
  it('models complete 100% ionisation for 0.1M, 0.01M, and 0.001M Hydrochloric Acid', () => {
    const hcl01 = calculateAcidIonisation({ acidType: 'hydrochloric', concentrationM: 0.1 });
    expect(hcl01.isStrongAcid).toBe(true);
    expect(hcl01.degreeOfIonisationAlpha).toBe(1.0);
    expect(hcl01.percentIonisation).toBe(100.0);
    expect(hcl01.hydroniumConcentrationM).toBeCloseTo(0.1, 4);
    expect(hcl01.ph).toBe(1.0);

    const hcl001 = calculateAcidIonisation({ acidType: 'hydrochloric', concentrationM: 0.01 });
    expect(hcl001.hydroniumConcentrationM).toBeCloseTo(0.01, 4);
    expect(hcl001.ph).toBe(2.0);

    const hcl0001 = calculateAcidIonisation({ acidType: 'hydrochloric', concentrationM: 0.001 });
    expect(hcl0001.hydroniumConcentrationM).toBeCloseTo(0.001, 4);
    expect(hcl0001.ph).toBe(3.0);
  });

  it('calculates partial equilibrium dissociation of Acetic Acid and verifies Ostwald dilution law', () => {
    // 0.1M CH3COOH: α ≈ √(Ka / C) = √(1.75e-5 / 0.1) ≈ 0.0132
    const eth01 = calculateAcidIonisation({ acidType: 'acetic', concentrationM: 0.1 });
    expect(eth01.isStrongAcid).toBe(false);
    expect(eth01.degreeOfIonisationAlpha).toBeCloseTo(0.0132, 3);
    expect(eth01.percentIonisation).toBeCloseTo(1.32, 1);
    expect(eth01.ph).toBeCloseTo(2.88, 1);

    // 0.01M CH3COOH: α increases to ~4.1% upon tenfold dilution (Ostwald's law)
    const eth001 = calculateAcidIonisation({ acidType: 'acetic', concentrationM: 0.01 });
    expect(eth001.degreeOfIonisationAlpha).toBeGreaterThan(eth01.degreeOfIonisationAlpha);
    expect(eth001.percentIonisation).toBeCloseTo(4.1, 1);
    expect(eth001.ph).toBeCloseTo(3.38, 1);

    // 0.001M CH3COOH: α increases further to ~12.4%
    const eth0001 = calculateAcidIonisation({ acidType: 'acetic', concentrationM: 0.001 });
    expect(eth0001.degreeOfIonisationAlpha).toBeGreaterThan(eth001.degreeOfIonisationAlpha);
    expect(eth0001.percentIonisation).toBeGreaterThan(10.0);
  });

  it('compares equimolar solutions and demonstrates [H+] ratio of ~76x at 0.1M', () => {
    const comparison = compareEquimolarAcids(0.1);
    expect(comparison.strongAcid.ph).toBe(1.0);
    expect(comparison.weakAcid.ph).toBeCloseTo(2.88, 1);
    expect(comparison.hydroniumRatio).toBeCloseTo(76.1, 1);
    expect(comparison.rateRatio).toBeGreaterThan(50.0);
  });

  it('confirms stoichiometric conservation: equal moles of HCl and CH3COOH yield equal total H2 gas with Mg', () => {
    const hcl = calculateAcidIonisation({ acidType: 'hydrochloric', concentrationM: 0.1, volumeMl: 50.0 });
    const eth = calculateAcidIonisation({ acidType: 'acetic', concentrationM: 0.1, volumeMl: 50.0 });

    // Both react with limiting 1.0 mmol Mg ribbon to give 24.0 mL H2 gas
    expect(hcl.magnesiumReaction.totalH2GasVolumeMl).toBe(24.0);
    expect(eth.magnesiumReaction.totalH2GasVolumeMl).toBe(24.0);

    // But rate in HCl is much faster than CH3COOH
    expect(hcl.magnesiumReaction.effervescenceIntensity).toBe('vigorous');
    expect(eth.magnesiumReaction.effervescenceIntensity).toBe('gentle');
    expect(hcl.magnesiumReaction.estimatedReactionDurationSec).toBeLessThan(
      eth.magnesiumReaction.estimatedReactionDurationSec
    );
  });
});
