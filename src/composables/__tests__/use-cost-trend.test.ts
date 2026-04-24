/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStatsTimeSeries } from '@/api/model/stats';
import { useCostTrend } from '../use-cost-trend';

vi.mock('@/api/model/stats');

describe('useCostTrend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSeries = {
    series: [
      { time: '2026-04-05T08:00:00Z', cost: 1.5 },
      { time: '2026-04-05T09:00:00Z', cost: null },
      { time: '2026-04-05T10:00:00Z', cost: -0.5 },
    ],
  };

  it('should fetch time series and map output correctly for today', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Mocking API response
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({ ok: true, data: mockSeries } as any);
    const { result } = renderHook(() => useCostTrend('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data[0]?.tickLabel).toMatch(/^\d{2}:\d{2}$/);
    expect(result.current.data[1]?.total_cost).toBe(0);
    expect(result.current.data[2]?.total_cost).toBe(0);
  });

  it('should format 7d tick labels', async () => {
    const time = '2026-04-05T12:00:00Z';
    // biome-ignore lint/suspicious/noExplicitAny: Mocking API response
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({ ok: true, data: { series: [{ time, cost: 2 }] } } as any);
    const { result } = renderHook(() => useCostTrend('7d'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data[0]?.tickLabel).toMatch(/^(1[0-2]|[1-9])\.\d{1,2}$/);
  });

  it('should pass dimensions', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Mocking API response
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({ ok: true, data: { series: [] } } as any);
    const { result } = renderHook(() => useCostTrend('30d', { dimension: 'virtual_model', id: 'gpt4' }));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getStatsTimeSeries).toHaveBeenCalledWith(
      expect.objectContaining({ dimension: 'virtual_model', id: 'gpt4' }),
    );
  });

  it('should ignore global dimension', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Mocking API response
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({ ok: true, data: { series: [] } } as any);
    const { result } = renderHook(() => useCostTrend('30d', { dimension: 'global', id: 'gpt4' }));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getStatsTimeSeries).toHaveBeenCalledWith(expect.not.objectContaining({ dimension: 'global' }));
  });

  it('should handle API layer error', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Mocking API response
    vi.mocked(getStatsTimeSeries).mockResolvedValueOnce({ ok: false, error: { message: 'Fetch err' } } as any);
    const { result } = renderHook(() => useCostTrend('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Fetch err');
  });

  it('should handle throw error', async () => {
    vi.mocked(getStatsTimeSeries).mockRejectedValueOnce(new Error('Throw err'));
    const { result } = renderHook(() => useCostTrend('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Throw err');
  });

  it('should handle string error', async () => {
    vi.mocked(getStatsTimeSeries).mockRejectedValueOnce('str err');
    const { result } = renderHook(() => useCostTrend('today'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('str err');
  });

  it('should interval polling', () => {
    vi.useFakeTimers();
    vi.mocked(getStatsTimeSeries).mockReturnValue(
      new Promise(() => {
        /* noop */
      }),
    );
    renderHook(() => useCostTrend('today'));
    expect(getStatsTimeSeries).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(120_000);
    expect(getStatsTimeSeries).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
