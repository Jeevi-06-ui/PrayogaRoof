import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../src/context/ThemeContext';
import { StudentProvider } from '../src/context/StudentContext';
import { ExperimentDetailPage } from '../src/pages/ExperimentDetailPage';
import { EXPERIMENTS } from '../src/services/experimentRegistry';

// Mock speech synthesis for Node/JSDOM
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as SpeechSynthesis;
}

describe('All 79 Experiments Mount Stability Check', () => {
  EXPERIMENTS.forEach((exp) => {
    it(`mounts ExperimentDetailPage cleanly for ${exp.id} (${exp.subjectId})`, () => {
      const { unmount } = render(
        <ThemeProvider>
          <StudentProvider>
            <MemoryRouter initialEntries={[`/experiments/${exp.id}`]}>
              <Routes>
                <Route path="experiments/:experimentId" element={<ExperimentDetailPage />} />
              </Routes>
            </MemoryRouter>
          </StudentProvider>
        </ThemeProvider>
      );
      expect(document.body).toBeTruthy();
      unmount();
    });
  });
});
