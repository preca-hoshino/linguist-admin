import { useQuery } from '@tanstack/react-query';
import { getMcpStatsOverview, getMcpStatsTimeSeries, type McpStatsRange } from '@/api/mcp/stats';
import type { GlobalTimeRange } from '@/types/dashboard';
import { mapGlobalRangeToApi } from '@/types/dashboard';
import { McpLatencySection } from '@/views/mcps/shared/McpLatencySection';
import { McpPerfStatCards } from '@/views/mcps/shared/McpPerfStatCards';

interface McpPerformanceTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

export function McpPerformanceTab({ timeRange, refreshKey }: McpPerformanceTabProps): React.JSX.Element {
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

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['mcp-stats-timeseries', 'global', apiRange, refreshKey],
    queryFn: async () => {
      const res = await getMcpStatsTimeSeries({ dimension: 'global', range: apiRange as McpStatsRange });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <McpLatencySection data={timeSeriesData ?? []} loading={timeSeriesLoading} timeRange={timeRange as never} />
      <McpPerfStatCards overview={overviewData} loading={overviewLoading} />
    </div>
  );
}
