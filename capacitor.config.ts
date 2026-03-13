import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legacyfit.app',
  appName: 'LegacyFit',
  webDir: 'dist',
  server: {
    url: 'https://02761c3c-61e0-4e61-9b90-3ed624c7a2e2.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
