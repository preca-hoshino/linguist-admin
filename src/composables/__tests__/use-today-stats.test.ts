/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStatsOverview, getStatsToday } from '@/api/stats';
import { useTodayStats } from '../use-today-stats';

vi.mock('@/api/stats');

describe('useTodayStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch today and overview', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: true, data: { a: 1 } } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: { b: 2 } } as never);
    const { result } = renderHook(() => useTodayStats());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.today).toEqual({ a: 1 });
    expect(result.current.overview).toEqual({ b: 2 });
  });

  it('should interval polling', () => {
    vi.useFakeTimers();
    vi.mocked(getStatsToday).mockReturnValue(
      new Promise(() => {
        /* never resolves */
      }),
    );
    vi.mocked(getStatsOverview).mockReturnValue(
      new Promise(() => {
        /* never resolves */
      }),
    );
    renderHook(() => useTodayStats());
    expect(getStatsToday).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(getStatsToday).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('should handle error 1', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: false, error: { message: 'err1' } } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useTodayStats());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err1');
  });

  it('should handle error 2', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: true, data: {} } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: false, error: { message: 'err2' } } as never);
    const { result } = renderHook(() => useTodayStats());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err2');
  });

  it('should handle manual refresh', async () => {
    vi.mocked(getStatsToday).mockResolvedValue({ ok: true, data: {} } as never);
    vi.mocked(getStatsOverview).mockResolvedValue({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useTodayStats());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    act(() => {
      result.current.refresh();
    });
    await waitFor(() => {
      expect(getStatsToday).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle throw error', async () => {
    vi.mocked(getStatsToday).mockRejectedValueOnce(new Error('err3'));
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useTodayStats());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err3');
  });

  it('should handle string error', async () => {
    vi.mocked(getStatsToday).mockRejectedValueOnce('err4');
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useTodayStats());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err4');
  });
});
