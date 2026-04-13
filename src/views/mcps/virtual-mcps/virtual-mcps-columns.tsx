import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { VirtualMcp, VirtualMcpConfig } from '@/types/mcp';
import { VirtualMcpsRowActions } from './virtual-mcps-row-actions';
import { DataTableColumnHeader } from '@/components/data-table';
import type { TFunction } from 'i18next';

export function getVirtualMcpsColumns(
  t: TFunction,
  onToggleActive: (id: string, current: boolean) => void,
  providerMap: Record<string, string>,
): ColumnDef<VirtualMcp>[] {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('common.id', 'ID')} />,
      cell: ({ row }): React.JSX.Element => (
        <code className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          {row.getValue('id')}
        </code>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('mcpsPage.virtualMcps.name', 'Name')} />,
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.virtualMcps.description', 'Description')} />
      ),
      cell: ({ row }): React.JSX.Element => (
        <div className="max-w-[200px] truncate text-muted-foreground">{row.getValue('description')}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'mcp_provider_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.virtualMcps.backendProvider', 'Provider')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const id = String(row.getValue('mcp_provider_id'));
        return (
          <Badge variant="secondary" className="font-mono text-xs" title={id}>
            {providerMap[id] ?? id}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      id: 'tools',
      accessorFn: (row) => (row.config as VirtualMcpConfig | undefined)?.tools?.length ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.virtualMcps.tools', 'Tools Count')} />
      ),
      cell: ({ row }): React.JSX.Element => {
        const list = (row.original.config as VirtualMcpConfig | undefined)?.tools ?? [];
        if (list.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <Badge variant="outline">
            {t('mcpsPage.virtualMcps.toolsSelected', '{{count}} Selected', { count: list.length })}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('common.status', 'Status')} />,
      cell: ({ row }): React.JSX.Element => {
        const isActive = row.original.is_active;
        if (isActive) {
          return (
            <Badge variant="default" className="bg-green-600/90 hover:bg-green-600/90">
              {t('common.enabled', 'Active')}
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="opacity-50">
            {t('common.disabled', 'Disabled')}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      cell: ({ row }): React.JSX.Element => (
        <VirtualMcpsRowActions server={row.original} onToggleActive={onToggleActive} />
      ),
    },
  ];
}
