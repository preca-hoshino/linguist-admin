/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-assignment */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cookies from '@/utils/cookies';
import { useThemeLogic } from '../use-theme';

vi.mock('@/utils/cookies');

describe('useThemeLogic', () => {
  let mockMatches = false;
  let listeners: ((e: { matches: boolean }) => void)[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query) => ({
        get matches() {
          return mockMatches;
        },
        media: query,
        addEventListener: vi.fn((event, cb) => {
          if (event === 'change') {
            listeners.push(cb);
          }
        }),
        removeEventListener: vi.fn((event, cb) => {
          if (event === 'change') {
            listeners = listeners.filter((l) => l !== cb);
          }
        }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    listeners = [];
  });

  it('should initialize with system as default when no cookie', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    mockMatches = true; // prefers dark

    const { result } = renderHook(() => useThemeLogic());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.className).toContain('dark');
  });

  it('should initialize with system preference light', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    mockMatches = false; // prefers light

    const { result } = renderHook(() => useThemeLogic());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.className).toContain('light');
  });

  it('should override default theme by options', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);

    const { result } = renderHook(() => useThemeLogic({ defaultTheme: 'dark' }));

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.className).toContain('dark');
  });

  it('should read from cookie', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('light');

    const { result } = renderHook(() => useThemeLogic());

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.className).toContain('light');
  });

  it('should allow setTheme', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('dark');

    const { result } = renderHook(() => useThemeLogic());

    act(() => {
      result.current.setTheme('light');
    });

    expect(cookies.setCookie).toHaveBeenCalledWith('vite-ui-theme', 'light', expect.any(Number));
    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.className).toContain('light');
    expect(document.documentElement.className).not.toContain('dark');
  });

  it('should reset Theme', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('light');

    const { result } = renderHook(() => useThemeLogic());

    act(() => {
      result.current.resetTheme();
    });

    expect(cookies.removeCookie).toHaveBeenCalledWith('vite-ui-theme');
    // Default is system
    expect(result.current.theme).toBe('system');
  });

  it('should listen to OS level changes if theme is system', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('system');
    mockMatches = false; // light
    renderHook(() => useThemeLogic());
    expect(document.documentElement.className).toContain('light');

    act(() => {
      mockMatches = true; // dark
      for (const cb of listeners) {
        cb({ matches: true });
      }
    });

    expect(document.documentElement.className).toContain('dark');
    expect(document.documentElement.className).not.toContain('light');
  });

  it('should NOT listen to OS level changes if theme is explicit', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('light');
    mockMatches = false; // light
    renderHook(() => useThemeLogic());
    expect(document.documentElement.className).toContain('light');

    act(() => {
      mockMatches = true; // dark
      for (const cb of listeners) {
        cb({ matches: true });
      }
    });

    // Stays light because explicit
    expect(document.documentElement.className).toContain('light');
  });

  it('should cleanup listener on unmount', () => {
    const { unmount } = renderHook(() => useThemeLogic());
    expect(listeners.length).toBe(1);
    unmount();
    expect(listeners.length).toBe(0);
  });
});
