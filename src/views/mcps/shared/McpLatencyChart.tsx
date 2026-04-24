import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { McpStatsTimeSeriesPoint } from '@/api/mcp/stats';
import { Skeleton } from '@/components/ui/Skeleton';
import { getTickInterval, type TimeRange } from '@/composables/use-usage-chart';

function formatTs(ts: string, timeRange: TimeRange): string {
  try {
    const d = new Date(ts);
    if (timeRange === 'today') {
      return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    }
    return new Intl.DateTimeFormat(undefined, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return ts;
  }
}

function formatDurationForTooltip(ms: number | null): string {
  if (ms === null) {
    return '—';
  }
  if (ms < 1000) {
    return `${ms.toFixed(0)} ms`;
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatAxisDuration(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms.toFixed(0)}ms`;
}

interface McpLatencyChartProps {
  readonly data: McpStatsTimeSeriesPoint[];
  readonly loading: boolean;
  readonly timeRange: TimeRange;
}

export function McpLatencyChart({ data, loading, timeRange }: McpLatencyChartProps): React.JSX.Element {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      tickLabel: formatTs(d.ts, timeRange),
    }));
  }, [data, timeRange]);

  const tickInterval = useMemo(() => getTickInterval(timeRange, data.length), [timeRange, data.length]);

  if (loading) {
    return <Skeleton className="h-[280px] w-full rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(35, 92%, 50%)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(35, 92%, 50%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorP99" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(310, 65%, 55%)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(310, 65%, 55%)" stopOpacity={0} />
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
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={50}
          tickFormatter={formatAxisDuration}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            fontSize: '12px',
          }}
          formatter={(value: unknown, name: string | number | undefined) => {
            const formattedVal = formatDurationForTooltip(typeof value === 'number' ? value : null);
            let label = t('mcpPage.performance.p99Latency', 'P99 Latency');
            if (name === 'avg_duration_ms') {
              label = t('mcpPage.performance.avgLatency', 'Avg Latency');
            } else if (name === 'p95_duration_ms') {
              label = t('mcpPage.performance.p95Latency', 'P95 Latency');
            }
            return [formattedVal, label];
          }}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="p99_duration_ms"
          stroke="hsl(310, 65%, 55%)"
          fill="url(#colorP99)"
          strokeWidth={2}
          dot={false}
          animationDuration={600}
          connectNulls={false}
        />
        <Area
          type="monotone"
          dataKey="p95_duration_ms"
          stroke="hsl(35, 92%, 50%)"
          fill="url(#colorP95)"
          strokeWidth={2}
          dot={false}
          animationDuration={600}
          connectNulls={false}
        />
        <Area
          type="monotone"
          dataKey="avg_duration_ms"
          stroke="hsl(150, 60%, 45%)"
          fill="url(#colorAvg)"
          strokeWidth={2}
          dot={false}
          animationDuration={600}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
