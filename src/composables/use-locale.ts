import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCookie, setCookie } from '@/utils/cookies';

export type Locale = 'zh-CN' | 'en';

const DEFAULT_LOCALE: Locale = 'zh-CN';
const LOCALE_COOKIE_NAME = 'vite-ui-locale';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 年

export interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function useLocaleLogic(options?: { defaultLocale?: Locale; storageKey?: string }): LocaleState {
  const { defaultLocale = DEFAULT_LOCALE, storageKey = LOCALE_COOKIE_NAME } = options ?? {};

  const { i18n } = useTranslation();

  const [locale, applyLocale] = useState<Locale>(
    () => (getCookie(storageKey) as Locale | undefined) ?? (i18n.language as Locale | undefined) ?? defaultLocale,
  );

  const setLocale = (l: Locale): void => {
    setCookie(storageKey, l, LOCALE_COOKIE_MAX_AGE);
    void i18n.changeLanguage(l);
    applyLocale(l);
  };

  return { locale, setLocale };
}
