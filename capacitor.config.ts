import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legacyfit.app',
  appName: 'LegacyFit',
  webDir: 'dist',
  server: {
    url: 'https://legacyfitvirtual.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'LegacyFit uses your location to track walking distance during active GPS walks and help users progress through journey challenges.',
    },
  },
};

export default config;
