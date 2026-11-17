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
  calculateConcaveMirror,
  calculateConvexMirror,
  calculateConcaveLens,
  calculatePrismRefraction,
  calculateDiodeCharacteristics,
} from '../src/services/physics/advancedOpticsAndSemiconductorModel';

describe('Physics Class 12 Phase 6 Interactive Laboratory Integration (Experiments 6-10)', () => {
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
  // EXPERIMENT 6: FOCAL LENGTH OF A CONCAVE MIRROR
  // =========================================================================
  it('Experiment 6 (Concave Mirror): mounts concave mirror bench and verifies real and virtual image formation', async () => {
    const labDef = getLabDefinition('concave-mirror-focal-length');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('concave-mirror-focal-length');

    renderWithProviders(<UniversalLabWorkspace experimentId="concave-mirror-focal-length" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Focal Length of a Concave Mirror/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Determine Approximate Focal Length by Distant Object Method/i)).toBeInTheDocument();
      expect(screen.getByText(/Place Object at Center of Curvature C/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation (Real image at C: u = 2f = 30 cm)
    const resReal = calculateConcaveMirror({
      focalLengthCm: 15.0,
      objectDistanceCm: 30.0,
      objectHeightCm: 4.0,
      benchPositionCm: 75.0,
    });

    expect(resReal.focalLengthCm).toBe(-15.0);
    expect(resReal.imageDistanceCm).toBe(-30.0);
    expect(resReal.linearMagnification).toBe(-1.0);
    expect(resReal.imageNature).toBe('Real, Inverted');
    expect(resReal.canCatchOnScreen).toBe(true);

    // Test Virtual Image when u < f (u = 10 cm, f = 15 cm)
    const resVirt = calculateConcaveMirror({
      focalLengthCm: 15.0,
      objectDistanceCm: 10.0,
      objectHeightCm: 4.0,
    });

    expect(resVirt.imageDistanceCm).toBe(30.0);
    expect(resVirt.linearMagnification).toBe(3.0);
    expect(resVirt.imageNature).toBe('Virtual, Erect');
    expect(resVirt.isVirtual).toBe(true);

    // Verify Simulation Extension Evaluation
    const simResult = physicsExtension.evaluateSimulation(labDef!.initialObjects || [], []);
    expect(simResult.valid).toBe(true);
    const mirrorState = simResult.objectStateUpdates['cm-mirror-1'];
    expect(mirrorState).toBeDefined();
    expect(mirrorState.imageDistanceCm).toBe(-30);
    expect(mirrorState.imageNature).toBe('Real, Inverted');

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('concave-mirror-focal-length');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('Where should an object be placed in front of a concave mirror');
  });

  // =========================================================================
  // EXPERIMENT 7: FOCAL LENGTH OF A CONVEX MIRROR
  // =========================================================================
  it('Experiment 7 (Convex Mirror): mounts convex mirror bench and verifies virtual image and auxiliary lens retro-reflection', async () => {
    const labDef = getLabDefinition('convex-mirror-focal-length');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('convex-mirror-focal-length');

    renderWithProviders(<UniversalLabWorkspace experimentId="convex-mirror-focal-length" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Focal Length of a Convex Mirror/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Produce Real Image using Auxiliary Convex Lens/i)).toBeInTheDocument();
      expect(screen.getByText(/Interpose Convex Mirror Between Lens and Screen/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation (Virtual image always inside mirror)
    const res = calculateConvexMirror({
      focalLengthCm: 15.0,
      objectDistanceCm: 30.0,
      objectHeightCm: 4.0,
    });

    expect(res.focalLengthCm).toBe(15.0);
    expect(res.imageDistanceCm).toBe(10.0);
    expect(res.linearMagnification).toBeCloseTo(0.33, 2);
    expect(res.imageNature).toBe('Virtual, Erect');
    expect(res.isVirtual).toBe(true);
    expect(res.canCatchOnScreen).toBe(false);

    // Verify Simulation Extension Evaluation
    const simResult = physicsExtension.evaluateSimulation(labDef!.initialObjects || [], []);
    expect(simResult.valid).toBe(true);
    const mirrorState = simResult.objectStateUpdates['cvm-mirror-1'];
    expect(mirrorState).toBeDefined();
    expect(mirrorState.imageDistanceCm).toBe(10);
    expect(mirrorState.linearMagnification).toBe(0.33);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('convex-mirror-focal-length');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('type of image is always formed by a convex mirror');
  });

  // =========================================================================
  // EXPERIMENT 8: FOCAL LENGTH OF A CONCAVE LENS
  // =========================================================================
  it('Experiment 8 (Concave Lens): mounts concave lens and verifies combination focal length method', async () => {
    const labDef = getLabDefinition('concave-lens-focal-length');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('concave-lens-focal-length');

    renderWithProviders(<UniversalLabWorkspace experimentId="concave-lens-focal-length" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Focal Length of a Concave Lens/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Produce Real Image using Strong Convex Lens/i)).toBeInTheDocument();
      expect(screen.getByText(/Place Concave Lens in Coaxial Contact/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation
    const res = calculateConcaveLens({
      focalLengthCm: 15.0,
      objectDistanceCm: 30.0,
      objectHeightCm: 4.0,
      auxiliaryConvexFocalLengthCm: 10.0,
    });

    expect(res.focalLengthCm).toBe(-15.0);
    expect(res.imageDistanceCm).toBe(-10.0);
    expect(res.linearMagnification).toBeCloseTo(0.33, 2);
    expect(res.isVirtual).toBe(true);
    expect(res.auxiliaryLensMethod.combinedFocalLengthCm).toBe(30.0);

    // Verify Simulation Extension Evaluation
    const simResult = physicsExtension.evaluateSimulation(labDef!.initialObjects || [], []);
    expect(simResult.valid).toBe(true);
    const lensState = simResult.objectStateUpdates['cl-lens-1'];
    expect(lensState).toBeDefined();
    expect(lensState.imageDistanceCm).toBe(-10);
    expect(lensState.combinedFocalLengthCm).toBe(30);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('concave-lens-focal-length');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('biconcave lens');
  });

  // =========================================================================
  // EXPERIMENT 9: REFRACTIVE INDEX OF A PRISM – MINIMUM DEVIATION
  // =========================================================================
  it('Experiment 9 (Prism): mounts optical prism table and verifies Snell refraction and minimum deviation', async () => {
    const labDef = getLabDefinition('prism-refractive-index');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('prism-refractive-index');

    renderWithProviders(<UniversalLabWorkspace experimentId="prism-refractive-index" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Refractive Index of a Prism – Minimum Deviation/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Mount Prism and Verify Geometric Parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/Set Incidence Angle i1 = 35.0° and Observe Deviation/i)).toBeInTheDocument();
    });

    // Test Analytical Model Calculation at Minimum Deviation (i ≈ 49.5° for A=60°, μ=1.52)
    const res = calculatePrismRefraction({
      angleOfIncidenceDeg: 49.5,
      prismAngleDeg: 60.0,
      refractiveIndex: 1.52,
    });

    expect(res.prismAngleDeg).toBe(60.0);
    expect(res.firstRefractionAngleDeg).toBeCloseTo(30.0, 1);
    expect(res.secondIncidentAngleDeg).toBeCloseTo(30.0, 1);
    expect(res.minimumDeviationDeg).toBeCloseTo(38.9, 1);
    expect(res.isMinimumDeviation).toBe(true);
    expect(res.calculatedRefractiveIndex).toBeCloseTo(1.52, 2);

    // Verify Simulation Extension Evaluation
    const simResult = physicsExtension.evaluateSimulation(labDef!.initialObjects || [], []);
    expect(simResult.valid).toBe(true);
    const prismState = simResult.objectStateUpdates['prism-tab-1'];
    expect(prismState).toBeDefined();
    expect(prismState.isMinimumDeviation).toBe(true);
    expect(prismState.calculatedRefractiveIndex).toBeCloseTo(1.52, 2);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('prism-refractive-index');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('Minimum Deviation (Dm)');
  });

  // =========================================================================
  // EXPERIMENT 10: P-N JUNCTION DIODE – I-V CHARACTERISTICS
  // =========================================================================
  it('Experiment 10 (P-N Diode): mounts diode test bench and verifies knee voltage, forward/reverse bias', async () => {
    const labDef = getLabDefinition('pn-junction-diode');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('pn-junction-diode');

    renderWithProviders(<UniversalLabWorkspace experimentId="pn-junction-diode" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/P-N Junction Diode – I-V Characteristics/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Connect Circuit in Forward Bias Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/Observe Sub-Threshold Region Below Knee Voltage/i)).toBeInTheDocument();
    });

    // Test Analytical Model: Forward Bias above Knee (V = 1.5V, Silicon Vk = 0.7V)
    const resFwd = calculateDiodeCharacteristics({
      semiconductorMaterial: 'silicon',
      biasMode: 'forward',
      appliedVoltageVolts: 1.5,
      seriesResistanceOhms: 100.0,
    });

    expect(resFwd.kneeVoltageVolts).toBe(0.7);
    expect(resFwd.circuitCurrentMilliAmps).toBeCloseTo(6.96, 1);
    expect(resFwd.isConducting).toBe(true);
    expect(resFwd.dynamicResistanceOhms).toBe(15.0);

    // Test Analytical Model: Reverse Bias (V = 5.0V, leakage only)
    const resRev = calculateDiodeCharacteristics({
      semiconductorMaterial: 'silicon',
      biasMode: 'reverse',
      appliedVoltageVolts: 5.0,
      seriesResistanceOhms: 100.0,
    });

    expect(resRev.circuitCurrentMicroAmps).toBeLessThan(1.0);
    expect(resRev.isBreakdown).toBe(false);

    // Verify Simulation Extension Evaluation
    const simResult = physicsExtension.evaluateSimulation(labDef!.initialObjects || [], []);
    expect(simResult.valid).toBe(true);
    const diodeState = simResult.objectStateUpdates['diode-board-1'];
    expect(diodeState).toBeDefined();
    expect(diodeState.isConducting).toBe(true);
    expect(diodeState.circuitCurrentMilliAmps).toBeGreaterThan(5.0);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('pn-junction-diode');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('Knee Voltage');
  });
});
