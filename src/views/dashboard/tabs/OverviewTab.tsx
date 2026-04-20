import type { StatsOverview, StatsToday } from '@/types';
import type { GlobalTimeRange } from '@/types/dashboard';
import { LatencyCard } from '../components/LatencyCard';
import { RequestCard } from '../components/RequestCard';
import { SuccessRateCard } from '../components/SuccessRateCard';
import { TokenCard } from '../components/TokenCard';
import { UsageSection } from '../components/UsageSection';

interface OverviewTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refreshKey?: number | undefined;
}

export function OverviewTab({
  timeRange,
  today,
  overview,
  loading,
  error,
  refreshKey,
}: OverviewTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error == null ? null : (
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
      <UsageSection timeRange={timeRange} refreshKey={refreshKey} />
    </div>
  );
}
