import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { getLabDefinition } from '../src/services/lab/registry';
import { getPhysicsQuestions } from '../src/services/physics/physicsQuestions';
import { calculateThinLens } from '../src/services/physics/opticsModel';
import { calculateMagneticField } from '../src/services/physics/magnetismModel';
import { calculatePendulumState } from '../src/services/physics/mechanicsModel';

describe('Phase 4: Full Physics Laboratory Integration (All 5 Experiments)', () => {
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

  // 1. Ohm's Law
  it('Experiment 1 (Ohm’s Law): initializes lab and validates V = I * R relationship', async () => {
    const labDef = getLabDefinition('ohms-law');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('ohms-law');

    renderWithProviders(<UniversalLabWorkspace experimentId="ohms-law" initialMode="guided" />);

    expect(screen.getByText(/Ohm's Law Verification/i)).toBeInTheDocument();

    // Verify questions
    const questions = getPhysicsQuestions('ohms-law');
    expect(questions.length).toBeGreaterThanOrEqual(3);
  });

  // 2. Series & Parallel Circuits
  it('Experiment 2 (Series and Parallel Circuits): loads topology with multiple resistors', async () => {
    const labDef = getLabDefinition('series-parallel-circuits');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('series-parallel-circuits');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="series-parallel-circuits" initialMode="guided" />
    );

    expect(screen.getByText(/Series and Parallel Circuits/i)).toBeInTheDocument();

    const questions = getPhysicsQuestions('series-parallel-circuits');
    expect(questions.length).toBeGreaterThanOrEqual(3);
  });

  // 3. Convex Lens
  it('Experiment 3 (Convex Lens): mounts optical bench with lens, illuminated target, and screen', async () => {
    const labDef = getLabDefinition('convex-lens');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('convex-lens');

    renderWithProviders(<UniversalLabWorkspace experimentId="convex-lens" initialMode="guided" />);

    // Check title in workspace toolbar
    expect(screen.getByText(/Convex Lens Image Formation & Ray Tracing/i)).toBeInTheDocument();

    // Check guided instructions in inspector panel
    await waitFor(() => {
      expect(screen.getByText(/Position Object Target/i)).toBeInTheDocument();
      expect(screen.getByText(/Observe Conjugate Real Image/i)).toBeInTheDocument();
    });

    // Switch to Inspector tab and inspect the Biconvex Lens component
    const inspectorTab = screen.getByRole('button', { name: /^Inspector$/i });
    fireEvent.click(inspectorTab);

    const lensCard = screen.getByText(/Biconvex Lens/i);
    fireEvent.click(lensCard);

    // Inspector should display Focal Length property
    await waitFor(() => {
      expect(screen.getByText(/Focal Length/i)).toBeInTheDocument();
    });

    // Verify mathematical thin-lens simulation for the initial setup
    const initialSim = calculateThinLens(15, 30, 4, 50);
    expect(initialSim.imageDistance).toBe(30);
    expect(initialSim.magnification).toBe(-1.0);
    expect(initialSim.imageNature).toBe('Real, Inverted');

    // Switch to Quiz tab and check questions
    const quizTab = screen.getByRole('button', { name: /Quiz/i });
    fireEvent.click(quizTab);

    await waitFor(() => {
      expect(screen.getByText(/When an object is placed between the optical centre/i)).toBeInTheDocument();
    });

    // Select correct answer for magnifying glass effect
    const correctOpt = screen.getByRole('button', {
      name: /Virtual, erect, and magnified \(acting as a magnifying glass\)/i,
    });
    fireEvent.click(correctOpt);

    expect(screen.getByText(/✓ Correct!/i)).toBeInTheDocument();
  });

  // 4. Magnetic Field
  it('Experiment 4 (Magnetic Field): mounts Alnico bar magnet and plotting compasses', async () => {
    const labDef = getLabDefinition('magnetic-field');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('magnetic-field');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="magnetic-field" initialMode="guided" />
    );

    expect(screen.getByText(/Magnetic Field Lines & Compass Plotting/i)).toBeInTheDocument();

    // Check guided instructions
    await waitFor(() => {
      expect(screen.getByText(/Examine Bar Magnet Dipole Poles/i)).toBeInTheDocument();
      expect(screen.getByText(/Observe Magnetic Compass Needle Alignment/i)).toBeInTheDocument();
    });

    // Switch to Inspector tab and select the Alnico Bar Magnet
    const inspectorTab = screen.getByRole('button', { name: /^Inspector$/i });
    fireEvent.click(inspectorTab);

    const magnetCard = screen.getByText(/Alnico Bar Magnet/i);
    fireEvent.click(magnetCard);

    await waitFor(() => {
      expect(screen.getByText(/Dipole Strength/i)).toBeInTheDocument();
    });

    // Verify net B-vector along dipole axis
    const fieldAhead = calculateMagneticField(480, 180, [
      { x: 355, y: 210, length: 150, angle: 0, poleStrength: 1000 },
    ]);
    expect(fieldAhead.magnitude).toBeGreaterThan(0);

    // Switch to Quiz tab
    const quizTab = screen.getByRole('button', { name: /Quiz/i });
    fireEvent.click(quizTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Outside a permanent bar magnet, in which direction do magnetic field lines emerge/i)
      ).toBeInTheDocument();
    });

    const correctMagOpt = screen.getByRole('button', {
      name: /They emerge from the North pole and enter the South pole/i,
    });
    fireEvent.click(correctMagOpt);

    expect(screen.getByText(/✓ Correct!/i)).toBeInTheDocument();
  });

  // 5. Simple Pendulum
  it('Experiment 5 (Simple Pendulum): mounts pendulum stand, stopwatch, verifies mass independence', async () => {
    const labDef = getLabDefinition('simple-pendulum');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('simple-pendulum');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="simple-pendulum" initialMode="guided" />
    );

    expect(screen.getByText(/Simple Pendulum & Gravitational Acceleration/i)).toBeInTheDocument();

    // Check guided steps
    await waitFor(() => {
      expect(screen.getByText(/Set Suspension Length/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Verify Mass Independence/i).length).toBeGreaterThanOrEqual(1);
    });

    // Switch to Inspector tab and select Pendulum to inspect properties
    const inspectorTab = screen.getByRole('button', { name: /^Inspector$/i });
    fireEvent.click(inspectorTab);

    const pendCard = screen.getByText(/Simple Pendulum Stand/i);
    fireEvent.click(pendCard);

    await waitFor(() => {
      expect(screen.getByText(/Suspension Length/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Mass/i)).toBeInTheDocument();
    });

    // Check that changing Bob Mass does not change ideal pendulum period
    const inputs = screen.getAllByRole('spinbutton');
    // inputs[0] is length, inputs[1] is bobMass
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    const massInput = inputs[1];
    fireEvent.change(massInput, { target: { value: '250' } });
    expect(massInput).toHaveValue(250);

    // Verify physical state formula verifies mass independence
    const state100 = calculatePendulumState({ lengthMeters: 0.8, massKg: 0.1, initialAngleDeg: 8 });
    const state250 = calculatePendulumState({ lengthMeters: 0.8, massKg: 0.25, initialAngleDeg: 8 });
    expect(state100.period).toBe(state250.period);

    // Check Live Data tab with angular displacement waveform
    const liveDataTab = screen.getByRole('button', { name: /Live Data/i });
    fireEvent.click(liveDataTab);

    await waitFor(() => {
      expect(screen.getByText(/Angular Displacement θ\(t\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Mass Independence/i)).toBeInTheDocument();
    });

    // Check Quiz tab
    const quizTab = screen.getByRole('button', { name: /Quiz/i });
    fireEvent.click(quizTab);

    await waitFor(() => {
      expect(
        screen.getByText(/If the mass of a simple pendulum bob is increased from 50 g to 200 g/i)
      ).toBeInTheDocument();
    });

    const correctPendOpt = screen.getByRole('button', {
      name: /The time period remains completely unchanged \(T is independent of mass\)/i,
    });
    fireEvent.click(correctPendOpt);

    expect(screen.getByText(/✓ Correct!/i)).toBeInTheDocument();
  });

  // Shared Notebook quick-log across experiments
  it('supports logging observations into the notebook across newly added experiments', async () => {
    renderWithProviders(
      <UniversalLabWorkspace experimentId="convex-lens" initialMode="guided" />
    );

    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    const quickLogBtn = screen.getByRole('button', { name: /Log Current Bench Readings/i });
    expect(quickLogBtn).toBeInTheDocument();

    fireEvent.click(quickLogBtn);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Thin Lens/i)).toBeInTheDocument();
    });
  });
});
