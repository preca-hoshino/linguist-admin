import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatsTimeSeries } from '@/api/model/stats';
import type { StatsDimension, TimeSeriesPoint } from '@/types';

export type TimeRange = 'today' | '7d' | '30d';

const RANGE_CONFIG: Record<TimeRange, { range: '24h' | '7d' | '30d'; interval: string }> = {
  today: { range: '24h', interval: '10m' },
  '7d': { range: '7d', interval: '1h' },
  '30d': { range: '30d', interval: '6h' },
};

export interface CostChartPoint {
  tickLabel: string;
  isoTime: string;
  total_cost: number;
  [key: string]: string | number;
}

function formatTickLabel(isoTime: string, timeRange: TimeRange): string {
  const d = new Date(isoTime);
  if (timeRange === 'today') {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export interface UseCostTrendOptions {
  dimension?: StatsDimension;
  id?: string;
}

export function useCostTrend(
  timeRange: TimeRange,
  options: UseCostTrendOptions = {},
): { data: CostChartPoint[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<CostChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const config = RANGE_CONFIG[timeRange];

      const reqOpts: { dimension?: StatsDimension; id?: string } = {};
      if (options.dimension !== undefined && options.dimension !== 'global' && options.id !== undefined) {
        reqOpts.dimension = options.dimension;
        reqOpts.id = options.id;
      }

      const res = await getStatsTimeSeries({
        range: config.range,
        interval: config.interval,
        ...reqOpts,
      });
      if (!res.ok) {
        throw new Error(res.error.message);
      }

      const pts: CostChartPoint[] = res.data.series.map((p: TimeSeriesPoint) => ({
        tickLabel: formatTickLabel(p.time, timeRange),
        isoTime: p.time,
        total_cost: Math.max(0, p.cost),
        cost: Math.max(0, p.cost),
      }));

      setData(pts);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      setLoading(false);
    }
  }, [timeRange, options.dimension, options.id]);

  useEffect(() => {
    setLoading(true);
    void fetchData();
    timerRef.current = setInterval(() => void fetchData(), 120_000);
    return (): void => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchData]);

  return { data, loading, error };
}
