import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatsOverview, getStatsToday } from '@/api/model/stats';
import type { StatsOverview, StatsToday } from '@/types';

/** today 端点 + 过去 24 小时 overview 端点的并行数据 */
export interface TodayStatsData {
  today: StatsToday | null;
  overview: StatsOverview | null;
}

const POLL_INTERVAL_MS = 60_000;

/**
 * 并行请求 /api/stats/today 和 /api/stats/overview（range=24h，即过去 24 小时）
 * 提供 60 秒自动轮询与手动刷新。
 *
 * overview 使用 range=24h 而非 from/to 本地时区零点，原因：
 *   - from/to 方式以本地时区零点为起点，零点之前的数据（如昨天深夜）一概查不到
 *   - range=24h 以当前时刻往前推 24 小时，始终能覆盖最近的历史数据
 *   - 与后端 getStatsToday 的 date_trunc('day', NOW()) 互补而非冲突
 */
export function useTodayStats(): TodayStatsData & { loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<TodayStatsData>({ today: null, overview: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [todayRes, overviewRes] = await Promise.all([getStatsToday(), getStatsOverview({ range: '24h' })]);

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
