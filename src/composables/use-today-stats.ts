import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatsOverview, getStatsToday } from '@/api/model/stats';
import type { StatsOverview, StatsToday } from '@/types';

/** today 端点 + 当日 overview 端点的并行数据 */
export interface TodayStatsData {
  today: StatsToday | null;
  overview: StatsOverview | null;
}

const POLL_INTERVAL_MS = 60_000;

/** 获取今日 00:00 的 ISO 字符串（当地时区） */
function todayStartIso(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

/**
 * 并行请求 /api/stats/today 和 /api/stats/overview（from=今日零点）
 * 提供 60 秒自动轮询与手动刷新。
 */
export function useTodayStats(): TodayStatsData & { loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<TodayStatsData>({ today: null, overview: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [todayRes, overviewRes] = await Promise.all([
        getStatsToday(),
        getStatsOverview({ from: todayStartIso(), to: new Date().toISOString() }),
      ]);

      if (!todayRes.ok) {
        throw new Error(todayRes.error.message);
      }
      if (!overviewRes.ok) {
        throw new Error(overviewRes.error.message);
      }

      setData({ today: todayRes.data, overview: overviewRes.data });
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
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

  return { ...data, loading, error, refresh };
}
