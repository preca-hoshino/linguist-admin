import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { McpStatsToday } from '@/api/mcp/stats';
import { formatCompact } from '@/utils/format-number';

interface McpRequestCardProps {
  readonly today: McpStatsToday | null;
  readonly loading: boolean;
}

export function McpRequestCard({ today, loading }: McpRequestCardProps): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="gap-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">{t('dashboard.todayRequests')}</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="mt-4 h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  const todayRequests = today?.today_requests ?? 0;
  const rpm = today?.current_rpm ?? 0;

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{t('dashboard.todayRequests')}</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold tracking-normal">{formatCompact(todayRequests, 1)}</div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            RPM <span className="ml-0.5 font-bold text-foreground">{formatCompact(rpm, 1)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
