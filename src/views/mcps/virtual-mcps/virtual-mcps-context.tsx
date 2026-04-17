import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { VirtualMcp, VirtualMcpCreateInput, VirtualMcpUpdateInput } from '@/types/mcp';
import { listVirtualMcps, createVirtualMcp, updateVirtualMcp, deleteVirtualMcp } from '@/api/mcp-virtual-servers';

interface VirtualMcpsContextType {
  servers: VirtualMcp[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;

  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;

  fetchServers: () => Promise<void>;
  createServer: (data: VirtualMcpCreateInput) => Promise<boolean>;
  updateServer: (id: string, data: VirtualMcpUpdateInput) => Promise<boolean>;
  deleteServer: (id: string) => Promise<boolean>;
  dialogState: {
    createOpen: boolean;
    editOpen: boolean;
    deleteOpen: boolean;
    selectedServer: VirtualMcp | null;
  };
  setDialogState: React.Dispatch<React.SetStateAction<VirtualMcpsContextType['dialogState']>>;
}

const VirtualMcpsContext = createContext<VirtualMcpsContextType | undefined>(undefined);

export function VirtualMcpsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const [servers, setServers] = useState<VirtualMcp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [dialogState, setDialogState] = useState<VirtualMcpsContextType['dialogState']>({
    createOpen: false,
    editOpen: false,
    deleteOpen: false,
    selectedServer: null,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fetchServers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rawPayload = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        search: globalFilter || undefined,
      };

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== ''),
      ) as Parameters<typeof listVirtualMcps>[0];

      const res = await listVirtualMcps(payload);
      if (res.ok) {
        setServers(res.data.data);
        setTotal(res.data.total);
        setHasMore(res.data.has_more);
      } else {
        setError(res.error.message);
      }
    } catch (error_) {
      setError(String(error_));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset pagination when globalFilter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [globalFilter, pagination.pageSize]);

  useEffect((): (() => void) => {
    const timeout = setTimeout((): void => {
      void fetchServers();
    }, 300);
    return (): void => {
      clearTimeout(timeout);
    };
  }, [fetchServers]);

  const createServer = useCallback(
    async (data: VirtualMcpCreateInput) => {
      try {
        const res = await createVirtualMcp(data);
        if (res.ok) {
          await fetchServers();
          return true;
        }
        setError(res.error.message);
        return false;
      } catch (error_) {
        setError(String(error_));
        return false;
      }
    },
    [fetchServers],
  );

  const updateServer = useCallback(
    async (id: string, data: VirtualMcpUpdateInput) => {
      try {
        const res = await updateVirtualMcp(id, data);
        if (res.ok) {
          await fetchServers();
          return true;
        }
        setError(res.error.message);
        return false;
      } catch (error_) {
        setError(String(error_));
        return false;
      }
    },
    [fetchServers],
  );

  const deleteServerFn = useCallback(
    async (id: string) => {
      try {
        const res = await deleteVirtualMcp(id);
        if (res.ok) {
          await fetchServers();
          return true;
        }
        setError(res.error.message);
        return false;
      } catch (error_) {
        setError(String(error_));
        return false;
      }
    },
    [fetchServers],
  );

  return (
    <VirtualMcpsContext.Provider
      value={{
        servers,
        isLoading,
        error,
        total,
        hasMore,
        pagination,
        setPagination,
        columnFilters,
        setColumnFilters,
        globalFilter,
        setGlobalFilter,
        fetchServers,
        createServer,
        updateServer,
        deleteServer: deleteServerFn,
        dialogState,
        setDialogState,
      }}
    >
      {children}
    </VirtualMcpsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVirtualMcps(): VirtualMcpsContextType {
  const context = useContext(VirtualMcpsContext);
  if (context === undefined) {
    throw new Error('useVirtualMcps must be used within a VirtualMcpsProvider');
  }
  return context;
}
