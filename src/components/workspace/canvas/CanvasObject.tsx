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
