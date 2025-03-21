
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f731d964e4b14da6b8e84be6d427f318',
  appName: 'whatsapp-conversation-inspector',
  webDir: 'dist',
  server: {
    url: 'https://f731d964-e4b1-4da6-b8e8-4be6d427f318.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
