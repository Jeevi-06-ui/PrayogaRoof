import React, { useState } from 'react';
import {
  Sliders,
  RotateCw,
  Trash2,
  BookOpen,
  FileText,
  Activity,
  CheckCircle2,
  Plus,
  ChevronRight,
  ChevronLeft,
  Info,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Droplet,
  FlaskConical,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  WorkspaceObject,
  WorkspaceConnection,
  LabNotebook,
  GuidedStep,
  LabGoal,
  SimulationResult,
} from '../../types';
import { getEquipmentDefinition } from '../../services/lab/registry';
import { getConceptualQuestions } from '../../services/circuit/conceptualQuestions';
import {
  getSubstanceById,
  getAllSubstances,
} from '../../services/chemistry/chemicalRegistry';
import {
  transferLiquid,
  stirContainer,
  createContainerWithSubstance,
  recomputeMixtureProperties,
  STANDARD_ROOM_TEMP,
} from '../../services/chemistry/chemistryEngine';
import { ContainerLiquidState, MixtureComponent } from '../../services/chemistry/chemistryTypes';
import { Button } from '../shared/Button';

interface ObjectInspectorPanelProps {
  objects?: WorkspaceObject[];
  selectedObject: WorkspaceObject | null;
  selectedConnection: WorkspaceConnection | null;
  connections: WorkspaceConnection[];
  onUpdateProperty: (objectId: string, key: string, value: string | number | boolean) => void;
  onUpdateTitle: (objectId: string, title: string) => void;
  onRotateObject: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  // Guided mode props
  guidedSteps: GuidedStep[];
  goals: LabGoal[];
  currentStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  // Notebook props
  notebook: LabNotebook;
  onUpdateNotebook: (updates: Partial<LabNotebook>) => void;
  // Simulation results
  simulationResult?: SimulationResult;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  experimentId?: string;
  initialTab?: 'inspector' | 'guide' | 'notebook' | 'questions' | 'telemetry' | 'reagents';
}

