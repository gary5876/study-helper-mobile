import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Plan } from '../services/api';

const MODEL_STORAGE_KEY = 'selected_models';

export const PLAN_MODELS: Record<Plan, string[]> = {
  paid: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-sonnet-4-5', 'claude-haiku-4-5-20251001'],
  gpt:  ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini', 'o3'],
  timely: [
    // 추천
    'auto',
    'gpt-5.4-mini',
    'gemini-3.1-flash-lite',
    'claude-haiku-4-5-20251001',
    'llama-4-scout-17b',
    'mistral-small',
    'solar-pro3',
    'grok-4.1-fast-reasoning',
    // OpenAI
    'gpt-5.4-nano', 'gpt-5.4', 'gpt-5.3-chat', 'gpt-5.2', 'gpt-5.2-chat',
    'gpt-5.1', 'gpt-5.1-chat', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano',
    'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini', 'o4-mini', 'o3',
    // Gemini
    'gemini-3-flash', 'gemini-3.1-pro',
    'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash',
    // Claude
    'claude-sonnet-4-6', 'claude-sonnet-4-5', 'claude-opus-4-6',
    // Mistral
    'mistral-medium', 'mistral-large', 'magistral-medium', 'magistral-small',
    'devstral-medium', 'codestral',
    // Grok
    'grok-4.1-fast-non-reasoning', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning',
    'grok-4', 'grok-3', 'grok-3-mini', 'grok-code-fast',
    // Upstage
    'solar-pro2',
    // Qwen
    'qwen-qwq-32b',
  ],
  free: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
};

export const DEFAULT_MODELS: Record<Plan, string> = {
  paid:   'claude-sonnet-4-6',
  gpt:    'gpt-4o-mini',
  timely: 'auto',
  free:   'gemini-2.0-flash',
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
