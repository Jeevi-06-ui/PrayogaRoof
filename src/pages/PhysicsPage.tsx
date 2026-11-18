import React, { useState } from 'react';
import { Zap, Search, SlidersHorizontal, GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import { getExperimentsBySubject, getSubjectById } from '../services/experimentRegistry';
import { useStudent } from '../context/StudentContext';
import { ExperimentCard } from '../components/shared/ExperimentCard';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';

export const PhysicsPage: React.FC = () => {
  const subject = getSubjectById('physics')!;
  const experiments = getExperimentsBySubject('physics');
  const { progressMap, stats } = useStudent();

  const [classFilter, setClassFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredExperiments = experiments.filter((exp) => {
    const matchesClass = classFilter === 'all' || exp.classLevel === classFilter;
    const matchesDifficulty =
      difficultyFilter === 'All' || exp.difficulty === difficultyFilter;
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.curriculumTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesClass && matchesDifficulty && matchesSearch;
  });

  const foundationExps = filteredExperiments.filter((e) => e.classLevel === 'foundation');
  const class11Exps = filteredExperiments.filter((e) => e.classLevel === 'class-11');
  const class12Exps = filteredExperiments.filter((e) => e.classLevel === 'class-12');

  const classTabs: Array<{ id: string; label: string; count: number }> = [
    { id: 'all', label: 'All Classes', count: experiments.length },
    { id: 'foundation', label: 'Foundation', count: experiments.filter((e) => e.classLevel === 'foundation').length },
    { id: 'class-11', label: 'Class 11', count: experiments.filter((e) => e.classLevel === 'class-11').length },
    { id: 'class-12', label: 'Class 12', count: experiments.filter((e) => e.classLevel === 'class-12').length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Physics Laboratory' },
        ]}
      />

      {/* Physics Subject Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-200">
                <Zap className="w-5 h-5 text-blue-300" />
              </span>
              <Badge variant="primary" className="bg-blue-600/40 text-blue-100 border-blue-400/40">
                Active Interactive Laboratory
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Physics Virtual Bench
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base mt-2 leading-relaxed">
              {subject.description}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[240px]">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-200">
              Curriculum Progress
            </p>
            <p className="text-2xl font-black mt-0.5">
              {stats.physicsCompleted}{' '}
              <span className="text-xs font-normal text-blue-200">
                / {stats.physicsTotal || 25} Labs Completed
              </span>
            </p>
            <div className="w-full bg-blue-950/60 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(stats.physicsCompleted / (stats.physicsTotal || 25)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Class Selector Tabs, Search, and Difficulty */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Class Level Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex-shrink-0">
            Syllabus:
          </span>
          {classTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClassFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                classFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  classFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Difficulty Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments, tools, curriculum..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Difficulty:
            </span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  difficultyFilter === diff
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Experiment Cards Content */}
      {classFilter === 'all' && !searchQuery && difficultyFilter === 'All' ? (
        <div className="space-y-10">
          {/* Foundation Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Foundation Laboratory (Class 9 - 10)
                </h2>
              </div>
              <Badge variant="success">5 Interactive Labs Available</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundationExps.map((exp) => (
                <ExperimentCard
                  key={exp.id}
                  experiment={exp}
                  status={progressMap[exp.id]?.status}
                  workspacesCount={progressMap[exp.id]?.freeLabWorkspacesCount}
                />
              ))}
            </div>
          </section>

          {/* Class 11 Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Class 11 Physics Curriculum
                </h2>
              </div>
              <Badge variant="warning">10 Labs • Under Development</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {class11Exps.map((exp) => (
                <ExperimentCard
                  key={exp.id}
                  experiment={exp}
                  status={progressMap[exp.id]?.status}
                  workspacesCount={progressMap[exp.id]?.freeLabWorkspacesCount}
                />
              ))}
            </div>
          </section>

          {/* Class 12 Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Class 12 Physics Curriculum
                </h2>
              </div>
              <Badge variant="warning">10 Labs • Under Development</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {class12Exps.map((exp) => (
                <ExperimentCard
                  key={exp.id}
                  experiment={exp}
                  status={progressMap[exp.id]?.status}
                  workspacesCount={progressMap[exp.id]?.freeLabWorkspacesCount}
                />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.length > 0 ? (
            filteredExperiments.map((exp) => (
              <ExperimentCard
                key={exp.id}
                experiment={exp}
                status={progressMap[exp.id]?.status}
                workspacesCount={progressMap[exp.id]?.freeLabWorkspacesCount}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              No physics experiments match the selected filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
