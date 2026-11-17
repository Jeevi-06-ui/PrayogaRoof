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
  GraduationCap
} from 'lucide-react';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingState';

export const MathematicsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

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

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
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
