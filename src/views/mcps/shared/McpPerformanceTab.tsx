// src/views/mcps/shared/McpPerformanceTab.tsx
// 通用 MCP Performance Tab，可同时用于 MCP Provider 和 Virtual MCP

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, Clock, RefreshCw, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { McpMethodBreakdownItem, McpStatsOverview, McpStatsRange, McpStatsTimeSeriesPoint } from '@/api/mcp-stats';
import type { McpStatsDimension } from '@/api/mcp-stats';
import { getMcpMethodBreakdown, getMcpStatsOverview, getMcpStatsTimeSeries } from '@/api/mcp-stats';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/utils';

// ── 时间范围选择器 ─────────────────────────────────────────────────────────────

const RANGE_OPTIONS: { label: string; value: McpStatsRange }[] = [
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
];

function McpRangePicker({
  value,
  onChange,
}: {
  readonly value: McpStatsRange;
  readonly onChange: (v: McpStatsRange) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
      {RANGE_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => {
            onChange(opt.value);
          }}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// ── KPI 卡片 ───────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  icon,
  loading,
  variant = 'default',
}: {
  readonly title: string;
  readonly value: string | number | null;
  readonly icon: React.ReactNode;
  readonly loading: boolean;
  readonly variant?: 'default' | 'error' | 'warning';
}): React.JSX.Element {
  let color = 'text-foreground';
  if (variant === 'error') {
    color = 'text-destructive';
  } else if (variant === 'warning') {
    color = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="text-muted-foreground/60">{icon}</div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className={cn('text-2xl font-bold tracking-tight font-mono', color)}>{value ?? '—'}</div>
        )}
      </CardContent>
    </Card>
  );
}

// ── 时间序列图 ─────────────────────────────────────────────────────────────────

function formatTs(ts: string, range: McpStatsRange): string {
  try {
    const d = new Date(ts);
    if (['15m', '1h', '6h', '24h'].includes(range)) {
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

function formatMs(ms: number | null): string {
  if (ms === null) {
    return '—';
  }
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return String(n);
}

function formatTooltipValue(value: unknown): string {
  if (typeof value !== 'number') {
    return '—';
  }
  return formatNumber(value);
}

interface TimeSeriesChartProps {
  readonly data: McpStatsTimeSeriesPoint[];
  readonly range: McpStatsRange;
  readonly loading: boolean;
}

function TimeSeriesChart({ data, range, loading }: TimeSeriesChartProps): React.JSX.Element {
  const { t } = useTranslation();
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        tick: formatTs(d.ts, range),
      })),
    [data, range],
  );

  if (loading) {
    return <Skeleton className="h-[260px] w-full rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mcpReqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="mcpErrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
        <XAxis
          dataKey="tick"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={formatNumber}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            fontSize: '12px',
          }}
          formatter={(value: unknown, name: string | number | undefined) => [
            formatTooltipValue(value),
            name === 'requests'
              ? t('mcpPage.performance.requests', 'Requests')
              : t('mcpPage.performance.errors', 'Errors'),
          ]}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="requests"
          stroke="hsl(220, 90%, 56%)"
          fill="url(#mcpReqGrad)"
          strokeWidth={2}
          dot={false}
          animationDuration={600}
        />
        <Area
          type="monotone"
          dataKey="errors"
          stroke="hsl(0, 84%, 60%)"
          fill="url(#mcpErrGrad)"
          strokeWidth={2}
          dot={false}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── 方法分布（进度条样式） ────────────────────────────────────────────────────────

const METHOD_COLORS = [
  'hsl(220, 90%, 56%)',
  'hsl(150, 60%, 45%)',
  'hsl(280, 65%, 55%)',
  'hsl(35, 92%, 50%)',
  'hsl(180, 70%, 40%)',
  'hsl(310, 65%, 55%)',
];

