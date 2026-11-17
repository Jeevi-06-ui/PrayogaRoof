import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { getLabDefinition } from '../src/services/lab/registry';
import { getPhysicsQuestions } from '../src/services/physics/physicsQuestions';
import {
  calculateVectorAddition,
  calculateLimitingFriction,
  calculateInclinedPlanePhysics,
  calculateHookesLaw,
  calculateBoylesLaw,
} from '../src/services/physics/vectorMechanicsModel';

describe('Physics Class 11 Phase 4 Interactive Laboratory Integration (Experiments 6-10)', () => {
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
  // EXPERIMENT 6: PARALLELOGRAM LAW OF VECTORS
  // =========================================================================
  it('Experiment 6 (Parallelogram Law): mounts force board with concurrent strings and verifies equilibrium', async () => {
    const labDef = getLabDefinition('parallelogram-law');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('parallelogram-law');

    renderWithProviders(<UniversalLabWorkspace experimentId="parallelogram-law" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Parallelogram Law of Vectors/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Set Tension Force P on Left Pulley/i)).toBeInTheDocument();
      expect(screen.getByText(/Construct the Vector Parallelogram/i)).toBeInTheDocument();
    });

    // Test Analytical Vector Calculation
    const vecRes = calculateVectorAddition({
      forceP: 3.0,
      anglePDeg: 35.0,
      forceQ: 4.0,
      angleQDeg: 125.0,
      balancingMassGrams: 509.85,
    });

    expect(vecRes.includedAngleDeg).toBe(90.0);
    expect(vecRes.resultantMagnitude).toBeCloseTo(5.0, 2);
    expect(vecRes.isEquilibriumValid).toBe(true);

    // Verify Conceptual Quiz
    const questions = getPhysicsQuestions('parallelogram-law');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('Two equal forces P and Q of 10 N act at an angle θ = 60°');
  });

  // =========================================================================
  // EXPERIMENT 7: LAWS OF LIMITING FRICTION
  // =========================================================================
  it('Experiment 7 (Limiting Friction): mounts horizontal friction track and verifies static/kinetic regimes', async () => {
    const labDef = getLabDefinition('limiting-friction');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('limiting-friction');

    renderWithProviders(<UniversalLabWorkspace experimentId="limiting-friction" initialMode="guided" />);

    expect(screen.getAllByText(/Laws of Limiting Friction/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Inspect Surface Material and Slider Block/i)).toBeInTheDocument();
      expect(screen.getByText(/Identify Limiting Friction Threshold/i)).toBeInTheDocument();
    });

    // Test Limiting Friction Calculation (wood-on-wood)
    const fricRes = calculateLimitingFriction({
      blockMassGrams: 150,
      addedMassGrams: 50,
      panMassGrams: 20,
      addedPanMassGrams: 50,
      surfacePair: 'wood-on-wood',
    });

    expect(fricRes.totalBlockMassKg).toBe(0.2);
    expect(fricRes.normalReactionN).toBeCloseTo(1.961, 2);
    expect(fricRes.limitingFrictionN).toBeCloseTo(0.686, 2);
    expect(fricRes.isAreaIndependent).toBe(true);

    // Verify Quiz Questions
    const questions = getPhysicsQuestions('limiting-friction');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('limiting force of static friction');
  });

  // =========================================================================
  // EXPERIMENT 8: FRICTION ON AN INCLINED PLANE
  // =========================================================================
  it('Experiment 8 (Inclined Plane): mounts variable angle ramp and captures angle of repose', async () => {
    const labDef = getLabDefinition('inclined-plane-friction');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('inclined-plane-friction');

    renderWithProviders(<UniversalLabWorkspace experimentId="inclined-plane-friction" initialMode="guided" />);

    expect(screen.getAllByText(/Friction on an Inclined Plane/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Configure Slider Block Mass/i)).toBeInTheDocument();
      expect(screen.getByText(/Capture the Angle of Repose/i)).toBeInTheDocument();
    });

    // Test Incline Angle Calculation
    const incRes = calculateInclinedPlanePhysics({
      blockMassGrams: 200,
      inclineAngleDeg: 25.0,
      surfacePair: 'wood-on-wood',
    });

    expect(incRes.angleReposeDeg).toBeCloseTo(19.29, 1);
    expect(incRes.isSlidingDownSpontaneously).toBe(true);
    expect(incRes.normalForceN).toBeCloseTo(1.778, 2);
    expect(incRes.parallelGravityN).toBeCloseTo(0.829, 2);

    // Verify Quiz
    const questions = getPhysicsQuestions('inclined-plane-friction');
    expect(questions).toHaveLength(4);
    expect(questions[1].question).toContain('angle of repose');
  });

  // =========================================================================
  // EXPERIMENT 9: HOOKE'S LAW AND SPRING CONSTANT
  // =========================================================================
  it('Experiment 9 (Hooke’s Law): mounts spring stand, measures extension, and computes spring constant', async () => {
    const labDef = getLabDefinition('hookes-law');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('hookes-law');

    renderWithProviders(<UniversalLabWorkspace experimentId="hookes-law" initialMode="guided" />);

    expect(screen.getAllByText(/Hooke's Law and Spring Constant/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Record Unstretched Baseline Pointer Position/i)).toBeInTheDocument();
      expect(screen.getByText(/Calculate Spring Constant/i)).toBeInTheDocument();
    });

    // Test Hooke's Law Formula (F = k * x)
    const hookeRes = calculateHookesLaw({
      springConstantNpm: 25.0,
      appliedMassGrams: 100.0,
      hangerMassGrams: 50.0, // total 150g -> F = 1.471 N
      unstretchedLengthMm: 120.0,
    });

    expect(hookeRes.appliedForceN).toBeCloseTo(1.471, 2);
    expect(hookeRes.extensionMm).toBeCloseTo(58.84, 1);
    expect(hookeRes.totalLengthMm).toBeCloseTo(178.84, 1);
    expect(hookeRes.isWithinElasticLimit).toBe(true);

    // Verify Quiz
    const questions = getPhysicsQuestions('hookes-law');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('What does Hooke’s Law state');
    expect(questions[0].options[0]).toContain('Within elastic limits, extension is directly proportional');
  });

  // =========================================================================
  // EXPERIMENT 10: BOYLE'S LAW
  // =========================================================================
  it('Experiment 10 (Boyle’s Law): mounts gas cylinder, adjusts volume, and verifies P*V constant', async () => {
    const labDef = getLabDefinition('boyles-law');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('boyles-law');

    renderWithProviders(<UniversalLabWorkspace experimentId="boyles-law" initialMode="guided" />);

    expect(screen.getAllByText(/Boyle's Law/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Establish Reference State at Atmospheric Pressure/i)).toBeInTheDocument();
      expect(screen.getByText(/Compress to Half Volume/i)).toBeInTheDocument();
    });

    // Test Boyle's Law Calculation (P * V = C)
    const boyleRes = calculateBoylesLaw({
      volumeMl: 30.0,
      referenceVolumeMl: 60.0,
      atmosphericPressureKpa: 101.325,
    });

    expect(boyleRes.pressureKpa).toBeCloseTo(202.65, 1);
    expect(boyleRes.pressureAtm).toBeCloseTo(2.0, 1);
    expect(boyleRes.pvProductKpaMl).toBeCloseTo(6079.5, 0);

    // Verify Quiz
    const questions = getPhysicsQuestions('boyles-law');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('how is the absolute pressure P of a fixed mass of ideal gas related');
  });

  // =========================================================================
  // WORKSPACE CONTROLS & MOBILE TOUCH INTERACTION
  // =========================================================================
  it('supports workspace toolbar reset and mobile touch gestures on canvas', async () => {
    const { container } = renderWithProviders(
      <UniversalLabWorkspace experimentId="parallelogram-law" initialMode="freelab" />
    );

    // Verify Reset button is present
    const resetBtn = screen.getAllByRole('button', { name: /Reset/i })[0];
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);

    // Mobile touch interaction on canvas stage container
    const stageContainer = container.querySelector('.konvajs-content') || container.querySelector('canvas') || container;
    expect(stageContainer).toBeInTheDocument();

    // Simulate multi-touch / touch drag gestures
    fireEvent.touchStart(stageContainer, {
      touches: [{ clientX: 150, clientY: 150, identifier: 0 }],
    });
    fireEvent.touchMove(stageContainer, {
      touches: [{ clientX: 200, clientY: 180, identifier: 0 }],
    });
    fireEvent.touchEnd(stageContainer, {
      changedTouches: [{ clientX: 200, clientY: 180, identifier: 0 }],
    });
  });
});
