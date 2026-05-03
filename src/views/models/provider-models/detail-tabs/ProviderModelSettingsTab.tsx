import { Link, useRouter } from '@tanstack/react-router';
import {
  AudioLines,
  Box,
  Braces,
  BrainCircuit,
  Clock,
  DatabaseZap,
  ExternalLink,
  Eye,
  FileCode,
  Globe,
  Images,
  Languages,
  MessageSquare,
  Mic,
  Minimize2,
  Network,
  Paintbrush,
  Pencil,
  PlayCircle,
  Scaling,
  Sparkles,
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
import { ProviderLogo } from '@/components/provider/ProviderLogo';
import { ProviderModelsMutateDialog } from '../provider-models-mutate-dialog';

/* 能力 Badge 体系 */
const CAP_TO_I18N: Record<string, string> = {
  vision: 'capVision',
  tools: 'capFunctionCalling',
  thinking: 'capReasoning',
  cache: 'capCache',
  web_search: 'capWebSearch',
  structured_output: 'capStructuredOutput',
  stream: 'capStream',
  multimodal: 'capMultimodal',
  sparse_vector: 'capSparseVector',
  dynamic_dim: 'capDynamicDim',
  multilingual: 'capMultilingual',
  cross_lingual: 'capCrossLingual',
  inpaint: 'capInpaint',
  upscale: 'capUpscale',
  style_transfer: 'capStyleTransfer',
  asr: 'capAsr',
  tts: 'capTts',
  voice_clone: 'capVoiceClone',
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
  structured_output:
    'bg-indigo-50 border-indigo-300 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
  stream:
    'bg-orange-50 border-orange-300 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
  multimodal:
    'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:border-fuchsia-500/30',
  sparse_vector:
    'bg-teal-50 border-teal-300 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30',
  dynamic_dim:
    'bg-lime-50 border-lime-300 text-lime-800 dark:bg-lime-500/10 dark:text-lime-300 dark:border-lime-500/30',
  multilingual:
    'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  cross_lingual:
    'bg-cyan-50 border-cyan-300 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30',
  inpaint: 'bg-pink-50 border-pink-300 text-pink-800 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/30',
  upscale:
    'bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
  style_transfer:
    'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/30',
  asr: 'bg-stone-50 border-stone-300 text-stone-800 dark:bg-stone-500/10 dark:text-stone-300 dark:border-stone-500/30',
  tts: 'bg-zinc-50 border-zinc-300 text-zinc-800 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/30',
  voice_clone:
    'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
};
const CAP_TO_ICON: Record<string, React.ElementType> = {
  vision: Eye,
  tools: Wrench,
  thinking: BrainCircuit,
  cache: DatabaseZap,
  web_search: Globe,
  structured_output: FileCode,
  stream: PlayCircle,
  multimodal: Images,
  sparse_vector: Network,
  dynamic_dim: Minimize2,
  multilingual: Languages,
  cross_lingual: Network,
  inpaint: Paintbrush,
  upscale: Scaling,
  style_transfer: Sparkles,
  asr: Mic,
  tts: AudioLines,
  voice_clone: Sparkles,
};

/** 所有能力的全局显示顺序，与弹窗 capabilities 选择器保持一致 */
const CAP_ORDER: string[] = [
  // chat
  'vision',
  'tools',
  'thinking',
  'cache',
  'web_search',
  'structured_output',
  'stream',
  // embedding
  'multimodal',
  'sparse_vector',
  'dynamic_dim',
  // rerank
  'multilingual',
  'cross_lingual',
  // image
  'inpaint',
  'upscale',
  'style_transfer',
  // audio
  'asr',
  'tts',
  'voice_clone',
];

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
                    {model.capabilities
                      .toSorted((a, b) => CAP_ORDER.indexOf(a) - CAP_ORDER.indexOf(b))
                      .map((cap) => {
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
              <DetailRow label={t('modelsPage.providerModels.supportedParameters', 'Supported Parameters')}>
                {model.supported_parameters != null && model.supported_parameters.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {model.supported_parameters.map((param) => (
                      <Badge
                        key={param}
                        variant="outline"
                        className="rounded-full border-slate-300 bg-slate-50 px-2 py-[2px] font-sans text-[10px] font-medium text-slate-800 whitespace-nowrap shadow-none dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300"
                      >
                        {param}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
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
                  <ProviderLogo
                    provider={model.provider_kind}
                    size={14}
                    type="mono"
                    className="fill-current shrink-0"
                  />
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
