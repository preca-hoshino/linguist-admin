import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { type TimeRange, useBreakdownStats } from '@/composables/use-breakdown-stats';
import { type GlobalTimeRange, mapGlobalRangeToApi } from '@/types/dashboard';
import { RankedModelInfo } from './RankedModelInfo';

export function ErrorRateCard({
  timeRange,
  providerId,
  refreshKey,
}: {
  readonly timeRange: GlobalTimeRange;
  readonly providerId?: string;
  readonly refreshKey?: number | undefined;
}): React.JSX.Element {
  const { t } = useTranslation();
  const apiRange = mapGlobalRangeToApi(timeRange);
  const { data, loading, error } = useBreakdownStats(
    'provider_model',
    apiRange as TimeRange,
    50,
    providerId !== undefined && providerId !== '' ? { dimension: 'provider', id: providerId } : undefined,
    refreshKey,
  );

  // 计算最大错误数以实现 100% 拉满视觉
  const list = data
    .filter((d) => d.request_count > 0 && d.error_count > 0)
    .map((d) => ({
      ...d,
      errorRate: d.error_count / d.request_count,
    }))
    .toSorted((a, b) => b.error_count - a.error_count)
    .slice(0, 10);

  const totalErrors = list.length > 0 ? list.reduce((sum, d) => sum + d.error_count, 0) : 1;

  const isLoadingInitial = loading && data.length === 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="font-semibold">{t('dashboard.top.error_models', 'Top Error Rate Models')}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('dashboard.top.error_models_desc', 'Top 10 Provider models with highest error count.')}
        </p>
      </CardHeader>
      <CardContent className="relative flex-1 pt-2 pb-6">
        {((): ReactNode => {
          if (error !== null && error !== '') {
            return <div className="flex h-[150px] items-center justify-center text-sm text-destructive">{error}</div>;
          }
          if (isLoadingInitial) {
            return (
              <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            );
          }
          if (list.length === 0) {
            return (
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
                {t('dashboard.error_tab.no_errors', 'No errors found in this period.')}
              </div>
            );
          }
          return (
            <div className={`space-y-4 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {list.map((item, index) => {
                const errorRatePercent = (item.errorRate * 100).toFixed(1);
                const widthRatio = Math.max((item.error_count / totalErrors) * 100, 2);
                return (
                  <div key={item.name} className="flex flex-col space-y-1.5">
                    <div className="flex min-h-[32px] items-center justify-between text-sm">
                      <div className="flex min-w-0 flex-1 items-center pr-4">
                        <RankedModelInfo
                          rank={index + 1}
                          providerName={item.provider_name ?? null}
                          providerKind={item.provider_kind ?? null}
                          modelName={item.name}
                        />
                      </div>
                      <span className="shrink-0 font-medium text-destructive">
                        {errorRatePercent}%{' '}
                        <span className="text-xs font-normal text-muted-foreground">({item.error_count})</span>
                      </span>
                    </div>
                    {/* 自定义进度条 */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full flex-shrink-0 rounded-full bg-destructive transition-all duration-700 ease-out"
                        style={{ width: `${widthRatio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
