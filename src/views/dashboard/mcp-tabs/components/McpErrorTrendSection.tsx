import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { type McpTimeRange, useMcpUsageChart } from '@/composables/use-mcp-usage-chart';
import type { GlobalTimeRange } from '@/types/dashboard';
import { McpPerformanceChart } from './McpPerformanceChart';

export function McpErrorTrendSection({
  timeRange,
  refreshKey,
}: {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { data, loading, error } = useMcpUsageChart(timeRange as McpTimeRange, undefined, refreshKey);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-6 px-8 pt-1 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="mt-5">
              <h3 className="font-semibold">{t('dashboard.error_tab.trend', 'Error Trends')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.mcp.error_trend_desc', 'Analyze the breakdown of total errors over time.')}
              </p>
            </div>
          </div>

          {error === null ? (
            <McpPerformanceChart data={data} loading={loading} metric="errors" timeRange={timeRange as McpTimeRange} />
          ) : (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
