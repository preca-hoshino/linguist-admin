import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStatsTimeSeries } from '@/api/model/stats';
import { formatTooltipTime, getTickInterval, useUsageChart } from '../use-usage-chart';

vi.mock('@/api/model/stats');

describe('useUsageChart properties', () => {
  describe('formatTooltipTime', () => {
    it('handles today format', () => {
      const d = new Date('2026-04-05T08:05:00Z');
      expect(formatTooltipTime(d.toISOString(), 'today')).toMatch(/^\d{2}:\d{2}$/);
    });

    it('handles 7d format', () => {
      const d = new Date('2026-04-05T08:05:00Z');
      expect(formatTooltipTime(d.toISOString(), '7d')).toMatch(/^(1[0-2]|[1-9])\.\d{1,2}\s\d{2}:\d{2}$/);
    });

    it('handles 30d format', () => {
      const d = new Date('2026-04-05T08:05:00Z');
      expect(formatTooltipTime(d.toISOString(), '30d')).toMatch(/^(1[0-2]|[1-9])\.\d{1,2}$/);
    });
  });

  describe('getTickInterval', () => {
    it('handles today', () => {
      expect(getTickInterval('today', 144)).toBe(11);
      expect(getTickInterval('today', 5)).toBe(0);
    });

    it('handles 7d', () => {
      expect(getTickInterval('7d', 168)).toBe(23);
      expect(getTickInterval('7d', 3)).toBe(0);
    });

    it('handles 30d', () => {
      expect(getTickInterval('30d', 120)).toBe(14);
      expect(getTickInterval('30d', 5)).toBe(0);
    });
  });
});

describe('useUsageChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data and map accurately', async () => {
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({
      ok: true,
      data: {
        data: [
          { time: '2026-04-05T08:00:00Z', requests: 0, error_count: 0, timeout_count: 0, rate_limit_count: 0 },
          {
            time: '2026-04-05T09:00:00Z',
            requests: 10,
            total_tokens: 100,
            rpm: 20,
            tpm: 200,
            prompt_tokens: 50,
            completion_tokens: 50,
            cached_tokens: 0,
            error_count: 1,
            timeout_count: 0,
            rate_limit_count: 0,
            avg_latency_ms: 500,
            p50_latency_ms: 450,
            p90_latency_ms: 600,
            p99_latency_ms: 800,
            ttft_avg_ms: 100,
            ttft_p50_ms: 90,
            ttft_p90_ms: 150,
            ttft_p99_ms: 200,
            itl_avg_ms: 20,
            itl_p50_ms: 18,
            itl_p90_ms: 25,
            itl_p99_ms: 30,
          },
        ],
      },
    } as unknown as Awaited<ReturnType<typeof getStatsTimeSeries>>);

    const { result } = renderHook(() => useUsageChart('today', { dimension: 'virtual_model', id: 'm-1' }));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getStatsTimeSeries).toHaveBeenCalledWith(expect.objectContaining({ dimension: 'virtual_model', id: 'm-1' }));

    const data = result.current.data;
    expect(data[0]?.requests).toBeNull();
    expect(data[0]?.tok_s_avg).toBeNull();
    // requests=0 且 error_count=0 时，错误字段也应为 null
    expect(data[0]?.error_count).toBeNull();

    const secondPoint = data[1];
    if (secondPoint != null) {
      expect(secondPoint.requests).toBe(10);
      expect(secondPoint.avg_latency_ms).toBe(500);
      expect(secondPoint.tok_s_avg).toBe(1000 / 20);
    }
  });

  it('should preserve error fields when requests=0 but error_count>0', async () => {
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({
      ok: true,
      data: {
        data: [
          {
            time: '2026-04-05T08:00:00Z',
            requests: 0,
            error_count: 3,
            timeout_count: 1,
            rate_limit_count: 2,
          },
        ],
      },
    } as unknown as Awaited<ReturnType<typeof getStatsTimeSeries>>);

    const { result } = renderHook(() => useUsageChart('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const point = result.current.data[0];
    // 请求类字段应为 null（断线）
    expect(point?.requests).toBeNull();
    expect(point?.total_tokens).toBeNull();
    // 错误类字段应保留实际值（独立于 requests 判断）
    expect(point?.error_count).toBe(3);
    expect(point?.timeout_count).toBe(1);
    expect(point?.rate_limit_count).toBe(2);
  });

  it('handles API error', async () => {
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({ ok: false, error: { message: 'err3' } } as unknown as Awaited<
      ReturnType<typeof getStatsTimeSeries>
    >);
    const { result } = renderHook(() => useUsageChart('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err3');
  });

  it('handles arbitrary thrown Error', async () => {
    vi.mocked(getStatsTimeSeries).mockRejectedValueOnce(new Error('err4'));
    const { result } = renderHook(() => useUsageChart('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err4');
  });

  it('handles arbitrary string thrown', async () => {
    vi.mocked(getStatsTimeSeries).mockRejectedValueOnce('err5');
    const { result } = renderHook(() => useUsageChart('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('err5');
  });

  it('handles optional missing itl_avg_ms calculation', async () => {
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({
      ok: true,
      data: { data: [{ time: '2026-04-05T09:00:00Z', requests: 10, itl_avg_ms: 0, itl_p50_ms: null }] },
    } as unknown as Awaited<ReturnType<typeof getStatsTimeSeries>>);
    const { result } = renderHook(() => useUsageChart('30d'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect((result.current.data[0] as unknown as Record<string, unknown>).tok_s_avg).toBeNull();
  });

  it('polling and refresh test', async () => {
    vi.mocked(getStatsTimeSeries).mockResolvedValue({ ok: true, data: { data: [] } } as unknown as Awaited<
      ReturnType<typeof getStatsTimeSeries>
    >);

    const { result, rerender } = renderHook(({ rk }) => useUsageChart('today', undefined, rk), {
      initialProps: { rk: 0 },
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getStatsTimeSeries).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refresh();
    });
    await waitFor(() => {
      expect(getStatsTimeSeries).toHaveBeenCalledTimes(2);
    });

    rerender({ rk: 1 });
    await waitFor(() => {
      expect(getStatsTimeSeries).toHaveBeenCalledTimes(3);
    });
  });

  it('should interval polling', () => {
    vi.useFakeTimers();
    vi.mocked(getStatsTimeSeries).mockReturnValue(
      new Promise(() => {
        // never resolves
      }),
    );
    renderHook(() => useUsageChart('today'));
    expect(getStatsTimeSeries).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(120_000);
    expect(getStatsTimeSeries).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
