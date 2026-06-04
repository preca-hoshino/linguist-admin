import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  formatMcpTickDisplay,
  formatMcpTooltipTime,
  type McpChartPoint,
  type McpTimeRange,
} from '@/composables/use-mcp-usage-chart';
import { getTickInterval } from '@/composables/use-usage-chart';
import { renderIsolatedDot } from '../../components/ChartDot';

export type McpMetricKey = 'requests' | 'errors' | 'avg_duration_ms' | 'p95_duration_ms';

interface McpPerformanceChartProps {
  readonly data: McpChartPoint[];
  readonly metric: McpMetricKey;
  readonly loading: boolean;
  readonly timeRange: McpTimeRange;
}

const SINGLE_COLORS: Record<McpMetricKey, string> = {
  requests: 'hsl(220, 90%, 56%)',
  errors: 'hsl(0, 84%, 60%)',
  avg_duration_ms: 'hsl(35, 92%, 50%)',
  p95_duration_ms: 'hsl(280, 65%, 55%)',
};

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{
    dataKey?: string | number;
    value?: number | null;
    color?: string;
    payload?: McpChartPoint;
  }>;
  readonly metric: McpMetricKey;
  readonly timeRange: McpTimeRange;
}

function CustomTooltip({ active, payload, metric, timeRange }: CustomTooltipProps): React.JSX.Element | null {
  if (active !== true) {
    return null;
  }

  const point = payload?.[0]?.payload;
  if (!point) {
    return null;
  }

  const title = formatMcpTooltipTime(point.isoTime, timeRange);

  const METRIC_LABELS: Record<McpMetricKey, string> = {
    requests: 'Requests',
    errors: 'Errors',
    avg_duration_ms: 'Avg Latency (ms)',
    p95_duration_ms: 'P95 Latency (ms)',
  };

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1.5 font-medium text-muted-foreground">{title}</p>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{METRIC_LABELS[metric]}</span>
          </div>
          <span className="font-mono font-medium">{entry.value == null ? '—' : formatValue(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

const SHARED_AREA_PROPS = {
  type: 'monotone' as const,
  strokeWidth: 2,
  activeDot: { r: 4, strokeWidth: 0 },
  connectNulls: false,
  isAnimationActive: false,
  fillOpacity: 0.2,
};

function makeDotRenderer(
  dataRef: Record<string, unknown>[],
  dataKey: string,
): (props: Record<string, unknown>) => React.JSX.Element | null {
  return (props: Record<string, unknown>): React.JSX.Element | null => renderIsolatedDot(props, dataRef, dataKey);
}

export function McpPerformanceChart({ data, metric, loading, timeRange }: McpPerformanceChartProps): React.JSX.Element {
  const tickInterval = useMemo(() => getTickInterval(timeRange, data.length), [timeRange, data.length]);

  const dotRenderer = useMemo(() => {
    const dataRef = data as unknown as Record<string, unknown>[];
    return makeDotRenderer(dataRef, metric);
  }, [data, metric]);

  if (loading) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorsingle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={SINGLE_COLORS[metric]} stopOpacity={0.5} />
            <stop offset="95%" stopColor={SINGLE_COLORS[metric]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
        <XAxis
          dataKey="tickLabel"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={tickInterval}
          minTickGap={40}
          className="fill-muted-foreground"
          padding={{ right: 30 }}
          tickFormatter={(v: string) => formatMcpTickDisplay(v, timeRange)}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatValue}
          className="fill-muted-foreground"
        />
        <Tooltip
          content={<CustomTooltip metric={metric} timeRange={timeRange} />}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
          filterNull={false}
        />
        <Area
          {...SHARED_AREA_PROPS}
          dot={dotRenderer}
          dataKey={metric}
          stroke={SINGLE_COLORS[metric]}
          fill="url(#colorsingle)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
