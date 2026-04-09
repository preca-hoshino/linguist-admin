import { DeepSeek, Gemini, Github, ProviderIcon, Volcengine } from '@lobehub/icons';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Box,
  Braces,
  BrainCircuit,
  DatabaseZap,
  Eye,
  Globe,
  Images,
  MessageSquare,
  Network,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import type { ProviderModel } from '@/types';
import { cn } from '@/utils/utils';
import { ProviderModelsRowActions } from './provider-models-row-actions';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

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

export function useProviderModelsColumns(): ColumnDef<ProviderModel>[] {
  const { t } = useTranslation();

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue<string>('id')}</span>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.name', 'Name')} />
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue<string>('name')}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'provider_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.provider', 'Provider')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const providerId = row.getValue<string>('provider_id');
        const model = row.original;
        const kindValue = model.provider_kind != null && model.provider_kind !== '' ? model.provider_kind : providerId; // fallback to id if kind is empty

        let iconNode: React.ReactNode;
        switch (kindValue) {
          case 'gemini': {
            iconNode = <Gemini size={14} className="fill-current" />;
            break;
          }
          case 'deepseek': {
            iconNode = <DeepSeek size={14} className="fill-current" />;
            break;
          }
          case 'volcengine': {
            iconNode = <Volcengine size={14} className="fill-current" />;
            break;
          }
          case 'copilot': {
            iconNode = <Github size={14} className="fill-current" />;
            break;
          }
          default: {
            iconNode = <ProviderIcon provider={kindValue} size={14} type="mono" className="fill-current" />;
            break;
          }
        }

        return (
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-muted-foreground shadow-sm">
              {iconNode}
            </span>
            <span className="text-sm text-foreground">
              {model.provider_name != null && model.provider_name !== '' ? model.provider_name : providerId}
            </span>
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
      accessorKey: 'model_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.type', 'Type')} />
      ),
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
      cell: ({ row }): React.JSX.Element => {
        const caps = row.getValue<string[] | undefined>('capabilities');
        if (caps == null || caps.length === 0) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {caps.map((cap) => {
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
      id: 'rpm',
      header: ({ column }) => <DataTableColumnHeader column={column} title="RPM" />,
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'tpm',
      header: ({ column }) => <DataTableColumnHeader column={column} title="TPM" />,
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'error_rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('dashboard.stats.errorRate', 'Error Rate')} />
      ),
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'latency',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('dashboard.stats.avgLatency', 'Latency')} />
      ),
      cell: () => null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.createdAt', 'Created')} />
      ),
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
