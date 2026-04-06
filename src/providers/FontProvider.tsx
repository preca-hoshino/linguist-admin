import { createContext, useContext } from 'react';
import { type FontState, useFontLogic } from '@/composables/use-font';

const FontContext = createContext<FontState | null>(null);

export function FontProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const fontValue = useFontLogic();
  return <FontContext value={fontValue}>{children}</FontContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFont = (): FontState => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};
