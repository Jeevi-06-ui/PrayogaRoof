import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DemoController, DemoNarrator, DemoScript, demoFrame } from '../../services/demonstrations/controller';
import { narrationService } from '../../services/learning/simulationNarrationService';
import { getEquipmentDefinition } from '../../services/lab/registry';
import { LabCanvas } from '../workspace/canvas/LabCanvas';
import { UniversalLabWorkspace } from '../workspace/UniversalLabWorkspace';
import { Button } from '../shared/Button';

function createVoice(): DemoNarrator {
  let replay = () => {};
  return {
    speak: (text, rate, onEnd, onError, audioUrl) => {
      replay = () => {
        narrationService.setMuted(false);
        void narrationService.speak(text, { rate, audioUrl, onEnd, onError: e => onError(e.message) });
      };
      replay();
    },
    pause: () => narrationService.pause(),
    resume: () => {
      // Some WebViews discard a paused utterance. Retain the completion callbacks when restarting.
      const status = narrationService.getStatus();
      if (status.source === 'speech-synthesis' && !window.speechSynthesis?.paused) replay();
      else narrationService.resume();
    },
    stop: () => narrationService.stop(),
  };
}
const noop = () => {};
export default function DemonstrationPlayer({ script, segmentId, onReturnToLab, onReturnToViva }: {
  script: DemoScript; segmentId?: string; onReturnToLab: () => void; onReturnToViva?: () => void;
}) {
  const [, redraw] = useReducer(n => n + 1, 0);
  const controller = useMemo(() => new DemoController(script, createVoice(), redraw), [script]);
  const [captions, setCaptions] = useState(true);
  const [practice, setPractice] = useState(false);
  const [practiceKey, setPracticeKey] = useState(0);
  const [width, setWidth] = useState(700);
  const [fullscreenError, setFullscreenError] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const canvasContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (segmentId) controller.seek(script.steps.findIndex(s => s.id === script.segmentSteps[segmentId]), false);
  }, [controller, segmentId, script]);
  useEffect(() => {
    let raf = 0, previous = performance.now();
    const tick = (now: number) => { controller.tick(Math.min(100, now - previous)); previous = now; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const visibility = () => { if (document.hidden) controller.pause(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', visibility); controller.dispose(); };
  }, [controller]);
  useEffect(() => {
    if (!canvasContainer.current) return;
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    observer.observe(canvasContainer.current);
    return () => observer.disconnect();
  }, [practice]);
  const frame = demoFrame(script, controller.index, controller.elapsed);
  const step = script.steps[controller.index];
  const scale = Math.min(1, width / 720);
  const equipmentIds = script.equipmentIds;
  const measurements = frame.result?.activeMeasurements || [];
  const calculation = script.calculation;
  const measuredObject = frame.objects.find(o => o.id === calculation?.objectId);
  const denominator = Number(calculation && measuredObject?.state[calculation.denominatorKey]);
  const numerator = Number(calculation && measuredObject?.state[calculation.numeratorKey]);
  const progress = (controller.index + controller.elapsed / step.duration) / script.steps.length;
  const controlClass = 'min-h-[44px]';
  if (practice) return <section className="min-w-0 space-y-4">
    <h2 className="text-xl font-bold">Fresh practice workspace</h2>
    <p>Your original manual workspace and saved progress are preserved. This practice starts with an empty bench.</p>
    <Button onClick={() => setPractice(false)}>Back to demonstration</Button>
    <UniversalLabWorkspace key={practiceKey} experimentId={script.experimentId} initialMode="freelab" startEmpty />
  </section>;
  return <section ref={container} aria-label="Live experiment demonstration" className="min-w-0 space-y-4 rounded-2xl bg-white p-3 sm:p-5 dark:bg-slate-900 dark:text-slate-100">
    <h2 className="text-xl font-bold">{script.title}</h2>
    <p className="text-sm">Live canvas demonstration • No recorded video or bundled narration file yet.</p>
    <p className="text-xs">Script and canvas ship with the app. Offline browser caching and device narration availability have not been verified.</p>
    {segmentId && <p role="status">Viva review: press Play to hear this step. <Button onClick={onReturnToViva}>Return to Viva Question</Button></p>}
    <div className="flex flex-wrap gap-2" aria-label="Demonstration equipment catalogue">
      {equipmentIds.map(id => <div key={id} data-selected={frame.selectedEquipmentId === id} className={`rounded-lg border p-2 text-xs ${frame.selectedEquipmentId === id ? 'border-blue-500 bg-blue-100 text-blue-900' : 'border-slate-300'}`}>
        {frame.selectedEquipmentId === id ? 'Selected: ' : ''}{getEquipmentDefinition(id)?.name}
      </div>)}
    </div>
    <h3 className="font-bold" aria-live="polite">{step.title}</h3>
    <div ref={canvasContainer} className="relative h-[460px] min-w-0 overflow-hidden rounded-xl border" data-testid="demo-canvas">
      <div className="pointer-events-none h-full" aria-label="Automated laboratory canvas">
        <LabCanvas objects={frame.objects} connections={frame.connections} gridSnap={false} scale={scale}
          stagePosition={{ x: 0, y: 0 }} onStagePositionChange={noop} onSelectObject={noop} onSelectConnection={noop} onMoveObject={noop} onConnectPorts={noop} />
      </div>
    </div>
    <div className="flex flex-wrap gap-2 text-sm" aria-label="Live model measurements">
      {measurements.map(m => <span key={m.id} className="rounded bg-slate-100 p-2 text-slate-900">{m.label}: {m.value} {m.unit}</span>)}
      {frame.result?.errors.map(e => <p key={e} role="status">{e}</p>)}
      {frame.result?.messages.map(m => <p key={m}>{m}</p>)}
    </div>
    {calculation?.stepIds.includes(step.id) && Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0 && <p data-testid="demo-calculation" className="rounded-xl bg-emerald-100 p-3 font-mono text-emerald-950">{calculation.formula} = {numerator.toFixed(2)} {calculation.numeratorUnit} / {denominator.toFixed(2)} {calculation.denominatorUnit} = {(numerator / denominator).toFixed(2)} {calculation.resultUnit}</p>}
    {captions && <p className="rounded-xl bg-slate-950 p-4 text-sm text-white" data-testid="demo-caption">{step.narration}</p>}
    {controller.error && <p role="alert">Narration could not play: {controller.error} Enable a supported voice and press Play, or turn narration off to continue with captions.</p>}
    <progress aria-label="Demonstration progress" max={1} value={progress} className="w-full" />
    <div className="flex flex-wrap items-center gap-2">
      <Button className={controlClass} onClick={() => controller.play()} disabled={controller.playing}>{controller.elapsed > 0 ? 'Resume' : 'Play'}</Button>
      <Button className={controlClass} onClick={() => controller.pause()} disabled={!controller.playing}>Pause</Button>
      <Button className={controlClass} onClick={() => controller.seek(controller.index, true)}>Replay step</Button>
      <Button className={controlClass} onClick={() => controller.stop()}>Stop</Button>
      <Button className={controlClass} onClick={() => controller.seek(controller.index - 1)} disabled={controller.index === 0}>Previous step</Button>
      <Button className={controlClass} onClick={() => controller.seek(controller.index + 1)} disabled={controller.index === script.steps.length - 1}>Next step</Button>
      <Button className={controlClass} onClick={() => controller.seek(0, true)}>Restart demonstration</Button>
      <label className="p-2 text-sm">Speed <select aria-label="Playback speed" value={controller.speed} onChange={e => controller.setSpeed(Number(e.target.value))}>{[0.5, 1, 1.5, 2].map(n => <option key={n} value={n}>{n}×</option>)}</select></label>
      <label className="p-2 text-sm"><input type="checkbox" checked={controller.narration} onChange={e => controller.setNarration(e.target.checked)} /> Narration</label>
      <label className="p-2 text-sm"><input type="checkbox" checked={captions} onChange={e => setCaptions(e.target.checked)} /> Captions</label>
      {typeof document.documentElement.requestFullscreen === 'function' && <Button className={controlClass} onClick={() => {
        const promise = document.fullscreenElement ? document.exitFullscreen() : container.current?.requestFullscreen();
        promise?.catch(() => setFullscreenError('Fullscreen is unavailable in this browser.'));
      }}>Fullscreen</Button>}
    </div>
    {fullscreenError && <p role="status">{fullscreenError}</p>}
    <label className="block text-sm">Go to step <select aria-label="Demonstration step" className="min-h-[44px] max-w-full" value={controller.index} onChange={e => controller.seek(Number(e.target.value))}>{script.steps.map((s, i) => <option key={s.id} value={i}>{s.title}</option>)}</select></label>
    <div className="flex flex-wrap gap-2">
      <Button className={controlClass} onClick={() => { controller.pause(); setPracticeKey(k => k + 1); setPractice(true); }}>Try It Yourself</Button>
      <Button className={controlClass} variant="outline" onClick={onReturnToLab}>Return to your experiment</Button>
    </div>
    <details><summary className="min-h-[44px] cursor-pointer">Read demonstration transcript</summary><ol className="space-y-3">{script.steps.map(s => <li key={s.id}><strong>{s.title}</strong><p>{s.narration}</p></li>)}</ol></details>
  </section>;
}
