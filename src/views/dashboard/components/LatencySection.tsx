import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { type TimeRange, useUsageChart } from '@/composables/use-usage-chart';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { LatencyChart, type LatencyMetricKey } from './LatencyChart';

const LATENCY_TABS: { key: LatencyMetricKey; labelKey: string; fallback: string }[] = [
  { key: 'e2e', labelKey: 'dashboard.latency_tab.e2e_short', fallback: 'E2E' },
  { key: 'ttft', labelKey: 'dashboard.latency_tab.ttft_short', fallback: 'TTFT' },
  { key: 'itl', labelKey: 'dashboard.latency_tab.itl_short', fallback: 'ITL' },
];

const DESCRIPTIONS: Record<LatencyMetricKey, { key: string; fallback: string }> = {
  e2e: { key: 'dashboard.latency_tab.e2e_desc', fallback: 'Total round-trip time experienced by the client.' },
  ttft: { key: 'dashboard.latency_tab.ttft_desc', fallback: 'Time to first token in streaming mode.' },
  itl: { key: 'dashboard.latency_tab.itl_desc', fallback: 'Average time between subsequent tokens.' },
};

const TITLES: Record<LatencyMetricKey, { key: string; fallback: string }> = {
  e2e: { key: 'dashboard.latency_tab.e2e', fallback: 'End-to-End Latency' },
  ttft: { key: 'dashboard.latency_tab.ttft', fallback: 'Time to First Token' },
  itl: { key: 'dashboard.latency_tab.itl', fallback: 'Inter-Token Latency' },
};

export function LatencySection({
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
  const [metric, setMetric] = useState<LatencyMetricKey>('e2e');
  const opts =
    filterOptions ??
    (providerId !== undefined && providerId !== '' ? { dimension: 'provider' as const, id: providerId } : undefined);
  const { data, loading, error } = useUsageChart(timeRange as TimeRange, opts, refreshKey);

  const desc = DESCRIPTIONS[metric];
  const title = TITLES[metric];

  return (
    <Card>
      <CardContent className="space-y-6 px-8 pt-1 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold">{t(title.key, title.fallback)}</h3>
            <p className="text-sm text-muted-foreground">{t(desc.key, desc.fallback)}</p>
          </div>
          <Tabs
            value={metric}
            onValueChange={(v) => {
              setMetric(v as LatencyMetricKey);
            }}
          >
            <TabsList>
              {LATENCY_TABS.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {t(tab.labelKey, tab.fallback)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {error !== null && error !== '' ? (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <LatencyChart data={data} metric={metric} loading={loading} timeRange={timeRange as TimeRange} />
        )}
      </CardContent>
    </Card>
  );
}
