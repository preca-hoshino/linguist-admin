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
      cell: ({ row }): React.JSX.Element => (
        <span className="text-[11px] font-mono text-muted-foreground px-1 py-0.5">{row.original.id}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('mcpsPage.providers.name', 'Name')} />,
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
      enableSorting: true,
    },
    {
      accessorKey: 'kind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.providers.transportType', 'Transport')} />
      ),
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
      header: t('mcpsPage.providers.endpointOrCommand', 'Endpoint / Command'),
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
      header: t('mcpsPage.providers.apiKeys', 'API Keys'),
      cell: ({ row }): React.JSX.Element => {
        const keys = (row.original.credential as string[] | undefined) ?? [];
        if (keys.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="font-medium text-sm">{keys.length}</span>;
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      cell: ({ row }): React.JSX.Element => <ProvidersRowActions provider={row.original} />,
    },
  ];
}
