import React from 'react';
import { Link } from 'react-router-dom';
import { SubjectMetadata } from '../../types';
import { Badge } from './Badge';
import { ArrowRight, Zap, FlaskConical, Dna, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';

export interface SubjectCardProps {
  subject: SubjectMetadata;
  completedCount?: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  completedCount = 0,
}) => {
  const isActive = subject.status === 'active';
  const total = subject.totalExperiments;
  const progressPercent = total > 0 ? (completedCount / total) * 100 : 0;

  const renderIcon = () => {
    switch (subject.id) {
      case 'physics':
        return <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'chemistry':
        return <FlaskConical className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'biology':
        return <Dna className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'mathematics':
        return <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getBorderAccent = () => {
    switch (subject.id) {
      case 'physics':
        return 'hover:border-blue-400 dark:hover:border-blue-600 group-hover:ring-blue-100 dark:group-hover:ring-blue-950/40';
      case 'chemistry':
        return 'hover:border-emerald-400 dark:hover:border-emerald-600 group-hover:ring-emerald-100 dark:group-hover:ring-emerald-950/40';
      case 'biology':
        return 'hover:border-amber-400 dark:hover:border-amber-600 group-hover:ring-amber-100 dark:group-hover:ring-amber-950/40';
      case 'mathematics':
        return 'hover:border-purple-400 dark:hover:border-purple-600 group-hover:ring-purple-100 dark:group-hover:ring-purple-950/40';
    }
  };

  const destination = `/subjects/${subject.id}`;

  return (
    <Link
      to={destination}
      className={`group relative flex flex-col justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${getBorderAccent()}`}
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform">
            {renderIcon()}
          </div>
          {isActive ? (
            <Badge variant="primary" dot>
              Active Lab
            </Badge>
          ) : (
            <Badge variant="warning">
              Coming Soon
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {subject.name}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
          {subject.tagline}
        </p>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
          {subject.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        {isActive ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {completedCount} of {total} completed
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  subject.id === 'physics'
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : subject.id === 'chemistry'
                    ? 'bg-emerald-600 dark:bg-emerald-500'
                    : 'bg-purple-600 dark:bg-purple-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={`flex items-center justify-between text-sm font-semibold group-hover:translate-x-0.5 transition-transform ${
              subject.id === 'physics'
                ? 'text-blue-600 dark:text-blue-400'
                : subject.id === 'chemistry'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-purple-600 dark:text-purple-400'
            }`}>
              <span>Enter {subject.name} Lab</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {subject.plannedQuarter || 'Phase 2 Extension'}
            </span>
            <span className="font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex items-center gap-1">
              Preview <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
