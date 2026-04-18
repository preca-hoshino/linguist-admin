import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listMcpProviders } from '@/api/mcp-providers';
import { listVirtualMcps } from '@/api/mcp-virtual-servers';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { DataTableBulkActions } from '@/components/data-table/BulkActions';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { getMcpLogsColumns } from './mcp-logs-columns';
import { useMcpLogs } from './mcp-logs-context';
import { cn } from '@/utils/utils';

export function McpLogsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    logs,
    loading,
    hasMore,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    setOpen,
    setSelectedIds,
  } = useMcpLogs();

  const [providerOptions, setProviderOptions] = useState<{ label: string; value: string }[]>([]);
  const [virtualMcpOptions, setVirtualMcpOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    listMcpProviders({ limit: 100 })
      .then((res) => {
        if (res.ok) {
          setProviderOptions(res.data.data.map((p) => ({ label: p.name || p.id, value: p.id })));
        }
      })
      .catch((_error: unknown) => {
        // ignore errors
      });

    listVirtualMcps({ limit: 100 })
      .then((res) => {
        if (res.ok) {
          setVirtualMcpOptions(res.data.data.map((v) => ({ label: v.name || v.id, value: v.id })));
        }
      })
      .catch((_error: unknown) => {
        // ignore errors
      });
  }, []);

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo(
    () => getMcpLogsColumns(t, virtualMcpOptions, providerOptions),
    [t, virtualMcpOptions, providerOptions],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: logs,
    columns,
    pageCount: hasMore ? pagination.pageIndex + 2 : pagination.pageIndex + 1,
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
        searchPlaceholder={t('mcpsPage.logs.searchPlaceholder', 'Search methods...')}
        filters={[
          {
            columnId: 'mcp_provider_id',
            title: t('mcpsPage.logs.providerMcp', 'Provider MCP'),
            options: providerOptions,
          },
          {
            columnId: 'virtual_mcp_id',
            title: t('mcpsPage.logs.virtualMcp', 'Virtual MCP'),
            options: virtualMcpOptions,
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
                    {t('mcpsPage.logs.empty', 'No logs found')}
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
      <DataTableBulkActions table={table} entityName={t('mcpsPage.logs.logName', 'log')}>
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
