import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { getLabDefinition } from '../src/services/lab/registry';
import { chemistryExtension } from '../src/services/lab/chemistryExtension';
import { getChemistryQuestions } from '../src/services/chemistry/chemistryQuestions';

describe('Phase 7: Class 11 Chemistry Laboratory Integration (All 6 Experiments)', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <StudentProvider>{ui}</StudentProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('Experiment 1 (Basic Laboratory Techniques): mounts burette, analytical balance, cylinder, and validates gravimetric transfer', async () => {
    const labDef = getLabDefinition('basic-lab-techniques');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('basic-lab-techniques');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(4);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="basic-lab-techniques" initialMode="guided" />
    );

    // Verify title
    expect(
      screen.getByText(/Basic Laboratory Techniques & Volumetric Transfer/i)
    ).toBeInTheDocument();

    // Verify guided steps
    await waitFor(() => {
      expect(
        screen.getByText(/Digital Balance Calibration and Taring/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Meniscus Reading in Graduated Cylinder/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Deliver Measured Titre into Conical Flask/i)
      ).toBeInTheDocument();
    });

    // Test simulation evaluation for burette and balance
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const buretteState = simResult.objectStateUpdates['burette-stand-1'];
    expect(buretteState).toBeDefined();
    expect(buretteState.capacityMl).toBe(50);

    const balanceState = simResult.objectStateUpdates['balance-1'];
    expect(balanceState).toBeDefined();
    expect(Number(balanceState.displayedMassGrams)).toBeGreaterThan(0);

    // Verify conceptual questions
    const questions = getChemistryQuestions('basic-lab-techniques');
    expect(questions.length).toBe(4);
    expect(questions[0].question).toContain('concave meniscus');
    expect(questions[1].question).toContain('Tare');
  });

  it('Experiment 2 (Melting Point Determination): evaluates Thiele tube convection, sharp melting, and impurity depression', async () => {
    const labDef = getLabDefinition('melting-point');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('melting-point');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="melting-point" initialMode="guided" />
    );

    expect(
      screen.getByText(/Melting Point Determination with Thiele’s Tube/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Capillary Packing and Thiele Tube Setup/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Convection Loop Heating in Thiele Tube/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Record Sharp Melting Point and Meniscus Formation/i)
      ).toBeInTheDocument();
    });

    // Test simulation evaluation: Pure Benzoic acid at 122.4°C should melt
    const testObjects = [
      {
        id: 'thiele-test',
        equipmentId: 'thiele-melting-apparatus',
        title: 'Thiele Tube',
        x: 100,
        y: 100,
        rotation: 0,
        width: 180,
        height: 260,
        properties: { sampleId: 'benzoic-acid-solid', currentTempC: 122.4, isHeating: true },
        state: {},
      },
    ];

    const simResult = chemistryExtension.evaluateSimulation(testObjects, []);
    const thieleState = simResult.objectStateUpdates['thiele-test'];
    expect(thieleState).toBeDefined();
    expect(thieleState.sampleName).toContain('Benzoic Acid');
    expect(thieleState.meltingPointC).toBe(122.4);
    expect(thieleState.phase).toBe('coexistence');
    expect(thieleState.isMelting).toBe(true);
    expect(thieleState.meltFraction).toBe(50);

    // Test impure sample depression
    const impureObjects = [
      {
        id: 'thiele-impure',
        equipmentId: 'thiele-melting-apparatus',
        title: 'Thiele Tube Impure',
        x: 100,
        y: 100,
        rotation: 0,
        width: 180,
        height: 260,
        properties: { sampleId: 'impure-benzoic-acid', currentTempC: 116.0, isHeating: true },
        state: {},
      },
    ];
    const impureSim = chemistryExtension.evaluateSimulation(impureObjects, []);
    const impureState = impureSim.objectStateUpdates['thiele-impure'];
    expect(impureState.isMelting).toBe(true);
    expect(impureState.meltingRangeText).toContain('114.5');
    expect(impureState.meltingRangeText).toContain('118.5');

    // Verify conceptual questions
    const questions = getChemistryQuestions('melting-point');
    expect(questions.length).toBe(4);
    expect(questions[0].question).toContain('melting point of a pure crystalline');
  });

  it('Experiment 3 (Boiling Point Determination): evaluates Siwoloboff inverted capillary bubble train and suction re-entry', async () => {
    const labDef = getLabDefinition('boiling-point');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('boiling-point');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="boiling-point" initialMode="guided" />
    );

    expect(
      screen.getByText(/Boiling Point Determination by Inverted Capillary Method/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Prepare Micro-Boiling Tube and Inverted Capillary/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Identify Continuous Rapid Vapor Bubble Stream/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Extinguish Flame and Capture Liquid Re-entry Temperature/i)
      ).toBeInTheDocument();
    });

    // Test simulation evaluation: Ethanol at boiling point 78.5°C heating -> rapid bubble stream
    const boilingTest = [
      {
        id: 'bp-test',
        equipmentId: 'boiling-point-apparatus',
        title: 'Boiling Tube',
        x: 100,
        y: 100,
        rotation: 0,
        width: 180,
        height: 260,
        properties: { liquidId: 'ethanol-liquid', bathTempC: 78.5, isHeating: true, barometricPressureKPa: 101.325 },
        state: {},
      },
    ];

    const simResult = chemistryExtension.evaluateSimulation(boilingTest, []);
    const bpState = simResult.objectStateUpdates['bp-test'];
    expect(bpState.liquidName).toContain('Ethanol');
    expect(bpState.standardBoilingPointC).toBe(78.3);
    expect(bpState.bubbleStream).toBe('continuous-rapid-stream');

    // Test cooling re-entry: bathTemp slightly below boiling point with heating off
    const coolingTest = [
      {
        id: 'bp-cooling',
        equipmentId: 'boiling-point-apparatus',
        title: 'Boiling Tube Cooling',
        x: 100,
        y: 100,
        rotation: 0,
        width: 180,
        height: 260,
        properties: { liquidId: 'ethanol-liquid', bathTempC: 78.1, isHeating: false, barometricPressureKPa: 101.325 },
        state: {},
      },
    ];
    const coolingSim = chemistryExtension.evaluateSimulation(coolingTest, []);
    const coolingState = coolingSim.objectStateUpdates['bp-cooling'];
    expect(coolingState.liquidEnteredCapillary).toBe(true);

    // Verify conceptual questions
    const questions = getChemistryQuestions('boiling-point');
    expect(questions.length).toBe(4);
    expect(questions[0].question).toContain('boiling point');
    expect(questions[0].options[0]).toContain('vapor pressure equals');
  });

  it('Experiment 4 (Crystallisation Class 11): evaluates impure sample recrystallisation and recovery percentage yield', async () => {
    const labDef = getLabDefinition('crystallisation-class11');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('crystallisation-class11');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="crystallisation-class11" initialMode="guided" />
    );

    expect(
      screen.getByText(/Purification of Impure Samples by Fractional Crystallisation/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Dissolve Impure Sample in Minimum Boiling Solvent/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Rapid Hot Gravity Filtration/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Concentrate Filtrate to Crystallisation Point/i)
      ).toBeInTheDocument();
    });

    // Test simulation evaluation for evaporating dish and balance yield
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const dishState = simResult.objectStateUpdates['dish-impure-sample'];
    expect(dishState).toBeDefined();
    expect(dishState.saturationRatio).toBeGreaterThan(0.5);

    // Verify conceptual questions
    const questions = getChemistryQuestions('crystallisation-class11');
    expect(questions.length).toBe(4);
    expect(questions[0].question).toContain('recrystallisation solvent');
  });

  it('Experiment 5 (pH Determination): evaluates fruit juices, salt hydrolysis shifts, and buffer stability', async () => {
    const labDef = getLabDefinition('ph-determination');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('ph-determination');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="ph-determination" initialMode="guided" />
    );

    expect(
      screen.getByText(/pH Determination of Fruit Juices, Salts & Buffers/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Dispense Aliquots into Porcelain Spotting Plate/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Verify Salt Hydrolysis Equilibrium/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Evaluate Buffer Capacity with Acetate Buffer/i)
      ).toBeInTheDocument();
    });

    // Test simulation evaluation of sample beakers
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    const orangeState = simResult.objectStateUpdates['beaker-orange'];
    const nh4clState = simResult.objectStateUpdates['beaker-nh4cl'];
    const ch3coonaState = simResult.objectStateUpdates['beaker-ch3coona'];
    const bufferState = simResult.objectStateUpdates['beaker-buffer'];

    expect(Number(orangeState.samplePH)).toBeCloseTo(3.6, 1);
    expect(Number(nh4clState.samplePH)).toBeCloseTo(5.13, 1); // Acidic hydrolysis
    expect(Number(ch3coonaState.samplePH)).toBeCloseTo(8.87, 1); // Basic hydrolysis
    expect(Number(bufferState.samplePH)).toBeCloseTo(4.74, 1); // Henderson-Hasselbalch

    // Verify conceptual questions
    const questions = getChemistryQuestions('ph-determination');
    expect(questions.length).toBe(4);
    expect(questions[0].question).toContain('Ammonium Chloride');
    expect(questions[1].question).toContain('Sodium Acetate');
  });

  it('Experiment 6 (Strong vs Weak Acids): validates equimolar ionisation, [H+] ratio (76x), effervescence kinetics, and stoichiometric H2 equivalence', async () => {
    const labDef = getLabDefinition('strong-vs-weak-acids');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('strong-vs-weak-acids');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="strong-vs-weak-acids" initialMode="guided" />
    );

    expect(
      screen.getByText(/Strong vs Weak Acids: Equilibrium Ionisation & Reaction Kinetics/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Configure Equimolar Acid Solutions/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Measure and Contrast Equilibrium pH/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Add Magnesium Metal Strips and Compare Reaction Rates/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Verify Stoichiometric Equivalence of Total Hydrogen Evolved/i)
      ).toBeInTheDocument();
    });

    // Test simulation evaluation for acid comparator bench
    const benchTest = [
      {
        id: 'bench-test',
        equipmentId: 'acid-comparison-bench',
        title: 'Acid Bench',
        x: 100,
        y: 100,
        rotation: 0,
        width: 280,
        height: 200,
        properties: { concentrationM: 0.1, solutionVolumeMl: 50, magnesiumAdded: true, mgMassMg: 24.3 },
        state: {},
      },
    ];

    const simResult = chemistryExtension.evaluateSimulation(benchTest, []);
    const benchState = simResult.objectStateUpdates['bench-test'];

    expect(benchState).toBeDefined();
    expect(Number(benchState.strongPH)).toBeCloseTo(1.0, 1);
    expect(Number(benchState.weakPH)).toBeCloseTo(2.88, 1);
    expect(Number(benchState.strongAlphaPercent)).toBe(100);
    expect(Number(benchState.weakAlphaPercent)).toBeCloseTo(1.31, 1);
    expect(Number(benchState.hydroniumRatio)).toBeCloseTo(76.1, 1);
    expect(benchState.strongEffervescence).toBe('vigorous');
    expect(benchState.weakEffervescence).toBe('gentle');
    expect(Number(benchState.totalHydrogenYieldMl)).toBeCloseTo(24.0, 1);

    // Verify conceptual questions
    const questions = getChemistryQuestions('strong-vs-weak-acids');
    expect(questions.length).toBe(4);
    expect(questions[0].question).toContain('Equimolar solutions');
    expect(questions[1].question).toContain('Ostwald');
    expect(questions[3].question).toContain('stoichiometric volume of H₂');
  });
});
