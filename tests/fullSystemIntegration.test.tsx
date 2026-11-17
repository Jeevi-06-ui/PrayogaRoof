import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/shared/ErrorBoundary';
import {
  resetAllData,
  getExperimentProgress,
  markExperimentStatus,
  createWorkspace,
  getAllWorkspaces,
} from '../src/services/studentProgressService';
import { getLabDefinition, getAllEquipmentCatalogue } from '../src/services/lab/registry';
import { solveDCCircuit } from '../src/services/circuit/circuitSolver';
import { calculateThinLens } from '../src/services/physics/opticsModel';
import { calculatePendulumState } from '../src/services/physics/mechanicsModel';
import { calculateDisplacementState } from '../src/services/chemistry/displacementModel';
import { calculateCrystallisation } from '../src/services/chemistry/crystallisationModel';
import { WorkspaceObject, WorkspaceConnection } from '../src/types';

describe('Phase 7: Full System Integration Suite (All 10 Experiments & Subsystems)', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <StudentProvider>{ui}</StudentProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe('Task 1: All 10 Experiment Routes & Lab Definitions Mount Cleanly', () => {
    const physicsExperiments = [
      { id: 'ohms-law', titleMatch: /Ohm's Law/i },
      { id: 'series-parallel-circuits', titleMatch: /Series and Parallel/i },
      { id: 'convex-lens', titleMatch: /Convex Lens/i },
      { id: 'magnetic-field', titleMatch: /Magnetic Field/i },
      { id: 'simple-pendulum', titleMatch: /Simple Pendulum/i },
    ];

    const chemistryExperiments = [
      { id: 'ph-testing', titleMatch: /pH Testing/i },
      { id: 'natural-indicators', titleMatch: /Natural.*Indicators/i },
      { id: 'paper-chromatography', titleMatch: /Paper Chromatography/i },
      { id: 'displacement-reaction', titleMatch: /Displacement Reaction/i },
      { id: 'crystallisation', titleMatch: /Crystallisation/i },
    ];

    physicsExperiments.forEach(({ id, titleMatch }) => {
      it(`Physics: mounts '${id}' workspace with registered lab definition`, async () => {
        const labDef = getLabDefinition(id);
        expect(labDef).toBeDefined();
        expect(labDef?.experimentId).toBe(id);

        renderWithProviders(<UniversalLabWorkspace experimentId={id} initialMode="guided" />);
        expect(screen.getAllByText(titleMatch).length).toBeGreaterThan(0);
      });
    });

    chemistryExperiments.forEach(({ id, titleMatch }) => {
      it(`Chemistry: mounts '${id}' workspace with registered lab definition`, async () => {
        const labDef = getLabDefinition(id);
        expect(labDef).toBeDefined();
        expect(labDef?.experimentId).toBe(id);

        renderWithProviders(<UniversalLabWorkspace experimentId={id} initialMode="guided" />);
        expect(screen.getAllByText(titleMatch).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Task 2: Equipment Catalogue Integrity & Cross-Subject Isolation', () => {
    it('verifies non-empty catalogues for physics, chemistry, and combined', () => {
      const physicsItems = getAllEquipmentCatalogue('physics');
      const chemistryItems = getAllEquipmentCatalogue('chemistry');
      const allItems = getAllEquipmentCatalogue();

      expect(physicsItems.length).toBeGreaterThanOrEqual(8);
      expect(chemistryItems.length).toBeGreaterThanOrEqual(10);
      expect(allItems.length).toBeGreaterThanOrEqual(physicsItems.length + chemistryItems.length);

      // Verify specific items exist
      expect(physicsItems.some((item) => item.id === 'dc-battery' || item.id === 'standard-resistor')).toBe(true);
      expect(chemistryItems.some((item) => item.id === 'borosilicate-beaker' || item.id === 'beaker-100ml')).toBe(true);
    });
  });

  describe('Task 3: Scientific Models Deterministic Calculations', () => {
    it('Physics - DC Circuit Solver validates Ohm Law (V = I * R)', () => {
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
          title: 'Resistor 4Ω',
          x: 400,
          y: 100,
          rotation: 0,
          width: 130,
          height: 80,
          properties: { resistance: 4.0 },
          state: {},
        },
      ];

      const connections: WorkspaceConnection[] = [
        {
          id: 'w-1',
          fromObjectId: 'ps-1',
          fromPortId: 'pos',
          toObjectId: 'res-1',
          toPortId: 'p1',
          color: '#ef4444',
          type: 'wire',
        },
        {
          id: 'w-2',
          fromObjectId: 'res-1',
          fromPortId: 'p2',
          toObjectId: 'ps-1',
          toPortId: 'neg',
          color: '#1e293b',
          type: 'wire',
        },
      ];

      const result = solveDCCircuit(objects, connections);
      expect(result.isValid).toBe(true);
      expect(result.totalCurrent).toBeCloseTo(3.0, 2); // 12V / 4Ω = 3A
      expect(result.equivalentResistance).toBeCloseTo(4.0, 2);
    });

    it('Physics - Thin Lens Equation validates real inverted image distance and magnification', () => {
      // f = 15 cm, u = 30 cm (2f) -> v = +30 cm, m = -1
      const lensResult = calculateThinLens(15, 30, 4, 75);
      expect(lensResult.isReal).toBe(true);
      expect(lensResult.imageDistance).toBeCloseTo(30, 1);
      expect(lensResult.magnification).toBeCloseTo(-1, 1);
      expect(lensResult.imageHeight).toBeCloseTo(-4, 1);
    });

    it('Physics - Pendulum dynamics calculates correct periodic motion for small angles', () => {
      const length = 1.0; // 1m
      const mass = 0.2; // 0.2kg
      const g = 9.80665;
      const expectedT = 2 * Math.PI * Math.sqrt(length / g); // ~2.006s

      const state0 = calculatePendulumState({
        lengthMeters: length,
        massKg: mass,
        initialAngleDeg: 10,
        gravity: g,
      });
      expect(state0.period).toBeCloseTo(expectedT, 2);
      expect(state0.frequency).toBeCloseTo(1 / expectedT, 2);
    });

    it('Chemistry - Displacement reaction calculates copper deposition and mass changes', () => {
      const state = calculateDisplacementState(20, true);

      expect(state.depositedCopperGrams).toBeGreaterThan(0);
      expect(state.dissolvedIronGrams).toBeGreaterThan(0);
      expect(state.solutionColor).toBe('#86efac'); // pale green FeSO4
      expect(state.nailColor).toBe('#9a3412'); // reddish copper crust
    });

    it('Chemistry - Crystallisation calculates recovery yield and crystals formed', () => {
      const result = calculateCrystallisation({
        initialSoluteMassG: 20,
        initialWaterVolumeMl: 50,
        temperatureC: 85,
        evaporationTimeMins: 15,
        isHeating: true,
      });

      expect(result.crystalYieldGrams).toBeGreaterThan(0);
      expect(result.saturationStatus).toBe('supersaturated');
    });
  });

  describe('Task 4: IndexedDB Persistence and Progress Workflow', () => {
    it('creates, retrieves, and updates experiment progress and workspaces', async () => {
      // 1. Initial status
      let prog = await getExperimentProgress('ohms-law');
      expect(prog.status).toBe('not-started');

      // 2. Mark completed
      await markExperimentStatus('ohms-law', 'completed');
      prog = await getExperimentProgress('ohms-law');
      expect(prog.status).toBe('completed');
      expect(prog.guidedCompleted).toBe(true);

      // 3. Save workspace
      const ws = await createWorkspace({
        title: 'Ohm Law Lab 1',
        description: 'Test circuit verification',
        experimentId: 'ohms-law',
        subjectId: 'physics',
        componentCount: 2,
        canvasState: {
          zoom: 1,
          stagePosition: { x: 0, y: 0 },
          elements: [],
        },
      });

      expect(ws.id).toBeDefined();
      expect(ws.title).toBe('Ohm Law Lab 1');

      const all = await getAllWorkspaces();
      expect(all.length).toBeGreaterThanOrEqual(1);
      expect(all.some((w) => w.id === ws.id)).toBe(true);
    });
  });

  describe('Task 5: ErrorBoundary Runtime Resilience', () => {
    const ProblematicComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Forced simulation crash for QA test');
      }
      return <div>Normal Content</div>;
    };

    it('catches render errors and displays fallback UI without unmounting page shell', () => {
      // Suppress console.error during deliberate error test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <ErrorBoundary fallbackTitle="Custom Laboratory Fault">
          <ProblematicComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal Content')).toBeInTheDocument();

      rerender(
        <ErrorBoundary fallbackTitle="Custom Laboratory Fault">
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Laboratory Fault')).toBeInTheDocument();
      expect(screen.getByText(/Forced simulation crash for QA test/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Component/i })).toBeInTheDocument();

      spy.mockRestore();
    });
  });
});
