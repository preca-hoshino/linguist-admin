import type { Provider } from '@/types';
import type { GlobalTimeRange } from '@/types/dashboard';
import { ErrorRateCard } from '@/views/dashboard/components/ErrorRateCard';
import { ErrorTrendSection } from '@/views/dashboard/components/ErrorTrendSection';

interface ProviderErrorsTabProps {
  readonly provider: Provider;
  readonly timeRange: GlobalTimeRange;
}

export function ProviderErrorsTab({ provider, timeRange }: ProviderErrorsTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 行 1: 错误趋势大图(2/3) + Top 错误率模型排行(1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ErrorTrendSection timeRange={timeRange} providerId={provider.id} />
        </div>
        <div className="lg:col-span-1">
          <ErrorRateCard timeRange={timeRange} providerId={provider.id} />
        </div>
      </div>
    </div>
  );
}
