import React, { createContext, useCallback, useContext, useState } from 'react';
import type { McpVirtualServer, McpVirtualServerCreateInput, McpVirtualServerUpdateInput } from '@/types/mcp';
import {
  listMcpVirtualServers,
  createMcpVirtualServer,
  updateMcpVirtualServer,
  deleteMcpVirtualServer,
} from '@/api/mcp-virtual-servers';

interface VirtualMcpsContextType {
  servers: McpVirtualServer[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  fetchServers: (params?: { search?: string; offset?: number; limit?: number }) => Promise<void>;
  createServer: (data: McpVirtualServerCreateInput) => Promise<boolean>;
  updateServer: (id: string, data: McpVirtualServerUpdateInput) => Promise<boolean>;
  deleteServer: (id: string) => Promise<boolean>;
  dialogState: {
    createOpen: boolean;
    editOpen: boolean;
    deleteOpen: boolean;
    selectedServer: McpVirtualServer | null;
  };
  setDialogState: React.Dispatch<React.SetStateAction<VirtualMcpsContextType['dialogState']>>;
}

const VirtualMcpsContext = createContext<VirtualMcpsContextType | undefined>(undefined);

export function VirtualMcpsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const [servers, setServers] = useState<McpVirtualServer[]>([]);
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

  const fetchServers = useCallback(async (params?: { search?: string; offset?: number; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listMcpVirtualServers({ ...params });
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
  }, []);

  const createServer = useCallback(
    async (data: McpVirtualServerCreateInput) => {
      try {
        const res = await createMcpVirtualServer(data);
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
    async (id: string, data: McpVirtualServerUpdateInput) => {
      try {
        const res = await updateMcpVirtualServer(id, data);
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
        const res = await deleteMcpVirtualServer(id);
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
