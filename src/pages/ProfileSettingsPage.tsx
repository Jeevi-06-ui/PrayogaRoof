import React, { useState } from 'react';
import {
  User,
  Download,
  Trash2,
  CheckCircle2,
  Sun,
  Moon,
  Laptop,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Breadcrumbs } from '../components/shared/Breadcrumbs';
import { Modal } from '../components/shared/Modal';
import { exportStudentData } from '../services/studentProgressService';
import { ThemeMode } from '../types';

export const ProfileSettingsPage: React.FC = () => {
  const { profile, updateProfile, stats, resetAll } = useStudent();
  const { theme, setTheme } = useTheme();

  // Local state for profile form
  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState(profile.grade);
  const [schoolName, setSchoolName] = useState(profile.schoolName);
  const [region, setRegion] = useState(profile.region);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Reset confirmation modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim() || 'Curious Learner',
      grade,
      schoolName: schoolName.trim() || 'Prayoga Partner School',
      region: region.trim() || 'Underserved Community Lab',
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleExportData = async () => {
    const dataString = await exportStudentData();
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prayogaproof-student-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetAll();
    setIsResetting(false);
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Student Profile & Settings' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Student Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your local laboratory identity, preferences, and IndexedDB data.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Learner Identity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Grade / Class
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Grade 7">Grade 7 (Middle School)</option>
                  <option value="Grade 8">Grade 8 (Middle School)</option>
                  <option value="Grade 9">Grade 9 (Secondary School)</option>
                  <option value="Grade 10">Grade 10 (Secondary Board Exam)</option>
                  <option value="Grade 11">Grade 11 (Higher Secondary)</option>
                  <option value="Grade 12">Grade 12 (Senior Secondary)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  School / Institution
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Govt High School, Rural Division"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Region / State
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Karnataka, India"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSavedSuccess ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Data stored locally in browser storage.
                </span>
              )}
              <Button type="submit" variant="primary" size="sm">
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Appearance & Design System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Theme & Visual Accessibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'system', label: 'System Auto', icon: Laptop },
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'dark', label: 'Dark Mode', icon: Moon },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as ThemeMode)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Storage & IndexedDB Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>IndexedDB Storage & Privacy Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            PrayogaProof respects student privacy and functions without third-party tracking. All experiment progress, observation notes, and custom lab workspaces are stored client-side in your device&apos;s IndexedDB database.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Database Name</span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                prayogaproof-storage
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Active Workspaces</span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {stats.totalWorkspacesCreated} records
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Completed Labs</span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {stats.completedExperiments} / {stats.totalActiveExperiments}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportData}
            >
              Export JSON Backup
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsResetModalOpen(true)}
            >
              Reset All Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset All Local Laboratory Progress?"
        description="This will permanently clear your saved virtual workspaces, experiment completion status, and observation notes from IndexedDB."
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReset}
              isLoading={isResetting}
            >
              Yes, Reset Everything
            </Button>
          </>
        }
      >
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span>
            You can export a JSON backup file prior to resetting if you wish to archive your laboratory journal records.
          </span>
        </div>
      </Modal>
    </div>
  );
};
