import { useTranslation } from 'react-i18next';
import type { TimeRange } from '@/composables/use-breakdown-stats';
import { type GlobalTimeRange, mapGlobalRangeToApi } from '@/types/dashboard';
import { AppBarChart } from '../components/AppBarChart';
import { DistributionCard } from '../components/DistributionCard';
import { DistributionKpiCards } from '../components/DistributionKpiCards';

interface DistributionTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

export function DistributionTab({ timeRange, refreshKey }: DistributionTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const apiRange = mapGlobalRangeToApi(timeRange) as TimeRange;

  return (
    <div className="space-y-6">
      {/* 第 1 层: KPI 总览指标横条 — 水平并排展示活跃 Key / 活跃模型 */}
      <DistributionKpiCards timeRange={timeRange} refreshKey={refreshKey} />

      {/* 第 2 层: API Key 请求分布柱状图 — 全宽视觉焦点 */}
      <div className="h-[380px]">
        <AppBarChart timeRange={timeRange} refreshKey={refreshKey} />
      </div>

      {/* 第 3 层: 三列对称分布明细 — API 格式 / 虚拟模型 / 提供商模型 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <DistributionCard
          title={t('dashboard.top.api_formats', 'API Format Ranking')}
          description={t('dashboard.top.api_formats_desc', 'Top 10 API formats by request volume.')}
          groupBy="user_format"
          timeRange={apiRange}
          refreshKey={refreshKey}
        />
        <DistributionCard
          title={t('dashboard.top.virtual_model', 'Virtual Model Ranking')}
          description={t('dashboard.top.virtual_model_desc', 'Top 10 Virtual models by request volume.')}
          groupBy="virtual_model"
          timeRange={apiRange}
          refreshKey={refreshKey}
        />
        <DistributionCard
          title={t('dashboard.top.provider_model', 'Provider Model Ranking')}
          description={t('dashboard.top.provider_model_desc', 'Top 10 Provider models by request volume.')}
          groupBy="provider_model"
          timeRange={apiRange}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}
