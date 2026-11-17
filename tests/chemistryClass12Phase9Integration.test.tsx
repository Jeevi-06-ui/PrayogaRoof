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

describe('Phase 9: Class 12 Chemistry Laboratory Integration (First 5 Experiments)', () => {
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

  it('Experiment 1: Surface Chemistry (Colloid Preparation & Tyndall Scattering)', async () => {
    const labDef = getLabDefinition('surface-chemistry');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('surface-chemistry');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="surface-chemistry" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Surface Chemistry/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Prepare Positive Fe\(OH\)₃ Lyophobic Sol/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Observe Tyndall Scattering Effect/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Contrast with True Solution and Lyophilic Sol/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Investigate Hardy-Schulze Coagulation Rule/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const colloidState = simResult.objectStateUpdates['colloid-bench-1'];
    expect(colloidState).toBeDefined();
    expect(colloidState.solName).toContain('Fe(OH)₃');
    expect(colloidState.solCategory).toBe('lyophobic');
    expect(colloidState.solCharge).toBe('positive');
    expect(colloidState.tyndallIntensityPercent).toBeGreaterThanOrEqual(80);
    expect(colloidState.coagulationStatus).toBe('stable-colloid');

    // Conceptual questions
    const questions = getChemistryQuestions('surface-chemistry');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('boiling water');
    expect(questions[2].question).toContain('Hardy-Schulze');
  });

  it('Experiment 2: Chemical Kinetics (Na2S2O3 + HCl Reaction Rate)', async () => {
    const labDef = getLabDefinition('chemical-kinetics');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('chemical-kinetics');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="chemical-kinetics" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Chemical Kinetics/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Flask A: High Concentration Run/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Flask B: Diluted Run/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Plot 1\/t vs Concentration/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const kinState = simResult.objectStateUpdates['kinetics-bench-1'];
    expect(kinState).toBeDefined();
    expect(kinState.effectiveThioM).toBeCloseTo(0.0833, 3);
    expect(kinState.timeToObscureSec).toBeCloseTo(16.0, 0);
    expect(kinState.ratePerSec).toBeGreaterThan(0.05);

    // Conceptual questions
    const questions = getChemistryQuestions('chemical-kinetics');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('cross mark');
    expect(questions[1].question).toContain('1/t');
  });

  it('Experiment 3: Thermochemistry (Enthalpy of Neutralization)', async () => {
    const labDef = getLabDefinition('thermochemistry');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('thermochemistry');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="thermochemistry" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Thermochemistry/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Equilibrate Reagent Temperatures/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Rapid Mixing Inside Insulated Cup/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Calculate Enthalpy of Neutralization/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const calState = simResult.objectStateUpdates['calorimeter-1'];
    expect(calState).toBeDefined();
    expect(calState.reactionName).toContain('HCl + 1.0M NaOH');
    expect(calState.molesReacted).toBeCloseTo(0.050, 3);
    expect(calState.theoreticalDeltaH).toBe(-57.32);
    expect(calState.experimentalDeltaH).toBeCloseTo(-57.32, 0);

    // Conceptual questions
    const questions = getChemistryQuestions('thermochemistry');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('-57.32 kJ/mol');
    expect(questions[1].question).toContain('acetic acid');
  });

  it('Experiment 4: Electrochemistry (Galvanic Daniell Cell & Nernst Equation)', async () => {
    const labDef = getLabDefinition('electrochemistry');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('electrochemistry');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="electrochemistry" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Electrochemistry/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Construct Standard Daniell Cell/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Insert Agar-Agar KCl Salt Bridge/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Nernst Equation Verification/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const danState = simResult.objectStateUpdates['daniell-cell-1'];
    expect(danState).toBeDefined();
    expect(danState.circuitClosed).toBe(true);
    expect(danState.standardEmfVolts).toBeCloseTo(1.103, 2);
    expect(danState.measuredEmfVolts).toBeCloseTo(1.103, 2);
    expect(danState.voltmeterReadingText).toContain('1.103 V');

    // Conceptual questions
    const questions = getChemistryQuestions('electrochemistry');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('salt bridge');
    expect(questions[2].question).toContain('Nernst equation');
  });

  it('Experiment 5: Paper Chromatography Class 12 (Inorganic Cation Separation)', async () => {
    const labDef = getLabDefinition('paper-chromatography-class12');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('paper-chromatography-class12');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(2);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="paper-chromatography-class12" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Paper Chromatography/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Deposit Micro-Drop of Cation Mixture/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Ascending Capillary Development/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Spray Development with Ammonium Sulphide/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Calculate Rf Values/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const paperState = simResult.objectStateUpdates['paper-c12-1'];
    expect(paperState).toBeDefined();
    expect(Number(paperState.solventFrontMm)).toBeGreaterThan(60);
    expect(String(paperState.rfSummary)).toContain('Lead');
    expect(String(paperState.rfSummary)).toContain('Cadmium');

    // Conceptual questions
    const questions = getChemistryQuestions('paper-chromatography-class12');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('ammonium sulphide');
    expect(questions[2].question).toContain('spinach leaf pigments');
    expect(questions[2].options[0]).toContain('Carotene');
  });
});
