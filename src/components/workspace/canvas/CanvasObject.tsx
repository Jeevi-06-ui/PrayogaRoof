import React from 'react';
import { Group, Rect, Text as KonvaText, Circle, Line } from 'react-konva';
import { WorkspaceObject, PortDefinition } from '../../../types';
import { getEquipmentDefinition } from '../../../services/lab/registry';
import { getSubstanceById } from '../../../services/chemistry/chemicalRegistry';

interface CanvasObjectProps {
  object: WorkspaceObject;
  isSelected: boolean;
  gridSnap: boolean;
  gridSize?: number;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onPortClick: (objectId: string, port: PortDefinition, absX: number, absY: number) => void;
}

export const CanvasObject: React.FC<CanvasObjectProps> = ({
  object,
  isSelected,
  gridSnap,
  gridSize = 20,
  onSelect,
  onMove,
  onPortClick,
}) => {
  const eqDef = getEquipmentDefinition(object.equipmentId);
  const width = object.width || eqDef?.defaultWidth || 140;
  const height = object.height || eqDef?.defaultHeight || 100;

  const handleDragEnd = (e: any) => {
    let finalX = e.target.x();
    let finalY = e.target.y();

    if (gridSnap) {
      finalX = Math.round(finalX / gridSize) * gridSize;
      finalY = Math.round(finalY / gridSize) * gridSize;
      e.target.x(finalX);
      e.target.y(finalY);
    }

    onMove(object.id, finalX, finalY);
  };

  const renderVisualContent = () => {
    const renderType = eqDef?.renderType || 'generic-box';

    switch (renderType) {
      case 'battery': {
        const v = object.properties.voltage ?? 9.0;
        const isOn = object.properties.powerSwitch !== false;
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#c2410c"
              stroke={isSelected ? '#38bdf8' : '#7c2d12'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={10}
            />
            <Rect x={10} y={10} width={width - 20} height={40} fill="#1e293b" cornerRadius={6} />
            <KonvaText
              text={`${isOn ? Number(v).toFixed(1) : '0.0'} V`}
              x={20}
              y={20}
              fontSize={18}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill={isOn ? '#fb923c' : '#94a3b8'}
            />
            <KonvaText
              text="DC BATTERY"
              x={width - 85}
              y={18}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#fdba74"
            />
            <KonvaText
              text={object.title}
              x={12}
              y={56}
              fontSize={11}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
            <KonvaText text="+" x={32} y={height - 24} fontSize={14} fontStyle="bold" fill="#ffffff" />
            <KonvaText text="-" x={102} y={height - 24} fontSize={16} fontStyle="bold" fill="#ffffff" />
          </Group>
        );
      }

      case 'switch': {
        const isClosed = object.properties.isClosed !== false;
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#334155"
              stroke={isSelected ? '#38bdf8' : '#1e293b'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Circle x={18} y={height / 2} radius={6} fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
            <Circle x={width - 18} y={height / 2} radius={6} fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
            {isClosed ? (
              <Line
                points={[18, height / 2, width - 18, height / 2]}
                stroke="#fbbf24"
                strokeWidth={4}
                lineCap="round"
              />
            ) : (
              <Line
                points={[18, height / 2, width / 2, height / 2 - 20]}
                stroke="#fbbf24"
                strokeWidth={4}
                lineCap="round"
              />
            )}
            <KonvaText
              text={isClosed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              x={width / 2 - 38}
              y={height - 18}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isClosed ? '#4ade80' : '#f87171'}
            />
            <KonvaText
              text={object.title}
              x={12}
              y={6}
              fontSize={10}
              fontFamily="sans-serif"
              fill="#cbd5e1"
            />
          </Group>
        );
      }

      case 'junction': {
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={isSelected ? '#38bdf8' : '#475569'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Line points={[width / 2, 8, width / 2, height - 8]} stroke="#94a3b8" strokeWidth={2} />
            <Line points={[8, height / 2, width - 8, height / 2]} stroke="#94a3b8" strokeWidth={2} />
            <Circle x={width / 2} y={height / 2} radius={7} fill="#38bdf8" />
            <KonvaText
              text="NODE"
              x={width / 2 - 14}
              y={height / 2 + 10}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />
          </Group>
        );
      }

      case 'ground': {
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#064e3b"
              stroke={isSelected ? '#38bdf8' : '#047857'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Line points={[width / 2, 18, width / 2, 40]} stroke="#a7f3d0" strokeWidth={2.5} />
            <Line points={[width / 2 - 20, 40, width / 2 + 20, 40]} stroke="#a7f3d0" strokeWidth={2.5} />
            <Line points={[width / 2 - 13, 47, width / 2 + 13, 47]} stroke="#a7f3d0" strokeWidth={2} />
            <Line points={[width / 2 - 6, 54, width / 2 + 6, 54]} stroke="#a7f3d0" strokeWidth={1.5} />
            <KonvaText
              text="GND (0V)"
              x={width / 2 - 22}
              y={height - 18}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#6ee7b7"
            />
          </Group>
        );
      }

      case 'lamp': {
        const isGlowing = Boolean(object.state.isEnergized);
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Circle
              x={width / 2}
              y={38}
              radius={24}
              fill={isGlowing ? '#fef08a' : '#e2e8f0'}
              stroke={isGlowing ? '#eab308' : '#94a3b8'}
              strokeWidth={2}
              shadowColor="#eab308"
              shadowBlur={isGlowing ? 16 : 0}
            />
            <Line
              points={[width / 2 - 8, 44, width / 2, 28, width / 2 + 8, 44]}
              stroke={isGlowing ? '#ea580c' : '#64748b'}
              strokeWidth={2}
            />
            <KonvaText
              text={isGlowing ? 'GLOWING' : 'OFF'}
              x={width / 2 - 24}
              y={height - 20}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isGlowing ? '#facc15' : '#94a3b8'}
            />
          </Group>
        );
      }

      case 'power-supply': {
        const v = object.properties.voltage ?? 0;
        const isOn = object.properties.powerSwitch !== false;
        return (
          <Group>
            {/* Main Instrument Box */}
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={12}
            />
            {/* Top Display Panel */}
            <Rect x={15} y={15} width={width - 30} height={42} fill="#0f172a" cornerRadius={6} />
            <KonvaText
              text={`${isOn ? Number(v).toFixed(1) : 'OFF'} V`}
              x={25}
              y={24}
              fontSize={18}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill={isOn ? '#38bdf8' : '#64748b'}
            />
            <KonvaText
              text="DC REGULATED"
              x={width - 105}
              y={22}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />
            <KonvaText
              text={object.title}
              x={15}
              y={65}
              fontSize={11}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#f1f5f9"
            />
            {/* Terminal Indicators */}
            <KonvaText text="+" x={40} y={height - 24} fontSize={14} fontStyle="bold" fill="#ef4444" />
            <KonvaText text="-" x={120} y={height - 24} fontSize={16} fontStyle="bold" fill="#94a3b8" />
          </Group>
        );
      }

      case 'meter': {
        const measured =
          object.state.displayedReading ??
          object.state.measuredVoltage ??
          object.state.measuredCurrent ??
          0;
        const maxScale = Number(object.properties.maxScale ?? 15);
        const ratio = Math.min(1, Math.max(0, Number(measured) / (maxScale || 1)));
        const needleAngle = -45 + ratio * 90; // -45 deg to +45 deg

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={12}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.06}
            />
            {/* Meter Dial Arc */}
            <Rect x={12} y={12} width={width - 24} height={52} fill="#f8fafc" cornerRadius={8} stroke="#e2e8f0" />
            {/* Needle Pivot */}
            <Circle x={width / 2} y={56} radius={4} fill="#0f172a" />
            {/* Needle Line */}
            <Line
              points={[
                width / 2,
                56,
                width / 2 + Math.sin((needleAngle * Math.PI) / 180) * 36,
                56 - Math.cos((needleAngle * Math.PI) / 180) * 36,
              ]}
              stroke="#ef4444"
              strokeWidth={2}
              lineCap="round"
            />
            <KonvaText
              text={`${Number(measured).toFixed(2)}`}
              x={width / 2 - 25}
              y={44}
              fontSize={12}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#1e293b"
            />
            <KonvaText
              text={object.title}
              x={12}
              y={72}
              fontSize={11}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={String(object.state.connectionStatus || 'Ready')}
              x={12}
              y={88}
              fontSize={9}
              fontFamily="sans-serif"
              fill="#64748b"
            />
          </Group>
        );
      }

      case 'resistor': {
        const rVal = object.properties.resistance ?? 10;
        const currentA = Number(object.state.currentAmps ?? 0);
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            {/* Ceramic Cylinder Core */}
            <Rect x={20} y={20} width={width - 40} height={height - 40} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} cornerRadius={6} />
            {/* Resistor Color Stripes */}
            <Rect x={35} y={20} width={8} height={height - 40} fill="#ef4444" />
            <Rect x={55} y={20} width={8} height={height - 40} fill="#3b82f6" />
            <Rect x={75} y={20} width={8} height={height - 40} fill="#10b981" />
            <KonvaText
              text={`${rVal} Ω`}
              x={width / 2 - 20}
              y={height - 18}
              fontSize={11}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            {currentA > 0 && (
              <KonvaText
                text={`I: ${currentA}A`}
                x={width / 2 - 20}
                y={4}
                fontSize={9}
                fontFamily="Courier New"
                fontStyle="bold"
                fill="#2563eb"
              />
            )}
          </Group>
        );
      }

      case 'lens': {
        const f = Number(object.properties.focalLength ?? 15);
        const benchPos = Number(object.properties.benchPosition ?? 50);
        const v = object.state.computedImageDistance;
        const m = object.state.magnification;

        return (
          <Group>
            {/* Upright Optical Bench Mount */}
            <Rect
              x={width / 2 - 20}
              y={height - 24}
              width={40}
              height={24}
              fill="#334155"
              stroke={isSelected ? '#38bdf8' : '#1e293b'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={4}
            />
            {/* Vertical Lens Post */}
            <Rect x={width / 2 - 3} y={15} width={6} height={height - 35} fill="#64748b" />
            {/* Circular Lens Rim */}
            <Circle
              x={width / 2}
              y={height / 2 - 12}
              radius={36}
              fill="#e0f2fe"
              opacity={0.7}
              stroke={isSelected ? '#38bdf8' : '#0284c7'}
              strokeWidth={isSelected ? 3 : 2}
            />
            {/* Convex Double-Curvature Core Highlight */}
            <Line
              points={[
                width / 2 - 12,
                height / 2 - 34,
                width / 2,
                height / 2 - 12,
                width / 2 - 12,
                height / 2 + 10,
              ]}
              stroke="#bae6fd"
              strokeWidth={2}
              lineCap="round"
            />
            {/* Optical Axis Dash Reference */}
            <Line
              points={[0, height / 2 - 12, width, height / 2 - 12]}
              stroke="#38bdf8"
              strokeWidth={1}
              dash={[4, 4]}
            />
            {/* Bench Position and Focal Readout */}
            <KonvaText
              text={`f = +${f} cm`}
              x={width / 2 - 26}
              y={height / 2 - 18}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0369a1"
            />
            <KonvaText
              text={object.title}
              x={8}
              y={4}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={
                v !== undefined
                  ? `v: ${Number(v) > 0 ? '+' : ''}${v}cm | m: ${m}`
                  : `Pos: ${benchPos}cm`
              }
              x={4}
              y={height - 14}
              fontSize={9}
              fontFamily="sans-serif"
              fill="#475569"
            />
          </Group>
        );
      }

      case 'optical-source': {
        const u = Number(object.properties.objectDistance ?? 30);
        const intensity = Number(object.properties.lampIntensity ?? 100);
        const isOn = intensity > 0;

        return (
          <Group>
            {/* Bench Carriage Mount */}
            <Rect
              x={15}
              y={height - 24}
              width={width - 30}
              height={24}
              fill="#1e293b"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={4}
            />
            {/* Upright Lamp Housing Box */}
            <Rect
              x={20}
              y={20}
              width={width - 40}
              height={height - 48}
              fill="#0f172a"
              stroke="#475569"
              strokeWidth={1.5}
              cornerRadius={8}
            />
            {/* Illuminated Target Aperture Window */}
            <Circle
              x={width / 2}
              y={50}
              radius={22}
              fill={isOn ? '#fef08a' : '#334155'}
              stroke={isOn ? '#f59e0b' : '#64748b'}
              strokeWidth={2}
            />
            {/* Target Arrow Object (Pointing Up) */}
            <Line points={[width / 2, 64, width / 2, 36]} stroke="#dc2626" strokeWidth={3} />
            <Line
              points={[width / 2 - 6, 44, width / 2, 36, width / 2 + 6, 44]}
              stroke="#dc2626"
              strokeWidth={3}
            />
            {/* Readout Texts */}
            <KonvaText
              text={object.title}
              x={10}
              y={4}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={`u = -${u} cm`}
              x={width / 2 - 28}
              y={height - 16}
              fontSize={11}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#ffffff"
            />
          </Group>
        );
      }

      case 'screen': {
        const pos = Number(object.properties.screenPosition ?? 80);
        const isFocused = Boolean(object.state.isFocused);
        const imagePresent = Boolean(object.state.imagePresent);

        return (
          <Group>
            {/* Screen Carrier Slider */}
            <Rect
              x={15}
              y={height - 24}
              width={width - 30}
              height={24}
              fill="#1e293b"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={4}
            />
            {/* Vertical Screen Post */}
            <Rect x={width / 2 - 3} y={20} width={6} height={height - 40} fill="#64748b" />
            {/* Frosted Translucent Screen Plate */}
            <Rect
              x={12}
              y={15}
              width={width - 24}
              height={height - 50}
              fill={isFocused ? '#f1f5f9' : '#e2e8f0'}
              stroke={isFocused ? '#10b981' : isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isFocused ? 2.5 : isSelected ? 2 : 1.5}
              cornerRadius={6}
              opacity={0.92}
            />
            {/* Inverted Real Image Target if image is present */}
            {imagePresent && (
              <Group>
                <Line
                  points={[width / 2, 35, width / 2, 65]}
                  stroke={isFocused ? '#b91c1c' : '#f87171'}
                  strokeWidth={isFocused ? 3 : 2}
                />
                <Line
                  points={[width / 2 - 5, 57, width / 2, 65, width / 2 + 5, 57]}
                  stroke={isFocused ? '#b91c1c' : '#f87171'}
                  strokeWidth={isFocused ? 3 : 2}
                />
              </Group>
            )}
            <KonvaText
              text="SCREEN"
              x={width / 2 - 18}
              y={20}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#64748b"
            />
            <KonvaText
              text={isFocused ? 'SHARP' : imagePresent ? 'BLUR' : 'NO IMG'}
              x={width / 2 - 16}
              y={height - 46}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isFocused ? '#10b981' : '#64748b'}
            />
            <KonvaText
              text={`x = ${pos} cm`}
              x={width / 2 - 26}
              y={height - 16}
              fontSize={10}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#ffffff"
            />
          </Group>
        );
      }

      case 'magnet': {
        const poleStrength = Number(object.properties.poleStrength ?? 1.0);
        const halfW = width / 2;

        return (
          <Group>
            {/* North Pole Half (Red / Left) */}
            <Rect
              x={0}
              y={0}
              width={halfW}
              height={height}
              fill="#dc2626"
              stroke={isSelected ? '#38bdf8' : '#991b1b'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={[8, 0, 0, 8]}
            />
            {/* South Pole Half (Blue / Right) */}
            <Rect
              x={halfW}
              y={0}
              width={halfW}
              height={height}
              fill="#2563eb"
              stroke={isSelected ? '#38bdf8' : '#1d4ed8'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={[0, 8, 8, 0]}
            />
            {/* Metallic Center Seam */}
            <Line
              points={[halfW, 0, halfW, height]}
              stroke="#ffffff"
              strokeWidth={1.5}
              opacity={0.6}
            />
            {/* North Pole Label */}
            <KonvaText
              text="N"
              x={halfW / 2 - 10}
              y={height / 2 - 16}
              fontSize={24}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
            <KonvaText
              text="NORTH"
              x={halfW / 2 - 18}
              y={height / 2 + 10}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#fecaca"
            />
            {/* South Pole Label */}
            <KonvaText
              text="S"
              x={halfW + halfW / 2 - 10}
              y={height / 2 - 16}
              fontSize={24}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
            <KonvaText
              text="SOUTH"
              x={halfW + halfW / 2 - 18}
              y={height / 2 + 10}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#bfdbfe"
            />
            {/* Pole Strength Pill */}
            <Rect
              x={halfW - 28}
              y={height - 18}
              width={56}
              height={14}
              fill="#0f172a"
              cornerRadius={4}
              opacity={0.8}
            />
            <KonvaText
              text={`${poleStrength} T`}
              x={halfW - 14}
              y={height - 16}
              fontSize={9}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#38bdf8"
            />
          </Group>
        );
      }

      case 'compass': {
        const angleDeg = Number(object.state.needleAngleDeg ?? 0);
        const rad = (angleDeg * Math.PI) / 180;
        const radius = Math.min(width, height) / 2 - 6;
        const cx = width / 2;
        const cy = height / 2;
        const needleLen = radius - 8;

        const nx = cx + needleLen * Math.cos(rad);
        const ny = cy + needleLen * Math.sin(rad);
        const sx = cx - needleLen * Math.cos(rad);
        const sy = cy - needleLen * Math.sin(rad);

        const perpRad = rad + Math.PI / 2;
        const wingW = 5;
        const wx1 = cx + wingW * Math.cos(perpRad);
        const wy1 = cy + wingW * Math.sin(perpRad);
        const wx2 = cx - wingW * Math.cos(perpRad);
        const wy2 = cy - wingW * Math.sin(perpRad);

        return (
          <Group>
            {/* Outer Casing */}
            <Circle
              x={cx}
              y={cy}
              radius={radius + 4}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#0d9488'}
              strokeWidth={isSelected ? 3 : 2}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.12}
            />
            <Circle
              x={cx}
              y={cy}
              radius={radius}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
            />
            {/* Cardinal Ticks */}
            <Line
              points={[cx, cy - radius, cx, cy - radius + 5]}
              stroke="#0f172a"
              strokeWidth={1.5}
            />
            <Line
              points={[cx, cy + radius, cx, cy + radius - 5]}
              stroke="#0f172a"
              strokeWidth={1.5}
            />
            <Line
              points={[cx - radius, cy, cx - radius + 5, cy]}
              stroke="#0f172a"
              strokeWidth={1.5}
            />
            <Line
              points={[cx + radius, cy, cx + radius - 5, cy]}
              stroke="#0f172a"
              strokeWidth={1.5}
            />
            <KonvaText
              text="N"
              x={cx - 4}
              y={cy - radius + 6}
              fontSize={8}
              fontStyle="bold"
              fill="#dc2626"
            />
            <KonvaText
              text="S"
              x={cx - 3}
              y={cy + radius - 14}
              fontSize={8}
              fontStyle="bold"
              fill="#2563eb"
            />
            {/* North Needle Half */}
            <Line
              points={[cx, cy, wx1, wy1, nx, ny, wx2, wy2]}
              closed
              fill="#dc2626"
              stroke="#b91c1c"
              strokeWidth={1}
            />
            {/* South Needle Half */}
            <Line
              points={[cx, cy, wx1, wy1, sx, sy, wx2, wy2]}
              closed
              fill="#334155"
              stroke="#1e293b"
              strokeWidth={1}
            />
            <Circle x={cx} y={cy} radius={3.5} fill="#f59e0b" stroke="#78350f" strokeWidth={1} />
            <KonvaText
              text={`${angleDeg.toFixed(0)}°`}
              x={cx - 12}
              y={cy + radius - 24}
              fontSize={9}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#0f172a"
            />
          </Group>
        );
      }

      case 'stopwatch': {
        const isRunning = Boolean(object.properties.isRunning);
        const elapsed = Number(object.state.elapsedTime ?? object.properties.elapsedTime ?? 0);
        const cycles = Number(object.state.cycleCount ?? 0);

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#1e1b4b"
              stroke={isSelected ? '#38bdf8' : '#4338ca'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={14}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.15}
            />
            <Rect x={width / 2 - 12} y={-6} width={24} height={8} fill="#6366f1" cornerRadius={3} />
            <Rect x={18} y={-4} width={16} height={6} fill="#475569" cornerRadius={2} />
            <Rect x={width - 34} y={-4} width={16} height={6} fill="#475569" cornerRadius={2} />
            <Rect
              x={10}
              y={12}
              width={width - 20}
              height={42}
              fill="#020617"
              cornerRadius={6}
              stroke="#312e81"
              strokeWidth={1}
            />
            <KonvaText
              text={`${elapsed.toFixed(2)} s`}
              x={18}
              y={22}
              fontSize={18}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill={isRunning ? '#22c55e' : '#a5b4fc'}
            />
            <KonvaText
              text={isRunning ? 'RUN' : 'PAUSE'}
              x={width - 45}
              y={16}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isRunning ? '#22c55e' : '#fbbf24'}
            />
            <KonvaText
              text={`Cycles N: ${cycles}`}
              x={12}
              y={58}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#e0e7ff"
            />
            <KonvaText
              text={object.title}
              x={12}
              y={72}
              fontSize={9}
              fontFamily="sans-serif"
              fill="#818cf8"
            />
          </Group>
        );
      }

      case 'pendulum': {
        const L = Number(object.properties.stringLength ?? 0.8);
        const m = Number(object.properties.bobMass ?? 100);
        const currentAngle = Number(
          object.state.currentAngleDeg ?? object.properties.amplitudeAngle ?? 8
        );
        const period = Number(object.state.periodSeconds ?? 1.8);
        const freq = Number(object.state.frequencyHz ?? 0.56);

        const anchorX = width / 2;
        const anchorY = 16;
        const visualLen = 95;
        const rad = (currentAngle * Math.PI) / 180;
        const bobX = anchorX + visualLen * Math.sin(rad);
        const bobY = anchorY + visualLen * Math.cos(rad);
        const bobRadius = Math.max(10, Math.min(18, 10 + (m / 500) * 8));

        return (
          <Group>
            {/* Stand Clamp */}
            <Rect
              x={width / 2 - 40}
              y={0}
              width={80}
              height={16}
              fill="#334155"
              stroke={isSelected ? '#38bdf8' : '#1e293b'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={4}
            />
            {/* Protractor Angle Arc Reference */}
            <Line
              points={[anchorX - 35, anchorY + 30, anchorX, anchorY, anchorX + 35, anchorY + 30]}
              stroke="#94a3b8"
              strokeWidth={1}
              dash={[2, 3]}
            />
            {/* Equilibrium Reference */}
            <Line
              points={[anchorX, anchorY, anchorX, anchorY + visualLen + 10]}
              stroke="#cbd5e1"
              strokeWidth={1}
              dash={[4, 4]}
            />
            {/* Suspension Thread */}
            <Line
              points={[anchorX, anchorY, bobX, bobY]}
              stroke="#0f172a"
              strokeWidth={2}
              lineCap="round"
            />
            {/* Bob */}
            <Circle
              x={bobX}
              y={bobY}
              radius={bobRadius}
              fill="#e2e8f0"
              stroke={isSelected ? '#38bdf8' : '#475569'}
              strokeWidth={2}
              shadowColor="#0f172a"
              shadowBlur={4}
              shadowOpacity={0.2}
            />
            <Circle
              x={bobX - bobRadius * 0.3}
              y={bobY - bobRadius * 0.3}
              radius={bobRadius * 0.35}
              fill="#ffffff"
              opacity={0.7}
            />
            <Circle x={anchorX} y={anchorY} radius={4} fill="#dc2626" />
            <KonvaText
              text={object.title}
              x={8}
              y={height - 42}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={`L = ${L.toFixed(2)}m | m = ${m}g`}
              x={8}
              y={height - 28}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={`T = ${period.toFixed(2)}s | f = ${freq.toFixed(2)}Hz`}
              x={8}
              y={height - 15}
              fontSize={10}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#2563eb"
            />
          </Group>
        );
      }

      case 'beaker': {
        const vol = Number(object.properties.liquidVolume ?? 100);
        const maxVol = Number(object.properties.capacityMl ?? 250);
        const liquidColor = String(object.state.liquidColor || '#e0f2fe');
        const fillHeight = Math.max(
          6,
          Math.min(height - 35, ((height - 35) * vol) / (maxVol || 1))
        );
        const phVal = object.state.samplePH;

        return (
          <Group>
            {/* Glass Beaker Body */}
            <Rect
              x={10}
              y={10}
              width={width - 20}
              height={height - 20}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={[0, 0, 16, 16]}
              opacity={0.88}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.08}
            />
            {/* Liquid Fill */}
            {vol > 0 && (
              <Rect
                x={12}
                y={height - 10 - fillHeight}
                width={width - 24}
                height={fillHeight}
                fill={liquidColor}
                opacity={0.75}
                cornerRadius={[0, 0, 14, 14]}
              />
            )}
            {/* Meniscus Line */}
            {vol > 0 && (
              <Line
                points={[12, height - 10 - fillHeight, width - 12, height - 10 - fillHeight]}
                stroke="#0284c7"
                strokeWidth={1.5}
                opacity={0.8}
              />
            )}
            {/* Graduation Markings */}
            <Line
              points={[14, height * 0.35, 26, height * 0.35]}
              stroke="#64748b"
              strokeWidth={1}
            />
            <Line
              points={[14, height * 0.55, 26, height * 0.55]}
              stroke="#64748b"
              strokeWidth={1}
            />
            <Line
              points={[14, height * 0.75, 26, height * 0.75]}
              stroke="#64748b"
              strokeWidth={1}
            />
            {/* Volume readout */}
            <KonvaText
              text={`${vol}/${maxVol}mL`}
              x={width / 2 - 24}
              y={height - 10 - fillHeight / 2 - 6}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={object.title}
              x={12}
              y={height - 20}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#334155"
            />
            {phVal !== undefined && (
              <KonvaText
                text={`pH: ${Number(phVal).toFixed(1)}`}
                x={width - 45}
                y={14}
                fontSize={9}
                fontFamily="Courier New, monospace"
                fontStyle="bold"
                fill="#0369a1"
              />
            )}
          </Group>
        );
      }

      case 'flask': {
        const vol = Number(object.properties.liquidVolume ?? 80);
        const maxVol = Number(object.properties.capacityMl ?? 250);
        const liquidColor = String(object.state.liquidColor || '#e0f2fe');
        const fillRatio = Math.max(0, Math.min(1, vol / (maxVol || 1)));
        const phVal = object.state.samplePH;

        const neckW = 30;
        const neckH = 35;
        const neckLeft = width / 2 - neckW / 2;
        const neckRight = width / 2 + neckW / 2;
        const baseLeft = 10;
        const baseRight = width - 10;
        const baseY = height - 10;
        const neckTopY = 10;

        const flaskPoints = [
          neckLeft,
          neckTopY,
          neckRight,
          neckTopY,
          neckRight,
          neckTopY + neckH,
          baseRight,
          baseY,
          baseLeft,
          baseY,
          neckLeft,
          neckTopY + neckH,
        ];

        const bodyHeight = baseY - (neckTopY + neckH);
        const fillHeight = bodyHeight * fillRatio;
        const liquidTopY = baseY - fillHeight;
        const span = (baseRight - neckRight) * fillRatio;
        const liquidPoints = [
          baseLeft + 2,
          baseY - 2,
          baseRight - 2,
          baseY - 2,
          baseRight - span,
          liquidTopY,
          baseLeft + span,
          liquidTopY,
        ];

        return (
          <Group>
            {/* Outer Flask Glass Body */}
            <Line
              points={flaskPoints}
              closed
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 3 : 2}
              opacity={0.88}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.08}
            />
            {/* Liquid Fill */}
            {vol > 0 && (
              <Line points={liquidPoints} closed fill={liquidColor} opacity={0.75} />
            )}
            {/* Meniscus Line */}
            {vol > 0 && (
              <Line
                points={[baseLeft + span, liquidTopY, baseRight - span, liquidTopY]}
                stroke="#0284c7"
                strokeWidth={1.5}
              />
            )}
            <KonvaText
              text={`${vol}/${maxVol}mL`}
              x={width / 2 - 20}
              y={baseY - 20}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={object.title}
              x={12}
              y={baseY + 1}
              fontSize={9}
              fontFamily="sans-serif"
              fill="#475569"
            />
            {phVal !== undefined && (
              <KonvaText
                text={`pH ${Number(phVal).toFixed(1)}`}
                x={neckRight + 4}
                y={15}
                fontSize={9}
                fontFamily="Courier New, monospace"
                fontStyle="bold"
                fill="#0369a1"
              />
            )}
          </Group>
        );
      }

      case 'cylinder': {
        const vol = Number(object.properties.liquidVolume ?? 50);
        const maxVol = Number(object.properties.capacityMl ?? 100);
        const liquidColor = String(object.state.liquidColor || '#e0f2fe');
        const fillRatio = Math.max(0, Math.min(1, vol / (maxVol || 1)));
        const tubeW = 36;
        const tubeLeft = width / 2 - tubeW / 2;
        const tubeTop = 15;
        const tubeBottom = height - 25;
        const tubeHeight = tubeBottom - tubeTop;
        const fillH = tubeHeight * fillRatio;

        return (
          <Group>
            {/* Stable Base */}
            <Rect
              x={15}
              y={tubeBottom}
              width={width - 30}
              height={15}
              fill="#cbd5e1"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={1.5}
              cornerRadius={4}
            />
            {/* Vertical Glass Column */}
            <Rect
              x={tubeLeft}
              y={tubeTop}
              width={tubeW}
              height={tubeHeight}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#64748b'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              opacity={0.9}
              cornerRadius={[4, 4, 0, 0]}
            />
            {/* Liquid Column */}
            {vol > 0 && (
              <Rect
                x={tubeLeft + 2}
                y={tubeBottom - fillH}
                width={tubeW - 4}
                height={fillH}
                fill={liquidColor}
                opacity={0.75}
              />
            )}
            {/* Meniscus Line */}
            {vol > 0 && (
              <Line
                points={[
                  tubeLeft + 2,
                  tubeBottom - fillH,
                  tubeLeft + tubeW - 2,
                  tubeBottom - fillH,
                ]}
                stroke="#0284c7"
                strokeWidth={1.5}
              />
            )}
            {/* Fine Graduation Ticks */}
            {[0.2, 0.4, 0.6, 0.8].map((frac, idx) => (
              <Line
                key={idx}
                points={[
                  tubeLeft + 2,
                  tubeBottom - tubeHeight * frac,
                  tubeLeft + 10,
                  tubeBottom - tubeHeight * frac,
                ]}
                stroke="#475569"
                strokeWidth={1}
              />
            ))}
            <KonvaText
              text={`${vol}mL`}
              x={tubeLeft + tubeW + 4}
              y={tubeBottom - fillH - 6}
              fontSize={10}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={object.title}
              x={10}
              y={height - 8}
              fontSize={8}
              fontFamily="sans-serif"
              fill="#475569"
            />
          </Group>
        );
      }

      case 'test-tube': {
        const vol = Number(object.properties.liquidVolume ?? 15);
        const maxVol = Number(object.properties.capacityMl ?? 50);
        const liquidColor = String(
          object.state.liquidColor || object.state.solutionColor || '#e0f2fe'
        );
        const fillRatio = Math.max(0, Math.min(1, vol / (maxVol || 1)));
        const tubeW = 34;
        const tubeLeft = width / 2 - tubeW / 2;
        const tubeTop = 15;
        const tubeBottom = height - 20;
        const tubeHeight = tubeBottom - tubeTop;
        const fillH = tubeHeight * fillRatio;

        return (
          <Group>
            {/* Rim Collar */}
            <Rect
              x={tubeLeft - 3}
              y={tubeTop - 4}
              width={tubeW + 6}
              height={6}
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth={1}
              cornerRadius={2}
            />
            {/* Glass Tube Body */}
            <Rect
              x={tubeLeft}
              y={tubeTop}
              width={tubeW}
              height={tubeHeight}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              cornerRadius={[0, 0, 16, 16]}
              opacity={0.88}
            />
            {/* Liquid Column */}
            {vol > 0 && (
              <Rect
                x={tubeLeft + 2}
                y={tubeBottom - fillH}
                width={tubeW - 4}
                height={fillH}
                fill={liquidColor}
                cornerRadius={[0, 0, 14, 14]}
                opacity={0.75}
              />
            )}
            <KonvaText
              text={`${vol}mL`}
              x={tubeLeft + 4}
              y={tubeBottom - fillH / 2 - 6}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={object.title}
              x={8}
              y={height - 8}
              fontSize={8}
              fontFamily="sans-serif"
              fill="#475569"
            />
          </Group>
        );
      }

      case 'spotting-plate': {
        return (
          <Group>
            {/* Porcelain Tile Body */}
            <Rect
              width={width}
              height={height}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={12}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.1}
            />
            <KonvaText
              text="SPOTTING PLATE (12 CAVITIES)"
              x={12}
              y={8}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#64748b"
            />
            {/* Render Cavity Depressions (2 rows x 3 cols) */}
            {[
              {
                x: 35,
                y: 35,
                id: 'cavity-1',
                label: 'A1',
                color: String(object.state.cavity1Color || '#f1f5f9'),
              },
              {
                x: 90,
                y: 35,
                id: 'cavity-2',
                label: 'A2',
                color: String(object.state.cavity2Color || '#f1f5f9'),
              },
              {
                x: 145,
                y: 35,
                id: 'cavity-3',
                label: 'A3',
                color: String(object.state.cavity3Color || '#f1f5f9'),
              },
              {
                x: 35,
                y: 80,
                id: 'cavity-4',
                label: 'B1',
                color: String(object.state.cavity4Color || '#f1f5f9'),
              },
              {
                x: 90,
                y: 80,
                id: 'cavity-5',
                label: 'B2',
                color: String(object.state.cavity5Color || '#f1f5f9'),
              },
              {
                x: 145,
                y: 80,
                id: 'cavity-6',
                label: 'B3',
                color: String(object.state.cavity6Color || '#f1f5f9'),
              },
            ].map((cav) => (
              <Group key={cav.id}>
                <Circle
                  x={cav.x}
                  y={cav.y}
                  radius={18}
                  fill="#e2e8f0"
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                <Circle
                  x={cav.x}
                  y={cav.y}
                  radius={14}
                  fill={cav.color}
                  opacity={0.85}
                />
                <KonvaText
                  text={cav.label}
                  x={cav.x - 6}
                  y={cav.y - 4}
                  fontSize={8}
                  fontFamily="sans-serif"
                  fontStyle="bold"
                  fill="#334155"
                />
              </Group>
            ))}
            <KonvaText
              text={String(object.state.cavityStatus || 'Porcelain Glaze')}
              x={12}
              y={height - 12}
              fontSize={8}
              fontFamily="sans-serif"
              fill="#64748b"
            />
          </Group>
        );
      }

      case 'pipette': {
        const drops = Number(object.properties.dropCount ?? 3);
        const reagent = String(object.properties.drawnReagent ?? 'universal-indicator');
        const sub = getSubstanceById(reagent);
        const liquidColor = sub ? sub.baseColor : '#22c55e';

        return (
          <Group>
            {/* Top Rubber Bulb */}
            <Circle
              x={width / 2}
              y={24}
              radius={18}
              fill="#dc2626"
              stroke={isSelected ? '#38bdf8' : '#991b1b'}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            {/* Glass Stem */}
            <Rect
              x={width / 2 - 5}
              y={40}
              width={10}
              height={height - 65}
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth={1}
              opacity={0.9}
            />
            {/* Liquid inside stem */}
            <Rect
              x={width / 2 - 4}
              y={60}
              width={8}
              height={height - 90}
              fill={liquidColor}
              opacity={0.85}
            />
            {/* Dispense Tip */}
            <Line
              points={[
                width / 2 - 5,
                height - 25,
                width / 2 + 5,
                height - 25,
                width / 2,
                height - 5,
              ]}
              closed
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <Circle x={width / 2} y={height - 2} radius={3} fill={liquidColor} />
            <KonvaText
              text={`${drops} drops`}
              x={width / 2 + 10}
              y={45}
              fontSize={9}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={object.title}
              x={6}
              y={height + 2}
              fontSize={8}
              fontFamily="sans-serif"
              fill="#475569"
            />
          </Group>
        );
      }

      case 'stirrer': {
        return (
          <Group>
            {/* Glass Stirring Rod */}
            <Rect
              x={width / 2 - 4}
              y={10}
              width={8}
              height={height - 20}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#64748b'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              cornerRadius={4}
              opacity={0.9}
            />
            <Line
              points={[width / 2 - 1, 15, width / 2 - 1, height - 15]}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <KonvaText
              text="STIR ROD"
              x={width / 2 - 18}
              y={height / 2 - 6}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#64748b"
              rotation={-90}
            />
          </Group>
        );
      }

      case 'funnel': {
        return (
          <Group>
            {/* Funnel Cone */}
            <Line
              points={[
                15,
                15,
                width - 15,
                15,
                width / 2 + 6,
                height - 40,
                width / 2 - 6,
                height - 40,
              ]}
              closed
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              opacity={0.88}
            />
            {/* Funnel Stem */}
            <Rect
              x={width / 2 - 4}
              y={height - 40}
              width={8}
              height={35}
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <KonvaText
              text="FUNNEL"
              x={width / 2 - 16}
              y={22}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#64748b"
            />
          </Group>
        );
      }

      case 'filter-paper': {
        return (
          <Group>
            <Circle
              x={width / 2}
              y={height / 2}
              radius={Math.min(width, height) / 2 - 10}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={1.5}
              dash={[3, 3]}
            />
            <Line
              points={[15, height / 2, width - 15, height / 2]}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <KonvaText
              text="FILTER PAPER"
              x={width / 2 - 28}
              y={height / 2 - 14}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#64748b"
            />
          </Group>
        );
      }

      case 'thermometer': {
        const temp = Number(object.properties.displayedTemp ?? 25.0);
        const minT = -10;
        const maxT = 110;
        const ratio = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)));
        const stemW = 8;
        const stemX = width / 2 - stemW / 2;
        const stemH = height - 40;
        const liquidH = stemH * ratio;

        return (
          <Group>
            {/* Thermometer Stem */}
            <Rect
              x={stemX}
              y={10}
              width={stemW}
              height={stemH}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              cornerRadius={4}
            />
            {/* Liquid Thread */}
            <Rect
              x={stemX + 2}
              y={10 + stemH - liquidH}
              width={stemW - 4}
              height={liquidH}
              fill="#dc2626"
            />
            {/* Sensor Bulb */}
            <Circle
              x={width / 2}
              y={height - 18}
              radius={10}
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth={1}
            />
            {[0.25, 0.5, 0.75].map((frac, idx) => (
              <Line
                key={idx}
                points={[stemX + stemW, 10 + stemH * frac, stemX + stemW + 6, 10 + stemH * frac]}
                stroke="#475569"
                strokeWidth={1}
              />
            ))}
            <KonvaText
              text={`${temp.toFixed(1)}°C`}
              x={width / 2 + 8}
              y={10 + stemH - liquidH - 6}
              fontSize={10}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#dc2626"
            />
          </Group>
        );
      }

      case 'reagent-bottle': {
        const vol = Number(object.properties.liquidVolume ?? 120);
        const maxVol = Number(object.properties.capacityMl ?? 150);
        const reagentId = String(object.properties.reagentSolution ?? 'hcl');
        const sub = getSubstanceById(reagentId);

        return (
          <Group>
            <Rect
              x={width / 2 - 14}
              y={5}
              width={28}
              height={14}
              fill="#451a03"
              stroke="#78350f"
              strokeWidth={1}
              cornerRadius={3}
            />
            <Rect
              x={15}
              y={20}
              width={width - 30}
              height={height - 30}
              fill="#78350f"
              stroke={isSelected ? '#38bdf8' : '#451a03'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={10}
              opacity={0.92}
            />
            <Rect
              x={20}
              y={40}
              width={width - 40}
              height={height - 70}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
              cornerRadius={4}
            />
            <KonvaText
              text={sub ? sub.formula : reagentId.toUpperCase()}
              x={24}
              y={48}
              fontSize={11}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={sub ? sub.name : 'Reagent'}
              x={24}
              y={64}
              fontSize={8}
              fontFamily="sans-serif"
              fill="#475569"
              width={width - 48}
            />
            <KonvaText
              text={`${vol}/${maxVol} mL`}
              x={width / 2 - 20}
              y={height - 18}
              fontSize={9}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#fef3c7"
            />
          </Group>
        );
      }

      case 'chromatography-paper': {
        const sampleInk = String(object.properties.sampleInk ?? 'black-ink');
        const elapsed = Number(object.properties.elapsedSeconds ?? 60);
        const frontMm = Number(
          object.state.solventFrontMm ?? (elapsed > 0 ? Math.min(100, elapsed * 0.8) : 0)
        );
        let spots: { pigmentName: string; color: string; distanceMm: number; rf: number }[] = [];
        if (object.state.pigmentSpotsJson && typeof object.state.pigmentSpotsJson === 'string') {
          try {
            spots = JSON.parse(object.state.pigmentSpotsJson);
          } catch {
            spots = [];
          }
        }

        const baselineY = height - 35;
        const travelHeight = height - 70;
        const frontY = baselineY - (Math.min(100, frontMm) / 100) * travelHeight;

        return (
          <Group>
            {/* Paper backing */}
            <Rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              fill="#fdfbf7"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={4}
              shadowColor="#000000"
              shadowBlur={3}
              shadowOpacity={0.12}
            />
            {/* Top suspension hole */}
            <Circle
              x={width / 2}
              y={15}
              radius={4}
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <KonvaText
              text="WHATMAN #1"
              x={12}
              y={24}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />
            {/* Pencil origin baseline */}
            <Line
              points={[10, baselineY, width - 10, baselineY]}
              stroke="#64748b"
              strokeWidth={1}
              dash={[3, 2]}
            />
            <KonvaText
              text="Origin Baseline"
              x={12}
              y={baselineY + 4}
              fontSize={7}
              fontFamily="sans-serif"
              fill="#64748b"
            />
            {/* Advancing solvent front line */}
            {frontMm > 0 && (
              <Group>
                <Line
                  points={[8, frontY, width - 8, frontY]}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  dash={[4, 2]}
                />
                <KonvaText
                  text={`Front: ${frontMm.toFixed(0)}mm`}
                  x={width - 56}
                  y={frontY - 11}
                  fontSize={8}
                  fontFamily="sans-serif"
                  fontStyle="bold"
                  fill="#0284c7"
                />
              </Group>
            )}
            {/* Pigment spots */}
            {spots.map((spot, idx) => {
              const spotY = baselineY - (Math.min(100, spot.distanceMm) / 100) * travelHeight;
              return (
                <Group key={idx}>
                  <Circle
                    x={width / 2}
                    y={spotY}
                    radius={9}
                    fill={spot.color}
                    opacity={0.85}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                  <KonvaText
                    text={`${spot.rf.toFixed(2)}`}
                    x={width / 2 + 12}
                    y={spotY - 5}
                    fontSize={8}
                    fontFamily="Courier New, monospace"
                    fontStyle="bold"
                    fill="#334155"
                  />
                </Group>
              );
            })}
            {/* Bottom solvent immersion zone hint */}
            <Rect
              x={5}
              y={height - 18}
              width={width - 10}
              height={13}
              fill="#e0f2fe"
              opacity={0.6}
              cornerRadius={[0, 0, 4, 4]}
            />
            <KonvaText
              text={`${sampleInk.replace('-ink', '').toUpperCase()}`}
              x={width / 2 - 25}
              y={height - 14}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0369a1"
            />
          </Group>
        );
      }

      case 'developing-chamber': {
        const vol = Number(object.properties.liquidVolume ?? 25);
        const maxVol = Number(object.properties.capacityMl ?? 200);
        const fillFraction = Math.min(0.8, Math.max(0.1, vol / maxVol));
        const liquidH = Math.round((height - 30) * fillFraction);

        return (
          <Group>
            {/* Heavy Glass Tank Body */}
            <Rect
              x={8}
              y={25}
              width={width - 16}
              height={height - 28}
              fill="#f0f9ff"
              opacity={0.8}
              stroke={isSelected ? '#38bdf8' : '#0891b2'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={[4, 4, 8, 8]}
            />
            {/* Glass Lid on Top */}
            <Rect
              x={4}
              y={10}
              width={width - 8}
              height={16}
              fill="#0891b2"
              opacity={0.85}
              stroke="#0e7490"
              strokeWidth={1.5}
              cornerRadius={4}
            />
            <Circle x={width / 2} y={8} radius={5} fill="#0e7490" />
            {/* Solvent Pool at Bottom */}
            <Rect
              x={10}
              y={height - liquidH}
              width={width - 20}
              height={liquidH - 5}
              fill="#38bdf8"
              opacity={0.55}
              cornerRadius={[0, 0, 6, 6]}
            />
            {/* Paper strip outline inside chamber */}
            <Rect
              x={width / 2 - 18}
              y={35}
              width={36}
              height={height - 45}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
              opacity={0.7}
            />
            {/* Chamber text readout */}
            <KonvaText
              text="CHAMBER"
              x={width / 2 - 24}
              y={45}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0e7490"
            />
            <KonvaText
              text="Vapor Saturated"
              x={width / 2 - 36}
              y={60}
              fontSize={8}
              fontFamily="sans-serif"
              fill="#64748b"
            />
            <KonvaText
              text={`${vol} mL Eluent`}
              x={width / 2 - 28}
              y={height - 20}
              fontSize={9}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#0369a1"
            />
          </Group>
        );
      }

      case 'chromatography-ruler': {
        const numTicks = 10;
        const tickSpacing = (height - 20) / numTicks;
        return (
          <Group>
            {/* Clear acrylic body */}
            <Rect
              width={width}
              height={height}
              fill="#f8fafc"
              opacity={0.88}
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 2.5 : 1}
              cornerRadius={4}
            />
            {/* Graduation ticks and labels */}
            {Array.from({ length: numTicks + 1 }).map((_, i) => {
              const y = 10 + i * tickSpacing;
              const isMajor = i % 2 === 0;
              const mmVal = (numTicks - i) * 10;
              return (
                <Group key={i}>
                  <Line
                    points={[0, y, isMajor ? 14 : 8, y]}
                    stroke="#334155"
                    strokeWidth={isMajor ? 1.5 : 1}
                  />
                  {isMajor && (
                    <KonvaText
                      text={`${mmVal}`}
                      x={18}
                      y={y - 5}
                      fontSize={8}
                      fontFamily="Courier New, monospace"
                      fontStyle="bold"
                      fill="#1e293b"
                    />
                  )}
                </Group>
              );
            })}
            <KonvaText
              text="mm"
              x={width - 18}
              y={height - 15}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#64748b"
            />
          </Group>
        );
      }

      case 'iron-nail': {
        const isImmersed = object.properties.isImmersed !== false;
        const progressPct = Number(
          object.state.reactionProgressPercent ?? (isImmersed ? 80 : 0)
        );
        const nailColor = String(
          object.state.nailSurfaceColor ?? (progressPct > 20 ? '#9a3412' : '#64748b')
        );
        const cuGrams = Number(object.state.depositedCopperGrams ?? 0);

        return (
          <Group>
            {/* Nail head */}
            <Rect
              x={5}
              y={height / 2 - 16}
              width={10}
              height={32}
              fill="#475569"
              stroke={isSelected ? '#38bdf8' : '#1e293b'}
              strokeWidth={isSelected ? 2.5 : 1}
              cornerRadius={2}
            />
            {/* Nail shank (metal body) */}
            <Rect
              x={15}
              y={height / 2 - 8}
              width={width - 35}
              height={16}
              fill="#64748b"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 2 : 1}
            />
            {/* Sharp tapered point */}
            <Line
              points={[
                width - 20,
                height / 2 - 8,
                width - 5,
                height / 2,
                width - 20,
                height / 2 + 8,
              ]}
              fill="#64748b"
              stroke="#334155"
              strokeWidth={1}
            />
            {/* Copper deposit overlay */}
            {progressPct > 0 && (
              <Group>
                <Rect
                  x={20}
                  y={height / 2 - 8}
                  width={(width - 45) * (progressPct / 100)}
                  height={16}
                  fill={nailColor}
                  opacity={0.88}
                />
                <Line
                  points={[
                    width - 20,
                    height / 2 - 8,
                    width - 5,
                    height / 2,
                    width - 20,
                    height / 2 + 8,
                  ]}
                  fill={nailColor}
                  opacity={progressPct > 50 ? 0.9 : 0.4}
                />
              </Group>
            )}
            {/* Labels */}
            <KonvaText
              text={progressPct > 50 ? 'Cu-Coated Iron Nail' : 'Clean Iron Nail (Fe)'}
              x={18}
              y={6}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isSelected ? '#0284c7' : '#1e293b'}
            />
            <KonvaText
              text={
                progressPct > 0
                  ? `+${cuGrams.toFixed(2)}g Cu (${progressPct}% reacted)`
                  : isImmersed
                    ? 'Reacting in CuSO₄...'
                    : 'Substrate Ready'
              }
              x={18}
              y={height - 18}
              fontSize={9}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill={progressPct > 0 ? '#b45309' : '#64748b'}
            />
          </Group>
        );
      }

      case 'evaporating-dish': {
        const temp = Number(object.properties.solutionTemperatureC ?? 85);
        const waterMl = Number(
          object.state.remainingWaterMl ?? object.properties.initialWaterVolumeMl ?? 35
        );
        const satStatus = String(object.state.saturationStatus ?? 'saturated');
        const crystalYield = Number(object.state.crystalYieldGrams ?? 0);
        const isHeating = object.properties.isHeating !== false;

        return (
          <Group>
            {/* Porcelain ceramic dish bowl */}
            <Rect
              x={10}
              y={18}
              width={width - 20}
              height={height - 24}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={[0, 0, 35, 35]}
              shadowColor="#000000"
              shadowBlur={3}
              shadowOpacity={0.12}
            />
            {/* Rim & pour spout */}
            <Rect
              x={5}
              y={14}
              width={width - 10}
              height={8}
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth={1}
              cornerRadius={4}
            />
            {/* Blue CuSO4 liquid fill */}
            {waterMl > 0 && (
              <Rect
                x={16}
                y={32}
                width={width - 32}
                height={Math.min(height - 42, Math.max(12, (waterMl / 50) * (height - 45)))}
                fill="#2563eb"
                opacity={0.68}
                cornerRadius={[0, 0, 25, 25]}
              />
            )}
            {/* Crystal nucleation clusters */}
            {crystalYield > 0 && (
              <Group>
                {[
                  { x: width / 2 - 25, y: height - 22 },
                  { x: width / 2 - 10, y: height - 20 },
                  { x: width / 2 + 8, y: height - 24 },
                  { x: width / 2 + 20, y: height - 18 },
                ].map((pos, i) => (
                  <Rect
                    key={i}
                    x={pos.x}
                    y={pos.y}
                    width={9}
                    height={7}
                    rotation={20 * (i + 1)}
                    fill="#1d4ed8"
                    stroke="#93c5fd"
                    strokeWidth={1}
                  />
                ))}
              </Group>
            )}
            {/* Thermal steam lines when heating */}
            {isHeating && temp >= 60 && (
              <Group>
                <Line
                  points={[width / 2 - 20, 10, width / 2 - 25, 2]}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  dash={[3, 2]}
                />
                <Line
                  points={[width / 2, 8, width / 2, 0]}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  dash={[3, 2]}
                />
                <Line
                  points={[width / 2 + 20, 10, width / 2 + 25, 2]}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  dash={[3, 2]}
                />
              </Group>
            )}
            {/* Dish labels */}
            <KonvaText
              text="CHINA DISH"
              x={width / 2 - 28}
              y={24}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={`${temp}°C | ${satStatus.toUpperCase()}`}
              x={width / 2 - 38}
              y={height - 14}
              fontSize={8}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#1e293b"
            />
          </Group>
        );
      }

      case 'burner': {
        const flameActive = object.properties.flameActive !== false;
        const powerW = Number(object.properties.heatingPowerWatts ?? 450);

        return (
          <Group>
            {/* Tripod Stand Legs */}
            <Line points={[15, height, 35, 30]} stroke="#475569" strokeWidth={3} />
            <Line
              points={[width - 15, height, width - 35, 30]}
              stroke="#475569"
              strokeWidth={3}
            />
            <Line points={[width / 2, height, width / 2, 30]} stroke="#334155" strokeWidth={2} />
            {/* Wire gauze platform */}
            <Rect
              x={20}
              y={24}
              width={width - 40}
              height={8}
              fill="#94a3b8"
              stroke="#475569"
              strokeWidth={1}
              cornerRadius={2}
            />
            {/* Ceramic center of gauze */}
            <Circle
              x={width / 2}
              y={28}
              radius={8}
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth={1}
            />
            {/* Burner Barrel */}
            <Rect
              x={width / 2 - 6}
              y={55}
              width={12}
              height={height - 70}
              fill="#b45309"
              stroke="#78350f"
              strokeWidth={1}
            />
            {/* Heavy Cast Iron Base */}
            <Rect
              x={width / 2 - 25}
              y={height - 15}
              width={50}
              height={12}
              fill="#1e293b"
              cornerRadius={3}
            />
            {/* Bunsen Gas Flame */}
            {flameActive && (
              <Group>
                {/* Outer blue flame cone */}
                <Line
                  points={[width / 2 - 10, 55, width / 2, 30, width / 2 + 10, 55]}
                  fill="#0284c7"
                  stroke="#0284c7"
                  strokeWidth={1}
                  opacity={0.85}
                />
                {/* Inner cyan hot core */}
                <Line
                  points={[width / 2 - 5, 55, width / 2, 38, width / 2 + 5, 55]}
                  fill="#38bdf8"
                  stroke="#38bdf8"
                  strokeWidth={1}
                  opacity={0.95}
                />
              </Group>
            )}
            <KonvaText
              text={flameActive ? `${powerW}W FLAME` : 'BURNER (OFF)'}
              x={width / 2 - 32}
              y={height - 28}
              fontSize={8}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill={flameActive ? '#f97316' : '#94a3b8'}
            />
          </Group>
        );
      }

      case 'watch-glass': {
        const isCovering = object.properties.isCoveringDish !== false;

        return (
          <Group>
            {/* Curved shallow concave glass saucer */}
            <Line
              points={[8, 16, width / 2, height - 12, width - 8, 16]}
              stroke={isSelected ? '#38bdf8' : '#0284c7'}
              strokeWidth={isSelected ? 3 : 2}
            />
            <Line
              points={[8, 16, width / 2, 22, width - 8, 16]}
              stroke="#38bdf8"
              strokeWidth={1.5}
              opacity={0.8}
            />
            {/* Glass highlight reflections */}
            <Line
              points={[25, 20, width / 2 - 8, height - 16]}
              stroke="#ffffff"
              strokeWidth={2}
              opacity={0.7}
            />
            <KonvaText
              text="WATCH GLASS"
              x={width / 2 - 28}
              y={4}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0369a1"
            />
            <KonvaText
              text={isCovering ? 'Covering Dish' : 'Open'}
              x={width / 2 - 20}
              y={height - 10}
              fontSize={7}
              fontFamily="sans-serif"
              fill="#64748b"
            />
          </Group>
        );
      }

      // =========================================================================
      // CLASS 11 PRECISION MECHANICS VISUAL RENDERERS
      // =========================================================================

      case 'vernier-calliper': {
        const gapMm = Number(object.state.correctedReadingMm ?? object.properties.jawPosition ?? 25.4);
        const visualGapPx = Math.min(width - 160, Math.max(0, gapMm * 2.2));
        const gripped = String(object.properties.grippedObject ?? 'metallic-cylinder');
        const readingStr = `${Number(gapMm).toFixed(2)} mm`;

        return (
          <Group>
            {/* Background frame */}
            <Rect
              width={width}
              height={height}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />

            {/* Main Steel Beam */}
            <Rect
              x={10}
              y={35}
              width={width - 20}
              height={32}
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth={1}
              cornerRadius={2}
            />

            {/* Main Scale Ticks (0, 10, 20... 120 mm) */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].map((_val, idx) => {
              const tickX = 40 + idx * 24;
              if (tickX > width - 50) return null;
              return (
                <Group key={idx}>
                  <Line points={[tickX, 35, tickX, 48]} stroke="#1e293b" strokeWidth={1.5} />
                  <KonvaText
                    text={`${idx}`}
                    x={tickX - 3}
                    y={50}
                    fontSize={8}
                    fontFamily="monospace"
                    fontStyle="bold"
                    fill="#0f172a"
                  />
                </Group>
              );
            })}

            {/* Fixed Jaw (Left) */}
            <Rect x={10} y={15} width={30} height={110} fill="#64748b" stroke="#334155" strokeWidth={1} />
            {/* Fixed Upper Nib */}
            <Rect x={10} y={5} width={18} height={25} fill="#64748b" stroke="#334155" strokeWidth={1} />

            {/* Sliding Vernier Carriage */}
            <Group x={35 + visualGapPx} y={20}>
              {/* Carriage Block */}
              <Rect
                x={0}
                y={5}
                width={85}
                height={50}
                fill="#e2e8f0"
                stroke="#475569"
                strokeWidth={1.5}
                cornerRadius={4}
              />
              {/* Sliding Lower Jaw */}
              <Rect x={0} y={15} width={25} height={90} fill="#64748b" stroke="#334155" strokeWidth={1} />
              {/* Sliding Upper Nib */}
              <Rect x={0} y={-15} width={16} height={25} fill="#64748b" stroke="#334155" strokeWidth={1} />

              {/* Vernier Scale Window & Ticks */}
              <Rect x={26} y={12} width={52} height={24} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
              {[0, 2, 4, 6, 8, 10].map((vTick, vIdx) => (
                <Group key={vIdx}>
                  <Line points={[28 + vIdx * 9, 12, 28 + vIdx * 9, 22]} stroke="#0369a1" strokeWidth={1.2} />
                  <KonvaText
                    text={`${vTick}`}
                    x={26 + vIdx * 9}
                    y={24}
                    fontSize={7}
                    fontFamily="monospace"
                    fill="#0369a1"
                  />
                </Group>
              ))}

              {/* Clamp Thumb Screw */}
              <Circle x={60} y={-2} radius={7} fill="#b45309" stroke="#78350f" strokeWidth={1} />
            </Group>

            {/* Gripped Specimen between jaws */}
            {gripped === 'metallic-cylinder' && visualGapPx > 10 && (
              <Rect
                x={40}
                y={75}
                width={Math.min(visualGapPx - 2, 45)}
                height={50}
                fill="#d97706"
                stroke="#b45309"
                strokeWidth={1}
                cornerRadius={3}
              />
            )}
            {gripped === 'steel-sphere' && visualGapPx > 10 && (
              <Circle
                x={40 + visualGapPx / 2}
                y={95}
                radius={Math.min(visualGapPx / 2 - 1, 22)}
                fill="#64748b"
                stroke="#334155"
                strokeWidth={1.5}
              />
            )}

            {/* Title & Digital Readout Badge */}
            <Rect x={width - 150} y={10} width={140} height={22} fill="#0f172a" cornerRadius={4} />
            <KonvaText
              text={`Reading: ${readingStr}`}
              x={width - 144}
              y={15}
              fontSize={11}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#38bdf8"
            />
            <KonvaText
              text="VERNIER CALLIPERS (LC = 0.1 mm)"
              x={15}
              y={height - 14}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#475569"
            />
          </Group>
        );
      }

      case 'test-cylinder': {
        const d = Number(object.properties.diameter ?? 25.4);
        const h = Number(object.properties.length ?? 52.0);
        const mat = String(object.properties.material ?? 'Brass');
        const fillCol = mat === 'Steel' ? '#64748b' : mat === 'Aluminum' ? '#94a3b8' : '#d97706';

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            {/* 3D Cylinder visualization */}
            <Rect
              x={width / 2 - 25}
              y={20}
              width={50}
              height={70}
              fill={fillCol}
              stroke="#475569"
              strokeWidth={1.5}
              cornerRadius={6}
            />
            <KonvaText
              text={mat.toUpperCase()}
              x={width / 2 - 20}
              y={45}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
            <KonvaText
              text={`d = ${d} mm | h = ${h} mm`}
              x={10}
              y={height - 18}
              fontSize={8}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#1e293b"
            />
          </Group>
        );
      }

      case 'test-sphere': {
        const d = Number(object.properties.diameter ?? 18.6);
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Circle
              x={width / 2}
              y={height / 2 - 6}
              radius={28}
              fill="#64748b"
              stroke="#334155"
              strokeWidth={2}
            />
            {/* Highlight spot */}
            <Circle x={width / 2 - 8} y={height / 2 - 14} radius={6} fill="#ffffff" opacity={0.6} />
            <KonvaText
              text={`Ø = ${d} mm`}
              x={width / 2 - 26}
              y={height - 18}
              fontSize={9}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#1e293b"
            />
          </Group>
        );
      }

      case 'screw-gauge': {
        const gapMm = Number(object.state.correctedReadingMm ?? object.properties.spindleGap ?? 0.46);
        const visualGapPx = Math.min(65, Math.max(0, gapMm * 18));
        const gripped = String(object.properties.grippedObject ?? 'resistance-wire');
        const readingStr = `${Number(gapMm).toFixed(3)} mm`;

        return (
          <Group>
            {/* Background */}
            <Rect
              width={width}
              height={height}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />

            {/* Classic U-Frame */}
            <Line
              points={[40, 45, 20, 75, 20, 115, 60, 145, 120, 145, 150, 115, 150, 75]}
              stroke="#0f766e"
              strokeWidth={24}
              lineCap="round"
              lineJoin="round"
            />
            <KonvaText
              text="0 - 25 mm  0.01 mm"
              x={40}
              y={128}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ccfbf1"
            />

            {/* Fixed Anvil (Left) */}
            <Rect x={138} y={66} width={14} height={18} fill="#94a3b8" stroke="#334155" strokeWidth={1} />

            {/* Movable Spindle (Advancing from right) */}
            <Rect
              x={152 + visualGapPx}
              y={67}
              width={55 - visualGapPx}
              height={16}
              fill="#cbd5e1"
              stroke="#475569"
              strokeWidth={1}
            />

            {/* Gripped Specimen */}
            {gripped === 'resistance-wire' && (
              <Line points={[152, 50, 152, 100]} stroke="#b45309" strokeWidth={2.5} />
            )}
            {gripped === 'glass-plate' && (
              <Rect x={152} y={55} width={Math.max(4, visualGapPx)} height={40} fill="#38bdf8" opacity={0.6} stroke="#0284c7" strokeWidth={1} />
            )}

            {/* Linear Sleeve / Barrel with Pitch Scale */}
            <Rect x={205} y={62} width={75} height={26} fill="#94a3b8" stroke="#475569" strokeWidth={1} />
            {/* Baseline */}
            <Line points={[205, 75, 280, 75]} stroke="#0f172a" strokeWidth={1.5} />
            {/* Pitch ticks (0, 1, 2, 3, 4, 5 mm) */}
            {[0, 1, 2, 3, 4, 5].map((pTick) => (
              <Group key={pTick}>
                <Line points={[215 + pTick * 10, 68, 215 + pTick * 10, 75]} stroke="#0f172a" strokeWidth={1} />
                <Line points={[220 + pTick * 10, 75, 220 + pTick * 10, 81]} stroke="#0f172a" strokeWidth={1} />
              </Group>
            ))}

            {/* Rotating Thimble with Beveled Circular Scale */}
            <Rect x={280} y={54} width={75} height={42} fill="#64748b" stroke="#334155" strokeWidth={1.5} cornerRadius={2} />
            {/* Circular division lines */}
            {[0, 10, 20, 30, 40].map((_cDiv, cIdx) => (
              <Line key={cIdx} points={[282, 58 + cIdx * 7, 292, 58 + cIdx * 7]} stroke="#f1f5f9" strokeWidth={1} />
            ))}

            {/* Ratchet Cap */}
            <Rect x={355} y={63} width={35} height={24} fill="#475569" stroke="#1e293b" strokeWidth={1} cornerRadius={3} />
            <KonvaText text="RATCHET" x={358} y={71} fontSize={6} fontFamily="sans-serif" fill="#94a3b8" />

            {/* Readout Display */}
            <Rect x={width - 150} y={10} width={140} height={22} fill="#0f172a" cornerRadius={4} />
            <KonvaText
              text={`Gap: ${readingStr}`}
              x={width - 144}
              y={15}
              fontSize={11}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#2dd4bf"
            />
            <KonvaText
              text="MICROMETER SCREW GAUGE (LC = 0.01 mm)"
              x={15}
              y={height - 12}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f766e"
            />
          </Group>
        );
      }

      case 'gauge-wire': {
        const d = Number(object.properties.diameter ?? 0.46);
        const mat = String(object.properties.material ?? 'Nichrome');
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Circle x={width / 2} y={height / 2 - 8} radius={26} fill="#b45309" stroke="#78350f" strokeWidth={2} />
            <Circle x={width / 2} y={height / 2 - 8} radius={14} fill="#fef3c7" stroke="#b45309" strokeWidth={1} />
            <KonvaText
              text={mat}
              x={width / 2 - 20}
              y={height / 2 - 12}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#78350f"
            />
            <KonvaText
              text={`d = ${d.toFixed(3)} mm`}
              x={width / 2 - 28}
              y={height - 16}
              fontSize={9}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#1e293b"
            />
          </Group>
        );
      }

      case 'gauge-plate': {
        const t = Number(object.properties.thickness ?? 1.25);
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Rect
              x={width / 2 - 35}
              y={25}
              width={70}
              height={40}
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth={1.5}
              cornerRadius={2}
            />
            <KonvaText
              text="GLASS SLIDE"
              x={width / 2 - 24}
              y={40}
              fontSize={7}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0369a1"
            />
            <KonvaText
              text={`t = ${t.toFixed(2)} mm`}
              x={width / 2 - 28}
              y={height - 16}
              fontSize={9}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#1e293b"
            />
          </Group>
        );
      }

      case 'irregular-lamina': {
        const area = Number(object.state.estimatedAreaCm2 ?? 22.0);
        return (
          <Group>
            {/* Smooth polygonal leaf contour */}
            <Line
              points={[
                width / 2, 15,
                width / 2 + 35, 35,
                width / 2 + 55, 75,
                width / 2 + 60, 115,
                width / 2 + 45, 155,
                width / 2 + 20, 185,
                width / 2, 205,
                width / 2 - 20, 185,
                width / 2 - 45, 155,
                width / 2 - 60, 115,
                width / 2 - 55, 75,
                width / 2 - 35, 35,
              ]}
              closed
              fill="#22c55e"
              stroke={isSelected ? '#38bdf8' : '#15803d'}
              strokeWidth={isSelected ? 3 : 2}
            />
            {/* Central Leaf Vein */}
            <Line points={[width / 2, 20, width / 2, 200]} stroke="#166534" strokeWidth={2} />
            <KonvaText
              text={`Area: ${area} cm²`}
              x={width / 2 - 32}
              y={105}
              fontSize={9}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#ffffff"
            />
          </Group>
        );
      }

      case 'graph-grid': {
        const gridUnit = Number(object.properties.gridUnitCm ?? 1.0);
        const areaCm2 = Number(object.state.calculatedAreaCm2 ?? 22.0);

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#f0fdf4"
              stroke={isSelected ? '#38bdf8' : '#10b981'}
              strokeWidth={isSelected ? 3 : 1.5}
            />
            {/* 1 cm Major Grid Lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
              const xPos = idx * 35;
              const yPos = idx * 35;
              return (
                <Group key={idx}>
                  {xPos <= width && <Line points={[xPos, 0, xPos, height]} stroke="#a7f3d0" strokeWidth={1} />}
                  {yPos <= height && <Line points={[0, yPos, width, yPos]} stroke="#a7f3d0" strokeWidth={1} />}
                </Group>
              );
            })}
            <Rect x={10} y={10} width={135} height={20} fill="#065f46" cornerRadius={4} />
            <KonvaText
              text={`Grid: ${gridUnit} cm | ${areaCm2} cm²`}
              x={14}
              y={15}
              fontSize={9}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#ecfdf5"
            />
          </Group>
        );
      }

      case 'spherometer': {
        const sagitta = Number(object.state.sagittaMm ?? 2.03);
        const radiusCm = object.state.radiusOfCurvatureCm ?? 13.24;

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            {/* Tripod Frame (Equilateral triangle base) */}
            <Line
              points={[width / 2, 40, width / 2 + 70, 170, width / 2 - 70, 170]}
              closed
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth={4}
            />
            {/* 3 Outer Leg Feet */}
            <Circle x={width / 2} y={40} radius={6} fill="#78350f" />
            <Circle x={width / 2 + 70} y={170} radius={6} fill="#78350f" />
            <Circle x={width / 2 - 70} y={170} radius={6} fill="#78350f" />

            {/* Central Vertical Pitch Scale */}
            <Rect x={width / 2 - 6} y={75} width={12} height={80} fill="#94a3b8" stroke="#475569" strokeWidth={1} />
            <Line points={[width / 2 - 6, 115, width / 2 + 6, 115]} stroke="#0f172a" strokeWidth={2} />

            {/* Circular Disc Head */}
            <Circle x={width / 2} y={115} radius={34} fill="#e2e8f0" stroke="#7c3aed" strokeWidth={2} />
            <Circle x={width / 2} y={115} radius={8} fill="#b45309" />

            {/* Measurement Overlay */}
            <Rect x={10} y={height - 35} width={width - 20} height={24} fill="#0f172a" cornerRadius={4} />
            <KonvaText
              text={`Sagitta h = ${sagitta.toFixed(2)} mm | R = ${radiusCm === Infinity ? '∞' : `${radiusCm} cm`}`}
              x={16}
              y={height - 29}
              fontSize={10}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#a78bfa"
            />
          </Group>
        );
      }

      case 'curved-surface': {
        const prof = String(object.properties.surfaceProfile ?? 'Spherical Convex Watch Glass');
        const isConvex = prof.includes('Convex');
        const isConcave = prof.includes('Concave');

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            {/* Curved arc line */}
            <Line
              points={
                isConvex
                  ? [20, 75, width / 2, 40, width - 20, 75]
                  : isConcave
                  ? [20, 45, width / 2, 80, width - 20, 45]
                  : [20, 60, width - 20, 60]
              }
              stroke="#0284c7"
              strokeWidth={3}
              tension={0.4}
            />
            <KonvaText
              text={prof}
              x={10}
              y={height - 18}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0369a1"
            />
          </Group>
        );
      }

      case 'beam-balance': {
        const isArr = object.properties.isArrested !== false;
        const leftMass = Number(object.properties.leftPanMassG ?? 24.50);
        const rightMass = Number(object.properties.rightPanMassG ?? 20.00);
        const angleDeg = Number(object.state.currentPointerAngleDeg ?? 0);
        const isBalanced = object.state.isBalanced === true;

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />

            {/* Central Pillar */}
            <Rect x={width / 2 - 8} y={40} width={16} height={190} fill="#b45309" stroke="#78350f" strokeWidth={1} cornerRadius={2} />
            {/* Heavy Base Plate */}
            <Rect x={width / 2 - 70} y={225} width={140} height={18} fill="#78350f" cornerRadius={3} />

            {/* Central Agate Knife-Edge Block */}
            <Rect x={width / 2 - 16} y={35} width={32} height={14} fill="#475569" cornerRadius={2} />

            {/* Balanced Horizontal Beam (Pivoted around center) */}
            <Group x={width / 2} y={42} rotation={isArr ? 0 : angleDeg}>
              <Line points={[-150, 0, 150, 0]} stroke="#d97706" strokeWidth={7} lineCap="round" />
              {/* Central pointer needle extending downwards */}
              <Line points={[0, 0, 0, 95]} stroke="#ef4444" strokeWidth={2} />
              <Circle x={0} y={0} radius={5} fill="#78350f" />

              {/* Left Stirrup Wire & Pan */}
              <Line points={[-140, 0, -140, 75]} stroke="#64748b" strokeWidth={1.5} />
              <Line points={[-170, 75, -110, 75]} stroke="#475569" strokeWidth={3} lineCap="round" />
              {/* Left Weight Disk */}
              <Rect x={-155} y={58} width={30} height={16} fill="#d97706" stroke="#78350f" strokeWidth={1} cornerRadius={2} />

              {/* Right Stirrup Wire & Pan */}
              <Line points={[140, 0, 140, 75]} stroke="#64748b" strokeWidth={1.5} />
              <Line points={[110, 75, 170, 75]} stroke="#475569" strokeWidth={3} lineCap="round" />
              {/* Right Weights Disks */}
              <Rect x={125} y={63} width={30} height={11} fill="#b45309" stroke="#78350f" strokeWidth={1} cornerRadius={1} />
            </Group>

            {/* Index Arc Scale at base of pointer */}
            <Rect x={width / 2 - 40} y={130} width={80} height={18} fill="#fef3c7" stroke="#b45309" strokeWidth={1} cornerRadius={2} />
            {[-4, -2, 0, 2, 4].map((div) => (
              <Line key={div} points={[width / 2 + div * 8, 130, width / 2 + div * 8, 142]} stroke="#78350f" strokeWidth={1} />
            ))}

            {/* Arrestment Knob */}
            <Circle x={width / 2} y={234} radius={8} fill={isArr ? '#ef4444' : '#22c55e'} stroke="#1e293b" strokeWidth={1.5} />

            {/* Status Readout Banner */}
            <Rect x={10} y={height - 28} width={width - 20} height={20} fill={isBalanced ? '#065f46' : isArr ? '#1e293b' : '#7c2d12'} cornerRadius={3} />
            <KonvaText
              text={
                isArr
                  ? 'BEAM ARRESTED'
                  : isBalanced
                  ? `EQUILIBRIUM ACHIEVED (m = ${rightMass.toFixed(2)} g)`
                  : `Left: ${leftMass.toFixed(2)}g | Right: ${rightMass.toFixed(2)}g`
              }
              x={18}
              y={height - 23}
              fontSize={10}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#ffffff"
            />
          </Group>
        );
      }

      case 'weight-box': {
        const selWeight = Number(object.properties.selectedWeightG ?? 5.0);
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#78350f"
              stroke={isSelected ? '#38bdf8' : '#451a03'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={6}
            />
            {/* Felt lining */}
            <Rect x={8} y={8} width={width - 16} height={height - 16} fill="#14532d" cornerRadius={4} />
            {/* Standard weight cylinders */}
            {[50, 20, 10, 5, 2, 1].map((w, idx) => {
              const xPos = 20 + (idx % 3) * 50;
              const yPos = 20 + Math.floor(idx / 3) * 45;
              return (
                <Group key={idx}>
                  <Circle x={xPos + 15} y={yPos + 15} radius={12} fill="#d97706" stroke="#78350f" strokeWidth={1} />
                  <KonvaText
                    text={`${w}g`}
                    x={xPos + 6}
                    y={yPos + 10}
                    fontSize={8}
                    fontFamily="monospace"
                    fontStyle="bold"
                    fill="#451a03"
                  />
                </Group>
              );
            })}
            <KonvaText
              text={`Active: ${selWeight}g`}
              x={12}
              y={height - 16}
              fontSize={8}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#fef3c7"
            />
          </Group>
        );
      }

      case 'unknown-mass': {
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Rect
              x={width / 2 - 25}
              y={20}
              width={50}
              height={55}
              fill="#d97706"
              stroke="#78350f"
              strokeWidth={1.5}
              cornerRadius={4}
            />
            <Circle x={width / 2} y={15} radius={7} fill="#b45309" stroke="#78350f" strokeWidth={1} />
            <KonvaText
              text="?"
              x={width / 2 - 7}
              y={32}
              fontSize={24}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
            <KonvaText
              text="UNKNOWN MASS"
              x={width / 2 - 32}
              y={height - 16}
              fontSize={7}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#475569"
            />
          </Group>
        );
      }

      case 'force-board': {
        const forceP = Number(object.properties.forceP ?? 3.0);
        const angleP = Number(object.properties.anglePDeg ?? 35.0);
        const forceQ = Number(object.properties.forceQ ?? 4.0);
        const angleQ = Number(object.properties.angleQDeg ?? 125.0);
        const showParallelogram = object.properties.showParallelogram !== false;
        const showComponents = object.properties.showComponents !== false;

        const resultantN = Number(object.state.resultantMagnitudeN ?? 5.0);
        const resultantAngle = Number(object.state.resultantAngleDeg ?? 80.0);
        const isBalanced = object.state.isBalanced !== false;

        const cx = width / 2;
        const cy = height / 2 + 30;
        const scale = 22; // px per Newton

        // Vector P endpoints
        const radP = (angleP * Math.PI) / 180;
        const px = cx + forceP * scale * Math.cos(radP);
        const py = cy - forceP * scale * Math.sin(radP);

        // Vector Q endpoints
        const radQ = (angleQ * Math.PI) / 180;
        const qx = cx + forceQ * scale * Math.cos(radQ);
        const qy = cy - forceQ * scale * Math.sin(radQ);

        // Resultant vector endpoint
        const rx = px + (qx - cx);
        const ry = py + (qy - cy);

        // Equilibrant (straight down balancing force)
        const eqLen = resultantN * scale;

        return (
          <Group>
            {/* Wooden Drawing Board Frame */}
            <Rect
              width={width}
              height={height}
              fill="#fef3c7"
              stroke={isSelected ? '#38bdf8' : '#78350f'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={8}
              shadowColor="#0f172a"
              shadowBlur={8}
              shadowOpacity={0.12}
            />
            {/* White Drawing Paper */}
            <Rect
              x={16}
              y={16}
              width={width - 32}
              height={height - 32}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
              cornerRadius={4}
            />

            {/* Protractor Semicircle Degree Arc */}
            <Circle
              x={cx}
              y={cy}
              radius={scale * 5.5}
              stroke="#e2e8f0"
              strokeWidth={1}
              dash={[4, 4]}
            />
            {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = cx + (scale * 5.2) * Math.cos(rad);
              const y1 = cy - (scale * 5.2) * Math.sin(rad);
              const x2 = cx + (scale * 5.6) * Math.cos(rad);
              const y2 = cy - (scale * 5.6) * Math.sin(rad);
              return (
                <Group key={`deg-${deg}`}>
                  <Line points={[x1, y1, x2, y2]} stroke="#94a3b8" strokeWidth={1} />
                  <KonvaText
                    text={`${deg}°`}
                    x={cx + (scale * 6.0) * Math.cos(rad) - 8}
                    y={cy - (scale * 6.0) * Math.sin(rad) - 5}
                    fontSize={8}
                    fontFamily="sans-serif"
                    fill="#64748b"
                  />
                </Group>
              );
            })}

            {/* Low-Friction Pulley Wheels at Board Corners */}
            <Circle x={36} y={36} radius={14} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
            <Circle x={36} y={36} radius={4} fill="#334155" />
            <Circle x={width - 36} y={36} radius={14} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
            <Circle x={width - 36} y={36} radius={4} fill="#334155" />

            {/* String Lines extending to pulleys */}
            <Line points={[cx, cy, 36, 36]} stroke="#cbd5e1" strokeWidth={1} dash={[3, 3]} />
            <Line points={[cx, cy, width - 36, 36]} stroke="#cbd5e1" strokeWidth={1} dash={[3, 3]} />

            {/* Parallelogram Construction Dashed Lines */}
            {showParallelogram && (
              <Group>
                <Line points={[px, py, rx, ry]} stroke="#94a3b8" strokeWidth={1.5} dash={[4, 3]} />
                <Line points={[qx, qy, rx, ry]} stroke="#94a3b8" strokeWidth={1.5} dash={[4, 3]} />
              </Group>
            )}

            {/* Vector Component Projections */}
            {showComponents && (
              <Group>
                <Line points={[cx, cy, px, cy]} stroke="#93c5fd" strokeWidth={1} dash={[2, 2]} />
                <Line points={[px, cy, px, py]} stroke="#93c5fd" strokeWidth={1} dash={[2, 2]} />
                <Line points={[cx, cy, qx, cy]} stroke="#fcd34d" strokeWidth={1} dash={[2, 2]} />
                <Line points={[qx, cy, qx, qy]} stroke="#fcd34d" strokeWidth={1} dash={[2, 2]} />
              </Group>
            )}

            {/* Vector P Arrow (Blue) */}
            <Line
              points={[cx, cy, px, py]}
              stroke="#2563eb"
              strokeWidth={3}
              lineCap="round"
            />
            <Circle x={px} y={py} radius={4} fill="#2563eb" />
            <KonvaText
              text={`P = ${forceP.toFixed(1)} N (${angleP}°)`}
              x={px - 20}
              y={py - 16}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#1d4ed8"
            />

            {/* Vector Q Arrow (Amber) */}
            <Line
              points={[cx, cy, qx, qy]}
              stroke="#d97706"
              strokeWidth={3}
              lineCap="round"
            />
            <Circle x={qx} y={qy} radius={4} fill="#d97706" />
            <KonvaText
              text={`Q = ${forceQ.toFixed(1)} N (${angleQ}°)`}
              x={qx - 20}
              y={qy - 16}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#b45309"
            />

            {/* Resultant Vector R (Green Diagonal) */}
            {showParallelogram && (
              <Group>
                <Line
                  points={[cx, cy, rx, ry]}
                  stroke="#059669"
                  strokeWidth={3.5}
                  lineCap="round"
                />
                <Circle x={rx} y={ry} radius={5} fill="#059669" />
                <KonvaText
                  text={`R = ${resultantN.toFixed(2)} N (${resultantAngle}°)`}
                  x={rx - 30}
                  y={ry - 18}
                  fontSize={11}
                  fontFamily="sans-serif"
                  fontStyle="bold"
                  fill="#047857"
                />
              </Group>
            )}

            {/* Central Equilibrant Weight String (Purple Downward) */}
            <Line
              points={[cx, cy, cx, cy + eqLen]}
              stroke="#7c3aed"
              strokeWidth={2.5}
              dash={[3, 2]}
            />
            <Circle x={cx} y={cy + eqLen} radius={6} fill="#7c3aed" />
            <KonvaText
              text={`S (Equilibrant) = ${resultantN.toFixed(2)} N`}
              x={cx - 60}
              y={cy + eqLen + 8}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#6d28d9"
            />

            {/* Central Brass Knot Ring */}
            <Circle x={cx} y={cy} radius={7} fill="#fbbf24" stroke="#78350f" strokeWidth={2} />
            <Circle x={cx} y={cy} radius={3} fill="#ffffff" />

            {/* Header Telemetry Badge */}
            <Rect
              x={24}
              y={22}
              width={260}
              height={26}
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth={1}
              cornerRadius={6}
            />
            <KonvaText
              text={`GRAVESAND'S VECTOR BOARD | ${isBalanced ? '✓ IN EQUILIBRIUM' : '⚠ IMBALANCED'}`}
              x={32}
              y={29}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isBalanced ? '#059669' : '#dc2626'}
            />
          </Group>
        );
      }

      case 'pulley-weight': {
        const discs = Number(object.properties.slottedDiscsCount ?? 4);
        const massG = 50 + discs * 50;
        const forceN = (massG * 9.8) / 1000;

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            {/* Top suspension loop */}
            <Circle x={width / 2} y={15} radius={5} fill="#ffffff" stroke="#475569" strokeWidth={2} />
            {/* Vertical rod */}
            <Line points={[width / 2, 20, width / 2, height - 35]} stroke="#94a3b8" strokeWidth={3} />
            {/* Hanger base disc */}
            <Rect
              x={width / 2 - 25}
              y={height - 40}
              width={50}
              height={8}
              fill="#d97706"
              stroke="#78350f"
              strokeWidth={1}
              cornerRadius={2}
            />
            {/* Slotted 50g discs */}
            {Array.from({ length: Math.min(discs, 8) }).map((_, dIdx) => (
              <Rect
                key={`disc-${dIdx}`}
                x={width / 2 - 22}
                y={height - 48 - dIdx * 9}
                width={44}
                height={8}
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth={1}
                cornerRadius={1}
              />
            ))}
            {/* Mass and Force Label */}
            <KonvaText
              text={`${massG} g (${forceN.toFixed(2)} N)`}
              x={width / 2 - 32}
              y={height - 20}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#1e293b"
            />
          </Group>
        );
      }

      case 'friction-board': {
        const surfacePair = String(object.properties.surfacePair ?? 'wood-on-wood');
        let surfaceColor = '#d97706';
        let surfaceLabel = 'Wood Track';
        if (surfacePair === 'wood-on-glass') {
          surfaceColor = '#bae6fd';
          surfaceLabel = 'Glass Plate';
        } else if (surfacePair === 'wood-on-sandpaper') {
          surfaceColor = '#78716c';
          surfaceLabel = 'Sandpaper Surface';
        } else if (surfacePair === 'metal-on-metal') {
          surfaceColor = '#cbd5e1';
          surfaceLabel = 'Steel Track';
        }

        return (
          <Group>
            {/* Base Table Bench */}
            <Rect
              width={width}
              height={height}
              fill="#f1f5f9"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={8}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.08}
            />
            {/* Active Friction Track Bed */}
            <Rect
              x={20}
              y={45}
              width={width - 70}
              height={65}
              fill={surfaceColor}
              stroke="#475569"
              strokeWidth={1.5}
              cornerRadius={4}
            />
            {/* Track Metric Graduation Ruler along bottom */}
            <Rect
              x={20}
              y={110}
              width={width - 70}
              height={18}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
            />
            {Array.from({ length: 7 }).map((_, idx) => (
              <Group key={`ruler-${idx}`}>
                <Line
                  points={[20 + idx * ((width - 70) / 6), 110, 20 + idx * ((width - 70) / 6), 120]}
                  stroke="#475569"
                  strokeWidth={1}
                />
                <KonvaText
                  text={`${idx * 10} cm`}
                  x={20 + idx * ((width - 70) / 6) - 10}
                  y={122}
                  fontSize={8}
                  fontFamily="sans-serif"
                  fill="#64748b"
                />
              </Group>
            ))}

            {/* Smooth Pulley Wheel at Track Right End */}
            <Circle x={width - 32} y={65} radius={18} fill="#94a3b8" stroke="#334155" strokeWidth={2} />
            <Circle x={width - 32} y={65} radius={5} fill="#1e293b" />
            <Line points={[width - 32, 65, width - 32, 130]} stroke="#38bdf8" strokeWidth={1.5} />
            {/* Suspended Pan */}
            <Rect x={width - 44} y={130} width={24} height={6} fill="#d97706" stroke="#78350f" strokeWidth={1} />

            {/* Surface Specification Badge */}
            <KonvaText
              text={`FRICTION TRACK: ${surfaceLabel.toUpperCase()}`}
              x={24}
              y={20}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#334155"
            />
          </Group>
        );
      }

      case 'friction-block': {
        const addedMass = Number(object.properties.addedMassG ?? 50.0);
        const blockMass = Number(object.properties.blockMassG ?? 150.0);
        const normalN = Number(object.state.normalReactionN ?? 1.96);
        const limitN = Number(object.state.limitingFrictionN ?? 0.69);
        const isMoving = object.state.isMotionInitiated === true;
        const orientation = String(object.properties.contactOrientation ?? 'broad-side');

        return (
          <Group>
            {/* Slider Wooden Block */}
            <Rect
              x={10}
              y={orientation === 'broad-side' ? 35 : 20}
              width={orientation === 'broad-side' ? width - 30 : width - 60}
              height={orientation === 'broad-side' ? 45 : 65}
              fill="#b45309"
              stroke={isSelected ? '#38bdf8' : '#78350f'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={4}
            />
            {/* Added Masses on top peg */}
            {addedMass > 0 && (
              <Rect
                x={30}
                y={orientation === 'broad-side' ? 20 : 5}
                width={50}
                height={15}
                fill="#d97706"
                stroke="#78350f"
                strokeWidth={1}
                cornerRadius={2}
              />
            )}
            {/* Brass Towing Hook on right edge */}
            <Circle
              x={orientation === 'broad-side' ? width - 20 : width - 50}
              y={orientation === 'broad-side' ? 57 : 52}
              radius={6}
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth={1.5}
            />

            {/* Force Vector Arrows */}
            {/* Normal Force N (Upward) */}
            <Line points={[55, 35, 55, 10]} stroke="#2563eb" strokeWidth={2} />
            <Circle x={55} y={10} radius={3} fill="#2563eb" />
            <KonvaText text={`N=${normalN.toFixed(2)}N`} x={62} y={10} fontSize={8} fontFamily="sans-serif" fill="#1d4ed8" />

            {/* Friction Force f (Leftward) */}
            <Line points={[10, 57, -15, 57]} stroke="#dc2626" strokeWidth={2} />
            <Circle x={-15} y={57} radius={3} fill="#dc2626" />
            <KonvaText text={`f=${limitN.toFixed(2)}N`} x={-45} y={45} fontSize={8} fontFamily="sans-serif" fill="#b91c1c" />

            {/* Status Telemetry */}
            <KonvaText
              text={`${blockMass + addedMass} g | ${isMoving ? 'SLIDING' : 'STATIC'}`}
              x={16}
              y={height - 18}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isMoving ? '#059669' : '#475569'}
            />
          </Group>
        );
      }

      case 'inclined-plane': {
        const angleDeg = Number(object.properties.inclineAngleDeg ?? 20.0);
        const rad = (angleDeg * Math.PI) / 180;
        const normalN = Number(object.state.normalForceN ?? 1.84);
        const parN = Number(object.state.parallelGravityN ?? 0.67);
        const isSliding = object.state.isSlidingDownSpontaneously === true;

        const pivotX = 40;
        const pivotY = height - 40;
        const rampLength = width - 80;

        const topX = pivotX + rampLength * Math.cos(rad);
        const topY = pivotY - rampLength * Math.sin(rad);

        return (
          <Group>
            {/* Cast Iron Base Plate */}
            <Rect
              x={15}
              y={height - 35}
              width={width - 30}
              height={25}
              fill="#334155"
              stroke={isSelected ? '#38bdf8' : '#1e293b'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={4}
            />
            {/* Protractor Angle Arc at Pivot */}
            <Circle x={pivotX} y={pivotY} radius={50} stroke="#94a3b8" strokeWidth={1} dash={[3, 3]} />
            <KonvaText text={`${angleDeg.toFixed(1)}°`} x={pivotX + 55} y={pivotY - 20} fontSize={10} fontFamily="sans-serif" fontStyle="bold" fill="#0284c7" />

            {/* Inclined Ramp Beam */}
            <Line
              points={[pivotX, pivotY, topX, topY]}
              stroke="#b45309"
              strokeWidth={14}
              lineCap="round"
            />
            {/* Hinge Pin */}
            <Circle x={pivotX} y={pivotY} radius={7} fill="#fbbf24" stroke="#78350f" strokeWidth={2} />

            {/* Pulley at Ramp Top End */}
            <Circle x={topX} y={topY} radius={14} fill="#94a3b8" stroke="#334155" strokeWidth={2} />
            <Circle x={topX} y={topY} radius={4} fill="#1e293b" />

            {/* Vertical Elevation Arc Stand */}
            <Line points={[topX, topY, topX, height - 35]} stroke="#cbd5e1" strokeWidth={2} dash={[4, 2]} />

            {/* Status Telemetry Badge */}
            <Rect
              x={20}
              y={15}
              width={260}
              height={26}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
              cornerRadius={6}
            />
            <KonvaText
              text={`INCLINE: θ=${angleDeg}° | N=${normalN.toFixed(2)}N | F∥=${parN.toFixed(2)}N | ${isSliding ? 'SLIDING DOWN' : 'REST'}`}
              x={26}
              y={22}
              fontSize={8.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isSliding ? '#dc2626' : '#047857'}
            />
          </Group>
        );
      }

      case 'incline-slider': {
        const massG = Number(object.properties.blockMassG ?? 200.0);
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#b45309"
              stroke={isSelected ? '#38bdf8' : '#78350f'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={6}
            />
            <Circle x={width - 15} y={height / 2} radius={5} fill="#fbbf24" stroke="#78350f" strokeWidth={1.5} />
            <KonvaText
              text={`${massG} g`}
              x={width / 2 - 16}
              y={height / 2 - 6}
              fontSize={11}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
          </Group>
        );
      }

      case 'helical-spring-stand': {
        const k = Number(object.properties.springConstantNpm ?? 25.0);
        const extMm = Number(object.state.extensionMm ?? 58.8);
        const forceN = Number(object.state.appliedForceN ?? 1.47);
        const isPlastic = object.state.isPlasticDeformation === true;

        // Dynamic coil extension scaling
        const baseSpringY = 70;
        const stretchedLen = 110 + extMm * 1.2;
        const numCoils = 14;
        const coilStep = stretchedLen / numCoils;

        // Build zig-zag spring line points
        const springPoints: number[] = [width / 2 - 20, baseSpringY];
        for (let i = 0; i < numCoils; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          springPoints.push(width / 2 - 20 + side * 14, baseSpringY + (i + 0.5) * coilStep);
        }
        springPoints.push(width / 2 - 20, baseSpringY + stretchedLen);

        const pointerY = baseSpringY + stretchedLen;

        return (
          <Group>
            {/* Cast Iron Stand Base & Rod */}
            <Rect
              x={width / 2 - 70}
              y={height - 25}
              width={140}
              height={20}
              fill="#334155"
              stroke={isSelected ? '#38bdf8' : '#1e293b'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={4}
            />
            <Line points={[width / 2 - 50, 40, width / 2 - 50, height - 25]} stroke="#64748b" strokeWidth={8} />
            {/* Top Suspension Arm */}
            <Line points={[width / 2 - 50, 50, width / 2 - 20, 50]} stroke="#64748b" strokeWidth={6} />
            <Circle x={width / 2 - 20} y={55} radius={4} fill="#0284c7" />

            {/* Vertical Anti-Parallax Mirror Millimeter Scale */}
            <Rect
              x={width / 2 + 10}
              y={60}
              width={45}
              height={height - 100}
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth={1.5}
            />
            {/* Mirror reflective stripe in middle */}
            <Rect
              x={width / 2 + 15}
              y={65}
              width={8}
              height={height - 110}
              fill="#e2e8f0"
            />
            {/* Graduation lines */}
            {Array.from({ length: 9 }).map((_, idx) => (
              <Group key={`spring-scale-${idx}`}>
                <Line
                  points={[width / 2 + 25, 75 + idx * 35, width / 2 + 45, 75 + idx * 35]}
                  stroke="#475569"
                  strokeWidth={1}
                />
                <KonvaText
                  text={`${idx * 2}cm`}
                  x={width / 2 + 26}
                  y={75 + idx * 35 - 10}
                  fontSize={8}
                  fontFamily="sans-serif"
                  fill="#64748b"
                />
              </Group>
            ))}

            {/* Dynamic Coiled Steel Spring */}
            <Line
              points={springPoints}
              stroke={isPlastic ? '#dc2626' : '#0284c7'}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
            />

            {/* Bright Red Index Pointer Needle */}
            <Line
              points={[width / 2 - 20, pointerY, width / 2 + 35, pointerY]}
              stroke="#ef4444"
              strokeWidth={2.5}
            />
            <Circle x={width / 2 + 35} y={pointerY} radius={3.5} fill="#ef4444" />

            {/* Suspended Hook and Load */}
            <Circle x={width / 2 - 20} y={pointerY + 8} radius={5} fill="#ffffff" stroke="#0284c7" strokeWidth={2} />
            <Rect
              x={width / 2 - 38}
              y={pointerY + 14}
              width={36}
              height={24}
              fill="#ca8a04"
              stroke="#713f12"
              strokeWidth={1.5}
              cornerRadius={3}
            />
            <KonvaText
              text={`${forceN.toFixed(2)}N`}
              x={width / 2 - 34}
              y={pointerY + 20}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />

            {/* Header Telemetry Badge */}
            <Rect
              x={10}
              y={10}
              width={240}
              height={26}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
              cornerRadius={6}
            />
            <KonvaText
              text={`HOOKE'S LAW | x = ${extMm.toFixed(1)} mm | k = ${k} N/m`}
              x={18}
              y={17}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0369a1"
            />
          </Group>
        );
      }

      case 'slotted-weight-hanger': {
        const discs = Number(object.properties.discsCount ?? 2);
        const massG = 50 + discs * 50;

        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />
            <Circle x={width / 2} y={16} radius={5} fill="#ffffff" stroke="#475569" strokeWidth={2} />
            <Line points={[width / 2, 21, width / 2, height - 25]} stroke="#94a3b8" strokeWidth={3} />
            <Rect x={width / 2 - 22} y={height - 30} width={44} height={6} fill="#d97706" stroke="#78350f" strokeWidth={1} />
            {Array.from({ length: Math.min(discs, 6) }).map((_, idx) => (
              <Rect
                key={`disc-${idx}`}
                x={width / 2 - 20}
                y={height - 38 - idx * 8}
                width={40}
                height={7}
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth={1}
                cornerRadius={1}
              />
            ))}
            <KonvaText
              text={`${massG} g`}
              x={width / 2 - 14}
              y={height - 16}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#475569"
            />
          </Group>
        );
      }

      case 'boyle-cylinder': {
        const volumeMl = Number(object.properties.volumeMl ?? 60.0);
        const pressureKpa = Number(object.state.pressureKpa ?? 101.3);
        const pressureAtm = Number(object.state.pressureAtm ?? 1.0);
        const pvProduct = Number(object.state.pvProductKpaMl ?? 6079.5);

        // Map volume (15 to 120 mL) to piston X position (inside 220px chamber)
        const chamberX = 35;
        const chamberY = 70;
        const chamberW = 240;
        const chamberH = 160;

        const minVol = 15;
        const maxVol = 120;
        const pistonTravelFraction = (volumeMl - minVol) / (maxVol - minVol);
        const pistonX = chamberX + 30 + pistonTravelFraction * (chamberW - 60);

        // Dial gauge needle angle (-135 deg to +135 deg for 0 to 300 kPa)
        const dialGaugeX = width - 85;
        const dialGaugeY = 120;
        const dialRadius = 50;
        const gaugeFraction = Math.min(1.0, Math.max(0.0, pressureKpa / 300.0));
        const needleAngleRad = ((-135 + gaugeFraction * 270) * Math.PI) / 180;
        const needleTipX = dialGaugeX + (dialRadius - 12) * Math.cos(needleAngleRad);
        const needleTipY = dialGaugeY + (dialRadius - 12) * Math.sin(needleAngleRad);

        return (
          <Group>
            {/* Outer Apparatus Bench Panel */}
            <Rect
              width={width}
              height={height}
              fill="#f8fafc"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={12}
              shadowColor="#0f172a"
              shadowBlur={8}
              shadowOpacity={0.08}
            />

            {/* Heavy Borosilicate Glass Cylinder Body */}
            <Rect
              x={chamberX}
              y={chamberY}
              width={chamberW}
              height={chamberH}
              fill="#ffffff"
              stroke="#334155"
              strokeWidth={3}
              cornerRadius={4}
            />

            {/* Enclosed Compressed Gas Volume (Cyan soft tint) */}
            <Rect
              x={chamberX + 2}
              y={chamberY + 2}
              width={Math.max(4, pistonX - chamberX - 2)}
              height={chamberH - 4}
              fill="#e0f2fe"
            />

            {/* Volumetric Graduations on Glass Cylinder */}
            {[20, 40, 60, 80, 100, 120].map((v) => {
              const vX = chamberX + 30 + ((v - minVol) / (maxVol - minVol)) * (chamberW - 60);
              return (
                <Group key={`vol-tick-${v}`}>
                  <Line points={[vX, chamberY + chamberH - 15, vX, chamberY + chamberH]} stroke="#64748b" strokeWidth={1.5} />
                  <KonvaText
                    text={`${v}`}
                    x={vX - 8}
                    y={chamberY + chamberH - 28}
                    fontSize={8.5}
                    fontFamily="sans-serif"
                    fill="#475569"
                  />
                </Group>
              );
            })}
            <KonvaText text="mL" x={chamberX + chamberW - 25} y={chamberY + chamberH - 28} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#0369a1" />

            {/* Moveable Airtight Piston Head */}
            <Rect
              x={pistonX}
              y={chamberY + 4}
              width={16}
              height={chamberH - 8}
              fill="#475569"
              stroke="#1e293b"
              strokeWidth={2}
              cornerRadius={2}
            />
            {/* Rubber O-Ring Seals */}
            <Rect x={pistonX + 3} y={chamberY + 6} width={3} height={chamberH - 12} fill="#0f172a" />
            <Rect x={pistonX + 10} y={chamberY + 6} width={3} height={chamberH - 12} fill="#0f172a" />

            {/* Piston Connecting Shaft & Handle */}
            <Line points={[pistonX + 16, chamberY + chamberH / 2, chamberX + chamberW + 35, chamberY + chamberH / 2]} stroke="#94a3b8" strokeWidth={8} />
            <Rect
              x={chamberX + chamberW + 35}
              y={chamberY + chamberH / 2 - 25}
              width={12}
              height={50}
              fill="#334155"
              stroke="#0f172a"
              strokeWidth={2}
              cornerRadius={3}
            />

            {/* Connecting Pressure Tube to Gauge */}
            <Line
              points={[chamberX + 20, chamberY, chamberX + 20, chamberY - 25, dialGaugeX, chamberY - 25, dialGaugeX, dialGaugeY - dialRadius]}
              stroke="#0284c7"
              strokeWidth={3}
            />

            {/* Dial Pressure Gauge */}
            <Circle
              x={dialGaugeX}
              y={dialGaugeY}
              radius={dialRadius}
              fill="#ffffff"
              stroke="#334155"
              strokeWidth={3}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.15}
            />
            <Circle x={dialGaugeX} y={dialGaugeY} radius={dialRadius - 6} stroke="#e2e8f0" strokeWidth={1} />
            <Circle x={dialGaugeX} y={dialGaugeY} radius={5} fill="#0f172a" />

            {/* Dial Scale Tick Labels (0, 100, 200, 300 kPa) */}
            <KonvaText text="0" x={dialGaugeX - 32} y={dialGaugeY + 15} fontSize={7.5} fontFamily="sans-serif" fill="#64748b" />
            <KonvaText text="100" x={dialGaugeX - 35} y={dialGaugeY - 25} fontSize={7.5} fontFamily="sans-serif" fill="#64748b" />
            <KonvaText text="200" x={dialGaugeX + 12} y={dialGaugeY - 25} fontSize={7.5} fontFamily="sans-serif" fill="#64748b" />
            <KonvaText text="300" x={dialGaugeX + 18} y={dialGaugeY + 15} fontSize={7.5} fontFamily="sans-serif" fill="#64748b" />
            <KonvaText text="kPa" x={dialGaugeX - 9} y={dialGaugeY + 22} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#0284c7" />

            {/* Rotating Gauge Needle */}
            <Line
              points={[dialGaugeX, dialGaugeY, needleTipX, needleTipY]}
              stroke="#ef4444"
              strokeWidth={2.5}
              lineCap="round"
            />

            {/* Digital Readout Pill */}
            <Rect
              x={chamberX}
              y={height - 55}
              width={width - 70}
              height={36}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth={1}
              cornerRadius={8}
            />
            <KonvaText
              text={`V = ${volumeMl.toFixed(1)} mL   |   P = ${pressureKpa.toFixed(1)} kPa (${pressureAtm.toFixed(2)} atm)   |   P · V = ${pvProduct.toFixed(0)} kPa·mL`}
              x={chamberX + 12}
              y={height - 43}
              fontSize={10.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#047857"
            />

            {/* Title Badge */}
            <KonvaText
              text="BOYLE'S LAW ISOTHERMAL GAS CHAMBER"
              x={chamberX}
              y={25}
              fontSize={10.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#1e293b"
            />
          </Group>
        );
      }

      case 'resistance-wire-board': {
        const material = String(object.properties.material ?? 'Constantan');
        const lengthCm = Number(object.properties.wireLengthCm ?? object.properties.lengthCm ?? 100.0);
        const diameterMm = Number(object.properties.wireDiameterMm ?? object.properties.diameterMm ?? 0.5);
        const appliedV = Number(object.properties.appliedVoltage ?? 2.0);
        const rVal = Number(object.state.resistanceOhms ?? 2.5);
        const iVal = Number(object.state.currentAmps ?? 0.8);
        const rhoVal = Number(object.state.resistivityOhmMetre ?? 4.9e-7);

        const wireColor =
          material.toLowerCase().includes('copper')
            ? '#ea580c'
            : material.toLowerCase().includes('nichrome')
              ? '#94a3b8'
              : '#b45309';

        return (
          <Group>
            {/* Wooden Base Board */}
            <Rect
              width={width}
              height={height}
              fill="#fef3c7"
              stroke={isSelected ? '#38bdf8' : '#b45309'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={10}
              shadowColor="#78350f"
              shadowBlur={6}
              shadowOpacity={0.12}
            />

            {/* Header / Title */}
            <KonvaText
              text="SPECIMEN RESISTANCE WIRE BOARD & SCALE"
              x={16}
              y={14}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#78350f"
            />
            <KonvaText
              text={`Material: ${material.toUpperCase()}`}
              x={width - 150}
              y={14}
              fontSize={9.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#b45309"
            />

            {/* Calibrated Millimetre Metre Ruler */}
            <Rect
              x={35}
              y={75}
              width={width - 70}
              height={30}
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth={1.5}
              cornerRadius={3}
            />
            {[0, 20, 40, 60, 80, 100].map((cmVal) => {
              const xPos = 35 + (cmVal / 100.0) * (width - 70);
              return (
                <Group key={`ruler-mark-${cmVal}`}>
                  <Line points={[xPos, 75, xPos, 88]} stroke="#713f12" strokeWidth={1.5} />
                  <KonvaText
                    text={`${cmVal}`}
                    x={xPos - 6}
                    y={92}
                    fontSize={8.5}
                    fontFamily="sans-serif"
                    fill="#713f12"
                  />
                </Group>
              );
            })}
            <KonvaText text="cm" x={width - 30} y={92} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#713f12" />

            {/* Brass Binding Terminals */}
            <Rect x={18} y={55} width={16} height={40} fill="#d97706" stroke="#92400e" strokeWidth={1.5} cornerRadius={3} />
            <Circle x={26} y={75} radius={4} fill="#451a03" />
            <KonvaText text="A (+)" x={14} y={100} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#ef4444" />

            <Rect x={width - 34} y={55} width={16} height={40} fill="#d97706" stroke="#92400e" strokeWidth={1.5} cornerRadius={3} />
            <Circle x={width - 26} y={75} radius={4} fill="#451a03" />
            <KonvaText text="B (-)" x={width - 38} y={100} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#1e293b" />

            {/* Specimen Wire Stretched Between Terminals */}
            <Line
              points={[26, 75, width - 26, 75]}
              stroke={wireColor}
              strokeWidth={Math.max(2, diameterMm * 4)}
              lineCap="round"
            />

            {/* Screw Gauge Dimension Badge */}
            <Rect
              x={35}
              y={38}
              width={width - 70}
              height={26}
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth={1}
              cornerRadius={6}
            />
            <KonvaText
              text={`Screw Gauge: d = ${diameterMm.toFixed(2)} mm  |  A = πd²/4 = ${(Math.PI * Math.pow(diameterMm * 1e-3, 2) / 4).toExponential(3)} m²  |  Active L = ${lengthCm.toFixed(1)} cm`}
              x={45}
              y={45}
              fontSize={9}
              fontFamily="sans-serif"
              fill="#334155"
            />

            {/* Live Readout Telemetry Strip */}
            <Rect
              x={20}
              y={height - 50}
              width={width - 40}
              height={36}
              fill="#ffffff"
              stroke="#f59e0b"
              strokeWidth={1}
              cornerRadius={6}
            />
            <KonvaText
              text={`V = ${appliedV.toFixed(1)} V   |   I = ${iVal.toFixed(3)} A   |   R = V/I = ${rVal.toFixed(2)} Ω   |   ρ = R·A/L = ${rhoVal.toExponential(3)} Ω·m`}
              x={30}
              y={height - 38}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#b45309"
            />
          </Group>
        );
      }

      case 'metre-bridge-board': {
        const rKnown = Number(object.properties.knownResistanceR ?? 5.0);
        const xUnknown = Number(object.properties.unknownResistanceX ?? 5.0);
        const jockeyPos = Number(object.properties.jockeyPositionCm ?? 50.0);
        const calcX = Number(object.state.calculatedResistanceX ?? 5.0);
        const isBalanced = Boolean(object.state.isBalanced);
        const defl = Number(object.state.galvanometerDeflectionDivisions ?? 0.0);

        const wireStartX = 55;
        const wireEndX = width - 55;
        const wireLengthPx = wireEndX - wireStartX;
        const jockeyX = wireStartX + (jockeyPos / 100.0) * wireLengthPx;
        const wireY = 145;

        return (
          <Group>
            {/* Wooden Base Board (Polished Teak) */}
            <Rect
              width={width}
              height={height}
              fill="#78350f"
              stroke={isSelected ? '#38bdf8' : '#451a03'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={10}
              shadowColor="#0f172a"
              shadowBlur={8}
              shadowOpacity={0.2}
            />
            {/* Inner Inlay */}
            <Rect
              x={10}
              y={10}
              width={width - 20}
              height={height - 20}
              fill="#fef3c7"
              cornerRadius={6}
            />

            {/* Header */}
            <KonvaText
              text="METRE BRIDGE APPARATUS (100 cm WIRE)"
              x={22}
              y={18}
              fontSize={10.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#78350f"
            />

            {/* Heavy Brass Strips (L-shape left, inverted L right, central I strip) */}
            {/* Left Brass Strip */}
            <Rect x={30} y={40} width={25} height={120} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} cornerRadius={2} />
            <Rect x={30} y={40} width={90} height={20} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} cornerRadius={2} />

            {/* Central Brass Strip */}
            <Rect x={155} y={40} width={width - 310} height={20} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} cornerRadius={2} />
            {/* Central Terminal D for Galvanometer */}
            <Circle x={width / 2} y={50} radius={6} fill="#1e293b" stroke="#f59e0b" strokeWidth={2} />
            <KonvaText text="Terminal D (To Galvanometer)" x={width / 2 - 65} y={24} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#0369a1" />

            {/* Right Brass Strip */}
            <Rect x={width - 55} y={40} width={25} height={120} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} cornerRadius={2} />
            <Rect x={width - 120} y={40} width={90} height={20} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} cornerRadius={2} />

            {/* Left Gap (Known Resistance Box R) */}
            <Rect x={122} y={36} width={30} height={28} fill="#ffffff" stroke="#b45309" strokeWidth={1} cornerRadius={4} />
            <KonvaText text="GAP 1" x={124} y={39} fontSize={7} fontFamily="sans-serif" fill="#64748b" />
            <KonvaText text={`R=${rKnown.toFixed(1)}Ω`} x={123} y={49} fontSize={7.5} fontFamily="sans-serif" fontStyle="bold" fill="#b45309" />

            {/* Right Gap (Unknown Resistance X) */}
            <Rect x={width - 152} y={36} width={30} height={28} fill="#ffffff" stroke="#b45309" strokeWidth={1} cornerRadius={4} />
            <KonvaText text="GAP 2" x={width - 150} y={39} fontSize={7} fontFamily="sans-serif" fill="#64748b" />
            <KonvaText text={`X=${xUnknown.toFixed(1)}Ω`} x={width - 151} y={49} fontSize={7.5} fontFamily="sans-serif" fontStyle="bold" fill="#0369a1" />

            {/* Metre Wire Scale */}
            <Rect x={wireStartX - 5} y={wireY - 8} width={wireLengthPx + 10} height={24} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} cornerRadius={2} />
            {[0, 25, 50, 75, 100].map((tick) => {
              const xPos = wireStartX + (tick / 100.0) * wireLengthPx;
              return (
                <Group key={`mb-tick-${tick}`}>
                  <Line points={[xPos, wireY - 8, xPos, wireY]} stroke="#713f12" strokeWidth={1} />
                  <KonvaText text={`${tick}`} x={xPos - 5} y={wireY + 4} fontSize={8} fontFamily="sans-serif" fill="#713f12" />
                </Group>
              );
            })}

            {/* Manganin Wire (100 cm) */}
            <Line points={[wireStartX, wireY - 4, wireEndX, wireY - 4]} stroke="#b45309" strokeWidth={2.5} lineCap="round" />

            {/* Sliding Jockey Cursor */}
            <Group x={jockeyX} y={wireY - 4}>
              <Line points={[0, -22, 0, 0]} stroke="#0f172a" strokeWidth={2.5} />
              <Rect x={-10} y={-35} width={20} height={14} fill="#f59e0b" stroke="#78350f" strokeWidth={1} cornerRadius={2} />
              <KonvaText text="J" x={-4} y={-34} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#78350f" />
              <Circle x={0} y={0} radius={3.5} fill="#ef4444" />
            </Group>

            {/* Battery End Binding Posts */}
            <Circle x={42} y={145} radius={6} fill="#ef4444" />
            <KonvaText text="A (+)" x={34} y={155} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#ef4444" />
            <Circle x={width - 42} y={145} radius={6} fill="#1e293b" />
            <KonvaText text="B (-)" x={width - 50} y={155} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#1e293b" />

            {/* Status Telemetry Pill */}
            <Rect
              x={25}
              y={height - 48}
              width={width - 50}
              height={32}
              fill="#ffffff"
              stroke={isBalanced ? '#10b981' : '#f59e0b'}
              strokeWidth={1.5}
              cornerRadius={6}
            />
            <KonvaText
              text={
                isBalanced
                  ? `BALANCED NULL POINT! l = ${jockeyPos.toFixed(1)} cm  |  100 - l = ${(100 - jockeyPos).toFixed(1)} cm  |  X = R·(100-l)/l = ${calcX.toFixed(2)} Ω`
                  : `Jockey l = ${jockeyPos.toFixed(1)} cm  |  Deflection = ${defl.toFixed(1)} div  |  Estimated X = ${calcX.toFixed(2)} Ω (Slide to 0 deflection)`
              }
              x={35}
              y={height - 38}
              fontSize={9.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isBalanced ? '#047857' : '#b45309'}
            />
          </Group>
        );
      }

      case 'moving-coil-galvanometer': {
        const coilG = Number(object.properties.coilResistanceG ?? 100.0);
        const deflDiv = Number(object.state.deflectionDivisions ?? 0.0); // -30 to +30

        const centerX = width / 2;
        const centerY = height / 2 - 12;
        const meterRadius = Math.min(width, height) / 2 - 16;

        // Pointer rotation: -30 div = -135 deg, 0 div = -90 deg (straight up), +30 div = -45 deg
        const needleAngleDeg = -90 + (deflDiv / 30.0) * 45;
        const needleAngleRad = (needleAngleDeg * Math.PI) / 180;
        const needleLen = meterRadius - 16;
        const needleTipX = centerX + needleLen * Math.cos(needleAngleRad);
        const needleTipY = centerY + needleLen * Math.sin(needleAngleRad);

        return (
          <Group>
            {/* Outer Instrument Case (Classic Round Metal Housing) */}
            <Rect
              width={width}
              height={height}
              fill="#0f172a"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={12}
              shadowColor="#000000"
              shadowBlur={8}
              shadowOpacity={0.25}
            />

            {/* Circular Dial Bezel */}
            <Circle x={centerX} y={centerY} radius={meterRadius + 4} fill="#1e293b" stroke="#475569" strokeWidth={2} />
            <Circle x={centerX} y={centerY} radius={meterRadius} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} />

            {/* Mirrored Arc to Avoid Parallax */}
            <Circle x={centerX} y={centerY} radius={meterRadius - 22} stroke="#cbd5e1" strokeWidth={4} />

            {/* Scale Ticks: 30 - 20 - 10 - 0 - 10 - 20 - 30 */}
            {[-30, -20, -10, 0, 10, 20, 30].map((divVal) => {
              const aDeg = -90 + (divVal / 30.0) * 45;
              const aRad = (aDeg * Math.PI) / 180;
              const rInner = meterRadius - 18;
              const rOuter = meterRadius - 8;
              const x1 = centerX + rInner * Math.cos(aRad);
              const y1 = centerY + rInner * Math.sin(aRad);
              const x2 = centerX + rOuter * Math.cos(aRad);
              const y2 = centerY + rOuter * Math.sin(aRad);
              const labelX = centerX + (meterRadius - 28) * Math.cos(aRad) - 5;
              const labelY = centerY + (meterRadius - 28) * Math.sin(aRad) - 4;

              return (
                <Group key={`galv-tick-${divVal}`}>
                  <Line points={[x1, y1, x2, y2]} stroke={divVal === 0 ? '#ef4444' : '#1e293b'} strokeWidth={divVal === 0 ? 2 : 1.2} />
                  <KonvaText
                    text={`${Math.abs(divVal)}`}
                    x={labelX}
                    y={labelY}
                    fontSize={7.5}
                    fontFamily="sans-serif"
                    fontStyle={divVal === 0 ? 'bold' : 'normal'}
                    fill={divVal === 0 ? '#ef4444' : '#334155'}
                  />
                </Group>
              );
            })}

            {/* Galvanometer 'G' Symbol */}
            <Circle x={centerX} y={centerY + 20} radius={11} fill="#e2e8f0" stroke="#64748b" strokeWidth={1} />
            <KonvaText text="G" x={centerX - 5} y={centerY + 13} fontSize={12} fontFamily="sans-serif" fontStyle="bold" fill="#0369a1" />

            {/* Rotating Aluminum Pointer Needle */}
            <Line
              points={[centerX, centerY + 8, needleTipX, needleTipY]}
              stroke="#ef4444"
              strokeWidth={2}
              lineCap="round"
            />
            {/* Pivot Center Hub */}
            <Circle x={centerX} y={centerY + 8} radius={5} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1.5} />

            {/* Binding Terminals */}
            <Circle x={centerX - 45} y={height - 24} radius={6} fill="#ef4444" />
            <KonvaText text="(+) " x={centerX - 65} y={height - 28} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#ef4444" />

            <Circle x={centerX + 45} y={height - 24} radius={6} fill="#1e293b" stroke="#64748b" strokeWidth={1} />
            <KonvaText text="(-)" x={centerX + 55} y={height - 28} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#94a3b8" />

            {/* Telemetry Readout */}
            <KonvaText
              text={`θ = ${deflDiv.toFixed(1)} div  |  G = ${coilG.toFixed(0)} Ω`}
              x={centerX - 50}
              y={height - 14}
              fontSize={8.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />
          </Group>
        );
      }

      case 'decade-resistance-box': {
        const resistance = Number(object.properties.resistance ?? 15.0);

        return (
          <Group>
            {/* Teak Wooden Box Base */}
            <Rect
              width={width}
              height={height}
              fill="#451a03"
              stroke={isSelected ? '#38bdf8' : '#290e02'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={8}
              shadowColor="#000000"
              shadowBlur={6}
              shadowOpacity={0.2}
            />

            {/* Top Insulating Brass Panel */}
            <Rect
              x={8}
              y={8}
              width={width - 16}
              height={height - 16}
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth={1.5}
              cornerRadius={4}
            />

            {/* Header */}
            <KonvaText
              text="PRECISION RESISTANCE BOX"
              x={16}
              y={14}
              fontSize={8.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#78350f"
            />

            {/* Brass Blocks & Plugs Simulation Grid */}
            {[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].slice(0, 8).map((val, idx) => {
              const col = idx % 4;
              const row = Math.floor(idx / 4);
              const bX = 20 + col * ((width - 50) / 4);
              const bY = 32 + row * 34;
              return (
                <Group key={`rbox-plug-${idx}`}>
                  <Rect x={bX} y={bY} width={28} height={18} fill="#d97706" stroke="#92400e" strokeWidth={1} cornerRadius={2} />
                  <Circle x={bX + 14} y={bY + 9} radius={4} fill="#451a03" />
                  <KonvaText text={`${val}`} x={bX + 8} y={bY + 20} fontSize={7.5} fontFamily="sans-serif" fill="#78350f" />
                </Group>
              );
            })}

            {/* Terminals */}
            <Circle x={25} y={height - 20} radius={5} fill="#ef4444" />
            <Circle x={width - 25} y={height - 20} radius={5} fill="#1e293b" />

            {/* Total Resistance Digital Badge */}
            <Rect
              x={width / 2 - 45}
              y={height - 28}
              width={90}
              height={18}
              fill="#ffffff"
              stroke="#b45309"
              strokeWidth={1}
              cornerRadius={4}
            />
            <KonvaText
              text={`R = ${resistance.toFixed(1)} Ω`}
              x={width / 2 - 38}
              y={height - 24}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#b45309"
            />
          </Group>
        );
      }

      case 'ammeter-voltmeter-calibrator': {
        const mode = String(object.properties.conversionMode ?? 'voltmeter');
        const range = Number(object.properties.targetFullScaleRange ?? 3.0);
        const installedR = Number(
          object.properties.installedResistorValue ?? (mode === 'voltmeter' ? 4900 : 0.02)
        );
        const testSignal = Number(object.properties.appliedTestSignal ?? 1.5);
        const isOverload = Boolean(object.state.isOverload);
        const defl = Number(object.state.scaleDeflectionDivisions ?? 15.0);

        return (
          <Group>
            {/* Benchtop Chassis */}
            <Rect
              width={width}
              height={height}
              fill="#0f172a"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={12}
              shadowColor="#000000"
              shadowBlur={8}
              shadowOpacity={0.25}
            />

            {/* Header Banner */}
            <KonvaText
              text={mode === 'voltmeter' ? 'GALVANOMETER → VOLTMETER CALIBRATION BENCH' : 'GALVANOMETER → AMMETER CALIBRATION BENCH'}
              x={16}
              y={14}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />

            {/* Digital Backlit LCD Panel */}
            <Rect
              x={20}
              y={38}
              width={width - 40}
              height={85}
              fill="#022c22"
              stroke="#059669"
              strokeWidth={1.5}
              cornerRadius={8}
            />
            <KonvaText
              text={mode === 'voltmeter' ? 'REFERENCE DC VOLTAGE' : 'REFERENCE DC CURRENT'}
              x={32}
              y={46}
              fontSize={8.5}
              fontFamily="sans-serif"
              fill="#34d399"
            />
            <KonvaText
              text={`${testSignal.toFixed(3)} ${mode === 'voltmeter' ? 'V' : 'A'}`}
              x={32}
              y={62}
              fontSize={26}
              fontFamily="monospace"
              fontStyle="bold"
              fill="#10b981"
            />
            <KonvaText
              text={`Target Range: 0 to ${range.toFixed(1)} ${mode === 'voltmeter' ? 'V' : 'A'}  |  Pointer: ${defl.toFixed(1)} / 30 div`}
              x={32}
              y={102}
              fontSize={9}
              fontFamily="sans-serif"
              fill="#6ee7b7"
            />

            {/* Resistor Multiplier / Shunt Bay */}
            <Rect
              x={20}
              y={135}
              width={width - 40}
              height={55}
              fill="#1e293b"
              stroke="#475569"
              strokeWidth={1}
              cornerRadius={6}
            />
            <KonvaText
              text={
                mode === 'voltmeter'
                  ? `Series Multiplier Resistor (Rs):  ${installedR.toFixed(1)} Ω`
                  : `Parallel Shunt Resistor (S):  ${installedR.toFixed(5)} Ω`
              }
              x={32}
              y={145}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#f8fafc"
            />
            <KonvaText
              text={
                mode === 'voltmeter'
                  ? `Formula: Rs = (V / Ig) - G  =  (${range.toFixed(1)}V / 600µA) - 100Ω`
                  : `Formula: S = (Ig·G) / (I - Ig)  =  (600µA × 100Ω) / (${range.toFixed(1)}A - 600µA)`
              }
              x={32}
              y={165}
              fontSize={8.5}
              fontFamily="sans-serif"
              fill="#94a3b8"
            />

            {/* Status / Warning Pill */}
            <Rect
              x={20}
              y={height - 55}
              width={width - 40}
              height={36}
              fill={isOverload ? '#450a0a' : '#042f2e'}
              stroke={isOverload ? '#ef4444' : '#14b8a6'}
              strokeWidth={1.5}
              cornerRadius={6}
            />
            <KonvaText
              text={
                isOverload
                  ? `⚠️ OVERLOAD! Test signal (${testSignal.toFixed(2)}) exceeds maximum range (${range.toFixed(1)})`
                  : `✓ METER CONVERTED & CALIBRATED OK  (Deflection: ${defl.toFixed(1)} div = ${testSignal.toFixed(2)} ${mode === 'voltmeter' ? 'V' : 'A'})`
              }
              x={32}
              y={height - 43}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isOverload ? '#f87171' : '#2dd4bf'}
            />
          </Group>
        );
      }

      case 'concave-mirror': {
        const f = Number(object.properties.focalLength ?? 15.0);
        const u = Number(object.properties.objectDistance ?? 30.0);
        const ho = Number(object.properties.objectHeight ?? 4.0);
        const v = Number(object.state.imageDistanceCm ?? (u > f ? -((u * f) / (u - f)) : 999));
        const m = Number(object.state.linearMagnification ?? (v / u));
        const hi = Number(object.state.imageHeightCm ?? (m * ho));
        const isVirtual = u < f;
        const isAtInf = Math.abs(u - f) < 0.2;

        const mirrorX = width - 70;
        const axisY = 135;
        const scale = 2.4;

        const objX = Math.max(30, mirrorX - u * scale);
        const objY = axisY - ho * 7;
        const fX = mirrorX - f * scale;
        const cX = mirrorX - 2 * f * scale;

        const imgX = isAtInf ? 20 : isVirtual ? mirrorX + Math.abs(v) * scale : mirrorX - Math.abs(v) * scale;
        const imgY = axisY - hi * 7;

        return (
          <Group>
            {/* Dark Bench Housing */}
            <Rect
              width={width}
              height={height}
              fill="#090d16"
              stroke={isSelected ? '#38bdf8' : '#1e293b'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={10}
              shadowColor="#0284c7"
              shadowBlur={6}
              shadowOpacity={0.15}
            />

            {/* Bench Header */}
            <KonvaText
              text="CONCAVE SPHERICAL MIRROR OPTICAL BENCH"
              x={16}
              y={12}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />
            <KonvaText
              text={`f = -${f.toFixed(1)} cm | R = -${(2 * f).toFixed(1)} cm`}
              x={width - 150}
              y={12}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />

            {/* Optical Axis */}
            <Line points={[20, axisY, width - 20, axisY]} stroke="#334155" strokeWidth={1.5} dash={[6, 4]} />
            <KonvaText text="Principal Axis" x={24} y={axisY + 4} fontSize={8} fontFamily="sans-serif" fill="#64748b" />

            {/* Concave Mirror Arc (Reflecting towards left) */}
            <Line
              points={[
                mirrorX + 16, axisY - 80,
                mirrorX + 4, axisY - 45,
                mirrorX, axisY,
                mirrorX + 4, axisY + 45,
                mirrorX + 16, axisY + 80,
              ]}
              stroke="#38bdf8"
              strokeWidth={3.5}
              tension={0.3}
              lineCap="round"
            />
            {/* Mirror Silvered Back Hatching */}
            {[-70, -45, -20, 0, 20, 45, 70].map((offsetY, idx) => (
              <Line
                key={`cm-hatch-${idx}`}
                points={[mirrorX + 8, axisY + offsetY - 4, mirrorX + 18, axisY + offsetY + 6]}
                stroke="#64748b"
                strokeWidth={1.5}
              />
            ))}
            <KonvaText text="Pole (P)" x={mirrorX - 10} y={axisY + 8} fontSize={8.5} fontFamily="sans-serif" fill="#38bdf8" />

            {/* Focal Point F and Center of Curvature C */}
            <Circle x={fX} y={axisY} radius={3.5} fill="#f43f5e" />
            <KonvaText text="F" x={fX - 4} y={axisY + 6} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#f43f5e" />
            <Circle x={cX} y={axisY} radius={3.5} fill="#a855f7" />
            <KonvaText text="C (2F)" x={cX - 8} y={axisY + 6} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#a855f7" />

            {/* Object Arrow (Upright Amber) */}
            <Line points={[objX, axisY, objX, objY]} stroke="#f59e0b" strokeWidth={3} lineCap="round" />
            <Line points={[objX - 4, objY + 6, objX, objY, objX + 4, objY + 6]} stroke="#f59e0b" strokeWidth={2.5} />
            <KonvaText text={`Object (u=-${u}cm)`} x={objX - 25} y={objY - 14} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#fbbf24" />

            {/* Image Arrow */}
            {!isAtInf && (
              <Group>
                <Line
                  points={[imgX, axisY, imgX, imgY]}
                  stroke={isVirtual ? '#a855f7' : '#10b981'}
                  strokeWidth={2.5}
                  dash={isVirtual ? [4, 3] : undefined}
                  lineCap="round"
                />
                <Line
                  points={
                    isVirtual
                      ? [imgX - 4, imgY + 5, imgX, imgY, imgX + 4, imgY + 5]
                      : [imgX - 4, imgY - 5, imgX, imgY, imgX + 4, imgY - 5]
                  }
                  stroke={isVirtual ? '#a855f7' : '#10b981'}
                  strokeWidth={2}
                />
                <KonvaText
                  text={`Image (${isVirtual ? 'Virtual' : 'Real'})`}
                  x={imgX - 25}
                  y={imgY > axisY ? imgY + 4 : imgY - 14}
                  fontSize={8}
                  fontFamily="sans-serif"
                  fontStyle="bold"
                  fill={isVirtual ? '#c084fc' : '#34d399'}
                />
              </Group>
            )}

            {/* Principal Rays: Ray 1 (Parallel -> Focus) */}
            <Line points={[objX, objY, mirrorX, objY, fX, axisY, 25, axisY + ((axisY - objY) / (mirrorX - fX)) * (fX - 25)]} stroke="#ef4444" strokeWidth={1.5} opacity={0.7} />
            {isVirtual && (
              <Line points={[mirrorX, objY, imgX, imgY]} stroke="#ef4444" strokeWidth={1.5} dash={[3, 3]} opacity={0.6} />
            )}

            {/* Principal Rays: Ray 2 (Through Pole or Center) */}
            <Line points={[objX, objY, mirrorX, axisY, 25, axisY + (axisY - objY) * ((mirrorX - 25) / (mirrorX - objX))]} stroke="#3b82f6" strokeWidth={1.5} opacity={0.7} />
            {isVirtual && (
              <Line points={[mirrorX, axisY, imgX, imgY]} stroke="#3b82f6" strokeWidth={1.5} dash={[3, 3]} opacity={0.6} />
            )}

            {/* Optical Formula & Telemetry Footer */}
            <Rect x={16} y={height - 48} width={width - 32} height={34} fill="#0f172a" stroke="#1e293b" strokeWidth={1} cornerRadius={6} />
            <KonvaText
              text={
                isAtInf
                  ? '⚠️ OBJECT AT FOCUS: Reflected rays emerge parallel; image formed at infinity.'
                  : `1/f = 1/v + 1/u  =>  v = ${v.toFixed(1)} cm | m = ${m.toFixed(2)} | Image: ${isVirtual ? 'Virtual, Erect' : 'Real, Inverted'}`
              }
              x={26}
              y={height - 38}
              fontSize={9.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isVirtual ? '#c084fc' : '#38bdf8'}
            />
          </Group>
        );
      }

      case 'convex-mirror': {
        const f = Number(object.properties.focalLength ?? 15.0);
        const u = Number(object.properties.objectDistance ?? 30.0);
        const ho = Number(object.properties.objectHeight ?? 4.0);
        const auxF = Number(object.properties.auxiliaryLensFocalLength ?? 15.0);
        const v = Number(object.state.imageDistanceCm ?? ((u * f) / (u + f)));
        const m = Number(object.state.linearMagnification ?? (v / u));
        const hi = Number(object.state.imageHeightCm ?? (m * ho));

        const mirrorX = 220;
        const axisY = 135;
        const scale = 2.4;

        const objX = Math.max(25, mirrorX - u * scale);
        const objY = axisY - ho * 7;
        const fX = mirrorX + f * scale;
        const cX = mirrorX + 2 * f * scale;
        const imgX = mirrorX + v * scale;
        const imgY = axisY - hi * 7;

        return (
          <Group>
            {/* Bench Housing */}
            <Rect
              width={width}
              height={height}
              fill="#090d16"
              stroke={isSelected ? '#38bdf8' : '#0369a1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={10}
              shadowColor="#0369a1"
              shadowBlur={6}
              shadowOpacity={0.15}
            />

            {/* Bench Header */}
            <KonvaText
              text="CONVEX SPHERICAL MIRROR OPTICAL BENCH"
              x={16}
              y={12}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />
            <KonvaText
              text={`f = +${f.toFixed(1)} cm | Auxiliary Convex Lens f = ${auxF.toFixed(1)} cm`}
              x={width - 240}
              y={12}
              fontSize={8.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />

            {/* Optical Axis */}
            <Line points={[20, axisY, width - 20, axisY]} stroke="#334155" strokeWidth={1.5} dash={[6, 4]} />

            {/* Convex Mirror Arc (Bulging towards left) */}
            <Line
              points={[
                mirrorX - 16, axisY - 80,
                mirrorX - 4, axisY - 45,
                mirrorX, axisY,
                mirrorX - 4, axisY + 45,
                mirrorX - 16, axisY + 80,
              ]}
              stroke="#38bdf8"
              strokeWidth={3.5}
              tension={0.3}
              lineCap="round"
            />
            {/* Silvered Interior Hatching (Right face) */}
            {[-70, -45, -20, 0, 20, 45, 70].map((offsetY, idx) => (
              <Line
                key={`cv-hatch-${idx}`}
                points={[mirrorX - 6, axisY + offsetY - 4, mirrorX + 4, axisY + offsetY + 6]}
                stroke="#64748b"
                strokeWidth={1.5}
              />
            ))}
            <KonvaText text="Pole (P)" x={mirrorX - 25} y={axisY + 8} fontSize={8.5} fontFamily="sans-serif" fill="#38bdf8" />

            {/* Virtual Focus F and Center C behind mirror */}
            <Circle x={fX} y={axisY} radius={3.5} fill="#f43f5e" />
            <KonvaText text="Virtual F" x={fX - 12} y={axisY + 6} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#f43f5e" />
            <Circle x={cX} y={axisY} radius={3.5} fill="#a855f7" />
            <KonvaText text="Virtual C" x={cX - 12} y={axisY + 6} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#a855f7" />

            {/* Real Object Arrow */}
            <Line points={[objX, axisY, objX, objY]} stroke="#f59e0b" strokeWidth={3} lineCap="round" />
            <Line points={[objX - 4, objY + 6, objX, objY, objX + 4, objY + 6]} stroke="#f59e0b" strokeWidth={2.5} />
            <KonvaText text={`Object (u=-${u}cm)`} x={objX - 25} y={objY - 14} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#fbbf24" />

            {/* Virtual Diminished Erect Image Arrow behind mirror */}
            <Line points={[imgX, axisY, imgX, imgY]} stroke="#c084fc" strokeWidth={2.5} dash={[3, 2]} lineCap="round" />
            <Line points={[imgX - 3, imgY + 4, imgX, imgY, imgX + 3, imgY + 4]} stroke="#c084fc" strokeWidth={2} />
            <KonvaText text={`Virtual Image (v=+${v.toFixed(1)}cm)`} x={imgX - 20} y={imgY - 14} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#c084fc" />

            {/* Ray 1: Parallel to axis, diverges as if from F */}
            <Line points={[objX, objY, mirrorX, objY, mirrorX - 60, objY - 30]} stroke="#ef4444" strokeWidth={1.5} />
            <Line points={[mirrorX, objY, fX, axisY]} stroke="#ef4444" strokeWidth={1.5} dash={[4, 3]} opacity={0.6} />

            {/* Ray 2: Directed towards C, reflects back */}
            <Line points={[objX, objY, mirrorX, axisY + ((objY - axisY) * (mirrorX - cX)) / (objX - cX)]} stroke="#3b82f6" strokeWidth={1.5} />
            <Line points={[mirrorX, axisY + ((objY - axisY) * (mirrorX - cX)) / (objX - cX), cX, axisY]} stroke="#3b82f6" strokeWidth={1.5} dash={[4, 3]} opacity={0.6} />

            {/* Optical Telemetry Footer */}
            <Rect x={16} y={height - 48} width={width - 32} height={34} fill="#0f172a" stroke="#1e293b" strokeWidth={1} cornerRadius={6} />
            <KonvaText
              text={`Convex Mirror Formula: 1/f = 1/v + 1/u  =>  v = +${v.toFixed(1)} cm,  m = +${m.toFixed(2)} (Virtual, Erect, Diminished)`}
              x={26}
              y={height - 38}
              fontSize={9.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />
          </Group>
        );
      }

      case 'concave-lens': {
        const f = Number(object.properties.focalLength ?? 15.0);
        const u = Number(object.properties.objectDistance ?? 30.0);
        const ho = Number(object.properties.objectHeight ?? 4.0);
        const auxF = Number(object.properties.auxiliaryConvexFocalLength ?? 10.0);
        const v = Number(object.state.imageDistanceCm ?? -((u * f) / (u + f)));
        const m = Number(object.state.linearMagnification ?? (Math.abs(v) / u));
        const hi = Number(object.state.imageHeightCm ?? (m * ho));
        const combF = Number(object.state.combinedFocalLengthCm ?? ((auxF * f) / (f - auxF)));

        const lensX = 220;
        const axisY = 135;
        const scale = 2.4;

        const objX = Math.max(25, lensX - u * scale);
        const objY = axisY - ho * 7;
        const f1X = lensX - f * scale; // Virtual focus on front side
        const f2X = lensX + f * scale;
        const imgX = lensX - Math.abs(v) * scale;
        const imgY = axisY - hi * 7;

        return (
          <Group>
            {/* Bench Housing */}
            <Rect
              width={width}
              height={height}
              fill="#090d16"
              stroke={isSelected ? '#38bdf8' : '#0284c7'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={10}
              shadowColor="#0284c7"
              shadowBlur={6}
              shadowOpacity={0.15}
            />

            {/* Bench Header */}
            <KonvaText
              text="DIVERGING CONCAVE LENS BENCH & AUXILIARY COMBO"
              x={16}
              y={12}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />
            <KonvaText
              text={`f = -${f.toFixed(1)} cm | Aux f = +${auxF.toFixed(1)} cm => Fcomb = ${combF.toFixed(1)} cm`}
              x={width - 260}
              y={12}
              fontSize={8.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />

            {/* Optical Axis */}
            <Line points={[20, axisY, width - 20, axisY]} stroke="#334155" strokeWidth={1.5} dash={[6, 4]} />

            {/* Concave (Hourglass) Lens Profile */}
            <Line
              points={[
                lensX - 10, axisY - 80,
                lensX - 3, axisY - 30,
                lensX - 2, axisY,
                lensX - 3, axisY + 30,
                lensX - 10, axisY + 80,
                lensX + 10, axisY + 80,
                lensX + 3, axisY + 30,
                lensX + 2, axisY,
                lensX + 3, axisY - 30,
                lensX + 10, axisY - 80,
              ]}
              closed
              fill="#0369a1"
              opacity={0.35}
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <KonvaText text="Optical Center O" x={lensX - 26} y={axisY + 8} fontSize={8.5} fontFamily="sans-serif" fill="#38bdf8" />

            {/* Front and Rear Foci */}
            <Circle x={f1X} y={axisY} radius={3.5} fill="#f43f5e" />
            <KonvaText text="F₁" x={f1X - 4} y={axisY + 6} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#f43f5e" />
            <Circle x={f2X} y={axisY} radius={3.5} fill="#f43f5e" />
            <KonvaText text="F₂" x={f2X - 4} y={axisY + 6} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#f43f5e" />

            {/* Object Arrow */}
            <Line points={[objX, axisY, objX, objY]} stroke="#f59e0b" strokeWidth={3} lineCap="round" />
            <Line points={[objX - 4, objY + 6, objX, objY, objX + 4, objY + 6]} stroke="#f59e0b" strokeWidth={2.5} />
            <KonvaText text={`Object (u=-${u}cm)`} x={objX - 25} y={objY - 14} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#fbbf24" />

            {/* Virtual Image Arrow */}
            <Line points={[imgX, axisY, imgX, imgY]} stroke="#c084fc" strokeWidth={2.5} dash={[3, 2]} lineCap="round" />
            <Line points={[imgX - 3, imgY + 4, imgX, imgY, imgX + 3, imgY + 4]} stroke="#c084fc" strokeWidth={2} />
            <KonvaText text={`Virtual Image (v=${v.toFixed(1)}cm)`} x={imgX - 25} y={imgY - 14} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#c084fc" />

            {/* Ray 1: Parallel to axis -> refracts diverging outward as if from F1 */}
            <Line points={[objX, objY, lensX, objY, width - 40, objY - 45]} stroke="#ef4444" strokeWidth={1.5} />
            <Line points={[lensX, objY, f1X, axisY]} stroke="#ef4444" strokeWidth={1.5} dash={[4, 3]} opacity={0.6} />

            {/* Ray 2: Central ray through O undeviated */}
            <Line points={[objX, objY, lensX, axisY, width - 40, axisY + ((axisY - objY) / (lensX - objX)) * (width - 40 - lensX)]} stroke="#3b82f6" strokeWidth={1.5} />

            {/* Telemetry Footer */}
            <Rect x={16} y={height - 48} width={width - 32} height={34} fill="#0f172a" stroke="#1e293b" strokeWidth={1} cornerRadius={6} />
            <KonvaText
              text={`Concave Lens: 1/f = 1/v - 1/u  =>  v = ${v.toFixed(1)} cm,  m = +${m.toFixed(2)} (Virtual, Erect, Diminished)`}
              x={26}
              y={height - 38}
              fontSize={9.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />
          </Group>
        );
      }

      case 'optical-prism': {
        const i1 = Number(object.properties.angleOfIncidence ?? 49.5);
        const aDeg = Number(object.properties.prismAngle ?? 60.0);
        const mu = Number(object.properties.refractiveIndex ?? 1.52);
        const r1 = Number(object.state.firstRefractionAngleDeg ?? 29.3);
        const r2 = Number(object.state.secondIncidentAngleDeg ?? 30.7);
        const eDeg = Number(object.state.angleOfEmergenceDeg ?? 49.5);
        const devDeg = Number(object.state.angleOFDeviationDeg ?? 39.0);
        const dmDeg = Number(object.state.minimumDeviationDeg ?? 39.0);
        const isMinDev = Boolean(object.state.isMinimumDeviation);
        const isTir = Boolean(object.state.isTotalInternalReflection);

        const prismCenterX = width / 2;
        const prismBaseY = height - 70;
        const prismSide = 170;
        const prismHeight = (Math.sqrt(3) / 2) * prismSide;
        const prismTopY = prismBaseY - prismHeight;

        const apexX = prismCenterX;
        const apexY = prismTopY;
        const leftBaseX = prismCenterX - prismSide / 2;
        const rightBaseX = prismCenterX + prismSide / 2;

        // Incident ray hit point on left face (around mid-point)
        const hit1X = (apexX + leftBaseX) / 2;
        const hit1Y = (apexY + prismBaseY) / 2;

        // Emergent ray exit point on right face
        const hit2X = (apexX + rightBaseX) / 2;
        const hit2Y = (apexY + prismBaseY) / 2;

        const sourceX = 35;
        const sourceY = hit1Y - Math.tan((i1 - 30) * (Math.PI / 180)) * (hit1X - sourceX);

        const outX = width - 40;
        const outY = hit2Y + Math.tan((eDeg - 30) * (Math.PI / 180)) * (outX - hit2X);

        return (
          <Group>
            {/* Optical Turntable Board */}
            <Rect
              width={width}
              height={height}
              fill="#090d16"
              stroke={isSelected ? '#38bdf8' : '#7c3aed'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={10}
              shadowColor="#7c3aed"
              shadowBlur={6}
              shadowOpacity={0.15}
            />

            {/* Header */}
            <KonvaText
              text="OPTICAL SPECTROMETER PRISM TABLE"
              x={16}
              y={12}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#a78bfa"
            />
            <KonvaText
              text={`Angle of Prism A = ${aDeg.toFixed(0)}° | Glass Index μ = ${mu.toFixed(2)}`}
              x={width - 240}
              y={12}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />

            {/* Graduated Turntable Circle */}
            <Circle
              x={prismCenterX}
              y={(apexY + prismBaseY) / 2 + 10}
              radius={105}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth={1}
              dash={[3, 5]}
            />

            {/* Equilateral Glass Prism */}
            <Line
              points={[apexX, apexY, rightBaseX, prismBaseY, leftBaseX, prismBaseY]}
              closed
              fill="#c4b5fd"
              opacity={0.3}
              stroke="#a78bfa"
              strokeWidth={2.5}
            />
            <KonvaText text="A" x={apexX - 4} y={apexY - 14} fontSize={9.5} fontFamily="sans-serif" fontStyle="bold" fill="#c4b5fd" />
            <KonvaText text="Glass (μ = 1.52)" x={prismCenterX - 35} y={(apexY + prismBaseY) / 2 + 15} fontSize={8.5} fontFamily="sans-serif" fill="#e2e8f0" />

            {/* Face Normals (Dashed) */}
            <Line points={[hit1X - 25, hit1Y - 45, hit1X + 25, hit1Y + 45]} stroke="#64748b" strokeWidth={1} dash={[3, 3]} />
            <Line points={[hit2X - 25, hit2Y + 45, hit2X + 25, hit2Y - 45]} stroke="#64748b" strokeWidth={1} dash={[3, 3]} />

            {/* Incident Light Beam (Yellow) */}
            <Line points={[sourceX, sourceY, hit1X, hit1Y]} stroke="#facc15" strokeWidth={2.5} lineCap="round" />
            <KonvaText text={`i₁ = ${i1.toFixed(1)}°`} x={sourceX + 10} y={sourceY - 14} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#fde047" />

            {/* Refracted Beam Traversing Inside Prism */}
            <Line points={[hit1X, hit1Y, hit2X, hit2Y]} stroke="#facc15" strokeWidth={2.5} lineCap="round" />
            <KonvaText text={`r₁ = ${r1.toFixed(1)}°`} x={hit1X + 8} y={hit1Y - 10} fontSize={8} fontFamily="sans-serif" fill="#fde047" />
            <KonvaText text={`r₂ = ${r2.toFixed(1)}°`} x={hit2X - 32} y={hit2Y - 10} fontSize={8} fontFamily="sans-serif" fill="#fde047" />

            {/* Emergent Light Beam or Total Internal Reflection */}
            {isTir ? (
              <Group>
                <Line points={[hit2X, hit2Y, prismCenterX, prismBaseY]} stroke="#ef4444" strokeWidth={2.5} />
                <KonvaText text="TIR Reflected" x={hit2X - 10} y={hit2Y + 16} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#f87171" />
              </Group>
            ) : (
              <Group>
                <Line points={[hit2X, hit2Y, outX, outY]} stroke="#facc15" strokeWidth={2.5} lineCap="round" />
                <KonvaText text={`e = ${eDeg.toFixed(1)}°`} x={outX - 45} y={outY - 14} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#fde047" />
                {/* Continuation of incident ray for deviation comparison */}
                <Line points={[hit1X, hit1Y, hit2X + 50, hit1Y + (hit1Y - sourceY) * 0.6]} stroke="#94a3b8" strokeWidth={1} dash={[4, 4]} opacity={0.5} />
              </Group>
            )}

            {/* Status / Minimum Deviation Badge */}
            <Rect
              x={16}
              y={height - 48}
              width={width - 32}
              height={34}
              fill={isTir ? '#450a0a' : isMinDev ? '#064e3b' : '#0f172a'}
              stroke={isTir ? '#ef4444' : isMinDev ? '#10b981' : '#1e293b'}
              strokeWidth={1.5}
              cornerRadius={6}
            />
            <KonvaText
              text={
                isTir
                  ? '⚠️ TOTAL INTERNAL REFLECTION: Angle r₂ exceeds critical angle θc (no emergent ray)!'
                  : isMinDev
                    ? `✓ MINIMUM DEVIATION REACHED: D = Dm = ${devDeg.toFixed(1)}° (i = e = ${i1.toFixed(1)}°, r = A/2 = ${(aDeg / 2).toFixed(1)}°) | μ = ${mu.toFixed(2)}`
                    : `Deviation D = i + e - A = ${devDeg.toFixed(1)}° (Dm = ${dmDeg.toFixed(1)}°) | μ = sin((A+Dm)/2) / sin(A/2)`
              }
              x={26}
              y={height - 38}
              fontSize={9.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isTir ? '#f87171' : isMinDev ? '#34d399' : '#a78bfa'}
            />
          </Group>
        );
      }

      case 'pn-diode-board': {
        const mat = String(object.properties.semiconductorMaterial ?? 'silicon');
        const mode = String(object.properties.biasMode ?? 'forward');
        const vApplied = Number(object.properties.appliedVoltage ?? 1.5);
        const rSeries = Number(object.properties.seriesResistance ?? 100.0);
        const vDiode = Number(object.state.diodeVoltageVolts ?? (mode === 'forward' ? 0.72 : vApplied));
        const currMa = Number(object.state.circuitCurrentMilliAmps ?? (mode === 'forward' ? 7.8 : 0.00015));
        const currUa = Number(object.state.circuitCurrentMicroAmps ?? (mode === 'forward' ? 7800 : 0.15));
        const rDyn = Number(object.state.dynamicResistanceOhms ?? (mode === 'forward' ? 15.0 : 500000));
        const isConducting = Boolean(object.state.isConducting);
        const isBreakdown = Boolean(object.state.isBreakdown);
        const vk = mat === 'silicon' ? 0.7 : 0.3;

        return (
          <Group>
            {/* Electronic Chassis */}
            <Rect
              width={width}
              height={height}
              fill="#090d16"
              stroke={isSelected ? '#38bdf8' : '#0d9488'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={10}
              shadowColor="#0d9488"
              shadowBlur={6}
              shadowOpacity={0.15}
            />

            {/* Header */}
            <KonvaText
              text="P-N JUNCTION SEMICONDUCTOR TEST BENCH"
              x={16}
              y={12}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#2dd4bf"
            />
            {/* Bias Mode Badge */}
            <Rect
              x={width - 165}
              y={10}
              width={145}
              height={20}
              fill={mode === 'forward' ? '#042f2e' : '#450a0a'}
              stroke={mode === 'forward' ? '#14b8a6' : '#f87171'}
              strokeWidth={1}
              cornerRadius={4}
            />
            <KonvaText
              text={mode === 'forward' ? 'FORWARD BIAS (P+, N-)' : 'REVERSE BIAS (P-, N+)'}
              x={width - 158}
              y={14}
              fontSize={8.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={mode === 'forward' ? '#2dd4bf' : '#fca5a5'}
            />

            {/* Schematic Diode Circuit Section (Left side) */}
            <Rect x={20} y={40} width={210} height={170} fill="#0f172a" stroke="#1e293b" strokeWidth={1} cornerRadius={6} />
            <KonvaText text="CIRCUIT SCHEMATIC" x={28} y={48} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#64748b" />

            {/* Wire Loop */}
            <Line points={[45, 115, 80, 115]} stroke="#94a3b8" strokeWidth={2} />
            {/* Diode Symbol: Triangle + Bar */}
            {mode === 'forward' ? (
              <Group>
                {/* Anode (P) on Left, Cathode (N) on Right */}
                <Line points={[80, 95, 80, 135, 115, 115]} closed fill="#14b8a6" stroke="#2dd4bf" strokeWidth={2} />
                <Line points={[115, 95, 115, 135]} stroke="#2dd4bf" strokeWidth={3} lineCap="round" />
                <KonvaText text="P (+)" x={65} y={140} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#2dd4bf" />
                <KonvaText text="N (-)" x={110} y={140} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#f87171" />
              </Group>
            ) : (
              <Group>
                {/* Reverse: Cathode on Left, Anode on Right */}
                <Line points={[115, 95, 115, 135, 80, 115]} closed fill="#f87171" stroke="#ef4444" strokeWidth={2} />
                <Line points={[80, 95, 80, 135]} stroke="#ef4444" strokeWidth={3} lineCap="round" />
                <KonvaText text="N (+)" x={65} y={140} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#f87171" />
                <KonvaText text="P (-)" x={110} y={140} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#2dd4bf" />
              </Group>
            )}
            <Line points={[115, 115, 140, 115]} stroke="#94a3b8" strokeWidth={2} />
            {/* Series Resistor Zig-Zag */}
            <Line points={[140, 115, 145, 108, 153, 122, 161, 108, 169, 122, 177, 108, 182, 115, 205, 115]} stroke="#e2e8f0" strokeWidth={2} />
            <KonvaText text={`Rs = ${rSeries}Ω`} x={145} y={128} fontSize={8} fontFamily="sans-serif" fill="#94a3b8" />

            {/* Material & Knee Info */}
            <KonvaText
              text={`Material: ${mat.toUpperCase()} (Knee Vk = ${vk.toFixed(1)} V)`}
              x={28}
              y={185}
              fontSize={8.5}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#e2e8f0"
            />

            {/* Mini I-V Characteristic Display (Right side) */}
            <Rect x={245} y={40} width={width - 265} height={170} fill="#022c22" stroke="#134e4a" strokeWidth={1} cornerRadius={6} />
            <KonvaText text="I-V CHARACTERISTIC CURVE" x={255} y={48} fontSize={8.5} fontFamily="sans-serif" fontStyle="bold" fill="#2dd4bf" />

            {/* Axes */}
            <Line points={[260, 175, width - 35, 175]} stroke="#065f46" strokeWidth={1.5} />
            <Line points={[285, 55, 285, 190]} stroke="#065f46" strokeWidth={1.5} />
            <KonvaText text="VD (V)" x={width - 65} y={178} fontSize={8} fontFamily="sans-serif" fill="#6ee7b7" />
            <KonvaText text="I" x={270} y={55} fontSize={8} fontFamily="sans-serif" fill="#6ee7b7" />

            {/* Plotted Characteristic Curve */}
            {mode === 'forward' ? (
              <Group>
                {/* Forward exponential curve */}
                <Line
                  points={[
                    285, 175,
                    285 + 25 * vk, 175,
                    285 + 40 * vk, 165,
                    285 + 60 * vk, 130,
                    285 + 85 * vk, 70,
                  ]}
                  stroke="#34d399"
                  strokeWidth={2.5}
                  tension={0.2}
                />
                {/* Operating Point Marker */}
                <Circle
                  x={Math.min(width - 40, 285 + 75 * vDiode)}
                  y={Math.max(65, 175 - currMa * 8)}
                  radius={4.5}
                  fill="#fbbf24"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              </Group>
            ) : (
              <Group>
                {/* Reverse saturation and breakdown line */}
                <Line
                  points={[
                    width - 50, 175,
                    320, 175,
                    310, 176,
                    300, 195,
                  ]}
                  stroke="#f87171"
                  strokeWidth={2.5}
                />
                <Circle
                  x={Math.max(265, width - 50 - (vApplied / 25) * 80)}
                  y={isBreakdown ? 190 : 175}
                  radius={4.5}
                  fill="#fbbf24"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              </Group>
            )}

            {/* Digital Readout Tiles */}
            <Rect x={20} y={220} width={width - 40} height={42} fill="#0f172a" stroke="#1e293b" strokeWidth={1} cornerRadius={6} />
            <KonvaText
              text={`V_applied: ${vApplied.toFixed(2)} V`}
              x={30}
              y={228}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#e2e8f0"
            />
            <KonvaText
              text={`Diode V_D: ${vDiode.toFixed(2)} V`}
              x={135}
              y={228}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#38bdf8"
            />
            <KonvaText
              text={`Current: ${mode === 'forward' ? `${currMa.toFixed(2)} mA` : `${currUa.toFixed(2)} µA`}`}
              x={255}
              y={228}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={mode === 'forward' ? '#34d399' : '#f87171'}
            />
            <KonvaText
              text={`Dynamic rac = ΔV/ΔI: ${rDyn.toFixed(1)} Ω`}
              x={30}
              y={246}
              fontSize={8.5}
              fontFamily="sans-serif"
              fill="#94a3b8"
            />
            <KonvaText
              text={`Knee Voltage: ${vk.toFixed(1)} V (${mat})`}
              x={255}
              y={246}
              fontSize={8.5}
              fontFamily="sans-serif"
              fill="#94a3b8"
            />

            {/* Status Footer */}
            <Rect
              x={20}
              y={height - 46}
              width={width - 40}
              height={32}
              fill={isBreakdown ? '#450a0a' : isConducting ? '#042f2e' : '#0f172a'}
              stroke={isBreakdown ? '#ef4444' : isConducting ? '#10b981' : '#1e293b'}
              strokeWidth={1.5}
              cornerRadius={6}
            />
            <KonvaText
              text={
                isBreakdown
                  ? `⚠️ AVALANCHE BREAKDOWN! V_applied (${vApplied.toFixed(1)} V) >= V_br (25 V) => Sharp reverse current surge!`
                  : isConducting
                    ? `✓ FORWARD CONDUCTION ACTIVE: V_D (${vDiode.toFixed(2)} V) > Knee (${vk} V) => I_F = ${currMa.toFixed(2)} mA`
                    : mode === 'forward'
                      ? `SUB-THRESHOLD: V_D (${vDiode.toFixed(2)} V) < Knee (${vk} V) => Negligible current flow (< 0.1 mA)`
                      : `REVERSE SATURATION: Reverse leakage current I_0 = ${currUa.toFixed(2)} µA (High reverse resistance)`
              }
              x={30}
              y={height - 35}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isBreakdown ? '#fca5a5' : isConducting ? '#34d399' : '#94a3b8'}
            />
          </Group>
        );
      }

      case 'chemical-balance': {
        const displayedMass = Number(object.state.displayedMassGrams ?? object.properties.sampleMassGrams ?? 0);
        const isTared = Number(object.state.tareOffsetGrams ?? object.properties.tareOffsetGrams ?? 0) > 0;
        const dishPlaced = object.properties.watchGlassPlaced !== false;

        return (
          <Group>
            {/* Balance Body Housing */}
            <Rect
              x={5}
              y={25}
              width={width - 10}
              height={height - 30}
              fill="#1e293b"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={10}
              shadowColor="#0f172a"
              shadowBlur={8}
              shadowOpacity={0.2}
            />

            {/* Weighing Pan Support Column & Stainless Steel Pan */}
            <Rect x={width / 2 - 12} y={15} width={24} height={15} fill="#64748b" />
            <Rect
              x={width / 2 - 50}
              y={8}
              width={100}
              height={10}
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth={1}
              cornerRadius={4}
            />

            {/* Watch Glass / Weighing Dish */}
            {dishPlaced && (
              <Line
                points={[
                  width / 2 - 35, 8,
                  width / 2 - 25, 4,
                  width / 2 + 25, 4,
                  width / 2 + 35, 8,
                ]}
                stroke="#38bdf8"
                strokeWidth={2}
                tension={0.5}
                closed
                fill="#f0f9ff"
                opacity={0.85}
              />
            )}

            {/* Sample Powder Pile on Dish */}
            {displayedMass > 0 && (
              <Line
                points={[
                  width / 2 - 15, 6,
                  width / 2 - 5, 1,
                  width / 2 + 5, 1,
                  width / 2 + 15, 6,
                ]}
                stroke="#e2e8f0"
                strokeWidth={1}
                fill="#f8fafc"
                closed
              />
            )}

            {/* 7-Segment Digital Blue LCD Display */}
            <Rect
              x={18}
              y={45}
              width={width - 36}
              height={44}
              fill="#020617"
              stroke="#0284c7"
              strokeWidth={1.5}
              cornerRadius={6}
            />
            <KonvaText
              text={`${displayedMass.toFixed(3)} g`}
              x={24}
              y={54}
              fontSize={22}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#38bdf8"
            />
            <KonvaText
              text={isTared ? '[NET/TARED]' : '[GROSS]'}
              x={width - 95}
              y={50}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={isTared ? '#34d399' : '#fbbf24'}
            />
            <KonvaText
              text="d = 0.001g"
              x={width - 75}
              y={72}
              fontSize={8}
              fontFamily="sans-serif"
              fill="#64748b"
            />

            {/* Control Panel Buttons: TARE / ZERO */}
            <Rect
              x={width - 70}
              y={height - 24}
              width={55}
              height={16}
              fill="#0f766e"
              cornerRadius={3}
            />
            <KonvaText
              text="TARE/ZERO"
              x={width - 66}
              y={height - 21}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ccfbf1"
            />

            {/* Apparatus Title */}
            <KonvaText
              text={object.title}
              x={18}
              y={height - 22}
              fontSize={9}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#94a3b8"
            />
          </Group>
        );
      }

      case 'graduated-burette': {
        const capacity = Number(object.properties.capacityMl ?? 50);
        const delivered = Number(object.state.deliveredVolumeMl ?? object.properties.deliveredVolumeMl ?? 0);
        const stopcockOpen = Boolean(object.state.stopcockOpen ?? object.properties.stopcockOpen ?? false);
        const remaining = Math.max(0, capacity - delivered);
        const liquidFraction = remaining / capacity;

        // Burette dimensions
        const tubeX = 40;
        const tubeY = 15;
        const tubeW = 20;
        const tubeH = 210;
        const fillHeight = tubeH * liquidFraction;
        const meniscusY = tubeY + (tubeH - fillHeight);

        return (
          <Group>
            {/* Stand Rod & Base */}
            <Rect x={10} y={height - 15} width={75} height={12} fill="#334155" cornerRadius={3} />
            <Rect x={18} y={10} width={6} height={height - 25} fill="#475569" />
            {/* Clamp holding burette */}
            <Rect x={24} y={70} width={18} height={8} fill="#64748b" cornerRadius={2} />
            <Rect x={24} y={160} width={18} height={8} fill="#64748b" cornerRadius={2} />

            {/* Glass Tube Body */}
            <Rect
              x={tubeX}
              y={tubeY}
              width={tubeW}
              height={tubeH}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#94a3b8'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              opacity={0.9}
              cornerRadius={[2, 2, 0, 0]}
            />

            {/* Liquid Fill */}
            {fillHeight > 0 && (
              <Rect
                x={tubeX + 1}
                y={meniscusY}
                width={tubeW - 2}
                height={fillHeight}
                fill="#38bdf8"
                opacity={0.65}
              />
            )}

            {/* Curved Meniscus */}
            {fillHeight > 0 && fillHeight < tubeH && (
              <Line
                points={[
                  tubeX + 1, meniscusY,
                  tubeX + tubeW / 2, meniscusY + 2,
                  tubeX + tubeW - 1, meniscusY,
                ]}
                stroke="#0284c7"
                strokeWidth={1.5}
              />
            )}

            {/* Graduations (0, 10, 20, 30, 40, 50 mL) */}
            {[0, 10, 20, 30, 40, 50].map((v, i) => {
              const gy = tubeY + (tubeH * i) / 5;
              return (
                <Group key={v}>
                  <Line
                    points={[tubeX, gy, tubeX + 8, gy]}
                    stroke="#475569"
                    strokeWidth={1}
                  />
                  <KonvaText
                    text={`${v}`}
                    x={tubeX - 14}
                    y={gy - 4}
                    fontSize={7}
                    fontFamily="sans-serif"
                    fill="#64748b"
                  />
                </Group>
              );
            })}

            {/* Teflon Stopcock Assembly */}
            <Rect
              x={tubeX - 2}
              y={tubeY + tubeH}
              width={tubeW + 4}
              height={16}
              fill="#0369a1"
              cornerRadius={2}
            />
            {/* Valve Handle: Horizontal if closed, Vertical if open */}
            <Rect
              x={stopcockOpen ? tubeX + 7 : tubeX - 8}
              y={stopcockOpen ? tubeY + tubeH - 4 : tubeY + tubeH + 4}
              width={stopcockOpen ? 6 : 24}
              height={stopcockOpen ? 24 : 7}
              fill={stopcockOpen ? '#22c55e' : '#ef4444'}
              cornerRadius={2}
            />

            {/* Tapered Dispensing Jet / Tip */}
            <Line
              points={[
                tubeX + 4, tubeY + tubeH + 16,
                tubeX + tubeW - 4, tubeY + tubeH + 16,
                tubeX + tubeW / 2 + 1, tubeY + tubeH + 34,
                tubeX + tubeW / 2 - 1, tubeY + tubeH + 34,
              ]}
              closed
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth={1}
            />

            {/* Falling Droplet if Stopcock Open */}
            {stopcockOpen && (
              <Circle
                x={tubeX + tubeW / 2}
                y={tubeY + tubeH + 42}
                radius={2.5}
                fill="#38bdf8"
              />
            )}

            {/* Reading Badge */}
            <Rect
              x={tubeX + tubeW + 4}
              y={meniscusY - 8}
              width={42}
              height={16}
              fill="#0f172a"
              cornerRadius={3}
            />
            <KonvaText
              text={`${delivered.toFixed(1)}mL`}
              x={tubeX + tubeW + 6}
              y={meniscusY - 5}
              fontSize={9}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#38bdf8"
            />
          </Group>
        );
      }

      case 'thiele-tube': {
        const currentTemp = Number(object.state.currentTempC ?? object.properties.currentTempC ?? 110);
        const phase = String(object.state.phase ?? 'solid');
        const isHeating = object.properties.isHeating !== false;
        const mp = Number(object.state.meltingPointC ?? 122.4);

        return (
          <Group>
            {/* Apparatus Base Card */}
            <Rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              fill="#0f172a"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />

            {/* Triangular Convective Loop Arm & Paraffin Fill */}
            <Line
              points={[
                75, 70,
                145, 130,
                75, 190,
              ]}
              stroke="#fef08a"
              strokeWidth={18}
              lineCap="round"
              lineJoin="round"
              opacity={0.6}
            />
            <Line
              points={[
                75, 70,
                145, 130,
                75, 190,
              ]}
              stroke="#ca8a04"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />

            {/* Main Vertical Tube with Liquid Paraffin */}
            <Rect
              x={40}
              y={35}
              width={42}
              height={180}
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth={2}
              cornerRadius={[0, 0, 18, 18]}
              opacity={0.7}
            />

            {/* Thermometer Immersion */}
            <Rect x={58} y={20} width={7} height={165} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} cornerRadius={3} />
            {/* Red Alcohol / Mercury Thread */}
            <Rect
              x={60}
              y={185 - Math.min(150, (currentTemp / 200) * 150)}
              width={3}
              height={Math.min(150, (currentTemp / 200) * 150)}
              fill="#ef4444"
            />
            {/* Thermometer Bulb */}
            <Circle x={61.5} y={185} radius={6} fill="#ef4444" />

            {/* Sample Capillary Tube tied to bulb */}
            <Rect x={70} y={145} width={5} height={42} fill="#ffffff" stroke="#64748b" strokeWidth={0.8} />
            {/* Solid Powder vs Melted Meniscus */}
            <Rect
              x={71}
              y={165}
              width={3}
              height={20}
              fill={phase === 'liquid' ? '#38bdf8' : phase === 'coexistence' ? '#cbd5e1' : '#ffffff'}
            />

            {/* Bunsen Heating Point on Side Arm */}
            {isHeating && (
              <Group>
                <Circle x={145} y={130} radius={10} fill="#f97316" opacity={0.8} />
                <Circle x={145} y={130} radius={5} fill="#fef08a" />
                <KonvaText text="FLAME" x={132} y={145} fontSize={7} fontFamily="sans-serif" fontStyle="bold" fill="#fdba74" />
              </Group>
            )}

            {/* Digital Temperature & State Readout Header */}
            <Rect x={12} y={12} width={width - 24} height={20} fill="#1e293b" cornerRadius={4} />
            <KonvaText
              text={`T = ${currentTemp.toFixed(1)}°C  (m.p. ~${mp.toFixed(1)}°C)`}
              x={18}
              y={17}
              fontSize={10}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#38bdf8"
            />

            {/* Phase Badge Footer */}
            <Rect
              x={12}
              y={height - 28}
              width={width - 24}
              height={20}
              fill={phase === 'liquid' ? '#042f2e' : phase === 'coexistence' ? '#451a03' : '#1e293b'}
              stroke={phase === 'liquid' ? '#10b981' : phase === 'coexistence' ? '#f59e0b' : '#475569'}
              strokeWidth={1}
              cornerRadius={4}
            />
            <KonvaText
              text={
                phase === 'liquid'
                  ? '✓ FULLY MELTED: Transparent clear meniscus'
                  : phase === 'coexistence'
                    ? '⚠️ MELTING ONSET: Solid-liquid coexistence'
                    : 'SOLID: Microcrystalline packed powder'
              }
              x={16}
              y={height - 23}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={phase === 'liquid' ? '#34d399' : phase === 'coexistence' ? '#fbbf24' : '#94a3b8'}
            />
          </Group>
        );
      }

      case 'boiling-tube': {
        const bathTemp = Number(object.state.bathTempC ?? object.properties.bathTempC ?? 78.3);
        const bubbleStream = String(object.state.bubbleStream ?? 'slow-occasional-bubbles');
        const liquidEntered = Boolean(object.state.liquidEnteredCapillary ?? false);
        const bp = Number(object.state.standardBoilingPointC ?? 78.3);

        const isContinuous = bubbleStream === 'continuous-rapid-stream';

        return (
          <Group>
            {/* Outer Apparatus Frame */}
            <Rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              fill="#0f172a"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />

            {/* Paraffin / Water Heating Bath Beaker */}
            <Rect
              x={35}
              y={45}
              width={width - 70}
              height={165}
              fill="#fef9c3"
              stroke="#ca8a04"
              strokeWidth={1.5}
              opacity={0.6}
              cornerRadius={[0, 0, 12, 12]}
            />

            {/* Inner Fusion / Ignition Tube with Sample Liquid */}
            <Rect
              x={width / 2 - 16}
              y={60}
              width={32}
              height={140}
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth={1.5}
              cornerRadius={[0, 0, 8, 8]}
              opacity={0.85}
            />

            {/* Inverted Capillary Tube (Sealed at top, open at bottom) */}
            <Rect
              x={width / 2 - 4}
              y={75}
              width={8}
              height={115}
              fill="#ffffff"
              stroke="#475569"
              strokeWidth={1}
            />
            {/* Sealed top tip dot */}
            <Circle x={width / 2} y={75} radius={3.5} fill="#475569" />

            {/* Liquid inside capillary if sucked in upon cooling */}
            {liquidEntered && (
              <Rect
                x={width / 2 - 3}
                y={110}
                width={6}
                height={80}
                fill="#0284c7"
                opacity={0.8}
              />
            )}

            {/* Vapor Bubbles Streaming from Capillary Bottom */}
            {isContinuous && (
              <Group>
                <Circle x={width / 2} y={185} radius={3} fill="#ffffff" stroke="#38bdf8" strokeWidth={1} />
                <Circle x={width / 2 + 3} y={175} radius={4} fill="#ffffff" stroke="#38bdf8" strokeWidth={1} />
                <Circle x={width / 2 - 2} y={160} radius={4.5} fill="#ffffff" stroke="#38bdf8" strokeWidth={1} />
                <Circle x={width / 2 + 1} y={145} radius={5} fill="#ffffff" stroke="#38bdf8" strokeWidth={1} />
              </Group>
            )}

            {/* Bath Thermometer */}
            <Rect x={width / 2 + 25} y={40} width={6} height={165} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
            <Circle x={width / 2 + 28} y={195} radius={5} fill="#ef4444" />

            {/* Digital Readout Header */}
            <Rect x={12} y={12} width={width - 24} height={22} fill="#1e293b" cornerRadius={4} />
            <KonvaText
              text={`Bath: ${bathTemp.toFixed(1)}°C | T_b: ${bp.toFixed(1)}°C`}
              x={18}
              y={17}
              fontSize={10}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#38bdf8"
            />

            {/* Observation Badge Footer */}
            <Rect
              x={12}
              y={height - 28}
              width={width - 24}
              height={20}
              fill={liquidEntered ? '#042f2e' : isContinuous ? '#172554' : '#1e293b'}
              stroke={liquidEntered ? '#10b981' : isContinuous ? '#3b82f6' : '#475569'}
              strokeWidth={1}
              cornerRadius={4}
            />
            <KonvaText
              text={
                liquidEntered
                  ? '✓ TRUE B.P.: Liquid sucked up into capillary on cooling!'
                  : isContinuous
                    ? '⚡ BOILING: Continuous rapid vapor bubble train'
                    : 'PRE-BOILING: Slow trapped air expansion'
              }
              x={16}
              y={height - 23}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={liquidEntered ? '#34d399' : isContinuous ? '#60a5fa' : '#94a3b8'}
            />
          </Group>
        );
      }

      case 'acid-bench': {
        const conc = Number(object.properties.concentrationM ?? 0.1);
        const sPH = Number(object.state.strongPH ?? 1.0);
        const wPH = Number(object.state.weakPH ?? 2.88);
        const ratio = Number(object.state.hydroniumRatio ?? 76.1);
        const sAlpha = Number(object.state.strongAlphaPercent ?? 100);
        const wAlpha = Number(object.state.weakAlphaPercent ?? 1.31);
        const mgAdded = object.properties.magnesiumAdded !== false;

        return (
          <Group>
            {/* Bench Enclosure */}
            <Rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              fill="#0f172a"
              stroke={isSelected ? '#38bdf8' : '#334155'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={8}
            />

            {/* Header: Concentration & Title */}
            <Rect x={12} y={10} width={width - 24} height={20} fill="#1e293b" cornerRadius={4} />
            <KonvaText
              text={`Equimolar Acid Comparator (${conc} M)`}
              x={18}
              y={15}
              fontSize={10}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#f8fafc"
            />
            <KonvaText
              text={`[H⁺] Ratio: ${ratio.toFixed(1)}×`}
              x={width - 110}
              y={15}
              fontSize={10}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#38bdf8"
            />

            {/* LEFT CELL: Strong Acid (0.1M HCl) */}
            <Rect
              x={15}
              y={35}
              width={width / 2 - 20}
              height={height - 70}
              fill="#450a0a"
              stroke="#ef4444"
              strokeWidth={1}
              cornerRadius={6}
              opacity={0.8}
            />
            <KonvaText text="STRONG: 0.1M HCl" x={22} y={42} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#fca5a5" />
            <KonvaText text={`pH = ${sPH.toFixed(2)}`} x={22} y={56} fontSize={14} fontFamily="Courier New, monospace" fontStyle="bold" fill="#ffffff" />
            <KonvaText text={`α = ${sAlpha.toFixed(1)}% (100% ionised)`} x={22} y={74} fontSize={8} fontFamily="sans-serif" fill="#fecaca" />

            {/* Vigorous effervescence in HCl */}
            {mgAdded && (
              <Group>
                <Rect x={40} y={height - 50} width={30} height={5} fill="#94a3b8" />
                <Circle x={45} y={height - 60} radius={3} fill="#ffffff" opacity={0.9} />
                <Circle x={55} y={height - 70} radius={4} fill="#ffffff" opacity={0.85} />
                <Circle x={50} y={height - 85} radius={3.5} fill="#ffffff" opacity={0.8} />
                <Circle x={62} y={height - 65} radius={2.5} fill="#ffffff" opacity={0.9} />
                <Circle x={42} y={height - 78} radius={3} fill="#ffffff" opacity={0.8} />
                <KonvaText text="⚡ VIGOROUS H₂↑" x={22} y={height - 42} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#fca5a5" />
              </Group>
            )}

            {/* RIGHT CELL: Weak Acid (0.1M CH3COOH) */}
            <Rect
              x={width / 2 + 5}
              y={35}
              width={width / 2 - 20}
              height={height - 70}
              fill="#431407"
              stroke="#f97316"
              strokeWidth={1}
              cornerRadius={6}
              opacity={0.8}
            />
            <KonvaText text="WEAK: 0.1M CH₃COOH" x={width / 2 + 12} y={42} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#fdba74" />
            <KonvaText text={`pH = ${wPH.toFixed(2)}`} x={width / 2 + 12} y={56} fontSize={14} fontFamily="Courier New, monospace" fontStyle="bold" fill="#ffffff" />
            <KonvaText text={`α = ${wAlpha.toFixed(2)}% (Equilibrium)`} x={width / 2 + 12} y={74} fontSize={8} fontFamily="sans-serif" fill="#fed7aa" />

            {/* Gentle effervescence in Acetic */}
            {mgAdded && (
              <Group>
                <Rect x={width / 2 + 35} y={height - 50} width={30} height={5} fill="#94a3b8" />
                <Circle x={width / 2 + 45} y={height - 60} radius={2.5} fill="#ffffff" opacity={0.8} />
                <Circle x={width / 2 + 55} y={height - 75} radius={3} fill="#ffffff" opacity={0.7} />
                <KonvaText text="~ GENTLE H₂↑" x={width / 2 + 12} y={height - 42} fontSize={8} fontFamily="sans-serif" fontStyle="bold" fill="#fdba74" />
              </Group>
            )}

            {/* Scientific Insight Footer */}
            <Rect x={12} y={height - 30} width={width - 24} height={22} fill="#1e293b" cornerRadius={4} />
            <KonvaText
              text="Rate ∝ [H⁺] (Strength) | Total Stoichiometric H₂ = 24.0 mL (Identical Capacity)"
              x={16}
              y={height - 24}
              fontSize={8}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#34d399"
            />
          </Group>
        );
      }

      case 'generic-box':
      default: {
        const displayVal =
          object.state.activeSignalValue ??
          object.properties.outputSignal ??
          object.properties.outputVoltage ??
          0;
        return (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="#ffffff"
              stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
              strokeWidth={isSelected ? 3 : 1.5}
              cornerRadius={12}
              shadowColor="#0f172a"
              shadowBlur={6}
              shadowOpacity={0.08}
            />
            <Rect
              x={0}
              y={0}
              width={width}
              height={28}
              fill={eqDef?.colorTheme || '#3b82f6'}
              cornerRadius={[12, 12, 0, 0]}
            />
            <KonvaText
              text={object.title}
              x={12}
              y={8}
              fontSize={11}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#ffffff"
            />
            <KonvaText
              text={`Signal: ${displayVal}`}
              x={14}
              y={40}
              fontSize={13}
              fontFamily="Courier New, monospace"
              fontStyle="bold"
              fill="#1e293b"
            />
            <KonvaText
              text={String(object.state.statusLabel || 'Online')}
              x={14}
              y={64}
              fontSize={10}
              fontFamily="sans-serif"
              fill="#10b981"
            />
          </Group>
        );
      }
    }
  };

  return (
    <Group
      id={object.id}
      x={object.x}
      y={object.y}
      rotation={object.rotation || 0}
      draggable
      onClick={() => onSelect(object.id)}
      onTap={() => onSelect(object.id)}
      onDragEnd={handleDragEnd}
    >
      {/* Visual Apparatus Card */}
      {renderVisualContent()}

      {/* Attachment Ports on Object Perimeter */}
      {eqDef?.ports.map((port) => {
        const portX = port.xOffset;
        const portY = port.yOffset;
        const portColor = port.color || '#3b82f6';

        return (
          <Group
            key={port.id}
            x={portX}
            y={portY}
            onClick={(e) => {
              e.cancelBubble = true;
              onPortClick(object.id, port, object.x + portX, object.y + portY);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onPortClick(object.id, port, object.x + portX, object.y + portY);
            }}
          >
            {/* Hit area */}
            <Circle radius={10} fill="transparent" />
            {/* Outer Ring */}
            <Circle radius={6} fill="#ffffff" stroke={portColor} strokeWidth={2} />
            {/* Core Pin */}
            <Circle radius={3} fill={portColor} />
          </Group>
        );
      })}
    </Group>
  );
};
