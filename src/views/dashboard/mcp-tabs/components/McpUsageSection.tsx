import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { type McpTimeRange, useMcpUsageChart } from '@/composables/use-mcp-usage-chart';
import type { GlobalTimeRange } from '@/types/dashboard';
import { type McpMetricKey, McpPerformanceChart } from './McpPerformanceChart';

const METRIC_TABS = [
  { key: 'requests', labelKey: 'dashboard.metric.requests', fallback: 'Requests' },
  { key: 'errors', labelKey: 'dashboard.metric.errors', fallback: 'Errors' },
  { key: 'avg_duration_ms', labelKey: 'dashboard.metric.avg_latency', fallback: 'Avg Latency' },
  { key: 'p95_duration_ms', labelKey: 'dashboard.metric.p95_latency', fallback: 'P95 Latency' },
] as const;

export function McpUsageSection({
  timeRange,
  refreshKey,
}: {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}): React.JSX.Element {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<McpMetricKey>('requests');

  const { data, loading, error } = useMcpUsageChart(timeRange as McpTimeRange, undefined, refreshKey);

  const activeTab = METRIC_TABS.find((tab) => tab.key === metric) ?? METRIC_TABS[0];

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-6 px-8 pt-1 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold">{t(activeTab.labelKey, activeTab.fallback)}</h3>
              <p className="text-sm text-muted-foreground">
                {metric === 'requests' && t('dashboard.metric.requests_desc', 'Total API requests processed')}
                {metric === 'errors' && 'Total API requests that returned an error'}
                {metric === 'avg_duration_ms' && 'Average end-to-end request duration'}
                {metric === 'p95_duration_ms' && '95th percentile end-to-end request duration'}
              </p>
            </div>
            <Tabs
              value={metric}
              onValueChange={(v) => {
                setMetric(v as McpMetricKey);
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
            <McpPerformanceChart data={data} metric={metric} loading={loading} timeRange={timeRange as McpTimeRange} />
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
