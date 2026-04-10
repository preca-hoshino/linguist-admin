import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import type { App } from '@/types/app';
import { cn } from '@/utils/utils';
import { AppWindow } from 'lucide-react';
import { AppsRowActions } from './apps-row-actions';

export function useAppsColumns(): ColumnDef<App>[] {
  const { t } = useTranslation();

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }): React.JSX.Element => (
        <span className="font-mono text-xs text-muted-foreground">{row.getValue<string>('id')}</span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apps.name', 'Name')} />,
      cell: ({ row }): React.JSX.Element => (
        <div className="flex items-center gap-2">
          {/* 使用统计占位图标 */}
          <AppWindow className="h-5 w-5 text-muted-foreground mr-1" />
          <span className="font-medium">{row.getValue<string>('name')}</span>
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'allowed_model_ids',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('apps.virtualModels', 'Virtual Models')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const models = row.getValue<unknown[] | null>('allowed_model_ids');
        return <span className="font-medium text-muted-foreground">{models?.length ?? 0}</span>;
      },
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId): number => {
        const a = rowA.getValue<unknown[] | null>(columnId)?.length ?? 0;
        const b = rowB.getValue<unknown[] | null>(columnId)?.length ?? 0;
        return a - b;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'allowed_mcp_ids',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apps.virtualMcps', 'Virtual MCPs')} />,
      cell: ({ row }): React.JSX.Element => {
        const mcps = row.getValue<unknown[] | null>('allowed_mcp_ids');
        return <span className="font-medium text-muted-foreground">{mcps?.length ?? 0}</span>;
      },
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId): number => {
        const a = rowA.getValue<unknown[] | null>(columnId)?.length ?? 0;
        const b = rowB.getValue<unknown[] | null>(columnId)?.length ?? 0;
        return a - b;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'key_count',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apps.keyCount', 'Keys')} />,
      cell: ({ row }): React.JSX.Element => (
        <span className="text-muted-foreground">{row.getValue<number>('key_count')}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apps.status', 'Status')} />,
      cell: ({ row }): React.JSX.Element => {
        const isActive = row.getValue<boolean>('is_active');
        return (
          <Badge
            variant="outline"
            className={cn(isActive ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground')}
          >
            {isActive ? t('apps.active', 'Active') : t('apps.inactive', 'Inactive')}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apps.createdAt', 'Created At')} />,
      cell: ({ row }): React.JSX.Element => {
        const dateStr = row.getValue<string>('created_at');
        return (
          <span className="text-sm text-muted-foreground">{dateStr ? new Date(dateStr).toLocaleString() : '-'}</span>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }): React.JSX.Element => <AppsRowActions row={row} />,
    },
  ];
}
