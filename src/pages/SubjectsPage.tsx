import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Zap,
  FlaskConical,
  Dna,
  Calculator,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { ExperimentCard } from '../components/shared/ExperimentCard';
import { getAllSubjects, EXPERIMENTS } from '../services/experimentRegistry';
import { useStudent } from '../context/StudentContext';
import { SubjectId } from '../types';

export const SubjectsPage: React.FC = () => {
  const { stats } = useStudent();
  const subjects = getAllSubjects();

  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredExperiments = EXPERIMENTS.filter((exp) => {
    const matchesSubject = selectedSubject === 'all' || exp.subjectId === selectedSubject;
    const matchesClass = selectedClass === 'all' || exp.classLevel === selectedClass;
    const matchesSearch =
      !searchQuery.trim() ||
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.curriculumTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesClass && matchesSearch;
  });

  const subjectTabs: Array<{ id: SubjectId | 'all'; label: string; icon: React.ElementType; count: number; color: string }> = [
    { id: 'all', label: 'All Subjects', icon: Compass, count: EXPERIMENTS.length, color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'physics', label: 'Physics', icon: Zap, count: stats.physicsTotal || 25, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, count: stats.chemistryTotal || 27, color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'biology', label: 'Biology', icon: Dna, count: stats.biologyTotal || 15, color: 'text-teal-600 dark:text-teal-400' },
    { id: 'mathematics', label: 'Mathematics', icon: Calculator, count: stats.mathematicsTotal || 12, color: 'text-purple-600 dark:text-purple-400' },
  ];

  const classTabs = [
    { id: 'all', label: 'All Classes' },
    { id: 'foundation', label: 'Class 10 Foundation' },
    { id: 'class-11', label: 'Class 11' },
    { id: 'class-12', label: 'Class 12' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Explore All Laboratories' },
        ]}
      />

      {/* Hero Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-blue-200" />
              </span>
              <Badge variant="primary" className="bg-white/20 text-white border-white/30">
                Four STEM Disciplines
              </Badge>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-xs text-blue-100">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {EXPERIMENTS.length} Total Registered Labs
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Explore STEM Laboratories
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base mt-2 leading-relaxed">
              Curriculum-aligned virtual laboratory experiments across Physics, Chemistry, Biology, and Mathematics. Master experimental procedures, dynamic graphs, observation tables, and viva voce assessments.
            </p>
          </div>

          {/* Quick Subject Launch Cards */}
          <div className="grid grid-cols-2 gap-2 min-w-[280px]">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                to={`/subjects/${sub.id}`}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                    {sub.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                    {sub.totalExperiments}
                  </span>
                </div>
                <p className="text-[10px] text-blue-100/80 mt-1 line-clamp-1">
                  Enter Laboratory &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          {subjectTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedSubject === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSubject(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary: Class Filter & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex-shrink-0">
              Grade:
            </span>
            {classTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedClass(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedClass === tab.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${EXPERIMENTS.length} experiments...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[38px]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Experiment Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
            Showing {filteredExperiments.length} of {EXPERIMENTS.length} Virtual Experiments
          </p>
        </div>

        {filteredExperiments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((exp) => (
              <ExperimentCard key={exp.id} experiment={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No matching experiments found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords, clearing your class level filters, or switching subject tabs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
