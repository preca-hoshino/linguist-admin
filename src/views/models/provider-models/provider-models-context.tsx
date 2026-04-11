import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviderModels } from '@/api/provider-models';
import { useDialogState } from '@/composables/use-dialog-state';
import type { ProviderModel } from '@/types';

export type ProviderModelsDialogType = 'create' | 'update' | 'delete';

interface ProviderModelsContextType {
  open: ProviderModelsDialogType | null;
  setOpen: (str: ProviderModelsDialogType | null) => void;
  currentRow: ProviderModel | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<ProviderModel | null>>;
  providerModels: ProviderModel[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  providerIdFilter: string;
  setProviderIdFilter: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  hasMore: boolean;
  loadProviderModels: () => Promise<void>;
}

const ProviderModelsContext = React.createContext<ProviderModelsContextType | null>(null);

import { extractFilterValue } from '@/utils/table';

export function ProviderModelsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<ProviderModelsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ProviderModel | null>(null);
  const [providerModels, setProviderModels] = useState<ProviderModel[]>([]);
  const cursorsRef = React.useRef<(string | undefined)[]>([undefined]);
  const [hasMore, setHasMore] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [providerIdFilter, setProviderIdFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 从 columnFilters 提取 API 参数
  const modelTypeFilter = extractFilterValue(columnFilters, 'model_type');
  const providerFilter = extractFilterValue(columnFilters, 'provider_id');
  const isActiveFilter = extractFilterValue(columnFilters, 'is_active');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const startingAfter = cursorsRef.current[pagination.pageIndex];
      const payload: Parameters<typeof listProviderModels>[0] = { limit: pagination.pageSize };
      if (startingAfter !== undefined) {
        payload.starting_after = startingAfter;
      }
      if (search) {
        payload.search = search;
      }
      if (modelTypeFilter !== undefined) {
        payload.model_type = modelTypeFilter;
      }
      if (providerFilter !== undefined) {
        payload.provider_id = providerFilter;
      } else if (providerIdFilter) {
        payload.provider_id = providerIdFilter; // 外层指定的 provider_id
      }
      if (isActiveFilter !== undefined) {
        payload.is_active = isActiveFilter === 'true';
      }

      const res = await listProviderModels(payload);
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }
      setProviderModels(res.data.data);
      setHasMore(res.data.has_more);

      if (res.data.has_more && res.data.data.length > 0) {
        const lastItem = res.data.data.at(-1);
        if (lastItem) {
          cursorsRef.current[pagination.pageIndex + 1] = lastItem.id;
        }
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [
    t,
    pagination.pageSize,
    pagination.pageIndex,
    search,
    modelTypeFilter,
    providerFilter,
    providerIdFilter,
    isActiveFilter,
  ]);

  // Reset to first page on search/filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search/filter change
  useEffect(() => {
    cursorsRef.current = [undefined];
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, modelTypeFilter, providerFilter, providerIdFilter, isActiveFilter, pagination.pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ProviderModelsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        providerModels,
        pagination,
        setPagination,
        search,
        setSearch,
        columnFilters,
        setColumnFilters,
        providerIdFilter,
        setProviderIdFilter,
        loading,
        error,
        hasMore,
        loadProviderModels: load,
      }}
    >
      {children}
    </ProviderModelsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProviderModels = (): ProviderModelsContextType => {
  const ctx = React.useContext(ProviderModelsContext);
  if (!ctx) {
    throw new Error('useProviderModels must be used within <ProviderModelsProvider>');
  }
  return ctx;
};
