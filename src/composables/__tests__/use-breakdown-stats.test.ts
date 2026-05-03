/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-assertions */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStatsBreakdown } from '@/api/model/stats';
import { type TimeRange, useBreakdownStats } from '../use-breakdown-stats';

vi.mock('@/api/model/stats');

const noop = (): void => {
  /* init */
};

describe('useBreakdownStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    data: [
      { name: 'A', request_count: 100 },
      { name: 'B', request_count: 90 },
      { name: 'C', request_count: 80 },
      { name: 'D', request_count: 70 },
      { name: 'E', request_count: 60 },
      { name: 'F', request_count: 50 },
    ],
  };

  it('should fetch data successfully and slice to limit', async () => {
    vi.mocked(getStatsBreakdown).mockResolvedValueOnce({ ok: true, data: mockData } as never);
    const { result } = renderHook(() => useBreakdownStats('provider', '24h', 3));
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toHaveLength(3);
  });

  it('should include dimension and id options in api call', async () => {
    vi.mocked(getStatsBreakdown).mockResolvedValueOnce({ ok: true, data: { data: [] } } as never);
    const { result } = renderHook(() =>
      useBreakdownStats('virtual_model', '7d', 5, { dimension: 'provider', id: 'openai' }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getStatsBreakdown).toHaveBeenCalledWith(
      expect.objectContaining({ dimension: 'provider', id: 'openai' }),
      expect.any(AbortSignal),
    );
  });

  it('should handle API HTTP level error', async () => {
    vi.mocked(getStatsBreakdown).mockResolvedValueOnce({ ok: false, error: { message: 'Server failed' } } as never);
    const { result } = renderHook(() => useBreakdownStats('provider', '24h'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Server failed');
  });

  it('should handle network throws', async () => {
    vi.mocked(getStatsBreakdown).mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useBreakdownStats('provider', '24h'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-Error throws', async () => {
    vi.mocked(getStatsBreakdown).mockRejectedValueOnce('Some string error');
    const { result } = renderHook(() => useBreakdownStats('provider', '24h'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Some string error');
  });

  it('should ignore silent AbortError throws', async () => {
    vi.mocked(getStatsBreakdown).mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));
    const { result } = renderHook(() => useBreakdownStats('provider', '24h'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
  });

  it('should abort previous request when dependencies change', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Mocking promise resolution
    let resolve1: (value: any) => void = noop;
    // biome-ignore lint/suspicious/noExplicitAny: Mocking promise resolution
    let resolve2: (value: any) => void = noop;
    vi.mocked(getStatsBreakdown)
      .mockReturnValueOnce(
        new Promise((r) => {
          resolve1 = r;
        }),
      )
      .mockReturnValueOnce(
        new Promise((r) => {
          resolve2 = r;
        }),
      );

    const { result, rerender } = renderHook(({ range }: { range: TimeRange }) => useBreakdownStats('provider', range), {
      initialProps: { range: '24h' as TimeRange },
    });

    rerender({ range: '7d' as TimeRange });
    // biome-ignore lint/suspicious/noExplicitAny: Bypass strict typing for test resolution
    const res1 = { ok: true, data: { data: [{ name: '1', request_count: 1 }] } } as any;

    act(() => {
      resolve1(res1);
    });
    expect(result.current.loading).toBe(true);
    // biome-ignore lint/suspicious/noExplicitAny: Bypass strict typing for test resolution
    const res2 = { ok: true, data: { data: [{ name: '2', request_count: 2 }] } } as any;

    act(() => {
      resolve2(res2);
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data[0]?.name).toBe('2');
  });

  it('should trigger refresh when refreshKey changes', async () => {
    vi.mocked(getStatsBreakdown).mockResolvedValue({ ok: true, data: { data: [] } } as never);
    const { rerender } = renderHook(({ rk }) => useBreakdownStats('provider', '24h', 5, undefined, rk), {
      initialProps: { rk: 0 },
    });
    await waitFor(() => {
      expect(getStatsBreakdown).toHaveBeenCalledTimes(1);
    });
    rerender({ rk: 1 });
    await waitFor(() => {
      expect(getStatsBreakdown).toHaveBeenCalledTimes(2);
    });
    rerender({ rk: 0 });
    await new Promise((r) => setTimeout(r, 10));
    expect(getStatsBreakdown).toHaveBeenCalledTimes(2);
  });
});
