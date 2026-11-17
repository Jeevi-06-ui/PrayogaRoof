import { describe, it, expect } from 'vitest';
import {
  FOOD_SAMPLES,
  runFoodTest,
  FOOD_TEST_ASSUMPTIONS,
} from '../src/services/chemistry/foodTestingModel';

describe('Food Component Testing Model (Class 12)', () => {
  it('covers all major food classes: carbohydrates, proteins, and fats', () => {
    const samples = Object.values(FOOD_SAMPLES);
    expect(samples.some((s) => s.hasCarbohydrate)).toBe(true);
    expect(samples.some((s) => s.hasProtein)).toBe(true);
    expect(samples.some((s) => s.hasFat)).toBe(true);
  });

  it('correctly runs Molisch test showing positive violet ring for carbohydrates', () => {
    const glucoseMolisch = runFoodTest('glucose', 'molisch-test');
    expect(glucoseMolisch.isPositive).toBe(true);
    expect(glucoseMolisch.ringOrPptHex).toBe('#701a75');

    const oilMolisch = runFoodTest('vegetable-oil', 'molisch-test');
    expect(oilMolisch.isPositive).toBe(false);
  });

  it('correctly differentiates reducing sugars and starch with Fehling and Iodine tests', () => {
    const glucoseFehling = runFoodTest('glucose', 'fehling-test');
    expect(glucoseFehling.isPositive).toBe(true);
    expect(glucoseFehling.ringOrPptHex).toBe('#b91c1c'); // Red Cu2O

    const starchFehling = runFoodTest('potato-starch', 'fehling-test');
    expect(starchFehling.isPositive).toBe(false);

    const starchIodine = runFoodTest('potato-starch', 'iodine-test');
    expect(starchIodine.isPositive).toBe(true);
    expect(starchIodine.tubeColorHex).toBe('#1e1b4b'); // Deep blue-black
  });

  it('correctly runs Biuret and Ninhydrin tests for proteins', () => {
    const albuminBiuret = runFoodTest('egg-albumin', 'biuret-test');
    expect(albuminBiuret.isPositive).toBe(true);
    expect(albuminBiuret.tubeColorHex).toBe('#6b21a8'); // Violet-purple

    const milkNinhydrin = runFoodTest('milk', 'ninhydrin-test');
    expect(milkNinhydrin.isPositive).toBe(true);
    expect(milkNinhydrin.tubeColorHex).toBe('#4338ca'); // Ruhemann’s purple

    const oilBiuret = runFoodTest('vegetable-oil', 'biuret-test');
    expect(oilBiuret.isPositive).toBe(false);
  });

  it('correctly tests fats and oils using translucent spot and acrolein tests', () => {
    const oilSpot = runFoodTest('vegetable-oil', 'translucent-spot');
    expect(oilSpot.isPositive).toBe(true);
    expect(oilSpot.observation).toContain('translucent');

    const oilAcrolein = runFoodTest('vegetable-oil', 'acrolein-test');
    expect(oilAcrolein.isPositive).toBe(true);
    expect(oilAcrolein.observation).toContain('pungent, highly irritating');

    const glucoseSpot = runFoodTest('glucose', 'translucent-spot');
    expect(glucoseSpot.isPositive).toBe(false);
  });

  it('documents chemical principles and testing limitations', () => {
    const res = runFoodTest('glucose', 'fehling-test');
    expect(res.limitationNote).toBeTruthy();
    expect(res.chemicalPrinciple).toBeTruthy();
    expect(FOOD_TEST_ASSUMPTIONS.length).toBeGreaterThanOrEqual(3);
  });
});
