import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../src/pages/LandingPage';
import { DashboardPage } from '../src/pages/DashboardPage';
import { PhysicsPage } from '../src/pages/PhysicsPage';
import { ChemistryPage } from '../src/pages/ChemistryPage';
import { ComingSoonPage } from '../src/pages/ComingSoonPage';
import { ExperimentDetailPage } from '../src/pages/ExperimentDetailPage';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <StudentProvider>{ui}</StudentProvider>
    </ThemeProvider>
  );
};

describe('Application Pages', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  it('renders LandingPage with hero title and four subject cards', () => {
    renderWithProviders(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/The Free Interactive/i)).toBeInTheDocument();
    expect(screen.getByText(/STEM Laboratory/i)).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('Chemistry')).toBeInTheDocument();
    expect(screen.getByText('Biology')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('renders DashboardPage with real metrics and subjects', async () => {
    renderWithProviders(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Curious Learner!/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Physics Mastery')).toBeInTheDocument();
    expect(screen.getByText('Chemistry Mastery')).toBeInTheDocument();
  });

  it('renders PhysicsPage with 5 active experiments', async () => {
    renderWithProviders(
      <BrowserRouter>
        <PhysicsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Physics Virtual Bench')).toBeInTheDocument();
    expect(screen.getByText("Ohm's Law")).toBeInTheDocument();
    expect(screen.getByText('Convex Lens')).toBeInTheDocument();
    expect(screen.getByText('Series and Parallel Circuits')).toBeInTheDocument();
    expect(screen.getByText('Magnetic Field')).toBeInTheDocument();
    expect(screen.getByText('Simple Pendulum')).toBeInTheDocument();
  });

  it('renders ChemistryPage with 5 active experiments', async () => {
    renderWithProviders(
      <BrowserRouter>
        <ChemistryPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Chemistry Virtual Bench')).toBeInTheDocument();
    expect(screen.getByText('pH Testing')).toBeInTheDocument();
    expect(screen.getByText('Natural Indicators')).toBeInTheDocument();
    expect(screen.getByText('Paper Chromatography')).toBeInTheDocument();
    expect(screen.getByText('Displacement Reaction')).toBeInTheDocument();
    expect(screen.getByText('Crystallisation')).toBeInTheDocument();
  });

  it('renders ComingSoonPage for Biology with curriculum note', () => {
    renderWithProviders(
      <BrowserRouter>
        <ComingSoonPage subjectId="biology" />
      </BrowserRouter>
    );

    expect(screen.getByText('Biology Laboratory')).toBeInTheDocument();
    expect(screen.getByText(/Curriculum Development Phase/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 Architecture Boundary Note/i)).toBeInTheDocument();
  });

  it('renders ComingSoonPage for Mathematics with curriculum note', () => {
    renderWithProviders(
      <BrowserRouter>
        <ComingSoonPage subjectId="mathematics" />
      </BrowserRouter>
    );

    expect(screen.getByText('Mathematics Laboratory')).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 Architecture Boundary Note/i)).toBeInTheDocument();
  });

  it('renders ExperimentDetailPage with metadata and tabs for Ohm’s Law', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/experiments/ohms-law']}>
        <Routes>
          <Route path="/experiments/:experimentId" element={<ExperimentDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: "Ohm's Law" })).toBeInTheDocument();
    });

    expect(screen.getByText(/Standard Laboratory Procedure/i)).toBeInTheDocument();
    expect(screen.getByText(/Guided Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Free Lab Canvas/i)).toBeInTheDocument();
    expect(screen.getByText(/Apparatus & Safety/i)).toBeInTheDocument();
  });
});
