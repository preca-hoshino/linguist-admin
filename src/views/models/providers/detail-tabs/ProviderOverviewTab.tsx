import type { Provider, StatsOverview, StatsToday } from '@/types';
import type { GlobalTimeRange } from '@/types/dashboard';
import { LatencyCard } from '@/views/dashboard/components/LatencyCard';
import { RequestCard } from '@/views/dashboard/components/RequestCard';
import { SuccessRateCard } from '@/views/dashboard/components/SuccessRateCard';
import { TokenCard } from '@/views/dashboard/components/TokenCard';
import { UsageSection } from '@/views/dashboard/components/UsageSection';

interface ProviderOverviewTabProps {
  readonly provider: Provider;
  readonly timeRange: GlobalTimeRange;
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export function ProviderOverviewTab({
  provider,
  timeRange,
  today,
  overview,
  loading,
  error,
}: ProviderOverviewTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error != null && error !== '' ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* 行 1: 4 KPI 卡片网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RequestCard today={today} overview={overview} loading={loading} />
        <TokenCard today={today} overview={overview} loading={loading} />
        <SuccessRateCard today={today} loading={loading} />
        <LatencyCard today={today} overview={overview} loading={loading} />
      </div>

      {/* 行 2: 用量趋势大图（全宽） */}
      <UsageSection timeRange={timeRange} providerId={provider.id} />
    </div>
  );
}
