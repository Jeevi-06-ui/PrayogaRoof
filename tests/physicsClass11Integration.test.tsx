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
  calculateVernierReading,
  calculateCylinderVolume,
  calculateScrewGaugeReading,
  calculateWireCrossSection,
  evaluateLaminaArea,
  calculateSpherometerRadius,
  calculateBeamBalanceState,
  STANDARD_LAMINA_VERTICES,
} from '../src/services/physics/precisionMechanicsModel';

describe('Physics Class 11 Interactive Laboratory Integration (All 5 Experiments)', () => {
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
  // EXPERIMENT 1: VERNIER CALLIPERS
  // =========================================================================
  it('Experiment 1 (Vernier Callipers): mounts callipers with cylinder/sphere specimens and logs readings', async () => {
    const labDef = getLabDefinition('vernier-callipers');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('vernier-callipers');

    renderWithProviders(<UniversalLabWorkspace experimentId="vernier-callipers" initialMode="guided" />);

    // Verify Title
    expect(screen.getAllByText(/Vernier Callipers/i)[0]).toBeInTheDocument();

    // Verify Guided Steps
    await waitFor(() => {
      expect(screen.getByText(/Determine Vernier Least Count/i)).toBeInTheDocument();
      expect(screen.getByText(/Calibrate Zero Error/i)).toBeInTheDocument();
    });

    // Test Precision Calculations
    const reading = calculateVernierReading(25.4, { zeroErrorMm: 0.0, vernierDivisions: 10 });
    expect(reading.leastCountMm).toBe(0.1);
    expect(reading.msrMm).toBe(25.0);
    expect(reading.vcd).toBe(4);
    expect(reading.correctedReadingMm).toBe(25.4);

    const cylVol = calculateCylinderVolume(25.4, 52.0);
    expect(cylVol.volumeCm3).toBeGreaterThan(25);

    // Verify Questions
    const questions = getPhysicsQuestions('vernier-callipers');
    expect(questions.length).toBeGreaterThanOrEqual(3);

    // Switch to Notebook tab and test auto-log
    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    await waitFor(() => {
      expect(screen.getByText(/Log Current Bench Readings/i)).toBeInTheDocument();
    });

    const logBtn = screen.getByText(/Log Current Bench Readings/i);
    fireEvent.click(logBtn);

    // Confirm entry was added
    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Vernier Calliper/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // EXPERIMENT 2: SCREW GAUGE
  // =========================================================================
  it('Experiment 2 (Screw Gauge): mounts micrometer with wire/plate specimens and computes wire area', async () => {
    const labDef = getLabDefinition('screw-gauge');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('screw-gauge');

    renderWithProviders(<UniversalLabWorkspace experimentId="screw-gauge" initialMode="guided" />);

    expect(screen.getAllByText(/Micrometer Screw Gauge/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Determine Pitch and Least Count/i)).toBeInTheDocument();
      expect(screen.getByText(/Measure Nichrome Wire Diameter/i)).toBeInTheDocument();
    });

    // Test Precision Calculations
    const sgReading = calculateScrewGaugeReading(0.46, { pitchMm: 1.0, circularDivisions: 100, zeroErrorDivisions: 0 });
    expect(sgReading.leastCountMm).toBe(0.01);
    expect(sgReading.psrMm).toBe(0.0);
    expect(sgReading.csr).toBe(46);
    expect(sgReading.correctedReadingMm).toBe(0.46);

    const wireArea = calculateWireCrossSection(0.46);
    expect(wireArea.areaMm2).toBeCloseTo(0.1662, 3);

    // Verify Questions
    const questions = getPhysicsQuestions('screw-gauge');
    expect(questions.length).toBeGreaterThanOrEqual(3);

    // Log to Notebook
    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    const logBtn = screen.getByText(/Log Current Bench Readings/i);
    fireEvent.click(logBtn);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Screw Gauge/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // EXPERIMENT 3: AREA OF AN IRREGULAR LAMINA
  // =========================================================================
  it('Experiment 3 (Area of an Irregular Lamina): mounts graph grid and counts squares for leaf lamina', async () => {
    const labDef = getLabDefinition('irregular-lamina');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('irregular-lamina');

    renderWithProviders(<UniversalLabWorkspace experimentId="irregular-lamina" initialMode="guided" />);

    expect(screen.getByText(/Area of an Irregular Lamina/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Place Lamina Over Millimeter Graph Grid/i)).toBeInTheDocument();
      expect(screen.getByText(/Count Fully Enclosed Squares/i)).toBeInTheDocument();
    });

    // Evaluate Grid square counting
    const gridEval = evaluateLaminaArea(STANDARD_LAMINA_VERTICES, 1.0);
    expect(gridEval.fullSquaresCount).toBeGreaterThan(0);
    expect(gridEval.calculatedAreaCm2).toBeGreaterThan(15);
    expect(gridEval.uncertaintyCm2).toBeGreaterThan(0);

    // Verify Questions
    const questions = getPhysicsQuestions('irregular-lamina');
    expect(questions.length).toBeGreaterThanOrEqual(3);

    // Log to Notebook
    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    const logBtn = screen.getByText(/Log Current Bench Readings/i);
    fireEvent.click(logBtn);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Irregular Lamina/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // EXPERIMENT 4: SPHEROMETER
  // =========================================================================
  it('Experiment 4 (Spherometer): mounts spherometer on convex surface and calculates radius R', async () => {
    const labDef = getLabDefinition('spherometer');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('spherometer');

    renderWithProviders(<UniversalLabWorkspace experimentId="spherometer" initialMode="guided" />);

    expect(screen.getAllByText(/Spherometer/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Measure Outer Leg Separation/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Calculate Radius of Curvature/i)[0]).toBeInTheDocument();
    });

    // Test Radius Calculation
    const sphRes = calculateSpherometerRadius(2.03, 0.0, { legDistanceMm: 40.0 });
    expect(sphRes.sagittaMm).toBeCloseTo(2.03, 2);
    expect(sphRes.radiusOfCurvatureCm).toBeCloseTo(13.24, 1);
    expect(sphRes.isValidGeometry).toBe(true);

    // Verify Questions
    const questions = getPhysicsQuestions('spherometer');
    expect(questions.length).toBeGreaterThanOrEqual(3);

    // Log to Notebook
    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    const logBtn = screen.getByText(/Log Current Bench Readings/i);
    fireEvent.click(logBtn);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Spherometer/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // EXPERIMENT 5: BEAM BALANCE
  // =========================================================================
  it('Experiment 5 (Beam Balance): mounts beam balance and achieves mechanical equilibrium', async () => {
    const labDef = getLabDefinition('beam-balance');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('beam-balance');

    renderWithProviders(<UniversalLabWorkspace experimentId="beam-balance" initialMode="guided" />);

    expect(screen.getAllByText(/Physical Beam Balance/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Level Balance and Verify Zero Resting Point/i)).toBeInTheDocument();
      expect(screen.getByText(/Add Calibrated Weights to Right Pan/i)).toBeInTheDocument();
    });

    // Test Balance State & Equilibrium
    const arrested = calculateBeamBalanceState(24.50, 20.00, true);
    expect(arrested.isArrested).toBe(true);
    expect(arrested.status).toBe('arrested');

    const balanced = calculateBeamBalanceState(24.50, 24.50, false);
    expect(balanced.isBalanced).toBe(true);
    expect(balanced.status).toBe('balanced');

    // Verify Questions
    const questions = getPhysicsQuestions('beam-balance');
    expect(questions.length).toBeGreaterThanOrEqual(3);

    // Log to Notebook
    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    const logBtn = screen.getByText(/Log Current Bench Readings/i);
    fireEvent.click(logBtn);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Beam Balance/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // INTERACTION & MOBILE TOUCH TESTS
  // =========================================================================
  it('supports Free Lab Mode, equipment catalogue, touch gestures, and reset/save', async () => {
    renderWithProviders(<UniversalLabWorkspace experimentId="vernier-callipers" initialMode="guided" />);

    // Switch to Free Lab mode
    const freeLabBtn = screen.getByRole('button', { name: /Free/i });
    fireEvent.click(freeLabBtn);

    // In Free Lab, Tool Catalogue is accessible
    await waitFor(() => {
      expect(screen.getByText(/Equipment Catalogue/i)).toBeInTheDocument();
    });

    // Test Mobile Touch Tap-to-add simulation on Catalogue
    const calliperItem = screen.getAllByText(/Vernier Callipers/i)[0];
    expect(calliperItem).toBeInTheDocument();

    // Trigger touchstart / touchend
    fireEvent.touchStart(calliperItem, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(calliperItem);

    // Test Reset Action
    const resetBtn = screen.getAllByRole('button', { name: /Reset/i })[0];
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);

    // Test Save Action
    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);
  });
});
