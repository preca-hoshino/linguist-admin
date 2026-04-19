import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { ProviderBadge } from '@/components/ProviderBadge';
import { Badge } from '@/components/ui/Badge';
import type { Provider } from '@/types';
import { ProvidersRowActions } from './providers-row-actions';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export function useProvidersColumns(): ColumnDef<Provider>[] {
  const { t } = useTranslation();

  const columns: ColumnDef<Provider>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.providers.id', 'ID')} />,
      meta: { className: 'w-[100px]' },
      cell: ({ row }) => <div className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.providers.name', 'Name')} />,
      meta: { className: 'max-w-0 w-1/4' },
      cell: ({ row }) => <span className="truncate font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'kind',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.providers.kind', 'Kind')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const kindValue = row.getValue<string>('kind');
        return <ProviderBadge provider={kindValue} />;
      },
      filterFn: (row, id, value): boolean => {
        return (value as string[]).includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'base_url',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providers.baseUrl', 'Base URL')} />
      ),
      meta: { className: 'max-w-0 w-1/4' },
      cell: ({ row }) => (
        <span className="truncate font-mono text-xs text-muted-foreground">{row.getValue('base_url')}</span>
      ),
    },
    {
      accessorKey: 'credential_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providers.credentialType', 'Auth')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const credType = row.getValue<string>('credential_type');
        return (
          <Badge variant="outline" className="capitalize">
            {credType === 'api_key' ? 'API Key' : credType}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.providers.createdAt', 'Created')} />
      ),
      meta: {},
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.getValue('created_at'))}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ProvidersRowActions row={row} />,
    },
  ];

  return columns;
}
