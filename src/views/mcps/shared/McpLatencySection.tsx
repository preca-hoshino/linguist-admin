import { useTranslation } from 'react-i18next';
import type { McpStatsTimeSeriesPoint } from '@/api/mcp/stats';
import { Card, CardContent } from '@/components/ui/Card';
import type { TimeRange } from '@/composables/use-usage-chart';
import { McpLatencyChart } from './McpLatencyChart';

interface McpLatencySectionProps {
  readonly data: McpStatsTimeSeriesPoint[];
  readonly loading: boolean;
  readonly timeRange: TimeRange;
}

export function McpLatencySection({ data, loading, timeRange }: McpLatencySectionProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="space-y-6 px-8 pt-6 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold">{t('mcpPage.performance.latencyTrend', 'Latency Trend')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('mcpPage.performance.latencyTrend_desc', 'Monitor average and long-tail (P95/P99) performance.')}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1 sm:mt-0">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(150, 60%, 45%)' }} />
              Avg
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(35, 92%, 50%)' }} />
              P95
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(310, 65%, 55%)' }} />
              P99
            </span>
          </div>
        </div>

        <McpLatencyChart data={data} loading={loading} timeRange={timeRange} />
      </CardContent>
    </Card>
  );
}
