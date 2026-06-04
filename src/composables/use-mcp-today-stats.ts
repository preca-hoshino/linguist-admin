import { useCallback, useEffect, useRef, useState } from 'react';
import type { McpStatsOverview, McpStatsToday } from '@/api/mcp/stats';
import { getMcpStatsOverview, getMcpStatsToday } from '@/api/mcp/stats';
import type { GlobalTimeRange } from '@/types/dashboard';
import { mapGlobalRangeToApi } from '@/types/dashboard';

export interface McpTodayStatsData {
  today: McpStatsToday | null;
  overview: McpStatsOverview | null;
}

const POLL_INTERVAL_MS = 60_000;

/**
 * 并行请求 /mcp/stats/today 和 /mcp/stats/overview。
 * 提供 60 秒自动轮询与手动刷新。
 *
 * - overview 的时间范围跟随 globalRange（today→24h / 7d→7d / 30d→30d）
 * - today 始终查询数据库当日累计，用于实时卡片主数字
 */
export function useMcpTodayStats(
  globalRange: GlobalTimeRange = 'today',
  enabled = true,
): McpTodayStatsData & { loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<McpTodayStatsData>({ today: null, overview: null });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const mappedRange = mapGlobalRangeToApi(globalRange) as '24h' | '7d' | '30d';
      const [todayRes, overviewRes] = await Promise.all([
        getMcpStatsToday(),
        getMcpStatsOverview({ range: mappedRange }),
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
    if (!enabled) {
      return;
    }
    setLoading(true);
    void fetchData();
  }, [fetchData, enabled]);

  useEffect(() => {
    if (!enabled) {
      setData({ today: null, overview: null });
      setLoading(false);
      return;
    }
    void fetchData();
    timerRef.current = setInterval((): void => {
      void fetchData();
    }, POLL_INTERVAL_MS);
    return (): void => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchData, enabled]);

  return { ...data, loading, error, refresh };
}
