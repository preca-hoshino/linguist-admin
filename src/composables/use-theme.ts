import { useEffect, useMemo, useState } from 'react';
import { getCookie, removeCookie, setCookie } from '@/utils/cookies';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = Exclude<Theme, 'system'>;

const DEFAULT_THEME: Theme = 'system';
const THEME_COOKIE_NAME = 'vite-ui-theme';
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 年

export interface ThemeState {
  defaultTheme: Theme;
  resolvedTheme: ResolvedTheme;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resetTheme: () => void;
}

/**
 * 主题管理 composable。
 * 自包含：从 cookie 初始化 → DOM classList 操作 → 持久化写回 cookie。
 * 可独立使用，不依赖 Provider。
 */
export function useThemeLogic(options?: { defaultTheme?: Theme; storageKey?: string }): ThemeState {
  const { defaultTheme = DEFAULT_THEME, storageKey = THEME_COOKIE_NAME } = options ?? {};

  const [theme, updateTheme] = useState<Theme>(() => (getCookie(storageKey) as Theme | undefined) ?? defaultTheme);

  const resolvedTheme = useMemo((): ResolvedTheme => {
    if (theme === 'system') {
      return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme as ResolvedTheme;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (t: ResolvedTheme): void => {
      root.classList.remove('light', 'dark');
      root.classList.add(t);
    };

    const handleChange = (): void => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    applyTheme(resolvedTheme);
    mediaQuery.addEventListener('change', handleChange);
    return (): void => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, resolvedTheme]);

  const setTheme = (t: Theme): void => {
    setCookie(storageKey, t, THEME_COOKIE_MAX_AGE);
    updateTheme(t);
  };

  const resetTheme = (): void => {
    removeCookie(storageKey);
    updateTheme(DEFAULT_THEME);
  };

  return { defaultTheme, resolvedTheme, theme, setTheme, resetTheme };
}
