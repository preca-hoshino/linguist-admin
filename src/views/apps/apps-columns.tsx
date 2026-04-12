import type { ColumnDef, Row } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { CopyableId } from '@/components/CopyableId';
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
      cell: ({ row }): React.JSX.Element => <span className="font-medium">{row.getValue<string>('name')}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'allowed_model_ids',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('apps.virtualModels', 'Virtual Models')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const models = row.getValue<string[] | null>('allowed_model_ids');
        return <span className="font-medium text-muted-foreground">{models?.length ?? 0}</span>;
      },
      enableSorting: true,
      sortingFn: (rowA: Row<App>, rowB: Row<App>, columnId: string): number => {
        const a = rowA.getValue<string[] | null>(columnId)?.length ?? 0;
        const b = rowB.getValue<string[] | null>(columnId)?.length ?? 0;
        return a - b;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'allowed_mcp_ids',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apps.virtualMcps', 'Virtual MCPs')} />,
      cell: ({ row }): React.JSX.Element => {
        const mcps = row.getValue<string[] | null>('allowed_mcp_ids');
        return <span className="font-medium text-muted-foreground">{mcps?.length ?? 0}</span>;
      },
      enableSorting: true,
      sortingFn: (rowA: Row<App>, rowB: Row<App>, columnId: string): number => {
        const a = rowA.getValue<string[] | null>(columnId)?.length ?? 0;
        const b = rowB.getValue<string[] | null>(columnId)?.length ?? 0;
        return a - b;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'api_key',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apps.apiKey', 'API Key')} />,
      cell: ({ row }): React.JSX.Element => {
        const apiKey = row.getValue<string>('api_key');
        return <CopyableId id={apiKey} />;
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
