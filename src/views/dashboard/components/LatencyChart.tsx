import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { type ChartPoint, formatTooltipTime, getTickInterval, type TimeRange } from '@/composables/use-usage-chart';
import { renderIsolatedDot } from './ChartDot';

export type LatencyMetricKey = 'e2e' | 'ttft' | 'itl';

interface LatencyChartProps {
  readonly data: ChartPoint[];
  readonly metric: LatencyMetricKey;
  readonly loading: boolean;
  readonly timeRange: TimeRange;
}

/** 4 条分位线定义 */
const PERCENTILE_LINES = [
  { suffix: 'avg', label: 'Avg', color: 'hsl(220, 90%, 56%)', strokeWidth: 3 },
  { suffix: 'p50', label: 'P50', color: 'hsl(142, 71%, 45%)', strokeWidth: 2 },
  { suffix: 'p90', label: 'P90', color: 'hsl(35, 92%, 50%)', strokeWidth: 2 },
  { suffix: 'p99', label: 'P99', color: 'hsl(0, 84%, 60%)', strokeWidth: 2 },
];

/** 根据 metric + 分位后缀，拼出 ChartPoint 上对应的字段名 */
function resolveDataKey(metric: LatencyMetricKey, suffix: string): keyof ChartPoint {
  if (metric === 'e2e') {
    return (suffix === 'avg' ? 'avg_latency_ms' : `${suffix}_latency_ms`) as keyof ChartPoint;
  }
  // ttft / itl: ttft_avg_ms, ttft_p50_ms …
  return `${metric}_${suffix}_ms` as keyof ChartPoint;
}

function formatLatencyValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}s`;
  }
  return `${Math.round(value)}ms`;
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ dataKey?: string | number; value?: number | null; color?: string; name?: string }>;
  readonly label?: string;
  readonly timeRange: TimeRange;
  readonly point?: ChartPoint;
}

function CustomTooltip({ payload, timeRange }: CustomTooltipProps): React.JSX.Element | null {
  if (!payload || payload.length === 0) {
    return null;
  }
  const firstEntry = payload[0] as { payload?: ChartPoint } | undefined;
  const point = firstEntry?.payload;
  if (!point) {
    return null;
  }

  const title = formatTooltipTime(point.isoTime, timeRange);

  return (
    <div className="min-w-[140px] rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1.5 font-medium text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const val = entry.value;
          return (
            <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}</span>
              </div>
              <span className="font-mono font-medium">
                {val !== null && val !== undefined ? formatLatencyValue(val) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SHARED_LINE_PROPS = {
  type: 'monotone' as const,
  dot: false,
  activeDot: { r: 4, strokeWidth: 0 },
  connectNulls: false,
  animationDuration: 600,
};

export function LatencyChart({ data, metric, loading, timeRange }: LatencyChartProps): React.JSX.Element {
  const tickInterval = useMemo(() => getTickInterval(timeRange, data.length), [timeRange, data.length]);

  if (loading) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
        <XAxis
          dataKey="tickLabel"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={tickInterval}
          minTickGap={40}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatLatencyValue}
          className="fill-muted-foreground"
        />
        <Tooltip
          content={<CustomTooltip timeRange={timeRange} />}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        {PERCENTILE_LINES.map((line) => {
          const resolvedKey = resolveDataKey(metric, line.suffix) as string;
          return (
            <Line
              key={line.suffix}
              {...SHARED_LINE_PROPS}
              dot={(props: Record<string, unknown>) =>
                renderIsolatedDot(props, data as unknown as Record<string, unknown>[], resolvedKey)
              }
              dataKey={resolvedKey}
              name={line.label}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
