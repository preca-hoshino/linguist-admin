import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviders } from '@/api/providers';
import { useDialogState } from '@/composables/use-dialog-state';
import type { Provider } from '@/types';

export type ProvidersDialogType = 'create' | 'update' | 'delete';

interface ProvidersContextType {
  open: ProvidersDialogType | null;
  setOpen: (str: ProvidersDialogType | null) => void;
  currentRow: Provider | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Provider | null>>;
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
  loadProviders: () => Promise<void>;
}

const ProvidersContext = React.createContext<ProvidersContextType | null>(null);

/** 从 TanStack columnFilters 状态中提取出第一个选中值 */
function extractFilterValue(filters: ColumnFiltersState, id: string): string | undefined {
  const f = filters.find((item) => item.id === id);
  if (!f) {
    return undefined;
  }
  const val = f.value;
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
    return val[0];
  }
  return undefined;
}

export function ProvidersProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<ProvidersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const cursorsRef = React.useRef<(string | undefined)[]>([undefined]);
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

      const startingAfter = cursorsRef.current[pagination.pageIndex];
      const payload: Parameters<typeof listProviders>[0] = { limit: pagination.pageSize };
      if (startingAfter !== undefined) {
        payload.starting_after = startingAfter;
      }
      if (search) {
        payload.search = search;
      }
      if (kindFilter !== undefined) {
        payload.kind = kindFilter;
      }

      const res = await listProviders(payload);
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed'));
      }
      setProviders(res.data.data);
      setHasMore(res.data.has_more);

      if (res.data.has_more && res.data.data.length > 0) {
        const lastItem = res.data.data.at(-1);
        if (lastItem) {
          cursorsRef.current[pagination.pageIndex + 1] = lastItem.id;
        }
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, pagination.pageIndex, search, kindFilter, t]);

  // Reset to first page on search/filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search/filter change
  useEffect(() => {
    cursorsRef.current = [undefined];
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, kindFilter]);

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
