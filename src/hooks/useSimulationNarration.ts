/**
 * useSimulationNarration.ts
 *
 * Custom React hook for controlling and observing PrayogaProof audible narration.
 * Provides synchronized playback state, volume, rate, and voice controls.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  narrationService,
  NarrationStatus,
} from '../services/learning/simulationNarrationService';

export function useSimulationNarration() {
  const [status, setStatus] = useState<NarrationStatus>(() =>
    narrationService.getStatus()
  );

  useEffect(() => {
    const unsubscribe = narrationService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const speak = useCallback(
    (
      text: string,
      options?: {
        segmentId?: string;
        audioUrl?: string;
        onEnd?: () => void;
        onError?: (err: Error) => void;
        rate?: number;
      }
    ) => {
      return narrationService.speak(text, options);
    },
    []
  );

  const pause = useCallback(() => {
    narrationService.pause();
  }, []);

  const resume = useCallback(() => {
    narrationService.resume();
  }, []);

  const replay = useCallback(() => {
    narrationService.replay();
  }, []);

  const stop = useCallback(() => {
    narrationService.stop();
  }, []);

  const toggleMute = useCallback(() => {
    narrationService.toggleMute();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    narrationService.setMuted(muted);
  }, []);

  const setVolume = useCallback((vol: number) => {
    narrationService.setVolume(vol);
  }, []);

  const setRate = useCallback((rate: number) => {
    narrationService.setRate(rate);
  }, []);

  const setVoice = useCallback((voiceId: string) => {
    narrationService.setVoice(voiceId);
  }, []);

  const testVoice = useCallback((customText?: string) => {
    return narrationService.testVoice(customText);
  }, []);

  return {
    ...status,
    speak,
    pause,
    resume,
    replay,
    stop,
    toggleMute,
    setMuted,
    setVolume,
    setRate,
    setVoice,
    testVoice,
  };
}
