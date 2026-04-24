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
import { listVirtualModels } from '@/api/model/virtual-models';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/utils';
import { useVirtualModelsColumns } from './virtual-models-columns';
import { useVirtualModels } from './virtual-models-context';

export function VirtualModelsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    virtualModels,
    loading,
    pagination,
    setPagination,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
    hasMore,
  } = useVirtualModels();
  const columns = useVirtualModelsColumns();

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    rpm: false,
    tpm: false,
    latency: false,
    error_rate: false,
    created_at: false,
  });

  // 动态生成筛选选项（通过独立请求获取全量列表以免被 pagination 限制）
  const [modelTypeOptions, setModelTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [strategyOptions, setStrategyOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    listVirtualModels({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          const types = [...new Set(res.data.data.map((vm) => vm.model_type))];
          setModelTypeOptions(types.map((k) => ({ label: k, value: k })));
          const strategies = [...new Set(res.data.data.map((vm) => vm.routing_strategy))];
          setStrategyOptions(strategies.map((k) => ({ label: k, value: k })));
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: virtualModels,
    columns,
    pageCount: hasMore ? pagination.pageIndex + 2 : pagination.pageIndex + 1,
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

  const renderTableBody = (): React.JSX.Element => {
    if (loading) {
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

    if (table.getRowModel().rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
            {t('modelsPage.virtualModels.empty', 'No virtual models found')}
          </TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {table.getRowModel().rows.map((row) => (
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
      </>
    );
  };

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder={t('modelsPage.virtualModels.searchPlaceholder', 'Filter virtual models...')}
        filters={[
          {
            columnId: 'model_type',
            title: t('modelsPage.virtualModels.type', 'Type'),
            options: modelTypeOptions,
          },
          {
            columnId: 'routing_strategy',
            title: t('modelsPage.virtualModels.routingStrategy', 'Routing Strategy'),
            options: strategyOptions,
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
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
    </div>
  );
}
