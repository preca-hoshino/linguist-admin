import { Loader2 } from 'lucide-react';
import { type ReactElement, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { type TimeRange, useBreakdownStats } from '@/composables/use-breakdown-stats';
import { type GlobalTimeRange, mapGlobalRangeToApi, type StatsFilterOptions } from '@/types/dashboard';
import { formatCompact } from '@/utils/format-number';

interface ApiKeyBarChartProps {
  readonly timeRange: GlobalTimeRange;
  readonly providerId?: string;
  readonly filterOptions?: StatsFilterOptions;
  readonly refreshKey?: number | undefined;
}

interface ChartItem {
  name: string;
  requests: number;
  tokens: number;
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
  readonly metric: 'requests' | 'tokens';
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
        {metric === 'tokens' && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              <span>{t('dashboard.metric.tokens', 'Tokens')}</span>
            </div>
            <span className="font-mono font-medium">{formatCompact(item.tokens, 1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiKeyBarChart({
  timeRange,
  providerId,
  filterOptions,
  refreshKey,
}: ApiKeyBarChartProps): ReactElement {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<'requests' | 'tokens'>('requests');
  const apiRange = mapGlobalRangeToApi(timeRange) as TimeRange;
  const opts =
    filterOptions ??
    (providerId !== undefined && providerId !== '' ? { dimension: 'provider' as const, id: providerId } : undefined);
  const { data, loading, error } = useBreakdownStats('api_key', apiRange, 10, opts, refreshKey);

  const chartData: ChartItem[] = data.map((item) => ({
    name: item.name,
    requests: item.request_count,
    tokens: item.total_tokens,
  }));

  const isLoadingInitial = loading && data.length === 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-semibold">{t('dashboard.dist.api_key_chart', 'API Key Distribution')}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {metric === 'requests'
              ? t('dashboard.dist.api_key_chart_req_desc', 'API Key usage ranked by total requests')
              : t('dashboard.dist.api_key_chart_tok_desc', 'API Key usage ranked by total tokens consumed')}
          </p>
        </div>
        <Tabs
          value={metric}
          onValueChange={(v) => {
            setMetric(v as 'requests' | 'tokens');
          }}
        >
          <TabsList className="h-8">
            <TabsTrigger value="requests" className="px-3 text-xs">
              {t('dashboard.metric.requests', 'Requests')}
            </TabsTrigger>
            <TabsTrigger value="tokens" className="px-3 text-xs">
              {t('dashboard.metric.tokens', 'Tokens')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1 pt-2 pb-4">
        {((): ReactNode => {
          if (error !== null && error !== '') {
            return <div className="flex h-full items-center justify-center text-sm text-destructive">{error}</div>;
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
              <BarChart data={chartData} layout="horizontal" margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
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
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  animationDuration={600}
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
