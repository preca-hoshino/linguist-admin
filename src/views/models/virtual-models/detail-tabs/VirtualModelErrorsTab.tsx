import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { ErrorTrendSection } from '@/views/dashboard/components/ErrorTrendSection';
import { ModelErrorStatCard } from '@/views/dashboard/components/ModelErrorStatCard';

interface VirtualModelErrorsTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions: StatsFilterOptions;
}

export function VirtualModelErrorsTab({ timeRange, filterOptions }: VirtualModelErrorsTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
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
