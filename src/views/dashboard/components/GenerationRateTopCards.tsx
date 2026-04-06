import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type TimeRange, useBreakdownStats } from '@/composables/use-breakdown-stats';
import { type GlobalTimeRange, mapGlobalRangeToApi } from '@/types/dashboard';
import { RankedModelInfo } from './RankedModelInfo';

interface GenerationRateTopCardsProps {
  readonly timeRange: GlobalTimeRange;
  readonly providerId?: string;
  readonly refreshKey?: number | undefined;
}

function formatTokensPerSec(itl_ms: number): string {
  const tokPerSec = 1000 / itl_ms;
  return tokPerSec.toFixed(1);
}

export function GenerationRateTopCards({
  timeRange,
  providerId,
  refreshKey,
}: GenerationRateTopCardsProps): React.JSX.Element {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const apiRange = mapGlobalRangeToApi(timeRange) as TimeRange;

  const { data, loading, error } = useBreakdownStats(
    'provider_model',
    apiRange,
    50,
    providerId !== undefined && providerId !== '' ? { dimension: 'provider', id: providerId } : undefined,
    refreshKey,
  );

  // 算法：只提取请求数 > 0 且存在真实 ITL 的模型，并按生成的 tokens/sec 降序排前 10（等同于 ITL 升序）
  const list = data
    .filter((d) => d.request_count > 0 && d.itl_avg_ms !== null && d.itl_avg_ms > 0)
    .toSorted((a, b) => (a.itl_avg_ms as number) - (b.itl_avg_ms as number))
    .slice(0, 10);

  // 绑定原生 wheel 事件，将垂直滚动转换为水平滚动，并在边界外放行
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const handleWheel = (e: WheelEvent): void => {
      if (e.deltaY === 0) {
        return;
      }

      const isAtLeft = el.scrollLeft <= 0 && e.deltaY < 0;
      const isAtRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;

      if (isAtLeft || isAtRight) {
        return; // 到达边界，允许页面向下/向上滚动
      }

      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: 'auto' });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return (): void => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (loading && list.length === 0) {
    return (
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="font-semibold">{t('dashboard.perf.generation_rate_ranking', '生成速率排行')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.perf.generation_rate_ranking_desc', '提取最近时段内每秒生成 Token 数量最快的前 10 名模型。')}
          </p>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pt-1 pb-4">
          {Array.from({ length: 10 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static placeholder items that don't reorder
            <Skeleton key={i} className="h-[120px] min-w-[240px] shrink-0 snap-start rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error !== null && error !== '') {
    return (
      <div className="mt-4 flex h-[120px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <div>
        <h3 className="font-semibold">{t('dashboard.perf.generation_rate_ranking', '生成速率排行')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.perf.generation_rate_ranking_desc', '提取最近时段内每秒生成 Token 数量最快的前 10 名模型。')}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="flex h-[120px] items-center justify-center rounded-xl border text-sm text-muted-foreground">
          {t('dashboard.no_data', 'No data')}
        </div>
      ) : (
        <div ref={scrollRef} className="flex snap-x gap-4 overflow-x-auto pt-1 pb-4">
          {list.map((item, index) => {
            return (
              <Card
                // biome-ignore lint/suspicious/noArrayIndexKey: order does not change in a static top card
                key={`${item.name}-${index}`}
                className="flex h-[120px] min-w-[240px] shrink-0 snap-start flex-col justify-between p-4"
              >
                <RankedModelInfo
                  rank={index + 1}
                  providerName={item.provider_name}
                  providerKind={item.provider_kind ?? null}
                  modelName={item.name}
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="w-8 shrink-0 font-mono text-xl font-bold text-muted-foreground/50">
                      #{index + 1}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
                        {formatTokensPerSec(item.itl_avg_ms as number)}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">tok/s</span>
                    </div>
                  </div>
                  {item.provider_model_id !== undefined &&
                  item.provider_model_id !== null &&
                  item.provider_model_id !== '' ? (
                    <Link
                      to="/models/provider-models/$id"
                      params={{ id: item.provider_model_id }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
