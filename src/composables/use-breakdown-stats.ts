import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatsBreakdown } from '@/api/model/stats';
import type { StatsBreakdownGroupBy, StatsBreakdownItem, StatsDimension, StatsRange } from '@/types';

export type TimeRange = '24h' | '7d' | '30d';

const RANGE_MAP: Record<TimeRange, StatsRange> = {
  '24h': '24h',
  '7d': '7d',
  '30d': '30d',
};

/** 可选的维度过滤参数 */
export interface BreakdownStatsOptions {
  dimension?: StatsDimension;
  id?: string;
}

export function useBreakdownStats(
  groupBy: StatsBreakdownGroupBy,
  timeRange: TimeRange,
  limit = 5,
  options?: BreakdownStatsOptions,
  refreshKey?: number,
): { data: StatsBreakdownItem[]; loading: boolean; error: string | null; refresh: () => Promise<void> } {
  const [data, setData] = useState<StatsBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 用于清理竞态请求
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // 终止前序处于 Pending 状态的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const range = RANGE_MAP[timeRange];

      const result = await getStatsBreakdown(
        {
          group_by: groupBy,
          range,
          ...(options?.dimension ? { dimension: options.dimension, id: options.id } : {}),
        },
        controller.signal,
      );
      if (!result.ok) {
        throw new Error(result.error.message);
      }

      // 只要前 5 名
      setData(result.data.items.slice(0, limit));
    } catch (error_: unknown) {
      if (error_ instanceof DOMException && error_.name === 'AbortError') {
        // 请求被舍弃，不抛出异常
        return;
      }
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [groupBy, timeRange, limit, options?.dimension, options?.id]);

  useEffect(() => {
    void fetchData();
    // 不用开启 setInterval，因为排行榜通常不需要 10 秒刷新一次，加上用户手动切换即可。
    return (): void => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  // 当外部传入 refreshKey 变化时，主动触发一次数据刷新
  useEffect(() => {
    if (refreshKey === undefined || refreshKey === 0) {
      return;
    }
    void fetchData();
  }, [refreshKey, fetchData]);

  return { data, loading, error, refresh: fetchData };
}
