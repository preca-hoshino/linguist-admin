import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviders } from '@/api/model/providers';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/utils';
import { useProvidersColumns } from './providers-columns';
import { useProviders } from './providers-context';

export function ProvidersTable(): React.JSX.Element {
  const { t } = useTranslation();
  const { providers, loading, pagination, setPagination, search, setSearch, columnFilters, setColumnFilters, hasMore, total } =
    useProviders();
  const columns = useProvidersColumns();

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // 动态生成 kind 筛选选项（通过独立请求获取全量 kind 列表）
  const [kindOptions, setKindOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    listProviders({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          const kinds = [...new Set(res.data.data.map((p) => p.kind))];
          setKindOptions(kinds.map((k) => ({ label: k, value: k })));
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: providers,
    columns,
    pageCount: total > 0 ? Math.max(1, Math.ceil(total / pagination.pageSize)) : hasMore ? pagination.pageIndex + 2 : pagination.pageIndex + 1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: search,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    manualFiltering: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setSearch,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
        searchPlaceholder={t('modelsPage.providers.searchPlaceholder', 'Filter providers...')}
        filters={[
          {
            columnId: 'kind',
            title: t('modelsPage.providers.kind', 'Kind'),
            options: kindOptions,
          },
        ]}
      />
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-xl">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(header.column.columnDef.meta?.className, header.column.columnDef.meta?.thClassName)}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t('common.loading', 'Loading...')}
                  </span>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              table.getRowModel().rows.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t('modelsPage.providers.empty', 'No providers found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
    </div>
  );
}
