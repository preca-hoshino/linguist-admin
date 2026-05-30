import type { StatsOverview, StatsToday, VirtualModel } from '@/types';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { LatencyCard } from '@/views/dashboard/components/LatencyCard';
import { RequestCard } from '@/views/dashboard/components/RequestCard';
import { SuccessRateCard } from '@/views/dashboard/components/SuccessRateCard';
import { TokenCard } from '@/views/dashboard/components/TokenCard';
import { UsageSection } from '@/views/dashboard/components/UsageSection';

interface VirtualModelOverviewTabProps {
  readonly model: VirtualModel;
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions: StatsFilterOptions;
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export function VirtualModelOverviewTab({
  model: _model,
  timeRange,
  filterOptions,
  today,
  overview,
  loading,
  error,
}: VirtualModelOverviewTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {(error ?? '') === '' ? null : (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 行 1: 4 KPI 卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RequestCard today={today} loading={loading} />
        <TokenCard today={today} loading={loading} />
        <SuccessRateCard today={today} loading={loading} />
        <LatencyCard today={today} overview={overview} loading={loading} />
      </div>

      {/* 行 2: 用量趋势大图 */}
      <UsageSection timeRange={timeRange} filterOptions={filterOptions} />
    </div>
  );
}
