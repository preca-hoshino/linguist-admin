/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-assignment */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  let mockMatches = false;
  let listeners: ((e: { matches: boolean }) => void)[] = [];

  beforeEach(() => {
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

  it('should return false if matchMedia is false', () => {
    mockMatches = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true if matchMedia is true', () => {
    mockMatches = true;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should react to change events', () => {
    mockMatches = false;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      mockMatches = true;
      for (const cb of listeners) {
        cb({ matches: true });
      }
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    expect(listeners.length).toBe(1);
    unmount();
    expect(listeners.length).toBe(0);
  });
});
