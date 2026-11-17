import type { CapacitorConfig } from '@capacitor/cli';

/**
 * PrayogaProof Mobile Capacitor Configuration
 *
 * Configured for native Android and iOS application packaging.
 * Loads the compiled production web bundle from `../dist`.
 */
const config: CapacitorConfig = {
  appId: 'com.prayogaproof.mobile',
  appName: 'PrayogaProof',
  webDir: '../dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
