/**
 * simulationNarrationService.ts
 *
 * Robust, Cross-Platform Narration & Audio Engine for PrayogaProof:
 * - Dual Narration Sources:
 *   1. Prerecorded Audio tracks / MP3 / M4A (via HTMLAudioElement) when available.
 *   2. Browser Text-to-Speech (via Web Speech API SpeechSynthesis) with asynchronous voice discovery.
 * - Solves Chromium & WebKit SpeechSynthesis garbage-collection bug with persistent utterance references.
 * - Prevents stale React closures, re-render speech cancellation, and background speech leaks.
 * - Handles Play, Pause, Resume, Replay, Stop, Volume, Mute, Playback Speed, and Voice Selection.
 * - Provides developer diagnostics and test voice verification.
 */

export type NarrationState = 'idle' | 'playing' | 'paused' | 'stopped' | 'error';
export type NarrationSource = 'speech-synthesis' | 'audio-element' | 'none';

export interface NarrationVoiceOption {
  id: string;
  name: string;
  lang: string;
  isDefault: boolean;
  isLocalService: boolean;
}

export interface NarrationStatus {
  state: NarrationState;
  source: NarrationSource;
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  rate: number;   // 0.5 to 2.0
  currentText: string;
  currentSegmentId?: string;
  errorMessage?: string;
  availableVoices: NarrationVoiceOption[];
  selectedVoiceId?: string;
  selectedVoiceName?: string;
  isSpeechSupported: boolean;
  isPrerecordedAudioAvailable: boolean;
  isOfflineReady: boolean;
}

declare global {
  interface Window {
    AndroidTTS?: {
      speak: (text: string, rate?: number, pitch?: number) => void;
      pause?: () => void;
      resume?: () => void;
      stop: () => void;
      isAvailable?: () => boolean;
      testVoice?: (phrase?: string) => void;
    };
  }
}

export type NarrationSubscriber = (status: NarrationStatus) => void;

class SimulationNarrationService {
  private state: NarrationState = 'idle';
  private source: NarrationSource = 'none';
  private isMuted: boolean = false;
  private volume: number = 1.0;
  private rate: number = 1.0;
  private currentText: string = '';
  private currentSegmentId?: string;
  private errorMessage?: string;

  private availableVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;

  // Persistent reference to prevent Chromium garbage collection of active utterance
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  // Audio element for recorded audio tracks
  private audioElement: HTMLAudioElement | null = null;
  private currentAudioUrl?: string;

