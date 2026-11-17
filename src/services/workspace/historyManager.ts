import { WorkspaceObject, WorkspaceConnection } from '../../types';

export interface WorkspaceSnapshot {
  objects: WorkspaceObject[];
  connections: WorkspaceConnection[];
  description: string;
  timestamp: number;
}

export class WorkspaceHistoryManager {
  private undoStack: WorkspaceSnapshot[] = [];
  private redoStack: WorkspaceSnapshot[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  private cloneState(
    objects: WorkspaceObject[],
    connections: WorkspaceConnection[],
    description: string
  ): WorkspaceSnapshot {
    return {
      objects: JSON.parse(JSON.stringify(objects)),
      connections: JSON.parse(JSON.stringify(connections)),
      description,
      timestamp: Date.now(),
    };
  }

  public pushState(
    objects: WorkspaceObject[],
    connections: WorkspaceConnection[],
    description = 'Workspace Change'
  ): void {
    const snapshot = this.cloneState(objects, connections, description);
    this.undoStack.push(snapshot);

    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    // Any new action invalidates the redo branch
    this.redoStack = [];
  }

  public undo(
    currentObjects: WorkspaceObject[],
    currentConnections: WorkspaceConnection[]
  ): WorkspaceSnapshot | null {
    if (this.undoStack.length === 0) return null;

    // Save current state onto redo stack
    const currentSnapshot = this.cloneState(currentObjects, currentConnections, 'Before Undo');
    this.redoStack.push(currentSnapshot);

    // Pop the previous state
    const previousSnapshot = this.undoStack.pop()!;
    return JSON.parse(JSON.stringify(previousSnapshot));
  }

  public redo(
    currentObjects: WorkspaceObject[],
    currentConnections: WorkspaceConnection[]
  ): WorkspaceSnapshot | null {
    if (this.redoStack.length === 0) return null;

    // Save current state onto undo stack
    const currentSnapshot = this.cloneState(currentObjects, currentConnections, 'Before Redo');
    this.undoStack.push(currentSnapshot);

    // Pop the next state
    const nextSnapshot = this.redoStack.pop()!;
    return JSON.parse(JSON.stringify(nextSnapshot));
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  public getUndoCount(): number {
    return this.undoStack.length;
  }

  public getRedoCount(): number {
    return this.redoStack.length;
  }
}
