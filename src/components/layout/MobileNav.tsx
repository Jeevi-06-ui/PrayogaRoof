import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Zap,
  Dna,
  Calculator,
  User,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { registerBackHandler } from '../../services/mobile/mobileBackHandler';

export const MobileNav: React.FC = () => {
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const location = useLocation();
  const { stats } = useStudent();

  // Close subjects drawer on route change
  React.useEffect(() => {
    setIsSubjectsOpen(false);
  }, [location.pathname]);

  // Register back button handler when subjects drawer is open
  React.useEffect(() => {
    if (!isSubjectsOpen) return;
    return registerBackHandler(() => {
      setIsSubjectsOpen(false);
      return true;
    });
  }, [isSubjectsOpen]);

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    {
      to: '#subjects',
      label: 'Subjects',
      icon: FlaskConical,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsSubjectsOpen((prev) => !prev);
      },
      isActive: isSubjectsOpen || location.pathname.startsWith('/subjects/'),
    },
    { to: '/workspace', label: 'Lab Canvas', icon: Sparkles },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const subjects = [
    {
      to: '/subjects/physics',
      name: 'Physics',
      desc: 'Mechanics, Optics, Circuits & Electromagnetism',
      count: `${stats.physicsCompleted}/${stats.physicsTotal || 25} Labs`,
      icon: Zap,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    },
    {
      to: '/subjects/chemistry',
      name: 'Chemistry',
      desc: 'Titration, Kinetics, Salt Analysis & Organic Tests',
      count: `${stats.chemistryCompleted}/${stats.chemistryTotal || 27} Labs`,
      icon: FlaskConical,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    },
    {
      to: '/subjects/biology',
      name: 'Biology',
      desc: 'Osmosis, Microscopy, Genetics & Organ Systems',
      count: `${stats.biologyCompleted}/${stats.biologyTotal || 15} Labs`,
      icon: Dna,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    },
    {
      to: '/subjects/mathematics',
      name: 'Mathematics',
      desc: 'Graphing, 3D Geometry, Trigonometry & Calculus',
      count: `${stats.mathematicsCompleted}/${stats.mathematicsTotal || 12} Labs`,
      icon: Calculator,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    },
  ];

  return (
    <>
      {/* Mobile Subjects Quick Drawer / Bottom Sheet */}
      {isSubjectsOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSubjectsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative z-50 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl animate-in slide-in-from-bottom duration-250 safe-bottom max-h-[80vh] overflow-y-auto">
            {/* Drawer Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Select STEM Subject
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose a discipline to explore interactive virtual laboratories
                </p>
              </div>
              <button
                onClick={() => setIsSubjectsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close subject selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {subjects.map((sub) => {
                const Icon = sub.icon;
                return (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setIsSubjectsOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl border ${sub.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {sub.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {sub.count}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {sub.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom App Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 safe-bottom flex items-center justify-around shadow-xl"
        aria-label="Mobile primary navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = item.isActive !== undefined ? item.isActive : false;

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-h-[44px] min-w-[56px] transition-all ${
                  isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl min-h-[44px] min-w-[56px] transition-all ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
