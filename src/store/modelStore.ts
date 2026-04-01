import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Plan } from '../services/api';

const MODEL_STORAGE_KEY = 'selected_models';

export const PLAN_MODELS: Record<Plan, string[]> = {
  paid: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  gpt: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'],
  timely: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini'],
  free: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
};

export const DEFAULT_MODELS: Record<Plan, string> = {
  paid: 'claude-sonnet-4-6',
  gpt: 'gpt-4o-mini',
  timely: 'gpt-4.1',
  free: 'gemini-2.0-flash',
};

interface ModelStore {
  models: Partial<Record<Plan, string>>;
  setModel: (plan: Plan, model: string) => void;
  getModel: (plan: Plan) => string;
}

export const useModelStore = create<ModelStore>((set, get) => ({
  models: {},
  setModel: (plan, model) => {
    const next = { ...get().models, [plan]: model };
    set({ models: next });
    SecureStore.setItemAsync(MODEL_STORAGE_KEY, JSON.stringify(next));
  },
  getModel: (plan) => get().models[plan] ?? DEFAULT_MODELS[plan],
}));

// 앱 시작 시 저장된 모델 설정 복원
SecureStore.getItemAsync(MODEL_STORAGE_KEY).then((stored) => {
  if (stored) {
    try {
      useModelStore.setState({ models: JSON.parse(stored) });
    } catch {
      // ignore malformed data
    }
  }
});
