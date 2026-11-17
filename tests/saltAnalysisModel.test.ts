import { describe, it, expect } from 'vitest';
import {
  SALT_CATALOGUE,
  runSaltAnalysisTest,
  SaltSampleId,
} from '../src/services/chemistry/saltAnalysisModel';

describe('Systematic Qualitative Salt Analysis (Class 11 & Class 12)', () => {
  it('contains all 8 standard Class 11 salts plus Class 12 interfering salts', () => {
    const saltIds: SaltSampleId[] = [
      'nh4cl',
      'pb-no3-2',
      'cuso4',
      'feso4',
      'alcl3',
      'znso4',
      'cacl2',
      'mgso4',
      'ca3_po4_2',
      'mg_c2o4',
      'fe_po4',
      'ba_cl2',
    ];
    for (const id of saltIds) {
      expect(SALT_CATALOGUE[id]).toBeDefined();
      expect(SALT_CATALOGUE[id].cation).toBeTruthy();
      expect(SALT_CATALOGUE[id].anion).toBeTruthy();
    }
  });

  it('correctly identifies Ammonium chloride sublimation and Zero Group Nessler outcome', () => {
    const dry = runSaltAnalysisTest('nh4cl', 'dry-heating');
    expect(dry.observation).toContain('sublimes');

    const group = runSaltAnalysisTest('nh4cl', 'cation-group-test');
    expect(group.observation).toContain('ammoniacal gas');
    expect(group.inference).toContain('Zero Group');

    const confirm = runSaltAnalysisTest('nh4cl', 'cation-confirmatory');
    expect(confirm.precipitateLabel).toContain('Millon’s base');
  });

  it('correctly identifies Lead(II) nitrate decrepitation, Group I precipitation, and golden spangles', () => {
    const dry = runSaltAnalysisTest('pb-no3-2', 'dry-heating');
    expect(dry.gasEvolution).toContain('NO₂');

    const group = runSaltAnalysisTest('pb-no3-2', 'cation-group-test');
    expect(group.precipitateLabel).toContain('PbCl₂');

    const confirm = runSaltAnalysisTest('pb-no3-2', 'cation-confirmatory');
    expect(confirm.observation).toContain('golden spangles');
  });

  it('correctly tests Copper(II) sulphate blue color, Group II CuS, and azure blue complex', () => {
    const physical = runSaltAnalysisTest('cuso4', 'physical');
    expect(physical.inference).toContain('Cu²⁺');

    const flame = runSaltAnalysisTest('cuso4', 'flame-test');
    expect(flame.observation).toContain('bluish-green');

    const group = runSaltAnalysisTest('cuso4', 'cation-group-test');
    expect(group.precipitateLabel).toContain('CuS');

    const confirm = runSaltAnalysisTest('cuso4', 'cation-confirmatory');
    expect(confirm.tubeColorHex).toBe('#1d4ed8'); // Azure blue
  });

  it('identifies Calcium chloride brick-red flame and Group V precipitate', () => {
    const flame = runSaltAnalysisTest('cacl2', 'flame-test');
    expect(flame.observation).toContain('brick-red');

    const group = runSaltAnalysisTest('cacl2', 'cation-group-test');
    expect(group.inference).toContain('Group V');

    const confirmAnion = runSaltAnalysisTest('cacl2', 'anion-confirmatory');
    expect(confirmAnion.precipitateLabel).toContain('AgCl');
  });

  it('identifies Magnesium sulphate Group VI phosphate precipitate', () => {
    const group = runSaltAnalysisTest('mgso4', 'cation-group-test');
    expect(group.inference).toContain('Group VI');
    expect(group.precipitateLabel).toContain('Mg(NH₄)PO₄');
  });

  // Class 12 Advanced & Interfering Radical Tests
  describe('Class 12 Interfering Radicals & Elimination Scheme', () => {
    it('detects Phosphate interfering radical using ammonium molybdate canary yellow precipitate', () => {
      const molybdateCa = runSaltAnalysisTest('ca3_po4_2', 'phosphate-molybdate');
      expect(molybdateCa.precipitateColorHex).toBe('#facc15');
      expect(molybdateCa.observation).toContain('canary-yellow');
      expect(molybdateCa.inference).toContain('Phosphate (PO₄³⁻) present');

      const molybdateCl = runSaltAnalysisTest('nh4cl', 'phosphate-molybdate');
      expect(molybdateCl.inference).toContain('ABSENT');
    });

    it('demonstrates premature Group III precipitation of Calcium Phosphate and its elimination', () => {
      // Premature precipitation
      const premature = runSaltAnalysisTest('ca3_po4_2', 'cation-group-test');
      expect(premature.observation).toContain('PREMATURE INTERFERENCE');
      expect(premature.precipitateLabel).toContain('Ca₃(PO₄)₂');

      // Elimination protocol
      const eliminate = runSaltAnalysisTest('ca3_po4_2', 'phosphate-elimination');
      expect(eliminate.observation).toContain('FePO₄ and brown basic ferric acetate');
      expect(eliminate.inference).toContain('ELIMINATED');
    });

    it('detects Oxalate interfering radical using KMnO4 decolorization with CO2 effervescence', () => {
      const oxalateKMnO4 = runSaltAnalysisTest('mg_c2o4', 'oxalate-kmno4');
      expect(oxalateKMnO4.observation).toContain('rapidly discharged');
      expect(oxalateKMnO4.gasEvolution).toContain('CO₂');
      expect(oxalateKMnO4.inference).toContain('CONFIRMED');

      const nonOxalate = runSaltAnalysisTest('nh4cl', 'oxalate-kmno4');
      expect(nonOxalate.inference).toContain('ABSENT');
    });

    it('identifies Barium chloride apple-green flame and potassium chromate yellow precipitate', () => {
      const flame = runSaltAnalysisTest('ba_cl2', 'flame-test');
      expect(flame.observation).toContain('apple-green');

      const group = runSaltAnalysisTest('ba_cl2', 'cation-group-test');
      expect(group.inference).toContain('Group V');
      expect(group.precipitateLabel).toContain('BaCO₃');

      const confirm = runSaltAnalysisTest('ba_cl2', 'cation-confirmatory');
      expect(confirm.precipitateLabel).toContain('BaCrO₄');
      expect(confirm.precipitateColorHex).toBe('#eab308');
    });
  });
});
