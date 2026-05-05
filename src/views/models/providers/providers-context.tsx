import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviders } from '@/api/model/providers';
import { useDialogState } from '@/composables/use-dialog-state';
import type { Provider } from '@/types';

export type ProvidersDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

interface ProvidersContextType {
  open: ProvidersDialogType | null;
  setOpen: (str: ProvidersDialogType | null) => void;
  currentRow: Provider | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Provider | null>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  providers: Provider[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  loading: boolean;
  error: string;
  hasMore: boolean;
  total: number;
  loadProviders: () => Promise<void>;
}

const ProvidersContext = React.createContext<ProvidersContextType | null>(null);

import { extractFilterValue } from '@/utils/table';

export function ProvidersProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<ProvidersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Provider | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 从 columnFilters 提取出 API 参数
  const kindFilter = extractFilterValue(columnFilters, 'kind');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const offset = pagination.pageIndex * pagination.pageSize;
      const payload: Parameters<typeof listProviders>[0] = { limit: pagination.pageSize };
      if (offset > 0) {
        payload.offset = offset;
      }
      if (search) {
        payload.search = search;
      }
      if (kindFilter !== undefined) {
        payload.kind = kindFilter;
      }

      const res = await listProviders(payload);
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }
      setProviders(res.data.data);
      setHasMore(res.data.has_more);
      setTotal(res.data.total);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, pagination.pageIndex, search, kindFilter, t]);

  // Reset to first page on search/filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search/filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, kindFilter, pagination.pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ProvidersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedIds,
        setSelectedIds,
        providers,
        pagination,
        setPagination,
        search,
        setSearch,
        columnFilters,
        setColumnFilters,
        loading,
        error,
        hasMore,
        total,
        loadProviders: load,
      }}
    >
      {children}
    </ProvidersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProviders = (): ProvidersContextType => {
  const ctx = React.useContext(ProvidersContext);
  if (!ctx) {
    throw new Error('useProviders must be used within <ProvidersProvider>');
  }
  return ctx;
};
