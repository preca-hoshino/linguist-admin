import type { GlobalTimeRange } from '@/types/dashboard';
import { GenerationRateSection } from '../components/GenerationRateSection';
import { GenerationRateTopCards } from '../components/GenerationRateTopCards';
import { LatencySection } from '../components/LatencySection';
import { LatencyTopCards } from '../components/LatencyTopCards';
import { PerfStatCards } from '../components/PerfStatCards';

interface PerformanceTabProps {
  readonly timeRange: GlobalTimeRange;
  readonly refreshKey?: number | undefined;
}

export function PerformanceTab({ timeRange, refreshKey }: PerformanceTabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* 行 1: 延迟趋势大图 — E2E + TTFT + ITL 三条线 */}
      <LatencySection timeRange={timeRange} refreshKey={refreshKey} />

      {/* 行 2: 4 迷你指标卡 — E2E P99 / TTFT Avg / ITL Avg / tok/s */}
      <PerfStatCards timeRange={timeRange} refreshKey={refreshKey} />

      {/* 行 3: 生成速率大图 — Avg + P50 + P90 + P99 */}
      <GenerationRateSection timeRange={timeRange} refreshKey={refreshKey} />

      {/* 行 4: 最低延迟模型排行 — 全宽 */}
      <LatencyTopCards timeRange={timeRange} refreshKey={refreshKey} />

      {/* 行 5: 最快生成速率模型排行 — 全宽 */}
      <GenerationRateTopCards timeRange={timeRange} refreshKey={refreshKey} />
    </div>
  );
}
