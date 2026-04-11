import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listRequestLogs } from '@/api/request-logs';
import { useDialogState } from '@/composables/use-dialog-state';
import type { RequestLog } from '@/types';

export type LogsDialogType = 'delete' | 'batch-delete';

interface LogsContextType {
  open: LogsDialogType | null;
  setOpen: (str: LogsDialogType | null) => void;
  currentRow: RequestLog | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<RequestLog | null>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  logs: RequestLog[];
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

const LogsContext = React.createContext<LogsContextType | null>(null);

import { extractFilterValue } from '@/utils/table';

function getIsStreamApiValue(val?: string): string | undefined {
  const mode = val;
  if (mode === 'stream') {
    return 'true';
  }
  if (mode === 'unary' || mode === 'non-stream') {
    return 'false';
  }
  return undefined;
}

export function LogsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<LogsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<RequestLog | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const cursorsRef = React.useRef<(string | undefined)[]>([undefined]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Table Server-side State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Table filters state mapped to API
  const [globalFilter, setGlobalFilter] = useState(''); // mapped to request_model
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // 提取 API 参数
  const statusFilter = extractFilterValue(columnFilters, 'status');
  const providerKindFilter = extractFilterValue(columnFilters, 'provider_kind');
  const providerIdFilter = extractFilterValue(columnFilters, 'provider_id');
  const keyPrefixFilter = extractFilterValue(columnFilters, 'api_key');
  const sourceFilter = extractFilterValue(columnFilters, 'source');
  const isStreamFilter = extractFilterValue(columnFilters, 'mode');
  const appIdFilter = extractFilterValue(columnFilters, 'app_id');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const rawPayload = {
        limit: pagination.pageSize,
        starting_after: cursorsRef.current[pagination.pageIndex],
        request_model: globalFilter === '' ? undefined : globalFilter,
        status: statusFilter,
        provider_kind: providerKindFilter,
        provider_id: providerIdFilter,
        api_key_prefix: keyPrefixFilter?.trim(),
        user_format: sourceFilter,
        is_stream: isStreamFilter === undefined ? undefined : getIsStreamApiValue(isStreamFilter),
        app_id: appIdFilter,
      };

      // 移除未定义的值
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== ''),
      ) as Parameters<typeof listRequestLogs>[0];

      const res = await listRequestLogs(payload);
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      setLogs(res.data.data);
      setHasMore(res.data.has_more);

      if (res.data.has_more && res.data.data.length > 0) {
        const lastItem = res.data.data.at(-1);
        if (lastItem) {
          cursorsRef.current[pagination.pageIndex + 1] = lastItem.id;
        }
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load logs'));
    } finally {
      setLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    statusFilter,
    providerKindFilter,
    providerIdFilter,
    keyPrefixFilter,
    sourceFilter,
    isStreamFilter,
    appIdFilter,
    t,
  ]);

  // Reset to first page on search/filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search/filter change
  useEffect(() => {
    cursorsRef.current = [undefined];
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    globalFilter,
    statusFilter,
    providerKindFilter,
    providerIdFilter,
    keyPrefixFilter,
    sourceFilter,
    isStreamFilter,
    appIdFilter,
    pagination.pageSize,
  ]);

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
    <LogsContext.Provider
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
    </LogsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLogs(): LogsContextType {
  const ctx = React.useContext(LogsContext);
  if (ctx == null) {
    throw new Error('useLogs must be used within <LogsProvider>');
  }
  return ctx;
}
