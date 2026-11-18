import { DemoAction, DemoScript, DemoStep } from './controller';
const step = (id: string, title: string, narration: string, actions: DemoStep['actions'] = [], duration = 7000): DemoStep => ({ id, title, narration, actions, duration });
const wire = (id: string, fromObjectId: string, fromPortId: string, toObjectId: string, toPortId: string): DemoAction => ({ kind: 'connect', connection: { id, fromObjectId, fromPortId, toObjectId, toPortId, type: 'wire' } });
const tools = [
  ['source', 'dc-power-supply', 80, 70], ['resistor', 'standard-resistor', 460, 90],
  ['ammeter', 'dc-ammeter', 80, 300], ['voltmeter', 'dc-voltmeter', 460, 300],
] as const;
export const ohmsLawDemo: DemoScript = {
  experimentId: 'ohms-law', title: "Ohm's Law — laboratory demonstration",
  segmentSteps: { intro: 'intro', apparatus: 'selection', procedure: 'setup', observation: 'measure', explanation: 'result', 'worked-example': 'calculate', mistakes: 'mistake' },
  steps: [
    step('intro', '1. Objective', 'Verify Ohm’s law using the same laboratory apparatus as your interactive workspace. We will measure current at a fixed resistance and compare voltage divided by current.'),
    step('selection', '2. Select equipment', 'Select an adjustable DC power supply, a precision resistor, a DC ammeter, and a DC voltmeter from the equipment catalogue.', tools.map(([, equipmentId], i) => ({ at: i * 1500, action: { kind: 'select', equipmentId } }))),
    step('placement', '3. Place the apparatus', 'Place the power supply on the left and the resistor on the right. Move the ammeter below the supply and the voltmeter below the resistor.', tools.flatMap(([id, equipmentId, x, y], i) => [
      { at: i * 1700, action: { kind: 'select', equipmentId } as DemoAction },
      { at: i * 1700, action: { kind: 'add', id, equipmentId, x: 10, y: 10 } as DemoAction },
      { at: i * 1700, action: { kind: 'move', id, x, y, duration: 1200 } as DemoAction },
    ]), 8000),
    step('setup', '4. Connect the circuit', 'With power switched off, connect the supply positive terminal to the ammeter, then the ammeter to the resistor. Return the resistor to supply negative. Connect the voltmeter across the resistor in parallel.', [
      { at: 0, action: { kind: 'set', id: 'source', property: 'powerSwitch', value: false } },
      { at: 700, action: wire('w1', 'source', 'pos', 'ammeter', 'pos') },
      { at: 1900, action: wire('w2', 'ammeter', 'neg', 'resistor', 'p1') },
      { at: 3100, action: wire('w3', 'resistor', 'p2', 'source', 'neg') },
      { at: 4300, action: wire('w4', 'voltmeter', 'pos', 'resistor', 'p1') },
      { at: 5500, action: wire('w5', 'voltmeter', 'neg', 'resistor', 'p2') },
    ], 9000),
    step('perform', '5. Set conditions and run', 'Set resistance to six ohms and supply voltage to twelve volts. Switch on the supply. The existing circuit solver now calculates the meter readings.', [
      { at: 0, action: { kind: 'set', id: 'resistor', property: 'resistance', value: 6 } },
      { at: 1500, action: { kind: 'set', id: 'source', property: 'voltage', value: 12 } },
      { at: 3000, action: { kind: 'set', id: 'source', property: 'powerSwitch', value: true } },
      { at: 3500, action: { kind: 'run' } },
    ]),
    step('measure', '6. Read the meters', 'Read the ammeter and voltmeter on the canvas. This ideal circuit gives two amperes and twelve volts. Observe the solver measurements below.', [{ at: 0, action: { kind: 'run' } }]),
    step('calculate', '7. Calculate resistance', 'Divide the measured voltage by the measured current. Twelve volts divided by two amperes gives six ohms, matching the selected resistor.'),
    step('result', '8. Compare a second trial', 'Reduce the supply to six volts while keeping resistance at six ohms. Run again. Current falls to one ampere. The voltage to current ratio remains six ohms in both trials.', [
      { at: 0, action: { kind: 'set', id: 'source', property: 'voltage', value: 6 } }, { at: 1000, action: { kind: 'run' } },
    ]),
    step('mistake', '9. Diagnose an open circuit', 'A missing return wire breaks the circuit. Watch the current fall to zero. Switch off before restoring the return connection. Switch on and run again to recover one ampere.', [
      { at: 0, action: { kind: 'disconnect', id: 'w3' } }, { at: 100, action: { kind: 'run' } },
      { at: 3500, action: { kind: 'set', id: 'source', property: 'powerSwitch', value: false } },
      { at: 4500, action: wire('w3', 'resistor', 'p2', 'source', 'neg') },
      { at: 5500, action: { kind: 'set', id: 'source', property: 'powerSwitch', value: true } }, { at: 5600, action: { kind: 'run' } },
    ], 9000),
    step('practice', '10. Try it yourself', 'Open a fresh practice workspace and assemble your own circuit. Keep the ammeter in series and the voltmeter in parallel. Record several voltage and current pairs at fixed resistance.'),
  ],
};
