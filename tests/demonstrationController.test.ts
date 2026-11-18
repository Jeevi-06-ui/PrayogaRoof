import { describe, it, expect, vi } from 'vitest';
import { DemoController, DemoNarrator, demoFrame, DemoScript } from '../src/services/demonstrations/controller';
import { ohmsLawDemo } from '../src/services/demonstrations/ohmsLaw';
import { getLabDefinition } from '../src/services/lab/registry';
import type { ContainerLiquidState } from '../src/services/chemistry/chemistryTypes';
import {
  getDemonstrationScript,
  hasDemonstrationScript,
  getAllRegisteredDemonstrationIds,
} from '../src/services/demonstrations/registry';
const index = (id: string) => ohmsLawDemo.steps.findIndex(s => s.id === id);
const frame = (id: string, time = 10000) => demoFrame(ohmsLawDemo, index(id), time);
function fixture() {
  let ended = () => {};
  let failed = (_message: string) => {};
  const voice: DemoNarrator = { speak: vi.fn((_text, _rate, end, error) => { ended = end; failed = error; }), pause: vi.fn(), resume: vi.fn(), stop: vi.fn() };
  const changed = vi.fn();
  const controller = new DemoController(ohmsLawDemo, voice, changed);
  return { controller, voice, changed, end: () => ended(), fail: (s: string) => failed(s) };
}
describe('isolated live laboratory demonstration', () => {
  it('uses the actual catalogue and engine to obtain 12 V / 2 A and 6 V / 1 A', () => {
    const first = frame('measure');
    expect(first.result?.valid).toBe(true);
    expect(first.objects.find(o => o.id === 'resistor')?.state.currentAmps).toBeCloseTo(2);
    expect(first.objects.find(o => o.id === 'resistor')?.state.voltageDrop).toBeCloseTo(12);
    const second = frame('result');
    expect(second.objects.find(o => o.id === 'resistor')?.state.currentAmps).toBeCloseTo(1);
    expect(second.objects.find(o => o.id === 'resistor')?.state.voltageDrop).toBeCloseTo(6);
  });
  it('animates placement and reconstructs identical state after backwards seeking', () => {
    const moving = frame('placement', 600).objects[0];
    expect(moving.x).toBe(45);
    const original = frame('setup');
    frame('mistake');
    expect(frame('setup')).toEqual(original);
    expect(frame('intro').objects).toHaveLength(0);
    expect(original.connections).toHaveLength(5);
  });
  it('shows an actual open circuit and restores current after correcting it', () => {
    const broken = frame('mistake', 1000);
    expect(broken.connections).toHaveLength(4);
    expect(Number(broken.objects.find(o => o.id === 'resistor')?.state.currentAmps)).toBe(0);
    expect(frame('mistake').objects.find(o => o.id === 'resistor')?.state.currentAmps).toBeCloseTo(1);
  });
  it('never changes the registered manual workspace or shares mutable objects', () => {
    const lab = JSON.stringify(getLabDefinition('ohms-law'));
    frame('result').objects[0].properties.voltage = 99;
    expect(frame('result').objects[0].properties.voltage).toBe(6);
    expect(JSON.stringify(getLabDefinition('ohms-law'))).toBe(lab);
  });
  it('waits for both visuals and narration, pauses both, and ignores stale speech callbacks', () => {
    const f = fixture();
    f.controller.play(); f.controller.tick(20000);
    expect(f.controller.index).toBe(0);
    f.controller.pause(); f.controller.tick(10000);
    expect(f.voice.pause).toHaveBeenCalled();
    f.end(); f.controller.play(); f.controller.tick(1);
    expect(f.controller.index).toBe(1);
    f.controller.seek(4, true);
    f.controller.tick(20000);
    expect(f.controller.index).toBe(4);
    f.controller.stop();
    expect(f.controller.elapsed).toBe(0);
    expect(f.controller.playing).toBe(false);
  });
  it('stops on audio failure and permits explicit captions-only playback', () => {
    const f = fixture(); f.controller.play(); f.fail('No voice');
    expect(f.controller.playing).toBe(false);
    expect(f.controller.error).toBe('No voice');
    f.controller.setNarration(false); f.controller.play(); f.controller.tick(20000);
    expect(f.controller.index).toBe(1);
    f.controller.setSpeed(2); expect(f.controller.speed).toBe(2);
    f.controller.dispose(); expect(f.controller.playing).toBe(false);
  });
  it('rejects invalid equipment and connection scripts', () => {
    const bad = structuredClone(ohmsLawDemo);
    bad.steps[0].actions = [{ at: 0, action: { kind: 'add', id: 'x', equipmentId: 'not-a-tool', x: 0, y: 0 } }];
    expect(() => demoFrame(bad, 0, 0)).toThrow('Invalid demo equipment');
  });

  it('supports virtual chemical liquid transfer and substance conservation', () => {
    const chemDemo: DemoScript = {
      experimentId: 'ph-testing',
      title: 'pH Testing Transfer Demo',
      equipmentIds: ['beaker-100ml', 'beaker-50ml'],
      segmentSteps: { intro: 'step1' },
      steps: [
        {
          id: 'step1',
          title: 'Liquid Transfer',
          narration: 'Transfer 25 mL of hydrochloric acid into a smaller beaker.',
          duration: 3000,
          actions: [
            { at: 0, action: { kind: 'add', id: 'b1', equipmentId: 'beaker-100ml', x: 50, y: 50 } },
            { at: 100, action: { kind: 'set', id: 'b1', property: 'reagentSolution', value: 'hcl' } },
            { at: 200, action: { kind: 'set', id: 'b1', property: 'liquidVolume', value: 80 } },
            { at: 500, action: { kind: 'add', id: 'b2', equipmentId: 'beaker-50ml', x: 200, y: 50 } },
            { at: 600, action: { kind: 'set', id: 'b2', property: 'liquidVolume', value: 0 } },
            { at: 1000, action: { kind: 'transfer', fromId: 'b1', toId: 'b2', volumeMl: 25 } },
          ],
        },
      ],
    };

    const resultFrame = demoFrame(chemDemo, 0, 2000);
    const b1 = resultFrame.objects.find((o) => o.id === 'b1');
    const b2 = resultFrame.objects.find((o) => o.id === 'b2');

    const c1 = b1?.state.liquidContainer as unknown as ContainerLiquidState | undefined;
    const c2 = b2?.state.liquidContainer as unknown as ContainerLiquidState | undefined;

    expect(c1).toBeDefined();
    expect(c2).toBeDefined();
    expect(c1?.totalVolumeMl).toBe(55);
    expect(c2?.totalVolumeMl).toBe(25);
    expect(c2?.components[0].substanceId).toBe('hcl');
  });

  it('exposes centralized demonstration script registry', () => {
    expect(hasDemonstrationScript('ohms-law')).toBe(true);
    expect(hasDemonstrationScript('non-existent-experiment')).toBe(false);
    expect(getDemonstrationScript('ohms-law')?.experimentId).toBe('ohms-law');
    expect(getAllRegisteredDemonstrationIds()).toContain('ohms-law');
  });
});
