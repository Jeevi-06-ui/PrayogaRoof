import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  FlaskConical,
  Dna,
  Calculator,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { profile, stats } = useStudent();
  const { effectiveTheme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      to: '/workspace',
      label: 'Interactive Bench',
      icon: Sparkles,
      badge: 'Active',
      activeColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      to: '/subjects/physics',
      label: 'Physics Lab',
      icon: Zap,
      badge: `${stats.physicsCompleted}/5`,
      activeColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      to: '/subjects/chemistry',
      label: 'Chemistry Lab',
      icon: FlaskConical,
      badge: `${stats.chemistryCompleted}/5`,
      activeColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      to: '/subjects/biology',
      label: 'Biology',
      icon: Dna,
      badge: 'Soon',
      comingSoon: true,
    },
    {
      to: '/subjects/mathematics',
      label: 'Mathematics',
      icon: Calculator,
      badge: 'Soon',
      comingSoon: true,
    },
    {
      to: '/profile',
      label: 'Profile & Settings',
      icon: User,
      badge: undefined,
    },
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top Header / Brand */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
            <NavLink
              to="/"
              onClick={handleLinkClick}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                P
              </div>
              {(!collapsed || isMobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight leading-none text-base">
                    Prayoga<span className="text-blue-600 dark:text-blue-400">Proof</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                    Interactive STEM Lab
                  </span>
                </div>
              )}
            </NavLink>

            {/* Desktop collapse button */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2 overflow-y-auto">
            {(!collapsed || isMobileOpen) && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Laboratories & Navigation
              </p>
            )}

            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && item.to !== '/profile' && location.pathname.startsWith(item.to));

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  } ${collapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive
                          ? item.activeColor || 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    {(!collapsed || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {(!collapsed || isMobileOpen) && item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        item.comingSoon
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Student Profile & Quick Toggles */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Offline Ready Status */}
          {(!collapsed || isMobileOpen) && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                IndexedDB Active
              </span>
              <span className="text-[10px] font-mono text-slate-400">Offline-Ready</span>
            </div>
          )}

          {/* Student Profile Quick Pill */}
          <NavLink
            to="/profile"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              collapsed && !isMobileOpen ? 'justify-center p-2' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {profile.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile.grade}
                </p>
              </div>
            )}
          </NavLink>

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              collapsed && !isMobileOpen ? 'justify-center' : 'justify-between px-3'
            }`}
            title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <div className="flex items-center gap-2">
              {effectiveTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
              {(!collapsed || isMobileOpen) && (
                <span>{effectiveTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
