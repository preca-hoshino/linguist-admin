import React, { createContext, useCallback, useContext, useState } from 'react';
import type { McpLog } from '@/types/mcp';
import { listMcpLogs } from '@/api/mcp-logs';

interface McpLogsContextType {
  logs: McpLog[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  fetchLogs: (params?: {
    search?: string;
    offset?: number;
    limit?: number;
    direction?: 'inbound' | 'outbound';
    method?: string;
  }) => Promise<void>;
  dialogState: {
    detailOpen: boolean;
    selectedLog: McpLog | null;
  };
  setDialogState: React.Dispatch<React.SetStateAction<McpLogsContextType['dialogState']>>;
}

const McpLogsContext = createContext<McpLogsContextType | undefined>(undefined);

export function McpLogsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const [logs, setLogs] = useState<McpLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [dialogState, setDialogState] = useState<McpLogsContextType['dialogState']>({
    detailOpen: false,
    selectedLog: null,
  });

  const fetchLogs = useCallback(
    async (params?: {
      search?: string;
      offset?: number;
      limit?: number;
      direction?: 'inbound' | 'outbound';
      method?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await listMcpLogs({ ...params });
        if (res.ok) {
          setLogs(res.data.data);
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
    },
    [],
  );

  return (
    <McpLogsContext.Provider
      value={{
        logs,
        isLoading,
        error,
        total,
        hasMore,
        fetchLogs,
        dialogState,
        setDialogState,
      }}
    >
      {children}
    </McpLogsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMcpLogs(): McpLogsContextType {
  const context = useContext(McpLogsContext);
  if (context === undefined) {
    throw new Error('useMcpLogs must be used within a McpLogsProvider');
  }
  return context;
}
