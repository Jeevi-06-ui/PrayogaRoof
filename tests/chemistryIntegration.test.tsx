import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { getLabDefinition } from '../src/services/lab/registry';
import { getChemistryQuestions } from '../src/services/chemistry/chemistryQuestions';
import { getAllSubstances } from '../src/services/chemistry/chemicalRegistry';

describe('Phase 5: Chemistry Virtual Workbench UI Integration', () => {
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

  it('Experiment 1 (pH Testing): loads workspace with acid, base, neutral stock and spotting plate', async () => {
    const labDef = getLabDefinition('ph-testing');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('ph-testing');

    renderWithProviders(<UniversalLabWorkspace experimentId="ph-testing" initialMode="guided" />);

    // Verifies lab title
    expect(screen.getByText(/pH Testing with Universal Indicator/i)).toBeInTheDocument();

    // Verifies guided steps
    await waitFor(() => {
      expect(
        screen.getByText(/Inspect Stock Acid, Base, and Neutral Solutions/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Add Universal Indicator Droplet/i)).toBeInTheDocument();
    });

    // Verifies chemistry questions are available
    const questions = getChemistryQuestions('ph-testing');
    expect(questions.length).toBeGreaterThanOrEqual(3);
  });

  it('Experiment 2 (Natural Indicators): mounts turmeric and red cabbage extract setup', async () => {
    const labDef = getLabDefinition('natural-indicators');
    expect(labDef).toBeDefined();
    expect(labDef!.experimentId).toBe('natural-indicators');

    renderWithProviders(
      <UniversalLabWorkspace experimentId="natural-indicators" initialMode="guided" />
    );

    expect(screen.getByText(/Natural Acid-Base Indicators/i)).toBeInTheDocument();

    // Verifies natural indicator guided steps
    await waitFor(() => {
      expect(screen.getByText(/Examine Botanical Indicators/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Add Alkaline Base to Turmeric Indicator/i)
      ).toBeInTheDocument();
    });

    const questions = getChemistryQuestions('natural-indicators');
    expect(questions.length).toBeGreaterThanOrEqual(3);
  });

  it('provides Chemical Reagents tab with curriculum hazard tags and safety notes', async () => {
    renderWithProviders(<UniversalLabWorkspace experimentId="ph-testing" initialMode="freelab" />);

    // Click Reagents Tab in right sidebar
    const reagentsTab = screen.getByRole('button', { name: /Reagents/i });
    expect(reagentsTab).toBeInTheDocument();
    fireEvent.click(reagentsTab);

    // Verify presence of reagents
    await waitFor(() => {
      expect(screen.getByText(/0.1M Hydrochloric Acid/i)).toBeInTheDocument();
      expect(screen.getByText(/0.1M Sodium Hydroxide/i)).toBeInTheDocument();
      expect(screen.getByText(/Natural Turmeric Extract/i)).toBeInTheDocument();
      expect(screen.getByText(/Natural Red Cabbage Extract/i)).toBeInTheDocument();
    });

    // Verify educational safety notes
    expect(screen.getByText(/Standard laboratory mineral acid/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Safety Handling Note:/i).length).toBeGreaterThanOrEqual(5);

    // Verify all 10 substances exist in registry
    const substances = getAllSubstances();
    expect(substances.length).toBeGreaterThanOrEqual(10);
  });

  it('supports interactive chemistry conceptual quiz with verified pedagogical explanations', async () => {
    renderWithProviders(<UniversalLabWorkspace experimentId="ph-testing" initialMode="guided" />);

    const quizTab = screen.getByRole('button', { name: /Quiz/i });
    fireEvent.click(quizTab);

    await waitFor(() => {
      expect(
        screen.getByText(
          /On the standard pH scale \(0 to 14\) at 25°C, what numerical range defines an acidic solution\?/i
        )
      ).toBeInTheDocument();
    });

    // Select correct option: pH < 7.0
    const correctOpt = screen.getByRole('button', {
      name: /pH < 7\.0 \(high \[H⁺\] concentration\)/i,
    });
    fireEvent.click(correctOpt);

    await waitFor(() => {
      expect(screen.getByText(/✓ Correct!/i)).toBeInTheDocument();
      expect(
        screen.getByText(/The pH scale is defined as pH = -log₁₀\[H⁺\]/i)
      ).toBeInTheDocument();
    });
  });

  it('allows logging active chemistry bench readings into the Lab Notebook', async () => {
    renderWithProviders(<UniversalLabWorkspace experimentId="ph-testing" initialMode="guided" />);

    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    const quickLogBtn = screen.getByRole('button', { name: /Log Current Bench Readings/i });
    expect(quickLogBtn).toBeInTheDocument();

    fireEvent.click(quickLogBtn);

    await waitFor(() => {
      expect(screen.getByText(/Trial 1: Beaker A/i)).toBeInTheDocument();
      expect(screen.getByText(/pH = 1\.00/i)).toBeInTheDocument();
    });
  });
});
