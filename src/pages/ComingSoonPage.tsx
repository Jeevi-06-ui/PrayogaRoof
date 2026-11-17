import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Dna,
  Calculator,
  Bell,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { getSubjectById } from '../services/experimentRegistry';
import { SubjectId } from '../types';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';

interface ComingSoonPageProps {
  subjectId?: SubjectId;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ subjectId: propSubjectId }) => {
  const params = useParams<{ subjectId?: string }>();
  const activeSubjectId = (propSubjectId || params.subjectId || 'biology') as SubjectId;

  const subject = getSubjectById(activeSubjectId) || {
    id: activeSubjectId,
    name: activeSubjectId === 'biology' ? 'Biology' : 'Mathematics',
    tagline: activeSubjectId === 'biology' ? 'Cellular Systems & Genetics' : 'Spatial Geometry & Calculus',
    description: 'Interactive STEM laboratory module in curriculum review.',
    status: 'coming-soon' as const,
    accentColor: activeSubjectId === 'biology' ? '#d97706' : '#7c3aed',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    totalExperiments: 0,
    availableExperiments: 0,
    iconName: activeSubjectId === 'biology' ? 'Dna' : 'Calculator',
    plannedQuarter: 'Curriculum Alignment In Progress',
  };

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`prayogaproof_notify_${activeSubjectId}`) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleNotification = () => {
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    try {
      localStorage.setItem(`prayogaproof_notify_${activeSubjectId}`, String(nextState));
    } catch {
      // ignore
    }
  };

  const isBiology = activeSubjectId === 'biology';

  const plannedThemes = isBiology
    ? [
        {
          title: 'Virtual Light Microscopy',
          detail: 'Onion peel epidermal cell staining and human cheek cell cytology investigation.',
        },
        {
          title: 'Photosynthesis & Transpiration',
          detail: 'Hydrilla bell jar oxygen bubbling rate and cobalt chloride transpiration paper tests.',
        },
        {
          title: 'Human Heart & Circulatory Model',
          detail: 'Free-form interactive blood flow routing and pulse rate correlation.',
        },
        {
          title: 'Mendelian Genetics Punnett Square',
          detail: 'Monohybrid and dihybrid cross phenotype prediction engines.',
        },
      ]
    : [
        {
          title: 'Coordinate Geometry & Slope Vector Bench',
          detail: 'Packet-tracer style coordinate snapping and Cartesian distance derivations.',
        },
        {
          title: 'Interactive 3D Polyhedra & Euler Formula',
          detail: 'Rotatable Platonic solid inspection: Faces + Vertices - Edges = 2.',
        },
        {
          title: 'Empirical Probability & Galton Board',
          detail: 'Normal distribution curve generation through 10,000 bead drops.',
        },
        {
          title: 'Trigonometric Unit Circle Synthesizer',
          detail: 'Dynamic sine, cosine, and tangent curve tracking with angle sweeps.',
        },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: `${subject.name} (Coming Soon)` },
        ]}
      />

      {/* Hero Header */}
      <div
        className={`p-8 sm:p-12 rounded-3xl text-white shadow-lg relative overflow-hidden ${
          isBiology
            ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900'
            : 'bg-gradient-to-r from-purple-700 via-indigo-800 to-violet-900'
        }`}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
              {isBiology ? <Dna className="w-6 h-6 text-amber-200" /> : <Calculator className="w-6 h-6 text-purple-200" />}
            </span>
            <Badge
              variant="warning"
              className="bg-white/20 text-white border-white/30 font-semibold"
            >
              Curriculum Development Phase
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {subject.name} Laboratory
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-2 leading-relaxed">
            {subject.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Bell className="w-4 h-4 text-amber-600 dark:text-purple-600" />}
              onClick={handleToggleNotification}
              className="bg-white text-slate-900 hover:bg-slate-100"
            >
              {isSubscribed ? 'Notification Enabled ✓' : 'Notify Me Upon Release'}
            </Button>
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="text-white border-white/40 hover:bg-white/10"
              >
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scope Clarification Notice */}
      <div className="p-4 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <p className="font-bold">Phase 1 Architecture Boundary Note</p>
          <p className="mt-0.5 text-amber-800 dark:text-amber-300">
            Per project specification, {subject.name} is on hold for future phases.
            Its workflows, laboratory canvases, and experiment simulations will be specified after the Physics and Chemistry foundations are reviewed and approved.
          </p>
        </div>
      </div>

      {/* Planned Curriculum Blueprint */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Planned Future Curriculum Roadmap
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
          Tentative experiment themes undergoing academic board review for future release:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plannedThemes.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  {index + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Labs Call to Action */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Ready to conduct experiments now?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dive into 10 active, fully-configured experiments in Physics and Chemistry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/subjects/physics">
            <Button variant="primary" size="sm">
              Explore Physics
            </Button>
          </Link>
          <Link to="/subjects/chemistry">
            <Button variant="secondary" size="sm">
              Explore Chemistry
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
