/**
 * Mobile Authentication Redirect & Deep-link Handler
 *
 * Captures native app launch URLs (e.g. `com.prayogaproof.mobile://auth/callback`)
 * on Android and iOS devices, extracting access tokens or OAuth verification
 * codes and delegating to Supabase Auth.
 */

import { App as CapacitorApp } from '@capacitor/app';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export function initializeMobileAuthDeepLinks(): () => void {
  if (typeof window === 'undefined') return () => {};

  let isSubscribed = true;

  CapacitorApp.addListener('appUrlOpen', async (data) => {
    if (!isSubscribed) return;
    const url = data.url;

    if (!url || !url.startsWith('com.prayogaproof.mobile')) {
      return;
    }

    try {
      if (url.includes('#access_token=') || url.includes('?code=') || url.includes('&access_token=')) {
        // Parse hash fragment or query params
        const hashIndex = url.indexOf('#');
        const queryIndex = url.indexOf('?');
        const fragment = hashIndex !== -1 ? url.substring(hashIndex + 1) : '';
        const query = queryIndex !== -1 ? url.substring(queryIndex + 1) : '';

        const params = new URLSearchParams(fragment || query);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken && isSupabaseConfigured()) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to process native mobile auth redirect:', err);
    }
  }).catch((err) => {
    // Gracefully handle if not running inside Capacitor native shell
    console.debug('Capacitor App listener not attached (web environment):', err);
  });

  return () => {
    isSubscribed = false;
  };
}
