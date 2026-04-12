import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { McpVirtualServer } from '@/types/mcp';
import { VirtualMcpsRowActions } from './virtual-mcps-row-actions';
import type { TFunction } from 'i18next';

export function getVirtualMcpsColumns(
  t: TFunction,
  onToggleActive: (id: string, current: boolean) => void,
  providerMap: Record<string, string>,
): ColumnDef<McpVirtualServer>[] {
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
      header: t('mcpsPage.virtualMcps.name', 'Name'),
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: t('mcpsPage.virtualMcps.description', 'Description'),
      cell: ({ row }): React.JSX.Element => (
        <div className="max-w-[200px] truncate text-muted-foreground">{row.getValue('description')}</div>
      ),
    },
    {
      accessorKey: 'mcp_provider_id',
      header: t('mcpsPage.virtualMcps.backendProvider', 'Provider'),
      cell: ({ row }): React.JSX.Element => {
        const id = String(row.getValue('mcp_provider_id'));
        return (
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded" title={id}>
            {providerMap[id] ?? id}
          </code>
        );
      },
    },
    {
      id: 'tools',
      header: t('mcpsPage.virtualMcps.tools', 'Tools Count'),
      cell: ({ row }): React.JSX.Element => {
        const list = row.original.tools;
        if (list.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <Badge variant="outline">
            {t('mcpsPage.virtualMcps.toolsSelected', '{{count}} Selected', { count: list.length })}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: t('common.status', 'Status'),
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
