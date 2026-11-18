import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dna,
  Search,
  SlidersHorizontal,
  GraduationCap,
  Microscope,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { getExperimentsBySubject } from '../services/experimentRegistry';
import { useStudent } from '../context/StudentContext';
import { ExperimentCard } from '../components/shared/ExperimentCard';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';

export const BiologyPage: React.FC = () => {
  const experiments = getExperimentsBySubject('biology');
  const { progressMap } = useStudent();

  const [classFilter, setClassFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate user's completed biology experiments
  const completedBioCount = experiments.filter(
    (exp) => progressMap[exp.id]?.status === 'completed'
  ).length;

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

  const classTabs: Array<{ id: string; label: string; count: number }> = [
    { id: 'all', label: 'All Experiments', count: experiments.length },
    { id: 'foundation', label: 'Class 10 Foundation', count: experiments.filter((e) => e.classLevel === 'foundation').length },
    { id: 'class-11', label: 'Class 11 Biology', count: experiments.filter((e) => e.classLevel === 'class-11').length },
    { id: 'class-12', label: 'Class 12 Biology', count: experiments.filter((e) => e.classLevel === 'class-12').length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Biology Laboratory' },
        ]}
      />

      {/* Biology Subject Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-200">
                <Dna className="w-5 h-5 text-emerald-300 animate-pulse" />
              </span>
              <Badge variant="success" className="bg-emerald-600/40 text-emerald-100 border-emerald-400/40">
                Interactive Biological Laboratory
              </Badge>
              <Badge variant="primary" className="bg-teal-500/20 text-teal-200 border-teal-400/30">
                NEET-UG Aligned
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
              Biology Virtual Laboratory
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base mt-2 leading-relaxed">
              Explore cellular dynamics, virtual optical microscopy, enzyme kinetics, human physiological systems, and genetics in an authentic interactive STEM environment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[260px] shadow-inner">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-bold text-emerald-200">
                Laboratory Progress
              </p>
              <span className="text-xs font-bold text-emerald-300 font-mono">
                {Math.round((completedBioCount / experiments.length) * 100)}%
              </span>
            </div>
            <p className="text-2xl font-black mt-1 font-mono text-white">
              {completedBioCount}{' '}
              <span className="text-xs font-normal text-emerald-200">
                / {experiments.length} Labs Completed
              </span>
            </p>
            <div className="w-full bg-slate-900/60 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedBioCount / Math.max(1, experiments.length)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-200/80 mt-2 font-mono">
              <span>XP Earned: {completedBioCount * 120}</span>
              <span>15 Core Labs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards (Virtual Microscope, NEET Prep, Flagship Osmosis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Virtual Microscope Studio */}
        <Link
          to="/experiments/bio-stomata"
          className="group p-5 rounded-2xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 transition-all hover:shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Microscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
              Virtual Microscope Studio
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Inspect onion peel, stomata guard cells, cheek cells, and root tip mitosis slides with 4x–100x objectives, fine focus, and stains.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Launch Microscope</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 2: Flagship Osmosis Experiment */}
        <Link
          to="/experiments/bio-osmosis"
          className="group p-5 rounded-2xl bg-gradient-to-br from-teal-900/40 via-slate-900 to-slate-900 border border-teal-500/20 hover:border-teal-500/50 transition-all hover:shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                Flagship: Osmosis & Water Potential
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Potato osmometer and cell water flux model. Test hypertonic, hypotonic, and isotonic sucrose solutions with real-time turgor graphing.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Open Flagship Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Card 3: NEET Biology Practice */}
        <Link
          to="/experiments/bio-mendelian-genetics"
          className="group p-5 rounded-2xl bg-gradient-to-br from-amber-900/30 via-slate-900 to-slate-900 border border-amber-500/20 hover:border-amber-500/50 transition-all hover:shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              NEET Genetics & Molecular Arena
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Mendelian Punnett grids, DNA replication forks, transcription, translation, and high-yield diagrammatic MCQs for competitive exam prep.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mt-4 group-hover:translate-x-1 transition-transform">
            <span>Practice Genetics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Controls: Class Selector Tabs, Search, and Difficulty */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Class Level Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex-shrink-0">
            Curriculum:
          </span>
          {classTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClassFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                classFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  classFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Difficulty Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search experiments, terms, organs, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Experiment Cards Grid */}
      {filteredExperiments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((exp) => (
            <ExperimentCard key={exp.id} experiment={exp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Dna className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No matching biology experiments found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search terms, curriculum level, or difficulty filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setClassFilter('all');
              setDifficultyFilter('All');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Gamification Achievements Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Biology Master Badges & Milestones
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {completedBioCount >= 1 ? '1/6 Badges Unlocked' : '0/6 Badges Unlocked'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'b-explorer', name: 'Biology Explorer', desc: 'Completed 1st biology lab', unlocked: completedBioCount >= 1 },
            { id: 'b-microscope', name: 'Microscope Master', desc: 'Calibrated virtual optics', unlocked: completedBioCount >= 3 },
            { id: 'b-cell', name: 'Cell Scientist', desc: 'Mastered osmosis & mitosis', unlocked: completedBioCount >= 5 },
            { id: 'b-genetics', name: 'Genetics Explorer', desc: 'Solved Punnett & replication', unlocked: completedBioCount >= 8 },
            { id: 'b-viva', name: 'Viva Champion', desc: 'Perfect score on 5 vivas', unlocked: completedBioCount >= 10 },
            { id: 'b-researcher', name: 'Biology Researcher', desc: 'Completed all 15 experiments', unlocked: completedBioCount >= 15 },
          ].map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl border text-center transition-all ${
                badge.unlocked
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs mb-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                {badge.unlocked ? '✓' : '🔒'}
              </div>
              <p className="text-xs font-bold truncate">{badge.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BiologyPage;
