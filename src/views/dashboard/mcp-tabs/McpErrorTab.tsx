import { useQuery } from '@tanstack/react-query';
import { getMcpStatsOverview, getMcpStatsToday, type McpStatsRange } from '@/api/mcp/stats';
import type { GlobalTimeRange } from '@/types/dashboard';
import { mapGlobalRangeToApi } from '@/types/dashboard';
import { McpErrorRateCard } from './components/McpErrorRateCard';
import { McpErrorTrendSection } from './components/McpErrorTrendSection';
import { McpMethodErrorStatCard } from './components/McpMethodErrorStatCard';

interface McpErrorTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

export function McpErrorTab({ timeRange, refreshKey }: McpErrorTabProps): React.JSX.Element {
  const apiRange = mapGlobalRangeToApi(timeRange);

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['mcp-stats-overview', 'global', apiRange, refreshKey],
    queryFn: async () => {
      const res = await getMcpStatsOverview({ dimension: 'global', range: apiRange as McpStatsRange });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
  });

  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['mcp-stats-today', refreshKey],
    queryFn: async () => {
      const res = await getMcpStatsToday();
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <McpErrorTrendSection timeRange={timeRange} refreshKey={refreshKey} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <McpErrorRateCard
          today={todayData ?? null}
          overview={overviewData ?? null}
          loading={overviewLoading || todayLoading}
        />
        <McpMethodErrorStatCard timeRange={timeRange} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
