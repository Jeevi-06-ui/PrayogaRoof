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
  Layers,
  RefreshCw,
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
    ? [
        'beaker',
        'flask',
        'cylinder',
        'test-tube',
        'reagent-bottle',
        'spotting-plate',
        'developing-chamber',
        'evaporating-dish',
      ].includes(eqDef?.renderType || '')
    : false;

  const isChemistry =
    experimentId === 'ph-testing' ||
    experimentId === 'natural-indicators' ||
    experimentId === 'paper-chromatography' ||
    experimentId === 'displacement-reaction' ||
    experimentId === 'crystallisation' ||
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
    } else if (experimentId === 'paper-chromatography') {
      const paperObj =
        objects.find(
          (o) =>
            o.equipmentId === 'chromatography-paper-strip' ||
            getEquipmentDefinition(o.equipmentId)?.renderType === 'chromatography-paper'
        ) || selectedObject;
      const paperUpdate = paperObj ? updates[paperObj.id] : null;
      const front = paperUpdate?.solventFrontMm ?? 60.0;
      const rf = paperUpdate?.rfSummary ?? 'Bands separated';
      const sample = String(paperObj?.properties?.sampleInk ?? 'black-ink');

      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Chromatography (${sample})`,
        value: `Front = ${front} mm | Rf: ${rf}`,
        unit: '',
      };
    } else if (experimentId === 'displacement-reaction') {
      const nailObj =
        objects.find(
          (o) =>
            o.equipmentId === 'iron-nail-substrate' ||
            getEquipmentDefinition(o.equipmentId)?.renderType === 'iron-nail'
        ) || selectedObject;
      const nailUpdate = nailObj ? updates[nailObj.id] : null;
      const mins =
        nailUpdate?.immersionTimeMinutes ??
        nailObj?.properties?.immersionTimeMinutes ??
        20;
      const prog = nailUpdate?.reactionProgressPercent ?? 80;
      const cuGrams = nailUpdate?.depositedCopperGrams ?? 0.72;
      const netGain = nailUpdate?.netNailMassChangeGrams ?? 0.09;

      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Fe + CuSO₄ (${mins}m)`,
        value: `${prog}% reacted | Cu: +${cuGrams}g (Net Δm: +${netGain}g)`,
        unit: '',
      };
    } else if (experimentId === 'crystallisation') {
      const dishObj =
        objects.find(
          (o) =>
            o.equipmentId === 'porcelain-evaporating-dish' ||
            getEquipmentDefinition(o.equipmentId)?.renderType === 'evaporating-dish'
        ) || selectedObject;
      const dishUpdate = dishObj ? updates[dishObj.id] : null;
      const temp =
        dishUpdate?.solutionTemperatureC ??
        dishObj?.properties?.solutionTemperatureC ??
        85;
      const sat = dishUpdate?.saturationStatus ?? 'supersaturated';
      const yieldG = dishUpdate?.crystalYieldGrams ?? 4.8;
      const water = dishUpdate?.remainingWaterMl ?? 20;

      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Crystallisation (${temp}°C)`,
        value: `Status: ${sat} | Crystals: ${yieldG}g (Water: ${water}mL)`,
        unit: '',
      };
    } else if (experimentId === 'vernier-callipers') {
      const vcUpdate = Object.entries(updates).find(([id]) => id.includes('calliper') || id.includes('vc'))?.[1];
      const msr = vcUpdate?.msrMm ?? 25;
      const vcd = vcUpdate?.vcd ?? 4;
      const reading = vcUpdate?.correctedReadingMm ?? 25.4;
      const vol = vcUpdate?.volumeCm3 ?? 26.35;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Vernier Calliper`,
        value: `MSR = ${msr} mm, VCD = ${vcd} => ${reading} mm (Vol: ${vol} cm³)`,
        unit: '',
      };
    } else if (experimentId === 'screw-gauge') {
      const sgUpdate = Object.entries(updates).find(([id]) => id.includes('sg') || id.includes('screw'))?.[1];
      const psr = sgUpdate?.psrMm ?? 0.0;
      const csr = sgUpdate?.csr ?? 46;
      const reading = sgUpdate?.correctedReadingMm ?? 0.46;
      const area = sgUpdate?.crossSectionMm2 ?? 0.166;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Screw Gauge`,
        value: `PSR = ${psr} mm, CSR = ${csr} => ${reading} mm (Area: ${area} mm²)`,
        unit: '',
      };
    } else if (experimentId === 'irregular-lamina') {
      const gridUpdate = Object.entries(updates).find(([id]) => id.includes('grid') || id.includes('lamina'))?.[1];
      const area = gridUpdate?.calculatedAreaCm2 ?? 22.0;
      const unc = gridUpdate?.uncertaintyCm2 ?? 2.0;
      const full = gridUpdate?.fullSquares ?? 16;
      const more = gridUpdate?.moreThanHalf ?? 8;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Irregular Lamina`,
        value: `Area = ${area} ± ${unc} cm² (N₁=${full}, N₂=${more})`,
        unit: '',
      };
    } else if (experimentId === 'spherometer') {
      const sphUpdate = Object.entries(updates).find(([id]) => id.includes('sph'))?.[1];
      const sagitta = sphUpdate?.sagittaMm ?? 2.03;
      const r = sphUpdate?.radiusOfCurvatureCm ?? 13.24;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Spherometer`,
        value: `Sagitta h = ${sagitta} mm => R = ${r === Infinity ? '∞' : `${r} cm`}`,
        unit: '',
      };
    } else if (experimentId === 'beam-balance') {
      const bbUpdate = Object.entries(updates).find(([id]) => id.includes('bb') || id.includes('balance'))?.[1];
      const left = bbUpdate?.leftPanMassGrams ?? 24.50;
      const right = bbUpdate?.rightPanMassGrams ?? 20.00;
      const status = bbUpdate?.balanceStatus ?? 'imbalance';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Beam Balance`,
        value: `Left: ${left}g, Right: ${right}g (${String(status).toUpperCase()})`,
        unit: '',
      };
    } else if (experimentId === 'parallelogram-law') {
      const fbUpdate = Object.entries(updates).find(([id]) => id.includes('fb') || id.includes('force'))?.[1];
      const p = fbUpdate?.forceP ?? 3.0;
      const q = fbUpdate?.forceQ ?? 4.0;
      const r = fbUpdate?.resultantMagnitudeN ?? 5.0;
      const rAngle = fbUpdate?.resultantAngleDeg ?? 80.0;
      const err = fbUpdate?.percentageError ?? 0.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Parallelogram Law`,
        value: `P=${p}N, Q=${q}N => Resultant R=${r}N at ${rAngle}° (Error: ${err}%)`,
        unit: '',
      };
    } else if (experimentId === 'limiting-friction') {
      const fUpdate = Object.entries(updates).find(([id]) => id.includes('fb-slider') || id.includes('friction'))?.[1];
      const normal = fUpdate?.normalReactionN ?? 1.96;
      const pull = fUpdate?.appliedPullingForceN ?? 0.69;
      const limit = fUpdate?.limitingFrictionN ?? 0.69;
      const moving = fUpdate?.isMotionInitiated === true;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Limiting Friction`,
        value: `N=${normal}N, Pull=${pull}N, Limit=${limit}N (${moving ? 'SLIDING' : 'STATIC'})`,
        unit: '',
      };
    } else if (experimentId === 'inclined-plane-friction') {
      const ipUpdate = Object.entries(updates).find(([id]) => id.includes('ramp') || id.includes('incline'))?.[1];
      const angle = ipUpdate?.inclineAngleDeg ?? 20.0;
      const normal = ipUpdate?.normalForceN ?? 1.84;
      const par = ipUpdate?.parallelGravityN ?? 0.67;
      const repose = ipUpdate?.angleReposeDeg ?? 19.3;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Inclined Plane (θ=${angle}°)`,
        value: `N=${normal}N, F∥=${par}N, Repose θ_r=${repose}°`,
        unit: '',
      };
    } else if (experimentId === 'hookes-law') {
      const hUpdate = Object.entries(updates).find(([id]) => id.includes('spring') || id.includes('hooke'))?.[1];
      const load = hUpdate?.totalSuspendedMassGrams ?? 150;
      const f = hUpdate?.appliedForceN ?? 1.47;
      const ext = hUpdate?.extensionMm ?? 58.8;
      const k = hUpdate?.springConstantNpm ?? 25.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Hooke's Law (Load=${load}g)`,
        value: `F=${f}N, Extension x=${ext}mm, k=${k}N/m`,
        unit: '',
      };
    } else if (experimentId === 'boyles-law') {
      const bUpdate = Object.entries(updates).find(([id]) => id.includes('boyle') || id.includes('cylinder'))?.[1];
      const vol = bUpdate?.volumeMl ?? 60.0;
      const p = bUpdate?.pressureKpa ?? 101.3;
      const pv = bUpdate?.pvProductKpaMl ?? 6080;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Boyle's Law (V=${vol}mL)`,
        value: `P=${p}kPa, P·V=${pv}kPa·mL (1/V=${(1 / Number(vol)).toFixed(4)}mL⁻¹)`,
        unit: '',
      };
    } else if (experimentId === 'resistivity-vi-method') {
      const wUpdate = Object.entries(updates).find(([id]) => id.includes('wire') || id.includes('board'))?.[1];
      const l = wUpdate?.lengthCm ?? 100.0;
      const d = wUpdate?.diameterMm ?? 0.5;
      const v = wUpdate?.voltage ?? 2.0;
      const i = wUpdate?.currentAmps ?? 0.8;
      const r = wUpdate?.resistanceOhms ?? 2.5;
      const rho = wUpdate?.resistivityOhmMetre ?? 4.9e-7;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Wire Resistivity (L=${l}cm, d=${d}mm)`,
        value: `V=${v}V, I=${Number(i).toFixed(3)}A => R=${Number(r).toFixed(2)}Ω, ρ=${Number(rho).toExponential(3)}Ω·m`,
        unit: '',
      };
    } else if (experimentId === 'metre-bridge') {
      const mbUpdate = Object.entries(updates).find(([id]) => id.includes('bridge') || id.includes('metre'))?.[1];
      const r = mbUpdate?.knownResistanceR ?? 5.0;
      const l = mbUpdate?.jockeyPositionCm ?? 50.0;
      const x = mbUpdate?.calculatedResistanceX ?? 5.0;
      const isBal = mbUpdate?.isBalanced ?? true;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Metre Bridge (l=${l}cm)`,
        value: `R=${r}Ω, l=${l}cm, (100-l)=${(100 - Number(l)).toFixed(1)}cm => X=${Number(x).toFixed(2)}Ω (${isBal ? 'Balanced' : 'Deflected'})`,
        unit: '',
      };
    } else if (experimentId === 'galvanometer-figure-of-merit') {
      const gUpdate = Object.entries(updates).find(([id]) => id.includes('galv'))?.[1];
      const theta = gUpdate?.deflectionDivisions ?? 30.0;
      const gVal = gUpdate?.calculatedCoilResistanceG ?? 100.0;
      const kVal = gUpdate?.figureOfMeritK ?? 2.0e-5;
      const igVal = gUpdate?.fullScaleCurrentMicroAmps ?? 600.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Galvanometer FOM (θ=${theta}div)`,
        value: `G=${Number(gVal).toFixed(1)}Ω, k=${(Number(kVal) * 1e6).toFixed(1)}µA/div, Ig=${Number(igVal).toFixed(1)}µA`,
        unit: '',
      };
    } else if (experimentId === 'galvanometer-voltmeter') {
      const vUpdate = Object.entries(updates).find(([id]) => id.includes('calibrat'))?.[1];
      const rs = vUpdate?.requiredSeriesResistanceRs ?? 4900.0;
      const theta = vUpdate?.scaleDeflectionDivisions ?? 15.0;
      const vMeas = vUpdate?.measuredVoltage ?? 1.5;
      const ov = vUpdate?.isOverload ?? false;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Voltmeter Conversion (Rs=${rs}Ω)`,
        value: `Signal V=${vMeas}V, θ=${Number(theta).toFixed(1)}/30div${ov ? ' (OVERLOAD)' : ''}`,
        unit: '',
      };
    } else if (experimentId === 'galvanometer-ammeter') {
      const aUpdate = Object.entries(updates).find(([id]) => id.includes('calibrat'))?.[1];
      const sVal = aUpdate?.requiredShuntResistanceS ?? 0.020004;
      const theta = aUpdate?.scaleDeflectionDivisions ?? 15.0;
      const iMeas = aUpdate?.measuredCurrent ?? 1.5;
      const ov = aUpdate?.isOverload ?? false;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Ammeter Conversion (S=${Number(sVal).toFixed(5)}Ω)`,
        value: `Signal I=${iMeas}A, θ=${Number(theta).toFixed(1)}/30div${ov ? ' (OVERLOAD)' : ''}`,
        unit: '',
      };
    } else if (experimentId === 'concave-mirror-focal-length') {
      const cmUpdate = Object.entries(updates).find(([id]) => id.includes('mirror') || id.includes('cm'))?.[1];
      const u = cmUpdate?.objectDistanceCm ?? 30.0;
      const v = cmUpdate?.imageDistanceCm ?? -30.0;
      const m = cmUpdate?.linearMagnification ?? -1.0;
      const f = cmUpdate?.magnitudeFocalLengthCm ?? 15.0;
      const nature = cmUpdate?.imageNature ?? 'Real, Inverted';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Concave Mirror (u=-${u}cm)`,
        value: `f=-${f}cm, u=-${u}cm => v=${v}cm, m=${m} (${nature})`,
        unit: '',
      };
    } else if (experimentId === 'convex-mirror-focal-length') {
      const cvUpdate = Object.entries(updates).find(([id]) => id.includes('mirror') || id.includes('cv'))?.[1];
      const u = cvUpdate?.objectDistanceCm ?? 30.0;
      const v = cvUpdate?.imageDistanceCm ?? 10.0;
      const m = cvUpdate?.linearMagnification ?? 0.33;
      const f = cvUpdate?.magnitudeFocalLengthCm ?? 15.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Convex Mirror (u=-${u}cm)`,
        value: `f=+${f}cm, u=-${u}cm => v=+${v}cm, m=+${m} (Virtual, Erect)`,
        unit: '',
      };
    } else if (experimentId === 'concave-lens-focal-length') {
      const clUpdate = Object.entries(updates).find(([id]) => id.includes('lens') || id.includes('concave'))?.[1];
      const u = clUpdate?.objectDistanceCm ?? 30.0;
      const v = clUpdate?.imageDistanceCm ?? -10.0;
      const m = clUpdate?.linearMagnification ?? 0.33;
      const f = clUpdate?.magnitudeFocalLengthCm ?? 15.0;
      const combF = clUpdate?.combinedFocalLengthCm ?? 30.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Concave Lens (u=-${u}cm)`,
        value: `f=-${f}cm, u=-${u}cm => v=${v}cm, m=+${m} (Fcomb=${combF}cm)`,
        unit: '',
      };
    } else if (experimentId === 'prism-refractive-index') {
      const ptUpdate = Object.entries(updates).find(([id]) => id.includes('prism') || id.includes('table'))?.[1];
      const i1 = ptUpdate?.angleOfIncidenceDeg ?? 49.5;
      const dev = ptUpdate?.angleOFDeviationDeg ?? 39.0;
      const dm = ptUpdate?.minimumDeviationDeg ?? 39.0;
      const mu = ptUpdate?.calculatedRefractiveIndex ?? 1.52;
      const isMin = ptUpdate?.isMinimumDeviation ?? false;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Prism (i₁=${i1}°)`,
        value: `i₁=${i1}°, D=${dev}°${isMin ? ' (MIN DEVIATION)' : ''} => Dm=${dm}°, μ=${mu}`,
        unit: '',
      };
    } else if (experimentId === 'pn-junction-diode') {
      const dbUpdate = Object.entries(updates).find(([id]) => id.includes('diode') || id.includes('pn'))?.[1];
      const mode = dbUpdate?.biasMode ?? 'forward';
      const vApp = dbUpdate?.appliedVoltageVolts ?? 1.5;
      const vD = dbUpdate?.diodeVoltageVolts ?? 0.72;
      const curr = mode === 'forward' ? `${dbUpdate?.circuitCurrentMilliAmps ?? 7.8} mA` : `${dbUpdate?.circuitCurrentMicroAmps ?? 0.15} µA`;
      const rac = dbUpdate?.dynamicResistanceOhms ?? 15.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: P-N Diode (${String(mode).toUpperCase()})`,
        value: `Vapp=${vApp}V, VD=${vD}V, I=${curr}, rac=${rac}Ω`,
        unit: '',
      };
    } else if (experimentId === 'basic-lab-techniques') {
      const buretteUpdate = Object.entries(updates).find(([id]) => id.includes('burette'))?.[1];
      const balanceUpdate = Object.entries(updates).find(([id]) => id.includes('balance'))?.[1];
      const vol = buretteUpdate?.deliveredVolumeMl ?? 20.0;
      const mass = balanceUpdate?.displayedMassGrams ?? 20.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Volumetric Transfer`,
        value: `Burette Titre = ${vol} mL, Balance Net Mass = ${mass} g (ρ ≈ 1.00 g/mL)`,
        unit: '',
      };
    } else if (experimentId === 'melting-point') {
      const thieleUpdate = Object.entries(updates).find(([id]) => id.includes('thiele'))?.[1];
      const compound = thieleUpdate?.sampleName ?? 'Benzoic Acid';
      const temp = thieleUpdate?.currentTempC ?? 122.4;
      const phase = thieleUpdate?.phase ?? 'liquid';
      const obs = thieleUpdate?.observation ?? 'Clear liquid meniscus formed';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Melting Point (${compound})`,
        value: `T = ${temp}°C, Phase = ${String(phase).toUpperCase()} (${obs})`,
        unit: '',
      };
    } else if (experimentId === 'boiling-point') {
      const bpUpdate = Object.entries(updates).find(([id]) => id.includes('boiling'))?.[1];
      const liquid = bpUpdate?.liquidName ?? 'Absolute Ethanol';
      const bath = bpUpdate?.bathTempC ?? 78.3;
      const stream = bpUpdate?.bubbleStream ?? 'continuous-rapid-stream';
      const reEntry = bpUpdate?.liquidEnteredCapillary ? 'Liquid sucked into capillary' : 'Bubble stream active';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Boiling Point (${liquid})`,
        value: `Bath T = ${bath}°C, Stream = ${stream} (${reEntry})`,
        unit: '',
      };
    } else if (experimentId === 'crystallisation-class11') {
      const dishUpdate = Object.entries(updates).find(([id]) => id.includes('dish'))?.[1];
      const yieldG = dishUpdate?.crystalYieldGrams ?? 16.5;
      const status = dishUpdate?.saturationStatus ?? 'supersaturated';
      const rec = ((Number(yieldG) / 20.0) * 100).toFixed(1);
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Recrystallisation Yield`,
        value: `Yield = ${yieldG} g pure crystals (${rec}% recovery yield, ${status})`,
        unit: '',
      };
    } else if (experimentId === 'ph-determination') {
      const selectedUpdate = selectedObject ? updates[selectedObject.id] : null;
      const ph = selectedUpdate?.samplePH ?? 3.6;
      const title = selectedObject?.title ?? 'Fruit Juice / Buffer / Salt';
      const obs = selectedUpdate?.observationText ?? 'pH determination logged';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: ${title}`,
        value: `pH = ${Number(ph).toFixed(2)} (${obs})`,
        unit: '',
      };
    } else if (experimentId === 'strong-vs-weak-acids') {
      const benchUpdate = Object.entries(updates).find(([id]) => id.includes('bench') || id.includes('acid'))?.[1];
      const sPH = benchUpdate?.strongPH ?? 1.0;
      const wPH = benchUpdate?.weakPH ?? 2.88;
      const ratio = benchUpdate?.hydroniumRatio ?? 76.1;
      const h2 = benchUpdate?.totalHydrogenYieldMl ?? 24.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Acid Strength & Kinetics`,
        value: `HCl pH=${sPH} (α=100%) vs CH₃COOH pH=${wPH} (α=1.31%). [H⁺] ratio: ${ratio}×, H₂ yield: ${h2} mL`,
        unit: '',
      };
    } else if (experimentId === 'chemical-equilibrium') {
      const eqUpdate = Object.entries(updates).find(([id]) => id.includes('eq') || id.includes('chamber'))?.[1];
      const sys = eqUpdate?.system ?? 'fe-scn';
      const temp = eqUpdate?.temperatureC ?? 25;
      const shift = eqUpdate?.shiftDirection ?? 'at-equilibrium';
      const kVal = sys === 'fe-scn' ? `Kc = ${eqUpdate?.kc ?? 138} M⁻¹` : `Kp = ${eqUpdate?.kp ?? 8.8} atm⁻¹`;
      const appearance = eqUpdate?.opticalAppearance ?? 'Dynamic equilibrium';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: ${sys === 'fe-scn' ? 'Fe³⁺/SCN⁻' : 'NO₂/N₂O₄'} (T=${temp}°C)`,
        value: `${kVal}, Shift: ${String(shift).toUpperCase()} — ${appearance}`,
        unit: '',
      };
    } else if (experimentId === 'standard-solution-prep') {
      const flaskUpdate = Object.entries(updates).find(([id]) => id.includes('flask') || id.includes('vol'))?.[1];
      const solute = flaskUpdate?.soluteName ?? 'Oxalic Acid Dihydrate';
      const w = flaskUpdate?.weighedMassGrams ?? 3.152;
      const v = flaskUpdate?.liquidVolumeMl ?? 250.0;
      const m = flaskUpdate?.actualMolarityM ?? 0.1000;
      const n = flaskUpdate?.actualNormalityN ?? 0.2000;
      const err = flaskUpdate?.percentageError ?? 0.0;
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: ${solute} Standard Solution`,
        value: `w=${w}g, V=${v}mL ➔ ${m} M (${n} N), Error: ${err}%`,
        unit: '',
      };
    } else if (experimentId === 'acid-base-titration') {
      const titUpdate = Object.entries(updates).find(([id]) => id.includes('titration') || id.includes('bench'))?.[1];
      const vb = titUpdate?.titrantDeliveredMl ?? 0.0;
      const veq = titUpdate?.equivalenceVolumeMl ?? 40.0;
      const ph = titUpdate?.ph ?? 1.85;
      const color = titUpdate?.indicatorColorName ?? 'Colorless';
      const isEndpoint = titUpdate?.isAtEndpoint ? '★ ENDPOINT' : vb > veq ? 'Over-titrated' : 'In progress';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: Titration at V=${vb} mL`,
        value: `pH = ${ph} [${color}] (${isEndpoint}, Veq = ${veq} mL)`,
        unit: '',
      };
    } else if (experimentId === 'salt-analysis-class11') {
      const saltUpdate = Object.entries(updates).find(([id]) => id.includes('salt'))?.[1];
      const salt = saltUpdate?.selectedSalt ?? 'nh4cl';
      const test = saltUpdate?.testName ?? 'Physical Examination';
      const obs = saltUpdate?.observation ?? 'Observation recorded';
      const inf = saltUpdate?.inference ?? 'Inference';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: ${String(salt).toUpperCase()} — ${test}`,
        value: `${obs} ➔ ${inf}`,
        unit: '',
      };
    } else if (experimentId === 'organic-element-detection') {
      const orgUpdate = Object.entries(updates).find(([id]) => id.includes('element'))?.[1];
      const sample = orgUpdate?.selectedSample ?? 'urea';
      const elem = orgUpdate?.targetElement ?? 'Nitrogen';
      const pos = orgUpdate?.isPositive ? 'POSITIVE' : 'NEGATIVE';
      const inf = orgUpdate?.inference ?? 'Result';
      newRecord = {
        id: `meas-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        label: `Trial ${trialNum}: ${String(sample).toUpperCase()} (${elem})`,
        value: `[${pos}] ${inf}`,
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
            ...(isChemistry ? [{ id: 'reagents' as const, label: 'Reagents', icon: Droplet }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

              {/* Chromatography Paper Analysis Card */}
              {(eqDef.renderType === 'chromatography-paper' ||
                selectedObject.equipmentId === 'chromatography-paper-strip') && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Paper Chromatography Separation
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {simulationResult?.objectStateUpdates[selectedObject.id]?.solventFrontMm ??
                        (Number(selectedObject.properties.elapsedSeconds ?? 60) * 0.8).toFixed(1)}{' '}
                      mm
                    </span>
                  </div>

                  {/* Quick Development Advancement */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Development Elapsed</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {Number(selectedObject.properties.elapsedSeconds ?? 60)} s
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = Number(selectedObject.properties.elapsedSeconds ?? 60);
                          onUpdateProperty(
                            selectedObject.id,
                            'elapsedSeconds',
                            Math.min(120, cur + 15)
                          );
                        }}
                        className="flex-1 py-1 px-2 text-xs rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-200"
                      >
                        +15s Elution
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = Number(selectedObject.properties.elapsedSeconds ?? 60);
                          onUpdateProperty(
                            selectedObject.id,
                            'elapsedSeconds',
                            Math.min(120, cur + 30)
                          );
                        }}
                        className="flex-1 py-1 px-2 text-xs rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-200"
                      >
                        +30s Elution
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateProperty(selectedObject.id, 'elapsedSeconds', 0);
                        }}
                        className="py-1 px-2 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Pigment Bands and Calculated Rf Table */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Calculated Retention Factors (Rf)
                    </span>
                    {(() => {
                      const update = simulationResult?.objectStateUpdates[selectedObject.id];
                      let spots: {
                        pigmentName: string;
                        color: string;
                        distanceMm: number;
                        rf: number;
                      }[] = [];
                      if (update?.pigmentSpotsJson && typeof update.pigmentSpotsJson === 'string') {
                        try {
                          spots = JSON.parse(update.pigmentSpotsJson);
                        } catch {
                          spots = [];
                        }
                      }
                      if (spots.length === 0) {
                        return (
                          <p className="text-[11px] text-slate-400">
                            Advance elution time to separate constituent ink pigments.
                          </p>
                        );
                      }
                      return (
                        <div className="space-y-1">
                          {spots.map((spot, i) => (
                            <div
                              key={i}
                              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full border border-slate-300"
                                  style={{ backgroundColor: spot.color }}
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {spot.pigmentName}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 font-mono">
                                <span className="text-slate-400 text-[11px]">
                                  {spot.distanceMm.toFixed(1)} mm
                                </span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                  Rf = {spot.rf.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-[10px] text-slate-500 leading-snug p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <strong>Model Assumption:</strong> Ideal ascending Lucas-Washburn capillary
                    migration in Whatman No. 1 cellulose paper; constant partition coefficient (K =
                    Cs/Cm) in sealed chamber.
                  </p>
                </div>
              )}

              {/* Displacement Reaction Kinetics Card */}
              {(eqDef.renderType === 'iron-nail' ||
                selectedObject.equipmentId === 'iron-nail-substrate') && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Single Displacement Redox
                    </span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">
                      {simulationResult?.objectStateUpdates[selectedObject.id]
                        ?.reactionProgressPercent ?? 80}
                      % Complete
                    </span>
                  </div>

                  {(() => {
                    const update = simulationResult?.objectStateUpdates[selectedObject.id];
                    const prog = Number(update?.reactionProgressPercent ?? 80);
                    const cuGrams = Number(update?.depositedCopperGrams ?? 0.72);
                    const feGrams = Number(update?.dissolvedIronGrams ?? 0.63);
                    const netGain = Number(update?.netNailMassChangeGrams ?? 0.09);

                    return (
                      <>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 transition-all duration-300"
                            style={{ width: `${prog}%` }}
                          />
                        </div>

                        {/* Stoichiometry Mass Change Grid */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">
                              Iron Lost (Fe)
                            </span>
                            <span className="font-bold text-red-600 dark:text-red-400 font-mono text-[11px]">
                              -{feGrams.toFixed(2)} g
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">
                              Copper Plated (Cu)
                            </span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                              +{cuGrams.toFixed(2)} g
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">
                              Net Δm Nail
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                              +{netGain.toFixed(2)} g
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] space-y-1">
                          <div className="font-semibold text-amber-900 dark:text-amber-300">
                            Balanced Equation:
                          </div>
                          <div className="font-mono text-slate-700 dark:text-slate-300">
                            Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)
                          </div>
                          <div className="text-[10px] text-amber-800 dark:text-amber-400">
                            Cu (63.55 g/mol) deposits as reddish-brown metallic coat while Fe (55.85
                            g/mol) dissolves as pale green Fe²⁺.
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="p-2 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-1.5 text-[10px] text-red-800 dark:text-red-300">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Safety:</strong> Copper sulphate is harmful if swallowed and toxic to
                      aquatic life (GHS07, GHS09). Simulation-only educational inquiry.
                    </span>
                  </div>
                </div>
              )}

              {/* Crystallisation & Solubility Card */}
              {(eqDef.renderType === 'evaporating-dish' ||
                selectedObject.equipmentId === 'porcelain-evaporating-dish') && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Crystallisation & Solubility
                    </span>
                    {(() => {
                      const update = simulationResult?.objectStateUpdates[selectedObject.id];
                      const sat = String(update?.saturationStatus ?? 'saturated');
                      return (
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded font-mono ${
                            sat === 'supersaturated'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : sat === 'saturated'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {sat}
                        </span>
                      );
                    })()}
                  </div>

                  {(() => {
                    const update = simulationResult?.objectStateUpdates[selectedObject.id];
                    const temp = Number(selectedObject.properties.solutionTemperatureC ?? 85);
                    const water = Number(update?.remainingWaterMl ?? 35);
                    const yieldG = Number(update?.crystalYieldGrams ?? 0);
                    const growthPct = Number(update?.crystalGrowthPercent ?? 0);

                    return (
                      <>
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">
                              Solution Temp
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 font-mono text-[11px]">
                              {temp}°C
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">
                              Solvent Left
                            </span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                              {water.toFixed(1)} mL
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">
                              Crystal Yield
                            </span>
                            <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                              {yieldG.toFixed(1)} g
                            </span>
                          </div>
                        </div>

                        {growthPct > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Crystal Nucleation</span>
                              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                                {growthPct}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 transition-all duration-300"
                                style={{ width: `${growthPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-500 leading-snug p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <strong>Solubility Formula:</strong> S(T) = 14.3 + 0.25T + 0.003T²
                          g/100mL. Cools into blue triclinic pinacoidal crystals of CuSO₄·5H₂O.
                        </p>
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
                      : experimentId === 'paper-chromatography'
                        ? 'Chromatography Quick Log'
                        : experimentId === 'displacement-reaction'
                          ? 'Displacement Reaction Quick Log'
                          : experimentId === 'crystallisation'
                            ? 'Crystallisation Quick Log'
                            : experimentId === 'vernier-callipers'
                              ? 'Vernier Callipers Quick Log'
                              : experimentId === 'screw-gauge'
                                ? 'Screw Gauge Quick Log'
                                : experimentId === 'irregular-lamina'
                                  ? 'Irregular Lamina Quick Log'
                                  : experimentId === 'spherometer'
                                    ? 'Spherometer Quick Log'
                                    : experimentId === 'beam-balance'
                                      ? 'Beam Balance Quick Log'
                                      : experimentId === 'parallelogram-law'
                                        ? 'Parallelogram Law Quick Log'
                                        : experimentId === 'limiting-friction'
                                          ? 'Limiting Friction Quick Log'
                                          : experimentId === 'inclined-plane-friction'
                                            ? 'Inclined Plane Quick Log'
                                            : experimentId === 'hookes-law'
                                              ? "Hooke's Law Quick Log"
                                              : experimentId === 'boyles-law'
                                                ? "Boyle's Law Quick Log"
                                                : experimentId === 'resistivity-vi-method'
                                                  ? 'Wire Resistivity Quick Log'
                                                  : experimentId === 'metre-bridge'
                                                    ? 'Metre Bridge Quick Log'
                                                    : experimentId === 'galvanometer-figure-of-merit'
                                                      ? 'Galvanometer FOM Quick Log'
                                                      : experimentId === 'galvanometer-voltmeter'
                                                        ? 'Voltmeter Conversion Quick Log'
                                                        : experimentId === 'galvanometer-ammeter'
                                                          ? 'Ammeter Conversion Quick Log'
                                                          : experimentId === 'concave-mirror-focal-length'
                                                            ? 'Concave Mirror Quick Log'
                                                            : experimentId === 'convex-mirror-focal-length'
                                                              ? 'Convex Mirror Quick Log'
                                                              : experimentId === 'concave-lens-focal-length'
                                                                ? 'Concave Lens Quick Log'
                                                                : experimentId === 'prism-refractive-index'
                                                                  ? 'Prism Refraction Quick Log'
                                                                  : experimentId === 'pn-junction-diode'
                                                                    ? 'P-N Diode Quick Log'
                                                                    : experimentId === 'chemical-equilibrium'
                                                                      ? 'Equilibrium Quick Log'
                                                                      : experimentId === 'standard-solution-prep'
                                                                        ? 'Standard Solution Quick Log'
                                                                        : experimentId === 'acid-base-titration'
                                                                          ? 'Titration Quick Log'
                                                                          : experimentId === 'salt-analysis-class11'
                                                                            ? 'Salt Analysis Quick Log'
                                                                            : experimentId === 'organic-element-detection'
                                                                              ? 'Element Detection Quick Log'
                                                                              : 'Active Bench Quick Log'}
              </span>
              <p className="text-[10px] text-blue-700/80 dark:text-blue-400 leading-snug">
                {experimentId === 'convex-lens'
                  ? 'Instantly log thin-lens object distance (u), image distance (v), and magnification (m).'
                  : experimentId === 'magnetic-field'
                    ? 'Instantly log probe compass orientation and net magnetic field vector magnitude.'
                    : experimentId === 'simple-pendulum'
                      ? 'Instantly log string length (L), time period (T), and calculated gravity (g).'
                      : experimentId === 'paper-chromatography'
                        ? 'Instantly log solvent front advancement distance and calculated pigment Rf retention factors.'
                        : experimentId === 'displacement-reaction'
                          ? 'Instantly log immersion duration, reaction progress %, and net stoichiometric nail mass gain.'
                          : experimentId === 'crystallisation'
                            ? 'Instantly log solution temperature, saturation status, remaining solvent, and crystal yield.'
                            : experimentId === 'vernier-callipers'
                              ? 'Instantly log Main Scale Reading (MSR), Vernier Coincidence (VCD), corrected diameter/depth, and volume.'
                              : experimentId === 'screw-gauge'
                                ? 'Instantly log Pitch Scale Reading (PSR), Circular Scale (CSR), corrected thickness, and wire area.'
                                : experimentId === 'irregular-lamina'
                                  ? 'Instantly log full squares, partial boundary squares, and estimated lamina area ± uncertainty.'
                                  : experimentId === 'spherometer'
                                    ? 'Instantly log outer leg distance, measured sagitta h, and calculated spherical radius of curvature R.'
                                    : experimentId === 'beam-balance'
                                      ? 'Instantly log left pan mass, right pan tare weights, and beam equilibrium status.'
                                      : experimentId === 'parallelogram-law'
                                        ? 'Instantly log coplanar forces P, Q, θ, resultant R, and balancing equilibrant S.'
                                        : experimentId === 'limiting-friction'
                                          ? 'Instantly log normal reaction N, pulling force, and limiting friction f_s,max.'
                                          : experimentId === 'inclined-plane-friction'
                                            ? 'Instantly log slope angle θ, normal force, parallel force, and angle of repose θ_r.'
                                            : experimentId === 'hookes-law'
                                              ? 'Instantly log suspended load mass, stretching force F, pointer position, and extension x.'
                                              : experimentId === 'boyles-law'
                                                ? 'Instantly log cylinder volume V, pressure P, and P·V isothermal product.'
                                                : experimentId === 'resistivity-vi-method'
                                                  ? 'Instantly log wire length L, diameter d, voltage V, current I, resistance R, and resistivity ρ.'
                                                  : experimentId === 'metre-bridge'
                                                    ? 'Instantly log known resistance R, balance length l, 100-l, and calculated unknown resistance X.'
                                                    : experimentId === 'galvanometer-figure-of-merit'
                                                      ? 'Instantly log deflections θ and θ/2, coil resistance G, and Figure of Merit k.'
                                                      : experimentId === 'galvanometer-voltmeter'
                                                        ? 'Instantly log multiplier Rs, test voltage, pointer deflection, and measured voltage.'
                                                        : experimentId === 'galvanometer-ammeter'
                                                          ? 'Instantly log shunt S, test current, pointer deflection, and measured current.'
                                                          : experimentId === 'concave-mirror-focal-length'
                                                            ? 'Instantly log mirror focal length f, object distance u, image distance v, and magnification m.'
                                                            : experimentId === 'convex-mirror-focal-length'
                                                              ? 'Instantly log convex mirror focal length f, virtual image distance v, and auxiliary lens parameters.'
                                                              : experimentId === 'concave-lens-focal-length'
                                                                ? 'Instantly log diverging lens virtual image position v, magnification, and combination focal length F.'
                                                                : experimentId === 'prism-refractive-index'
                                                                  ? 'Instantly log angle of incidence i, angle of emergence e, deviation D, and minimum deviation Dm.'
                                                                  : experimentId === 'pn-junction-diode'
                                                                    ? 'Instantly log applied voltage V, diode voltage VD, loop current (mA/µA), and dynamic resistance rac.'
                                                                    : experimentId === 'chemical-equilibrium'
                                                                      ? 'Instantly log equilibrium temperature, Kc/Kp value, shift direction, and optical appearance.'
                                                                      : experimentId === 'standard-solution-prep'
                                                                        ? 'Instantly log weighed mass w, solution volume V, actual molarity M, and percentage error.'
                                                                        : experimentId === 'acid-base-titration'
                                                                          ? 'Instantly log titrant volume delivered, pH, indicator color transition, and equivalence endpoint.'
                                                                          : experimentId === 'salt-analysis-class11'
                                                                            ? 'Instantly log analytical test name, diagnostic visual observation, and inferred radical.'
                                                                            : experimentId === 'organic-element-detection'
                                                                              ? 'Instantly log Lassaigne extract test procedure, element detected, and positive/negative status.'
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
