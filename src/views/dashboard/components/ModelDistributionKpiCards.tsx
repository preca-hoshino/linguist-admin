import { Activity, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type TimeRange, useBreakdownStats } from '@/composables/use-breakdown-stats';
import { type GlobalTimeRange, mapGlobalRangeToApi, type StatsFilterOptions } from '@/types/dashboard';
import { formatCompact } from '@/utils/format-number';

interface ModelDistributionKpiCardsProps {
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions: StatsFilterOptions;
}

export function ModelDistributionKpiCards({
  timeRange,
  filterOptions,
}: ModelDistributionKpiCardsProps): React.JSX.Element {
  const { t } = useTranslation();
  const apiRange = mapGlobalRangeToApi(timeRange) as TimeRange;

  const { data: appData, loading: appLoading } = useBreakdownStats('app', apiRange, 1, filterOptions);

  const activeApps = appData.filter((k) => k.request_count > 0).length;
  const totalRequests = appData.reduce((sum, k) => sum + k.request_count, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* 活跃 App 数量 */}
      <Card className="gap-4 py-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">{t('dashboard.dist.active_apps', 'Active Apps')}</CardTitle>
          <Key className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          {appLoading && appData.length === 0 ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <div className="text-3xl font-bold tracking-normal">{activeApps}</div>
              <p className="mt-4 text-xs text-muted-foreground">
                {t('dashboard.dist.active_apps_desc', 'Apps with requests in period')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* 总请求数 */}
      <Card className="gap-4 py-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">{t('dashboard.requests', 'Requests')}</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          {appLoading && appData.length === 0 ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <div className="text-3xl font-bold tracking-normal">{formatCompact(totalRequests, 1)}</div>
              <p className="mt-4 text-xs text-muted-foreground">{t('dashboard.total', 'Total')}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
