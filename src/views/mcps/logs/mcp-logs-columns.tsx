import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { McpLog } from '@/types/mcp';
import { McpLogsRowActions } from './mcp-logs-row-actions';

export function getMcpLogsColumns(): ColumnDef<McpLog>[] {
  return [
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }): React.JSX.Element => (
        <code className="text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">{row.getValue('method')}</code>
      ),
    },
    {
      accessorKey: 'direction',
      header: 'Direction',
      cell: ({ row }): React.JSX.Element => {
        const dir = row.getValue('direction');
        return (
          <Badge variant={dir === 'inbound' ? 'default' : 'secondary'}>{dir === 'inbound' ? '↓ IN' : '↑ OUT'}</Badge>
        );
      },
    },
    {
      accessorKey: 'session_id',
      header: 'Session',
      cell: ({ row }): React.JSX.Element => (
        <code className="text-xs text-muted-foreground max-w-[120px] truncate block">
          {String(row.getValue('session_id')).slice(0, 8)}...
        </code>
      ),
    },
    {
      accessorKey: 'duration_ms',
      header: 'Duration',
      cell: ({ row }): React.JSX.Element => (
        <span className="text-sm tabular-nums">{row.getValue('duration_ms')}ms</span>
      ),
    },
    {
      id: 'error',
      header: 'Status',
      cell: ({ row }): React.JSX.Element => {
        const err = row.original.error;
        if (err != null) {
          return <Badge variant="destructive">Error</Badge>;
        }
        return <Badge variant="outline">OK</Badge>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Time',
      cell: ({ row }): React.JSX.Element => {
        const date = new Date(row.getValue('created_at'));
        return <span className="text-sm text-muted-foreground">{date.toLocaleString()}</span>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }): React.JSX.Element => <McpLogsRowActions log={row.original} />,
    },
  ];
}
