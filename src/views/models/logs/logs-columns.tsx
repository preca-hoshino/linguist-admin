import { ProviderCell } from '@/components/provider/ProviderCell';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { RequestLog } from '@/types';
import { LogsRowActions } from './logs-row-actions';

function formatDateTime(dateStr: string): React.JSX.Element {
  const d = new Date(dateStr);
  return (
    <div className="flex flex-col text-[11px] font-mono leading-tight text-muted-foreground">
      <span>{d.toLocaleDateString()}</span>
      <span>{d.toLocaleTimeString()}</span>
    </div>
  );
}

export function useLogsColumns(): ColumnDef<RequestLog>[] {
  const { t } = useTranslation();

  const columns: ColumnDef<RequestLog>[] = [
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
      meta: { className: 'w-[70px]' },
      cell: ({ row }) => (
        <div className="truncate font-mono text-xs text-muted-foreground" title={row.original.id}>
          {row.original.id.slice(0, 8)}
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: 'request_model',
      // 直接读热表列 request_model，不再依赖 gateway_context
      accessorFn: (row) => (row.request_model != null && row.request_model !== '' ? row.request_model : '-'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.requestModel', 'Virtual Model')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const val = row.original.request_model;
        return <span className="truncate font-mono font-bold text-xs">{val != null && val !== '' ? val : '-'}</span>;
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: 'mode',
      // 直接读热表列 is_stream
      accessorFn: (row) => (row.is_stream === true ? 'stream' : 'non-stream'),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.mode', 'Mode')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const isStream = row.original.is_stream === true;
        return (
          <Badge
            variant="outline"
            className={
              isStream
                ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                : 'text-muted-foreground'
            }
          >
            {isStream ? t('modelsPage.logs.stream', 'Stream') : t('modelsPage.logs.nonStream', 'Non-Stream')}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: 'source',
      // 直接读热表列 user_format
      accessorFn: (row) => (row.user_format != null && row.user_format !== '' ? row.user_format : '-'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.userFormat', 'Client Format')} />
      ),
      meta: { className: 'ps-1 w-32', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const fmt = row.original.user_format;
        if (fmt == null || fmt === '') {
          return <span className="text-muted-foreground">-</span>;
        }
        const FMT_LABEL: Record<string, string> = {
          openaicompat: 'OpenAI Compat',
          anthropic: 'Anthropic',
          gemini: 'Gemini',
        };
        const label = FMT_LABEL[fmt] ?? fmt;
        return <ProviderCell kind={fmt} id={fmt} name={label} size="sm" />;
      },
      enableSorting: true,
    },
    {
      id: 'ip',
      // 直接读热表列 ip
      accessorFn: (row) => (row.ip != null && row.ip !== '' ? row.ip : '-'),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.ip', 'IP')} />,
      meta: { className: 'w-24' },
      cell: ({ row }): React.JSX.Element => {
        const ip = row.original.ip;
        return (
          <span className="font-mono text-[11px] text-muted-foreground">{ip != null && ip !== '' ? ip : '-'}</span>
        );
      },
      enableSorting: false,
    },
    {
      id: 'provider_id',
      // 直接读热表列 provider_id / provider_kind
      accessorFn: (row) => (row.provider_id != null && row.provider_id !== '' ? row.provider_id : '-'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.providerKind', 'Provider')} />
      ),
      meta: { className: 'w-32' },
      cell: ({ row }): React.JSX.Element => {
        const kind = row.original.provider_kind;
        const pid = row.original.provider_id;
        if (kind == null || kind === '') {
          return <span className="text-muted-foreground">-</span>;
        }
        return <ProviderCell kind={kind} id={pid ?? ''} name={''} size="sm" />;
      },
      enableSorting: true,
    },
    {
      id: 'app_id',
      // 直接读热表列 app_name（fallback 到 app_id）
      accessorFn: (row): string => {
        if (row.app_name != null && row.app_name !== '') {
          return row.app_name;
        }
        if (row.app_id != null && row.app_id !== '') {
          return row.app_id;
        }
        return '-';
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.app', 'App')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const name = row.original.app_name ?? row.original.app_id;
        return <span className="text-[11px] font-medium">{name != null && name !== '' ? name : '-'}</span>;
      },
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.status', 'Status')} />,
      meta: { className: 'w-20' },
      cell: ({ row }): React.JSX.Element => {
        const status = row.original.status;
        let variant: 'outline' | 'destructive' | 'secondary' = 'secondary';
        if (status === 'completed') {
          variant = 'outline';
        } else if (status === 'error') {
          variant = 'destructive';
        }
        let label = t('modelsPage.logs.statusProcessing', '处理');
        if (status === 'completed') {
          label = t('modelsPage.logs.statusCompleted', '成功');
        } else if (status === 'error') {
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
      id: 'tokens',
      // 直接读热表列 total_tokens / prompt_tokens / completion_tokens
      accessorFn: (row) => row.total_tokens ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.tokens', 'Token')} />,
      meta: { className: 'w-24' },
      cell: ({ row }): React.JSX.Element => {
        const total = row.original.total_tokens;
        const p = row.original.prompt_tokens;
        const c = row.original.completion_tokens;
        if (total == null || total === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <div className="flex flex-col text-[11px] font-mono">
            <span className="font-bold text-foreground">{total}</span>
            <span className="text-muted-foreground whitespace-nowrap tracking-tighter">
              ↑{p ?? 0} | ↓{c ?? 0}
            </span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'cacheMode',
      // 直接读热表列 cached_tokens / prompt_tokens
      accessorFn: (row): number => {
        const p = row.prompt_tokens;
        const cached = row.cached_tokens;
        if (p == null || p === 0 || cached == null) {
          return 0;
        }
        return cached / p;
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.cacheRate', 'Cache')} />,
      meta: { className: 'w-16' },
      cell: ({ row }): React.JSX.Element => {
        const p = row.original.prompt_tokens ?? 0;
        const cached = row.original.cached_tokens ?? 0;
        if (p === 0 || cached === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        const rate = Math.round((cached / p) * 100);
        return <span className="font-mono text-[11px]">{rate}%</span>;
      },
      enableSorting: true,
    },
    {
      id: 'latency',
      // 直接读热表列 duration_ms / ttft_ms（is_stream 判断流式）
      accessorFn: (row) => row.duration_ms ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.latency', 'Duration')} />
      ),
      meta: { className: 'w-20' },
      cell: ({ row }): React.JSX.Element => {
        const isStream = row.original.is_stream === true;
        const ttftMs = row.original.ttft_ms;
        const duration = row.original.duration_ms;
        if (isStream && ttftMs != null) {
          return (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-muted-foreground/80 tracking-tight">TTFT</span>
              <span className="font-mono text-[11px]">{ttftMs}ms</span>
            </div>
          );
        }
        if (duration != null) {
          return (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-muted-foreground/80 tracking-tight">E2E</span>
              <span className="font-mono text-[11px]">{duration}ms</span>
            </div>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.createdAt', 'Time')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => formatDateTime(String(row.getValue('created_at') ?? '')),
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => <LogsRowActions row={row} />,
    },
  ];

  return columns;
}
