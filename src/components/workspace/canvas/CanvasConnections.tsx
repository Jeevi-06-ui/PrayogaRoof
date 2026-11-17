import React from 'react';
import { Line, Circle, Group } from 'react-konva';
import { WorkspaceConnection, WorkspaceObject } from '../../../types';
import { getEquipmentDefinition } from '../../../services/lab/registry';

interface CanvasConnectionsProps {
  connections: WorkspaceConnection[];
  objects: WorkspaceObject[];
  selectedConnectionId?: string | null;
  onSelectConnection?: (id: string) => void;
  draftConnection?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color?: string;
  } | null;
}

export const CanvasConnections: React.FC<CanvasConnectionsProps> = ({
  connections,
  objects,
  selectedConnectionId,
  onSelectConnection,
  draftConnection,
}) => {
  // Helper to resolve absolute (x, y) coordinates of a port given object & portId
  const getPortCoordinates = (objectId: string, portId: string) => {
    const obj = objects.find((o) => o.id === objectId);
    if (!obj) return null;

    const eq = getEquipmentDefinition(obj.equipmentId);
    if (!eq) return null;

    const port = eq.ports.find((p) => p.id === portId);
    if (!port) return null;

    // Apply object rotation if any (standard 0, 90, 180, 270)
    const rad = (obj.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Center of rotation or top-left offset
    const relX = port.xOffset;
    const relY = port.yOffset;

    const rotatedX = relX * cos - relY * sin;
    const rotatedY = relX * sin + relY * cos;

    return {
      x: obj.x + rotatedX,
      y: obj.y + rotatedY,
    };
  };

  return (
    <Group>
      {/* Existing confirmed connections */}
      {connections.map((conn) => {
        const fromCoord = getPortCoordinates(conn.fromObjectId, conn.fromPortId);
        const toCoord = getPortCoordinates(conn.toObjectId, conn.toPortId);

        if (!fromCoord || !toCoord) return null;

        const isSelected = selectedConnectionId === conn.id;
        const color = conn.color || (conn.type === 'fluid-tube' ? '#0ea5e9' : '#ef4444');

        // Quadratic curve control point with slight sag for realistic wire/tube appearance
        const midX = (fromCoord.x + toCoord.x) / 2;
        const midY = (fromCoord.y + toCoord.y) / 2 + 15;

        return (
          <Group
            key={conn.id}
            onClick={() => onSelectConnection && onSelectConnection(conn.id)}
            onTap={() => onSelectConnection && onSelectConnection(conn.id)}
          >
            {/* Wider invisible line for easier click/tap selection */}
            <Line
              points={[fromCoord.x, fromCoord.y, midX, midY, toCoord.x, toCoord.y]}
              stroke="transparent"
              strokeWidth={14}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
            />

            {/* Selection highlight glow */}
            {isSelected && (
              <Line
                points={[fromCoord.x, fromCoord.y, midX, midY, toCoord.x, toCoord.y]}
                stroke="#38bdf8"
                strokeWidth={7}
                tension={0.4}
                opacity={0.6}
                lineCap="round"
                lineJoin="round"
              />
            )}

            {/* Core Wire / Tube line */}
            <Line
              points={[fromCoord.x, fromCoord.y, midX, midY, toCoord.x, toCoord.y]}
              stroke={color}
              strokeWidth={isSelected ? 4 : 3}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
              shadowColor="#0f172a"
              shadowBlur={3}
              shadowOpacity={0.2}
            />

            {/* Terminal connection dots */}
            <Circle x={fromCoord.x} y={fromCoord.y} radius={3.5} fill={color} />
            <Circle x={toCoord.x} y={toCoord.y} radius={3.5} fill={color} />
          </Group>
        );
      })}

      {/* Temporary draft connection while user is dragging wire */}
      {draftConnection && (
        <Group>
          <Line
            points={[
              draftConnection.fromX,
              draftConnection.fromY,
              draftConnection.toX,
              draftConnection.toY,
            ]}
            stroke={draftConnection.color || '#3b82f6'}
            strokeWidth={3}
            dash={[6, 4]}
            lineCap="round"
          />
          <Circle
            x={draftConnection.toX}
            y={draftConnection.toY}
            radius={5}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </Group>
      )}
    </Group>
  );
};
