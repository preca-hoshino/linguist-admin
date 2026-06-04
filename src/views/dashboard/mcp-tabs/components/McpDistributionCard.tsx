import { useQuery } from '@tanstack/react-query';
import { Box, Database, Loader2, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMcpDistribution, getMcpMethodBreakdown, type McpStatsRange } from '@/api/mcp/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { type GlobalTimeRange, mapGlobalRangeToApi } from '@/types/dashboard';

interface McpDistributionCardProps {
  readonly title: string;
  readonly description?: string;
  readonly groupBy: 'method' | 'virtual_mcp' | 'mcp_provider';
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

export function McpDistributionCard({
  title,
  description,
  groupBy,
  timeRange,
  refreshKey,
}: McpDistributionCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const apiRange = mapGlobalRangeToApi(timeRange);

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['mcp-distribution', groupBy, apiRange, refreshKey],
    queryFn: async () => {
      if (groupBy === 'method') {
        const res = await getMcpMethodBreakdown({ range: apiRange as McpStatsRange, dimension: 'global' });
        if (!res.ok) {
          throw new Error(res.error.message);
        }
        return res.data.data.map((item) => ({ name: item.method, request_count: item.count }));
      }
      const res = await getMcpDistribution({ range: apiRange as McpStatsRange, dimension: 'global', groupBy });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data.data.map((item) => ({ name: item.name, request_count: item.count }));
    },
  });

  const list = data ?? [];
  const isLoadingInitial = loading && list.length === 0;

  let totalRequests = 1;
  if (list.length > 0) {
    totalRequests = 0;
    for (const d of list) {
      totalRequests += d.request_count;
    }
  }

  const renderLabel = (item: { name: string }): React.JSX.Element => {
    let Icon = Box;
    switch (groupBy) {
      case 'method': {
        Icon = PlayCircle;

        break;
      }
      case 'virtual_mcp': {
        Icon = Database;

        break;
      }
      case 'mcp_provider': {
        Icon = Box;

        break;
      }
      // No default
    }

    return (
      <div className="flex min-w-0 flex-1 items-center gap-2 pr-4">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border bg-background text-muted-foreground shadow-sm">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="truncate font-medium text-foreground" title={item.name}>
          {item.name}
        </span>
      </div>
    );
  };

  const renderContent = (): React.JSX.Element => {
    if (error != null) {
      return <div className="flex h-full items-center justify-center text-sm text-destructive">{String(error)}</div>;
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
          {t('dashboard.no_data', 'No data')}
        </div>
      );
    }
    return (
      <div className={`space-y-4 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {list.map((item, index) => {
          const widthRatio = Math.max((item.request_count / totalRequests) * 100, 2);
          const formattedValue = new Intl.NumberFormat('en-US').format(item.request_count);
          return (
            <div key={item.name + String(index)} className="flex flex-col space-y-1.5">
              <div className="flex min-h-[32px] items-center justify-between text-sm">
                {renderLabel(item)}
                <span className="shrink-0 text-muted-foreground">{formattedValue}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full flex-shrink-0 rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${widthRatio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="font-semibold">{title}</CardTitle>
        {description != null && description !== '' && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="relative max-h-[380px] w-full flex-1 overflow-y-auto pt-2 pb-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
