import { ProviderCell } from '@/components/ProviderCell';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
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
      id: 'throughput',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providerModels.throughput', 'Throughput')} />
      ),
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
