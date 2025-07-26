import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9234eb9c09864612868f7b9a404611fc',
  appName: 'Walmart Flight Tracker',
  webDir: 'dist',
  server: {
    url: 'https://9234eb9c-0986-4612-868f-7b9a404611fc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;