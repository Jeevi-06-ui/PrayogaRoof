import { describe, it, expect } from 'vitest';
import {
  SALT_CATALOGUE,
  runSaltAnalysisTest,
  SaltSampleId,
} from '../src/services/chemistry/saltAnalysisModel';

describe('Systematic Qualitative Salt Analysis (Class 11)', () => {
  it('contains all 8 required standard salts spanning Groups 0 to VI', () => {
    const saltIds: SaltSampleId[] = [
      'nh4cl',
      'pb-no3-2',
      'cuso4',
      'feso4',
      'alcl3',
      'znso4',
      'cacl2',
      'mgso4',
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
});
