import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.santech.community_listening',
  appName: 'RICH CLS',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
        enabled: true
    },
    CapacitorCookies: {
        enabled: true
    }
  }
};

export default config;
