import { WorkspaceObject, WorkspaceConnection } from '../../types';
import { CircuitSolverResult, SolvedComponentState } from './types';

/**
 * Disjoint Set (Union-Find) helper to find connected electrical nodes.
 */
class UnionFind {
  private parent: Map<string, string> = new Map();

  public find(item: string): string {
    if (!this.parent.has(item)) {
      this.parent.set(item, item);
      return item;
    }
    const p = this.parent.get(item)!;
    if (p === item) return item;
    const root = this.find(p);
    this.parent.set(item, root);
    return root;
  }

  public union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent.set(rootA, rootB);
    }
  }

  public getAllKeys(): string[] {
    return Array.from(this.parent.keys());
  }
}

/**
 * Solve a DC linear resistor network using Modified Nodal Analysis (MNA).
 */
export function solveDCCircuit(
  objects: WorkspaceObject[],
  connections: WorkspaceConnection[]
): CircuitSolverResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const messages: string[] = [];

  // Find all voltage sources
  const voltageSources = objects.filter(
    (o) => o.equipmentId === 'dc-power-supply' || o.equipmentId === 'dc-battery'
  );

  if (voltageSources.length === 0) {
    return createEmptyResult('No DC voltage source or battery connected.');
  }

  const primarySource = voltageSources[0];
  const isPowerOn = primarySource.properties.powerSwitch !== false;
  const sourceVoltage = isPowerOn ? Math.max(0, Number(primarySource.properties.voltage ?? 0)) : 0;

  // 1. Group terminals into electrical nodes using Union-Find
  const uf = new UnionFind();

  // Initialize terminal keys for all objects
  for (const obj of objects) {
    switch (obj.equipmentId) {
      case 'dc-power-supply':
      case 'dc-battery':
        uf.find(`${obj.id}:pos`);
        uf.find(`${obj.id}:neg`);
        break;
      case 'standard-resistor':
      case 'indicator-lamp':
        uf.find(`${obj.id}:p1`);
        uf.find(`${obj.id}:p2`);
        break;
      case 'knife-switch':
        uf.find(`${obj.id}:p1`);
        uf.find(`${obj.id}:p2`);
        // If switch is closed, merge its terminals
        if (obj.properties.isClosed !== false) {
          uf.union(`${obj.id}:p1`, `${obj.id}:p2`);
        }
        break;
      case 'dc-ammeter':
      case 'dc-voltmeter':
        uf.find(`${obj.id}:pos`);
        uf.find(`${obj.id}:neg`);
        break;
      case 'wire-junction':
        // Wire junction connects all its 4 ports together internally
        uf.find(`${obj.id}:p1`);
        uf.find(`${obj.id}:p2`);
        uf.find(`${obj.id}:p3`);
        uf.find(`${obj.id}:p4`);
        uf.union(`${obj.id}:p1`, `${obj.id}:p2`);
        uf.union(`${obj.id}:p1`, `${obj.id}:p3`);
        uf.union(`${obj.id}:p1`, `${obj.id}:p4`);
        break;
      case 'circuit-ground':
        uf.find(`${obj.id}:gnd`);
        break;
      default:
        break;
    }
  }

  // Merge terminals connected by wires
  for (const conn of connections) {
    const fromKey = `${conn.fromObjectId}:${conn.fromPortId}`;
    const toKey = `${conn.toObjectId}:${conn.toPortId}`;
    uf.union(fromKey, toKey);
  }

  // 2. Identify distinct electrical nodes
  const allTerminals = uf.getAllKeys();
  const rootToNodeIndex = new Map<string, number>();

  // Determine ground reference node:
  // If an explicit circuit ground exists and is connected, use its root as Node 0.
  // Otherwise, use the negative terminal of the primary voltage source as Node 0.
  const explicitGround = objects.find((o) => o.equipmentId === 'circuit-ground');
  const isGroundConnected =
    explicitGround &&
    connections.some(
      (c) => c.fromObjectId === explicitGround.id || c.toObjectId === explicitGround.id
    );

  let groundRoot = '';
  if (explicitGround && isGroundConnected) {
    groundRoot = uf.find(`${explicitGround.id}:gnd`);
  } else {
    groundRoot = uf.find(`${primarySource.id}:neg`);
  }

  rootToNodeIndex.set(groundRoot, 0);

  let nextNodeIdx = 1;
  for (const term of allTerminals) {
    const root = uf.find(term);
    if (!rootToNodeIndex.has(root)) {
      rootToNodeIndex.set(root, nextNodeIdx++);
    }
  }

  const numNodes = nextNodeIdx; // Total nodes including Node 0

  const getNode = (objectId: string, portId: string): number => {
    const root = uf.find(`${objectId}:${portId}`);
    return rootToNodeIndex.get(root) ?? 0;
  };

  const posNode = getNode(primarySource.id, 'pos');
  const negNode = getNode(primarySource.id, 'neg');

  // Check if source terminals are disconnected
  const isPosConnected = connections.some(
    (c) =>
      (c.fromObjectId === primarySource.id && c.fromPortId === 'pos') ||
      (c.toObjectId === primarySource.id && c.toPortId === 'pos')
  );
  const isNegConnected = connections.some(
    (c) =>
      (c.fromObjectId === primarySource.id && c.fromPortId === 'neg') ||
      (c.toObjectId === primarySource.id && c.toPortId === 'neg')
  );

  if (!isPosConnected || !isNegConnected) {
    messages.push('Power supply terminals are not connected to a complete circuit.');
  }

  // Check direct short-circuit across voltage source
  if (posNode === negNode && (isPosConnected || isNegConnected)) {
    warnings.push(
      '⚠️ Short Circuit Detected! Direct low-resistance path across voltage source terminals. Circuit current tripped.'
    );
    return createShortCircuitResult(primarySource, sourceVoltage, warnings);
  }

  // 3. Assemble Resistor Branches for MNA
  interface ResistorBranch {
    id: string;
    node1: number;
    node2: number;
    resistance: number;
  }

  const resistorBranches: ResistorBranch[] = [];

  for (const obj of objects) {
    if (obj.equipmentId === 'standard-resistor') {
      const n1 = getNode(obj.id, 'p1');
      const n2 = getNode(obj.id, 'p2');
      const rawR = Number(obj.properties.resistance ?? 10);
      if (rawR <= 0) {
        warnings.push(
          `Resistor "${obj.title}" resistance was non-positive (${rawR} Ω). Clamped to safe 1.0 Ω.`
        );
      }
      const r = Math.max(1.0, rawR);
      resistorBranches.push({ id: obj.id, node1: n1, node2: n2, resistance: r });
    } else if (obj.equipmentId === 'indicator-lamp') {
      const n1 = getNode(obj.id, 'p1');
      const n2 = getNode(obj.id, 'p2');
      // Lamp filament resistance ~ 15 Ohms
      resistorBranches.push({ id: obj.id, node1: n1, node2: n2, resistance: 15.0 });
    } else if (obj.equipmentId === 'dc-ammeter') {
      const n1 = getNode(obj.id, 'pos');
      const n2 = getNode(obj.id, 'neg');
      // Ideal ammeter has near zero internal resistance (0.0001 Ohm)
      resistorBranches.push({ id: obj.id, node1: n1, node2: n2, resistance: 0.0001 });
    } else if (obj.equipmentId === 'dc-voltmeter') {
      const n1 = getNode(obj.id, 'pos');
      const n2 = getNode(obj.id, 'neg');
      // Ideal voltmeter has very high input impedance (10 Megohms)
      resistorBranches.push({ id: obj.id, node1: n1, node2: n2, resistance: 10000000.0 });
    }
  }

  // 4. Formulate Modified Nodal Analysis (MNA) Matrix
  // Non-reference nodes: 1 to numNodes - 1
  const N = numNodes - 1;
  const M = 1; // 1 primary voltage source
  const matrixSize = N + M;

  const A: number[][] = Array.from({ length: matrixSize }, () =>
    new Array(matrixSize).fill(0)
  );
  const z: number[] = new Array(matrixSize).fill(0);

  // Helper to map node index (1..numNodes-1) to matrix row/col index (0..N-1)
  const nodeToMatIdx = (n: number) => n - 1;

  // Add small diagonal shunt conductance GMIN (1e-12 S) to prevent singular matrices on floating nodes
  for (let i = 0; i < N; i++) {
    A[i][i] += 1e-12;
  }

  // Stamp Resistors into G-matrix
  for (const rb of resistorBranches) {
    if (rb.node1 === rb.node2) continue; // Shorted across itself

    const g = 1.0 / rb.resistance;

    if (rb.node1 !== 0) {
      const idx1 = nodeToMatIdx(rb.node1);
      A[idx1][idx1] += g;
    }
    if (rb.node2 !== 0) {
      const idx2 = nodeToMatIdx(rb.node2);
      A[idx2][idx2] += g;
    }
    if (rb.node1 !== 0 && rb.node2 !== 0) {
      const idx1 = nodeToMatIdx(rb.node1);
      const idx2 = nodeToMatIdx(rb.node2);
      A[idx1][idx2] -= g;
      A[idx2][idx1] -= g;
    }
  }

  // Stamp Voltage Source into B and C matrices
  const vSrcRow = N; // index for voltage source equation

  if (posNode !== 0) {
    const idxPos = nodeToMatIdx(posNode);
    A[vSrcRow][idxPos] = 1;
    A[idxPos][vSrcRow] = 1;
  }
  if (negNode !== 0) {
    const idxNeg = nodeToMatIdx(negNode);
    A[vSrcRow][idxNeg] = -1;
    A[idxNeg][vSrcRow] = -1;
  }

  z[vSrcRow] = sourceVoltage;

  // 5. Solve linear system A * x = z using Gaussian elimination with partial pivoting
  const solution = solveLinearSystem(A, z);

  // Extract node voltages
  const nodeVoltages: Record<number, number> = { 0: 0.0 };
  for (let n = 1; n < numNodes; n++) {
    const idx = nodeToMatIdx(n);
    const v = solution ? solution[idx] : 0.0;
    nodeVoltages[n] = Math.abs(v) < 1e-9 ? 0.0 : v;
  }

  // Extract primary source current (Amperes)
  // In MNA convention, current leaving the positive terminal is -solution[N]
  let sourceCurrent = 0.0;
  if (solution && isPowerOn) {
    sourceCurrent = -solution[N];
    if (Math.abs(sourceCurrent) < 1e-9) sourceCurrent = 0.0;
  }

  // Calculate equivalent resistance
  let equivalentResistance = 0.0;
  if (sourceCurrent > 1e-6 && sourceVoltage > 0) {
    equivalentResistance = Number((sourceVoltage / sourceCurrent).toFixed(3));
  }

  // Detect open circuit condition
  const isOpenCircuit =
    !isPosConnected ||
    !isNegConnected ||
    (isPowerOn && sourceVoltage > 0 && (sourceCurrent < 1e-4 || equivalentResistance > 500000));

  if (isOpenCircuit && isPowerOn && sourceVoltage > 0) {
    messages.push(
      'Open Circuit: No continuous closed conduction loop detected. Current is 0 A.'
    );
  }

  // Detect low-impedance short circuit / overcurrent condition (e.g. wire directly across supply or R < 0.05 Ohm)
  const isOvercurrent =
    sourceVoltage > 0.1 &&
    ((equivalentResistance > 0 && equivalentResistance < 0.05) || sourceCurrent > 50);

  if (isOvercurrent) {
    warnings.push(
      '⚠️ Short Circuit / Overcurrent Detected! Total loop resistance is near zero (<0.05 Ω) drawing excessive current. Circuit breaker tripped for safety.'
    );
    return createShortCircuitResult(primarySource, sourceVoltage, warnings);
  }

  // 6. Compute individual component states
  const componentStates: Record<string, SolvedComponentState> = {};

  // Power Supply State
  componentStates[primarySource.id] = {
    voltageDrop: sourceVoltage,
    current: Number(sourceCurrent.toFixed(4)),
    power: Number((sourceVoltage * sourceCurrent).toFixed(3)),
    isEnergized: isPowerOn && sourceVoltage > 0 && sourceCurrent > 0,
    displayReading: sourceVoltage,
    displayUnits: 'V',
    statusText: isPowerOn
      ? sourceCurrent > 0
        ? `Delivering ${formatCurrent(sourceCurrent)} (Req = ${equivalentResistance} Ω)`
        : 'Open Circuit (0 A)'
      : 'Power Off',
  };

  // Evaluate Resistors
  for (const obj of objects) {
    if (obj.equipmentId === 'standard-resistor') {
      const n1 = getNode(obj.id, 'p1');
      const n2 = getNode(obj.id, 'p2');
      const v1 = nodeVoltages[n1] ?? 0;
      const v2 = nodeVoltages[n2] ?? 0;
      const vDrop = Math.abs(v1 - v2);
      const r = Math.max(0.001, Number(obj.properties.resistance ?? 10));
      const i = vDrop > 1e-6 ? vDrop / r : 0;
      const p = vDrop * i;

      componentStates[obj.id] = {
        voltageDrop: Number(vDrop.toFixed(3)),
        current: Number(i.toFixed(4)),
        power: Number(p.toFixed(3)),
        isEnergized: i > 1e-6,
        displayReading: Number(vDrop.toFixed(2)),
        displayUnits: 'V',
        statusText: i > 1e-6 ? `${formatVoltage(vDrop)} • ${formatCurrent(i)}` : 'De-energized',
      };
    } else if (obj.equipmentId === 'indicator-lamp') {
      const n1 = getNode(obj.id, 'p1');
      const n2 = getNode(obj.id, 'p2');
      const v1 = nodeVoltages[n1] ?? 0;
      const v2 = nodeVoltages[n2] ?? 0;
      const vDrop = Math.abs(v1 - v2);
      const i = vDrop > 1e-6 ? vDrop / 15.0 : 0;
      const glowPercent = Math.min(100, Math.round(((vDrop / 6.0) ** 2) * 100));

      componentStates[obj.id] = {
        voltageDrop: Number(vDrop.toFixed(3)),
        current: Number(i.toFixed(4)),
        power: Number((vDrop * i).toFixed(3)),
        isEnergized: i > 0.05,
        statusText: glowPercent > 0 ? `Filament Glowing (${glowPercent}%)` : 'Off',
      };
    } else if (obj.equipmentId === 'dc-ammeter') {
      const n1 = getNode(obj.id, 'pos');
      const n2 = getNode(obj.id, 'neg');
      const v1 = nodeVoltages[n1] ?? 0;
      const v2 = nodeVoltages[n2] ?? 0;
      const vDrop = Math.abs(v1 - v2);
      // Current passing through shunt resistance (0.0001 Ohm)
      const i = vDrop / 0.0001;
      const displayCurrent = Math.abs(i) < 1e-6 ? 0 : Number(i.toFixed(4));

      // Check if ammeter was placed in parallel across voltage source
      if (
        (n1 === posNode && n2 === negNode) ||
        (n1 === negNode && n2 === posNode)
      ) {
        warnings.push(
          'Warning: Ammeter is connected in parallel across the voltage supply. Ammeters must be connected in series with loads.'
        );
      }

      componentStates[obj.id] = {
        voltageDrop: Number(vDrop.toFixed(4)),
        current: displayCurrent,
        power: 0,
        isEnergized: displayCurrent > 1e-6,
        displayReading: displayCurrent,
        displayUnits: 'A',
        statusText: `Series Current: ${formatCurrent(displayCurrent)}`,
      };
    } else if (obj.equipmentId === 'dc-voltmeter') {
      const n1 = getNode(obj.id, 'pos');
      const n2 = getNode(obj.id, 'neg');
      const v1 = nodeVoltages[n1] ?? 0;
      const v2 = nodeVoltages[n2] ?? 0;
      const vDrop = Math.abs(v1 - v2);
      const displayVoltage = vDrop < 1e-6 ? 0 : Number(vDrop.toFixed(3));

      // Check if voltmeter was erroneously placed in series with all resistors
      if (
        (isOpenCircuit || equivalentResistance > 500000) &&
        displayVoltage > 0.5 &&
        resistorBranches.length > 1
      ) {
        warnings.push(
          'Notice: Voltmeter has very high internal resistance (~10 MΩ). When wired in series with a branch instead of in parallel, it acts as an open circuit.'
        );
      }

      componentStates[obj.id] = {
        voltageDrop: displayVoltage,
        current: 0,
        power: 0,
        isEnergized: displayVoltage > 1e-6,
        displayReading: displayVoltage,
        displayUnits: 'V',
        statusText: `Parallel Potential: ${formatVoltage(displayVoltage)}`,
      };
    } else if (obj.equipmentId === 'knife-switch') {
      const isClosed = obj.properties.isClosed !== false;
      componentStates[obj.id] = {
        voltageDrop: 0,
        current: 0,
        power: 0,
        isEnergized: isClosed,
        statusText: isClosed ? 'Key Inserted (Closed)' : 'Key Removed (Open)',
      };
    }
  }

  // Summary message
  const activeResistorCount = resistorBranches.filter(
    (b) => objects.find((o) => o.id === b.id)?.equipmentId === 'standard-resistor'
  ).length;

  let topologySummary = '';
  if (isOpenCircuit) {
    topologySummary = 'Open Circuit (0 A)';
  } else if (equivalentResistance > 0) {
    topologySummary = `Closed Network: Supply = ${sourceVoltage}V, Total Current = ${formatCurrent(
      sourceCurrent
    )}, Req = ${equivalentResistance} Ω (${activeResistorCount} active resistor${
      activeResistorCount === 1 ? '' : 's'
    })`;
  } else {
    topologySummary = 'DC Circuit Ready';
  }

  return {
    isValid: true,
    isOpenCircuit,
    isShortCircuit: false,
    hasVoltageSource: true,
    totalVoltage: sourceVoltage,
    totalCurrent: sourceCurrent,
    equivalentResistance,
    nodeVoltages,
    componentStates,
    errors,
    warnings,
    messages,
    topologySummary,
  };
}

