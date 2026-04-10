import {
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/utils';
import { useAppsColumns } from './apps-columns';
import { useApps } from './apps-context';

export function AppsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useAppsColumns();
  const { apps, total, pagination, setPagination, search, setSearch, statusFilter, setStatusFilter, loading } =
    useApps();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    const activeF = columnFilters.find((f) => f.id === 'is_active');
    if (!activeF || !Array.isArray(activeF.value) || activeF.value.length === 0 || activeF.value.length > 1) {
      if (statusFilter !== 'all') {
        setStatusFilter('all');
      }
    } else {
      const val = activeF.value[0];
      if (statusFilter !== val) {
        setStatusFilter(val);
      }
    }
  }, [columnFilters, statusFilter, setStatusFilter]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: apps,
    columns,
    rowCount: total, // we might not know total for cursor pagination, but we provide it
    state: {
      sorting,
      columnFilters,
      globalFilter: search,
      pagination,
    },
    manualPagination: true,
    manualFiltering: true,
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
            {t('apps.empty', 'No applications found')}
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
        searchPlaceholder={t('apps.searchPlaceholder', 'Search apps by name...')}
        filters={[
          {
            columnId: 'is_active',
            title: t('common.status', 'Status'),
            options: [
              { label: t('apps.active', 'Active'), value: 'true' },
              { label: t('apps.inactive', 'Inactive'), value: 'false' },
            ],
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
