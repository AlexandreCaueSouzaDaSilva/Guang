import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.guang.app',
  appName: 'Guang',
  webDir: 'dist/public',
  server: {
    url: 'https://guang-production.up.railway.app',
    cleartext: true
  }
};

export default config;