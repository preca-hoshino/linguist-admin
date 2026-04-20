import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { StatsToday } from '@/types';
import { formatCompact } from '@/utils/format-number';

interface SuccessRateCardProps {
  readonly today: StatsToday | null;
  readonly loading: boolean;
}

export function SuccessRateCard({ today, loading }: SuccessRateCardProps): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="gap-4 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{t('dashboard.successRate')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="mt-4 h-2 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const total = today?.today_requests ?? 0;
  const errors = today?.today_errors ?? 0;
  const success = total - errors;
  const rate = total > 0 ? (success / total) * 100 : 100;

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t('dashboard.successRate')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold tracking-normal">{rate.toFixed(1)}</span>
          <span className="ml-1 text-xl font-bold text-muted-foreground">%</span>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-foreground/70" style={{ width: `${rate}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {formatCompact(errors)} {t('dashboard.errors')}
            </span>
            <span>
              {formatCompact(total)} {t('dashboard.total')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
