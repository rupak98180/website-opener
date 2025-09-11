import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1925596347be4d01b42481d21a5c6371',
  appName: 'tab-speed-probe',
  webDir: 'dist',
  server: {
    url: 'https://19255963-47be-4d01-b424-81d21a5c6371.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false
    }
  }
};

export default config;