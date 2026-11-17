import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UniversalLabWorkspace } from '../components/workspace/UniversalLabWorkspace';
import { getExperimentById } from '../services/experimentRegistry';

export const WorkspacePage: React.FC = () => {
  const { experimentId } = useParams<{ experimentId?: string }>();
  const activeExpId = experimentId || 'ohms-law';
  const experiment = getExperimentById(activeExpId);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] space-y-2 p-2 sm:p-4">
      <div className="flex items-center justify-between px-1">
        <Link
          to={experiment ? `/experiments/${experiment.id}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to {experiment ? experiment.title : 'Dashboard'}</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">
          Universal Interactive Laboratory • Phase 2
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <UniversalLabWorkspace experimentId={activeExpId} initialMode="freelab" />
      </div>
    </div>
  );
};
