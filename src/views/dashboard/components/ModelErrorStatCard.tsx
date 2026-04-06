import { AlertTriangle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { type TimeRange, useBreakdownStats } from '@/composables/use-breakdown-stats';
import { type GlobalTimeRange, mapGlobalRangeToApi, type StatsFilterOptions } from '@/types/dashboard';

interface ModelErrorStatCardProps {
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions?: StatsFilterOptions;
  readonly refreshKey?: number | undefined;
}

export function ModelErrorStatCard({
  timeRange,
  filterOptions,
  refreshKey,
}: ModelErrorStatCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const apiRange = mapGlobalRangeToApi(timeRange);
  const { data, loading, error } = useBreakdownStats(
    'error_type',
    apiRange as TimeRange,
    50,
    filterOptions,
    refreshKey,
  );

  const totalErrors = data.reduce((sum, d) => sum + d.request_count, 0);

  const isLoadingInitial = loading && data.length === 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
          <AlertTriangle className="mr-1.5 h-4 w-4 text-destructive/80" />
          {t('dashboard.error_tab.trend', 'Error Trends')}
        </CardTitle>
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
          if (data.length === 0) {
            return (
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
                {t('dashboard.error_tab.no_errors', 'No errors found in this period.')}
              </div>
            );
          }
          return (
            <div className={`space-y-4 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {/* 错误总数 */}
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{totalErrors}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t('dashboard.errors', 'Errors')}</p>
              </div>

              {/* 按错误类型列表 */}
              {data.map((item, _index) => {
                const maxCount = Math.max(...data.map((d) => d.request_count));
                const widthRatio = Math.max((item.request_count / maxCount) * 100, 2);
                return (
                  <div key={item.name} className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate pr-4 font-medium" title={item.name}>
                        {item.name}
                      </span>
                      <span className="shrink-0 font-medium text-destructive">{item.request_count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-destructive/10">
                      <div
                        className="h-full flex-shrink-0 rounded-full bg-destructive/80 transition-all duration-700 ease-out"
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
