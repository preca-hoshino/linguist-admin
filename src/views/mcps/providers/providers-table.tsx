import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { getProvidersColumns } from './providers-columns';
import { useProviders } from './providers-context';
import { cn } from '@/utils/utils';

export function ProvidersTable(): React.JSX.Element {
  const {
    providers,
    isLoading,
    hasMore,
    total,
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
  } = useProviders();
  const { t } = useTranslation();

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = getProvidersColumns(t);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: providers,
    columns,
    pageCount: total > 0 ? Math.max(1, Math.ceil(total / pagination.pageSize)) : hasMore ? pagination.pageIndex + 2 : pagination.pageIndex + 1,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: false,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
        searchPlaceholder={t('mcpsPage.providers.searchPlaceholder', 'Search providers...')}
        filters={[
          {
            columnId: 'kind',
            title: t('mcpsPage.providers.transportType', 'Transport'),
            options: [
              { label: 'HTTP', value: 'streamable_http' },
              { label: 'STDIO', value: 'stdio' },
            ],
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
              if (isLoading && providers.length === 0) {
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
                    {t('mcpsPage.providers.noData', 'No MCP providers found.')}
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
    </div>
  );
}
