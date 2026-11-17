import { describe, it, expect } from 'vitest';
import {
  calculateColloidState,
  SOL_CATALOG,
  ELECTROLYTE_CATALOG,
  COLLOID_ASSUMPTIONS,
} from '../src/services/chemistry/colloidModel';

describe('Colloid & Surface Chemistry Model', () => {
  it('correctly retrieves catalog entries for lyophilic, lyophobic, and true solutions', () => {
    expect(SOL_CATALOG['feoh3-sol'].category).toBe('lyophobic');
    expect(SOL_CATALOG['feoh3-sol'].charge).toBe('positive');
    expect(SOL_CATALOG['starch-sol'].category).toBe('lyophilic');
    expect(SOL_CATALOG['as2s3-sol'].category).toBe('lyophobic');
    expect(SOL_CATALOG['as2s3-sol'].charge).toBe('negative');
    expect(SOL_CATALOG['true-solution-nacl'].category).toBe('true-solution');
    expect(ELECTROLYTE_CATALOG['k4fe_cn6'].anion.valence).toBe(4);
  });

  it('evaluates Tyndall scattering effect correctly', () => {
    // True solution: 0% Tyndall scattering even with laser active
    const trueSol = calculateColloidState({
      solType: 'true-solution-nacl',
      laserActive: true,
      electrolyte: 'none',
    });
    expect(trueSol.tyndallIntensityPercent).toBe(0);
    expect(trueSol.tyndallConeVisible).toBe(false);
    expect(trueSol.tyndallObservation).toContain('No Tyndall effect');

    // Fe(OH)3 lyophobic sol: High Tyndall scattering with laser
    const feSol = calculateColloidState({
      solType: 'feoh3-sol',
      laserActive: true,
      electrolyte: 'none',
    });
    expect(feSol.tyndallIntensityPercent).toBeGreaterThan(80);
    expect(feSol.tyndallConeVisible).toBe(true);
    expect(feSol.tyndallObservation).toContain('Intense Tyndall effect');

    // Laser off
    const feSolOff = calculateColloidState({
      solType: 'feoh3-sol',
      laserActive: false,
      electrolyte: 'none',
    });
    expect(feSolOff.tyndallIntensityPercent).toBe(0);
    expect(feSolOff.tyndallConeVisible).toBe(false);

    // Starch sol: Moderate scattering
    const starchSol = calculateColloidState({
      solType: 'starch-sol',
      laserActive: true,
      electrolyte: 'none',
    });
    expect(starchSol.tyndallIntensityPercent).toBeGreaterThan(40);
    expect(starchSol.tyndallIntensityPercent).toBeLessThan(70);
  });

  it('demonstrates Hardy-Schulze rule for positive Fe(OH)3 sol coagulation', () => {
    // Quadrivalent [Fe(CN)6]4- causes rapid coagulation at low volume (0.5 mL)
    const k4feState = calculateColloidState({
      solType: 'feoh3-sol',
      laserActive: false,
      electrolyte: 'k4fe_cn6',
      electrolyteVolumeMl: 1.0,
    });
    expect(k4feState.flocculationValence).toBe(4);
    expect(k4feState.coagulationStatus).toBe('coagulated-precipitate');
    expect(k4feState.coagulationObservation).toContain('Rapid complete coagulation');

    // Divalent SO4(2-) requires >= 2.0 mL to coagulate
    const so4StateLow = calculateColloidState({
      solType: 'feoh3-sol',
      laserActive: false,
      electrolyte: 'na2so4',
      electrolyteVolumeMl: 0.2,
    });
    expect(so4StateLow.coagulationStatus).toBe('stable-colloid');

    const so4StateHigh = calculateColloidState({
      solType: 'feoh3-sol',
      laserActive: false,
      electrolyte: 'na2so4',
      electrolyteVolumeMl: 2.5,
    });
    expect(so4StateHigh.flocculationValence).toBe(2);
    expect(so4StateHigh.coagulationStatus).toBe('coagulated-precipitate');

    // Monovalent Cl- is ineffective at low volumes
    const naclState = calculateColloidState({
      solType: 'feoh3-sol',
      laserActive: false,
      electrolyte: 'nacl',
      electrolyteVolumeMl: 2.0,
    });
    expect(naclState.flocculationValence).toBe(1);
    expect(naclState.coagulationStatus).toBe('stable-colloid');
  });

  it('verifies stability of lyophilic starch sol against simple electrolyte addition', () => {
    const starchWithSalt = calculateColloidState({
      solType: 'starch-sol',
      laserActive: false,
      electrolyte: 'k4fe_cn6',
      electrolyteVolumeMl: 5.0,
    });
    expect(starchWithSalt.coagulationStatus).toBe('stable-colloid');
    expect(starchWithSalt.coagulationObservation).toContain('remains stable without coagulation');
  });

  it('exposes educational assumptions', () => {
    expect(COLLOID_ASSUMPTIONS.length).toBeGreaterThanOrEqual(4);
    expect(COLLOID_ASSUMPTIONS[0]).toContain('1 nm to 1000 nm');
  });
});