function MethodBreakdownChart({
  data,
  loading,
}: {
  readonly data: McpMethodBreakdownItem[];
  readonly loading: boolean;
}): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return <Skeleton className="h-[200px] w-full rounded-lg" />;
  }
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        {t('mcpPage.performance.noData', '暂无数据')}
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const errorPct = item.count > 0 ? Math.round((item.error_count / item.count) * 100) : 0;
        return (
          <div key={item.method} className="flex items-center gap-3">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: METHOD_COLORS[i % METHOD_COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono font-medium truncate">{item.method}</span>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {item.count.toLocaleString()} req · {formatMs(item.avg_duration_ms)} avg
                </span>
              </div>
              <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: METHOD_COLORS[i % METHOD_COLORS.length],
                  }}
                />
              </div>
            </div>
            {item.error_count > 0 && (
              <Badge variant="outline" className="shrink-0 text-[10px] border-destructive/50 text-destructive px-1.5">
                {errorPct}% err
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 主组件 ─────────────────────────────────────────────────────────────────────

interface McpPerformanceTabProps {
  readonly dimension: McpStatsDimension;
  readonly id: string;
}

export function McpPerformanceTab({ dimension, id }: McpPerformanceTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const [range, setRange] = useState<McpStatsRange>('1h');

  const params = { dimension, id, range };

  const {
    data: overviewData,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['mcp-stats-overview', dimension, id, range, params],
    queryFn: async () => {
      const res = await getMcpStatsOverview(params);
      if (!res.ok) {
        throw new Error('Failed to fetch MCP stats overview');
      }
      return res.data;
    },
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['mcp-stats-timeseries', dimension, id, range, params],
    queryFn: async () => {
      const res = await getMcpStatsTimeSeries(params);
      if (!res.ok) {
        throw new Error('Failed to fetch MCP time series');
      }
      return res.data.data;
    },
  });

  const { data: methodData, isLoading: methodLoading } = useQuery({
    queryKey: ['mcp-stats-methods', dimension, id, range, params],
    queryFn: async () => {
      const res = await getMcpMethodBreakdown(params);
      if (!res.ok) {
        throw new Error('Failed to fetch MCP method breakdown');
      }
      return res.data.data;
    },
  });

  const overview: McpStatsOverview | undefined = overviewData;

  function handleRefresh(): void {
    void refetchOverview();
  }

  return (
    <div className="space-y-6">
      {/* 时间范围选择器 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {t('mcpPage.performance.title', '性能监控 (Performance Monitor)')}
        </h3>
        <div className="flex items-center gap-2">
          <McpRangePicker value={range} onChange={setRange} />
          <Button variant="outline" size="sm" className="h-9" onClick={handleRefresh} disabled={overviewLoading}>
            <RefreshCw className={cn('mr-2 h-4 w-4', overviewLoading && 'animate-spin')} />
            {t('dashboard.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* KPI 卡片行 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title={t('mcpPage.performance.totalRequests', 'Total Requests')}
          value={overview == null ? null : overview.total_requests.toLocaleString()}
          icon={<Activity className="h-4 w-4" />}
          loading={overviewLoading}
        />
        <KpiCard
          title={t('mcpPage.performance.rpm', 'RPM')}
          value={overview == null ? null : overview.rpm.toFixed(2)}
          icon={<Zap className="h-4 w-4" />}
          loading={overviewLoading}
        />
        <KpiCard
          title={t('mcpPage.performance.avgDuration', 'Avg Duration')}
          value={overview == null ? null : formatMs(overview.avg_duration_ms)}
          icon={<Clock className="h-4 w-4" />}
          loading={overviewLoading}
          variant={overview?.avg_duration_ms != null && overview.avg_duration_ms > 2000 ? 'warning' : 'default'}
        />
        <KpiCard
          title={t('mcpPage.performance.errorRate', 'Error Rate')}
          value={overview == null ? null : `${(overview.error_rate * 100).toFixed(2)}%`}
          icon={<AlertTriangle className="h-4 w-4" />}
          loading={overviewLoading}
          variant={overview != null && overview.error_rate > 0.05 ? 'error' : 'default'}
        />
      </div>

      {/* 时序图 */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {t('mcpPage.performance.requestTrend', 'Request Trend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSeriesChart data={timeSeriesData ?? []} range={range} loading={timeSeriesLoading} />
          <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              {t('mcpPage.performance.requests', 'Requests')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
              {t('mcpPage.performance.errors', 'Errors')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 方法分布 */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {t('mcpPage.performance.methodBreakdown', 'Method Breakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MethodBreakdownChart data={methodData ?? []} loading={methodLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
