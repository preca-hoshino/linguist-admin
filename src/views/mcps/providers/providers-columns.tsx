import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { McpProvider, McpProviderConfig } from '@/types/mcp';
import { ProvidersRowActions } from './providers-row-actions';

export function getProvidersColumns(t: TFunction): ColumnDef<McpProvider>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(value === true);
          }}
          aria-label={t('common.selectAll', 'Select all')}
        />
      ),
      meta: { className: 'w-10 ps-4', tdClassName: 'ps-4' },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(value === true);
          }}
          aria-label={t('common.selectRow', 'Select row')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      meta: {},
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
      enableSorting: true,
    },
    {
      accessorKey: 'kind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.providers.transportType', 'Transport')} />
      ),
      meta: {},
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
      meta: {},
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
      meta: {},
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
