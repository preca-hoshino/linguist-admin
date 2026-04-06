import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import zhCN from './locales/zh-CN';

const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  en: {
    translation: en,
  },
};

export const defaultNS = 'translation';
export const fallbackLng = 'zh-CN';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng,
    defaultNS,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['cookie', 'navigator'],
      lookupCookie: 'vite-ui-locale',
      caches: ['cookie'],
    },
  });

export { default } from 'i18next';
