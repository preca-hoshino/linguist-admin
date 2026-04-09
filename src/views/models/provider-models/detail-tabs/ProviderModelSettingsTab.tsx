import { DeepSeek, Gemini, Github, ProviderIcon, Volcengine } from '@lobehub/icons';
import { Link, useRouter } from '@tanstack/react-router';
import {
  Box,
  Braces,
  BrainCircuit,
  Clock,
  DatabaseZap,
  ExternalLink,
  Eye,
  Globe,
  Images,
  MessageSquare,
  Network,
  Pencil,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import type { ProviderModel } from '@/types';
import { cn } from '@/utils/utils';
import { ProviderModelsMutateDialog } from '../provider-models-mutate-dialog';

/* Provider Icon 渲染 */
function SettingsProviderIcon({ kind }: { readonly kind: string }): React.JSX.Element {
  const props = { size: 14, className: 'fill-current shrink-0' } as const;
  switch (kind) {
    case 'gemini': {
      return <Gemini {...props} />;
    }
    case 'deepseek': {
      return <DeepSeek {...props} />;
    }
    case 'volcengine': {
      return <Volcengine {...props} />;
    }
    case 'copilot': {
      return <Github {...props} />;
    }

    default: {
      return <ProviderIcon provider={kind} size={14} type="mono" className="shrink-0 fill-current" />;
    }
  }
}

/* 能力 Badge 体系 */
const CAP_TO_I18N: Record<string, string> = {
  vision: 'capVision',
  tools: 'capFunctionCalling',
  thinking: 'capReasoning',
  cache: 'capCache',
  web_search: 'capWebSearch',
  multimodal: 'capMultimodal',
  sparse_vector: 'capSparseVector',
};
const CAP_TO_STYLE: Record<string, string> = {
  vision:
    'bg-violet-50 border-violet-300 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
  tools:
    'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  thinking:
    'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  cache: 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  web_search: 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  multimodal:
    'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:border-fuchsia-500/30',
  sparse_vector:
    'bg-teal-50 border-teal-300 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30',
};
const CAP_TO_ICON: Record<string, React.ElementType> = {
  vision: Eye,
  tools: Wrench,
  thinking: BrainCircuit,
  cache: DatabaseZap,
  web_search: Globe,
  multimodal: Images,
  sparse_vector: Network,
};
const MODEL_TYPE_ICON: Record<string, React.ElementType> = {
  chat: MessageSquare,
  embedding: Braces,
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

interface ProviderModelSettingsTabProps {
  readonly model: ProviderModel;
}

export function ProviderModelSettingsTab({ model }: ProviderModelSettingsTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const TypeIcon = MODEL_TYPE_ICON[model.model_type] ?? Box;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 配置区容器 */}
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{t('modelsPage.providers.configuration', 'Configuration')}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditOpen(true);
            }}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {t('common.edit', 'Edit')}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Section 1: 基础信息 */}
          <div className="h-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="mb-5">
              <h4 className="text-sm font-medium">{t('modelsPage.providers.settingsBasic', 'Basic Configuration')}</h4>
            </div>
            <div className="space-y-4">
              <DetailRow label={t('modelsPage.providerModels.name', 'Name')}>
                <span className="font-mono text-sm font-medium">{model.name}</span>
              </DetailRow>
              <DetailRow label={t('modelsPage.providerModels.detailPage.modelType', 'Model Type')}>
                <Badge variant="outline" className="flex w-fit items-center gap-1.5 px-2 py-0.5 capitalize">
                  <TypeIcon className="h-3.5 w-3.5" />
                  <span>{t(`modelsPage.modelType.${model.model_type}`)}</span>
                </Badge>
              </DetailRow>
              <DetailRow label={t('modelsPage.providerModels.status', 'Status')}>
                <Badge
                  variant="outline"
                  className={cn(
                    model.is_active ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground',
                  )}
                >
                  {model.is_active
                    ? t('modelsPage.providerModels.active', 'Active')
                    : t('modelsPage.providerModels.inactive', 'Inactive')}
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

          {/* Section 2: 能力与参数 */}
          <div className="h-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="mb-5">
              <h4 className="text-sm font-medium">
                {t('modelsPage.providerModels.detailPage.capabilities', 'Capabilities & Parameters')}
              </h4>
            </div>
            <div className="space-y-4">
              <DetailRow label={t('modelsPage.providerModels.capabilities', 'Capabilities')}>
                {model.capabilities.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((cap) => {
                      const Icon = CAP_TO_ICON[cap];
                      return (
                        <Badge
                          key={cap}
                          variant="outline"
                          className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-[2px] font-sans text-[10px] font-medium whitespace-nowrap shadow-none',
                            CAP_TO_STYLE[cap] ?? 'border-border/40 bg-muted/50 text-muted-foreground',
                          )}
                        >
                          {Icon != null && <Icon className="h-3 w-3" />}
                          <span>{t(`modelsPage.providerModels.${CAP_TO_I18N[cap] ?? cap}`, cap)}</span>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </DetailRow>
              <DetailRow label={t('modelsPage.providerModels.detailPage.parameters', 'Parameters')}>
                {Object.keys(model.parameters).length > 0 ? (
                  <pre className="max-h-48 overflow-auto rounded bg-muted px-3 py-2 font-mono text-xs">
                    {JSON.stringify(model.parameters, null, 2)}
                  </pre>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t('modelsPage.providerModels.detailPage.noParameters', 'No custom parameters')}
                  </span>
                )}
              </DetailRow>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 3: 所属提供商 */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold">
          {t('modelsPage.providerModels.detailPage.belongsTo', 'Belongs to Provider')}
        </h3>
        <div className="rounded-lg border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 text-foreground">
                {model.provider_kind != null && model.provider_kind !== '' ? (
                  <SettingsProviderIcon kind={model.provider_kind} />
                ) : (
                  <Box className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {model.provider_name != null && model.provider_name !== '' ? model.provider_name : model.provider_id}
                </div>
                {model.provider_kind != null && model.provider_kind !== '' && (
                  <span className="text-xs text-muted-foreground capitalize">{model.provider_kind}</span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/models/providers/$id" params={{ id: model.provider_id }}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                {t('modelsPage.providers.detail', 'View Details')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <ProviderModelsMutateDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentRow={model}
        fixedProviderId={model.provider_id}
        onSuccess={() => {
          void router.invalidate();
        }}
      />
    </div>
  );
}
