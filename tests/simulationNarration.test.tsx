/**
 * simulationNarration.test.tsx
 *
 * Comprehensive Test Suite for PrayogaProof Audible Simulation Narration,
 * Shared Playback Synchronization, Audio Diagnostics, and Viva Remediation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { narrationService } from '../src/services/learning/simulationNarrationService';
import { getSimulationMedia } from '../src/services/learning/simulationMediaRegistry';
import { LoadSimulationSection } from '../src/components/learning/LoadSimulationSection';
import { SimulationVideoPlayer } from '../src/components/learning/SimulationVideoPlayer';
import { VivaSection } from '../src/components/learning/VivaSection';
import { AudioDiagnosticsPanel } from '../src/components/learning/AudioDiagnosticsPanel';

describe('PrayogaProof Simulation Narration Service', () => {
  beforeEach(() => {
    narrationService.stop();
    vi.clearAllMocks();
  });

  it('initializes speech synthesis and discovers available English voices', () => {
    const status = narrationService.getStatus();
    expect(status.isSpeechSupported).toBe(true);
    expect(status.availableVoices.length).toBeGreaterThanOrEqual(1);
    expect(status.selectedVoiceName).toContain('English');
    expect(status.volume).toBe(1.0);
    expect(status.rate).toBe(1.0);
    expect(status.isMuted).toBe(false);
  });

  it('speaks text using SpeechSynthesisUtterance with sanitized script', async () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    await narrationService.speak('In this circuit, resistance is 5 Ω and ΔV is 10 V.');

    expect(speakSpy).toHaveBeenCalled();
    const utterance = speakSpy.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toContain('ohms');
    expect(utterance.text).toContain('delta');

    // Verify Chrome GC bug prevention: window reference retained
    expect((window as any).__prayogaActiveUtterance).toBeDefined();
  });

  it('handles pause, resume, replay, and stop transitions', async () => {
    const pauseSpy = vi.spyOn(window.speechSynthesis, 'pause');
    const resumeSpy = vi.spyOn(window.speechSynthesis, 'resume');
    const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');

    await narrationService.speak('Test sentence for playback state.');

    narrationService.pause();
    expect(pauseSpy).toHaveBeenCalled();
    expect(narrationService.getStatus().state).toBe('paused');

    narrationService.resume();
    expect(resumeSpy).toHaveBeenCalled();

    narrationService.stop();
    expect(cancelSpy).toHaveBeenCalled();
    expect(narrationService.getStatus().state).toBe('stopped');
  });

  it('updates volume, mute state, and rate correctly', () => {
    narrationService.setVolume(0.75);
    expect(narrationService.getStatus().volume).toBe(0.75);

    narrationService.setMuted(true);
    expect(narrationService.getStatus().isMuted).toBe(true);

    narrationService.setMuted(false);
    expect(narrationService.getStatus().isMuted).toBe(false);

    narrationService.setRate(1.5);
    expect(narrationService.getStatus().rate).toBe(1.5);
  });

  it('executes Test Voice with exact verification phrase', async () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    await narrationService.testVoice();

    expect(speakSpy).toHaveBeenCalled();
    const utterance = speakSpy.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe(
      'This is PrayogaProof. Your simulation voice explanation is working.'
    );
  });
});

describe('LoadSimulationSection Audible Voice Features', () => {
  const media = getSimulationMedia('ohms-law');

  beforeEach(() => {
    narrationService.stop();
    vi.clearAllMocks();
  });

  it('renders the prominent "Play Simulation with Voice" button', () => {
    render(<LoadSimulationSection media={media} onReturnToLab={() => {}} />);

    const playVoiceBtn = screen.getByRole('button', { name: /Play Simulation with Voice/i });
    expect(playVoiceBtn).toBeInTheDocument();
  });

  it('triggers speech synthesis when clicking "Play Simulation with Voice"', async () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    render(<LoadSimulationSection media={media} onReturnToLab={() => {}} />);

    const playVoiceBtn = screen.getByRole('button', { name: /Play Simulation with Voice/i });
    fireEvent.click(playVoiceBtn);

    await waitFor(() => {
      expect(speakSpy).toHaveBeenCalled();
    });
  });

  it('renders Viva Remediation banner and handles "Play Explanation with Voice"', async () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
    const clearRemediationMock = vi.fn();

    render(
      <LoadSimulationSection
        media={media}
        onReturnToLab={() => {}}
        remediationTarget={{
          segmentId: 'explanation',
          questionId: 'viva-ohms-1',
        }}
        onClearRemediation={clearRemediationMock}
      />
    );

    expect(screen.getByText(/Viva Voce Remediation Mode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Play Explanation with Voice/i })).toBeInTheDocument();

    // Trigger explanation voice
    const playExplanationBtn = screen.getByRole('button', { name: /Play Explanation with Voice/i });
    fireEvent.click(playExplanationBtn);

    await waitFor(() => {
      expect(speakSpy).toHaveBeenCalled();
    });

    // Return button
    const returnVivaBtn = screen.getByRole('button', { name: /Return to Viva Question/i });
    fireEvent.click(returnVivaBtn);
    expect(clearRemediationMock).toHaveBeenCalled();
  });
});

describe('SimulationVideoPlayer Shared Audio & Visual Controls', () => {
  const media = getSimulationMedia('ohms-law');

  beforeEach(() => {
    narrationService.stop();
    vi.clearAllMocks();
  });

  it('renders functional Stop, Voice ON/OFF, and Speed controls', () => {
    render(<SimulationVideoPlayer media={media} />);

    expect(screen.getByRole('button', { name: /^Play simulation$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stop simulation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Disable voice narration/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Playback speed/i })).toBeInTheDocument();
  });

  it('stops speech synthesis when Stop button is clicked', () => {
    const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');

    render(<SimulationVideoPlayer media={media} />);

    const stopBtn = screen.getByRole('button', { name: /Stop simulation/i });
    fireEvent.click(stopBtn);

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('toggles voice narration on and off', () => {
    render(<SimulationVideoPlayer media={media} />);

    const voiceToggle = screen.getByRole('button', { name: /Disable voice narration/i });
    fireEvent.click(voiceToggle);

    // Now button should offer to enable voice
    expect(screen.getByRole('button', { name: /Enable voice narration/i })).toBeInTheDocument();
  });
});

describe('Viva Voce Remediation Routing with Voice', () => {
  const media = getSimulationMedia('ohms-law');

  it('renders "Review Simulation Explanation with Voice" on incorrect answers', () => {
    const remediateMock = vi.fn();

    render(
      <VivaSection
        media={media}
        onRemediate={remediateMock}
      />
    );

    // Select incorrect option for question 1 (e.g. option index 1)
    const options = screen.getAllByRole('button', { name: /The conductor must be kept in absolute vacuum/i });
    fireEvent.click(options[0]);

    // Submit viva
    const submitBtn = screen.getByRole('button', { name: /Submit & Evaluate/i });
    fireEvent.click(submitBtn);

    // Remediation buttons should appear for incorrect questions
    const reviewBtns = screen.getAllByRole('button', {
      name: /Review Simulation Explanation with Voice/i,
    });
    expect(reviewBtns.length).toBeGreaterThan(0);

    // Click first remediation button
    fireEvent.click(reviewBtns[0]);
    expect(remediateMock).toHaveBeenCalledWith('explanation', 'viva-ohms-1');
  });
});

describe('Audio Diagnostics Panel', () => {
  it('toggles panel and triggers Test Voice button', async () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    render(<AudioDiagnosticsPanel />);

    // Expand panel
    const toggleBtn = screen.getByRole('button', { name: /Audio & Speech Diagnostics/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Web Speech OK')).toBeInTheDocument();

    // Click test voice
    const testBtn = screen.getByRole('button', { name: /Test Voice/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(speakSpy).toHaveBeenCalled();
    });
  });
});
