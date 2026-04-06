import type { ProviderModel, StatsOverview, StatsToday } from '@/types';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { LatencyCard } from '@/views/dashboard/components/latency-card';
import { RequestCard } from '@/views/dashboard/components/request-card';
import { SuccessRateCard } from '@/views/dashboard/components/success-rate-card';
import { TokenCard } from '@/views/dashboard/components/token-card';
import { UsageSection } from '@/views/dashboard/components/UsageSection';

interface ProviderModelOverviewTabProps {
  readonly model: ProviderModel;
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions: StatsFilterOptions;
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export function ProviderModelOverviewTab({
  model: _model,
  timeRange,
  filterOptions,
  today,
  overview,
  loading,
  error,
}: ProviderModelOverviewTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error !== null && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 行 1: 4 KPI 卡片网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RequestCard today={today} overview={overview} loading={loading} />
        <TokenCard today={today} overview={overview} loading={loading} />
        <SuccessRateCard today={today} loading={loading} />
        <LatencyCard today={today} overview={overview} loading={loading} />
      </div>

      {/* 行 2: 用量趋势大图（全宽） */}
      <UsageSection timeRange={timeRange} filterOptions={filterOptions} />
    </div>
  );
}
