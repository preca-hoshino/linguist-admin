import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { DataTableBulkActions } from '@/components/data-table/BulkActions';
import { Button } from '@/components/ui/Button';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/utils';
import { useUsersColumns } from './users-columns';
import { useUsers } from './users-context';

export function UsersTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useUsersColumns();
  const {
    users,
    pagination,
    setPagination,
    search,
    setSearch,
    loading,
    hasMore,
    setOpen,
    setSelectedIds,
  } = useUsers();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: users,
    columns,
    pageCount: hasMore ? -1 : pagination.pageIndex + 1,
    state: {
      sorting,
      columnFilters,
      globalFilter: search,
      pagination,
      rowSelection,
    },
    manualPagination: true,
    manualFiltering: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearch,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
            {t('users.empty', 'No users found')}
          </TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
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
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={t('users.searchPlaceholder', 'Search users...')}
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

      <DataTableBulkActions table={table} entityName={t('users.entityName', 'user')}>
        <PermissionGuard module="users" level="edit">
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
        </PermissionGuard>
      </DataTableBulkActions>
    </div>
  );
}
