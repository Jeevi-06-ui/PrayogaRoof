/**
 * AudioDiagnosticsPanel.tsx
 *
 * Developer & Engineering Audio Diagnostics Interface:
 * - Real-time inspection of Web Speech API and HTMLAudioElement state
 * - Available speech voices list and selected voice indicator
 * - Playback state, source, volume, mute, and rate
 * - Error logs and speech synthesis exception detection
 * - Direct "Test Voice" trigger ("This is PrayogaProof. Your simulation voice explanation is working.")
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import { useSimulationNarration } from '../../hooks/useSimulationNarration';
import { Button } from '../shared/Button';

export const AudioDiagnosticsPanel: React.FC = () => {
  const narration = useSimulationNarration();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestVoice = async () => {
    try {
      setTestResult('Playing test speech...');
      await narration.testVoice('This is PrayogaProof. Your simulation voice explanation is working.');
      setTestResult('Speech synthesis invoked successfully.');
    } catch (err) {
      setTestResult(`Test failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 text-slate-200 text-xs shadow-xl overflow-hidden">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 px-4 flex items-center justify-between bg-slate-850 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 font-mono">
            Audio & Speech Diagnostics
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
              narration.state === 'playing'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : narration.state === 'error'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {narration.state}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px] font-mono">
            {narration.availableVoices.length} Voices
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible Diagnostics Body */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-slate-800 text-xs font-mono">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Engine Support</div>
              <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                {narration.isSpeechSupported ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Web Speech OK
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Unsupported
                  </>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Active Source</div>
              <div className="font-bold text-cyan-400 mt-0.5 truncate">
                {narration.source}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Volume / Mute</div>
              <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                {narration.isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{narration.isMuted ? 'Muted' : `${Math.round(narration.volume * 100)}%`}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Speech Rate</div>
              <div className="font-bold text-slate-200 mt-0.5">
                {narration.rate}x
              </div>
            </div>
          </div>

          {/* Voice Selection Details */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold uppercase">
                Selected English Voice:
              </span>
              <span className="text-slate-500">
                {narration.selectedVoiceName || 'Default System Voice'}
              </span>
            </div>

            <select
              value={narration.selectedVoiceId || ''}
              onChange={(e) => narration.setVoice(e.target.value)}
              aria-label="Select speech synthesis voice"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {narration.availableVoices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.lang}) {v.isLocalService ? '[Offline Local]' : '[Network]'}
                </option>
              ))}
              {narration.availableVoices.length === 0 && (
                <option value="">No installed speech voices detected</option>
              )}
            </select>
          </div>

          {/* Error Banner */}
          {narration.errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Audio Error:</span> {narration.errorMessage}
              </div>
            </div>
          )}

          {/* Test Voice Control & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={handleTestVoice}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                Test Voice
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => narration.stop()}
              >
                Stop Speech
              </Button>
            </div>

            {testResult && (
              <span className="text-[11px] text-slate-400 italic">
                {testResult}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
