import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { MathematicsPage } from '../src/pages/MathematicsPage';
import { DashboardPage } from '../src/pages/DashboardPage';
import { BiologyPage } from '../src/pages/BiologyPage';
import { getSubjectById } from '../src/services/experimentRegistry';
import { resetAllData } from '../src/services/studentProgressService';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <StudentProvider>{ui}</StudentProvider>
    </ThemeProvider>
  );
};

describe('Mathematics Module Integration', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  it('verifies Mathematics is active in the subject registry with 12 experiments', () => {
    const mathSubject = getSubjectById('mathematics');
    expect(mathSubject).toBeDefined();
    expect(mathSubject?.status).toBe('active');
    expect(mathSubject?.name).toBe('Mathematics');
    expect(mathSubject?.totalExperiments).toBe(12);
    expect(mathSubject?.availableExperiments).toBe(12);
  });

  it('verifies Biology is active with 15 curriculum experiments', () => {
    const bioSubject = getSubjectById('biology');
    expect(bioSubject).toBeDefined();
    expect(bioSubject?.status).toBe('active');
    expect(bioSubject?.totalExperiments).toBe(15);
  });

  it('renders MathematicsPage with banner, badges, controls, and sandboxed iframe', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/subjects/mathematics']}>
        <Routes>
          <Route path="/subjects/mathematics" element={<MathematicsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title and Header
    expect(screen.getByRole('heading', { name: 'Mathematics Laboratory' })).toBeInTheDocument();
    expect(screen.getByText('Active Interactive Laboratory')).toBeInTheDocument();
    expect(screen.getByText(/Classes 10, 11 & 12/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Offline Ready/i)).toBeInTheDocument();

    // Stats / Badges
    expect(screen.getByText(/41 Chapters/i)).toBeInTheDocument();
    expect(screen.getByText(/12 Dedicated Interactive Simulators/i)).toBeInTheDocument();
    expect(screen.getByText(/Isolated Storage & Zero External CDNs/i)).toBeInTheDocument();

    // Action buttons
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reload')).toBeInTheDocument();
    expect(screen.getByText('Full Tab')).toBeInTheDocument();

    // Iframe host
    const iframe = screen.getByTitle('PrayogaProof Interactive Mathematics Laboratory') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute('src')).toBe('/math-module/index.html');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    expect(iframe.getAttribute('sandbox')).toContain('allow-same-origin');

    // Technical footnote
    expect(screen.getByText(/Storage: IndexedDB \(PrayogaProofDB\)/i)).toBeInTheDocument();
  });

  it('renders Mathematics active card on the Dashboard linking to /subjects/mathematics', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects/mathematics" element={<MathematicsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    // Check Mathematics card is present
    const mathCardTitle = screen.getByText('Mathematics');
    expect(mathCardTitle).toBeInTheDocument();

    const enterMathLabLink = screen.getByText('Enter Mathematics Lab');
    expect(enterMathLabLink).toBeInTheDocument();
  });

  it('confirms Biology Virtual Laboratory renders with active experiments', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/subjects/biology']}>
        <Routes>
          <Route path="/subjects/biology" element={<BiologyPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Biology Virtual Laboratory')).toBeInTheDocument();
    expect(screen.getByText(/NEET-UG Aligned/i)).toBeInTheDocument();
  });
});
