import { createContext, useContext } from 'react';
import { type ThemeState, useThemeLogic } from '@/composables/use-theme';

const ThemeContext = createContext<ThemeState | null>(null);

interface ThemeProviderProps {
  readonly children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const themeValue = useThemeLogic();
  return <ThemeContext value={themeValue}>{children}</ThemeContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeState => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