/**
 * Solve linear system Ax = b using Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  // Deep copy matrices to avoid mutating inputs
  const M: number[][] = A.map((row) => [...row]);
  const x: number[] = [...b];

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    let maxVal = Math.abs(M[i][i]);
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxVal) {
        maxVal = Math.abs(M[k][i]);
        maxRow = k;
      }
    }

    if (maxVal < 1e-12) {
      // Singular or rank-deficient matrix
      continue;
    }

    // Swap rows in M and x
    if (maxRow !== i) {
      const tempRow = M[i];
      M[i] = M[maxRow];
      M[maxRow] = tempRow;

      const tempVal = x[i];
      x[i] = x[maxRow];
      x[maxRow] = tempVal;
    }

    // Eliminate column below pivot
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      x[k] -= factor * x[i];
      for (let j = i; j < n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  // Back-substitution
  const result: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = x[i];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * result[j];
    }
    if (Math.abs(M[i][i]) > 1e-12) {
      result[i] = sum / M[i][i];
    } else {
      result[i] = 0;
    }
  }

  return result;
}

function createEmptyResult(message: string): CircuitSolverResult {
  return {
    isValid: false,
    isOpenCircuit: true,
    isShortCircuit: false,
    hasVoltageSource: false,
    totalVoltage: 0,
    totalCurrent: 0,
    equivalentResistance: 0,
    nodeVoltages: { 0: 0 },
    componentStates: {},
    errors: [message],
    warnings: [],
    messages: [],
    topologySummary: message,
  };
}

function createShortCircuitResult(
  source: WorkspaceObject,
  voltage: number,
  existingWarnings: string[] = []
): CircuitSolverResult {
  return {
    isValid: false,
    isOpenCircuit: false,
    isShortCircuit: true,
    hasVoltageSource: true,
    totalVoltage: voltage,
    totalCurrent: 0,
    equivalentResistance: 0,
    nodeVoltages: { 0: 0 },
    componentStates: {
      [source.id]: {
        voltageDrop: voltage,
        current: 0,
        power: 0,
        isEnergized: false,
        statusText: '⚠️ Short Circuit Protection Activated',
      },
    },
    errors: ['Short circuit across source terminals.'],
    warnings: [
      ...existingWarnings,
      '⚠️ Short Circuit Detected! Direct low-resistance path across voltage source terminals. Circuit breaker tripped.',
    ],
    messages: [],
    topologySummary: 'Short Circuit - Current Tripped for Equipment Safety',
  };
}

export function formatVoltage(v: number): string {
  if (Math.abs(v) < 0.001) return '0.00 V';
  if (Math.abs(v) < 1) return `${(v * 1000).toFixed(1)} mV`;
  return `${v.toFixed(2)} V`;
}

export function formatCurrent(a: number): string {
  if (Math.abs(a) < 0.0001) return '0.00 A';
  if (Math.abs(a) < 1) return `${(a * 1000).toFixed(1)} mA`;
  return `${a.toFixed(3)} A`;
}
