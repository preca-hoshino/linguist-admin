import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { type ReactElement, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getMcpDistribution, type McpStatsRange } from '@/api/mcp/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { type GlobalTimeRange, mapGlobalRangeToApi } from '@/types/dashboard';
import { formatCompact } from '@/utils/format-number';

interface McpDistributionBarChartProps {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

interface ChartItem {
  name: string;
  requests: number;
  errors: number;
}

function truncateName(name: string, max = 12): string {
  if (name.length <= max) {
    return name;
  }
  return `${name.slice(0, max)}…`;
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ dataKey?: string; value?: number; color?: string; payload?: ChartItem }>;
  readonly metric: 'requests' | 'errors';
}

function CustomTooltip({ active, payload, metric }: CustomTooltipProps): ReactElement | null {
  const { t } = useTranslation();

  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  return (
    <div className="min-w-[160px] rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1.5 max-w-[200px] truncate font-medium" title={item.name}>
        {item.name}
      </p>
      <div className="space-y-1">
        {metric === 'requests' && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              <span>{t('dashboard.metric.requests', 'Requests')}</span>
            </div>
            <span className="font-mono font-medium">{new Intl.NumberFormat('en-US').format(item.requests)}</span>
          </div>
        )}
        {metric === 'errors' && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-destructive" />
              <span>{t('dashboard.metric.errors', 'Errors')}</span>
            </div>
            <span className="font-mono font-medium text-destructive">
              {new Intl.NumberFormat('en-US').format(item.errors)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function McpDistributionBarChart({ timeRange, refreshKey }: McpDistributionBarChartProps): ReactElement {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<'requests' | 'errors'>('requests');
  const apiRange = mapGlobalRangeToApi(timeRange);

  const {
    data: result,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['mcp-distribution-bar', apiRange, refreshKey],
    queryFn: async () => {
      const res = await getMcpDistribution({
        range: apiRange as McpStatsRange,
        dimension: 'global',
        groupBy: 'virtual_mcp',
      });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data.data;
    },
  });

  const chartData: ChartItem[] = (result ?? []).map((item) => ({
    name: item.name,
    requests: item.count,
    errors: item.error_count,
  }));

  const isLoadingInitial = loading && chartData.length === 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-semibold">
            {t('dashboard.mcp.virtual_mcp_chart', 'Virtual MCP Distribution')}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {metric === 'requests'
              ? t('dashboard.mcp.virtual_mcp_chart_req_desc', 'Virtual MCPs ranked by total requests')
              : t('dashboard.mcp.virtual_mcp_chart_err_desc', 'Virtual MCPs ranked by total errors')}
          </p>
        </div>
        <Tabs
          value={metric}
          onValueChange={(v) => {
            setMetric(v as 'requests' | 'errors');
          }}
        >
          <TabsList className="h-8">
            <TabsTrigger value="requests" className="px-3 text-xs">
              {t('dashboard.metric.requests', 'Requests')}
            </TabsTrigger>
            <TabsTrigger value="errors" className="px-3 text-xs">
              {t('dashboard.metric.errors', 'Errors')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1 pt-2 pb-4">
        {((): ReactNode => {
          if (error) {
            return (
              <div className="flex h-full items-center justify-center text-sm text-destructive">{String(error)}</div>
            );
          }
          if (isLoadingInitial) {
            return (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            );
          }
          if (chartData.length === 0) {
            return (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t('dashboard.no_data', 'No data')}
              </div>
            );
          }
          if (loading) {
            return <Skeleton className="h-full w-full rounded-lg" />;
          }

          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal" margin={{ top: 16, right: 24, left: 0, bottom: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => truncateName(v)}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatCompact(v, 0)}
                  className="fill-muted-foreground"
                  width={60}
                />
                <Tooltip content={<CustomTooltip metric={metric} />} cursor={false} isAnimationActive={false} />
                <Bar
                  dataKey={metric}
                  fill={metric === 'requests' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          );
        })()}
      </CardContent>
    </Card>
  );
}
