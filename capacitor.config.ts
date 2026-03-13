import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legacyfit.app',
  appName: 'LegacyFit',
  webDir: 'dist',
  server: {
    url: 'https://legacyfitvirtual.com',
    cleartext: false,
  },
};

export default config;
