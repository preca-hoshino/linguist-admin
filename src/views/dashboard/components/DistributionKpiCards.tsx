import { Box, Building2, Key, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type TimeRange, useBreakdownStats } from '@/composables/use-breakdown-stats';
import { type GlobalTimeRange, mapGlobalRangeToApi } from '@/types/dashboard';

export function DistributionKpiCards({
  timeRange,
  providerId,
  refreshKey,
}: {
  readonly timeRange: GlobalTimeRange;
  readonly providerId?: string;
  readonly refreshKey?: number | undefined;
}): React.JSX.Element {
  const { t } = useTranslation();
  const apiRange = mapGlobalRangeToApi(timeRange) as TimeRange;
  const filterParam =
    providerId !== undefined && providerId !== '' ? { dimension: 'provider' as const, id: providerId } : undefined;

  // 用不限制 limit 的方式获取全部数据来计算活跃数量
  const { data: appData, loading: appLoading } = useBreakdownStats('app', apiRange, 1000, filterParam, refreshKey);
  const activeApps = appData.filter((k) => k.request_count > 0).length;
  const { data: virtualData, loading: virtualLoading } = useBreakdownStats(
    'virtual_model',
    apiRange,
    100,
    filterParam,
    refreshKey,
  );
  const activeVirtualModels = virtualData.filter((m) => m.request_count > 0).length;

  const { data: providerModelData, loading: providerModelLoading } = useBreakdownStats(
    'provider_model',
    apiRange,
    100,
    filterParam,
    refreshKey,
  );
  const activeProviderModels = providerModelData.filter((m) => m.request_count > 0).length;

  const { data: providerData, loading: providerLoading } = useBreakdownStats(
    'provider',
    apiRange,
    100,
    filterParam,
    refreshKey,
  );
  const activeProviders = providerData.filter((m) => m.request_count > 0).length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 活跃 App 数量 */}
      <Card className="gap-2 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">{t('dashboard.dist.active_apps', 'Active Apps')}</CardTitle>
          <Key className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          {appLoading && appData.length === 0 ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold tracking-tight">{activeApps}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('dashboard.dist.active_apps_desc', 'Apps with requests in period')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* 活跃虚拟模型数量 */}
      <Card className="gap-2 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.dist.active_virtual_models', 'Active Virtual Models')}
          </CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          {virtualLoading && virtualData.length === 0 ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold tracking-tight">{activeVirtualModels}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('dashboard.dist.active_virtual_models_desc', 'Virtual models with requests')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* 活跃提供商模型数量 */}
      <Card className="gap-2 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.dist.active_provider_models', 'Active Provider Models')}
          </CardTitle>
          <Box className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          {providerModelLoading && providerModelData.length === 0 ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold tracking-tight">{activeProviderModels}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('dashboard.dist.active_provider_models_desc', 'Provider models with requests')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* 活跃提供商数量 */}
      <Card className="gap-2 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.dist.active_providers', 'Active Providers')}
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          {providerLoading && providerData.length === 0 ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-2xl font-bold tracking-tight">{activeProviders}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('dashboard.dist.active_providers_desc', 'Providers with requests')}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
