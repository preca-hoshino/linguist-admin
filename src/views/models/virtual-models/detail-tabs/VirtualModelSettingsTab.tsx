import { Link } from '@tanstack/react-router';
import { ArrowUpDown, Box, Braces, Clock, ExternalLink, GitMerge, MessageSquare, Pencil, Weight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import type { VirtualModel } from '@/types';
import { cn } from '@/utils/utils';

const MODEL_TYPE_ICON: Record<string, React.ElementType> = {
  chat: MessageSquare,
  embedding: Braces,
};

const STRATEGY_DESC: Record<string, { color: string; i18nKey: string; fallback: string }> = {
  load_balance: {
    color: 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
    i18nKey: 'modelsPage.virtualModels.strategyLoadBalance',
    fallback: 'Load Balance',
  },
  failover: {
    color:
      'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    i18nKey: 'modelsPage.virtualModels.strategyFailover',
    fallback: 'Failover',
  },
  fallback: {
    color:
      'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    i18nKey: 'modelsPage.virtualModels.strategyFailback',
    fallback: 'Fallback',
  },
};

function DetailRow({
  label,
  icon: Icon,
  children,
}: {
  readonly label: string;
  readonly icon?: React.ElementType;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-4">
      <Label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
        {Icon != null && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}

interface VirtualModelSettingsTabProps {
  readonly model: VirtualModel;
  readonly onEdit: () => void;
}

export function VirtualModelSettingsTab({ model, onEdit }: VirtualModelSettingsTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const TypeIcon = MODEL_TYPE_ICON[model.model_type] ?? Box;
  const strategyStyle = STRATEGY_DESC[model.routing_strategy];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 配置区 */}
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{t('modelsPage.providers.configuration', 'Configuration')}</h3>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {t('common.edit', 'Edit')}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 基础信息 */}
          <div className="h-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="mb-5">
              <h4 className="text-sm font-medium">{t('modelsPage.providers.settingsBasic', 'Basic Configuration')}</h4>
            </div>
            <div className="space-y-4">
              <DetailRow label={t('modelsPage.virtualModels.name', 'Name')}>
                <span className="font-mono text-sm font-medium">{model.name}</span>
              </DetailRow>
              {model.description && (
                <DetailRow label={t('modelsPage.virtualModels.description', 'Description')}>
                  <span className="text-sm text-muted-foreground">{model.description}</span>
                </DetailRow>
              )}
              <DetailRow label={t('modelsPage.virtualModels.type', 'Type')}>
                <Badge variant="outline" className="flex w-fit items-center gap-1.5 px-2 py-0.5 capitalize">
                  <TypeIcon className="h-3.5 w-3.5" />
                  <span>{t(`modelsPage.modelType.${model.model_type}`)}</span>
                </Badge>
              </DetailRow>
              <DetailRow label={t('modelsPage.virtualModels.status', 'Status')}>
                <Badge
                  variant="outline"
                  className={cn(
                    model.is_active ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground',
                  )}
                >
                  {model.is_active
                    ? t('modelsPage.virtualModels.active', 'Active')
                    : t('modelsPage.virtualModels.inactive', 'Inactive')}
                </Badge>
              </DetailRow>
              <DetailRow label={t('modelsPage.providers.createdAt', 'Created')} icon={Clock}>
                <span className="text-sm text-muted-foreground">{new Date(model.created_at).toLocaleString()}</span>
              </DetailRow>
              <DetailRow label={t('modelsPage.providers.updatedAt', 'Updated')} icon={Clock}>
                <span className="text-sm text-muted-foreground">{new Date(model.updated_at).toLocaleString()}</span>
              </DetailRow>
            </div>
          </div>

          {/* 路由策略 */}
          <div className="h-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="mb-5">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <GitMerge className="h-4 w-4 text-muted-foreground" />
                {t('modelsPage.virtualModels.routingStrategy', 'Routing Strategy')}
              </h4>
            </div>
            <div className="space-y-3">
              <Badge variant="outline" className={cn('px-3 py-1 text-sm font-medium', strategyStyle?.color)}>
                {strategyStyle ? t(strategyStyle.i18nKey, strategyStyle.fallback) : model.routing_strategy}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {model.routing_strategy === 'load_balance' || model.routing_strategy === 'fallback'
                  ? t(
                      'modelsPage.virtualModels.strategyLoadBalanceDesc',
                      'Requests are distributed across backends based on weight.',
                    )
                  : t(
                      'modelsPage.virtualModels.strategyFailoverDesc',
                      'Requests are routed to the highest-priority backend; failover on error.',
                    )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* 后端模型列表 */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold">
          {t('modelsPage.virtualModels.backends', 'Backend Models')}
          <span className="ml-2 text-xs font-normal text-muted-foreground">({model.backends.length})</span>
        </h3>
        <div className="space-y-3">
          {model.backends.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t('modelsPage.virtualModels.noBackends', 'No backend configured.')}
            </div>
          ) : (
            model.backends
              .toSorted((a, b) => {
                const pDiff = a.priority - b.priority;
                return pDiff === 0 ? b.weight - a.weight : pDiff;
              })
              .map((backend, idx) => (
                <div
                  key={backend.provider_model_id}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {/* 序号 */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-mono text-sm font-medium">
                        {backend.provider_model_name ?? backend.provider_model_id}
                      </div>
                      {(backend.provider_name ?? '') !== '' && (
                        <div className="text-xs text-muted-foreground">{backend.provider_name}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      {t('modelsPage.virtualModels.backendWeight', 'Weight')}:{' '}
                      <strong className="ml-0.5 text-foreground">{backend.weight}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowUpDown className="h-3 w-3" />
                      {t('modelsPage.virtualModels.backendPriority', 'Priority')}:{' '}
                      <strong className="ml-0.5 text-foreground">{backend.priority}</strong>
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                      <Link to="/models/provider-models/$id" params={{ id: backend.provider_model_id }}>
                        <ExternalLink className="mr-1 h-3 w-3" />
                        {t('modelsPage.providers.detail', 'Detail')}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
