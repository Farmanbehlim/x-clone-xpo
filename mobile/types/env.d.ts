import { Constants } from 'expo-constants';

type EnvironmentName = 'development' | 'staging' | 'production';

interface CustomExpoConfig {
  extra?: {
    API_BASE_URL: string;
    CLERK_PUBLISHABLE_KEY: string;
    FIREBASE_API_KEY: string;
    SENTRY_DSN?: string;
    ENVIRONMENT: EnvironmentName;
    DEBUG: boolean;
    router: {
      origin: boolean;
    };
    eas: {
      projectId: string;
    };
  };
}

// Extend Expo's Constants type
declare module 'expo-constants' {
  interface Constants {
    expoConfig?: CustomExpoConfig;
  }
}