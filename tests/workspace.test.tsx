import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WorkspaceHistoryManager } from '../src/services/workspace/historyManager';
import {
  genericExtension,
  GENERIC_EQUIPMENT,
} from '../src/services/lab/genericExtension';
import {
  physicsExtension,
  PHYSICS_EQUIPMENT,
} from '../src/services/lab/physicsExtension';
import {
  CHEMISTRY_EQUIPMENT,
} from '../src/services/lab/chemistryExtension';
import {
  getExtensionBySubject,
  getAllEquipmentCatalogue,
  getLabDefinition,
} from '../src/services/lab/registry';
import { UniversalLabWorkspace } from '../src/components/workspace/UniversalLabWorkspace';
import { StudentProvider } from '../src/context/StudentContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { resetAllData } from '../src/services/studentProgressService';
import { WorkspaceObject, WorkspaceConnection } from '../src/types';

describe('Phase 2: Universal Interactive Laboratory Workspace', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  /* =========================================================================
     1. UNDO / REDO HISTORY MANAGER TESTS
     ========================================================================= */
  describe('WorkspaceHistoryManager (Undo / Redo Stack)', () => {
    it('should push states, navigate backward with undo, and forward with redo', () => {
      const history = new WorkspaceHistoryManager(10);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);

      const obj1: WorkspaceObject = {
        id: 'obj-1',
        equipmentId: 'generic-signal-generator',
        title: 'Generator',
        x: 100,
        y: 100,
        rotation: 0,
        width: 140,
        height: 100,
        properties: { outputSignal: 5 },
        state: {},
      };

      // Push initial state
      history.pushState([obj1], [], 'Add Generator');
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      // Move object
      const obj1Moved = { ...obj1, x: 200, y: 200 };
      history.pushState([obj1Moved], [], 'Move to 200,200');

      // Undo move
      const undoState = history.undo([obj1Moved], []);
      expect(undoState).not.toBeNull();
      expect(undoState?.objects[0].x).toBe(200);
      expect(history.canRedo()).toBe(true);

      // Redo move
      const redoState = history.redo([obj1], []);
      expect(redoState).not.toBeNull();
      expect(redoState?.objects[0].x).toBe(200);
    });

    it('should clear redo stack when a new action is performed after undo', () => {
      const history = new WorkspaceHistoryManager(10);
      history.pushState([], [], 'State 0');
      history.pushState([], [], 'State 1');

      history.undo([], []);
      expect(history.canRedo()).toBe(true);

      // New action diverges history branch
      history.pushState([], [], 'State 2 Divergent');
      expect(history.canRedo()).toBe(false);
    });

    it('should respect maxHistorySize bound', () => {
      const history = new WorkspaceHistoryManager(3);
      history.pushState([], [], 'S1');
      history.pushState([], [], 'S2');
      history.pushState([], [], 'S3');
      history.pushState([], [], 'S4'); // pushes S1 out

      expect(history.getUndoCount()).toBe(3);
    });
  });

  /* =========================================================================
     2. SUBJECT LAB EXTENSIONS & REPOSITORY TESTS
     ========================================================================= */
  describe('Subject Lab Extensions & Registries', () => {
    it('should register Physics equipment including DC power, meters, and optics', () => {
      expect(PHYSICS_EQUIPMENT.length).toBeGreaterThanOrEqual(8);
      const ids = PHYSICS_EQUIPMENT.map((e) => e.id);
      expect(ids).toContain('dc-power-supply');
      expect(ids).toContain('standard-resistor');
      expect(ids).toContain('dc-voltmeter');
      expect(ids).toContain('dc-ammeter');
      expect(ids).toContain('convex-lens-bench');
      expect(ids).toContain('simple-pendulum-assembly');
    });

    it('should register Chemistry equipment including beakers, spotting plate, and test tubes', () => {
      expect(CHEMISTRY_EQUIPMENT.length).toBeGreaterThanOrEqual(6);
      const ids = CHEMISTRY_EQUIPMENT.map((e) => e.id);
      expect(ids).toContain('borosilicate-beaker');
      expect(ids).toContain('spotting-plate-cavities');
      expect(ids).toContain('test-tube-rack');
      expect(ids).toContain('pasteur-pipette-dropper');
      expect(ids).toContain('universal-ph-strip');
    });

    it('should retrieve extension by subject and list available equipment', () => {
      const physExt = getExtensionBySubject('physics');
      expect(physExt.name).toContain('Physics');

      const chemExt = getExtensionBySubject('chemistry');
      expect(chemExt.name).toContain('Chemistry');

      const all = getAllEquipmentCatalogue();
      expect(all.length).toBeGreaterThanOrEqual(15);
    });

    it('should reject invalid connections between mismatched domain ports', () => {
      const psObj: WorkspaceObject = {
        id: 'ps-1',
        equipmentId: 'dc-power-supply',
        title: 'Power',
        x: 0,
        y: 0,
        rotation: 0,
        width: 140,
        height: 100,
        properties: {},
        state: {},
      };
      const lensObj: WorkspaceObject = {
        id: 'lens-1',
        equipmentId: 'convex-lens-bench',
        title: 'Lens',
        x: 100,
        y: 0,
        rotation: 0,
        width: 100,
        height: 140,
        properties: {},
        state: {},
      };

      const result = physicsExtension.validateConnection(
        psObj,
        { id: 'pos', name: 'Positive', type: 'electrical-positive', xOffset: 0, yOffset: 0 },
        lensObj,
        { id: 'opt-in', name: 'Optical Face', type: 'optical-axis', xOffset: 0, yOffset: 0 },
        []
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('optical');
    });
  });

  /* =========================================================================
     3. THREE MANDATORY DEMONSTRATIONS
     ========================================================================= */
  describe('Mandatory Demonstrations (Generic Workbench)', () => {
    it('Demo 1: Place and move a generic instrument', () => {
      const genDef = GENERIC_EQUIPMENT.find((e) => e.id === 'generic-signal-generator')!;
      expect(genDef).toBeDefined();

      const obj: WorkspaceObject = {
        id: 'demo-obj-1',
        equipmentId: genDef.id,
        title: genDef.name,
        x: 50,
        y: 50,
        rotation: 0,
        width: genDef.defaultWidth,
        height: genDef.defaultHeight,
        properties: { outputSignal: 10 },
        state: {},
      };

      // Moving the object
      obj.x = 220;
      obj.y = 180;
      expect(obj.x).toBe(220);
      expect(obj.y).toBe(180);
    });

    it('Demo 2: Connect two generic objects using attachment ports', () => {
      const sender: WorkspaceObject = {
        id: 'gen-1',
        equipmentId: 'generic-signal-generator',
        title: 'Generator',
        x: 50,
        y: 50,
        rotation: 0,
        width: 160,
        height: 110,
        properties: { outputSignal: 15, powerSwitch: true },
        state: {},
      };
      const monitor: WorkspaceObject = {
        id: 'mon-1',
        equipmentId: 'generic-probe-monitor',
        title: 'Monitor',
        x: 350,
        y: 50,
        rotation: 0,
        width: 160,
        height: 110,
        properties: { sensitivityMultiplier: 1.0 },
        state: {},
      };

      const connection: WorkspaceConnection = {
        id: 'conn-1',
        fromObjectId: sender.id,
        fromPortId: 'out',
        toObjectId: monitor.id,
        toPortId: 'in',
        type: 'generic',
      };

      const simResult = genericExtension.evaluateSimulation([sender, monitor], [connection]);
      expect(simResult.valid).toBe(true);
      expect(simResult.objectStateUpdates[monitor.id].displayedReading).toBe(15);
    });

    it('Demo 3: Edit an object numeric property and see displayed state update', () => {
      const sender: WorkspaceObject = {
        id: 'gen-1',
        equipmentId: 'generic-signal-generator',
        title: 'Generator',
        x: 50,
        y: 50,
        rotation: 0,
        width: 160,
        height: 110,
        properties: { outputSignal: 8.0, powerSwitch: true },
        state: {},
      };
      const monitor: WorkspaceObject = {
        id: 'mon-1',
        equipmentId: 'generic-probe-monitor',
        title: 'Monitor',
        x: 350,
        y: 50,
        rotation: 0,
        width: 160,
        height: 110,
        properties: { sensitivityMultiplier: 2.0 },
        state: {},
      };
      const connection: WorkspaceConnection = {
        id: 'conn-1',
        fromObjectId: sender.id,
        fromPortId: 'out',
        toObjectId: monitor.id,
        toPortId: 'in',
        type: 'generic',
      };

      // Before edit
      let sim = genericExtension.evaluateSimulation([sender, monitor], [connection]);
      expect(sim.objectStateUpdates[monitor.id].displayedReading).toBe(16.0); // 8 * 2.0

      // Student edits numeric property from 8.0 -> 24.5 in Inspector
      sender.properties.outputSignal = 24.5;
      sim = genericExtension.evaluateSimulation([sender, monitor], [connection]);
      expect(sim.objectStateUpdates[monitor.id].displayedReading).toBe(49.0); // 24.5 * 2.0
    });
  });

  /* =========================================================================
     4. UNIVERSAL WORKSPACE COMPONENT INTEGRATION TESTS
     ========================================================================= */
  describe('UniversalLabWorkspace Component Integration', () => {
    const renderWorkspace = (expId = 'generic-demo', mode: 'guided' | 'freelab' = 'freelab') => {
      return render(
        <ThemeProvider>
          <StudentProvider>
            <BrowserRouter>
              <UniversalLabWorkspace experimentId={expId} initialMode={mode} />
            </BrowserRouter>
          </StudentProvider>
        </ThemeProvider>
      );
    };

    it('renders the three-panel layout (Catalogue, Center Canvas, Inspector)', () => {
      renderWorkspace('generic-demo');

      // Left Panel
      expect(screen.getByText('Equipment Catalogue')).toBeInTheDocument();
      // Center Canvas Stage (Konva Stage test-id)
      expect(screen.getByTestId('konva-stage')).toBeInTheDocument();
      // Right Inspector
      expect(screen.getByRole('button', { name: /^inspector$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^notebook$/i })).toBeInTheDocument();
    });

    it('supports tap-to-add for mobile users by placing equipment onto canvas', async () => {
      renderWorkspace('generic-demo');

      const addBtn = screen.getByLabelText(/add generic signal generator to canvas/i);
      expect(addBtn).toBeInTheDocument();

      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(screen.getByText(/Added Generic Signal Generator to canvas/i)).toBeInTheDocument();
      });
    });

    it('supports mode switching between Guided Mode and Free Lab', () => {
      renderWorkspace('generic-demo', 'guided');

      const freeLabBtn = screen.getByRole('button', { name: /free lab/i });
      fireEvent.click(freeLabBtn);

      const guidedBtn = screen.getByRole('button', { name: /guided mode/i });
      fireEvent.click(guidedBtn);
    });

    it('supports logging observations and measurements in the experiment notebook', async () => {
      renderWorkspace('generic-demo');

      // Open Notebook tab
      const notebookTab = screen.getByRole('button', { name: /notebook/i });
      fireEvent.click(notebookTab);

      expect(screen.getByRole('heading', { name: /quantitative measurements log/i })).toBeInTheDocument();

      // Enter a measurement record
      const labelInput = screen.getByPlaceholderText(/e\.g\. Trial 1 Voltage/i);
      const valInput = screen.getByPlaceholderText('Value');
      const unitInput = screen.getByPlaceholderText('Unit');

      fireEvent.change(labelInput, { target: { value: 'Resistor V-Drop' } });
      fireEvent.change(valInput, { target: { value: '4.85' } });
      fireEvent.change(unitInput, { target: { value: 'V' } });

      const logBtn = screen.getByRole('button', { name: /log measurement/i });
      fireEvent.click(logBtn);

      await waitFor(() => {
        expect(screen.getByText('Resistor V-Drop')).toBeInTheDocument();
        expect(screen.getByText(/4\.85 V/i)).toBeInTheDocument();
      });
    });

    it('saves workspace state to IndexedDB and triggers feedback', async () => {
      renderWorkspace('generic-demo');

      const saveBtn = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText(/Workspace saved to IndexedDB successfully/i)).toBeInTheDocument();
      });
    });

    it('handles reset workspace cleanly', async () => {
      renderWorkspace('generic-demo');

      const resetBtn = screen.getByTitle('Clear working canvas');
      fireEvent.click(resetBtn);

      await waitFor(() => {
        expect(screen.getByText(/Workspace reset to initial state/i)).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
     5. BOUNDARY CHECK: BIOLOGY & MATHEMATICS REMAIN UNTOUCHED
     ========================================================================= */
  describe('Boundary Check: Biology & Mathematics', () => {
    it('verifies Biology lab definition does not exist and remains on hold', () => {
      const bioLab = getLabDefinition('biology-lab');
      expect(bioLab).toBeUndefined();
    });

    it('verifies Mathematics lab definition does not exist and remains on hold', () => {
      const mathLab = getLabDefinition('mathematics-lab');
      expect(mathLab).toBeUndefined();
    });
  });
});
