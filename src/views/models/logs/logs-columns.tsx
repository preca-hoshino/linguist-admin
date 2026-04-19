import { ProviderCell } from '@/components/ProviderCell';
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
      accessorFn: (row) =>
        row.gateway_context?.requestModel != null && row.gateway_context.requestModel !== ''
          ? row.gateway_context.requestModel
          : '-',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.requestModel', 'Virtual Model')} />
      ),
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const val = row.original.gateway_context?.requestModel;
        return <span className="truncate font-mono font-bold text-xs">{val != null && val !== '' ? val : '-'}</span>;
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: 'mode',
      accessorFn: (row) => (row.gateway_context?.stream === true ? 'stream' : 'non-stream'),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.mode', 'Mode')} />,
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const isStream = row.original.gateway_context?.stream === true;
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
      accessorFn: (row) =>
        row.gateway_context?.userFormat != null && row.gateway_context.userFormat !== ''
          ? row.gateway_context.userFormat
          : '-',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.userFormat', 'Client Format')} />
      ),
      meta: { className: 'ps-1 w-32', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const fmt = row.original.gateway_context?.userFormat;
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
      accessorKey: 'ip',
      accessorFn: (row) =>
        row.gateway_context?.ip != null && row.gateway_context.ip !== '' ? row.gateway_context.ip : '-',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.ip', 'IP')} />,
      meta: { className: 'ps-1 w-24', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const ip = row.original.gateway_context?.ip;
        return (
          <span className="font-mono text-[11px] text-muted-foreground">{ip != null && ip !== '' ? ip : '-'}</span>
        );
      },
      enableSorting: false,
    },
    {
      id: 'provider_id',
      accessorFn: (row) =>
        row.gateway_context?.route?.providerId != null && row.gateway_context.route.providerId !== ''
          ? row.gateway_context.route.providerId
          : '-',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.providerKind', 'Provider')} />
      ),
      meta: { className: 'ps-1 w-32', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const route = row.original.gateway_context?.route;
        if (route?.providerKind == null || route.providerKind === '') {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <ProviderCell kind={route.providerKind} id={route.providerId} name={route.providerName ?? ''} size="sm" />
        );
      },
      enableSorting: true,
    },
    {
      id: 'app_id',
      accessorFn: (row): string => {
        const ctx = row.gateway_context as NonNullable<RequestLog['gateway_context']> & { appName?: string };
        if (ctx.appName != null && ctx.appName !== '') {
          return ctx.appName;
        }
        if (ctx.apiKeyName != null && ctx.apiKeyName !== '') {
          return ctx.apiKeyName;
        }
        return '-';
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.app', 'App')} />,
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const ctx = row.original.gateway_context as NonNullable<RequestLog['gateway_context']> & { appName?: string };
        const name = ctx.appName ?? ctx.apiKeyName;
        return <span className="text-[11px] font-medium">{name != null && name !== '' ? name : '-'}</span>;
      },
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.status', 'Status')} />,
      meta: { className: 'ps-1 w-20', tdClassName: 'ps-4' },
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
      accessorFn: (row) => row.gateway_context?.response?.usage?.total_tokens ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.tokens', 'Token')} />,
      meta: { className: 'ps-1 w-24', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const usage = row.original.gateway_context?.response?.usage;
        if (usage == null || usage.total_tokens === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        const total = usage.total_tokens;
        const p = usage.prompt_tokens;
        const c = usage.completion_tokens;
        return (
          <div className="flex flex-col text-[11px] font-mono">
            <span className="font-bold text-foreground">{total}</span>
            <span className="text-muted-foreground whitespace-nowrap tracking-tighter">
              ↑{p} | ↓{c}
            </span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'cacheMode',
      accessorFn: (row): number => {
        const usage = row.gateway_context?.response?.usage;
        if (usage == null || usage.prompt_tokens === 0) {
          return 0;
        }
        return (usage.cached_tokens ?? 0) / usage.prompt_tokens;
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('modelsPage.logs.cacheRate', 'Cache')} />,
      meta: { className: 'ps-1 w-16', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const usage = row.original.gateway_context?.response?.usage;
        const p = usage?.prompt_tokens ?? 0;
        const cached = usage?.cached_tokens ?? 0;
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
      accessorFn: (row) => row.duration_ms ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('modelsPage.logs.latency', 'Duration')} />
      ),
      meta: { className: 'ps-1 w-20', tdClassName: 'ps-4' },
      cell: ({ row }): React.JSX.Element => {
        const isStream = row.original.gateway_context?.stream === true;
        const ttft = row.original.gateway_context?.timing.ttft;
        const start = row.original.gateway_context?.timing.start;
        const duration = row.original.duration_ms;
        if (isStream && ttft != null && start != null) {
          const ttftMs = Math.round(ttft - start);
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
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
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
