import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { McpStatsOverview, McpStatsToday } from '@/api/mcp/stats';
import { formatCompact } from '@/utils/format-number';

interface McpErrorRateCardProps {
  readonly today: McpStatsToday | null;
  readonly overview: McpStatsOverview | null;
  readonly loading: boolean;
}

export function McpErrorRateCard({ today, overview, loading }: McpErrorRateCardProps): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="gap-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{t('dashboard.errors', 'Errors')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="mt-4 h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const todayErrors = today?.today_errors ?? 0;
  const totalErrors = overview?.error_count ?? 0;
  const totalRequests = overview?.total_requests ?? 0;

  let errorRate = 0;
  if (totalRequests > 0) {
    errorRate = (totalErrors / totalRequests) * 100;
  }

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t('dashboard.errors', 'Errors')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-normal">{formatCompact(todayErrors, 1)}</span>
          <span className="text-lg font-medium text-muted-foreground">/ {formatCompact(totalErrors, 1)}</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Error Rate</span>
          <span className={`font-bold ${errorRate > 5 ? 'text-destructive' : 'text-foreground'}`}>
            {errorRate.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
