import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { getVirtualMcpsColumns } from './virtual-mcps-columns';
import { useVirtualMcps } from './virtual-mcps-context';
import { toast } from 'sonner';

export function VirtualMcpsTable(): React.JSX.Element {
  const { servers, isLoading, fetchServers, updateServer } = useVirtualMcps();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    void fetchServers();
  }, [fetchServers]);

  const onToggleActive = async (id: string, current: boolean): Promise<void> => {
    const success = await updateServer(id, { is_active: !current });
    if (success) {
      toast.success(current ? 'Virtual MCP disabled' : 'Virtual MCP enabled');
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: servers,
    columns: getVirtualMcpsColumns(onToggleActive),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (isLoading && servers.length === 0) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
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
              <TableCell colSpan={7} className="h-24 text-center">
                No virtual MCP servers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
