import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { McpMethodBreakdownItem, McpStatsDimension } from '@/api/mcp/stats';
import { getMcpMethodBreakdown, getMcpStatsOverview, getMcpStatsTimeSeries } from '@/api/mcp/stats';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TimeRange } from '@/composables/use-usage-chart';
import { formatDuration } from '@/utils/utils';
import { McpLatencySection } from './McpLatencySection';
import { McpPerfStatCards } from './McpPerfStatCards';

interface McpPerformanceTabProps {
  readonly dimension: McpStatsDimension;
  readonly id: string;
  readonly timeRange: TimeRange;
}

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
                  {item.count.toLocaleString()} req ·{' '}
                  {item.avg_duration_ms === null ? '—' : formatDuration(item.avg_duration_ms)} avg
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

export function McpPerformanceTab({ dimension, id, timeRange }: McpPerformanceTabProps): React.JSX.Element {
  const { t } = useTranslation();

  const apiRange = timeRange === 'today' ? '24h' : timeRange;

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['mcp-stats-overview', dimension, id, apiRange],
    queryFn: async () => {
      const res = await getMcpStatsOverview({ dimension, id, range: apiRange });
      if (!res.ok) {
        throw new Error('Failed to fetch MCP stats overview');
      }
      return res.data;
    },
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['mcp-stats-timeseries', dimension, id, apiRange],
    queryFn: async () => {
      const res = await getMcpStatsTimeSeries({ dimension, id, range: apiRange });
      if (!res.ok) {
        throw new Error('Failed to fetch MCP time series');
      }
      return res.data.data;
    },
  });

  const { data: methodData, isLoading: methodLoading } = useQuery({
    queryKey: ['mcp-stats-methods', dimension, id, apiRange],
    queryFn: async () => {
      const res = await getMcpMethodBreakdown({ dimension, id, range: apiRange });
      if (!res.ok) {
        throw new Error('Failed to fetch MCP method breakdown');
      }
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <McpLatencySection data={timeSeriesData ?? []} loading={timeSeriesLoading} timeRange={timeRange} />
      <McpPerfStatCards overview={overviewData} loading={overviewLoading} />

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
