import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VirtualModel } from '@/types';
import type { GlobalTimeRange, StatsFilterOptions } from '@/types/dashboard';
import { GenerationRateSection } from '@/views/dashboard/components/GenerationRateSection';
import { LatencySection } from '@/views/dashboard/components/LatencySection';
import { PerfStatCards } from '@/views/dashboard/components/PerfStatCards';

interface VirtualModelPerformanceTabProps {
  readonly model: VirtualModel;
  readonly timeRange: GlobalTimeRange;
  readonly filterOptions: StatsFilterOptions;
}

export function VirtualModelPerformanceTab({
  model,
  timeRange,
  filterOptions,
}: VirtualModelPerformanceTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const isEmbedding = model.model_type === 'embedding';

  return (
    <div className="space-y-6">
      <LatencySection timeRange={timeRange} filterOptions={filterOptions} />
      <PerfStatCards timeRange={timeRange} filterOptions={filterOptions} />
      {isEmbedding ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            {t(
              'modelsPage.virtualModels.detailPage.embeddingPerfNote',
              'Embedding models do not support streaming metrics (TTFT / ITL / Generation Rate).',
            )}
          </span>
        </div>
      ) : (
        <GenerationRateSection timeRange={timeRange} filterOptions={filterOptions} />
      )}
    </div>
  );
}
