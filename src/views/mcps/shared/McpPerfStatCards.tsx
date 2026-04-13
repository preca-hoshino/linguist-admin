import { Activity, AlertTriangle, Clock, type LucideIcon, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { McpStatsOverview } from '@/api/mcp-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDuration, formatDurationUnit } from '@/utils/utils';

interface StatDef {
  labelKey: string;
  fallback: string;
  descKey: string;
  descFallback: string;
  icon: LucideIcon;
  getValue: (overview: McpStatsOverview) => number | null;
  format: (v: number) => string;
  unitFn: (v: number) => string;
}

const STATS: StatDef[] = [
  {
    labelKey: 'dashboard.perf.stat_e2e',
    fallback: 'E2E Average',
    descKey: 'mcpPage.performance.stat_e2e_desc',
    descFallback: 'Average round-trip latency',
    icon: Clock,
    getValue: (overview) => overview.avg_duration_ms,
    format: formatDuration,
    unitFn: formatDurationUnit,
  },
  {
    labelKey: 'mcpPage.performance.stat_p95',
    fallback: 'P95 Latency',
    descKey: 'mcpPage.performance.stat_p95_desc',
    descFallback: '95th percentile latency',
    icon: Activity,
    getValue: (overview) => overview.p95_duration_ms,
    format: formatDuration,
    unitFn: formatDurationUnit,
  },
  {
    labelKey: 'mcpPage.performance.stat_rpm',
    fallback: 'Average RPM',
    descKey: 'mcpPage.performance.stat_rpm_desc',
    descFallback: 'Requests per minute in window',
    icon: Zap,
    getValue: (overview) => overview.rpm,
    format: (v: number) => v.toFixed(2),
    unitFn: () => 'req/min',
  },
  {
    labelKey: 'mcpPage.performance.stat_error_rate',
    fallback: 'Error Rate',
    descKey: 'mcpPage.performance.stat_error_desc',
    descFallback: 'Percentage of failed requests',
    icon: AlertTriangle,
    getValue: (overview) => overview.error_rate * 100,
    format: (v: number) => v.toFixed(2),
    unitFn: () => '%',
  },
];

interface McpPerfStatCardsProps {
  readonly overview: McpStatsOverview | undefined;
  readonly loading: boolean;
}

export function McpPerfStatCards({ overview, loading }: McpPerfStatCardsProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const rawVal = overview ? stat.getValue(overview) : null;

        if (loading && !overview) {
          return (
            <Card key={stat.fallback} className="gap-4 py-5">
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
          <Card key={stat.fallback} className="gap-4 py-5">
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
