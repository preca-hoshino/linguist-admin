import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { McpStatsOverview, McpStatsToday } from '@/api/mcp/stats';

interface McpLatencyCardProps {
  readonly today: McpStatsToday | null;
  readonly overview: McpStatsOverview | null;
  readonly loading: boolean;
}

export function McpLatencyCard({ overview, loading }: McpLatencyCardProps): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="gap-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{t('dashboard.latency', 'Latency')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="mt-4 h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const avgLatency = overview?.avg_duration_ms ?? 0;
  const p95Latency = overview?.p95_duration_ms ?? 0;

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t('dashboard.latency', 'Latency')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-normal">{Math.round(avgLatency)}</span>
          <span className="text-lg font-medium text-muted-foreground">ms</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            P95 <span className="ml-0.5 font-bold text-foreground">{Math.round(p95Latency)} ms</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