export const ObjectInspectorPanel: React.FC<ObjectInspectorPanelProps> = ({
  objects = [],
  selectedObject,
  selectedConnection,
  connections,
  onUpdateProperty,
  onUpdateTitle,
  onRotateObject,
  onDeleteObject,
  onDeleteConnection,
  guidedSteps,
  goals,
  currentStepIndex,
  onSelectStepIndex,
  notebook,
  onUpdateNotebook,
  simulationResult,
  isCollapsed = false,
  onToggleCollapse,
  experimentId = 'ohms-law',
  initialTab = 'inspector',
}) => {
  const [activeTab, setActiveTab] = useState<
    'inspector' | 'guide' | 'notebook' | 'questions' | 'telemetry' | 'reagents'
  >(initialTab);

  // Chemistry transfer and dispense state
  const [transferDestId, setTransferDestId] = useState<string>('');
  const [transferVolume, setTransferVolume] = useState<number>(20);
  const [transferFeedback, setTransferFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [dispenseSubstanceId, setDispenseSubstanceId] = useState<string>('pure-water');
  const [dispenseVolume, setDispenseVolume] = useState<number>(25);

  // Notebook new measurement input state
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newUnit, setNewUnit] = useState('');

  // Conceptual questions state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const questions = getConceptualQuestions(experimentId);

  const eqDef = selectedObject ? getEquipmentDefinition(selectedObject.equipmentId) : null;

  const isContainer = selectedObject
    ? ['beaker', 'flask', 'cylinder', 'test-tube', 'reagent-bottle', 'spotting-plate'].includes(
        eqDef?.renderType || ''
      )
    : false;

  const isChemistry =
    experimentId === 'ph-testing' ||
    experimentId === 'natural-indicators' ||
    experimentId === 'chemical-reactions' ||
    experimentId === 'acids-bases-salts' ||
    experimentId === 'precipitation' ||
    eqDef?.subjectId === 'chemistry' ||
    eqDef?.category === 'container' ||
    eqDef?.category === 'instrument' ||
    isContainer;

  // Filter connections involving the selected object
  const objectConnections = selectedObject
    ? connections.filter(
        (c) => c.fromObjectId === selectedObject.id || c.toObjectId === selectedObject.id
      )
    : [];

  // Find other container apparatus on the bench
  const otherContainers = objects.filter(
    (o) =>
      selectedObject &&
      o.id !== selectedObject.id &&
      ['beaker', 'flask', 'cylinder', 'test-tube', 'reagent-bottle', 'spotting-plate'].includes(
        getEquipmentDefinition(o.equipmentId)?.renderType || ''
      )
  );

  const getContainerState = (obj: WorkspaceObject): ContainerLiquidState => {
    const capacity = Number(obj.properties.capacityMl ?? 100);
    const volume = Number(obj.properties.liquidVolume ?? 0);
    const reagentId = String(obj.properties.reagentSolution ?? 'pure-water');
    if (
      obj.properties.mixtureComponentsJson &&
      typeof obj.properties.mixtureComponentsJson === 'string'
    ) {
      try {
        const parsedComps = JSON.parse(obj.properties.mixtureComponentsJson);
        return recomputeMixtureProperties({
          capacityMl: capacity,
          totalVolumeMl: volume,
          temperatureC: STANDARD_ROOM_TEMP,
          ph: 7.0,
          color: '#e2e8f0',
          components: parsedComps,
          isStirred: true,
          reactionState: 'homogeneous',
          observationText: '',
          isOverflow: volume > capacity,
        });
      } catch {
        return createContainerWithSubstance(reagentId, volume, capacity);
      }
    }
    return createContainerWithSubstance(reagentId, volume, capacity);
  };

  const handlePourLiquid = () => {
    if (!selectedObject) return;
    if (!transferDestId) {
      setTransferFeedback({ type: 'warning', text: 'Select a destination container first.' });
      return;
    }
    const destObject = objects.find((o) => o.id === transferDestId);
    if (!destObject) {
      setTransferFeedback({ type: 'error', text: 'Destination container not found on bench.' });
      return;
    }

    const sourceState = getContainerState(selectedObject);
    const destState = getContainerState(destObject);

    const result = transferLiquid(sourceState, destState, transferVolume);

    if (!result.success) {
      setTransferFeedback({ type: 'error', text: result.message });
      return;
    }

    onUpdateProperty(selectedObject.id, 'liquidVolume', result.sourceRemainingMl);
    onUpdateProperty(
      selectedObject.id,
      'mixtureComponentsJson',
      JSON.stringify(result.sourceNewState.components)
    );

    onUpdateProperty(destObject.id, 'liquidVolume', result.destinationTotalMl);
    onUpdateProperty(
      destObject.id,
      'mixtureComponentsJson',
      JSON.stringify(result.destinationNewState.components)
    );

    if (result.overflowOccurred) {
      setTransferFeedback({
        type: 'warning',
        text: `Transferred ${result.transferredVolumeMl} mL. Warning: Destination overflowed by ${result.overflowVolumeMl} mL!`,
      });
    } else {
      setTransferFeedback({
        type: 'success',
        text: `Transferred ${result.transferredVolumeMl} mL into ${destObject.title}.`,
      });
    }
  };

  const handleDispenseReagent = (substanceId: string, volume: number) => {
    if (!selectedObject) return;
    const currentState = getContainerState(selectedObject);
    const sub = getSubstanceById(substanceId);
    if (!sub) return;

    const moles = sub.defaultConcentrationM * (volume / 1000);
    const newComp: MixtureComponent = {
      substanceId: sub.id,
      substanceName: sub.name,
      volumeMl: volume,
      concentrationM: sub.defaultConcentrationM,
      moles,
    };

    const newComps = [...currentState.components];
    const existingIdx = newComps.findIndex((c) => c.substanceId === sub.id);
    if (existingIdx >= 0) {
      newComps[existingIdx] = {
        ...newComps[existingIdx],
        volumeMl: newComps[existingIdx].volumeMl + volume,
        moles: newComps[existingIdx].moles + moles,
      };
    } else {
      newComps.push(newComp);
    }

    const newTotal = currentState.totalVolumeMl + volume;
    const isOverflow = newTotal > currentState.capacityMl;
    const cappedTotal = Math.min(newTotal, currentState.capacityMl);

    const updated = recomputeMixtureProperties({
      ...currentState,
      components: newComps,
      totalVolumeMl: cappedTotal,
      isOverflow,
    });

    onUpdateProperty(selectedObject.id, 'liquidVolume', updated.totalVolumeMl);
    onUpdateProperty(selectedObject.id, 'reagentSolution', substanceId);
    onUpdateProperty(
      selectedObject.id,
      'mixtureComponentsJson',
      JSON.stringify(updated.components)
    );

    setTransferFeedback({
      type: isOverflow ? 'warning' : 'success',
      text: isOverflow
        ? `Added ${volume} mL ${sub.name}. Overflow: volume capped to ${currentState.capacityMl} mL!`
        : `Added ${volume} mL of ${sub.name} into ${selectedObject.title}.`,
    });
  };

  const handleStirSolution = () => {
    if (!selectedObject) return;
    const currentState = getContainerState(selectedObject);
    const stirred = stirContainer(currentState);
    onUpdateProperty(
      selectedObject.id,
      'mixtureComponentsJson',
      JSON.stringify(stirred.components)
    );
    setTransferFeedback({
      type: 'success',
      text: `Agitated ${selectedObject.title} with glass stirring rod. Mixture is homogeneous.`,
    });
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newValue.trim()) return;

    const newRecord = {
      id: `meas-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      label: newLabel.trim(),
      value: newValue.trim(),
      unit: newUnit.trim() || '-',
    };

    onUpdateNotebook({
      measurements: [...notebook.measurements, newRecord],
    });

    setNewLabel('');
    setNewValue('');
    setNewUnit('');
  };

  const handleDeleteMeasurement = (id: string) => {
    onUpdateNotebook({
      measurements: notebook.measurements.filter((m) => m.id !== id),
    });
  };

  const handleAutoLogExperiment = () => {
    const updates = simulationResult?.objectStateUpdates || {};
    const trialNum = notebook.measurements.length + 1;
    let newRecord = null;

    if (experimentId === 'convex-lens') {
      const lensUpdate = Object.entries(updates).find(
        ([id]) => id.includes('lens') || id.includes('convex')
      )?.[1];
      const v = lensUpdate?.computedImageDistance ?? 30;
      const m = lensUpdate?.magnification ?? -1.0;
      const nature = lensUpdate?.imageNature ?? 'Real, Inverted';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Thin Lens`,
        value: `v = ${Number(v) > 0 ? '+' : ''}${v} cm, m = ${m} (${nature})`,
        unit: '',
      };
    } else if (experimentId === 'magnetic-field') {
      const compassUpdate = Object.entries(updates).find(([id]) => id.includes('compass'))?.[1];
      const angle = compassUpdate?.needleAngleDeg ?? 0;
      const bField = compassUpdate?.magneticFieldUT ?? 50;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Magnetic Probe`,
        value: `θ = ${angle}°, |B| = ${bField} µT`,
        unit: '',
      };
    } else if (experimentId === 'simple-pendulum') {
      const pendUpdate = Object.entries(updates).find(([id]) => id.includes('pend'))?.[1];
      const period = pendUpdate?.periodSeconds ?? 1.8;
      const gCalc = pendUpdate?.calculatedGravity ?? 9.8;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Simple Pendulum`,
        value: `T = ${period} s (g_calc = ${gCalc} m/s²)`,
        unit: '',
      };
    } else if (experimentId === 'ph-testing') {
      const containerObj =
        selectedObject && isContainer
          ? selectedObject
          : objects.find((o) =>
              ['beaker', 'flask', 'cylinder', 'test-tube', 'spotting-plate'].includes(
                getEquipmentDefinition(o.equipmentId)?.renderType || ''
              )
            );
      const updatesForObj = containerObj ? updates[containerObj.id] : null;
      const phVal = updatesForObj?.samplePH ?? (containerObj?.properties?.samplePH as number) ?? 7.0;
      const volVal =
        updatesForObj?.liquidVolume ?? (containerObj?.properties?.liquidVolume as number) ?? 0;
      const title = containerObj?.title ?? 'Tested Solution';
      const obs = updatesForObj?.observationText ?? 'pH measurement logged';

      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: ${title}`,
        value: `pH = ${Number(phVal).toFixed(2)}, Vol = ${volVal} mL (${obs})`,
        unit: '',
      };
    } else if (experimentId === 'natural-indicators') {
      const containerObj =
        selectedObject && isContainer
          ? selectedObject
          : objects.find((o) =>
              ['beaker', 'flask', 'cylinder', 'test-tube', 'spotting-plate'].includes(
                getEquipmentDefinition(o.equipmentId)?.renderType || ''
              )
            );
      const updatesForObj = containerObj ? updates[containerObj.id] : null;
      const phVal = updatesForObj?.samplePH ?? 7.0;
      const colorVal = updatesForObj?.liquidColor ?? 'Yellow';
      const obs = updatesForObj?.observationText ?? 'Indicator shift logged';
      const title = containerObj?.title ?? 'Natural Indicator Sample';

      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: ${title}`,
        value: `Color = ${colorVal}, pH = ${Number(phVal).toFixed(1)} (${obs})`,
        unit: '',
      };
    } else {
      let volt = 0;
      let curr = 0;
      for (const st of Object.values(updates)) {
        if (st.measuredVoltage !== undefined && Number(st.measuredVoltage) > volt) {
          volt = Number(st.measuredVoltage);
        }
        if (st.outputVoltage !== undefined && Number(st.outputVoltage) > volt) {
          volt = Number(st.outputVoltage);
        }
        if (st.measuredCurrent !== undefined && Number(st.measuredCurrent) > curr) {
          curr = Number(st.measuredCurrent);
        }
        if (st.currentAmps !== undefined && Number(st.currentAmps) > curr) {
          curr = Number(st.currentAmps);
        }
      }

      const reqStr = curr > 0.0001 ? `${(volt / curr).toFixed(1)} Ω` : '—';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: V=${volt.toFixed(1)}V`,
        value: `${curr.toFixed(3)} A (Req: ${reqStr})`,
        unit: '',
      };
    }

    if (newRecord) {
      onUpdateNotebook({
        measurements: [...notebook.measurements, newRecord],
      });
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Expand Inspector Panel"
          aria-label="Expand Inspector Panel"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 sm:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0 select-none">
      {/* Tab Navigation Header */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'inspector', label: 'Inspector', icon: Sliders },
            { id: 'guide', label: 'Guide', icon: BookOpen },
            { id: 'notebook', label: 'Notebook', icon: FileText },
            { id: 'questions', label: 'Quiz', icon: HelpCircle },
            { id: 'telemetry', label: 'Live Data', icon: Activity },
            ...(isChemistry ? [{ id: 'reagents', label: 'Reagents', icon: Droplet }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Collapse Inspector"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contextual Warning & Error Banners */}
      {simulationResult?.warnings && simulationResult.warnings.length > 0 && (
        <div className="mx-3 mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>Circuit Warning</span>
          </div>
          {simulationResult.warnings.map((w, i) => (
            <p key={i} className="text-[11px] leading-relaxed pl-5">
              {w}
            </p>
          ))}
        </div>
      )}

      {simulationResult?.errors && simulationResult.errors.length > 0 && (
        <div className="mx-3 mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-800 dark:text-red-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>Circuit Notice</span>
          </div>
          {simulationResult.errors.map((err, i) => (
            <p key={i} className="text-[11px] leading-relaxed pl-5">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Tab 1: Object Inspector */}
      {activeTab === 'inspector' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {selectedObject && eqDef ? (
            <div className="space-y-4">
              {/* Header with Title and Type */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  {eqDef.category}
                </span>
                <input
                  type="text"
                  value={selectedObject.title}
                  onChange={(e) => onUpdateTitle(selectedObject.id, e.target.value)}
                  className="w-full text-sm font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 text-slate-900 dark:text-slate-100 focus:outline-none py-0.5"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {eqDef.description}
                </p>
              </div>

              {/* Position and Rotation Actions */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Coordinates</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    X: {Math.round(selectedObject.x)}, Y: {Math.round(selectedObject.y)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Rotation</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedObject.rotation || 0}°
                  </span>
                </div>

                {eqDef.rotatable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRotateObject(selectedObject.id)}
                    leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                    className="w-full text-xs mt-1"
                  >
                    Rotate 90° Clockwise
                  </Button>
                )}
              </div>

              {/* Dynamic Property Editors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Configurable Properties
                </h4>

                {eqDef.propertyDefinitions.length > 0 ? (
                  <div className="space-y-3">
                    {eqDef.propertyDefinitions.map((propDef) => {
                      const curVal =
                        selectedObject.properties[propDef.id] !== undefined
                          ? selectedObject.properties[propDef.id]
                          : propDef.defaultValue;

                      return (
                        <div
                          key={propDef.id}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {propDef.label}
                            </label>
                            {propDef.unit && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {propDef.unit}
                              </span>
                            )}
                          </div>

                          {propDef.type === 'number' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={propDef.min ?? 0}
                                max={propDef.max ?? 100}
                                step={propDef.step ?? 1}
                                value={Number(curVal)}
                                onChange={(e) =>
                                  onUpdateProperty(
                                    selectedObject.id,
                                    propDef.id,
                                    parseFloat(e.target.value)
                                  )
                                }
                                disabled={propDef.editable === false}
                                className="flex-1 accent-blue-600"
                              />
                              <input
                                type="number"
                                min={propDef.min}
                                max={propDef.max}
                                step={propDef.step}
                                value={curVal as number}
                                onChange={(e) =>
                                  onUpdateProperty(
                                    selectedObject.id,
                                    propDef.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                disabled={propDef.editable === false}
                                className="w-16 px-1.5 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right"
                              />
                            </div>
                          )}

                          {propDef.type === 'boolean' && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                {curVal ? 'Enabled / On' : 'Disabled / Off'}
                              </span>
                              <input
                                type="checkbox"
                                checked={Boolean(curVal)}
                                onChange={(e) =>
                                  onUpdateProperty(selectedObject.id, propDef.id, e.target.checked)
                                }
                                disabled={propDef.editable === false}
                                className="w-4 h-4 accent-blue-600 rounded"
                              />
                            </div>
                          )}

                          {propDef.type === 'select' && (
                            <select
                              value={String(curVal)}
                              onChange={(e) =>
                                onUpdateProperty(selectedObject.id, propDef.id, e.target.value)
                              }
                              disabled={propDef.editable === false}
                              className="w-full p-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                              {propDef.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {propDef.type === 'string' && (
                            <input
                              type="text"
                              value={String(curVal)}
                              onChange={(e) =>
                                onUpdateProperty(selectedObject.id, propDef.id, e.target.value)
                              }
                              disabled={propDef.editable === false}
                              className="w-full p-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No editable properties for this apparatus.</p>
                )}
              </div>

              {/* Chemistry Container Interactions (Pouring, Dispensing, Agitation) */}
              {isContainer && (
                <div className="space-y-3 pt-1">
                  {(() => {
                    const cState = getContainerState(selectedObject);
                    const fillPct = Math.min(
                      100,
                      Math.round((cState.totalVolumeMl / cState.capacityMl) * 100)
                    );

                    return (
                      <>
                        {/* Container Liquid Content Card */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              Container Fill Level
                            </span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                              {cState.totalVolumeMl} / {cState.capacityMl} mL ({fillPct}%)
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                cState.isOverflow
                                  ? 'bg-red-500 animate-pulse'
                                  : cState.totalVolumeMl > 0
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-300'
                              }`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                Solution pH
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                                  style={{ backgroundColor: cState.color }}
                                />
                                {cState.ph.toFixed(2)}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                Temperature
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">
                                {cState.temperatureC.toFixed(1)} °C
                              </span>
                            </div>
                          </div>

                          {cState.observationText && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                              {cState.observationText}
                            </p>
                          )}
                        </div>

                        {/* Liquid Transfer / Pouring */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-blue-500" />
                            Pour Liquid to Container
                          </h5>
                          {otherContainers.length > 0 ? (
                            <div className="space-y-2">
                              <div>
                                <label className="text-[11px] text-slate-500 block mb-1">
                                  Destination Container
                                </label>
                                <select
                                  value={transferDestId}
                                  onChange={(e) => setTransferDestId(e.target.value)}
                                  className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                                >
                                  <option value="">-- Select destination --</option>
                                  {otherContainers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.title} ({c.properties.liquidVolume ?? 0}/
                                      {c.properties.capacityMl ?? 100} mL)
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-[11px] text-slate-500 block mb-1">
                                    Pour Volume (mL)
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={cState.totalVolumeMl || 100}
                                    value={transferVolume}
                                    onChange={(e) =>
                                      setTransferVolume(Math.max(1, parseInt(e.target.value) || 1))
                                    }
                                    className="w-full p-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                                  />
                                </div>
                                <div className="flex gap-1 pt-4">
                                  {[10, 25, 50].map((v) => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => setTransferVolume(v)}
                                      className="px-2 py-1 text-[10px] rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={handlePourLiquid}
                                disabled={cState.totalVolumeMl <= 0 || !transferDestId}
                                className="w-full text-xs"
                                leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                              >
                                Pour {transferVolume} mL Liquid
                              </Button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400">
                              Drag another beaker, flask, or cylinder onto the table to pour liquids.
                            </p>
                          )}
                        </div>

                        {/* Reagent Dispenser Aliquot */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Dispense Reagent Aliquot
                          </h5>
                          <div className="space-y-2">
                            <select
                              value={dispenseSubstanceId}
                              onChange={(e) => setDispenseSubstanceId(e.target.value)}
                              className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                            >
                              {getAllSubstances().map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                  {sub.name} ({sub.formula})
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={dispenseVolume}
                                onChange={(e) =>
                                  setDispenseVolume(Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-20 p-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                              />
                              <span className="text-xs text-slate-500">mL</span>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleDispenseReagent(dispenseSubstanceId, dispenseVolume)
                                }
                                className="flex-1 text-xs"
                                leftIcon={<Plus className="w-3 h-3" />}
                              >
                                Add Chemical
                              </Button>
                            </div>
                          </div>
                          <div className="pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleStirSolution}
                              className="w-full text-xs"
                              leftIcon={<RotateCw className="w-3.5 h-3.5 text-cyan-600" />}
                            >
                              Stir with Glass Rod
                            </Button>
                          </div>
                        </div>

                        {/* Real-time Transfer Feedback Banner */}
                        {transferFeedback && (
                          <div
                            className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                              transferFeedback.type === 'error'
                                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                                : transferFeedback.type === 'warning'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            <span>{transferFeedback.text}</span>
                            <button
                              onClick={() => setTransferFeedback(null)}
                              className="text-slate-400 hover:text-slate-600 ml-2"
                            >
                              &times;
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Connected Ports List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Attachment Ports ({eqDef.ports.length})
                </h4>
                <div className="space-y-1.5">
                  {eqDef.ports.map((port) => {
                    const isWired = objectConnections.some(
                      (c) =>
                        (c.fromObjectId === selectedObject.id && c.fromPortId === port.id) ||
                        (c.toObjectId === selectedObject.id && c.toPortId === port.id)
                    );
                    return (
                      <div
                        key={port.id}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: port.color || '#3b82f6' }}
                          />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {port.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isWired
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}
                        >
                          {isWired ? 'Connected' : 'Open'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete Object Action */}
              <div className="pt-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeleteObject(selectedObject.id)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  className="w-full text-xs"
                >
                  Delete Apparatus
                </Button>
              </div>
            </div>
          ) : selectedConnection ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selected Connection Wire
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
                <p className="font-mono text-slate-700 dark:text-slate-300">
                  Type: {selectedConnection.type}
                </p>
                <p className="font-mono text-slate-500">
                  From: {selectedConnection.fromPortId} → To: {selectedConnection.toPortId}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteConnection(selectedConnection.id)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                className="w-full text-xs"
              >
                Disconnect Wire
              </Button>
            </div>
          ) : (
            <div className="py-16 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Object Selected
              </h4>
              <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                Click or tap an apparatus on the working canvas to inspect and edit its physical properties.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Contextual Guided Mode */}
      {activeTab === 'guide' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Guided Experiment Steps
            </h4>
            <p className="text-xs text-slate-500">
              Follow instructions step-by-step to complete syllabus criteria.
            </p>
          </div>

          {guidedSteps.map((step, idx) => {
            const isCurrent = currentStepIndex === idx;
            return (
              <div
                key={step.id}
                onClick={() => onSelectStepIndex(idx)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">{step.title}</h5>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                  {step.instruction}
                </p>
                {step.hint && (
                  <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 pl-7">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>Hint: {step.hint}</span>
                  </p>
                )}
              </div>
            );
          })}

          {/* Goal verification checklist */}
          {goals.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Experiment Verification Goals
              </h5>
              {goals.map((g) => (
                <div key={g.id} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{g.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reusable Experiment Notebook */}
      {activeTab === 'notebook' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Scientific Hypotheses & Observations
            </label>
            <textarea
              value={notebook.observations}
              onChange={(e) => onUpdateNotebook({ observations: e.target.value })}
              placeholder="Record what you observed during this trial..."
              rows={4}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Measurements Table */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-700 dark:text-slate-300">
              Quantitative Measurements Log ({notebook.measurements.length})
            </h5>

            {notebook.measurements.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2">Label</th>
                      <th className="p-2">Value</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {notebook.measurements.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2 text-slate-700 dark:text-slate-300">{m.label}</td>
                        <td className="p-2 font-bold text-blue-600 dark:text-blue-400">
                          {m.value} {m.unit}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDeleteMeasurement(m.id)}
                            className="text-slate-400 hover:text-red-500"
                            aria-label="Remove record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-[11px]">No quantitative measurements logged yet.</p>
            )}

            {/* Quick Auto-Log Action */}
            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col gap-1.5">
              <span className="font-semibold text-blue-900 dark:text-blue-300 text-[11px]">
                {experimentId === 'convex-lens'
                  ? 'Optical Bench Quick Log'
                  : experimentId === 'magnetic-field'
                    ? 'Magnetic Probe Quick Log'
                    : experimentId === 'simple-pendulum'
                      ? 'Simple Pendulum Quick Log'
                      : 'Active Bench Quick Log'}
              </span>
              <p className="text-[10px] text-blue-700/80 dark:text-blue-400 leading-snug">
                {experimentId === 'convex-lens'
                  ? 'Instantly log thin-lens object distance (u), image distance (v), and magnification (m).'
                  : experimentId === 'magnetic-field'
                    ? 'Instantly log probe compass orientation and net magnetic field vector magnitude.'
                    : experimentId === 'simple-pendulum'
                      ? 'Instantly log string length (L), time period (T), and calculated gravity (g).'
                      : 'Instantly snapshot solved bench voltage, current, and equivalent resistance into this log.'}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAutoLogExperiment}
                className="w-full text-xs text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                leftIcon={<Activity className="w-3.5 h-3.5 text-blue-500" />}
              >
                Log Current Bench Readings
              </Button>
            </div>

            {/* Add Measurement Form */}
            <form onSubmit={handleAddMeasurement} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                Add Measurement Entry
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Trial 1 Voltage"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-14 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" size="sm" className="w-full text-xs" leftIcon={<Plus className="w-3 h-3" />}>
                Log Measurement
              </Button>
            </form>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Final Scientific Conclusion
            </label>
            <textarea
              value={notebook.conclusions}
              onChange={(e) => onUpdateNotebook({ conclusions: e.target.value })}
              placeholder="State what scientific principle or law was validated..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Conceptual Questions & Knowledge Check */}
      {activeTab === 'questions' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Conceptual Mastery Check
            </h4>
            <p className="text-xs text-slate-500">
              Test your understanding of electrical theory and circuit principles.
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      Q{qIdx + 1}
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                      {q.question}
                    </h5>
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5 pl-7">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      let optClass =
                        'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-blue-300';

                      if (isAnswered) {
                        if (optIdx === q.correctIndex) {
                          optClass =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold';
                        } else if (isOptionSelected) {
                          optClass =
                            'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className={`w-full p-2 rounded-lg border text-left text-[11px] leading-snug transition-colors flex items-center justify-between gap-2 ${optClass}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          )}
                          {isAnswered && isOptionSelected && optIdx !== q.correctIndex && (
                            <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {isAnswered && (
                    <div
                      className={`p-2.5 rounded-lg text-[11px] leading-relaxed pl-3 border ${
                        isCorrect
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      <p className="font-bold mb-0.5">
                        {isCorrect ? '✓ Correct!' : 'Review Concept:'}
                      </p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Live Telemetry / Simulation State */}
      {activeTab === 'telemetry' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Active Simulation Telemetry
            </h4>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] space-y-1.5">
            <p className="text-slate-500">Connections Wired: {connections.length}</p>
            <p className="text-slate-500">
              Simulation Status: {simulationResult?.valid ? 'Calculated Stable' : 'Evaluating'}
            </p>
          </div>

          {/* Special Telemetry: Simple Pendulum Harmonic Oscillation Waveform */}
          {experimentId === 'simple-pendulum' && (
            <div className="p-3 rounded-xl bg-slate-900 text-white space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-sky-400">Angular Displacement θ(t)</span>
                <span className="text-slate-400 font-mono">T = 2π√(L/g)</span>
              </div>
              <div className="w-full h-24 bg-slate-950 rounded-lg p-1.5 flex flex-col justify-between">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
                  <line
                    x1="0"
                    y1="30"
                    x2="200"
                    y2="30"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <path
                    d={(() => {
                      let path = 'M 0 30';
                      const T = 1.8;
                      for (let x = 0; x <= 200; x += 4) {
                        const t = (x / 200) * 4.0;
                        const y = 30 - 22 * Math.cos((2 * Math.PI * t) / T);
                        path += ` L ${x} ${y.toFixed(1)}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0s</span>
                <span>θ(t) = θ₀ cos(ωt)</span>
                <span>4.0s</span>
              </div>
              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-[10px] text-emerald-300">
                ✓ Mass Independence: Changing bob mass m does not change period T.
              </div>
            </div>
          )}

          {simulationResult?.messages && simulationResult.messages.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                Event Log:
              </h5>
              {simulationResult.messages.map((msg, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px]"
                >
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Chemical Reagent Inventory & Safety */}
      {activeTab === 'reagents' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Chemical Reagents & Safety
            </h4>
            <p className="text-xs text-slate-500">
              Curriculum substances with educational hazard classification and handling guidelines.
            </p>
          </div>

          <div className="space-y-3">
            {getAllSubstances().map((sub) => {
              const isIndicator =
                sub.category === 'natural-indicator' || sub.category === 'synthetic-indicator';
              const categoryColor =
                sub.category === 'strong-acid' || sub.category === 'weak-acid'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : sub.category === 'strong-base' || sub.category === 'weak-base'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    : isIndicator
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {sub.name}
                      </h5>
                      <span className="font-mono text-[11px] text-slate-500">{sub.formula}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColor}`}
                    >
                      {sub.category.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">pH:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {sub.basePH.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Color:</span>
                      <span
                        className="w-3.5 h-3.5 rounded border border-slate-300 inline-block"
                        style={{ backgroundColor: sub.baseColor }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Conc:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {sub.defaultConcentrationM} M
                      </span>
                    </div>
                  </div>

                  {/* Hazard tags */}
                  <div className="flex flex-wrap gap-1">
                    {sub.hazards.map((h, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1"
                      >
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-600" />
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Educational Safety Note */}
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      Safety Handling Note:
                    </p>
                    <p>{sub.safetyNotes}</p>
                  </div>

                  {/* Action: Dispense into currently selected container */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedObject || !isContainer}
                    onClick={() =>
                      handleDispenseReagent(
                        sub.id,
                        isIndicator ? 5 : 25
                      )
                    }
                    className="w-full text-xs mt-1"
                    leftIcon={<Droplet className="w-3 h-3 text-emerald-600" />}
                  >
                    {selectedObject && isContainer
                      ? `Dispense ${isIndicator ? '5 mL' : '25 mL'} into ${selectedObject.title}`
                      : 'Select a container on bench to dispense'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
