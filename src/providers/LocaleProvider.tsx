import { createContext, useContext } from 'react';
import { type LocaleState, useLocaleLogic } from '@/composables/use-locale';
import '@/i18n';

// Import i18n to ensure it's initialized

const LocaleContext = createContext<LocaleState | null>(null);

export function LocaleProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const localeValue = useLocaleLogic();
  return <LocaleContext value={localeValue}>{children}</LocaleContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = (): LocaleState => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
