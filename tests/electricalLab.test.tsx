import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { getLabDefinition } from '../src/services/lab/registry';

describe('Phase 3: Physics Electrical Laboratory UI Integration', () => {
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

  it('renders Ohm’s Law lab with voltage source, resistor, and meters', async () => {
    const labDef = getLabDefinition('ohms-law');
    expect(labDef).toBeDefined();

    renderWithProviders(<UniversalLabWorkspace experimentId="ohms-law" initialMode="guided" />);

    // Check title in toolbar
    expect(screen.getByText(/Ohm's Law Verification/i)).toBeInTheDocument();

    // Check Guided Mode steps in right panel
    await waitFor(() => {
      expect(screen.getByText(/Inspect DC Source and Resistor/i)).toBeInTheDocument();
      expect(screen.getByText(/Form Series Circuit Loop/i)).toBeInTheDocument();
    });
  });

  it('renders Series and Parallel Circuits lab with multiple resistors and switch', async () => {
    const labDef = getLabDefinition('series-parallel-circuits');
    expect(labDef).toBeDefined();

    renderWithProviders(<UniversalLabWorkspace experimentId="series-parallel-circuits" initialMode="guided" />);

    // Check title
    expect(screen.getByText(/Series and Parallel Circuits Analysis/i)).toBeInTheDocument();

    // Check guided instructions
    await waitFor(() => {
      expect(screen.getByText(/Examine DC Source and Resistors/i)).toBeInTheDocument();
    });
  });

  it('supports inspecting and editing DC voltage source properties', async () => {
    renderWithProviders(<UniversalLabWorkspace experimentId="ohms-law" initialMode="freelab" />);

    // Select the DC Power Source
    const psCard = screen.getByText(/DC Power Source/i);
    fireEvent.click(psCard);

    // Inspector should show Output Voltage property
    await waitFor(() => {
      expect(screen.getByText(/Output Voltage/i)).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(1);

    // Change first numeric input (voltage)
    fireEvent.change(inputs[0], { target: { value: '10' } });

    expect(inputs[0]).toHaveValue(10);
  });

  it('provides conceptual quiz check with immediate feedback and explanation', async () => {
    renderWithProviders(<UniversalLabWorkspace experimentId="ohms-law" initialMode="guided" />);

    // Switch to Quiz tab in inspector
    const quizTab = screen.getByRole('button', { name: /Quiz/i });
    fireEvent.click(quizTab);

    // Check questions appear
    await waitFor(() => {
      expect(screen.getByText(/According to Ohm’s Law/i)).toBeInTheDocument();
    });

    // Click the correct answer
    const correctOpt = screen.getByRole('button', {
      name: /The current is doubled \(I ∝ V\)/i,
    });
    fireEvent.click(correctOpt);

    // Verify feedback is shown
    expect(screen.getByText(/✓ Correct!/i)).toBeInTheDocument();
    expect(screen.getByText(/At constant temperature and resistance/i)).toBeInTheDocument();
  });

  it('allows logging active circuit bench readings into the notebook', async () => {
    renderWithProviders(<UniversalLabWorkspace experimentId="ohms-law" initialMode="guided" />);

    // Switch to Notebook tab
    const notebookTab = screen.getByRole('button', { name: /Notebook/i });
    fireEvent.click(notebookTab);

    // Check Quick Log button is present
    const quickLogBtn = screen.getByRole('button', { name: /Log Current Bench Readings/i });
    expect(quickLogBtn).toBeInTheDocument();

    // Click quick log
    fireEvent.click(quickLogBtn);

    // Measurement entry created in log table
    await waitFor(() => {
      expect(screen.getByText(/Trial 1:/i)).toBeInTheDocument();
    });
  });
});
