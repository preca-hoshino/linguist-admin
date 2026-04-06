import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { type TimeRange, useUsageChart } from '@/composables/use-usage-chart';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { ErrorChart } from './ErrorChart';

export function ErrorTrendSection({
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
  const { data, loading, error } = useUsageChart(timeRange as TimeRange, opts, refreshKey);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-6 px-8 pt-1 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold">{t('dashboard.error_tab.trend', 'Error Trends')}</h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  'dashboard.error_tab.trend_desc',
                  'Analyze the breakdown of total errors, timeouts, and rate limits',
                )}
              </p>
            </div>
          </div>

          {error !== null && error !== '' ? (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <ErrorChart data={data} loading={loading} timeRange={timeRange as TimeRange} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
