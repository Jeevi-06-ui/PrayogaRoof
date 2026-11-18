/**
 * simulationLearningSystem.test.tsx
 *
 * Comprehensive Test Suite for Phase A: Complete Simulation Video, Voice, Viva,
 * Grading and Gamification System (Shared Learning Interface & Load Simulation Section).
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StudentProvider } from '../src/context/StudentContext';
import { ExperimentDetailPage } from '../src/pages/ExperimentDetailPage';
import {
  getSimulationMedia,
} from '../src/services/learning/simulationMediaRegistry';
import { LoadSimulationSection } from '../src/components/learning/LoadSimulationSection';
import { ExperimentObservationsSection } from '../src/components/learning/ExperimentObservationsSection';
import { VivaSection } from '../src/components/learning/VivaSection';

const renderExperimentDetail = (experimentId: string = 'ohms-law') => {
  return render(
    <StudentProvider>
      <MemoryRouter initialEntries={[`/experiments/${experimentId}`]}>
        <Routes>
          <Route path="/experiments/:experimentId" element={<ExperimentDetailPage />} />
        </Routes>
      </MemoryRouter>
    </StudentProvider>
  );
};

describe('Phase A: Simulation Media Registry Engine', () => {
  it('loads verified media for Physics flagship experiment (Ohm’s Law)', () => {
    const media = getSimulationMedia('ohms-law');
    expect(media.experimentId).toBe('ohms-law');
    expect(media.subjectId).toBe('physics');
    expect(media.segments.length).toBe(7);
    expect(media.vivaQuestions.length).toBe(5);
    expect(media.workedExample.problem).toContain('nichrome wire');
    expect(media.commonMistakes.length).toBeGreaterThanOrEqual(3);
    expect(media.rubric.labWorkMarks).toBe(60);
    expect(media.rubric.vivaMarks).toBe(40);
  });

  it('loads verified media for Chemistry flagship experiment (Acid-Base Titration)', () => {
    const media = getSimulationMedia('acid-base-titration');
    expect(media.experimentId).toBe('acid-base-titration');
    expect(media.subjectId).toBe('chemistry');
    expect(media.segments.length).toBe(7);
    expect(media.workedExample.formula).toContain('M₁ · V₁');
    expect(media.vivaQuestions[0].options.length).toBe(4);
  });

  it('loads verified media for Biology flagship experiment (Osmosis)', () => {
    const media = getSimulationMedia('osmosis');
    expect(media.experimentId).toBe('osmosis');
    expect(media.subjectId).toBe('biology');
    expect(media.segments.length).toBe(7);
    expect(media.workedExample.problem).toContain('sucrose');
  });

  it('loads verified media for Mathematics flagship experiment (Quadratic Equations)', () => {
    const media = getSimulationMedia('quadratic');
    expect(media.experimentId).toBe('quadratic');
    expect(media.subjectId).toBe('mathematics');
    expect(media.segments.length).toBe(7);
    expect(media.workedExample.formula).toContain('b² - 4ac');
  });

  it('generates high-fidelity procedural media for any experiment in the curriculum', () => {
    const media = getSimulationMedia('beam-balance');
    expect(media.experimentId).toBe('beam-balance');
    expect(media.segments.length).toBe(7);
    expect(media.vivaQuestions.length).toBe(5);
    expect(media.workedExample.steps.length).toBeGreaterThanOrEqual(3);
    expect(media.rubric.totalMarks).toBe(100);
  });
});

describe('Phase A: ExperimentDetailPage 5-Tab Architecture', () => {
  it('renders all 5 mandatory tabs with the exact label "Load Simulation"', async () => {
    renderExperimentDetail('ohms-law');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: "Ohm's Law" })).toBeInTheDocument();
    });

    const nav = screen.getByRole('navigation', { name: /Experiment learning tabs/i });

    // Check all 5 tabs inside navigation bar
    expect(within(nav).getByRole('button', { name: /Overview/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Virtual Lab/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Load Simulation/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Observations/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Viva & Results/i })).toBeInTheDocument();
  });

  it('navigates from Overview to Virtual Lab via "Start Experiment" CTA', async () => {
    renderExperimentDetail('ohms-law');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Experiment/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Start Experiment/i }));

    // Virtual lab mode switches are active
    expect(screen.getAllByText(/Guided Mode/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Free Lab Canvas/i).length).toBeGreaterThanOrEqual(1);
  });

  it('navigates from Overview to Load Simulation via "Watch Simulation" CTA', async () => {
    renderExperimentDetail('ohms-law');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Watch Simulation/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Watch Simulation/i }));

    // In Load Simulation section
    expect(await screen.findByRole('region', { name: 'Live experiment demonstration' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to your experiment/i })).toBeInTheDocument();
  });

  it('preserves Virtual Lab workspace mounted in DOM when switching tabs', async () => {
    renderExperimentDetail('ohms-law');

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /Experiment learning tabs/i })).toBeInTheDocument();
    });

    const nav = screen.getByRole('navigation', { name: /Experiment learning tabs/i });

    // Click Virtual Lab
    fireEvent.click(within(nav).getByRole('button', { name: /Virtual Lab/i }));
    expect(screen.getAllByText(/Guided Mode/i).length).toBeGreaterThanOrEqual(1);

    // Now switch to "Load Simulation"
    fireEvent.click(within(nav).getByRole('button', { name: /Load Simulation/i }));
    expect(await screen.findByRole('region', { name: 'Live experiment demonstration' })).toBeInTheDocument();

    // Verify Guided Mode is still present in DOM (hidden container, not unmounted!)
    expect(screen.getAllByText(/Guided Mode/i).length).toBeGreaterThanOrEqual(1);

    // Now switch to "Observations"
    fireEvent.click(within(nav).getByRole('button', { name: /Observations/i }));
    expect(screen.getByText(/Observation Table & Data Logger/i)).toBeInTheDocument();

    // Guided Mode still in DOM
    expect(screen.getAllByText(/Guided Mode/i).length).toBeGreaterThanOrEqual(1);
  });
});

describe('Live LoadSimulationSection', () => {
  it('loads the real canvas with ten procedural steps and transcript', async () => {
    render(<LoadSimulationSection media={getSimulationMedia('ohms-law')} onReturnToLab={() => {}} />);
    expect(await screen.findByTestId('demo-canvas')).toBeInTheDocument();
    expect(within(screen.getByRole('combobox', { name: 'Demonstration step' })).getAllByRole('option')).toHaveLength(10);
    expect(screen.getByText('Read demonstration transcript')).toBeInTheDocument();
    expect(screen.getByTestId('demo-caption')).toHaveTextContent('Verify Ohm');
  });
  it('seeks to measurements and renders calculations from the actual model', async () => {
    render(<LoadSimulationSection media={getSimulationMedia('ohms-law')} onReturnToLab={() => {}} />);
    const steps = await screen.findByRole('combobox', { name: 'Demonstration step' });
    fireEvent.change(steps, { target: { value: '6' } });
    expect(screen.getByTestId('demo-calculation')).toHaveTextContent('12.00 V / 2.00 A = 6.00 Ω');
    fireEvent.click(screen.getByRole('button', { name: 'Try It Yourself' }));
    expect(screen.getByRole('heading', { name: 'Fresh practice workspace' })).toBeInTheDocument();
  });
});

describe('Phase A: ExperimentObservationsSection', () => {
  it('renders tabular observation rows and calculates mean derived value', () => {
    render(
      <ExperimentObservationsSection
        experimentId="ohms-law"
        initialNotes="Initial test note"
      />
    );

    expect(screen.getByText(/Observation Table & Data Logger/i)).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('Mean Derived Value')).toBeInTheDocument();
  });

  it('allows logging a new observation trial', () => {
    render(<ExperimentObservationsSection experimentId="ohms-law" />);

    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    // Trial #5 is added
    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  it('allows entering and saving student conclusions in the journal', async () => {
    render(<ExperimentObservationsSection experimentId="ohms-law" initialNotes="" />);

    const textarea = screen.getByPlaceholderText(/Type your experimental conclusions/i);
    fireEvent.change(textarea, { target: { value: 'Ohm’s law is strictly obeyed.' } });

    expect(screen.getByText(/Character count: 29/i)).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /Save Journal/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Saved to IndexedDB/i)).toBeInTheDocument();
    });
  });
});

describe('Phase A: VivaSection and 100-Mark Rubric Evaluation', () => {
  it('renders 5 viva questions and 100-mark rubric breakdown', () => {
    const media = getSimulationMedia('ohms-law');
    render(<VivaSection media={media} />);

    expect(screen.getByText(/Five Mandatory Viva Voce Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/100-Mark Evaluation Rubric Breakdown/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lab Work \(60\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Viva Voce \(40\)/i).length).toBeGreaterThanOrEqual(1);
  });

  it('evaluates answers upon submission and reveals score, grade, and explanations', async () => {
    const media = getSimulationMedia('ohms-law');
    render(<VivaSection media={media} />);

    // Select correct option for question 1 (index 0)
    const firstOption = screen.getAllByRole('button', { name: /Temperature and mechanical strain/i })[0];
    fireEvent.click(firstOption);

    // Submit & evaluate
    const submitBtn = screen.getByRole('button', { name: /Submit & Evaluate/i });
    fireEvent.click(submitBtn);

    // Results revealed
    expect(screen.getByText(/Retake Viva/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct \(\+8 Marks\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Explanation:/i).length).toBeGreaterThanOrEqual(1);
  });
});
