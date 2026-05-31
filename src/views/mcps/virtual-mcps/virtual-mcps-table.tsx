import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listMcpProviders } from '@/api/mcp/provider-mcps';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { DataTableBulkActions } from '@/components/data-table/BulkActions';
import { Button } from '@/components/ui/Button';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { getVirtualMcpsColumns } from './virtual-mcps-columns';
import { useVirtualMcps } from './virtual-mcps-context';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';

export function VirtualMcpsTable(): React.JSX.Element {
  const {
    servers,
    isLoading,
    hasMore,
    total,
    updateServer,
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    setDialogState,
  } = useVirtualMcps();
  const { t } = useTranslation();

  const [providerMap, setProviderMap] = useState<Record<string, string>>({});
  const [providerOptions, setProviderOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    void listMcpProviders({ limit: 100 }).then((res) => {
      if (res.ok) {
        const map: Record<string, string> = {};
        const options: { label: string; value: string }[] = [];
        for (const p of res.data.data) {
          map[p.id] = p.name;
          options.push({ label: p.name || p.id, value: p.id });
        }
        setProviderMap(map);
        setProviderOptions(options);
      }
    });
  }, []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const onToggleActive = async (id: string, current: boolean): Promise<void> => {
    const success = await updateServer(id, { is_active: !current });
    if (success) {
      toast.success(
        current
          ? t('mcpsPage.virtualMcps.disabledSuccess', 'Virtual MCP disabled')
          : t('mcpsPage.virtualMcps.enabledSuccess', 'Virtual MCP enabled'),
      );
    }
  };

  const columns = getVirtualMcpsColumns(t, onToggleActive, providerMap);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: servers,
    columns,
    pageCount:
      total > 0
        ? Math.max(1, Math.ceil(total / pagination.pageSize))
        : hasMore
          ? pagination.pageIndex + 2
          : pagination.pageIndex + 1,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
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
        searchPlaceholder={t('mcpsPage.virtualMcps.searchPlaceholder', 'Search virtual servers...')}
        filters={[
          {
            columnId: 'mcp_provider_id',
            title: t('mcpsPage.virtualMcps.backendProvider', 'Provider'),
            options: providerOptions,
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
              if (isLoading && servers.length === 0) {
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
                    {t('mcpsPage.virtualMcps.noData', 'No virtual MCP servers found.')}
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />

      <DataTableBulkActions table={table} entityName={t('mcpsPage.virtualMcps.entityName', 'server')}>
        <PermissionGuard module="mcp" level="edit">
          <Button
            variant="destructive"
            size="sm"
            className="flex h-6 items-center gap-1.5 px-3 rounded-lg"
            onClick={() => {
              const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
              setDialogState((p) => ({ ...p, batchSelectedIds: ids, batchDeleteOpen: true }));
            }}
          >
            <Trash2 size={14} className="mr-1" />
            {t('common.delete', 'Delete')}
          </Button>
        </PermissionGuard>
      </DataTableBulkActions>
    </div>
  );
}
