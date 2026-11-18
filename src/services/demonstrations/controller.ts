import { WorkspaceObject, WorkspaceConnection, SimulationResult } from '../../types';
import { getEquipmentDefinition, getLabDefinition, runSimulation, validateConnection } from '../lab/registry';

export type DemoAction =
  | { kind: 'select'; equipmentId: string }
  | { kind: 'add'; equipmentId: string; id: string; x: number; y: number }
  | { kind: 'move'; id: string; x: number; y: number; duration: number }
  | { kind: 'rotate'; id: string; degrees: number }
  | { kind: 'set'; id: string; property: string; value: string | number | boolean }
  | { kind: 'connect'; connection: WorkspaceConnection }
  | { kind: 'disconnect'; id: string }
  | { kind: 'run' };
export interface DemoStep {
  id: string;
  title: string;
  narration: string;
  duration: number;
  actions: Array<{ at: number; action: DemoAction }>;
}
export interface DemoScript {
  experimentId: string;
  title: string;
  steps: DemoStep[];
  segmentSteps: Record<string, string>;
}
export interface DemoFrame {
  objects: WorkspaceObject[];
  connections: WorkspaceConnection[];
  selectedEquipmentId?: string;
  result?: SimulationResult;
}

/** Reconstruct from a blank, disposable workspace. Never reads or writes student storage. */
export function demoFrame(script: DemoScript, stepIndex: number, elapsed: number): DemoFrame {
  const lab = getLabDefinition(script.experimentId);
  if (!lab) throw new Error(`No canvas adapter for ${script.experimentId}`);
  const frame: DemoFrame = { objects: [], connections: [] };
  for (let i = 0; i <= stepIndex; i++) {
    const time = i < stepIndex ? Infinity : elapsed;
    for (const { at, action } of script.steps[i].actions) {
      if (at > time) continue;
      if (action.kind === 'select') {
        if (!lab.allowedEquipmentIds.includes(action.equipmentId)) throw new Error('Equipment is not allowed in this lab');
        frame.selectedEquipmentId = action.equipmentId;
      } else if (action.kind === 'add') {
        const eq = getEquipmentDefinition(action.equipmentId);
        if (!eq || !lab.allowedEquipmentIds.includes(eq.id) || frame.objects.some(o => o.id === action.id)) throw new Error('Invalid demo equipment');
        frame.objects.push({ id: action.id, equipmentId: eq.id, title: eq.name, x: action.x, y: action.y,
          width: eq.defaultWidth, height: eq.defaultHeight, rotation: 0,
          properties: Object.fromEntries(eq.propertyDefinitions.map(p => [p.id, p.defaultValue])), state: {} });
      } else if (action.kind === 'connect') {
        const c = action.connection;
        const from = frame.objects.find(o => o.id === c.fromObjectId);
        const to = frame.objects.find(o => o.id === c.toObjectId);
        const fp = from && getEquipmentDefinition(from.equipmentId)?.ports.find(p => p.id === c.fromPortId);
        const tp = to && getEquipmentDefinition(to.equipmentId)?.ports.find(p => p.id === c.toPortId);
        if (!from || !to || !fp || !tp || !validateConnection(from, fp, to, tp, frame.connections, lab.subjectId).allowed) throw new Error('Invalid demonstration connection');
        frame.connections.push({ ...c });
      } else if (action.kind === 'disconnect') {
        frame.connections = frame.connections.filter(c => c.id !== action.id);
      } else if (action.kind === 'run') {
        frame.result = runSimulation(frame.objects, frame.connections, lab.subjectId);
        frame.objects = frame.objects.map(o => ({ ...o, state: { ...o.state, ...frame.result!.objectStateUpdates[o.id] } }));
      } else {
        const obj = frame.objects.find(o => o.id === action.id);
        if (!obj) throw new Error(`Missing object ${action.id}`);
        if (action.kind === 'move') {
          const fraction = Math.min(1, Math.max(0, (time - at) / action.duration));
          obj.x += (action.x - obj.x) * fraction;
          obj.y += (action.y - obj.y) * fraction;
        } else if (action.kind === 'rotate') {
          const eq = getEquipmentDefinition(obj.equipmentId)!;
          if (!eq.rotatable || (eq.allowedRotations && !eq.allowedRotations.includes(action.degrees))) throw new Error('Unsupported rotation');
          obj.rotation = action.degrees;
        } else {
          const property = getEquipmentDefinition(obj.equipmentId)?.propertyDefinitions.find(p => p.id === action.property);
          if (!property || typeof action.value !== typeof property.defaultValue ||
            (typeof action.value === 'number' && (!Number.isFinite(action.value) ||
              (property.min !== undefined && action.value < property.min) || (property.max !== undefined && action.value > property.max)))) throw new Error('Invalid model parameter');
          obj.properties[action.property] = action.value;
        }
      }
    }
  }
  return frame;
}

export interface DemoNarrator {
  speak(text: string, rate: number, end: () => void, error: (message: string) => void): void;
  pause(): void;
  resume(): void;
  stop(): void;
}
export class DemoController {
  index = 0;
  elapsed = 0;
  playing = false;
  speed = 1;
  narration = true;
  error = '';
  private speechDone = true;
  private started = false;
  private token = 0;
  constructor(readonly script: DemoScript, private voice: DemoNarrator, private changed: () => void) {}
  private narrate() {
    this.voice.stop();
    const token = ++this.token;
    this.speechDone = !this.narration;
    if (this.narration) this.voice.speak(this.script.steps[this.index].narration, this.speed,
      () => { if (token === this.token) this.speechDone = true; },
      message => { if (token === this.token) { this.error = message; this.playing = false; this.changed(); } });
  }
  play() {
    this.error = '';
    this.playing = true;
    if (!this.started) { this.started = true; this.narrate(); } else this.voice.resume();
    this.changed();
  }
  pause() { this.playing = false; this.voice.pause(); this.changed(); }
  seek(index: number, autoplay = this.playing) {
    ++this.token;
    this.voice.stop();
    this.index = Math.max(0, Math.min(this.script.steps.length - 1, index));
    this.elapsed = 0; this.started = false; this.playing = false; this.error = '';
    if (autoplay) this.play(); else this.changed();
  }
  stop() { this.seek(0, false); }
  setSpeed(speed: number) { this.speed = Math.max(0.5, Math.min(2, speed)); this.seek(this.index, this.playing); }
  setNarration(enabled: boolean) { this.narration = enabled; this.seek(this.index, this.playing); }
  tick(delta: number) {
    if (!this.playing) return;
    this.elapsed = Math.min(this.script.steps[this.index].duration, this.elapsed + delta * this.speed);
    if (this.elapsed >= this.script.steps[this.index].duration && this.speechDone) {
      if (this.index + 1 < this.script.steps.length) { this.seek(this.index + 1, true); return; }
      this.playing = false; this.started = false;
    }
    this.changed();
  }
  dispose() { ++this.token; this.playing = false; this.voice.stop(); }
}