  private subscribers: Set<NarrationSubscriber> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Initializes speech synthesis and listeners
   */
  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    if ('speechSynthesis' in window && window.speechSynthesis) {
      this.loadVoices();

      // Some browsers load voices asynchronously and fire `voiceschanged`
      try {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
        if (typeof window.speechSynthesis.addEventListener === 'function') {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            this.loadVoices();
          });
        }
      } catch {
        // Safe fallback if WebView restricts speech synthesis events
      }

      // Periodic check in case voiceschanged event doesn't fire on some platforms
      setTimeout(() => {
        if (this.availableVoices.length === 0) {
          this.loadVoices();
        }
      }, 500);
    }

    // Stop all speech when user navigates away or closes tab
    window.addEventListener('beforeunload', () => {
      this.stop();
    });

    this.isInitialized = true;
  }

  /**
   * Loads and categorizes available browser speech voices
   */
  private loadVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return;

    try {
      const voices = typeof window.speechSynthesis.getVoices === 'function'
        ? window.speechSynthesis.getVoices()
        : [];
      if (!voices || voices.length === 0) return;

      this.availableVoices = voices;

      // Filter and prefer high-quality English voices
      const englishVoices = voices.filter(
        (v) =>
          v.lang.startsWith('en') ||
          v.lang.includes('en-') ||
          v.lang.includes('en_')
      );

      // Preferred voice ranking heuristics
      const preferredKeywords = [
        'natural',
        'google',
        'premium',
        'enhanced',
        'samantha',
        'daniel',
        'karen',
        'victoria',
        'david',
        'zira',
        'george',
        'serena',
      ];

      let bestVoice: SpeechSynthesisVoice | undefined = undefined;

      // 1. Search for preferred keywords in English voices
      for (const kw of preferredKeywords) {
        bestVoice = englishVoices.find((v) =>
          v.name.toLowerCase().includes(kw)
        );
        if (bestVoice) break;
      }

      // 2. Search for any default English voice
      if (!bestVoice) {
        bestVoice = englishVoices.find((v) => v.default);
      }

      // 3. Any English voice
      if (!bestVoice && englishVoices.length > 0) {
        bestVoice = englishVoices[0];
      }

      // 4. Default system voice
      if (!bestVoice) {
        bestVoice = voices.find((v) => v.default) || voices[0];
      }

      if (!this.selectedVoice || !this.availableVoices.includes(this.selectedVoice)) {
        this.selectedVoice = bestVoice || null;
      }

      this.notifySubscribers();
    } catch (err) {
      console.warn('[PrayogaProof Narration] Failed to load speech voices:', err);
    }
  }

  /**
   * Starts audible narration for the given script or audioUrl
   */
  public async speak(
    text: string,
    options?: {
      segmentId?: string;
      audioUrl?: string;
      onEnd?: () => void;
      onError?: (error: Error) => void;
      rate?: number;
    }
  ): Promise<void> {
    this.init();

    // Clean text to avoid markdown and syntax characters in speech
    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText && !options?.audioUrl) return;

    this.currentText = cleanText;
    this.currentSegmentId = options?.segmentId;
    if (options?.rate !== undefined) {
      this.rate = options.rate;
    }

    // Stop any existing speech or audio
    this.stopInternal(false);

    // OPTION A: If recorded audio URL provided, attempt playback via HTMLAudioElement
    if (options?.audioUrl) {
      try {
        await this.playAudioElement(options.audioUrl, options.onEnd, options.onError);
        return;
      } catch (err) {
        console.warn(
          '[PrayogaProof Narration] Prerecorded audio failed, falling back to Web Speech API:',
          err
        );
      }
    }

    // OPTION 0: Native Android Text-to-Speech via Capacitor Bridge
    const androidTTS = typeof window !== 'undefined' ? window.AndroidTTS : null;
    if (androidTTS && typeof androidTTS.isAvailable === 'function' && androidTTS.isAvailable()) {
      try {
        if (this.isMuted) {
          androidTTS.stop?.();
        } else {
          androidTTS.speak(cleanText, this.rate, 1.0);
        }
        this.state = 'playing';
        this.source = 'speech-synthesis';
        this.errorMessage = undefined;
        this.notifySubscribers();

        // Approximate duration for completion callback
        const words = cleanText.split(/\s+/).length;
        const durationMs = Math.max(2000, (words / (140 * this.rate)) * 60 * 1000);
        setTimeout(() => {
          if (this.state === 'playing') {
            this.state = 'idle';
            this.notifySubscribers();
            options?.onEnd?.();
          }
        }, durationMs);
        return;
      } catch (err) {
        console.warn('[PrayogaProof Narration] AndroidTTS error, falling back:', err);
      }
    }

    // OPTION B: Browser SpeechSynthesis text-to-speech
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      !window.speechSynthesis ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      this.state = 'error';
      this.source = 'none';
      this.errorMessage =
        'Speech synthesis is not supported on this browser or platform.';
      this.notifySubscribers();
      options?.onError?.(new Error(this.errorMessage));
      return;
    }

    try {
      // Cancel any stuck speech in the browser engine
      try {
        window.speechSynthesis.cancel();
      } catch {}

      // Ensure voices are loaded
      if (this.availableVoices.length === 0) {
        this.loadVoices();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = Math.max(0.5, Math.min(2.0, this.rate));
      utterance.pitch = 1.0;
      utterance.volume = this.isMuted ? 0 : Math.max(0, Math.min(1.0, this.volume));

      // CRITICAL FIX: Retain active utterance reference on window to prevent Chrome GC bug
      this.activeUtterance = utterance;
      this.source = 'speech-synthesis';
      (window as unknown as { __prayogaActiveUtterance: SpeechSynthesisUtterance }).__prayogaActiveUtterance = utterance;

      utterance.onstart = () => {
        this.state = 'playing';
        this.source = 'speech-synthesis';
        this.errorMessage = undefined;
        this.notifySubscribers();
      };

      utterance.onend = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
          (window as unknown as { __prayogaActiveUtterance: null }).__prayogaActiveUtterance = null;
        }
        this.state = 'idle';
        this.notifySubscribers();
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        // 'canceled' or 'interrupted' is expected when switching segments or pausing
        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }
        console.error('[PrayogaProof Narration] SpeechSynthesis error:', e.error);
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
        this.state = 'error';
        this.errorMessage = `Speech synthesis error: ${e.error}`;
        this.notifySubscribers();
        options?.onError?.(new Error(this.errorMessage));
      };

      utterance.onpause = () => {
        this.state = 'paused';
        this.notifySubscribers();
      };

      utterance.onresume = () => {
        this.state = 'playing';
        this.notifySubscribers();
      };

      // Speak now
      window.speechSynthesis.speak(utterance);

      // Workaround for Chrome bug where speech pauses after ~15s
      this.keepUtteranceAlive();
    } catch (err) {
      console.error('[PrayogaProof Narration] Failed to execute speech synthesis:', err);
      this.state = 'error';
      this.errorMessage = err instanceof Error ? err.message : 'Unknown speech error';
      this.notifySubscribers();
      options?.onError?.(err instanceof Error ? err : new Error(this.errorMessage));
    }
  }

  /**
   * Workaround for Chrome/WebKit bug where long speech freezes
   */
  private keepUtteranceAlive(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const checkInterval = setInterval(() => {
      if (!this.activeUtterance || this.state !== 'playing') {
        clearInterval(checkInterval);
        return;
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 5000);
  }

  /**
   * Plays prerecorded audio via HTMLAudioElement
   */
  private playAudioElement(
    url: string,
    onEnd?: () => void,
    onError?: (err: Error) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      this.currentAudioUrl = url;
      this.audioElement.src = url;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      this.audioElement.playbackRate = this.rate;

      this.audioElement.onplay = () => {
        this.state = 'playing';
        this.source = 'audio-element';
        this.errorMessage = undefined;
        this.notifySubscribers();
        resolve();
      };

      this.audioElement.onended = () => {
        this.state = 'idle';
        this.notifySubscribers();
        onEnd?.();
      };

      this.audioElement.onerror = () => {
        const err = new Error(`Failed to load audio asset from: ${url}`);
        this.state = 'error';
        this.errorMessage = err.message;
        this.notifySubscribers();
        onError?.(err);
        reject(err);
      };

      this.audioElement.play().catch((playErr) => {
        reject(playErr);
      });
    });
  }

  /**
   * Pauses active narration
   */
  public pause(): void {
    const androidTTS = typeof window !== 'undefined' ? window.AndroidTTS : null;
    if (androidTTS && typeof androidTTS.stop === 'function') {
      try {
        androidTTS.stop();
        this.state = 'paused';
        this.notifySubscribers();
        return;
      } catch {}
    }

    if (this.source === 'speech-synthesis' || this.activeUtterance) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        try {
          window.speechSynthesis.pause();
        } catch {}
        this.state = 'paused';
        this.notifySubscribers();
      }
    } else if (this.source === 'audio-element' && this.audioElement) {
      this.audioElement.pause();
      this.state = 'paused';
      this.notifySubscribers();
    }
  }

  /**
   * Resumes paused narration
   */
  public resume(): void {
    if (this.source === 'speech-synthesis' || this.activeUtterance) {
      const androidTTS = typeof window !== 'undefined' ? window.AndroidTTS : null;
      if (androidTTS && typeof androidTTS.speak === 'function' && this.currentText) {
        this.speak(this.currentText, {
          segmentId: this.currentSegmentId,
          rate: this.rate,
        });
        return;
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.resume();
          } catch {}
          this.state = 'playing';
          this.notifySubscribers();
        } else if (this.currentText) {
          // If browser cleared paused state, restart utterance from current segment
          this.speak(this.currentText, {
            segmentId: this.currentSegmentId,
            rate: this.rate,
          });
        }
      }
    } else if (this.source === 'audio-element' && this.audioElement) {
      this.audioElement.play().then(() => {
        this.state = 'playing';
        this.notifySubscribers();
      }).catch(() => {});
    }
  }

  /**
   * Replays current speech
   */
  public replay(): void {
    if (this.currentText || this.currentAudioUrl) {
      this.speak(this.currentText, {
        segmentId: this.currentSegmentId,
        audioUrl: this.currentAudioUrl,
        rate: this.rate,
      });
    }
  }

  /**
   * Stops active speech and resets state
   */
  public stop(): void {
    this.stopInternal(true);
  }

  private stopInternal(notify: boolean): void {
    const androidTTS = typeof window !== 'undefined' ? window.AndroidTTS : null;
    if (androidTTS && typeof androidTTS.stop === 'function') {
      try {
        androidTTS.stop();
      } catch {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser cancellation errors
      }
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }

    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as unknown as { __prayogaActiveUtterance: null }).__prayogaActiveUtterance = null;
    }

    this.state = 'stopped';
    if (notify) {
      this.notifySubscribers();
    }
  }

  /**
   * Mute / Unmute controls
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;

    if (this.audioElement) {
      this.audioElement.volume = muted ? 0 : this.volume;
    }

    if (this.activeUtterance) {
      this.activeUtterance.volume = muted ? 0 : this.volume;
    }

    this.notifySubscribers();
  }

  public toggleMute(): void {
    this.setMuted(!this.isMuted);
  }

  /**
   * Volume control (0.0 to 1.0)
   */
  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1.0, vol));
    if (this.volume === 0) {
      this.isMuted = true;
    } else if (this.isMuted && this.volume > 0) {
      this.isMuted = false;
    }

    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.activeUtterance) {
      this.activeUtterance.volume = this.isMuted ? 0 : this.volume;
    }

    this.notifySubscribers();
  }

  /**
   * Playback Rate control (0.5x to 2.0x)
   */
  public setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2.0, rate));

    if (this.audioElement) {
      this.audioElement.playbackRate = this.rate;
    }

    // Note: If speech is currently playing, changing rate requires restarting the utterance on most engines
    if (this.state === 'playing' && this.source === 'speech-synthesis' && this.currentText) {
      this.speak(this.currentText, {
        segmentId: this.currentSegmentId,
        rate: this.rate,
      });
    } else {
      this.notifySubscribers();
    }
  }

  /**
   * Voice selection
   */
  public setVoice(voiceId: string): void {
    const found = this.availableVoices.find((v) => v.name === voiceId || v.voiceURI === voiceId);
    if (found) {
      this.selectedVoice = found;
      this.notifySubscribers();

      // If playing speech synthesis, restart with new voice
      if (this.state === 'playing' && this.source === 'speech-synthesis' && this.currentText) {
        this.speak(this.currentText, {
          segmentId: this.currentSegmentId,
          rate: this.rate,
        });
      }
    }
  }

  /**
   * Minimal verification test voice:
   * "This is PrayogaProof. Your simulation voice explanation is working."
   */
  public testVoice(
    customText: string = 'This is PrayogaProof. Your simulation voice explanation is working.'
  ): Promise<void> {
    return this.speak(customText, {
      segmentId: 'test-voice',
    });
  }

  /**
   * Subscribes to status updates
   */
  public subscribe(subscriber: NarrationSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.getStatus());
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notifySubscribers(): void {
    const status = this.getStatus();
    this.subscribers.forEach((sub) => {
      try {
        sub(status);
      } catch (err) {
        console.error('[PrayogaProof Narration] Subscriber error:', err);
      }
    });
  }

  /**
   * Retrieves current status
   */
  public getStatus(): NarrationStatus {
    const isSpeechSupported =
      (typeof window !== 'undefined' && 'speechSynthesis' in window && !!window.speechSynthesis) ||
      (typeof window !== 'undefined' && !!window.AndroidTTS?.isAvailable?.());

    return {
      state: this.state,
      source: this.source,
      isMuted: this.isMuted,
      volume: this.volume,
      rate: this.rate,
      currentText: this.currentText,
      currentSegmentId: this.currentSegmentId,
      errorMessage: this.errorMessage,
      availableVoices: this.availableVoices.map((v) => ({
        id: v.name,
        name: v.name,
        lang: v.lang,
        isDefault: v.default,
        isLocalService: v.localService,
      })),
      selectedVoiceId: this.selectedVoice?.name,
      selectedVoiceName: this.selectedVoice?.name || 'Default English Voice',
      isSpeechSupported,
      isPrerecordedAudioAvailable: !!this.currentAudioUrl,
      isOfflineReady: this.selectedVoice?.localService ?? false,
    };
  }

  /**
   * Cleans text to produce natural speech
   */
  private sanitizeTextForSpeech(rawText: string): string {
    return rawText
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/•/g, ', ')
      .replace(/→/g, ' yields ')
      .replace(/Δ/g, ' delta ')
      .replace(/Ω/g, ' ohms ')
      .replace(/Ψ/g, ' psi ')
      .replace(/μ/g, ' micro ')
      .replace(/±/g, ' plus or minus ')
      .replace(/²/g, ' squared ')
      .replace(/³/g, ' cubed ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Global Singleton Instance
export const narrationService = new SimulationNarrationService();
