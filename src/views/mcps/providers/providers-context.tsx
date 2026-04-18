import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { McpProvider, McpProviderCreateInput, McpProviderUpdateInput } from '@/types/mcp';
import { listMcpProviders, createMcpProvider, updateMcpProvider, deleteMcpProvider } from '@/api/mcp-providers';

interface ProvidersContextType {
  providers: McpProvider[];
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

  fetchProviders: () => Promise<void>;
  createProvider: (data: McpProviderCreateInput) => Promise<boolean>;
  updateProvider: (id: string, data: McpProviderUpdateInput) => Promise<boolean>;
  deleteProvider: (id: string) => Promise<boolean>;
  dialogState: {
    createOpen: boolean;
    editOpen: boolean;
    deleteOpen: boolean;
    selectedProvider: McpProvider | null;
  };
  setDialogState: React.Dispatch<React.SetStateAction<ProvidersContextType['dialogState']>>;
}

const ProvidersContext = createContext<ProvidersContextType | undefined>(undefined);

export function ProvidersProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const [providers, setProviders] = useState<McpProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [dialogState, setDialogState] = useState<ProvidersContextType['dialogState']>({
    createOpen: false,
    editOpen: false,
    deleteOpen: false,
    selectedProvider: null,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const kindFilter = columnFilters.find((f) => f.id === 'kind')?.value as string | undefined;

      const rawPayload = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        search: globalFilter || undefined,
        kind: kindFilter,
      };
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== ''),
      ) as Parameters<typeof listMcpProviders>[0];

      const res = await listMcpProviders(payload);
      if (res.ok) {
        setProviders(res.data.data);
        setTotal(Number(res.data.total));
        setHasMore(res.data.has_more);
      } else {
        setError(res.error.message);
      }
    } catch (error_) {
      setError(String(error_));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  // Reset to first page on search
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset pagination when globalFilter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [globalFilter, columnFilters, pagination.pageSize]);

  useEffect((): (() => void) => {
    const timeout = setTimeout((): void => {
      void fetchProviders();
    }, 300);
    return (): void => {
      clearTimeout(timeout);
    };
  }, [fetchProviders]);

  const createProvider = useCallback(
    async (data: McpProviderCreateInput) => {
      try {
        const res = await createMcpProvider(data);
        if (res.ok) {
          await fetchProviders();
          return true;
        }
        setError(res.error.message);
        return false;
      } catch (error_) {
        setError(String(error_));
        return false;
      }
    },
    [fetchProviders],
  );

  const updateProvider = useCallback(
    async (id: string, data: McpProviderUpdateInput) => {
      try {
        const res = await updateMcpProvider(id, data);
        if (res.ok) {
          await fetchProviders();
          return true;
        }
        setError(res.error.message);
        return false;
      } catch (error_) {
        setError(String(error_));
        return false;
      }
    },
    [fetchProviders],
  );

  const deleteProviderFn = useCallback(
    async (id: string) => {
      try {
        const res = await deleteMcpProvider(id);
        if (res.ok) {
          await fetchProviders();
          return true;
        }
        setError(res.error.message);
        return false;
      } catch (error_) {
        setError(String(error_));
        return false;
      }
    },
    [fetchProviders],
  );

  return (
    <ProvidersContext.Provider
      value={{
        providers,
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
        fetchProviders,
        createProvider,
        updateProvider,
        deleteProvider: deleteProviderFn,
        dialogState,
        setDialogState,
      }}
    >
      {children}
    </ProvidersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProviders(): ProvidersContextType {
  const context = useContext(ProvidersContext);
  if (context === undefined) {
    throw new Error('useProviders must be used within a ProvidersProvider');
  }
  return context;
}
