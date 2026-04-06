import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { type TimeRange, useUsageChart } from '@/composables/use-usage-chart';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { type MetricKey, UsageChart } from './UsageChart';

/** metric tab 定义 */
const METRIC_TABS = [
  { key: 'tokens', labelKey: 'dashboard.metric.tokens', fallback: 'Tokens' },
  { key: 'requests', labelKey: 'dashboard.metric.requests', fallback: 'Requests' },
  { key: 'rpm', labelKey: 'dashboard.metric.rpm', fallback: 'RPM' },
  { key: 'tpm', labelKey: 'dashboard.metric.tpm', fallback: 'TPM' },
] as const;

export function UsageSection({
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
  const [metric, setMetric] = useState<MetricKey>('tokens');

  const opts =
    filterOptions ??
    (providerId !== undefined && providerId !== '' ? { dimension: 'provider' as const, id: providerId } : undefined);
  const { data, loading, error } = useUsageChart(timeRange as TimeRange, opts, refreshKey);

  const activeTab = METRIC_TABS.find((tab) => tab.key === metric) ?? METRIC_TABS[0];

  return (
    <div className="space-y-3">
      {/* 选项页内部不再需要标题和独立的时间选择器，全交由顶端控制 */}

      {/* Card 内：Tabs + 图表 */}
      <Card>
        <CardContent className="space-y-6 px-8 pt-1 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold">{t(activeTab.labelKey, activeTab.fallback)}</h3>
              <p className="text-sm text-muted-foreground">
                {metric === 'tokens' &&
                  t('dashboard.metric.tokens_desc', 'Prompt, Completion, and Cached tokens consumed')}
                {metric === 'requests' && t('dashboard.metric.requests_desc', 'Total API requests processed')}
                {metric === 'rpm' && t('dashboard.metric.rpm_desc', 'Average requests per minute')}
                {metric === 'tpm' && t('dashboard.metric.tpm_desc', 'Average tokens per minute')}
              </p>
            </div>
            <Tabs
              value={metric}
              onValueChange={(v) => {
                setMetric(v as MetricKey);
              }}
            >
              <TabsList>
                {METRIC_TABS.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    {t(tab.labelKey, tab.fallback)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {error == null ? (
            <UsageChart data={data} metric={metric} loading={loading} timeRange={timeRange as TimeRange} />
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
