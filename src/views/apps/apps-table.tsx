import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataTablePagination } from '@/components/data-table';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/utils/utils';
import { useAppsColumns } from './apps-columns';
import { useApps } from './apps-context';

export function AppsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useAppsColumns();
  const { apps, total, pagination, setPagination, search, setSearch, loading } = useApps();

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: apps,
    columns,
    rowCount: total, // we might not know total for cursor pagination, but we provide it
    state: {
      globalFilter: search,
      pagination,
    },
    manualPagination: true,
    manualFiltering: true,
    onGlobalFilterChange: setSearch,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('apps.searchPlaceholder', 'Search apps by name...')}
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

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
