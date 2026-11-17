import React from 'react';
import { Link } from 'react-router-dom';
import { ExperimentMetadata, ProgressStatus } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import {
  Clock,
  Layers,
  ArrowRight,
  PlayCircle,
  Compass,
  Zap,
  Activity,
  SunMedium,
  GitFork,
  Pipette,
  Flower2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export interface ExperimentCardProps {
  experiment: ExperimentMetadata;
  status?: ProgressStatus;
  workspacesCount?: number;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  status = 'not-started',
  workspacesCount = 0,
}) => {
  const getDifficultyBadgeVariant = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" dot>
            Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="primary" dot>
            In Progress
          </Badge>
        );
      case 'not-started':
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const renderIcon = (name: string) => {
    const iconClass = 'w-5 h-5';
    switch (name) {
      case 'Activity':
        return <Activity className={iconClass} />;
      case 'SunMedium':
        return <SunMedium className={iconClass} />;
      case 'GitFork':
        return <GitFork className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'Clock':
        return <Clock className={iconClass} />;
      case 'Pipette':
        return <Pipette className={iconClass} />;
      case 'Flower2':
        return <Flower2 className={iconClass} />;
      case 'Layers':
        return <Layers className={iconClass} />;
      case 'RefreshCw':
        return <RefreshCw className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      default:
        return <Zap className={iconClass} />;
    }
  };

  const isPhysics = experiment.subjectId === 'physics';

  return (
    <div className="flex flex-col justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPhysics
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {renderIcon(experiment.thumbnailIcon)}
            </span>
            <Badge variant={getDifficultyBadgeVariant(experiment.difficulty)}>
              {experiment.difficulty}
            </Badge>
          </div>
          {getStatusBadge()}
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Link to={`/experiments/${experiment.id}`}>{experiment.title}</Link>
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
          {experiment.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {experiment.estimatedDurationMinutes} mins
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            {experiment.apparatus.length} apparatus units
          </span>
          {workspacesCount > 0 && (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <PlayCircle className="w-3.5 h-3.5" />
              {workspacesCount} workspace{workspacesCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
          {experiment.gradeLevel}
        </span>
        <div className="flex items-center gap-2">
          <Link to={`/experiments/${experiment.id}`}>
            <Button
              variant={status === 'completed' ? 'secondary' : 'primary'}
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {status === 'completed' ? 'Review Lab' : status === 'in-progress' ? 'Resume' : 'Start Lab'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
