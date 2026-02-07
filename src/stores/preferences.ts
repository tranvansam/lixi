import { defineStore } from 'pinia';
import { i18n } from '@/i18n';
import {
  getInitialLanguage,
  LANGUAGE_STORAGE_KEY,
  type LanguageCode,
} from '@/composables/useLanguages';

const ACCENT_TOKENS = {
  indigo: '#4f46e5',
  teal: '#0d9488',
  orange: '#f97316',
} as const;

export type AccentKey = keyof typeof ACCENT_TOKENS;
export type Language = LanguageCode;

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const syncDarkClass = (enabled: boolean) => {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('dark', enabled);
};

const syncAccentVariable = (accent: AccentKey) => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--dynamic-accent-color', ACCENT_TOKENS[accent]);
};

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    darkMode: prefersDark(),
    accent: 'indigo' as AccentKey,
    language: getInitialLanguage() as Language,
  }),
  getters: {
    availableAccents: () =>
      (Object.entries(ACCENT_TOKENS) as [AccentKey, string][]).map(([key, hex]) => ({
        key,
        hex,
      })),
  },
  actions: {
    initTheme() {
      syncDarkClass(this.darkMode);
      syncAccentVariable(this.accent);
    },
    init() {
      this.initTheme();
      this.initLanguage();
    },
    setDarkMode(enabled: boolean) {
      this.darkMode = enabled;
      syncDarkClass(enabled);
    },
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode);
    },
    setAccent(accent: AccentKey) {
      this.accent = accent;
      syncAccentVariable(accent);
    },
    setLanguage(language: Language) {
      this.language = language;
      // Handle both string and WritableComputedRef types
      if (typeof i18n.global.locale === 'string') {
        (i18n.global as any).locale = language;
      } else {
        (i18n.global.locale as any).value = language;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      }
    },
    initLanguage() {
      // Handle both string and WritableComputedRef types
      if (typeof i18n.global.locale === 'string') {
        (i18n.global as any).locale = this.language;
      } else {
        (i18n.global.locale as any).value = this.language;
      }
    },
  },
});

