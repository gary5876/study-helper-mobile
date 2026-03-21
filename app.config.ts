/**
 * Dynamic Expo config — replaces static app.json for multi-environment support.
 *
 * Set environment variables via EAS Secrets or local .env files:
 *   BACKEND_URL, SENTRY_DSN, APP_ENVIRONMENT
 *
 * Build profiles (eas.json):
 *   development → BACKEND_URL defaults to localhost
 *   staging     → BACKEND_URL points to staging server
 *   production  → BACKEND_URL points to prod server
 */
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_ENVIRONMENT === 'staging' ? 'study-helper (Staging)' : 'study-helper',
  slug: 'fundamentals',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#14532d',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier:
      process.env.APP_ENVIRONMENT === 'production'
        ? 'com.fundamentals.app'
        : `com.fundamentals.app.${process.env.APP_ENVIRONMENT || 'dev'}`,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#14532d',
    },
    package:
      process.env.APP_ENVIRONMENT === 'production'
        ? 'com.fundamentals.app'
        : `com.fundamentals.app.${process.env.APP_ENVIRONMENT || 'dev'}`,
    permissions: ['READ_EXTERNAL_STORAGE', 'RECEIVE_BOOT_COMPLETED', 'VIBRATE'],
  },
  web: { favicon: './assets/favicon.png' },
  plugins: [
    ['expo-notifications', { icon: './assets/notification-icon.png', color: '#6c63ff' }],
    'expo-secure-store',
    'expo-document-picker',
  ],
  owner: 'gary5876',
  extra: {
    backendUrl: process.env.BACKEND_URL || 'https://study-helper-backend-production.up.railway.app',
    environment: process.env.APP_ENVIRONMENT || 'development',
    eas: {
      projectId: '165d5a36-a5e2-4d7b-aef9-4de9374d73aa',
    },
  },
});
