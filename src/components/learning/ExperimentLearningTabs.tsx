/**
 * ExperimentLearningTabs.tsx
 *
 * Reusable 5-tab navigation header for all PrayogaProof STEM experiments:
 * 1. Overview
 * 2. Virtual Lab
 * 3. Load Simulation (strictly mandated exact label)
 * 4. Observations
 * 5. Viva & Results
 */

import React from 'react';
import {
  BookOpen,
  FlaskConical,
  Film,
  TableProperties,
  Award,
} from 'lucide-react';

export type ExperimentTabId =
  | 'overview'
  | 'lab'
  | 'simulation'
  | 'observations'
  | 'viva';

interface ExperimentLearningTabsProps {
  activeTab: ExperimentTabId;
  onTabChange: (tabId: ExperimentTabId) => void;
  observationCount?: number;
  workspaceCount?: number;
  vivaCompleted?: boolean;
}

export const ExperimentLearningTabs: React.FC<ExperimentLearningTabsProps> = ({
  activeTab,
  onTabChange,
  observationCount,
  workspaceCount,
  vivaCompleted,
}) => {
  const tabs: Array<{
    id: ExperimentTabId;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'lab',
      label: 'Virtual Lab',
      icon: <FlaskConical className="w-4 h-4" />,
      badge: workspaceCount && workspaceCount > 0 ? workspaceCount : undefined,
    },
    {
      id: 'simulation',
      label: 'Load Simulation', // EXACT MANDATED LABEL
      icon: <Film className="w-4 h-4" />,
      badge: '7 Segments',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      id: 'observations',
      label: 'Observations',
      icon: <TableProperties className="w-4 h-4" />,
      badge: observationCount && observationCount > 0 ? observationCount : undefined,
    },
    {
      id: 'viva',
      label: 'Viva & Results',
      icon: <Award className="w-4 h-4" />,
      badge: vivaCompleted ? 'Done' : '100 pts',
      badgeColor: vivaCompleted
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
  ];

  return (
    <nav
      className="w-full flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-none"
      aria-label="Experiment learning tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/80 dark:border-slate-700 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <span
              className={`transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  tab.badgeColor ||
                  (isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
