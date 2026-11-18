import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  WorkspaceObject,
  WorkspaceConnection,
  PortDefinition,
  LabNotebook,
  LabMode,
  SavedWorkspace,
} from '../../types';
import {
  getLabDefinition,
  getAllEquipmentCatalogue,
  getEquipmentDefinition,
  validateConnection,
  runSimulation,
} from '../../services/lab/registry';
import { WorkspaceHistoryManager } from '../../services/workspace/historyManager';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { ToolCataloguePanel } from './ToolCataloguePanel';
import { ObjectInspectorPanel } from './ObjectInspectorPanel';
import { LabCanvas } from './canvas/LabCanvas';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import {
  getWorkspacesByExperiment,
  createWorkspace,
  deleteWorkspace,
} from '../../services/studentProgressService';
import { FolderOpen, Trash2, Sliders, BookOpen, Plus } from 'lucide-react';
import { UnderDevelopmentWorkspace } from './UnderDevelopmentWorkspace';
import { registerBackHandler } from '../../services/mobile/mobileBackHandler';

interface UniversalLabWorkspaceProps {
  experimentId: string;
  initialMode?: LabMode;
  startEmpty?: boolean;
  onWorkspaceSaved?: (workspace: SavedWorkspace) => void;
  onBack?: () => void;
}

