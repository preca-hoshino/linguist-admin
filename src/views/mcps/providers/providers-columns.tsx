import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { McpProvider, McpProviderConfig } from '@/types/mcp';
import { ProvidersRowActions } from './providers-row-actions';
import { DataTableColumnHeader } from '@/components/data-table';
import type { TFunction } from 'i18next';

export function getProvidersColumns(t: TFunction): ColumnDef<McpProvider>[] {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('common.id', 'ID')} />,
      meta: { className: 'w-[100px]' },
      cell: ({ row }): React.JSX.Element => (
        <span className="text-[11px] font-mono text-muted-foreground">{row.original.id}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('mcpsPage.providers.name', 'Name')} />,
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
      enableSorting: true,
    },
    {
      accessorKey: 'kind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.providers.transportType', 'Transport')} />
      ),
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const type = row.getValue('kind');
        return (
          <Badge variant={type === 'stdio' ? 'secondary' : 'outline'}>
            {type === 'streamable_http' ? 'HTTP' : String(type).toUpperCase()}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: 'endpoint_or_command',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('mcpsPage.providers.endpointOrCommand', 'Endpoint / Command')}
        />
      ),
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const provider = row.original;
        if (provider.kind === 'stdio') {
          const configSafe = provider.config as Partial<McpProviderConfig> | undefined;
          return (
            <div className="whitespace-normal break-all sm:break-words text-muted-foreground text-sm leading-snug">
              {configSafe?.stdio_command} {(configSafe?.stdio_args ?? []).join(' ')}
            </div>
          );
        }
        return (
          <div className="whitespace-normal break-all sm:break-words text-muted-foreground text-sm leading-snug">
            {provider.base_url}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'api_keys',
      accessorFn: (row) => (row.credential as string[] | undefined)?.length ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.providers.apiKeys', 'API Keys')} />
      ),
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const count = row.getValue<number>('api_keys');
        if (count === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="font-medium text-sm">{String(count)}</span>;
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
      cell: ({ row }): React.JSX.Element => <ProvidersRowActions provider={row.original} />,
    },
  ];
}
