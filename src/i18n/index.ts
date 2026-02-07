import { createI18n } from 'vue-i18n';
import en from './locales/en';
import ko from './locales/ko';
import zh from './locales/zh';
import { getInitialLanguage, type LanguageCode } from '@/composables/useLanguages';

const messages: Record<LanguageCode, typeof en> = {
  en,
  ko,
  zh,
};

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLanguage(),
  fallbackLocale: 'en',
  messages,
});

export default i18n;

