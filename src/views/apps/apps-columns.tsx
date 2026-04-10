import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import type { App } from '@/types/app';
import { cn } from '@/utils/utils';
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
          {/* 这里可以放一个 icon 的渲染，比如 <span>{row.original.icon}</span>，假设目前 icon 保存了 emoji 或者 img src */}
          {row.original.icon !== null && row.original.icon !== '' && (
            <span className="text-lg">{row.original.icon}</span>
          )}
          <span className="font-medium">{row.getValue<string>('name')}</span>
        </div>
      ),
      enableSorting: true,
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
      accessorKey: 'allowed_model_ids',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('apps.allowedModels', 'Allowed Models')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const models = row.original.allowed_model_ids;
        if (models.length === 0) {
          return <span className="text-sm text-muted-foreground">{t('apps.allModels', 'All Models')}</span>;
        }
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {models.length} {t('apps.modelsCount', 'Models')}
          </div>
        );
      },
      enableSorting: false,
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
