/**
 * Environment configuration.
 *
 * Values are injected at build time via app.config.ts / EAS Secrets / .env files.
 * Never put secrets here — use EAS Secrets for production keys.
 *
 * Usage:
 *   import { ENV } from '../config/env';
 *   console.log(ENV.BACKEND_URL);
 */
import Constants from 'expo-constants';

interface AppConfig {
  BACKEND_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

function getConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra ?? {};

  return {
    BACKEND_URL:
      extra.backendUrl ||
      process.env.EXPO_PUBLIC_BACKEND_URL ||
      'http://localhost:8000',

    ENVIRONMENT: (__DEV__
      ? 'development'
      : extra.environment || 'production') as AppConfig['ENVIRONMENT'],

    SUPABASE_URL: extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export const ENV = getConfig();
