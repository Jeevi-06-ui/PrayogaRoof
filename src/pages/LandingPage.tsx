import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  WifiOff,
  Sparkles,
  GraduationCap,
  Laptop,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { SubjectCard } from '../components/shared/SubjectCard';
import { getAllSubjects } from '../services/experimentRegistry';
import { useStudent } from '../context/StudentContext';

export const LandingPage: React.FC = () => {
  const subjects = getAllSubjects();
  const { stats } = useStudent();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Landing Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            P
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
              Prayoga<span className="text-blue-600 dark:text-blue-400">Proof</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
              Phase 1 STEM Lab
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              Student Dashboard
            </Button>
          </Link>
          <Link to="/subjects/physics">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore Labs
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 border border-blue-200/60 dark:border-blue-800/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Empowering Young Scientists Everywhere</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            The Free Interactive{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
              STEM Laboratory
            </span>{' '}
            for School Students
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto leading-relaxed">
            Experiment freely with virtual equipment in Packet-Tracer style interactive workspaces.
            Built offline-first for students in every school and underserved community.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Student Dashboard
              </Button>
            </Link>
            <Link to="/subjects/physics">
              <Button size="lg" variant="secondary" leftIcon={<Zap className="w-4 h-4 text-blue-600" />}>
                Physics Bench (5 Labs)
              </Button>
            </Link>
            <Link to="/subjects/chemistry">
              <Button size="lg" variant="secondary" leftIcon={<FlaskConical className="w-4 h-4 text-emerald-600" />}>
                Chemistry Bench (5 Labs)
              </Button>
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-emerald-500" />
              <span>100% Offline Capable</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Zero Hardware Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span>Curriculum Aligned (CBSE / ICSE / State)</span>
            </div>
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-500" />
              <span>Web, Android & iOS Ready</span>
            </div>
          </div>
        </div>

        {/* Interactive Workspace Schematic Mockup */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="font-mono text-slate-500 ml-2">prayogaproof-canvas://ohms-law</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-slate-400">
                <span className="text-emerald-500 font-semibold">IndexedDB Connected</span>
                <span>•</span>
                <span>Konva Engine</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-left">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Interactive Node Snap
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Packet-Tracer Wiring
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Place battery terminals, meters, and resistance coils freely on the virtual bench with snapped connections.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-left">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Real Chemical Spotting
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Risk-Free Reagents
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Test pH paper, red cabbage indicators, and copper displacement without laboratory safety hazards.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-200/60 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 text-left">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Dual Learning Modes
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Guided & Free Lab
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Follow structured syllabus steps or switch to free canvas mode to create custom experimental setups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Subject Cards Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="primary" className="mb-3">
            Core Curriculum Modules
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            STEM Laboratories
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Physics and Chemistry are fully active with 10 syllabus-standard experiments.
            Biology and Mathematics are in curriculum alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subj) => (
            <SubjectCard
              key={subj.id}
              subject={subj}
              completedCount={
                subj.id === 'physics'
                  ? stats.physicsCompleted
                  : subj.id === 'chemistry'
                  ? stats.chemistryCompleted
                  : 0
              }
            />
          ))}
        </div>
      </section>

      {/* Packet Tracer Free-Form Canvas Vision Section */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                <Compass className="w-4 h-4" />
                Interaction Paradigm
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Modeled after Cisco Packet Tracer for Scientific Discovery
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed text-sm sm:text-base">
                Traditional educational apps lock students into rigid linear animations. PrayogaProof introduces a free-form workspace where learners drag power supplies, light sources, test tubes, and meters onto an infinite digital bench.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Free-Form Workspace Topology
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Wire components however you like, inspect node voltages, and test what happens when values change.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Local Offline Workspaces
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Save, rename, and reopen multiple student bench arrangements saved directly in browser IndexedDB.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Guided Mode Fallback
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Step-by-step guidance for beginners ensuring every student meets exam syllabus criteria.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Phase 1 Architecture Status</span>
                <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Fully Verified
                </span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Physics Module (5 Experiments)</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Chemistry Module (5 Experiments)</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Biology Module</span>
                  <Badge variant="warning">Coming Soon</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Mathematics Module</span>
                  <Badge variant="warning">Coming Soon</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">IndexedDB Persistence</span>
                  <Badge variant="primary">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
