import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import type { McpProvider, McpProviderCreateInput, McpProviderUpdateInput } from '@/types/mcp';
import { listMcpProviders, createMcpProvider, updateMcpProvider, deleteMcpProvider } from '@/api/mcp-providers';

interface ProvidersContextType {
  providers: McpProvider[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  fetchProviders: (params?: { search?: string; offset?: number; limit?: number }) => Promise<void>;
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

  const fetchProviders = useCallback(async (params?: { search?: string; offset?: number; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listMcpProviders({ ...params });
      if (res.ok) {
        setProviders(res.data.data);
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
  }, []);

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
