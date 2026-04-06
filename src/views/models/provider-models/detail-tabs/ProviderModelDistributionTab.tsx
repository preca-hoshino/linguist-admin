import { useTranslation } from 'react-i18next';
import type { TimeRange } from '@/composables/use-breakdown-stats';
import type { ProviderModel } from '@/types';
import { type GlobalTimeRange, mapGlobalRangeToApi, type StatsFilterOptions } from '@/types/dashboard';
import { ApiKeyBarChart } from '@/views/dashboard/components/ApiKeyBarChart';
import { DistributionCard } from '@/views/dashboard/components/DistributionCard';
import { ModelDistributionKpiCards } from '@/views/dashboard/components/ModelDistributionKpiCards';

interface ProviderModelDistributionTabProps {
  readonly model: ProviderModel;
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions: StatsFilterOptions;
}

export function ProviderModelDistributionTab({
  model: _model,
  timeRange,
  filterOptions,
}: ProviderModelDistributionTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const apiRange = mapGlobalRangeToApi(timeRange) as TimeRange;

  return (
    <div className="space-y-6">
      {/* 行 1: Bento 不对称网格 — 柱状图(2/3) + KPI 卡(1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-h-[380px] lg:col-span-2">
          <ApiKeyBarChart timeRange={timeRange} filterOptions={filterOptions} />
        </div>
        <div className="lg:col-span-1">
          <ModelDistributionKpiCards timeRange={timeRange} filterOptions={filterOptions} />
        </div>
      </div>

      {/* 行 2: TOP 虚拟模型（哪些虚拟模型使用了本提供商模型） */}
      <div className="grid grid-cols-1">
        <DistributionCard
          title={t('dashboard.top.virtual_model', 'TOP Virtual Models')}
          groupBy="virtual_model"
          timeRange={apiRange}
          filterOptions={filterOptions}
        />
      </div>
    </div>
  );
}
