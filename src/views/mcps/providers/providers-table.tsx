import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { getProvidersColumns } from './providers-columns';
import { useProviders } from './providers-context';
import { useTranslation } from 'react-i18next';

export function ProvidersTable(): React.JSX.Element {
  const { providers, isLoading, fetchProviders } = useProviders();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { t } = useTranslation();

  useEffect(() => {
    void fetchProviders();
  }, [fetchProviders]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: providers,
    columns: getProvidersColumns(t),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (isLoading && providers.length === 0) {
    return <div className="text-sm text-muted-foreground">{t('common.loading', 'Loading...')}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {t('mcpsPage.providers.noData', 'No MCP providers found.')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
