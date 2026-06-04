import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Box, Database } from 'lucide-react';
import { AppCell } from '@/components/app/AppCell';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { McpLog } from '@/types/mcp';
import { formatLatency } from '@/utils/format-number';
import { McpLogsRowActions } from './mcp-logs-row-actions';

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
      meta: {},
      cell: ({ row }) => (
        <Link
          to={`/mcps/logs/$id`}
          params={{ id: row.original.id }}
          className="truncate font-mono text-xs text-primary hover:underline"
          title={row.original.id}
        >
          {row.original.id.slice(0, 8)}
        </Link>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'virtual_mcp_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.logs.virtualMcp', 'Virtual MCP')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const val = row.original.virtual_mcp_id;
        const name = virtualMcpOptions.find((o) => o.value === val)?.label;
        const displayVal = name ?? (val != null && val !== '' ? val.slice(0, 8) : '-');
        if (displayVal === '-') {
          return <span className="text-muted-foreground">-</span>;
        }
        return <AppCell name={displayVal} size="sm" icon={Box} />;
      },
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'mcp_provider_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('mcpsPage.logs.providerMcp', 'Provider MCP')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const val = row.original.mcp_provider_id;
        const name = providerOptions.find((o) => o.value === val)?.label;
        const displayVal = name ?? (val != null && val !== '' ? val.slice(0, 8) : '-');
        if (displayVal === '-') {
          return <span className="text-muted-foreground">-</span>;
        }
        return <AppCell name={displayVal} size="sm" icon={Database} />;
      },
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'method',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('mcpsPage.logs.method', 'Method')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const method = String(row.getValue('method'));
        return (
          <div className="font-mono font-bold text-xs max-w-[200px] truncate" title={method}>
            {method}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'status',
      // 冷热分离后改读热表 status 字段（替代旧的 error JSONB 判断逻辑）
      accessorFn: (row) => row.status,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.status', 'Status')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const status = row.original.status;
        const isError = status === 'error';
        let variant: 'outline' | 'destructive' | 'secondary' = 'secondary';
        let label = t('modelsPage.logs.statusProcessing', '处理');

        if (status === 'completed') {
          variant = 'outline';
          label = t('modelsPage.logs.statusCompleted', '成功');
        } else if (isError) {
          variant = 'destructive';
          label = t('modelsPage.logs.statusError', '失败');
        }

        return (
          <Badge
            variant={variant}
            className={
              status === 'completed'
                ? 'border-green-300 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-900/20'
                : ''
            }
          >
            {label}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'tool_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('mcpsPage.logs.toolName', 'Tool')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const toolName = row.original.tool_name;
        if (toolName == null || toolName === '') {
          return <span className="text-muted-foreground text-xs">-</span>;
        }
        return (
          <div className="font-mono text-xs max-w-[250px] truncate" title={toolName}>
            {toolName}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'duration_ms',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.latency', 'Duration')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const d = row.original.duration_ms;
        if (d == null) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-muted-foreground/80 tracking-tight">E2E</span>
            <span className="font-mono text-[11px]">{formatLatency(d)}</span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.createdAt', 'Time')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => formatDateTime(String(row.getValue('created_at') ?? '')),
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }): React.JSX.Element => <McpLogsRowActions log={row.original} />,
    },
  ];
}
