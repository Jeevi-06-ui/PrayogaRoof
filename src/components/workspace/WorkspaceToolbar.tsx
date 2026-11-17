import React from 'react';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Save,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '../shared/Button';
import { LabMode } from '../../types';

interface WorkspaceToolbarProps {
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  onOpenLoadModal: () => void;
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  experimentTitle: string;
  isSaving?: boolean;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  mode,
  onModeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onSave,
  onOpenLoadModal,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onResetView,
  gridSnap,
  onToggleGridSnap,
  experimentTitle,
  isSaving,
}) => {
  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar select-none">
      {/* Left Group: Experiment Name & Mode Switcher */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[200px]">
            {experimentTitle}
          </span>
        </div>

        {/* Mode Switcher Pill */}
        <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onModeChange('guided')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'guided'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guided Mode</span>
            <span className="sm:hidden">Guided</span>
          </button>
          <button
            onClick={() => onModeChange('freelab')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'freelab'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Free Lab</span>
            <span className="sm:hidden">Free</span>
          </button>
        </div>
      </div>

      {/* Middle Group: History, Grid, & Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Snap-to-Grid */}
        <button
          onClick={onToggleGridSnap}
          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
            gridSnap
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
          title="Snap apparatus to grid lines"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Snap Grid</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 min-w-[36px] text-center">
            {Math.round(zoomPercent)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onResetView}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Zoom & Pan"
            aria-label="Reset Zoom and Pan"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Group: Reset, Load & Save */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onReset}
          className="p-1.5 px-2 rounded-lg text-xs text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          title="Clear working canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={onOpenLoadModal}
          className="p-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          title="Load saved workspace from IndexedDB"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden sm:inline">Load</span>
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>
    </header>
  );
};
