import { describe, it, expect } from 'vitest';
import {
  solveDCCircuit,
  formatVoltage,
  formatCurrent,
} from '../src/services/circuit/circuitSolver';
import { getConceptualQuestions } from '../src/services/circuit/conceptualQuestions';
import { WorkspaceObject, WorkspaceConnection } from '../src/types';

function wire(
  id: string,
  fromObjectId: string,
  fromPortId: string,
  toObjectId: string,
  toPortId: string,
  color = '#ef4444'
): WorkspaceConnection {
  return {
    id,
    fromObjectId,
    fromPortId,
    toObjectId,
    toPortId,
    color,
    type: 'wire',
  };
}

describe('Phase 3: Physics Electrical Laboratory Circuit Solver (MNA Engine)', () => {
  /* =========================================================================
     1. BENCHMARK CASES SPECIFIED IN REQUIREMENTS
     ========================================================================= */
  describe('Mandatory Known Circuit Benchmark Tests', () => {
    // Benchmark 1: One 6 Ω resistor across 12 V: 2 A. Req = 6 Ω.
    it('Benchmark 1: should solve one 6 Ω resistor across 12 V DC source (I = 2 A, Req = 6 Ω)', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: '12V Source',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 12.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'Resistor 6Ω',
          x: 400,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('w-1', 'ps-1', 'pos', 'res-1', 'p1', '#ef4444'),
        wire('w-2', 'res-1', 'p2', 'ps-1', 'neg', '#1e293b'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isValid).toBe(true);
      expect(result.isOpenCircuit).toBe(false);
      expect(result.isShortCircuit).toBe(false);
      expect(result.totalVoltage).toBe(12.0);
      expect(result.totalCurrent).toBeCloseTo(2.0, 3);
      expect(result.equivalentResistance).toBeCloseTo(6.0, 2);

      // Verify resistor component state
      const resState = result.componentStates['res-1'];
      expect(resState).toBeDefined();
      expect(resState.voltageDrop).toBeCloseTo(12.0, 2);
      expect(resState.current).toBeCloseTo(2.0, 3);
      expect(resState.power).toBeCloseTo(24.0, 2); // P = V * I = 12 * 2 = 24 W
      expect(resState.isEnergized).toBe(true);
    });

    // Benchmark 2: Two 6 Ω resistors in series across 12 V: 1 A. Req = 12 Ω, 6 V drops.
    it('Benchmark 2: should solve two 6 Ω resistors in series across 12 V (I = 1 A, Req = 12 Ω, 6V drops)', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: '12V Source',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 12.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'R1 (6Ω)',
          x: 350,
          y: 80,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
        {
          id: 'res-2',
          equipmentId: 'standard-resistor',
          title: 'R2 (6Ω)',
          x: 350,
          y: 200,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
      ];

      // Series connection: PS(+) -> R1(p1); R1(p2) -> R2(p1); R2(p2) -> PS(-)
      const connections: WorkspaceConnection[] = [
        wire('w-1', 'ps-1', 'pos', 'res-1', 'p1'),
        wire('w-2', 'res-1', 'p2', 'res-2', 'p1'),
        wire('w-3', 'res-2', 'p2', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isValid).toBe(true);
      expect(result.isOpenCircuit).toBe(false);
      expect(result.isShortCircuit).toBe(false);
      expect(result.totalVoltage).toBe(12.0);
      expect(result.totalCurrent).toBeCloseTo(1.0, 3);
      expect(result.equivalentResistance).toBeCloseTo(12.0, 2);

      // Verify each resistor drops exactly 6 V and carries 1 A
      const r1 = result.componentStates['res-1'];
      const r2 = result.componentStates['res-2'];

      expect(r1.voltageDrop).toBeCloseTo(6.0, 2);
      expect(r1.current).toBeCloseTo(1.0, 3);
      expect(r1.power).toBeCloseTo(6.0, 2); // 6V * 1A = 6W

      expect(r2.voltageDrop).toBeCloseTo(6.0, 2);
      expect(r2.current).toBeCloseTo(1.0, 3);
      expect(r2.power).toBeCloseTo(6.0, 2);

      // Kirchhoff's Voltage Law verification: V1 + V2 = Vtotal
      expect(r1.voltageDrop + r2.voltageDrop).toBeCloseTo(12.0, 2);
    });

    // Benchmark 3: Two 6 Ω resistors in parallel across 12 V: total current 4 A, Req = 3 Ω.
    it('Benchmark 3: should solve two 6 Ω resistors in parallel across 12 V (Itotal = 4 A, Req = 3 Ω, 2 A each branch)', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: '12V Source',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 12.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'R1 (6Ω)',
          x: 350,
          y: 80,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
        {
          id: 'res-2',
          equipmentId: 'standard-resistor',
          title: 'R2 (6Ω)',
          x: 350,
          y: 200,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
      ];

      // Parallel connection: PS(+) -> R1(p1) and PS(+) -> R2(p1); R1(p2) -> PS(-) and R2(p2) -> PS(-)
      const connections: WorkspaceConnection[] = [
        wire('w-1', 'ps-1', 'pos', 'res-1', 'p1'),
        wire('w-2', 'ps-1', 'pos', 'res-2', 'p1'),
        wire('w-3', 'res-1', 'p2', 'ps-1', 'neg'),
        wire('w-4', 'res-2', 'p2', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isValid).toBe(true);
      expect(result.isOpenCircuit).toBe(false);
      expect(result.isShortCircuit).toBe(false);
      expect(result.totalVoltage).toBe(12.0);
      expect(result.totalCurrent).toBeCloseTo(4.0, 3);
      expect(result.equivalentResistance).toBeCloseTo(3.0, 2);

      // Verify each parallel branch receives full 12 V and carries 2 A
      const r1 = result.componentStates['res-1'];
      const r2 = result.componentStates['res-2'];

      expect(r1.voltageDrop).toBeCloseTo(12.0, 2);
      expect(r1.current).toBeCloseTo(2.0, 3);
      expect(r2.voltageDrop).toBeCloseTo(12.0, 2);
      expect(r2.current).toBeCloseTo(2.0, 3);

      // Kirchhoff's Current Law verification: I1 + I2 = Itotal
      expect(r1.current + r2.current).toBeCloseTo(result.totalCurrent, 3);
    });
  });

  /* =========================================================================
     2. MIXED SERIES-PARALLEL CIRCUIT TEST
     ========================================================================= */
  describe('Mixed Series-Parallel Network Test', () => {
    it('should solve a mixed network with R1 in series with parallel pair (R2 || R3)', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: '12V DC',
          x: 50,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 12.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'r1',
          equipmentId: 'standard-resistor',
          title: 'R1 (3Ω)',
          x: 250,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 3.0 },
          state: {},
        },
        {
          id: 'r2',
          equipmentId: 'standard-resistor',
          title: 'R2 (6Ω)',
          x: 450,
          y: 50,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
        {
          id: 'r3',
          equipmentId: 'standard-resistor',
          title: 'R3 (6Ω)',
          x: 450,
          y: 180,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('c1', 'ps-1', 'pos', 'r1', 'p1'),
        wire('c2', 'r1', 'p2', 'r2', 'p1'),
        wire('c3', 'r1', 'p2', 'r3', 'p1'),
        wire('c4', 'r2', 'p2', 'ps-1', 'neg'),
        wire('c5', 'r3', 'p2', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isValid).toBe(true);
      expect(result.totalCurrent).toBeCloseTo(2.0, 3);
      expect(result.equivalentResistance).toBeCloseTo(6.0, 2);

      const r1 = result.componentStates['r1'];
      const r2 = result.componentStates['r2'];
      const r3 = result.componentStates['r3'];

      expect(r1.voltageDrop).toBeCloseTo(6.0, 2);
      expect(r1.current).toBeCloseTo(2.0, 3);

      expect(r2.voltageDrop).toBeCloseTo(6.0, 2);
      expect(r2.current).toBeCloseTo(1.0, 3);

      expect(r3.voltageDrop).toBeCloseTo(6.0, 2);
      expect(r3.current).toBeCloseTo(1.0, 3);
    });
  });

  /* =========================================================================
     3. INSTRUMENT ACCURACY: AMMETER & VOLTMETER READOUTS
     ========================================================================= */
  describe('Measurement Instruments (Ammeter in Series, Voltmeter in Parallel)', () => {
    it('should reflect correct circuit readings on Ammeter in series and Voltmeter in parallel', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'battery-1',
          equipmentId: 'dc-battery',
          title: '9V Battery',
          x: 100,
          y: 100,
          rotation: 0,
          width: 140,
          height: 90,
          properties: { voltage: 9.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'ammeter-1',
          equipmentId: 'dc-ammeter',
          title: 'Series Ammeter',
          x: 280,
          y: 100,
          rotation: 0,
          width: 140,
          height: 110,
          properties: { maxScale: 3 },
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'Load Resistor (18Ω)',
          x: 460,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 18.0 },
          state: {},
        },
        {
          id: 'voltmeter-1',
          equipmentId: 'dc-voltmeter',
          title: 'Parallel Voltmeter',
          x: 460,
          y: 240,
          rotation: 0,
          width: 140,
          height: 110,
          properties: { maxScale: 15 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('w1', 'battery-1', 'pos', 'ammeter-1', 'pos'),
        wire('w2', 'ammeter-1', 'neg', 'res-1', 'p1'),
        wire('w3', 'res-1', 'p2', 'battery-1', 'neg'),
        wire('w4', 'voltmeter-1', 'pos', 'res-1', 'p1'),
        wire('w5', 'voltmeter-1', 'neg', 'res-1', 'p2'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isValid).toBe(true);
      expect(result.totalCurrent).toBeCloseTo(0.5, 3);
      expect(result.equivalentResistance).toBeCloseTo(18.0, 2);

      const ammeterState = result.componentStates['ammeter-1'];
      expect(ammeterState).toBeDefined();
      expect(ammeterState.displayReading).toBeCloseTo(0.5, 3);
      expect(ammeterState.displayUnits).toBe('A');
      expect(ammeterState.isEnergized).toBe(true);

      const voltmeterState = result.componentStates['voltmeter-1'];
      expect(voltmeterState).toBeDefined();
      expect(voltmeterState.displayReading).toBeCloseTo(9.0, 2);
      expect(voltmeterState.displayUnits).toBe('V');
      expect(voltmeterState.isEnergized).toBe(true);
    });
  });

  /* =========================================================================
     4. SWITCH CONTROL, WIRE JUNCTIONS, AND GROUND NODE
     ========================================================================= */
  describe('Switch Control, Wire Junctions, and Ground Node', () => {
    it('should break circuit when knife switch is opened', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: '10V DC',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 10.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'sw-1',
          equipmentId: 'knife-switch',
          title: 'Plug Key',
          x: 300,
          y: 100,
          rotation: 0,
          width: 120,
          height: 70,
          properties: { isClosed: false },
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'Resistor',
          x: 500,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 10.0 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('c1', 'ps-1', 'pos', 'sw-1', 'p1'),
        wire('c2', 'sw-1', 'p2', 'res-1', 'p1'),
        wire('c3', 'res-1', 'p2', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isOpenCircuit).toBe(true);
      expect(result.totalCurrent).toBe(0);
      expect(result.componentStates['res-1'].current).toBe(0);
      expect(result.componentStates['sw-1'].isEnergized).toBe(false);
    });

    it('should conduct through 4-way wire junction node', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-battery',
          title: 'Battery 6V',
          x: 100,
          y: 100,
          rotation: 0,
          width: 140,
          height: 90,
          properties: { voltage: 6.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'junc-1',
          equipmentId: 'wire-junction',
          title: 'Junction',
          x: 300,
          y: 100,
          rotation: 0,
          width: 80,
          height: 80,
          properties: {},
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'Resistor 6Ω',
          x: 500,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 6.0 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('c1', 'ps-1', 'pos', 'junc-1', 'p1'),
        wire('c2', 'junc-1', 'p4', 'res-1', 'p1'),
        wire('c3', 'res-1', 'p2', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isValid).toBe(true);
      expect(result.totalCurrent).toBeCloseTo(1.0, 3);
    });
  });

  /* =========================================================================
     5. ERROR, SAFETY & WARNING DETECTION TESTS
     ========================================================================= */
  describe('Safety, Short-Circuit, and Error Detection', () => {
    it('should detect direct short-circuit across voltage source terminals and activate protection', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: 'Power Supply',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 12.0, powerSwitch: true },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('short-wire', 'ps-1', 'pos', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isShortCircuit).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.warnings.some((w) => w.toLowerCase().includes('short circuit'))).toBe(true);
    });

    it('should detect open circuit when terminals are disconnected', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: 'Power Supply',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 12.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'Resistor',
          x: 400,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 10.0 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('w1', 'ps-1', 'pos', 'res-1', 'p1'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.isOpenCircuit).toBe(true);
      expect(result.totalCurrent).toBe(0);
      expect(result.messages.some((m) => m.toLowerCase().includes('not connected') || m.toLowerCase().includes('open circuit'))).toBe(true);
    });

    it('should warn when Voltmeter is erroneously connected in series with load', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: 'Power Supply',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 10.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'vm-1',
          equipmentId: 'dc-voltmeter',
          title: 'Voltmeter in Series',
          x: 300,
          y: 100,
          rotation: 0,
          width: 140,
          height: 110,
          properties: { maxScale: 15 },
          state: {},
        },
        {
          id: 'res-1',
          equipmentId: 'standard-resistor',
          title: 'Resistor',
          x: 500,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 10.0 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('w1', 'ps-1', 'pos', 'vm-1', 'pos'),
        wire('w2', 'vm-1', 'neg', 'res-1', 'p1'),
        wire('w3', 'res-1', 'p2', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(result.warnings.some((w) => w.toLowerCase().includes('internal resistance') || w.toLowerCase().includes('voltmeter'))).toBe(true);
      expect(result.isOpenCircuit).toBe(true);
    });

    it('should safely clamp non-positive resistance to prevent division by zero or NaN', () => {
      const objects: WorkspaceObject[] = [
        {
          id: 'ps-1',
          equipmentId: 'dc-power-supply',
          title: 'Power Supply',
          x: 100,
          y: 100,
          rotation: 0,
          width: 170,
          height: 120,
          properties: { voltage: 5.0, powerSwitch: true },
          state: {},
        },
        {
          id: 'res-bad',
          equipmentId: 'standard-resistor',
          title: 'Bad Resistor',
          x: 400,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: -10 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        wire('w1', 'ps-1', 'pos', 'res-bad', 'p1'),
        wire('w2', 'res-bad', 'p2', 'ps-1', 'neg'),
      ];

      const result = solveDCCircuit(objects, connections);

      expect(Number.isNaN(result.totalCurrent)).toBe(false);
      expect(result.warnings.some((w) => w.includes('non-positive'))).toBe(true);
    });
  });

  /* =========================================================================
     6. FORMATTING HELPERS AND CONCEPTUAL QUESTIONS
     ========================================================================= */
  describe('Formatting Helpers and Conceptual Questions', () => {
    it('should format voltage into V and mV correctly', () => {
      expect(formatVoltage(0)).toBe('0.00 V');
      expect(formatVoltage(0.0005)).toBe('0.00 V');
      expect(formatVoltage(0.5)).toBe('500.0 mV');
      expect(formatVoltage(12.345)).toBe('12.35 V');
    });

    it('should format current into A and mA correctly', () => {
      expect(formatCurrent(0)).toBe('0.00 A');
      expect(formatCurrent(0.00005)).toBe('0.00 A');
      expect(formatCurrent(0.025)).toBe('25.0 mA');
      expect(formatCurrent(2.5)).toBe('2.500 A');
    });

    it('should supply conceptual questions for Ohms Law and Series/Parallel circuits', () => {
      const ohmQ = getConceptualQuestions('ohms-law');
      expect(ohmQ.length).toBeGreaterThanOrEqual(3);
      expect(ohmQ[0].question.toLowerCase()).toContain('ohm');

      const spQ = getConceptualQuestions('series-parallel-circuits');
      expect(spQ.length).toBeGreaterThanOrEqual(3);
      expect(spQ[0].question.toLowerCase()).toContain('resistor');
    });
  });
});
