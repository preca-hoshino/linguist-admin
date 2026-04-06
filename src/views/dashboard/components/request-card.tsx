import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { StatsOverview, StatsToday } from '@/types';
import { formatCompact } from '@/utils/format-number';

interface RequestCardProps {
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
  readonly loading: boolean;
}

export function RequestCard({ today, overview, loading }: RequestCardProps): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="gap-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{t('dashboard.requests')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="mt-4 h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  const todayRequests = today?.today_requests ?? 0;
  const totalRequests = overview?.total_requests ?? 0;
  const rpm = today?.current_rpm ?? 0;
  const tpm = today?.current_tpm ?? 0;

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t('dashboard.requests')}</CardTitle>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span>{t('common.realtime', 'Live')}</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-50"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-muted-foreground"></span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-normal">{formatCompact(todayRequests, 1)}</span>
          <span className="text-lg font-medium text-muted-foreground">/ {formatCompact(totalRequests, 1)}</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            RPM <span className="ml-0.5 font-bold text-foreground">{formatCompact(rpm, 1)}</span>
          </span>
          <span className="text-[10px]">·</span>
          <span>
            TPM <span className="ml-0.5 font-bold text-foreground">{formatCompact(tpm, 1)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