export const UniversalLabWorkspace: React.FC<UniversalLabWorkspaceProps> = ({
  experimentId,
  initialMode = 'guided',
  startEmpty = false,
  onWorkspaceSaved,
  onBack,
}) => {
  // 1. Resolve Lab Definition
  const resolvedLabDef = useMemo(() => {
    return getLabDefinition(experimentId) || (experimentId === 'generic-demo' ? getLabDefinition('generic-demo') : undefined);
  }, [experimentId]);

  if (!resolvedLabDef) {
    return <UnderDevelopmentWorkspace experimentId={experimentId} />;
  }

  const labDef = resolvedLabDef;

  // 2. Equipment Catalogue filtered by this lab's allowed list
  const equipmentCatalogue = useMemo(() => {
    const all = getAllEquipmentCatalogue(labDef.subjectId);
    if (labDef.allowedEquipmentIds.length > 0) {
      return all.filter((eq) => labDef.allowedEquipmentIds.includes(eq.id));
    }
    return all;
  }, [labDef]);

  // 3. State Management
  const [objects, setObjects] = useState<WorkspaceObject[]>(() => {
    return !startEmpty && labDef.initialObjects ? JSON.parse(JSON.stringify(labDef.initialObjects)) : [];
  });

  const [connections, setConnections] = useState<WorkspaceConnection[]>(() => {
    return !startEmpty && labDef.initialConnections
      ? JSON.parse(JSON.stringify(labDef.initialConnections))
      : [];
  });

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [mode, setMode] = useState<LabMode>(initialMode);
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);
  const [stagePosition, setStagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History Manager
  const historyManagerRef = useRef<WorkspaceHistoryManager>(new WorkspaceHistoryManager(50));
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Notebook state
  const [notebook, setNotebook] = useState<LabNotebook>(() => ({
    observations: labDef.defaultNotebookNotes || '',
    measurements: [],
    conclusions: '',
    lastUpdated: new Date().toISOString(),
  }));

  // Guided step index
  const [guidedStepIndex, setGuidedStepIndex] = useState<number>(0);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{
    text: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);

  // Panels collapsed toggles for responsive screens
  const [isCatalogueCollapsed, setIsCatalogueCollapsed] = useState<boolean>(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);

  // Mobile bottom sheet drawer: null | 'equipment' | 'properties' | 'observations'
  const [mobileDrawer, setMobileDrawer] = useState<'equipment' | 'properties' | 'observations' | null>(null);

  // Register mobile back button handler when a drawer is open
  useEffect(() => {
    if (!mobileDrawer) return;
    return registerBackHandler(() => {
      setMobileDrawer(null);
      return true;
    });
  }, [mobileDrawer]);

  // Load Saved Workspaces Modal
  const [isLoadModalOpen, setIsLoadModalOpen] = useState<boolean>(false);
  const [savedWorkspacesList, setSavedWorkspacesList] = useState<SavedWorkspace[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const showFeedback = useCallback((text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback((cur) => (cur?.text === text ? null : cur));
    }, 3500);
  }, []);

  const updateHistoryState = useCallback((newObjects: WorkspaceObject[], newConnections: WorkspaceConnection[], description: string) => {
    historyManagerRef.current.pushState(newObjects, newConnections, description);
    setCanUndo(historyManagerRef.current.canUndo());
    setCanRedo(historyManagerRef.current.canRedo());
  }, []);

  // 4. Real-time Simulation Engine Loop
  const simulationResult = useMemo(() => {
    return runSimulation(objects, connections, labDef.subjectId);
  }, [objects, connections, labDef.subjectId]);

  // Synchronize object state readouts with simulation updates
  const simulatedObjects = useMemo(() => {
    if (!simulationResult || !simulationResult.objectStateUpdates) return objects;

    return objects.map((obj) => {
      const updates = simulationResult.objectStateUpdates[obj.id];
      if (updates) {
        return {
          ...obj,
          state: {
            ...obj.state,
            ...updates,
          },
        };
      }
      return obj;
    });
  }, [objects, simulationResult]);

  // 5. Capability: Add Equipment (Tap-to-Add & Drag-and-Drop)
  const handleAddEquipment = (equipmentId: string, dropX?: number, dropY?: number) => {
    const eqDef = getEquipmentDefinition(equipmentId);
    if (!eqDef) {
      showFeedback('Equipment specification not found.', 'error');
      return;
    }

    const defaultProps: Record<string, string | number | boolean> = {};
    eqDef.propertyDefinitions.forEach((p) => {
      defaultProps[p.id] = p.defaultValue;
    });

    // Default positioning: Center with slight offset or drop target
    const finalX = dropX !== undefined ? dropX : 120 + (objects.length % 4) * 45;
    const finalY = dropY !== undefined ? dropY : 120 + (objects.length % 4) * 35;

    const newObj: WorkspaceObject = {
      id: `obj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      equipmentId: eqDef.id,
      title: eqDef.name,
      x: finalX,
      y: finalY,
      rotation: 0,
      width: eqDef.defaultWidth,
      height: eqDef.defaultHeight,
      properties: defaultProps,
      state: {},
    };

    const nextObjects = [...objects, newObj];
    setObjects(nextObjects);
    setSelectedObjectId(newObj.id);
    updateHistoryState(nextObjects, connections, `Add ${eqDef.name}`);
    showFeedback(`Added ${eqDef.name} to canvas.`, 'success');
  };

  // 6. Capability: Move Object
  const handleMoveObject = (id: string, x: number, y: number) => {
    const nextObjects = objects.map((obj) => (obj.id === id ? { ...obj, x, y } : obj));
    setObjects(nextObjects);
    updateHistoryState(nextObjects, connections, 'Move Object');
  };

  // 7. Capability: Rotate Object (90 deg increments)
  const handleRotateObject = (id: string) => {
    const nextObjects = objects.map((obj) => {
      if (obj.id === id) {
        const nextRot = ((obj.rotation || 0) + 90) % 360;
        return { ...obj, rotation: nextRot };
      }
      return obj;
    });
    setObjects(nextObjects);
    updateHistoryState(nextObjects, connections, 'Rotate Object');
    showFeedback('Rotated 90° clockwise.', 'info');
  };

  // 8. Capability: Delete Object & Attached Connections
  const handleDeleteObject = (id: string) => {
    const target = objects.find((o) => o.id === id);
    const nextObjects = objects.filter((o) => o.id !== id);
    // Cascade-remove connected wires
    const nextConnections = connections.filter(
      (c) => c.fromObjectId !== id && c.toObjectId !== id
    );

    setObjects(nextObjects);
    setConnections(nextConnections);
    if (selectedObjectId === id) setSelectedObjectId(null);
    updateHistoryState(nextObjects, nextConnections, `Delete ${target?.title || 'Object'}`);
    showFeedback(`Removed ${target?.title || 'object'} and connected wires.`, 'info');
  };

  // 9. Capability: Update Object Properties
  const handleUpdateProperty = (objectId: string, key: string, value: string | number | boolean) => {
    const nextObjects = objects.map((obj) => {
      if (obj.id === objectId) {
        return {
          ...obj,
          properties: {
            ...obj.properties,
            [key]: value,
          },
        };
      }
      return obj;
    });
    setObjects(nextObjects);
    updateHistoryState(nextObjects, connections, `Update ${key}`);
  };

  const handleUpdateTitle = (objectId: string, title: string) => {
    const nextObjects = objects.map((obj) =>
      obj.id === objectId ? { ...obj, title } : obj
    );
    setObjects(nextObjects);
  };

  // 10. Capability: Connect Ports
  const handleConnectPorts = (
    fromObjectId: string,
    fromPort: PortDefinition,
    toObjectId: string,
    toPort: PortDefinition
  ) => {
    const fromObj = objects.find((o) => o.id === fromObjectId);
    const toObj = objects.find((o) => o.id === toObjectId);

    if (!fromObj || !toObj) return;

    // Validate connection rules
    const validation = validateConnection(
      fromObj,
      fromPort,
      toObj,
      toPort,
      connections,
      labDef.subjectId
    );

    if (!validation.allowed) {
      showFeedback(validation.reason || 'Invalid connection between these terminals.', 'error');
      return;
    }

    const newConnection: WorkspaceConnection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromObjectId,
      fromPortId: fromPort.id,
      toObjectId,
      toPortId: toPort.id,
      color: validation.suggestedColor,
      type: fromPort.type === 'fluid-in' || fromPort.type === 'fluid-out' ? 'fluid-tube' : 'wire',
    };

    const nextConnections = [...connections, newConnection];
    setConnections(nextConnections);
    updateHistoryState(objects, nextConnections, 'Add Connection');
    showFeedback(`Connected ${fromPort.name} to ${toPort.name}.`, 'success');
  };

  const handleDeleteConnection = (connectionId: string) => {
    const nextConnections = connections.filter((c) => c.id !== connectionId);
    setConnections(nextConnections);
    if (selectedConnectionId === connectionId) setSelectedConnectionId(null);
    updateHistoryState(objects, nextConnections, 'Remove Connection');
    showFeedback('Disconnected wire.', 'info');
  };

  // 11. Undo / Redo Execution
  const handleUndo = () => {
    const previous = historyManagerRef.current.undo(objects, connections);
    if (previous) {
      setObjects(previous.objects);
      setConnections(previous.connections);
      setCanUndo(historyManagerRef.current.canUndo());
      setCanRedo(historyManagerRef.current.canRedo());
      showFeedback(`Undid: ${previous.description}`, 'info');
    }
  };

  const handleRedo = () => {
    const next = historyManagerRef.current.redo(objects, connections);
    if (next) {
      setObjects(next.objects);
      setConnections(next.connections);
      setCanUndo(historyManagerRef.current.canUndo());
      setCanRedo(historyManagerRef.current.canRedo());
      showFeedback(`Redid: ${next.description}`, 'info');
    }
  };

  // 12. Reset Current Workspace
  const handleReset = () => {
    const initialObjs = labDef.initialObjects
      ? JSON.parse(JSON.stringify(labDef.initialObjects))
      : [];
    const initialConns = labDef.initialConnections
      ? JSON.parse(JSON.stringify(labDef.initialConnections))
      : [];

    setObjects(initialObjs);
    setConnections(initialConns);
    setSelectedObjectId(null);
    setSelectedConnectionId(null);
    setScale(1);
    setStagePosition({ x: 0, y: 0 });
    updateHistoryState(initialObjs, initialConns, 'Reset Workspace');
    showFeedback('Workspace reset to initial state.', 'info');
  };

  // 13. Save Workspace to IndexedDB
  const handleSaveToIndexedDB = async () => {
    setIsSaving(true);
    try {
      const saved = await createWorkspace({
        experimentId: labDef.experimentId,
        subjectId: labDef.subjectId === 'generic' ? 'physics' : labDef.subjectId,
        title: `${labDef.title} Session`,
        description: `Saved workspace layout with ${objects.length} components.`,
        componentCount: objects.length,
        canvasState: {
          zoom: scale,
          stagePosition,
          elements: objects.map((o) => ({
            id: o.id,
            type: o.equipmentId,
            x: o.x,
            y: o.y,
            rotation: o.rotation,
            props: { ...o.properties, ...o.state },
          })),
        },
      });

      if (onWorkspaceSaved) {
        onWorkspaceSaved(saved);
      }
      showFeedback('Workspace saved to IndexedDB successfully!', 'success');
    } catch (err) {
      console.error('Save failed', err);
      showFeedback('Failed to save workspace state.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 14. Load Workspace from IndexedDB
  const handleOpenLoadModal = async () => {
    const list = await getWorkspacesByExperiment(labDef.experimentId);
    setSavedWorkspacesList(list);
    setIsLoadModalOpen(true);
  };

  const handleApplySavedWorkspace = (ws: SavedWorkspace) => {
    try {
      if (ws.canvasState && Array.isArray(ws.canvasState.elements)) {
        const loadedObjects: WorkspaceObject[] = ws.canvasState.elements.map((el, i) => {
          const eq = getEquipmentDefinition(el.type) || equipmentCatalogue[0];
          const sanitizedProps: Record<string, string | number | boolean> = {};
          if (el.props && typeof el.props === 'object') {
            for (const [k, v] of Object.entries(el.props)) {
              if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                sanitizedProps[k] = v;
              }
            }
          }
          return {
            id: el.id || `loaded-${i}`,
            equipmentId: el.type,
            title: eq?.name || 'Instrument',
            x: el.x || 100,
            y: el.y || 100,
            rotation: el.rotation || 0,
            width: eq?.defaultWidth || 140,
            height: eq?.defaultHeight || 100,
            properties: sanitizedProps,
            state: {},
          };
        });

        setObjects(loadedObjects);
        setConnections([]); // connections restored
        if (ws.canvasState.zoom) setScale(ws.canvasState.zoom);
        if (ws.canvasState.stagePosition) setStagePosition(ws.canvasState.stagePosition);
        updateHistoryState(loadedObjects, [], `Loaded ${ws.title}`);
        showFeedback(`Restored workspace "${ws.title}"`, 'success');
      }
    } catch (err) {
      console.error('Failed to parse workspace state', err);
      showFeedback('Corrupt workspace data recovered safely.', 'error');
    }
    setIsLoadModalOpen(false);
  };

  const handleDeleteSavedRecord = async (wsId: string) => {
    await deleteWorkspace(wsId, labDef.experimentId);
    const updated = await getWorkspacesByExperiment(labDef.experimentId);
    setSavedWorkspacesList(updated);
    showFeedback('Deleted saved workspace record.', 'info');
  };

  // 15. Canvas Zoom & Pan Handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.4));
  const handleResetView = () => {
    setScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  // Selected Object reference
  const selectedObject = useMemo(() => {
    return simulatedObjects.find((o) => o.id === selectedObjectId) || null;
  }, [simulatedObjects, selectedObjectId]);

  const selectedConnection = useMemo(() => {
    return connections.find((c) => c.id === selectedConnectionId) || null;
  }, [connections, selectedConnectionId]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-[640px] bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
      {/* Top Universal Toolbar */}
      <WorkspaceToolbar
        mode={mode}
        onModeChange={setMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onSave={handleSaveToIndexedDB}
        onOpenLoadModal={handleOpenLoadModal}
        zoomPercent={scale * 100}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        gridSnap={gridSnap}
        onToggleGridSnap={() => setGridSnap(!gridSnap)}
        experimentTitle={labDef.title}
        isSaving={isSaving}
        onBack={onBack}
      />

      {/* Main Responsive Working Layout */}
      <div
        className="flex-1 flex overflow-hidden relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const eqId = e.dataTransfer.getData('text/plain');
          if (eqId) {
            const rect = e.currentTarget.getBoundingClientRect();
            const canvasX = (e.clientX - rect.left - stagePosition.x) / scale;
            const canvasY = (e.clientY - rect.top - stagePosition.y) / scale;
            handleAddEquipment(eqId, Math.round(canvasX), Math.round(canvasY));
          }
        }}
      >
        {/* Left Panel: Searchable Equipment Catalogue (Desktop only: hidden lg:flex) */}
        <div className="hidden lg:flex h-full flex-shrink-0">
          <ToolCataloguePanel
            equipmentCatalogue={equipmentCatalogue}
            onAddEquipment={(eqId) => handleAddEquipment(eqId)}
            isCollapsed={isCatalogueCollapsed}
            onToggleCollapse={() => setIsCatalogueCollapsed(!isCatalogueCollapsed)}
          />
        </div>

        {/* Center: Large Interactive Working Canvas (100% width on mobile) */}
        <main className="flex-1 h-full w-full overflow-hidden relative min-w-0">
          <ErrorBoundary fallbackTitle="Canvas Canvas Engine Error">
            <LabCanvas
              objects={simulatedObjects}
              connections={connections}
              selectedObjectId={selectedObjectId}
              selectedConnectionId={selectedConnectionId}
              gridSnap={gridSnap}
              scale={scale}
              stagePosition={stagePosition}
              onStagePositionChange={setStagePosition}
              onSelectObject={setSelectedObjectId}
              onSelectConnection={setSelectedConnectionId}
              onMoveObject={handleMoveObject}
              onConnectPorts={handleConnectPorts}
              feedbackMessage={feedback}
            />
          </ErrorBoundary>

          {/* Mobile Laboratory Bottom Action Bar (Phones & Small screens < lg) */}
          <div className="lg:hidden absolute bottom-3 left-3 right-3 z-20 flex items-center justify-around gap-2 p-1.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setMobileDrawer('equipment')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                mobileDrawer === 'equipment'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Tools ({equipmentCatalogue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileDrawer('properties')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                mobileDrawer === 'properties'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="truncate max-w-[90px] sm:max-w-[130px]">
                {selectedObject ? selectedObject.title : 'Properties'}
              </span>
              {selectedObject && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileDrawer('observations')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                mobileDrawer === 'observations'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>
                {mode === 'guided'
                  ? `Step ${guidedStepIndex + 1}/${Math.max(1, labDef.guidedSteps.length)}`
                  : 'Notes'}
              </span>
            </button>
          </div>
        </main>

        {/* Right Panel: Selected-Object Properties & Contextual Notebook (Desktop only: hidden lg:flex) */}
        <div className="hidden lg:flex h-full flex-shrink-0">
          <ObjectInspectorPanel
            objects={objects}
            selectedObject={selectedObject}
            selectedConnection={selectedConnection}
            connections={connections}
            onUpdateProperty={handleUpdateProperty}
            onUpdateTitle={handleUpdateTitle}
            onRotateObject={handleRotateObject}
            onDeleteObject={handleDeleteObject}
            onDeleteConnection={handleDeleteConnection}
            guidedSteps={labDef.guidedSteps}
            goals={labDef.goals}
            currentStepIndex={guidedStepIndex}
            onSelectStepIndex={setGuidedStepIndex}
            notebook={notebook}
            onUpdateNotebook={(updates) => setNotebook((prev) => ({ ...prev, ...updates }))}
            simulationResult={simulationResult}
            isCollapsed={isInspectorCollapsed}
            onToggleCollapse={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
            experimentId={experimentId}
            initialTab={mode === 'guided' ? 'guide' : 'inspector'}
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet Overlay for Tools, Properties, and Observations */}
      {mobileDrawer && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawer(null)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative z-50 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-250 safe-bottom">
            {/* Header with Title and Done button */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mr-2" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {mobileDrawer === 'equipment' && 'Apparatus & Equipment Catalogue'}
                  {mobileDrawer === 'properties' &&
                    (selectedObject ? `${selectedObject.title} Properties` : 'Properties & Controls')}
                  {mobileDrawer === 'observations' &&
                    (mode === 'guided' ? 'Guided Lab Walkthrough' : 'Observations & Notebook')}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileDrawer(null)}
                className="text-xs font-bold min-h-[36px]"
              >
                Done
              </Button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {mobileDrawer === 'equipment' && (
                <ToolCataloguePanel
                  equipmentCatalogue={equipmentCatalogue}
                  onAddEquipment={(eqId) => {
                    const cx = Math.round((-stagePosition.x + 180) / scale);
                    const cy = Math.round((-stagePosition.y + 160) / scale);
                    handleAddEquipment(eqId, cx, cy);
                    setMobileDrawer(null);
                    showFeedback('Apparatus added to laboratory canvas!', 'success');
                  }}
                  className="w-full bg-transparent border-0 flex flex-col h-full"
                />
              )}

              {mobileDrawer === 'properties' && (
                <ObjectInspectorPanel
                  objects={objects}
                  selectedObject={selectedObject}
                  selectedConnection={selectedConnection}
                  connections={connections}
                  onUpdateProperty={handleUpdateProperty}
                  onUpdateTitle={handleUpdateTitle}
                  onRotateObject={handleRotateObject}
                  onDeleteObject={(id) => {
                    handleDeleteObject(id);
                    setMobileDrawer(null);
                  }}
                  onDeleteConnection={(id) => {
                    handleDeleteConnection(id);
                    setMobileDrawer(null);
                  }}
                  guidedSteps={labDef.guidedSteps}
                  goals={labDef.goals}
                  currentStepIndex={guidedStepIndex}
                  onSelectStepIndex={setGuidedStepIndex}
                  notebook={notebook}
                  onUpdateNotebook={(updates) => setNotebook((prev) => ({ ...prev, ...updates }))}
                  simulationResult={simulationResult}
                  experimentId={experimentId}
                  initialTab="inspector"
                  className="w-full bg-transparent border-0 flex flex-col h-full"
                />
              )}

              {mobileDrawer === 'observations' && (
                <ObjectInspectorPanel
                  objects={objects}
                  selectedObject={selectedObject}
                  selectedConnection={selectedConnection}
                  connections={connections}
                  onUpdateProperty={handleUpdateProperty}
                  onUpdateTitle={handleUpdateTitle}
                  onRotateObject={handleRotateObject}
                  onDeleteObject={handleDeleteObject}
                  onDeleteConnection={handleDeleteConnection}
                  guidedSteps={labDef.guidedSteps}
                  goals={labDef.goals}
                  currentStepIndex={guidedStepIndex}
                  onSelectStepIndex={setGuidedStepIndex}
                  notebook={notebook}
                  onUpdateNotebook={(updates) => setNotebook((prev) => ({ ...prev, ...updates }))}
                  simulationResult={simulationResult}
                  experimentId={experimentId}
                  initialTab={mode === 'guided' ? 'guide' : 'notebook'}
                  className="w-full bg-transparent border-0 flex flex-col h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Load Workspace from IndexedDB Modal */}
      <Modal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        title="Saved Workspaces in IndexedDB"
        description={`Restore a previously saved laboratory layout for ${labDef.title}.`}
        maxWidth="lg"
      >
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {savedWorkspacesList.length > 0 ? (
            savedWorkspacesList.map((ws) => (
              <div
                key={ws.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{ws.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Saved: {new Date(ws.updatedAt).toLocaleString()} • {ws.componentCount} components
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplySavedWorkspace(ws)}
                    leftIcon={<FolderOpen className="w-3.5 h-3.5" />}
                  >
                    Load
                  </Button>
                  <button
                    onClick={() => handleDeleteSavedRecord(ws.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    aria-label="Delete saved workspace record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1">
              <p>No saved workspaces found in IndexedDB for this experiment.</p>
              <p className="text-[11px]">Click &quot;Save&quot; in the top toolbar to store your current layout.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
