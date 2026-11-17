import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text as KonvaText, Circle, Line, Group } from 'react-konva';
import { ZoomIn, ZoomOut, RotateCcw, Move, Layers, Grid } from 'lucide-react';
import { Button } from './Button';
import { ApparatusItem } from '../../types';

export interface LabCanvasPlaceholderProps {
  experimentTitle: string;
  apparatus: ApparatusItem[];
  workspaceTitle?: string;
  onSaveWorkspace?: () => void;
}

export const LabCanvasPlaceholder: React.FC<LabCanvasPlaceholderProps> = ({
  experimentTitle,
  apparatus,
  workspaceTitle = 'Untitled Workspace',
  onSaveWorkspace,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate grid lines
  const gridLines: React.ReactNode[] = [];
  if (showGrid) {
    const gridSize = 30;
    const width = 1200;
    const height = 700;

    for (let x = 0; x < width; x += gridSize) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#e2e8f0"
          strokeWidth={0.7}
          opacity={0.6}
        />
      );
    }
    for (let y = 0; y < height; y += gridSize) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#e2e8f0"
          strokeWidth={0.7}
          opacity={0.6}
        />
      );
    }
  }

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-sm">
      {/* Canvas Top Bar */}
      <div className="p-3 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {workspaceTitle}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
            React-Konva Engine Ready
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="text-xs"
            leftIcon={<Grid className="w-3.5 h-3.5" />}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </Button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            className="p-1.5 h-8 w-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            aria-label="Zoom In"
            className="p-1.5 h-8 w-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            aria-label="Reset View"
            className="p-1.5 h-8 w-8"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          {onSaveWorkspace && (
            <Button variant="primary" size="sm" onClick={onSaveWorkspace} className="ml-2">
              Save Workspace
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace Stage Container */}
      <div className="relative w-full min-h-[420px] h-[520px] overflow-hidden bg-white dark:bg-slate-900" ref={containerRef}>
        <Stage
          width={1200}
          height={520}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable
          onDragEnd={(e) => {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }}
        >
          <Layer>
            {/* Grid */}
            {gridLines}

            {/* Central Virtual Lab Bench Benchplate */}
            <Group x={120} y={60}>
              <Rect
                x={0}
                y={0}
                width={720}
                height={380}
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth={2}
                cornerRadius={16}
                shadowColor="#0f172a"
                shadowBlur={12}
                shadowOpacity={0.06}
                shadowOffsetX={0}
                shadowOffsetY={4}
              />

              {/* Lab Bench Header */}
              <Rect
                x={0}
                y={0}
                width={720}
                height={48}
                fill="#f1f5f9"
                cornerRadius={[16, 16, 0, 0]}
              />

              <KonvaText
                text={`Free-Form Virtual Bench: ${experimentTitle}`}
                x={24}
                y={16}
                fontSize={15}
                fontFamily="Inter, sans-serif"
                fontStyle="bold"
                fill="#1e293b"
              />

              {/* Draggable Component Placeholder Blocks */}
              <Group x={40} y={80} draggable>
                <Rect
                  width={180}
                  height={110}
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  cornerRadius={10}
                  shadowColor="#2563eb"
                  shadowBlur={8}
                  shadowOpacity={0.12}
                />
                <Circle x={25} y={30} radius={8} fill="#3b82f6" />
                <KonvaText
                  text="Apparatus Module"
                  x={42}
                  y={22}
                  fontSize={13}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill="#0f172a"
                />
                <KonvaText
                  text="Draggable Packet-Tracer Node"
                  x={20}
                  y={50}
                  fontSize={11}
                  fontFamily="Inter, sans-serif"
                  fill="#64748b"
                />
                <KonvaText
                  text="Drag me anywhere on bench"
                  x={20}
                  y={75}
                  fontSize={10}
                  fontFamily="Inter, sans-serif"
                  fill="#94a3b8"
                />
              </Group>

              <Group x={260} y={80} draggable>
                <Rect
                  width={180}
                  height={110}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth={2}
                  cornerRadius={10}
                  shadowColor="#10b981"
                  shadowBlur={8}
                  shadowOpacity={0.12}
                />
                <Circle x={25} y={30} radius={8} fill="#10b981" />
                <KonvaText
                  text="Measuring Probe"
                  x={42}
                  y={22}
                  fontSize={13}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill="#0f172a"
                />
                <KonvaText
                  text="Interactive Wire Snapping"
                  x={20}
                  y={50}
                  fontSize={11}
                  fontFamily="Inter, sans-serif"
                  fill="#64748b"
                />
                <KonvaText
                  text="Drag to test node placement"
                  x={20}
                  y={75}
                  fontSize={10}
                  fontFamily="Inter, sans-serif"
                  fill="#94a3b8"
                />
              </Group>

              <Group x={480} y={80} draggable>
                <Rect
                  width={180}
                  height={110}
                  fill="#ffffff"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  cornerRadius={10}
                  shadowColor="#8b5cf6"
                  shadowBlur={8}
                  shadowOpacity={0.12}
                />
                <Circle x={25} y={30} radius={8} fill="#8b5cf6" />
                <KonvaText
                  text="Observation Readout"
                  x={42}
                  y={22}
                  fontSize={13}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill="#0f172a"
                />
                <KonvaText
                  text="Telemetry Channel"
                  x={20}
                  y={50}
                  fontSize={11}
                  fontFamily="Inter, sans-serif"
                  fill="#64748b"
                />
                <KonvaText
                  text="Ready for Phase 2 simulation"
                  x={20}
                  y={75}
                  fontSize={10}
                  fontFamily="Inter, sans-serif"
                  fill="#94a3b8"
                />
              </Group>

              {/* Central Information Banner */}
              <Group x={40} y={230}>
                <Rect
                  width={620}
                  height={100}
                  fill="#eff6ff"
                  stroke="#bfdbfe"
                  strokeWidth={1.5}
                  cornerRadius={12}
                />
                <KonvaText
                  text="Phase 1 Virtual Workspace Canvas Architecture"
                  x={20}
                  y={18}
                  fontSize={14}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill="#1e40af"
                />
                <KonvaText
                  text="• Free-form virtual bench enabled with infinite pan, zoom, and component dragging."
                  x={20}
                  y={42}
                  fontSize={12}
                  fontFamily="Inter, sans-serif"
                  fill="#1e3a8a"
                />
                <KonvaText
                  text="• IndexedDB local storage active for workspace state saving & student recovery."
                  x={20}
                  y={64}
                  fontSize={12}
                  fontFamily="Inter, sans-serif"
                  fill="#1e3a8a"
                />
              </Group>
            </Group>
          </Layer>
        </Stage>

        {/* Floating Canvas Navigation Hint */}
        <div className="absolute bottom-4 left-4 p-2.5 px-3.5 bg-slate-900/80 backdrop-blur-md rounded-xl text-xs text-white flex items-center gap-2 shadow-lg pointer-events-none">
          <Move className="w-4 h-4 text-blue-400" />
          <span>Click & drag empty space to pan canvas | Drag cards to test placement</span>
        </div>
      </div>

      {/* Apparatus Palette Tray */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Apparatus Component Palette ({apparatus.length} items configured)
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Packet-Tracer Snap Nodes
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {apparatus.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 p-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-400 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-grab transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{item.name}</span>
              {item.quantity && (
                <span className="text-[10px] text-slate-400 font-mono">
                  ({item.quantity})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
