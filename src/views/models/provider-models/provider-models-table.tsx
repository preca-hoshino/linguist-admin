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
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviderModels } from '@/api/model/provider-models';
import { listProviders } from '@/api/model/providers';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { DataTableBulkActions } from '@/components/data-table/BulkActions';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/utils';
import { useProviderModelsColumns } from './provider-models-columns';
import { useProviderModels } from './provider-models-context';

export function ProviderModelsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    providerModels,
    loading,
    pagination,
    setPagination,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
    hasMore,
    total,
    setOpen,
    setSelectedIds,
  } = useProviderModels();
  const columns = useProviderModelsColumns();

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    rpm: false,
    tpm: false,
    latency: false,
    error_rate: false,
    created_at: false,
  });

  // 动态生成筛选选项（通过独立请求获取全量列表）
  const [modelTypeOptions, setModelTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [providerOptions, setProviderOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    // 拉取所有 provider 供过滤使用
    listProviders({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          setProviderOptions(res.data.data.map((p) => ({ label: p.name, value: p.id })));
        }
      })
      .catch(() => {
        // ignore
      });

    // 拉取一些模型以推断 model_type，或者可以硬编码。这里按现有数据推断
    listProviderModels({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          const types = [...new Set(res.data.data.map((m) => m.model_type))];
          setModelTypeOptions(types.map((k) => ({ label: k, value: k })));
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: providerModels,
    columns,
    pageCount:
      total > 0
        ? Math.max(1, Math.ceil(total / pagination.pageSize))
        : hasMore
          ? pagination.pageIndex + 2
          : pagination.pageIndex + 1,
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
            {t('modelsPage.providerModels.empty', 'No provider models found')}
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
        searchPlaceholder={t('modelsPage.providerModels.searchPlaceholder', 'Filter provider models...')}
        filters={[
          {
            columnId: 'model_type',
            title: t('modelsPage.providerModels.type', 'Type'),
            options: modelTypeOptions,
          },
          {
            columnId: 'provider_id',
            title: t('modelsPage.providerModels.provider', 'Provider'),
            options: providerOptions,
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

      <DataTableBulkActions table={table} entityName={t('modelsPage.providerModels.entityName', 'model')}>
        <Button
          variant="destructive"
          size="sm"
          className="flex h-6 items-center gap-1.5 px-3 rounded-lg"
          onClick={() => {
            const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
            setSelectedIds(ids);
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
