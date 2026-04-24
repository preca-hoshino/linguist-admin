/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStatsOverview, getStatsToday } from '@/api/model/stats';
import { useProviderStats } from '../use-provider-stats';

vi.mock('@/api/model/stats');

describe('useProviderStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch today and overview simultaneously', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: true, data: { today_requests: 1 } } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: { total_requests: 10 } } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.today?.today_requests).toBe(1);
    expect(result.current.overview?.total_requests).toBe(10);
  });

  it('should support fallback range', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: true, data: {} } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'invalid'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getStatsOverview).toHaveBeenCalledWith(expect.objectContaining({ range: '24h' }));
  });

  it('should custom dimension', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: true, data: {} } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'today', 'provider_model'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getStatsOverview).toHaveBeenCalledWith(expect.objectContaining({ dimension: 'provider_model' }));
  });

  it('should manual refresh', async () => {
    vi.mocked(getStatsToday).mockResolvedValue({ ok: true, data: {} } as never);
    vi.mocked(getStatsOverview).mockResolvedValue({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'today'));
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

  it('should handle API layer error 1', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: false, error: { message: 'err1' } } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err1');
  });

  it('should handle API layer error 2', async () => {
    vi.mocked(getStatsToday).mockResolvedValueOnce({ ok: true, data: {} } as never);
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: false, error: { message: 'err2' } } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err2');
  });

  it('should handle throw error', async () => {
    vi.mocked(getStatsToday).mockRejectedValueOnce(new Error('err3'));
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err3');
  });

  it('should handle string error', async () => {
    vi.mocked(getStatsToday).mockRejectedValueOnce('err4');
    vi.mocked(getStatsOverview).mockResolvedValueOnce({ ok: true, data: {} } as never);
    const { result } = renderHook(() => useProviderStats('p-1', 'today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err4');
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
    renderHook(() => useProviderStats('p-1', 'today'));
    expect(getStatsToday).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(getStatsToday).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
