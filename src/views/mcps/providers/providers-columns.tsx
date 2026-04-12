import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import type { McpProvider } from '@/types/mcp';
import { ProvidersRowActions } from './providers-row-actions';

export function getProvidersColumns(onToggleActive: (id: string, current: boolean) => void): ColumnDef<McpProvider>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'transport_type',
      header: 'Transport',
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
      header: 'Endpoint / Command',
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
      header: 'API Keys',
      cell: ({ row }): React.JSX.Element => {
        const keys = row.original.api_keys;
        if (keys.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <Badge variant="outline">{keys.length} Keys</Badge>;
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }): React.JSX.Element => {
        const isActive = row.original.is_active;
        const id = row.original.id;
        return (
          <Switch
            checked={isActive}
            onCheckedChange={() => {
              onToggleActive(id, isActive);
            }}
          />
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }): React.JSX.Element => <ProvidersRowActions provider={row.original} />,
    },
  ];
}
