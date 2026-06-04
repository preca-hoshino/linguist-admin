import type { ColumnDef } from '@tanstack/react-table';
import {
  AudioLines,
  Box,
  Braces,
  BrainCircuit,
  DatabaseZap,
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
  PlayCircle,
  Scaling,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { ProviderCell } from '@/components/provider/ProviderCell';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Progress } from '@/components/ui/Progress';
import type { ProviderModel } from '@/types';
import { cn } from '@/utils/utils';
import { ProviderModelsRowActions } from './provider-models-row-actions';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function renderThroughput(
  usage: number | undefined,
  limit: number | null | undefined,
  label: string,
): React.JSX.Element {
  if (limit == null || limit === 0) {
    return (
      <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{usage ?? 0} / ∞</span>
      </div>
    );
  }
  const pct = Math.min(((usage ?? 0) / limit) * 100, 100);
  const isHigh = pct >= 90;
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className={isHigh ? 'font-medium text-destructive' : ''}>
          {usage ?? 0} / {limit}
        </span>
      </div>
      <Progress value={pct} className={cn('h-1', isHigh && '[&>div]:bg-destructive')} />
    </div>
  );
}

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

export function useProviderModelsColumns(): ColumnDef<ProviderModel>[] {
  const { t } = useTranslation();

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(value === true);
          }}
          aria-label={t('common.selectAll', 'Select all')}
        />
      ),
      meta: { className: 'w-10 ps-4', tdClassName: 'ps-4' },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(value === true);
          }}
          aria-label={t('common.selectRow', 'Select row')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      meta: { className: 'w-[100px]' },
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue<string>('id')}</span>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.name', 'Name')} />
      ),
      meta: {},
      cell: ({ row }) => <span className="font-medium">{row.getValue<string>('name')}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'provider_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.provider', 'Provider')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const model = row.original;
        return <ProviderCell kind={model.provider_kind} id={model.provider_id} name={model.provider_name} />;
      },
      enableSorting: true,
      enableHiding: true,
      filterFn: (row, id, value: string[]): boolean => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'model_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.type', 'Type')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const typeStr = row.getValue<string>('model_type');
        const Icon = MODEL_TYPE_ICON[typeStr] ?? Box;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{t(`modelsPage.modelType.${typeStr}`)}</span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
      filterFn: (row, id, value: string[]): boolean => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.status', 'Status')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const isActive = row.getValue<boolean>('is_active');
        return (
          <Badge
            variant="outline"
            className={cn(isActive ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground')}
          >
            {isActive
              ? t('modelsPage.providerModels.active', 'Active')
              : t('modelsPage.providerModels.inactive', 'Inactive')}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'capabilities',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.capabilities', 'Capabilities')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const caps = row.getValue<string[] | undefined>('capabilities');
        if (caps == null || caps.length === 0) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }
        const sorted = caps.toSorted((a, b) => CAP_ORDER.indexOf(a) - CAP_ORDER.indexOf(b));
        return (
          <div className="flex flex-wrap gap-1">
            {sorted.map((cap) => {
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
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'throughput',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.throughput', 'Throughput')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const model = row.original;
        return (
          <div className="flex w-36 flex-col gap-2">
            {renderThroughput(model.throughput?.rpm, model.rpm_limit, 'RPM')}
            {renderThroughput(model.throughput?.tpm, model.tpm_limit, 'TPM')}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'error_rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('dashboard.stats.errorRate', 'Error Rate')} />
      ),
      meta: {},
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'latency',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('dashboard.stats.avgLatency', 'Latency')} />
      ),
      meta: {},
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.createdAt', 'Created')} />
      ),
      meta: {},
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.getValue('created_at'))}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ProviderModelsRowActions row={row} />,
    },
  ];
}
