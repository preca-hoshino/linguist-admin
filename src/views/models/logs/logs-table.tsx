import { Anthropic, Gemini, OpenAI } from '@lobehub/icons';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listApps } from '@/api/apps';
import { listProviders } from '@/api/model/providers';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { DataTableBulkActions } from '@/components/data-table/BulkActions';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/utils';
import { useLogsColumns } from './logs-columns';
import { useLogs } from './logs-context';

// icon 适配器：将 lobehub 图标包装成 ComponentType<{ className?: string }>
const AnthropicIcon = ({ className }: { className?: string }): React.JSX.Element => (
  <Anthropic size={14} className={className} />
);
const OpenAIIcon = ({ className }: { className?: string }): React.JSX.Element => (
  <OpenAI size={14} className={className} />
);
const GeminiIcon = ({ className }: { className?: string }): React.JSX.Element => (
  <Gemini size={14} className={className} />
);

export function LogsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    logs,
    loading,
    hasMore,
    total,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    setOpen,
    setSelectedIds,
  } = useLogs();
  const [providerOptions, setProviderOptions] = useState<{ label: string; value: string }[]>([]);
  const [appOptions, setAppOptions] = useState<{ label: string; value: string }[]>([]);

  const columns = useLogsColumns(providerOptions, appOptions);

  useEffect(() => {
    // 异步拉取全部已有 providers 以作为过滤选项（直接以具体实例的 id 作为筛选值）
    listProviders({ limit: 100 })
      .then((res) => {
        if (res.ok) {
          const options = res.data.data.map((p) => ({
            label: p.name || p.kind,
            value: p.id,
          }));
          setProviderOptions(options);
        }
      })
      .catch(() => {
        // block catch
      });

    // 异步拉取全部 App，以生成选项
    listApps({ limit: 100 })
      .then((res) => {
        if (res.ok) {
          const options = res.data.data.map((a) => ({
            label: a.name,
            value: a.id, // now request logs store app_id soon, currently filtering might use key or id, but backend supports it
          }));
          setAppOptions(options);
        }
      })
      .catch(() => {
        // block catch
      });
  }, []);

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    is_stream: false,
    total_tokens: false,
    calculated_cost: false,
    ip: false,
  });

  let computedPageCount: number;
  if (total > 0) {
    computedPageCount = Math.max(1, Math.ceil(total / pagination.pageSize));
  } else if (hasMore) {
    computedPageCount = pagination.pageIndex + 2;
  } else {
    computedPageCount = pagination.pageIndex + 1;
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: logs,
    columns,
    pageCount: computedPageCount,
    state: {
      pagination,
      columnVisibility,
      rowSelection,
      sorting,
      globalFilter,
      columnFilters,
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: false,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // 保证页码不越界
  const pageCount = table.getPageCount();
  useEffect(() => {
    const currentPage = table.getState().pagination.pageIndex;
    if (pageCount > 0 && currentPage >= pageCount) {
      table.setPageIndex(pageCount - 1);
    }
  }, [pageCount, table]);

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder={t('modelsPage.logs.searchPlaceholder', 'Search request models...')}
        filters={[
          {
            columnId: 'status',
            title: t('modelsPage.logs.status', 'Status'),
            options: [
              { label: t('modelsPage.logs.statusCompleted', '成功'), value: 'completed' },
              { label: t('modelsPage.logs.statusError', '失败'), value: 'error' },
              { label: t('modelsPage.logs.statusProcessing', '处理'), value: 'processing' },
            ],
          },
          {
            columnId: 'provider_id',
            title: t('modelsPage.logs.providerKind', 'Provider'),
            options: providerOptions,
          },
          {
            columnId: 'mode',
            title: t('modelsPage.logs.mode', 'Mode'),
            options: [
              { label: t('modelsPage.logs.stream', 'Stream'), value: 'stream' },
              { label: t('modelsPage.logs.nonStream', 'Non-Stream'), value: 'non-stream' },
            ],
          },
          {
            columnId: 'source',
            title: t('modelsPage.logs.userFormat', 'API Format'),
            options: [
              { label: 'Anthropic', value: 'anthropic', icon: AnthropicIcon },
              { label: 'OpenAI Compat', value: 'openaicompat', icon: OpenAIIcon },
              { label: 'Gemini', value: 'gemini', icon: GeminiIcon },
            ],
          },
          {
            columnId: 'app_id', // Note: backend filter needs to match this or we change it if needed
            title: t('modelsPage.logs.app', 'App'),
            options: appOptions,
          },
        ]}
      />
      <div className="overflow-x-auto rounded-md border text-sm">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      (header.column.columnDef.meta as Record<string, unknown> | undefined)?.className as
                        | string
                        | undefined,
                      (header.column.columnDef.meta as Record<string, unknown> | undefined)?.thClassName as
                        | string
                        | undefined,
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {((): React.JSX.Element => {
              if (loading && logs.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t('common.loading', 'Loading...')}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              }
              if (table.getRowModel().rows.length > 0) {
                return (
                  <>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              (cell.column.columnDef.meta as Record<string, unknown> | undefined)?.className as
                                | string
                                | undefined,
                              (cell.column.columnDef.meta as Record<string, unknown> | undefined)?.tdClassName as
                                | string
                                | undefined,
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                );
              }
              return (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    {t('modelsPage.logs.empty', 'No logs found')}
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
      <DataTableBulkActions table={table} entityName={t('modelsPage.logs.logName', 'log')}>
        <Button
          variant="destructive"
          size="sm"
          className="flex h-6 items-center gap-1.5 px-3 rounded-lg"
          onClick={() => {
            const selectedLogIds = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
            setSelectedIds(selectedLogIds);
            setOpen('batch-delete');
          }}
        >
          <Trash2 size={14} className="mr-1" />
          {t('common.delete', 'Delete')}
        </Button>
      </DataTableBulkActions>
    </div>
  );
}
