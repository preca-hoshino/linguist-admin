import { Clock, Gauge, type LucideIcon, Timer, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type ChartPoint, type TimeRange, useUsageChart } from '@/composables/use-usage-chart';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';

interface StatDef {
  labelKey: string;
  fallback: string;
  descKey: string;
  descFallback: string;
  dataKey: keyof ChartPoint;
  icon: LucideIcon;
  format: (v: number) => string;
  unitFn: (v: number) => string;
}

function formatMs(v: number): string {
  if (v >= 1000) {
    return (v / 1000).toFixed(2);
  }
  return Math.round(v).toString();
}

function msUnit(v: number): string {
  return v >= 1000 ? 's' : 'ms';
}

const STATS: StatDef[] = [
  {
    labelKey: 'dashboard.perf.stat_e2e',
    fallback: 'E2E',
    descKey: 'dashboard.perf.stat_e2e_desc',
    descFallback: 'Average round-trip latency',
    dataKey: 'avg_latency_ms',
    icon: Clock,
    format: formatMs,
    unitFn: msUnit,
  },
  {
    labelKey: 'dashboard.perf.stat_ttft',
    fallback: 'TTFT',
    descKey: 'dashboard.perf.stat_ttft_desc',
    descFallback: 'Average time to first token',
    dataKey: 'ttft_avg_ms',
    icon: Timer,
    format: formatMs,
    unitFn: msUnit,
  },
  {
    labelKey: 'dashboard.perf.stat_itl',
    fallback: 'ITL',
    descKey: 'dashboard.perf.stat_itl_desc',
    descFallback: 'Average inter-token latency',
    dataKey: 'itl_avg_ms',
    icon: Gauge,
    format: formatMs,
    unitFn: msUnit,
  },
  {
    labelKey: 'dashboard.perf.stat_tok_s',
    fallback: 'Generation Rate',
    descKey: 'dashboard.perf.stat_tok_s_desc',
    descFallback: 'Average generation rate',
    dataKey: 'tok_s_avg',
    icon: Zap,
    format: (v: number) => v.toFixed(1),
    unitFn: () => 'tok/s',
  },
];

/** 从数据序列中取最后一个有有效请求数据的点 */
function getLatestValidPoint(data: ChartPoint[]): ChartPoint | null {
  for (let i = data.length - 1; i >= 0; i--) {
    const p = data[i];
    if (p && p.requests !== null && p.requests > 0) {
      return p;
    }
  }
  return null;
}

export function PerfStatCards({
  timeRange,
  providerId,
  filterOptions,
  refreshKey,
}: {
  readonly timeRange: GlobalTimeRange;
  readonly providerId?: string;
  readonly filterOptions?: StatsFilterOptions;
  readonly refreshKey?: number | undefined;
}): React.JSX.Element {
  const { t } = useTranslation();
  const opts =
    filterOptions ??
    (providerId !== undefined && providerId !== '' ? { dimension: 'provider' as const, id: providerId } : undefined);
  const { data, loading } = useUsageChart(timeRange as TimeRange, opts, refreshKey);

  const point = getLatestValidPoint(data);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const rawVal = point ? (point[stat.dataKey] as number | null) : null;

        if (loading && !point) {
          return (
            <Card key={stat.dataKey} className="gap-4 py-5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium">{t(stat.labelKey, stat.fallback)}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="mt-4 h-4 w-48" />
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={stat.dataKey} className="gap-4 py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">{t(stat.labelKey, stat.fallback)}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold tracking-normal">
                {rawVal === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <>
                    {stat.format(rawVal)}
                    <span className="ml-1 text-lg font-medium text-muted-foreground">{stat.unitFn(rawVal)}</span>
                  </>
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{t(stat.descKey, stat.descFallback)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
