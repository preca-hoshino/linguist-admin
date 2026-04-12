import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { getVirtualMcpsColumns } from './virtual-mcps-columns';
import { useVirtualMcps } from './virtual-mcps-context';
import { toast } from 'sonner';
import { listMcpProviders } from '@/api/mcp-providers';
import { useTranslation } from 'react-i18next';

export function VirtualMcpsTable(): React.JSX.Element {
  const { servers, isLoading, fetchServers, updateServer } = useVirtualMcps();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [providerMap, setProviderMap] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  useEffect(() => {
    void fetchServers();
    void listMcpProviders({ limit: 100 }).then((res) => {
      if (res.ok) {
        const map: Record<string, string> = {};
        for (const p of res.data.data) {
          map[p.id] = p.name;
        }
        setProviderMap(map);
      }
    });
  }, [fetchServers]);

  const onToggleActive = async (id: string, current: boolean): Promise<void> => {
    const success = await updateServer(id, { is_active: !current });
    if (success) {
      toast.success(
        current
          ? t('mcpsPage.virtualMcps.disabledSuccess', 'Virtual MCP disabled')
          : t('mcpsPage.virtualMcps.enabledSuccess', 'Virtual MCP enabled'),
      );
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: servers,
    columns: getVirtualMcpsColumns(t, onToggleActive, providerMap),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (isLoading && servers.length === 0) {
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
              <TableCell colSpan={7} className="h-24 text-center">
                {t('mcpsPage.virtualMcps.noData', 'No virtual MCP servers found.')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
