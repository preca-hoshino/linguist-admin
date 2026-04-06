import type { GlobalTimeRange } from '@/types/dashboard';
import { ErrorRateCard } from '../components/ErrorRateCard';
import { ErrorTrendSection } from '../components/ErrorTrendSection';
import { ModelErrorStatCard } from '../components/ModelErrorStatCard';

interface ErrorTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

export function ErrorTab({ timeRange, refreshKey }: ErrorTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 上层: 全宽错误趋势横图 */}
      <ErrorTrendSection timeRange={timeRange} refreshKey={refreshKey} />

      {/* 下层: 细节拆解，TOP 错误模型榜 & 错误类型统计概览 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ErrorRateCard timeRange={timeRange} refreshKey={refreshKey} />
        <ModelErrorStatCard timeRange={timeRange} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
