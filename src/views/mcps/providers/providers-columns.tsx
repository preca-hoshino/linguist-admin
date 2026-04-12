import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { McpProvider } from '@/types/mcp';
import { ProvidersRowActions } from './providers-row-actions';
import type { TFunction } from 'i18next';

export function getProvidersColumns(t: TFunction): ColumnDef<McpProvider>[] {
  return [
    {
      accessorKey: 'id',
      header: t('common.id', 'ID'),
      cell: ({ row }): React.JSX.Element => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{row.getValue('id')}</code>
      ),
    },
    {
      accessorKey: 'name',
      header: t('mcpsPage.providers.name', 'Name'),
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'transport_type',
      header: t('mcpsPage.providers.transportType', 'Transport'),
      cell: ({ row }): React.JSX.Element => {
        const type = row.getValue('transport_type');
        return (
          <Badge variant={type === 'stdio' ? 'secondary' : 'outline'}>
            {type === 'streamable_http' ? 'HTTP' : String(type).toUpperCase()}
          </Badge>
        );
      },
    },
    {
      id: 'endpoint_or_command',
      header: t('mcpsPage.providers.endpointOrCommand', 'Endpoint / Command'),
      cell: ({ row }): React.JSX.Element => {
        const provider = row.original;
        if (provider.transport_type === 'stdio') {
          return (
            <div className="max-w-[200px] truncate text-muted-foreground" title={provider.stdio_command}>
              {provider.stdio_command} {provider.stdio_args.join(' ')}
            </div>
          );
        }
        return (
          <div className="max-w-[200px] truncate text-muted-foreground" title={provider.endpoint_url}>
            {provider.endpoint_url}
          </div>
        );
      },
    },
    {
      id: 'api_keys',
      header: t('mcpsPage.providers.apiKeys', 'API Keys'),
      cell: ({ row }): React.JSX.Element => {
        const keys = row.original.api_keys;
        if (keys.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <Badge variant="outline">{keys.length} Keys</Badge>;
      },
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      cell: ({ row }): React.JSX.Element => <ProvidersRowActions provider={row.original} />,
    },
  ];
}
