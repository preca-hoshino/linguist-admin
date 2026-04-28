import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatsOverview, getStatsToday } from '@/api/model/stats';
import type { StatsOverview, StatsRange, StatsToday } from '@/types';
import type { GlobalTimeRange } from '@/types/dashboard';

/** today 端点 + 全局时间范围对应的 overview 端点的并行数据 */
export interface TodayStatsData {
  today: StatsToday | null;
  overview: StatsOverview | null;
}

const POLL_INTERVAL_MS = 60_000;

/** 将全局时间选择器值映射为 overview API 所需的 StatsRange */
const GLOBAL_RANGE_MAP: Record<GlobalTimeRange, StatsRange> = {
  today: '24h',
  '7d': '7d',
  '30d': '30d',
};

/**
 * 并行请求 /api/stats/today 和 /api/stats/overview。
 * 提供 60 秒自动轮询与手动刷新。
 *
 * - overview 的时间范围跟随 globalRange（today→24h / 7d→7d / 30d→30d）
 * - today 始终查询数据库当日累计（date_trunc('day', NOW())），用于实时卡片主数字
 * - 使用 range 而非 from/to，避免本地时区零点早于最新数据导致查询返回空结果
 */
export function useTodayStats(
  globalRange: GlobalTimeRange = 'today',
): TodayStatsData & { loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<TodayStatsData>({ today: null, overview: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [todayRes, overviewRes] = await Promise.all([
        getStatsToday(),
        getStatsOverview({ range: GLOBAL_RANGE_MAP[globalRange] }),
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
  }, [globalRange]);

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
