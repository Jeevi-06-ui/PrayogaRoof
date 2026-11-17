import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PrayogaProof ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-10 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            {this.props.fallbackTitle || 'Laboratory Error Encountered'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {this.props.fallbackMessage ||
              'An unexpected runtime issue occurred in the interactive workspace. Your progress and saved laboratory data in IndexedDB remain safe.'}
          </p>
          {this.state.error && (
            <div className="p-3 mb-6 rounded-lg bg-white dark:bg-slate-900 border border-red-200/60 dark:border-red-900/40 text-left font-mono text-xs text-red-700 dark:text-red-300 overflow-x-auto max-h-32">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={this.handleReset}
            >
              Reset Component
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Home className="w-4 h-4" />}
              onClick={() => (window.location.href = '/')}
            >
              Return Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
