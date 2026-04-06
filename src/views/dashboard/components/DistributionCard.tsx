import { Anthropic, Gemini, OpenAI, ProviderIcon } from '@lobehub/icons';
import { Box, Braces, Loader2, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listVirtualModels } from '@/api/virtual-models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { type TimeRange, useBreakdownStats } from '@/composables/use-breakdown-stats';
import type { StatsBreakdownGroupBy } from '@/types';
import type { StatsFilterOptions } from '@/types/dashboard';
import { RankedModelInfo } from './RankedModelInfo';

interface DistributionCardProps {
  readonly title: string;
  readonly description?: string;
  readonly groupBy: StatsBreakdownGroupBy;
  readonly timeRange: TimeRange;
  readonly providerId?: string;
  readonly filterOptions?: StatsFilterOptions;
  readonly refreshKey?: number | undefined;
}

export function DistributionCard({
  title,
  description,
  groupBy,
  timeRange,
  providerId,
  filterOptions,
  refreshKey,
}: DistributionCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const opts =
    filterOptions ?? (providerId === undefined ? undefined : { dimension: 'provider' as const, id: providerId });
  const { data, loading, error } = useBreakdownStats(groupBy, timeRange, 10, opts, refreshKey);

  const [vmTypes, setVmTypes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (groupBy === 'virtual_model') {
      listVirtualModels({ limit: 100 })
        .then((res) => {
          if (res.ok) {
            const types: Record<string, string> = {};
            for (const vm of res.data.data) {
              types[vm.name] = vm.model_type;
            }
            setVmTypes(types);
          }
        })
        .catch((_error: unknown) => {
          /* ignore */
        });
    }
  }, [groupBy]);

  const isLoadingInitial = loading && data.length === 0;

  let totalRequests = 1;
  if (data.length > 0) {
    totalRequests = 0;
    for (const d of data) {
      totalRequests += d.request_count;
    }
  }

  const renderLabel = (
    item: { name: string; request_count: number; provider_name?: string | null; provider_kind?: string | null },
    index: number,
  ): React.JSX.Element => {
    if (groupBy === 'provider_model') {
      return (
        <div className="flex min-w-0 flex-1 items-center pr-4">
          <RankedModelInfo
            rank={index + 1}
            providerName={item.provider_name ?? null}
            providerKind={item.provider_kind ?? null}
            modelName={item.name}
          />
        </div>
      );
    }
    if (groupBy === 'user_format') {
      const fmt = item.name;
      let label = fmt;
      switch (fmt) {
        case 'openaicompat': {
          label = 'OpenAI Compat';
          break;
        }
        case 'anthropic': {
          label = 'Anthropic';
          break;
        }
        case 'gemini': {
          label = 'Gemini';
          break;
        }
      }

      const renderIcon = (): React.JSX.Element => {
        if (fmt === 'anthropic') {
          return <Anthropic size={14} className="fill-current" />;
        }
        if (fmt === 'openaicompat') {
          return <OpenAI size={14} className="fill-current" />;
        }
        if (fmt === 'gemini') {
          return <Gemini size={14} className="fill-current" />;
        }
        return <ProviderIcon provider={fmt} size={14} type="mono" className="fill-current" />;
      };

      return (
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border bg-background text-muted-foreground shadow-sm">
            {renderIcon()}
          </span>
          <span className="truncate font-medium text-foreground" title={label}>
            {label}
          </span>
        </div>
      );
    }
    if (groupBy === 'virtual_model') {
      const typeStr = vmTypes[item.name];
      let Icon = Box;
      if (typeStr === 'chat') {
        Icon = MessageSquare;
      } else if (typeStr === 'embedding') {
        Icon = Braces;
      }
      return (
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border bg-background text-muted-foreground shadow-sm">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate font-medium text-foreground" title={item.name}>
            {item.name}
          </span>
        </div>
      );
    }
    return (
      <span className="truncate pr-4 font-medium" title={item.name}>
        {item.name}
      </span>
    );
  };

  const renderContent = (): React.JSX.Element => {
    if (error !== null && error !== '') {
      return <div className="flex h-full items-center justify-center text-sm text-destructive">{error}</div>;
    }
    if (isLoadingInitial) {
      return (
        <div className="flex h-[150px] items-center justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }
    if (data.length === 0) {
      return (
        <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
          {t('dashboard.no_data', 'No data')}
        </div>
      );
    }
    return (
      <div className={`space-y-4 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {data.map((item, index) => {
          const widthRatio = Math.max((item.request_count / totalRequests) * 100, 2);
          const formattedValue = new Intl.NumberFormat('en-US').format(item.request_count);
          return (
            <div key={item.name + String(index)} className="flex flex-col space-y-1.5">
              <div className="flex min-h-[32px] items-center justify-between text-sm">
                {renderLabel(item, index)}
                <span className="shrink-0 text-muted-foreground">{formattedValue}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full flex-shrink-0 rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${widthRatio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="font-semibold">{title}</CardTitle>
        {description !== undefined && description !== '' && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="relative max-h-[380px] w-full flex-1 overflow-y-auto pt-2 pb-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
