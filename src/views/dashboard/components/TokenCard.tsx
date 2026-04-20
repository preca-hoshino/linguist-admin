import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { StatsOverview, StatsToday } from '@/types';
import { formatCompact } from '@/utils/format-number';

interface TokenCardProps {
  readonly today: StatsToday | null;
  readonly overview: StatsOverview | null;
  readonly loading: boolean;
}

export function TokenCard({ today, overview, loading }: TokenCardProps): React.JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card className="gap-4 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{t('dashboard.tokens')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="mt-4 h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalTokens = today?.today_tokens ?? 0;
  const prompt = today?.today_prompt_tokens ?? 0;
  const completion = today?.today_completion_tokens ?? 0;
  const cached = overview?.cached_tokens ?? 0;

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t('dashboard.tokens')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold tracking-normal">{formatCompact(totalTokens, 1)}</div>

        <div className="mt-4 flex items-center gap-4 text-left">
          <div className="flex flex-col gap-0.5 leading-tight">
            <span className="text-[10px] text-muted-foreground">{t('dashboard.promptTokens')}</span>
            <span className="text-sm font-bold">{formatCompact(prompt, 1)}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex flex-col gap-0.5 leading-tight">
            <span className="text-[10px] text-muted-foreground">{t('dashboard.completionTokens')}</span>
            <span className="text-sm font-bold">{formatCompact(completion, 1)}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex flex-col gap-0.5 leading-tight">
            <span className="text-[10px] text-muted-foreground">{t('dashboard.cachedTokens')}</span>
            <span className="text-sm font-bold">{formatCompact(cached, 1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
