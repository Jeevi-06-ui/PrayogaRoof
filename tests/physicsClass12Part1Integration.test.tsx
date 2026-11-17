import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { getLabDefinition } from '../src/services/lab/registry';
import { getPhysicsQuestions } from '../src/services/physics/physicsQuestions';
import { physicsExtension } from '../src/services/lab/physicsExtension';
import {
  calculateWireResistivity,
  calculateMetreBridge,
  calculateGalvanometerFom,
  calculateGalvanometerToVoltmeter,
  calculateGalvanometerToAmmeter,
} from '../src/services/physics/advancedElectromagnetismModel';

describe('Physics Class 12 Phase 5 Interactive Laboratory Integration (Experiments 1-5)', () => {
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

  // =========================================================================
  // EXPERIMENT 1: RESISTIVITY OF A WIRE USING THE V-I METHOD
  // =========================================================================
  it('Experiment 1 (Wire Resistivity): mounts resistance wire board with DC source and verifies Ohm Law slope', async () => {
    const labDef = getLabDefinition('resistivity-vi-method');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('resistivity-vi-method');

    renderWithProviders(<UniversalLabWorkspace experimentId="resistivity-vi-method" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Resistivity of a Wire Using the V-I Method/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Measure Wire Diameter with Screw Gauge/i)).toBeInTheDocument();
      expect(screen.getByText(/Set Active Wire Length on Graduated Scale/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation
    const res = calculateWireResistivity({
      material: 'constantan',
      wireLengthCm: 100.0,
      wireDiameterMm: 0.50,
      appliedVoltageVolts: 2.0,
      temperatureC: 25.0,
    });

    expect(res.crossSectionalAreaM2).toBeCloseTo(1.9635e-7, 9);
    expect(res.calculatedResistanceOhms).toBeCloseTo(2.495, 2);
    expect(res.measuredCurrentAmps).toBeCloseTo(0.801, 2);
    expect(res.calculatedResistivityOhmMeter).toBeCloseTo(4.9e-7, 8);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('resistivity-vi-method');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('electrical resistivity (specific resistance ρ)');
  });

  // =========================================================================
  // EXPERIMENT 2: METRE BRIDGE – UNKNOWN RESISTANCE
  // =========================================================================
  it('Experiment 2 (Metre Bridge): mounts metre bridge with jockey and verifies Wheatstone null balance', async () => {
    const labDef = getLabDefinition('metre-bridge');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('metre-bridge');

    renderWithProviders(<UniversalLabWorkspace experimentId="metre-bridge" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Metre Bridge – Determination of Unknown Resistance/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Introduce Known Standard Resistance R in Left Gap/i)).toBeInTheDocument();
      expect(screen.getByText(/Slide Jockey to Locate Null Balance Point/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation
    const mbRes = calculateMetreBridge({
      knownResistanceR: 5.0,
      unknownResistanceX: 5.0,
      jockeyPositionCm: 50.0,
      supplyVoltageVolts: 2.0,
    });

    expect(mbRes.isBalanced).toBe(true);
    expect(mbRes.nullBalanceLengthCm).toBe(50.0);
    expect(mbRes.galvanometerDeflectionDivisions).toBe(0.0);
    expect(mbRes.calculatedUnknownX).toBeCloseTo(5.0, 2);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('metre-bridge');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('electrical principle upon which the Metre Bridge operates');
  });

  // =========================================================================
  // EXPERIMENT 3: GALVANOMETER RESISTANCE & FIGURE OF MERIT
  // =========================================================================
  it('Experiment 3 (Galvanometer FOM): mounts moving-coil galvanometer and verifies half-deflection model', async () => {
    const labDef = getLabDefinition('galvanometer-figure-of-merit');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('galvanometer-figure-of-merit');

    renderWithProviders(<UniversalLabWorkspace experimentId="galvanometer-figure-of-merit" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Galvanometer Resistance and Figure of Merit/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Set High Resistance R with Shunt Key Open/i)).toBeInTheDocument();
      expect(screen.getByText(/Adjust Shunt S for Half-Deflection/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation
    const fomRes = calculateGalvanometerFom({
      galvanometerTrueResistanceG: 100.0,
      figureOfMeritK: 2.0e-5,
      scaleDivisionsN: 30,
      highResistanceBoxR: 4900.0,
      lowShuntResistanceS: 100.0,
      isShuntKeyClosed: true,
      batteryEmfVolts: 1.5,
    });

    expect(fomRes.fullDeflectionThetaDivisions).toBe(15);
    expect(fomRes.halfDeflectionThetaPrimeDivisions).toBe(8);
    expect(fomRes.calculatedGalvanometerResistanceG).toBeCloseTo(102.08, 1);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('galvanometer-figure-of-merit');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('Figure of Merit');
  });

  // =========================================================================
  // EXPERIMENT 4: CONVERSION OF GALVANOMETER INTO A VOLTMETER
  // =========================================================================
  it('Experiment 4 (Voltmeter Conversion): mounts calibration rig and verifies series multiplier Rs', async () => {
    const labDef = getLabDefinition('galvanometer-voltmeter');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('galvanometer-voltmeter');

    renderWithProviders(<UniversalLabWorkspace experimentId="galvanometer-voltmeter" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Conversion of Galvanometer into a Voltmeter/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Identify Galvanometer Parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/Calculate Required Series Multiplier Resistance/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation
    const vRes = calculateGalvanometerToVoltmeter({
      galvanometerResistanceG: 100.0,
      figureOfMeritK: 2.0e-5,
      scaleDivisionsN: 30,
      targetMaxVoltageRangeVolts: 3.0,
      installedSeriesResistanceRs: 4900.0,
      appliedTestVoltageVolts: 1.5,
    });

    expect(vRes.fullScaleCurrentIgAmps).toBeCloseTo(0.0006, 6);
    expect(vRes.requiredSeriesResistanceRs).toBe(4900.0);
    expect(vRes.totalMeterResistanceOhms).toBe(5000.0);
    expect(vRes.galvanometerDeflectionDivisions).toBe(15);
    expect(vRes.measuredVoltageVolts).toBe(1.5);
    expect(vRes.isOverloaded).toBe(false);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('galvanometer-voltmeter');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('moving-coil galvanometer converted into a voltmeter');
  });

  // =========================================================================
  // EXPERIMENT 5: CONVERSION OF GALVANOMETER INTO AN AMMETER
  // =========================================================================
  it('Experiment 5 (Ammeter Conversion): mounts calibration rig and verifies parallel shunt S', async () => {
    const labDef = getLabDefinition('galvanometer-ammeter');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('galvanometer-ammeter');

    renderWithProviders(<UniversalLabWorkspace experimentId="galvanometer-ammeter" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Conversion of Galvanometer into an Ammeter/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Identify Galvanometer Parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/Calculate Required Parallel Shunt Resistance/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation
    const aRes = calculateGalvanometerToAmmeter({
      galvanometerResistanceG: 100.0,
      figureOfMeritK: 2.0e-5,
      scaleDivisionsN: 30,
      targetMaxCurrentRangeAmps: 3.0,
      installedShuntResistanceS: 0.020004,
      appliedCircuitCurrentAmps: 1.5,
    });

    expect(aRes.fullScaleCurrentIgAmps).toBeCloseTo(0.0006, 6);
    expect(aRes.requiredShuntResistanceS).toBeCloseTo(0.020004, 5);
    expect(aRes.galvanometerDeflectionDivisions).toBe(15);
    expect(aRes.measuredCurrentAmps).toBeCloseTo(1.5, 2);
    expect(aRes.isOverloaded).toBe(false);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('galvanometer-ammeter');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('moving-coil galvanometer converted into an ammeter');
  });

  // =========================================================================
  // SIMULATION ENGINE: EVALUATION ACROSS ALL 5 LABS
  // =========================================================================
  it('Simulation Engine: evaluates telemetry and states for all 5 Phase 5 laboratories without error', () => {
    const labIds = [
      'resistivity-vi-method',
      'metre-bridge',
      'galvanometer-figure-of-merit',
      'galvanometer-voltmeter',
      'galvanometer-ammeter',
    ];

    for (const expId of labIds) {
      const def = getLabDefinition(expId);
      expect(def).toBeDefined();

      const simResult = physicsExtension.evaluateSimulation(def!.initialObjects ?? [], []);
      expect(simResult.valid).toBe(true);
      expect(simResult.errors).toHaveLength(0);
      expect(simResult.messages.length).toBeGreaterThan(0);
    }
  });
});
