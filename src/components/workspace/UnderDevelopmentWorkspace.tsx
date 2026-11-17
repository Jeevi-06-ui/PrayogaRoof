import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { getExperimentById } from '../../services/experimentRegistry';

interface UnderDevelopmentWorkspaceProps {
  experimentId: string;
}

export const UnderDevelopmentWorkspace: React.FC<UnderDevelopmentWorkspaceProps> = ({
  experimentId,
}) => {
  const experiment = getExperimentById(experimentId);

  const title = experiment ? experiment.title : experimentId;
  const gradeLevel = experiment ? experiment.gradeLevel : 'Class 11 - 12';
  const subjectName = experiment?.subjectId === 'chemistry' ? 'Chemistry' : 'Physics';
  const returnPath = experiment ? `/experiments/${experiment.id}` : '/dashboard';

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] h-full p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 shadow-xs">
        <Clock className="w-8 h-8" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="warning" dot>
          Under Development
        </Badge>
        <Badge variant="outline">
          {gradeLevel}
        </Badge>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 max-w-xl">
        {title}
      </h2>

      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 max-w-lg leading-relaxed">
        The interactive 2D simulation and scientific instruments for this {subjectName} experiment are currently in active curriculum development.
      </p>

      {experiment && experiment.learningObjectives && experiment.learningObjectives.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 max-w-md text-left w-full">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Planned Educational Objectives
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {experiment.learningObjectives.slice(0, 3).map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {experiment?.reusedModuleId && (
        <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 max-w-md w-full flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
          <span>Shares foundation simulation engine.</span>
          <Link to={`/workspace/${experiment.reusedModuleId}`}>
            <Button size="sm" variant="outline" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Try Foundation Lab
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to={returnPath}>
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Experiment Overview
          </Button>
        </Link>
        <Link to={experiment?.subjectId === 'chemistry' ? '/subjects/chemistry' : '/subjects/physics'}>
          <Button variant="outline">
            Browse {subjectName} Catalogue
          </Button>
        </Link>
      </div>
    </div>
  );
};
