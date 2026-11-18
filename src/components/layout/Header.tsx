import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Zap,
  FlaskConical,
  Microscope,
  Calculator,
  Cloud,
  RefreshCw,
  Clock,
  AlertCircle,
  HardDrive,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useStudent } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { formatSyncStatus } from '../../services/syncService';
import { EXPERIMENTS } from '../../services/experimentRegistry';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const { profile, syncStatus, pendingSyncCount } = useStudent();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const filteredExperiments = searchQuery.trim()
    ? EXPERIMENTS.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.curriculumTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelectExperiment = (expId: string) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    navigate(`/experiments/${expId}`);
  };

  const getSubjectIcon = (subjectId: string) => {
    switch (subjectId) {
      case 'physics':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'chemistry':
        return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      case 'biology':
        return <Microscope className="w-4 h-4 text-teal-500" />;
      case 'mathematics':
        return <Calculator className="w-4 h-4 text-purple-500" />;
      default:
        return <FlaskConical className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-6 flex items-center justify-between gap-3 safe-top">
      {/* Left: Mobile Menu Toggle & Brand Tag */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
            Phase 1 Foundation
          </span>
        </Link>
      </div>

      {/* Center: Search Bar with Autocomplete Dropdown */}
      <div className="relative flex-1 max-w-md mx-1 sm:mx-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={`Search ${EXPERIMENTS.length} experiments, formulas...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/70 border border-transparent focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[38px]"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 max-h-80 overflow-y-auto z-50 animate-in fade-in zoom-in-95">
            {filteredExperiments.length > 0 ? (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Matching Experiments ({filteredExperiments.length})
                </div>
                {filteredExperiments.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => handleSelectExperiment(exp.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors min-h-[44px]"
                  >
                    <div className="mt-0.5">{getSubjectIcon(exp.subjectId)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {exp.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {exp.shortDescription}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching experiments found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick Controls & Profile / Auth */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Sync Status Icon Indicator */}
        <div
          title={formatSyncStatus(syncStatus, pendingSyncCount)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
        >
          {syncStatus === 'synced' ? (
            <Cloud className="w-4 h-4 text-emerald-500" />
          ) : syncStatus === 'syncing' ? (
            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
          ) : syncStatus === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : pendingSyncCount > 0 ? (
            <Clock className="w-4 h-4 text-amber-500" />
          ) : (
            <HardDrive className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle dark/light theme"
        >
          {effectiveTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {user ? (
          <Link
            to="/profile"
            className="p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {profile.name.charAt(0)}
            </div>
            {role === 'teacher' && (
              <span className="hidden md:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Teacher
              </span>
            )}
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs min-h-[36px]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
