import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { McpLog } from '@/types/mcp';
import { listMcpLogs } from '@/api/mcp/logs';
import { extractFilterValue } from '@/utils/table';
import { useTranslation } from 'react-i18next';
import { useDialogState } from '@/composables/use-dialog-state';

export type McpLogsDialogType = 'delete' | 'batch-delete' | 'detail';

interface McpLogsContextType {
  open: McpLogsDialogType | null;
  setOpen: (str: McpLogsDialogType | null) => void;
  currentRow: McpLog | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<McpLog | null>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  logs: McpLog[];
  loading: boolean;
  error: string;
  hasMore: boolean;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  loadLogs: () => Promise<void>;
}

const McpLogsContext = createContext<McpLogsContextType | undefined>(undefined);

export function McpLogsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<McpLogsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<McpLog | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<McpLog[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Table Server-side State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  // Table filters state mapped to API
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // 提取 API 参数
  const methodFilter = extractFilterValue(columnFilters, 'method');
  const providerIdFilter = extractFilterValue(columnFilters, 'mcp_provider_id');
  const virtualIdFilter = extractFilterValue(columnFilters, 'virtual_mcp_id');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const rawPayload = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        search: globalFilter === '' ? undefined : globalFilter,
        method: methodFilter,
        mcp_provider_id: providerIdFilter,
        virtual_mcp_id: virtualIdFilter,
      };

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== ''),
      ) as Parameters<typeof listMcpLogs>[0];

      const res = await listMcpLogs(payload);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      setLogs(res.data.data);
      setHasMore(res.data.has_more);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load logs'));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, methodFilter, providerIdFilter, virtualIdFilter, t]);

  // Reset to first page on search/filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search/filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [globalFilter, methodFilter, providerIdFilter, virtualIdFilter, pagination.pageSize]);

  // Reload when triggered
  useEffect((): (() => void) => {
    const timeout = setTimeout((): void => {
      void load();
    }, 300); // debounce API calls
    return (): void => {
      clearTimeout(timeout);
    };
  }, [load]);

  return (
    <McpLogsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedIds,
        setSelectedIds,
        logs,
        loading,
        error,
        pagination,
        hasMore,
        setPagination,
        columnFilters,
        setColumnFilters,
        globalFilter,
        setGlobalFilter,
        loadLogs: load,
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
    throw new Error('useMcpLogs must be used within an McpLogsProvider');
  }
  return context;
}
