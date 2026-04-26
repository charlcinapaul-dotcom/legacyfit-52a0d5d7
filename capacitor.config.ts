import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legacyfitvirtual.app',
  appName: 'LegacyFit',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'LegacyFit uses your location to track walking distance during active GPS walks and help users progress through journey challenges.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'LegacyFit uses your location in the background to continue tracking your walk even when the screen is off.',
      UIBackgroundModes: ['location'],
    },
  },
};

export default config;
