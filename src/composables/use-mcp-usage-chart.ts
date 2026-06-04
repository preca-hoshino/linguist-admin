import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMcpStatsTimeSeries,
  type McpStatsDimension,
  type McpStatsParams,
  type McpStatsRange,
} from '@/api/mcp/stats';

export type McpTimeRange = 'today' | '7d' | '30d';

export interface McpChartPoint {
  tickLabel: string;
  isoTime: string;
  requests: number | null;
  errors: number | null;
  avg_duration_ms: number | null;
  p95_duration_ms: number | null;
}

export interface McpStatsFilterOptions {
  dimension?: McpStatsDimension;
  id?: string;
}

const RANGE_CONFIG: Record<McpTimeRange, { range: McpStatsRange; interval: string }> = {
  today: { range: '24h', interval: '15m' },
  '7d': { range: '7d', interval: '6h' },
  '30d': { range: '30d', interval: '1d' },
};

function formatTickLabel(isoTime: string): string {
  const d = new Date(isoTime);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${h}:${m}`;
}

export function formatMcpTickDisplay(tickLabel: string, timeRange: McpTimeRange): string {
  const [datePart, timePart] = tickLabel.split(' ');
  if (timeRange === 'today') {
    return timePart ?? tickLabel;
  }
  const [month, day] = (datePart ?? '').split('.');
  return `${Number(month)}.${Number(day)}`;
}

export function formatMcpTooltipTime(isoTime: string, timeRange: McpTimeRange): string {
  const d = new Date(isoTime);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  switch (timeRange) {
    case 'today': {
      return `${h}:${m}`;
    }
    case '7d': {
      return `${month}.${day} ${h}:${m}`;
    }
    case '30d': {
      return `${month}.${day}`;
    }
    default: {
      return isoTime;
    }
  }
}

const POLL_INTERVAL_MS = 60_000;

export function useMcpUsageChart(
  timeRange: McpTimeRange,
  filterOptions?: McpStatsFilterOptions,
  refreshKey?: number,
): { data: McpChartPoint[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<McpChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const config = RANGE_CONFIG[timeRange];

      const params: McpStatsParams = {
        range: config.range,
        interval: config.interval,
        ...(filterOptions?.dimension === undefined ? {} : { dimension: filterOptions.dimension }),
        ...(filterOptions?.id === undefined ? {} : { id: filterOptions.id }),
      };

      const res = await getMcpStatsTimeSeries(params);
      if (!res.ok) {
        throw new Error(res.error.message);
      }

      const points: McpChartPoint[] = res.data.data.map((p) => {
        const hasNoRequests = p.requests === 0;
        return {
          tickLabel: formatTickLabel(p.ts),
          isoTime: p.ts,
          requests: p.requests,
          errors: p.errors,
          avg_duration_ms: hasNoRequests ? null : p.avg_duration_ms,
          p95_duration_ms: hasNoRequests ? null : p.p95_duration_ms,
        };
      });

      setData(points);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    } finally {
      setLoading(false);
    }
  }, [timeRange, filterOptions]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: force re-fetch on refreshKey change
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
  }, [fetchData, refreshKey]);

  return { data, loading, error };
}
