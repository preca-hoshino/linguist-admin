import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { type TimeRange, useUsageChart } from '@/composables/use-usage-chart';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { GenerationRateChart } from './GenerationRateChart';

interface GenerationRateSectionProps {
  readonly timeRange: GlobalTimeRange;
  readonly providerId?: string;
  readonly filterOptions?: StatsFilterOptions;
  readonly refreshKey?: number | undefined;
}

export function GenerationRateSection({
  timeRange,
  providerId,
  filterOptions,
  refreshKey,
}: GenerationRateSectionProps): React.JSX.Element {
  const { t } = useTranslation();
  const opts =
    filterOptions ??
    (providerId !== undefined && providerId !== '' ? { dimension: 'provider' as const, id: providerId } : undefined);
  const { data, loading, error } = useUsageChart(timeRange as TimeRange, opts, refreshKey);

  return (
    <Card>
      <CardContent className="space-y-6 px-8 pt-1 pb-6">
        <div>
          <h3 className="font-semibold">{t('dashboard.perf.generation_rate', 'Generation Rate')}</h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'dashboard.perf.generation_rate_desc',
              'Tokens per second across all models, computed from inter-token latency (tok/s)',
            )}
          </p>
        </div>

        {error !== null && error !== '' ? (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <GenerationRateChart data={data} loading={loading} timeRange={timeRange as TimeRange} />
        )}
      </CardContent>
    </Card>
  );
}
