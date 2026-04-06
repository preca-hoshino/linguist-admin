import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatsOverview, getStatsToday } from '@/api/stats';
import type { StatsDimension, StatsOverview, StatsRange, StatsToday } from '@/types';

const POLL_INTERVAL_MS = 60_000;

/** 全局时间范围 → API range 映射 */
const RANGE_MAP: Record<string, StatsRange> = {
  today: '24h',
  '7d': '7d',
  '30d': '30d',
};

/**
 * Provider / ProviderModel 维度的 today + overview 统计数据
 * dimension 默认 'provider'（向后兼容），模型详情页传 'provider_model'
 */
export function useProviderStats(
  providerId: string,
  timeRange: string,
  dimension: StatsDimension = 'provider',
): {
  today: StatsToday | null;
  overview: StatsOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [today, setToday] = useState<StatsToday | null>(null);
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const range = RANGE_MAP[timeRange] ?? '24h';
      const [todayRes, overviewRes] = await Promise.all([
        getStatsToday({ dimension, id: providerId }),
        getStatsOverview({ range, dimension, id: providerId }),
      ]);

      if (!todayRes.ok) {
        throw new Error(todayRes.error.message);
      }
      if (!overviewRes.ok) {
        throw new Error(overviewRes.error.message);
      }

      setToday(todayRes.data);
      setOverview(overviewRes.data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      setLoading(false);
    }
  }, [providerId, timeRange, dimension]);

  const refresh = useCallback(() => {
    setLoading(true);
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setLoading(true);
    void fetchData();
    timerRef.current = setInterval((): void => {
      void fetchData();
    }, POLL_INTERVAL_MS);
    return (): void => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchData]);

  return { today, overview, loading, error, refresh };
}
