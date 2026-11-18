import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { CanvasObject } from './CanvasObject';
import { CanvasConnections } from './CanvasConnections';
import { WorkspaceObject, WorkspaceConnection, PortDefinition } from '../../../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface LabCanvasProps {
  objects: WorkspaceObject[];
  connections: WorkspaceConnection[];
  selectedObjectId?: string | null;
  selectedConnectionId?: string | null;
  gridSnap: boolean;
  showGrid?: boolean;
  gridSize?: number;
  scale: number;
  stagePosition: { x: number; y: number };
  onStagePositionChange: (pos: { x: number; y: number }) => void;
  onSelectObject: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  onMoveObject: (id: string, x: number, y: number) => void;
  onConnectPorts: (
    fromObjectId: string,
    fromPort: PortDefinition,
    toObjectId: string,
    toPort: PortDefinition
  ) => void;
  feedbackMessage?: { text: string; type: 'error' | 'success' | 'info' } | null;
  onClearFeedback?: () => void;
}

export const LabCanvas: React.FC<LabCanvasProps> = ({
  objects,
  connections,
  selectedObjectId,
  selectedConnectionId,
  gridSnap,
  showGrid = true,
  gridSize = 25,
  scale,
  stagePosition,
  onStagePositionChange,
  onSelectObject,
  onSelectConnection,
  onMoveObject,
  onConnectPorts,
  feedbackMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 600,
  });

  // Connection drafting state
  const [draftStart, setDraftStart] = useState<{
    objectId: string;
    port: PortDefinition;
    absX: number;
    absY: number;
  } | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Resize observer
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: Math.max(300, entry.contentRect.width),
          height: Math.max(400, entry.contentRect.height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Clicked on empty canvas background
    if (e.target === e.target.getStage()) {
      onSelectObject(null);
      onSelectConnection(null);
      if (draftStart) {
        setDraftStart(null);
      }
    }
  };

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!draftStart) return;
    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (pointer) {
      // Transform pointer to canvas coordinate space taking zoom and pan into account
      const canvasX = (pointer.x - stagePosition.x) / scale;
      const canvasY = (pointer.y - stagePosition.y) / scale;
      setMousePos({ x: canvasX, y: canvasY });
    }
  };

  const handlePortClick = useCallback(
    (objectId: string, port: PortDefinition, absX: number, absY: number) => {
      if (!draftStart) {
        // Begin drafting wire
        setDraftStart({ objectId, port, absX, absY });
        setMousePos({ x: absX, y: absY });
      } else {
        // Complete connection if clicking a second port
        if (draftStart.objectId !== objectId) {
          onConnectPorts(draftStart.objectId, draftStart.port, objectId, port);
        }
        setDraftStart(null);
        setMousePos(null);
      }
    },
    [draftStart, onConnectPorts]
  );

  // Memoize grid lines to prevent rebuilding 168 nodes on every pointer move
  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    const lines: React.ReactNode[] = [];
    const width = 2400;
    const height = 1800;

    for (let x = 0; x < width; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#e2e8f0"
          strokeWidth={0.6}
          opacity={0.7}
        />
      );
    }
    for (let y = 0; y < height; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#e2e8f0"
          strokeWidth={0.6}
          opacity={0.7}
        />
      );
    }
    return lines;
  }, [showGrid, gridSize]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] overflow-hidden bg-slate-50 dark:bg-slate-950 select-none touch-none"
    >
      {/* Feedback banner */}
      {feedbackMessage && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 border animate-in fade-in slide-in-from-top-2 duration-150 ${
            feedbackMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/90 dark:text-red-300 dark:border-red-800'
              : feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/90 dark:text-blue-300 dark:border-blue-800'
          }`}
        >
          {feedbackMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Interactive React Konva Stage */}
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={!draftStart}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            onStagePositionChange({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onTouchMove={handleStageMouseMove}
      >
        <Layer>
          {/* Background Grid */}
          {gridLines}

          {/* Connections (Wires and Fluid Tubes) */}
          <CanvasConnections
            connections={connections}
            objects={objects}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={onSelectConnection}
            draftConnection={
              draftStart && mousePos
                ? {
                    fromX: draftStart.absX,
                    fromY: draftStart.absY,
                    toX: mousePos.x,
                    toY: mousePos.y,
                    color: draftStart.port.color,
                  }
                : null
            }
          />

          {/* Laboratory Apparatus Objects */}
          {objects.map((obj) => (
            <CanvasObject
              key={obj.id}
              object={obj}
              isSelected={selectedObjectId === obj.id}
              gridSnap={gridSnap}
              gridSize={gridSize}
              onSelect={onSelectObject}
              onMove={onMoveObject}
              onPortClick={handlePortClick}
            />
          ))}
        </Layer>
      </Stage>

      {/* Wire Drafting Hint Banner */}
      {draftStart && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs backdrop-blur-md flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>Select destination port to complete connection, or click canvas to cancel.</span>
        </div>
      )}
    </div>
  );
};
