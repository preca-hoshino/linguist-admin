import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import type { McpVirtualServer } from '@/types/mcp';
import { VirtualMcpsRowActions } from './virtual-mcps-row-actions';

export function getVirtualMcpsColumns(
  onToggleActive: (id: string, current: boolean) => void,
): ColumnDef<McpVirtualServer>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }): React.JSX.Element => (
        <div className="max-w-[200px] truncate text-muted-foreground">{row.getValue('description')}</div>
      ),
    },
    {
      accessorKey: 'mcp_provider_id',
      header: 'Provider',
      cell: ({ row }): React.JSX.Element => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.getValue('mcp_provider_id')}</code>
      ),
    },
    {
      id: 'tools',
      header: 'Tools',
      cell: ({ row }): React.JSX.Element => {
        const list = row.original.tools;
        if (list.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <Badge variant="outline">{list.length} Enabled</Badge>;
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
      cell: ({ row }): React.JSX.Element => <VirtualMcpsRowActions server={row.original} />,
    },
  ];
}
