import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';

type BackHandlerFn = () => boolean; // Return true if back event was handled and consumed

// Global stack of custom modal / bottom-sheet back handlers
const handlerStack: BackHandlerFn[] = [];

/**
 * Registers a dismiss callback for an open modal, drawer, or bottom sheet.
 * Returns an unregister function.
 */
export function registerBackHandler(handler: BackHandlerFn): () => void {
  handlerStack.push(handler);
  return () => {
    const idx = handlerStack.lastIndexOf(handler);
    if (idx !== -1) {
      handlerStack.splice(idx, 1);
    }
  };
}

/**
 * Global hook to handle Android hardware back button and gesture navigation.
 * Prevents accidental app termination and provides intuitive back navigation.
 */
export function useMobileBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const lastBackPressTimeRef = useRef<number>(0);

  useEffect(() => {
    let listenerHandle: Promise<PluginListenerHandle> | null = null;

    try {
      listenerHandle = App.addListener('backButton', ({ canGoBack }) => {
        // 1. First prioritize active modal, bottom sheet, or drawer dismissal
        for (let i = handlerStack.length - 1; i >= 0; i--) {
          const handled = handlerStack[i]();
          if (handled) return;
        }

        const path = location.pathname;

        // 2. Fullscreen workspace -> go back to experiment details
        if (path.startsWith('/workspace/')) {
          const expId = path.replace('/workspace/', '');
          navigate(`/experiments/${expId}`);
          return;
        }

        // 3. Experiment detail -> return to subject page or dashboard
        if (path.startsWith('/experiments/')) {
          navigate('/dashboard');
          return;
        }

        // 4. Subject pages, Profile, or Settings -> return to dashboard
        if (
          path.startsWith('/subjects/') ||
          path === '/profile' ||
          path === '/settings' ||
          path === '/workspace'
        ) {
          navigate('/dashboard');
          return;
        }

        // 5. On Root or Dashboard: double-press back to exit app
        if (path === '/dashboard' || path === '/') {
          const now = Date.now();
          if (now - lastBackPressTimeRef.current < 2000) {
            App.exitApp();
          } else {
            lastBackPressTimeRef.current = now;
            // Native-style toast notification
            if (typeof document !== 'undefined') {
              const toast = document.createElement('div');
              toast.textContent = 'Press back again to exit PrayogaProof';
              toast.className =
                'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 text-white text-xs font-semibold rounded-full shadow-2xl border border-slate-700 pointer-events-none transition-opacity duration-300';
              document.body.appendChild(toast);
              setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
              }, 1800);
            }
          }
          return;
        }

        // 6. Default fallback
        if (canGoBack) {
          navigate(-1);
        } else {
          navigate('/dashboard');
        }
      });
    } catch {
      // Non-Capacitor environment (desktop web)
    }

    return () => {
      if (listenerHandle) {
        listenerHandle.then((h) => h.remove()).catch(() => {});
      }
    };
  }, [location.pathname, navigate]);
}
