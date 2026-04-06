import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { StatsOverview, StatsToday } from '@/types';

interface LatencyCardProps {
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
  readonly loading: boolean;
}

/** 拆分数值和单位以便于单独渲染单位的样式 */
function formatLatencyValues(ms: number | null | undefined): { value: string; unit: string } {
  if (ms == null) {
    return { value: '—', unit: '' };
  }
  if (ms < 1000) {
    return { value: Math.round(ms).toString(), unit: 'ms' };
  }
  return { value: (ms / 1000).toFixed(2), unit: 's' }; // 给 s 后缀强制两人位小数以便匹配设计图风格
}

export function LatencyCard({ today, overview, loading }: LatencyCardProps): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="gap-4 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{t('dashboard.latency')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="mt-4 h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const avgTtft = today?.today_avg_ttft_ms ?? null;
  const overheadMs = overview?.gateway_overhead_ms ?? null;
  const itlMs = today?.today_avg_itl_ms ?? null;
  const tps = itlMs !== null && itlMs > 0 ? 1000 / itlMs : null;

  const { value: latencyValue, unit: latencyUnit } = formatLatencyValues(avgTtft);

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t('dashboard.latency')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold tracking-normal">{latencyValue}</span>
          <span className="ml-1 text-xl font-bold text-muted-foreground">{latencyUnit}</span>
        </div>
        <div className="mt-4 text-xs font-medium text-muted-foreground">
          <span className="mr-1">{t('dashboard.gatewayOverhead')}</span>
          <span>
            {((): string => {
              if (overheadMs == null) {
                return '—';
              }
              if (overheadMs < 1) {
                return '<1ms';
              }
              return `${overheadMs}ms`;
            })()}
          </span>
          {tps != null && <span className="ml-2 border-l border-border pl-2">{tps.toFixed(1)} tok/s</span>}
        </div>
      </CardContent>
    </Card>
  );
}
