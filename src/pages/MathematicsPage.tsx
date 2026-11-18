import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  ArrowLeft,
  RotateCw,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Layers,
  GraduationCap,
  Search,
} from 'lucide-react';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingState';
import { ExperimentCard } from '../components/shared/ExperimentCard';
import { useStudent } from '../context/StudentContext';
import { getExperimentsBySubject } from '../services/experimentRegistry';

export const MathematicsPage: React.FC = () => {
  const { stats } = useStudent();
  const mathExperiments = getExperimentsBySubject('mathematics');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const filteredExperiments = mathExperiments.filter((exp) => {
    const matchesClass = classFilter === 'all' || exp.classLevel === classFilter;
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.curriculumTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesClass && matchesSearch;
  });

  const classTabs = [
    { id: 'all', label: 'All Simulators', count: mathExperiments.length },
    { id: 'foundation', label: 'Class 10 Foundation', count: mathExperiments.filter((e) => e.classLevel === 'foundation').length },
    { id: 'class-11', label: 'Class 11 Mathematics', count: mathExperiments.filter((e) => e.classLevel === 'class-11').length },
    { id: 'class-12', label: 'Class 12 Mathematics', count: mathExperiments.filter((e) => e.classLevel === 'class-12').length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Mathematics Laboratory' },
        ]}
      />

      {/* Mathematics Subject Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        {/* Background decorative geometry accents */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-12 text-9xl font-serif">
          π
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-200">
                <Calculator className="w-5 h-5 text-purple-300" />
              </span>
              <Badge variant="primary" className="bg-purple-600/40 text-purple-100 border-purple-400/40">
                Active Interactive Laboratory
              </Badge>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-xs text-purple-200">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Classes 10, 11 &amp; 12
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-xs text-emerald-300">
                <HardDrive className="w-3 h-3" />
                100% Offline Ready
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Mathematics Laboratory
            </h1>
            <p className="text-purple-100 text-sm sm:text-base mt-2 leading-relaxed">
              Explore dynamic coordinate graphing, right-triangle trigonometry, calculus limit convergence, 3D spatial geometry, and JEE practice through interactive simulations.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-purple-200">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-300" />
                41 Chapters (CBSE &amp; State Boards)
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-300" />
                12 Dedicated Interactive Simulators
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Isolated Storage &amp; Zero External CDNs
              </span>
            </div>
          </div>

          {/* Action Controls & Progress Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[220px]">
              <p className="text-xs uppercase tracking-wider font-semibold text-purple-200">
                Curriculum Progress
              </p>
              <p className="text-2xl font-black mt-0.5">
                {stats.mathematicsCompleted}{' '}
                <span className="text-xs font-normal text-purple-200">
                  / {stats.mathematicsTotal || 12} Labs Completed
                </span>
              </p>
              <div className="w-full bg-purple-950/60 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(stats.mathematicsCompleted / (stats.mathematicsTotal || 12)) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                onClick={handleReload}
                leftIcon={<RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                title="Reset simulation frame"
              >
                Reload
              </Button>
              <a
                href="/math-module/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
                title="Open module in dedicated browser tab"
              >
                <span>Full Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Module Container & Iframe Host */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0B0F19] shadow-2xl">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0F19] text-slate-300 p-8 space-y-4">
            <LoadingSpinner label="Initializing Mathematics simulation engine..." />
            <p className="text-xs text-slate-500 font-mono">
              Loading local vectors, 2D/3D projection math, and diagnostic question banks...
            </p>
          </div>
        )}

        {/* Sandboxed responsive iframe */}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src="/math-module/index.html"
          title="PrayogaProof Interactive Mathematics Laboratory"
          aria-label="PrayogaProof Interactive Mathematics Laboratory"
          className="w-full h-[calc(100vh-210px)] min-h-[760px] border-0 block"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* 12 Curriculum Simulators Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Curriculum Simulators ({mathExperiments.length} Dedicated Modules)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose any specialized topic to practice interactive formula derivations, graphs, and viva voce quizzes
          </p>
        </div>

        {/* Controls: Class Selector Tabs and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Class Level Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b sm:border-b-0 border-slate-100 dark:border-slate-800 pb-3 sm:pb-0 overflow-x-auto no-scrollbar">
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-1 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex-shrink-0">
              Syllabus:
            </span>
            {classTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setClassFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  classFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    classFilter === tab.id
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search math simulators..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Grid of Experiment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((exp) => (
            <ExperimentCard key={exp.id} experiment={exp} />
          ))}
        </div>
      </div>

      {/* Integration Technical Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 py-1 gap-2 border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
        <span>
          Mathematics Module • Integrated from distribution bundle • Temporary isolated iframe host
        </span>
        <span className="font-mono text-purple-600 dark:text-purple-400">
          Storage: IndexedDB (PrayogaProofDB) • Offline Service Worker Cached
        </span>
      </div>
    </div>
  );
};
