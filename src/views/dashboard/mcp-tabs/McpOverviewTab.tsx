import type { McpStatsOverview, McpStatsToday } from '@/api/mcp/stats';
import type { GlobalTimeRange } from '@/types/dashboard';
import { McpErrorRateCard } from './components/McpErrorRateCard';
import { McpLatencyCard } from './components/McpLatencyCard';
import { McpRequestCard } from './components/McpRequestCard';
import { McpUsageSection } from './components/McpUsageSection';

interface McpOverviewTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly today: McpStatsToday | null;
  readonly overview: McpStatsOverview | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refreshKey?: number | undefined;
}

export function McpOverviewTab({
  timeRange,
  today,
  overview,
  loading,
  error,
  refreshKey,
}: McpOverviewTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {error == null ? null : (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <McpRequestCard today={today} overview={overview} loading={loading} />
        <McpErrorRateCard today={today} overview={overview} loading={loading} />
        <McpLatencyCard today={today} overview={overview} loading={loading} />
      </div>

      <McpUsageSection timeRange={timeRange} refreshKey={refreshKey} />
    </div>
  );
}
