import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthState {
  session: Session | null;
  initializing: boolean;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initializing: true,
  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, initializing: false });
    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      set({ session });
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
