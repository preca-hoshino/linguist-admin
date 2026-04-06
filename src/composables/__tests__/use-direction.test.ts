import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cookies from '@/utils/cookies';
import { useDirectionLogic } from '../use-direction';

vi.mock('@/utils/cookies');

describe('useDirectionLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('dir');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with ltr default', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    const { result } = renderHook(() => useDirectionLogic());

    expect(result.current.dir).toBe('ltr');
    expect(result.current.defaultDir).toBe('ltr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });

  it('should restore from cookie', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('rtl');
    const { result } = renderHook(() => useDirectionLogic());

    expect(result.current.dir).toBe('rtl');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('should update state and DOM and cookie on setDir', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('ltr');
    const { result } = renderHook(() => useDirectionLogic());

    act(() => {
      result.current.setDir('rtl');
    });

    expect(cookies.setCookie).toHaveBeenCalledWith('dir', 'rtl', expect.any(Number));
    expect(result.current.dir).toBe('rtl');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('should reset back to default', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('rtl');
    const { result } = renderHook(() => useDirectionLogic());

    act(() => {
      result.current.resetDir();
    });

    expect(cookies.removeCookie).toHaveBeenCalledWith('dir');
    expect(result.current.dir).toBe('ltr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });
});
