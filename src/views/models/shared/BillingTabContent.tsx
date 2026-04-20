import { CalendarDays, DollarSign, TrendingDown, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useCostTrend } from '@/composables/use-cost-trend';
import type { StatsDimension, StatsOverview, StatsToday } from '@/types';
import type { GlobalTimeRange } from '@/types/dashboard';
import { CostChart } from '@/views/dashboard/components/CostChart';

export interface BillingTabContentProps {
  readonly timeRange: GlobalTimeRange;
  readonly dimension?: StatsDimension;
  readonly id?: string;
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
}

function formatCurrency(val: number): string {
  if (val === 0) {
    return '¥0.00';
  }
  if (val < 0.01) {
    return '<¥0.01';
  }
  return `¥${val.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
}

export function BillingTabContent({
  timeRange,
  dimension,
  id,
  today,
  overview,
}: BillingTabContentProps): React.JSX.Element {
  const { t } = useTranslation();

  // Chart Logic
  let tr: 'today' | '7d' | '30d' = '30d';
  if (timeRange === 'today') {
    tr = 'today';
  } else if (timeRange === '7d') {
    tr = '7d';
  }

  const filterOpts: { dimension?: StatsDimension; id?: string } = {};
  if (dimension != null) {
    filterOpts.dimension = dimension;
    if (id !== undefined && id !== '') {
      filterOpts.id = id;
    }
  }
  const { data: chartData, loading: chartLoading, error: chartError } = useCostTrend(tr, filterOpts);

  // Summary Metrics
  const totalCost = overview?.total_cost ?? 0;
  const todayCost = today?.today_cost ?? 0;

  const totalTokens = overview?.total_tokens ?? 0;
  const avgCostPer1M = totalTokens > 0 ? (totalCost / totalTokens) * 1_000_000 : 0;

  const cacheHitRate = overview?.cache_hit_rate ?? 0;
  const totalRequests = overview?.total_requests ?? 0;
  const costPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

  return (
    <div className="space-y-6">
      {/* 1. Hero Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 今日花费 */}
        <Card className="gap-4 py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.billing.todayCost')}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-normal">{formatCurrency(todayCost)}</span>
              <span className="text-sm font-normal text-muted-foreground">/ {formatCurrency(totalCost)}</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {totalCost > 0 ? (
                <>
                  {t('dashboard.billing.ofTotal')}{' '}
                  <span className="font-medium text-foreground">{((todayCost / totalCost) * 100).toFixed(1)}%</span>
                </>
              ) : (
                t('dashboard.billing.noTraffic')
              )}
            </p>
          </CardContent>
        </Card>

        {/* 均价 / 1M Tokens */}
        <Card className="gap-4 py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.billing.avgCost')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-normal">
                {avgCostPer1M === 0 ? '¥0.00' : `¥${avgCostPer1M.toFixed(2)}`}
              </span>
              <span className="text-sm font-normal text-muted-foreground">/ 1M Tokens</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {totalTokens > 0 ? (
                <>
                  {t('dashboard.billing.totalTokens')}{' '}
                  <span className="font-medium text-foreground">{formatTokens(totalTokens)}</span>
                </>
              ) : (
                t('dashboard.billing.noTraffic')
              )}
            </p>
          </CardContent>
        </Card>

        {/* 每次请求均价 */}
        <Card className="gap-4 py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.billing.costPerReq')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-normal">{formatCurrency(costPerRequest)}</span>
              <span className="text-sm font-normal text-muted-foreground">/ {t('dashboard.billing.perReq')}</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {totalRequests > 0 ? (
                <>
                  {t('dashboard.billing.totalRequests')}{' '}
                  <span className="font-medium text-foreground">{totalRequests.toLocaleString()}</span>
                </>
              ) : (
                t('dashboard.billing.noTraffic')
              )}
            </p>
          </CardContent>
        </Card>

        {/* 缓存命中率 */}
        <Card className="gap-4 py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.billing.cacheHitRate')}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold tracking-normal">{(cacheHitRate * 100).toFixed(2)}%</div>
            <p className="mt-4 text-xs text-muted-foreground">
              {t('dashboard.billing.cachedRequests')}{' '}
              <span className="font-medium text-foreground">
                {totalRequests > 0 ? Math.round(totalRequests * cacheHitRate).toLocaleString() : '0'}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Provider Trend Combo Chart */}
      <Card>
        <CardContent className="space-y-6 px-8 pt-1 pb-6">
          <div>
            <h3 className="font-semibold">{t('dashboard.billing.trendChart')}</h3>
            <p className="text-sm text-muted-foreground">{t('dashboard.billing.trendChartDesc')}</p>
          </div>

          {chartError != null && chartError !== '' ? (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
              {chartError}
            </div>
          ) : (
            <CostChart data={chartData} loading={chartLoading} timeRange={tr} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
