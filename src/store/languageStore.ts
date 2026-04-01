import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Lang } from '../i18n/strings';

const LANG_KEY = 'app_language';

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  lang: 'ko',
  setLang: (lang) => {
    set({ lang });
    SecureStore.setItemAsync(LANG_KEY, lang);
  },
  toggle: () => {
    const next: Lang = get().lang === 'ko' ? 'en' : 'ko';
    get().setLang(next);
  },
}));

// 앱 시작 시 저장된 언어 복원
SecureStore.getItemAsync(LANG_KEY).then((stored) => {
  if (stored === 'ko' || stored === 'en') {
    useLanguageStore.setState({ lang: stored as Lang });
  }
});
