import type { TimeRange } from '@/composables/use-breakdown-stats';
import type { Provider } from '@/types';
import { type GlobalTimeRange, mapGlobalRangeToApi } from '@/types/dashboard';
import { ApiKeyBarChart } from '@/views/dashboard/components/ApiKeyBarChart';
import { DistributionCard } from '@/views/dashboard/components/DistributionCard';
import { DistributionKpiCards } from '@/views/dashboard/components/DistributionKpiCards';

interface ProviderUsageTabProps {
  readonly provider: Provider;
  readonly timeRange: GlobalTimeRange;
}

export function ProviderUsageTab({ provider, timeRange }: ProviderUsageTabProps): React.JSX.Element {
  const apiRange = mapGlobalRangeToApi(timeRange) as TimeRange;

  return (
    <div className="space-y-6">
      {/* 行 1: Bento 不对称网格 — 柱状图(2/3) + 堆叠 KPI 卡(1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-h-[380px] lg:col-span-2">
          <ApiKeyBarChart timeRange={timeRange} providerId={provider.id} />
        </div>
        <div className="lg:col-span-1">
          <DistributionKpiCards timeRange={timeRange} providerId={provider.id} />
        </div>
      </div>

      {/* 行 2: 2 列对称 — Provider Model / Virtual Model */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DistributionCard
          title="TOP Provider Models"
          groupBy="provider_model"
          timeRange={apiRange}
          providerId={provider.id}
        />
        <DistributionCard
          title="TOP Virtual Models"
          groupBy="virtual_model"
          timeRange={apiRange}
          providerId={provider.id}
        />
      </div>
    </div>
  );
}
