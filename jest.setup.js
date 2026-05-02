// Jest setup — runs after the test framework is installed.
// 1) Stub @supabase/supabase-js so modules that initialize a client at import
//    time (e.g. src/services/supabase.ts) don't throw "supabaseUrl is required"
//    in CI where EXPO_PUBLIC_SUPABASE_URL is not set. Tests don't hit Supabase.
// 2) Wire @testing-library/jest-native matchers into expect.
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      exchangeCodeForSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }),
}));

require('@testing-library/jest-native/extend-expect');
