import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cookies from '@/utils/cookies';
import { useFontLogic } from '../use-font';

vi.mock('@/utils/cookies');

describe('useFontLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with first font if no cookie', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    const { result } = renderHook(() => useFontLogic());

    expect(result.current.font).toBe('inter');
  });

  it('should restore from cookie', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('manrope');
    const { result } = renderHook(() => useFontLogic());

    expect(result.current.font).toBe('manrope');
  });

  it('should update state and cookie on setFont', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('inter');
    const { result } = renderHook(() => useFontLogic());

    act(() => {
      result.current.setFont('manrope');
    });

    expect(cookies.setCookie).toHaveBeenCalledWith('font', 'manrope', expect.any(Number));
    expect(result.current.font).toBe('manrope');
  });

  it('should reset back to default', () => {
    vi.mocked(cookies.getCookie).mockReturnValue('manrope');
    const { result } = renderHook(() => useFontLogic());

    act(() => {
      result.current.resetFont();
    });

    expect(cookies.removeCookie).toHaveBeenCalledWith('font');
    expect(result.current.font).toBe('inter');
  });
});
