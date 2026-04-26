import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { McpLog } from '@/types/mcp';
import { formatDuration, formatDurationUnit } from '@/utils/utils';

function MetricCard({
  title,
  value,
  unit,
  desc,
  icon: Icon,
}: {
  readonly title: string;
  readonly value: string | number | null;
  readonly unit?: string;
  readonly desc?: string;
  readonly icon?: React.ElementType;
}): React.JSX.Element {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon != null && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold tracking-normal">
          {value == null ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <>
              {value}
              {unit != null && unit !== '' && (
                <span className="ml-1 text-lg font-medium text-muted-foreground">{unit}</span>
              )}
            </>
          )}
        </div>
        {desc != null && desc !== '' && <p className="mt-4 text-xs text-muted-foreground">{desc}</p>}
      </CardContent>
    </Card>
  );
}

function getDurationProps(ms: number | null): { value: string | null; unit: string } {
  return {
    value: ms == null ? null : formatDuration(ms),
    unit: ms == null ? 'ms' : formatDurationUnit(ms),
  };
}

export function McpLogPerformanceTab({ log }: { readonly log: McpLog }): React.JSX.Element {
  const { t } = useTranslation();
  const durationMs = log.duration_ms;

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 w-full">
      <div>
        <h3 className="text-sm font-semibold mb-4">{t('modelsPage.logs.detail.perfMetricsTitle', '性能指标')}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('dashboard.perf.stat_e2e', 'E2E')}
            {...getDurationProps(durationMs)}
            desc={t('mcpsPage.logs.detail.perfE2EDesc', '网关及 MCP Server 全局端到端响应耗时')}
            icon={Clock}
          />
        </div>
      </div>
    </div>
  );
}
