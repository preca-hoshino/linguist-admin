import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { ErrorTrendSection } from '@/views/dashboard/components/ErrorTrendSection';
import { ModelErrorStatCard } from '@/views/dashboard/components/ModelErrorStatCard';

interface ProviderModelErrorsTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions: StatsFilterOptions;
}

export function ProviderModelErrorsTab({ timeRange, filterOptions }: ProviderModelErrorsTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 行 1: 错误趋势大图(2/3) + 模型错误统计(1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ErrorTrendSection timeRange={timeRange} filterOptions={filterOptions} />
        </div>
        <div className="lg:col-span-1">
          <ModelErrorStatCard timeRange={timeRange} filterOptions={filterOptions} />
        </div>
      </div>
    </div>
  );
}
