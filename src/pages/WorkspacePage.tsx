import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UniversalLabWorkspace } from '../components/workspace/UniversalLabWorkspace';
import { BiologyLabWorkspace } from '../experiments/biology';
import { getExperimentById } from '../services/experimentRegistry';

export const WorkspacePage: React.FC = () => {
  const { experimentId } = useParams<{ experimentId?: string }>();
  const navigate = useNavigate();
  const activeExpId = experimentId || 'ohms-law';
  const experiment = getExperimentById(activeExpId);

  const handleBack = () => {
    if (experiment) {
      navigate(`/experiments/${experiment.id}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 safe-top">
      {/* Top Bar on Fullscreen Workspace */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4 text-blue-500" />
          <span className="truncate max-w-[180px] sm:max-w-none">
            Exit to {experiment ? experiment.title : 'Dashboard'}
          </span>
        </button>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          Full Interactive Laboratory
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {experiment?.subjectId === 'biology' ? (
          <div className="h-full overflow-y-auto p-2 sm:p-4">
            <BiologyLabWorkspace experimentId={activeExpId} />
          </div>
        ) : (
          <UniversalLabWorkspace
            experimentId={activeExpId}
            initialMode="freelab"
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};
