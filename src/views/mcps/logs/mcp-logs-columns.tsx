import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { McpLog } from '@/types/mcp';
import { McpLogsRowActions } from './mcp-logs-row-actions';
import { DataTableColumnHeader } from '@/components/data-table';
import type { TFunction } from 'i18next';

function formatDateTime(dateStr: string): React.JSX.Element {
  const d = new Date(dateStr);
  return (
    <div className="flex flex-col text-[11px] font-mono leading-tight text-muted-foreground">
      <span>{d.toLocaleDateString()}</span>
      <span>{d.toLocaleTimeString()}</span>
    </div>
  );
}

export function getMcpLogsColumns(
  t: TFunction,
  virtualMcpOptions: { label: string; value: string }[],
  providerOptions: { label: string; value: string }[],
): ColumnDef<McpLog>[] {
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.id', 'ID')} />,
      meta: { className: 'ps-4' },
      cell: ({ row }) => (
        <Link
          to={`/mcps/logs/$id`}
          params={{ id: row.original.id }}
          className="w-[70px] truncate font-mono text-xs text-primary hover:underline"
          title={row.original.id}
        >
          {row.original.id.slice(0, 8)}
        </Link>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'virtual_mcp_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.logs.virtualMcp', 'Virtual MCP')} />
      ),
      meta: { className: 'ps-4 w-40' },
      cell: ({ row }): React.JSX.Element => {
        const val = row.original.virtual_mcp_id;
        const name = virtualMcpOptions.find((o) => o.value === val)?.label;
        const displayVal = name ?? (val != null && val !== '' ? val.slice(0, 8) : '-');
        return (
          <div className="w-[140px] truncate text-xs text-muted-foreground" title={name ?? val ?? ''}>
            {displayVal}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'mcp_provider_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.logs.providerMcp', 'Provider MCP')} />
      ),
      meta: { className: 'ps-4 w-40' },
      cell: ({ row }): React.JSX.Element => {
        const val = row.original.mcp_provider_id;
        const name = providerOptions.find((o) => o.value === val)?.label;
        const displayVal = name ?? (val != null && val !== '' ? val.slice(0, 8) : '-');
        return (
          <div className="w-[140px] truncate text-xs text-muted-foreground" title={name ?? val ?? ''}>
            {displayVal}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'method',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('mcpsPage.logs.method', 'Method')} />,
      meta: { className: 'ps-4 w-[160px]' },
      cell: ({ row }): React.JSX.Element => {
        const method = String(row.getValue('method'));
        return (
          <div className="w-[140px] truncate font-mono font-bold text-xs" title={method}>
            {method}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'error',
      accessorFn: (row) => row.error,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.status', 'Status')} />,
      meta: { className: 'ps-4 w-20' },
      cell: ({ row }): React.JSX.Element => {
        const err = row.original.error;
        let variant: 'outline' | 'destructive' = 'outline';
        let label = t('modelsPage.logs.statusCompleted', '成功');

        if (err != null) {
          variant = 'destructive';
          label = t('modelsPage.logs.statusError', '失败');
        }

        return (
          <Badge
            variant={variant}
            className={
              err == null
                ? 'border-green-300 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-900/20'
                : ''
            }
          >
            {label}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'duration_ms',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.latency', 'Duration')} />
      ),
      meta: { className: 'ps-4 w-20' },
      cell: ({ row }): React.JSX.Element => (
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] text-muted-foreground/80 tracking-tight">E2E</span>
          <span className="font-mono text-[11px]">{row.getValue('duration_ms')}ms</span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.createdAt', 'Time')} />,
      meta: { className: 'ps-4' },
      cell: ({ row }): React.JSX.Element => formatDateTime(String(row.getValue('created_at') ?? '')),
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }): React.JSX.Element => <McpLogsRowActions log={row.original} />,
    },
  ];
}
