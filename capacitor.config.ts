import type { CapacitorConfig } from '@capacitor/cli';

/**
 * PrayogaProof Capacitor Configuration
 * Pre-configured for seamless Android and iOS compilation in future phases.
 */
const config: CapacitorConfig = {
  appId: 'org.prayogaproof.stemlab',
  appName: 'PrayogaProof',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
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
