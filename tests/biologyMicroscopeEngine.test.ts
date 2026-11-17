import { describe, it, expect } from 'vitest';
import {
  OBJECTIVE_SPECS,
  SLIDE_CATALOG,
  calculateResolvingPowerUm,
  calculateFocalBlur,
} from '../src/experiments/biology/models/microscopeEngine';
import { VirtualMicroscopeState } from '../src/experiments/biology/types/biologyTypes';

describe('Biology Scientific Engine — Virtual Microscope Optical Engine', () => {
  it('contains standard DIN achromatic objectives with correct numerical apertures and FOVs', () => {
    expect(OBJECTIVE_SPECS['4x'].numericalAperture).toBe(0.10);
    expect(OBJECTIVE_SPECS['10x'].numericalAperture).toBe(0.25);
    expect(OBJECTIVE_SPECS['40x'].numericalAperture).toBe(0.65);
    expect(OBJECTIVE_SPECS['100x'].numericalAperture).toBe(1.25);

    // FOV shrinks as magnification increases
    expect(OBJECTIVE_SPECS['4x'].fieldOfViewDiameterUm).toBeGreaterThan(OBJECTIVE_SPECS['10x'].fieldOfViewDiameterUm);
    expect(OBJECTIVE_SPECS['10x'].fieldOfViewDiameterUm).toBeGreaterThan(OBJECTIVE_SPECS['40x'].fieldOfViewDiameterUm);
    expect(OBJECTIVE_SPECS['40x'].fieldOfViewDiameterUm).toBeGreaterThan(OBJECTIVE_SPECS['100x'].fieldOfViewDiameterUm);
  });

  it('calculates optical resolving power via Abbe diffraction limit (d = λ / 2NA)', () => {
    // For 100x oil objective (NA = 1.25, λ = 0.55 um)
    // d = 0.55 / (2 * 1.25) = 0.55 / 2.5 = 0.22 um (sub-micron resolution)
    const res100x = calculateResolvingPowerUm(1.25, 0.55);
    expect(res100x).toBeCloseTo(0.22, 2);

    // For 4x scanner objective (NA = 0.10)
    // d = 0.55 / (2 * 0.10) = 2.75 um
    const res4x = calculateResolvingPowerUm(0.10, 0.55);
    expect(res4x).toBeCloseTo(2.75, 2);
  });

  it('determines crystal-clear focus when Z-axis aligns with ideal focal plane', () => {
    const specimen = SLIDE_CATALOG.find((s) => s.id === 'onion-peel')!;
    expect(specimen).toBeDefined();

    const inFocusState: VirtualMicroscopeState = {
      currentSlideId: 'onion-peel',
      eyepieceMagnification: 10,
      activeObjective: '10x',
      coarseFocus: 50, // 50 * 0.8 = 40
      fineFocus: 50, // 50 * 0.2 = 10; currentZ = 50 (matches idealFocalPlaneZ = 50)
      stageX: 0,
      stageY: 0,
      irisDiaphragmPercent: 80,
      lightIntensityPercent: 85,
      isOilApplied: false,
      activeStain: 'safranin',
      isSlideSecured: true,
    };

    const result = calculateFocalBlur(inFocusState, specimen);
    expect(result.blurPx).toBeLessThan(1.0);
    expect(result.isFocused).toBe(true);
  });

  it('determines severe blur when focus is offset from ideal plane', () => {
    const specimen = SLIDE_CATALOG.find((s) => s.id === 'onion-peel')!;

    const outOfFocusState: VirtualMicroscopeState = {
      currentSlideId: 'onion-peel',
      eyepieceMagnification: 10,
      activeObjective: '40x',
      coarseFocus: 20, // currentZ far from 50
      fineFocus: 0,
      stageX: 0,
      stageY: 0,
      irisDiaphragmPercent: 80,
      lightIntensityPercent: 85,
      isOilApplied: false,
      activeStain: 'safranin',
      isSlideSecured: true,
    };

    const result = calculateFocalBlur(outOfFocusState, specimen);
    expect(result.blurPx).toBeGreaterThan(10.0);
    expect(result.isFocused).toBe(false);
  });

  it('penalizes 100x objective resolving power when immersion oil is omitted', () => {
    const specimen = SLIDE_CATALOG.find((s) => s.id === 'blood-smear')!;

    const stateWithoutOil: VirtualMicroscopeState = {
      currentSlideId: 'blood-smear',
      eyepieceMagnification: 10,
      activeObjective: '100x',
      coarseFocus: 50,
      fineFocus: 50,
      stageX: 0,
      stageY: 0,
      irisDiaphragmPercent: 90,
      lightIntensityPercent: 95,
      isOilApplied: false, // NO OIL
      activeStain: 'methylene-blue',
      isSlideSecured: true,
    };

    const stateWithOil: VirtualMicroscopeState = {
      ...stateWithoutOil,
      isOilApplied: true, // WITH OIL
    };

    const withoutOilResult = calculateFocalBlur(stateWithoutOil, specimen);
    const withOilResult = calculateFocalBlur(stateWithOil, specimen);

    // Resolving power without oil is worse (higher micrometer limit)
    expect(withoutOilResult.opticalResolutionUm).toBeGreaterThan(withOilResult.opticalResolutionUm);
  });

  it('verifies slide catalog contains mandatory NCERT specimens with organelles', () => {
    const slideIds = SLIDE_CATALOG.map((s) => s.id);
    expect(slideIds).toContain('onion-peel');
    expect(slideIds).toContain('human-cheek-epithelial');
    expect(slideIds).toContain('leaf-epidermis-stomata');
    expect(slideIds).toContain('root-tip-mitosis');
    expect(slideIds).toContain('blood-smear');

    SLIDE_CATALOG.forEach((slide) => {
      expect(slide.organelles.length).toBeGreaterThan(0);
      expect(slide.diagnosticFeatures.length).toBeGreaterThan(0);
    });
  });
});
