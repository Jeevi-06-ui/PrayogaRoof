import React, { useState } from 'react';
import { FlaskConical, Search, SlidersHorizontal } from 'lucide-react';
import { getExperimentsBySubject, getSubjectById } from '../services/experimentRegistry';
import { useStudent } from '../context/StudentContext';
import { ExperimentCard } from '../components/shared/ExperimentCard';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';

export const ChemistryPage: React.FC = () => {
  const subject = getSubjectById('chemistry')!;
  const experiments = getExperimentsBySubject('chemistry');
  const { progressMap, stats } = useStudent();

  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredExperiments = experiments.filter((exp) => {
    const matchesDifficulty =
      difficultyFilter === 'All' || exp.difficulty === difficultyFilter;
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.curriculumTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Chemistry Laboratory' },
        ]}
      />

      {/* Chemistry Subject Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-200">
                <FlaskConical className="w-5 h-5 text-emerald-300" />
              </span>
              <Badge variant="success" className="bg-emerald-600/40 text-emerald-100 border-emerald-400/40">
                Active Interactive Laboratory
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Chemistry Virtual Bench
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base mt-2 leading-relaxed">
              {subject.description}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[220px]">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
              Module Mastery
            </p>
            <p className="text-2xl font-black mt-0.5">
              {stats.chemistryCompleted} <span className="text-sm font-normal text-emerald-200">/ 5 Completed</span>
            </p>
            <div className="w-full bg-emerald-950/60 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(stats.chemistryCompleted / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter chemistry experiments..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Difficulty:
          </span>
          {['All', 'Beginner', 'Intermediate'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                difficultyFilter === diff
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Experiment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((exp) => (
          <ExperimentCard
            key={exp.id}
            experiment={exp}
            status={progressMap[exp.id]?.status}
            workspacesCount={progressMap[exp.id]?.freeLabWorkspacesCount}
          />
        ))}
      </div>
    </div>
  );
};
