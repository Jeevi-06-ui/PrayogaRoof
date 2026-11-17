import { describe, it, expect } from 'vitest';
import {
  calculateSolutePotentialMPa,
  evaluateOsmosisSimulation,
  DEFAULT_OSMOSIS_PARAMS,
} from '../src/experiments/biology/models/osmosisModel';

describe('Biology Scientific Engine — Osmosis & Cell Water Potential Model', () => {
  it('correctly calculates solute potential using van \'t Hoff equation (Ψs = -iCRT)', () => {
    // For 1.0 M sucrose at 298.15 K, i = 1
    // Ψs_bar = -1 * 1.0 * 0.083145 * 298.15 ≈ -24.79 bar = -2.479 MPa
    const psi_s = calculateSolutePotentialMPa(1.0, 298.15, 1.0);
    expect(psi_s).toBeCloseTo(-2.479, 2);

    // Pure water (0 M) has solute potential = 0 MPa
    const psi_s_pure = calculateSolutePotentialMPa(0.0, 298.15);
    expect(psi_s_pure).toBe(0);
  });

  it('evaluates hypotonic conditions: water enters plant cell and turgor pressure rises', () => {
    const results = evaluateOsmosisSimulation({
      ...DEFAULT_OSMOSIS_PARAMS,
      externalSoluteConcentrationMolar: 0.0, // pure water (Hypotonic)
      internalSoluteConcentrationMolar: 0.35,
      elapsedTimeSeconds: 120,
    });

    expect(results.tonicity).toBe('hypotonic');
    expect(results.waterPotentialExternalMpa).toBeGreaterThan(results.waterPotentialInternalMpa);
    expect(results.relativeCellVolume).toBeGreaterThan(1.0);
    expect(results.turgorPressureBar).toBeGreaterThan(0);
    expect(results.plantCellState).toBe('turgid');
    expect(results.scientificObservation).toContain('Endosmosis observed');
  });

  it('evaluates hypertonic conditions: water exits plant cell leading to plasmolysis', () => {
    const results = evaluateOsmosisSimulation({
      ...DEFAULT_OSMOSIS_PARAMS,
      externalSoluteConcentrationMolar: 0.8, // 0.8 M concentrated sucrose (Hypertonic)
      internalSoluteConcentrationMolar: 0.3,
      elapsedTimeSeconds: 120,
    });

    expect(results.tonicity).toBe('hypertonic');
    expect(results.waterPotentialExternalMpa).toBeLessThan(results.waterPotentialInternalMpa);
    expect(results.relativeCellVolume).toBeLessThan(1.0);
    expect(results.turgorPressureBar).toBe(0); // turgor drops to zero
    expect(results.plantCellState).toBe('plasmolysed');
    expect(results.scientificObservation).toContain('Exosmosis observed');
  });

  it('evaluates isotonic conditions: dynamic equilibrium with zero net flux', () => {
    const results = evaluateOsmosisSimulation({
      ...DEFAULT_OSMOSIS_PARAMS,
      externalSoluteConcentrationMolar: 0.35,
      internalSoluteConcentrationMolar: 0.35,
      elapsedTimeSeconds: 60,
    });

    expect(results.tonicity).toBe('isotonic');
    expect(results.relativeCellVolume).toBeCloseTo(1.0, 2);
    expect(results.plantCellState).toBe('flaccid');
    expect(results.scientificObservation).toContain('Dynamic equilibrium maintained');
    expect(results.explanation).toContain('cross the semipermeable membrane in both directions at equal rates');
  });

  it('evaluates animal RBC cells without rigid cell wall (swelling in hypotonic, crenation in hypertonic)', () => {
    const hypoResults = evaluateOsmosisSimulation({
      ...DEFAULT_OSMOSIS_PARAMS,
      cellType: 'animal-rbc',
      externalSoluteConcentrationMolar: 0.05,
      internalSoluteConcentrationMolar: 0.30,
      elapsedTimeSeconds: 90,
    });
    expect(hypoResults.turgorPressureBar).toBe(0); // animal cells cannot develop wall turgor
    expect(hypoResults.relativeCellVolume).toBeGreaterThan(1.2);
    expect(hypoResults.explanation).toContain('osmotic hemolysis');

    const hyperResults = evaluateOsmosisSimulation({
      ...DEFAULT_OSMOSIS_PARAMS,
      cellType: 'animal-rbc',
      externalSoluteConcentrationMolar: 0.70,
      internalSoluteConcentrationMolar: 0.30,
      elapsedTimeSeconds: 90,
    });
    expect(hyperResults.relativeCellVolume).toBeLessThan(0.9);
    expect(hyperResults.explanation).toContain('crenated morphology');
  });
});
