import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { VirtualMcp, VirtualMcpConfig } from '@/types/mcp';
import { VirtualMcpsRowActions } from './virtual-mcps-row-actions';

export function getVirtualMcpsColumns(
  t: TFunction,
  onToggleActive: (id: string, current: boolean) => void,
  providerMap: Record<string, string>,
): ColumnDef<VirtualMcp>[] {
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('mcpsPage.virtualMcps.name', 'Name')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => <div className="font-medium">{row.getValue('name')}</div>,
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.virtualMcps.description', 'Description')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => (
        <div className="whitespace-normal break-all sm:break-words text-muted-foreground text-sm leading-snug">
          {row.getValue('description')}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'mcp_provider_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.virtualMcps.backendProvider', 'Provider')} />
      ),
      meta: {},
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
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const count = row.getValue<number>('tools');
        if (count === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="font-medium text-sm">{String(count)}</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('common.status', 'Status')} />,
      meta: {},
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
      header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
      cell: ({ row }): React.JSX.Element => (
        <VirtualMcpsRowActions server={row.original} onToggleActive={onToggleActive} />
      ),
    },
  ];
}
