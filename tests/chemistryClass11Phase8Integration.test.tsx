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

describe('Phase 8: Class 11 Chemistry Laboratory Integration (Remaining 5 Experiments)', () => {
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

  it('Experiment 1: Chemical Equilibrium (Le Chatelier’s Principle)', async () => {
    const labDef = getLabDefinition('chemical-equilibrium');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('chemical-equilibrium');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="chemical-equilibrium" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Chemical Equilibrium/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Observe Dynamic Solution Equilibrium/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Perturb Reactant Concentration/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Sequestration with Fluoride Ions/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const chamberState = simResult.objectStateUpdates['eq-chamber-1'];
    expect(chamberState).toBeDefined();
    expect(chamberState.system).toBe('fe-scn');
    expect(Number(chamberState.kc)).toBeGreaterThan(100);
    expect(chamberState.opticalAppearance).toContain('Blood-Red');

    // Test questions
    const questions = getChemistryQuestions('chemical-equilibrium');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('Fe³⁺(aq) + SCN⁻(aq)');
  });

  it('Experiment 2: Standard Solution Preparation (0.1 M Oxalic Acid)', async () => {
    const labDef = getLabDefinition('standard-solution-prep');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('standard-solution-prep');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(3);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="standard-solution-prep" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Preparation of a Standard Solution of Oxalic Acid/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Calculate Solute Mass Required/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Weigh Solute on Analytical Balance/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Transfer to Volumetric Flask/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const flaskState = simResult.objectStateUpdates['vol-flask-1'];
    expect(flaskState).toBeDefined();
    expect(flaskState.soluteName).toContain('Oxalic Acid');
    expect(flaskState.actualMolarityM).toBeCloseTo(0.1, 2);
    expect(flaskState.isMeniscusAligned).toBe(true);

    // Test questions
    const questions = getChemistryQuestions('standard-solution-prep');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('primary standard solute');
  });

  it('Experiment 3: Acid-Base Titration (NaOH vs Oxalic Acid)', async () => {
    const labDef = getLabDefinition('acid-base-titration');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('acid-base-titration');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="acid-base-titration" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Determination of NaOH Strength by Titration/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Measure Standard Acid into Conical Flask/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Fill Burette with Sodium Hydroxide/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Detect Sharp Permanent Pale Pink Endpoint/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const titState = simResult.objectStateUpdates['titration-station-1'];
    expect(titState).toBeDefined();
    expect(titState.system).toBe('oxalic-acid-naoh');
    expect(titState.equivalenceVolumeMl).toBe(40.0);
    expect(Number(titState.ph)).toBeLessThan(2.5);

    // Test questions
    const questions = getChemistryQuestions('acid-base-titration');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('stoichiometric equivalence relationship');
  });

  it('Experiment 4: Systematic Qualitative Salt Analysis', async () => {
    const labDef = getLabDefinition('salt-analysis-class11');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('salt-analysis-class11');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="salt-analysis-class11" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Qualitative Analysis of Inorganic Salts/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Physical Examination of Sample/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dry Heating Test in Ignition Tube/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Systematic Cation Group Separation/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const saltState = simResult.objectStateUpdates['salt-bench-1'];
    expect(saltState).toBeDefined();
    expect(saltState.selectedSalt).toBe('nh4cl');
    expect(saltState.testName).toBe('Physical & Visual Examination');

    // Test questions
    const questions = getChemistryQuestions('salt-analysis-class11');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('ammonium ion');
  });

  it('Experiment 5: Organic Element Detection (Lassaigne Extract)', async () => {
    const labDef = getLabDefinition('organic-element-detection');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('organic-element-detection');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="organic-element-detection" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Qualitative Detection of Nitrogen, Sulphur, and Halogens/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Understand Lassaigne Sodium Fusion Principle/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Prussian Blue Test for Nitrogen/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Sodium Nitroprusside Test for Sulphur/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const elemState = simResult.objectStateUpdates['element-bench-1'];
    expect(elemState).toBeDefined();
    expect(elemState.selectedSample).toBe('urea');
    expect(elemState.isPositive).toBe(true);
    expect(elemState.precipitateLabel).toContain('Prussian Blue');

    // Test questions
    const questions = getChemistryQuestions('organic-element-detection');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('sodium fusion');
  });
});
