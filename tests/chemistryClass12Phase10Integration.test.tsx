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

describe('Phase 10: Class 12 Chemistry Laboratory Integration (Remaining 6 Experiments)', () => {
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

  it('Experiment 1: Inorganic Compound Preparation (Mohr’s Salt & Potash Alum)', async () => {
    const labDef = getLabDefinition('inorganic-compound-prep');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('inorganic-compound-prep');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="inorganic-compound-prep" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Preparation of Inorganic Compounds/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Equimolar Dissolution of Simple Salts/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Acidification with Dilute Sulphuric Acid/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Heating to Crystallization Point/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Undisturbed Cooling & Crystal Recovery/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const synthState = simResult.objectStateUpdates['inorganic-synth-1'];
    expect(synthState).toBeDefined();
    expect(synthState.compoundName).toContain('Mohr’s Salt');
    expect(synthState.currentStage).toBe('reactant-mixing');
    expect(synthState.crystalHabit).toContain('Monoclinic');

    // Conceptual questions
    const questions = getChemistryQuestions('inorganic-compound-prep');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('dilute sulphuric acid (H₂SO₄)');
    expect(questions[0].options[questions[0].correctIndex]).toContain('hydrolytic decomposition and aerial oxidation');
  });

  it('Experiment 2: Organic Compound Preparation (Acetanilide & Dibenzalacetone)', async () => {
    const labDef = getLabDefinition('organic-compound-prep');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('organic-compound-prep');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="organic-compound-prep" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Preparation of Organic Compounds/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Controlled Reagent Dissolution/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Controlled Heating \/ Agitation/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Ice Cooling & Nucleated Crystallization/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Filtration & Purity Verification/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const synthState = simResult.objectStateUpdates['organic-synth-1'];
    expect(synthState).toBeDefined();
    expect(synthState.compoundName).toContain('Acetanilide');
    expect(synthState.currentStage).toBe('reactant-mixing');

    // Conceptual questions
    const questions = getChemistryQuestions('organic-compound-prep');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('zinc dust added');
    expect(questions[0].options[questions[0].correctIndex]).toContain('prevent aerial oxidation');
  });

  it('Experiment 3: Functional Group Identification (7 Core Organic Groups)', async () => {
    const labDef = getLabDefinition('functional-group-identification');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('functional-group-identification');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="functional-group-identification" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Systematic Identification of Organic Functional Groups/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Test for Unsaturation/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Test for Alcoholic and Phenolic Hydroxyl/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Test for Carbonyl Groups/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Test for Carboxylic Acid/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const fgState = simResult.objectStateUpdates['fg-bench-1'];
    expect(fgState).toBeDefined();
    expect(fgState.sampleName).toContain('Cyclohexene');
    expect(fgState.testName).toContain('Bromine Water');
    expect(fgState.isPositive).toBe(true);
    expect(fgState.observation).toContain('discharged completely');

    // Conceptual questions
    const questions = getChemistryQuestions('functional-group-identification');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('neutral ferric chloride (FeCl₃)');
    expect(questions[0].options[questions[0].correctIndex]).toContain('[Fe(OC₆H₅)₆]³⁻');
  });

  it('Experiment 4: Food Component Testing (Carbohydrates, Proteins, Fats)', async () => {
    const labDef = getLabDefinition('food-component-testing');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('food-component-testing');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="food-component-testing" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Qualitative Testing of Food Components/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/General Carbohydrate Detection/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Reducing Sugars vs Polysaccharides/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Protein Detection/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Fats and Oils Testing/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const foodState = simResult.objectStateUpdates['food-bench-1'];
    expect(foodState).toBeDefined();
    expect(foodState.sampleName).toContain('Glucose');
    expect(foodState.nutrientTarget).toContain('Carbohydrates');
    expect(foodState.isPositive).toBe(true);
    expect(foodState.ringOrPptHex).toBe('#701a75'); // Violet ring

    // Conceptual questions
    const questions = getChemistryQuestions('food-component-testing');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('Molisch test for carbohydrates');
    expect(questions[0].options[questions[0].correctIndex]).toContain('furfural');
  });

  it('Experiment 5: Redox Titration (Potassium Permanganate vs Mohr’s Salt & Oxalic Acid)', async () => {
    const labDef = getLabDefinition('redox-titration-kmno4');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('redox-titration-kmno4');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="redox-titration-kmno4" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Redox Titration: Potassium Permanganate/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Burette Preparation & Upper Meniscus Reading/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Pipetting Analyte & Acidification/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Warming Requirement/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Titration to Self-Indicator Endpoint/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Stoichiometric Calculations/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const redoxState = simResult.objectStateUpdates['redox-titration-1'];
    expect(redoxState).toBeDefined();
    expect(redoxState.analyteName).toContain('Mohr’s Salt');
    expect(redoxState.equivalenceVolumeMl).toBe(10.0);
    expect(redoxState.upperMeniscusReading).toBe(0.0);

    // Conceptual questions
    const questions = getChemistryQuestions('redox-titration-kmno4');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('UPPER meniscus read');
    expect(questions[0].options[questions[0].correctIndex]).toContain('deeply colored and virtually opaque');
  });

  it('Experiment 6: Salt Analysis with Interfering Radicals (Class 12)', async () => {
    const labDef = getLabDefinition('salt-analysis-class12');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('salt-analysis-class12');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(1);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="salt-analysis-class12" initialMode="guided" />
    );

    // Verify title & guided steps
    await waitFor(() => {
      expect(screen.getAllByText(/Systematic Qualitative Salt Analysis with Interfering Radicals/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Preliminary & Flame Test Examination/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Detection of Interfering Radicals/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Phosphate Elimination Protocol/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Systematic Cation Group Analysis/i).length).toBeGreaterThan(0);
    });

    // Test simulation evaluation
    const simResult = chemistryExtension.evaluateSimulation(labDef!.initialObjects ?? [], []);
    expect(simResult.valid).toBe(true);

    const saltState = simResult.objectStateUpdates['salt-bench-12'];
    expect(saltState).toBeDefined();
    expect(saltState.selectedSalt).toBe('ca3_po4_2');
    expect(saltState.observation).toContain('canary-yellow');
    expect(saltState.inference).toContain('Phosphate (PO₄³⁻) present');

    // Conceptual questions
    const questions = getChemistryQuestions('salt-analysis-class12');
    expect(questions).toHaveLength(4);
    expect(questions[0].question).toContain('interfering acid radicals');
    expect(questions[0].options[questions[0].correctIndex]).toContain('insoluble and precipitate prematurely');
  });
});
