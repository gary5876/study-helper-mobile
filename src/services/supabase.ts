import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../config/env';

const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const options: SupabaseClientOptions<'public'> = {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
};

export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  options,
);
