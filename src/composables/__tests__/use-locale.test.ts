/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { act, renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as cookies from '@/utils/cookies';
import { useLocaleLogic } from '../use-locale';

vi.mock('@/utils/cookies');
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('useLocaleLogic', () => {
  const changeLanguageMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTranslation).mockReturnValue({
      i18n: {
        language: undefined,
        changeLanguage: changeLanguageMock,
      } as never,
    } as never);
  });

  it('should initialize with default locale if no cookie or i18n lang', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    const { result } = renderHook(() => useLocaleLogic());

    expect(result.current.locale).toBe('zh-CN');
  });

  it('should initialize with i18n language fallback', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    vi.mocked(useTranslation).mockReturnValue({
      i18n: { language: 'en', changeLanguage: changeLanguageMock } as never,
    } as never);

    const { result } = renderHook(() => useLocaleLogic());
    expect(result.current.locale).toBe('en');
  });

  it('should initialize with cookie locale over others', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('en');
    vi.mocked(useTranslation).mockReturnValue({
      i18n: { language: 'zh-CN', changeLanguage: changeLanguageMock } as never,
    } as never);

    const { result } = renderHook(() => useLocaleLogic());
    expect(result.current.locale).toBe('en');
  });

  it('should use custom overrides', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    const { result } = renderHook(() => useLocaleLogic({ defaultLocale: 'en', storageKey: 'cust' }));

    expect(result.current.locale).toBe('en');
    expect(cookies.getCookie).toHaveBeenCalledWith('cust');
  });

  it('should set locale, call i18n and store cookie', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('zh-CN');
    const { result } = renderHook(() => useLocaleLogic());

    act(() => {
      result.current.setLocale('en');
    });

    expect(cookies.setCookie).toHaveBeenCalledWith('vite-ui-locale', 'en', expect.any(Number));
    expect(changeLanguageMock).toHaveBeenCalledWith('en');
    expect(result.current.locale).toBe('en');
  });
});
