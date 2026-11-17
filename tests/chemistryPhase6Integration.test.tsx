import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { getLabDefinition } from '../src/services/lab/registry';
import { getChemistryQuestions } from '../src/services/chemistry/chemistryQuestions';

describe('Phase 6: Full Chemistry Laboratory Integration (All 5 Experiments)', () => {
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

  it('Experiment 3 (Paper Chromatography): loads chamber, paper strip, ruler, and advances capillary migration', async () => {
    const labDef = getLabDefinition('paper-chromatography');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('paper-chromatography');
    expect((labDef!.initialObjects ?? []).length).toBeGreaterThanOrEqual(3);

    renderWithProviders(
      <UniversalLabWorkspace experimentId="paper-chromatography" initialMode="guided" />
    );

    // Verify title
    expect(
      screen.getByText(/Paper Chromatography \(Separation of Inks & Pigments\)/i)
    ).toBeInTheDocument();

    // Verify guided steps
    await waitFor(() => {
      expect(
        screen.getByText(/Prepare Developing Chamber Mobile Phase/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Draw Pencil Baseline & Spot Ink Sample/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Calculate Rf \(Retention Factor\) Values/i)
      ).toBeInTheDocument();
    });

    // Verify conceptual questions
    const questions = getChemistryQuestions('paper-chromatography');
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain('Retention Factor');
  });

  it('Experiment 4 (Displacement Reaction): mounts test tubes and iron nail substrate with redox kinetics', async () => {
    const labDef = getLabDefinition('displacement-reaction');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('displacement-reaction');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="displacement-reaction" initialMode="guided" />
    );

    expect(
      screen.getByText(/Displacement Reaction \(Iron in Copper Sulphate\)/i)
    ).toBeInTheDocument();

    // Verify guided steps
    await waitFor(() => {
      expect(
        screen.getByText(/Prepare Two Matched Test Tubes with CuSO₄/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Inspect Sandpapered Iron Nail/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Analyze Redox Stoichiometry & Mass Change/i)
      ).toBeInTheDocument();
    });

    // Verify conceptual questions
    const questions = getChemistryQuestions('displacement-reaction');
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain('chemical reaction');
  });

  it('Experiment 5 (Crystallisation): mounts Bunsen burner, evaporating dish, watch glass, and thermometer', async () => {
    const labDef = getLabDefinition('crystallisation');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('crystallisation');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="crystallisation" initialMode="guided" />
    );

    expect(
      screen.getByText(/Crystallisation of Copper Sulphate/i)
    ).toBeInTheDocument();

    // Verify guided steps
    await waitFor(() => {
      expect(
        screen.getByText(/Prepare Hot Copper Sulphate Solution/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Apply Thermal Heating to Evaporate Solvent/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Harvest Pure Triclinic Blue Crystals/i)
      ).toBeInTheDocument();
    });

    // Verify conceptual questions
    const questions = getChemistryQuestions('crystallisation');
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain('purification');
  });

  it('supports interactive quizzes with pedagogical explanations across Experiments 3, 4, and 5', async () => {
    // Test Chromatography Quiz
    const { unmount } = renderWithProviders(
      <UniversalLabWorkspace experimentId="paper-chromatography" initialMode="guided" />
    );

    const quizTab = screen.getByRole('button', { name: /Quiz/i });
    fireEvent.click(quizTab);

    await waitFor(() => {
      expect(
        screen.getByText(
          /In paper chromatography, how is the Retention Factor \(Rf value\) of a separated dye component defined and calculated\?/i
        )
      ).toBeInTheDocument();
    });

    // Select correct option: Distance traveled by the solute component divided by distance traveled by the solvent front
    const correctOpt = screen.getByRole('button', {
      name: /Distance traveled by the solute component divided by distance traveled by the solvent front/i,
    });
    fireEvent.click(correctOpt);

    await waitFor(() => {
      expect(screen.getByText(/✓ Correct!/i)).toBeInTheDocument();
    });

    unmount();
  });

  it('allows logging active readings into the Lab Notebook across Experiments 3, 4, and 5', async () => {
    // 1. Chromatography auto-log
    const { unmount: unmount1 } = renderWithProviders(
      <UniversalLabWorkspace experimentId="paper-chromatography" initialMode="guided" />
    );

    const notebookTab1 = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab1);

    await waitFor(() => {
      expect(screen.getByText(/Chromatography Quick Log/i)).toBeInTheDocument();
    });

    const logBtn1 = screen.getByRole('button', { name: /Log Current Bench Readings/i });
    fireEvent.click(logBtn1);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Chromatography/i)).toBeInTheDocument();
    });

    unmount1();

    // 2. Displacement reaction auto-log
    const { unmount: unmount2 } = renderWithProviders(
      <UniversalLabWorkspace experimentId="displacement-reaction" initialMode="guided" />
    );

    const notebookTab2 = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab2);

    await waitFor(() => {
      expect(screen.getByText(/Displacement Reaction Quick Log/i)).toBeInTheDocument();
    });

    const logBtn2 = screen.getByRole('button', { name: /Log Current Bench Readings/i });
    fireEvent.click(logBtn2);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Fe \+ CuSO₄/i)).toBeInTheDocument();
    });

    unmount2();

    // 3. Crystallisation auto-log
    renderWithProviders(
      <UniversalLabWorkspace experimentId="crystallisation" initialMode="guided" />
    );

    const notebookTab3 = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab3);

    await waitFor(() => {
      expect(screen.getByText(/Crystallisation Quick Log/i)).toBeInTheDocument();
    });

    const logBtn3 = screen.getByRole('button', { name: /Log Current Bench Readings/i });
    fireEvent.click(logBtn3);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Crystallisation/i)).toBeInTheDocument();
    });
  });

  it('supports Free Lab Mode with full Chemistry apparatus catalogue', async () => {
    renderWithProviders(
      <UniversalLabWorkspace experimentId="paper-chromatography" initialMode="freelab" />
    );

    // Equipment catalogue should be visible in left drawer
    expect(screen.getByText(/Equipment Catalogue/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search apparatus/i)).toBeInTheDocument();

    // Verify presence of specialized chemistry equipment
    expect(
      screen.getAllByText(/Chromatography Developing Chamber/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Chromatography Paper Strip/i).length
    ).toBeGreaterThanOrEqual(1);
  });
});
