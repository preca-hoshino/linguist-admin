import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { DataTableBulkActions } from '@/components/data-table/BulkActions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { CrudDataContext, CrudDialogState } from '@/composables/create-crud-context';
import { cn } from '@/utils/utils';

// ── 过滤器配置 ──────────────────────────────────────────────────────────────

export interface CrudFilterOption {
  readonly label: string;
  readonly value: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
}

export interface CrudFilterConfig {
  readonly columnId: string;
  readonly title: string;
  readonly options: CrudFilterOption[];
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface CrudTableProps<T, D extends string> {
  /** Context 提供的数据状态 */
  readonly dataState: CrudDataContext<T>;
  /** Context 提供的对话框状态 */
  readonly dialogState: CrudDialogState<D>;
  /** TanStack Table 列定义 */
  readonly columns: ColumnDef<T>[];
  /** 搜索框占位文本 */
  readonly searchPlaceholder: string;
  /** 过滤器配置 */
  readonly filters?: CrudFilterConfig[];
  /** 批量操作的权限模块名 */
  readonly permissionModule: string;
  /** 批量删除对话框类型名 */
  readonly batchDeleteDialogType: D;
  /** 列表为空时的提示文本 */
  readonly emptyText: string;
  /** 实体名（用于批量操作提示） */
  readonly entityName: string;
  /** 批量删除按钮内容（自定义） */
  readonly bulkDeleteSlot?: React.ReactNode;
}

/**
 * 泛型 CRUD 表格组件 — 替代所有列表页中重复的 Table 组件。
 *
 * 内置功能：
 * - TanStack Table 初始化 + 分页 + 排序
 * - 搜索 + 列筛选
 * - Loading / Empty 状态
 * - 批量选择 + 批量删除
 */
export function CrudTable<T extends { readonly id: string }, D extends string>({
  dataState,
  dialogState,
  columns,
  searchPlaceholder,
  filters = [],
  permissionModule,
  batchDeleteDialogType,
  emptyText,
  entityName,
  bulkDeleteSlot,
}: CrudTableProps<T, D>): React.JSX.Element {
  const { t } = useTranslation();
  const {
    data,
    loading,
    hasMore,
    total,
    pagination,
    setPagination,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
  } = dataState;
  const { setOpen, setSelectedIds } = dialogState;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const pageCount =
    total > 0
      ? Math.max(1, Math.ceil(total / pagination.pageSize))
      : hasMore
        ? pagination.pageIndex + 2
        : pagination.pageIndex + 1;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter: search,
      rowSelection,
      columnVisibility,
    },
    manualPagination: true,
    manualFiltering: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setSearch,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // 如果当前页超出范围，回退到最后一页
  const actualPageCount = table.getPageCount();
  useEffect(() => {
    const currentPage = table.getState().pagination.pageIndex;
    if (actualPageCount > 0 && currentPage >= actualPageCount) {
      table.setPageIndex(actualPageCount - 1);
    }
  }, [actualPageCount, table]);

  // ── Loading / Empty 渲染 ──────────────────────────────────────────

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
            {emptyText}
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
                className={cn(
                  (cell.column.columnDef.meta as Record<string, unknown> | undefined)?.className as string | undefined,
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
  };

  // ── 批量删除按钮 ──────────────────────────────────────────────────

  const defaultBulkDeleteButton = (
    <PermissionGuard module={permissionModule} level="edit">
      <Button
        variant="destructive"
        size="sm"
        className="flex h-6 items-center gap-1.5 px-3 rounded-lg"
        onClick={() => {
          const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
          setSelectedIds(ids);
          setOpen(batchDeleteDialogType);
        }}
      >
        <Trash2 size={14} className="mr-1" />
        {t('common.delete', 'Delete')}
      </Button>
    </PermissionGuard>
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} filters={filters} />

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
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className="mt-auto" />

      <DataTableBulkActions table={table} entityName={entityName}>
        {bulkDeleteSlot ?? defaultBulkDeleteButton}
      </DataTableBulkActions>
    </div>
  );
}
