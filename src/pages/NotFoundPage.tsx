import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/shared/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-8 ring-blue-50/50 dark:ring-blue-950/20">
        <Compass className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
        404 - Laboratory Page Not Found
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        The experiment or workspace path you are looking for does not exist or has moved.
      </p>

      <div className="flex items-center gap-3 pt-2">
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Visit Landing
          </Button>
        </Link>
      </div>
    </div>
  );
};
