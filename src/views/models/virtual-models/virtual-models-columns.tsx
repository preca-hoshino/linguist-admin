import type { ColumnDef } from '@tanstack/react-table';
import { Box, Braces, GitMerge, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import type { VirtualModel } from '@/types';
import { cn } from '@/utils/utils';
import { VirtualModelsRowActions } from './virtual-models-row-actions';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

const MODEL_TYPE_ICON: Record<string, React.ElementType> = {
  chat: MessageSquare,
  embedding: Braces,
};

export function useVirtualModelsColumns(): ColumnDef<VirtualModel>[] {
  const { t } = useTranslation();

  const getStrategyName = (s?: string | null): string => {
    if (s === 'load_balance') {
      return t('modelsPage.virtualModels.strategyLoadBalance', 'Load Balance');
    }
    if (s === 'failover') {
      return t('modelsPage.virtualModels.strategyFailover', 'Failover');
    }
    if (s === 'fallback') {
      return t('modelsPage.virtualModels.strategyFailback', 'Failback');
    }
    return (s ?? '') === '' ? 'N/A' : (s as string);
  };

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.virtualModels.name', 'Name')} />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'model_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.virtualModels.type', 'Type')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const typeStr = row.getValue<string>('model_type');
        const Icon = MODEL_TYPE_ICON[typeStr as 'chat' | 'embedding'] ?? Box;
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
      accessorKey: 'routing_strategy',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('modelsPage.virtualModels.routingStrategy', 'Routing Strategy')}
        />
      ),
      cell: ({ row }): React.JSX.Element => {
        const strategy = row.getValue<string | null | undefined>('routing_strategy');
        return (
          <div className="flex items-center gap-1.5">
            <GitMerge className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs font-normal">
              {getStrategyName(strategy)}
            </Badge>
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
        <DataTableColumnHeader column={column} title={t('modelsPage.virtualModels.status', 'Status')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const isActive = row.getValue<boolean>('is_active');
        return (
          <Badge
            variant="outline"
            className={cn(isActive ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground')}
          >
            {isActive
              ? t('modelsPage.virtualModels.active', 'Active')
              : t('modelsPage.virtualModels.inactive', 'Inactive')}
          </Badge>
        );
      },
      enableSorting: true,
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
        <DataTableColumnHeader column={column} title={t('modelsPage.virtualModels.createdAt', 'Created')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.getValue('created_at'))}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <VirtualModelsRowActions row={row} />,
    },
  ];
}
