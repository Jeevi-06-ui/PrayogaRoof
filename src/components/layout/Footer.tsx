import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                P
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Prayoga<span className="text-blue-600 dark:text-blue-400">Proof</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              Cross-platform interactive STEM laboratory for school students, especially underserved communities.
              Designed for free-form virtual experimentation on web, Android, and iOS.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> 100% Offline IndexedDB
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" /> Free & Accessible
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Laboratories
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/subjects/physics" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Physics Virtual Bench
                </Link>
              </li>
              <li>
                <Link to="/subjects/chemistry" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Chemistry Spotting Lab
                </Link>
              </li>
              <li>
                <Link to="/subjects/biology" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  Biology <span className="text-[10px] text-amber-500 font-mono">(Coming Soon)</span>
                </Link>
              </li>
              <li>
                <Link to="/subjects/mathematics" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1">
                  Mathematics <span className="text-[10px] text-purple-500 font-mono">(Coming Soon)</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              System Architecture
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Student Data & Local Storage
                </Link>
              </li>
              <li className="text-slate-400">
                React Konva Canvas Engine
              </li>
              <li className="text-slate-400">
                Capacitor Ready (iOS / Android)
              </li>
              <li className="text-slate-400">
                PWA Standalone Mode
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 PrayogaProof. Built for open science education.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for young scientists
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
