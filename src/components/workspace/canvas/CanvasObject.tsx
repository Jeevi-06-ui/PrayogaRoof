import React from 'react';
import { Group, Rect, Text as KonvaText, Circle, Line } from 'react-konva';
import { WorkspaceObject, PortDefinition } from '../../../types';
import { getEquipmentDefinition } from '../../../services/lab/registry';

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

      case 'beaker': {
        const vol = Number(object.properties.liquidVolume ?? 100);
        const maxVol = 250;
        const liquidColor = String(object.state.liquidColor || '#e0f2fe');
        const fillHeight = Math.max(8, Math.min(height - 35, ((height - 35) * vol) / maxVol));

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
              opacity={0.85}
            />
            {/* Liquid Fill */}
            <Rect
              x={12}
              y={height - 10 - fillHeight}
              width={width - 24}
              height={fillHeight}
              fill={liquidColor}
              opacity={0.65}
              cornerRadius={[0, 0, 14, 14]}
            />
            {/* Graduation Markings */}
            <Line points={[14, 40, 26, 40]} stroke="#64748b" strokeWidth={1} />
            <Line points={[14, 70, 26, 70]} stroke="#64748b" strokeWidth={1} />
            <Line points={[14, 100, 26, 100]} stroke="#64748b" strokeWidth={1} />
            <KonvaText
              text={`${vol}mL`}
              x={30}
              y={height - 10 - fillHeight / 2 - 6}
              fontSize={11}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#0f172a"
            />
            <KonvaText
              text={String(object.properties.reagentSolution || 'Water')}
              x={14}
              y={height - 8}
              fontSize={9}
              fontFamily="sans-serif"
              fill="#475569"
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
