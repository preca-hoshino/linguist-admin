import type { Provider } from '@/types';
import type { GlobalTimeRange } from '@/types/dashboard';
import { GenerationRateSection } from '@/views/dashboard/components/GenerationRateSection';
import { LatencySection } from '@/views/dashboard/components/LatencySection';
import { PerfStatCards } from '@/views/dashboard/components/PerfStatCards';

interface ProviderPerformanceTabProps {
  readonly provider: Provider;
  readonly timeRange: GlobalTimeRange;
}

export function ProviderPerformanceTab({ provider, timeRange }: ProviderPerformanceTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 行 1: 延迟趋势大图 — E2E + TTFT + ITL 三条线 */}
      <LatencySection timeRange={timeRange} providerId={provider.id} />

      {/* 行 2: 4 迷你指标卡 — E2E P99 / TTFT Avg / ITL Avg / tok/s */}
      <PerfStatCards timeRange={timeRange} providerId={provider.id} />

      {/* 行 3: 生成速率大图 — Avg + P50 + P90 + P99 */}
      <GenerationRateSection timeRange={timeRange} providerId={provider.id} />
    </div>
  );
}
