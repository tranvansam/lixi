import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export const LANGUAGE_STORAGE_KEY = 'app-language';
export const supportedLanguageCodes = ['en', 'ko', 'zh'] as const;
export type LanguageCode = (typeof supportedLanguageCodes)[number];

const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * Check if language code is supported
 */
export const isSupportedLanguage = (value: string | null): value is LanguageCode =>
  Boolean(value && supportedLanguageCodes.includes(value as LanguageCode));

/**
 * Get initial language from localStorage
 */
export const getInitialLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(saved) ? saved : DEFAULT_LANGUAGE;
};

/**
 * Composable for language options
 */
export const useLanguageOptions = () => {
  const { t } = useI18n();
  
  // Computed - derived value from i18n
  const languageOptions = computed(() =>
    supportedLanguageCodes.map((code) => ({
      code,
      label: t(`language.${code}`),
    })),
  );

  return { 
    languageOptions, // Computed - OK to return as-is
  };
};
