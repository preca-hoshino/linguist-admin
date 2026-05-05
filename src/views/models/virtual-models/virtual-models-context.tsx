import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listVirtualModels } from '@/api/model/virtual-models';
import { useDialogState } from '@/composables/use-dialog-state';
import type { VirtualModel } from '@/types';

export type VirtualModelsDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

interface VirtualModelsContextType {
  open: VirtualModelsDialogType | null;
  setOpen: (str: VirtualModelsDialogType | null) => void;
  currentRow: VirtualModel | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<VirtualModel | null>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  virtualModels: VirtualModel[];
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
  loadVirtualModels: () => Promise<void>;
}

const VirtualModelsContext = React.createContext<VirtualModelsContextType | null>(null);

import { extractFilterValue } from '@/utils/table';

export function VirtualModelsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<VirtualModelsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<VirtualModel | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [virtualModels, setVirtualModels] = useState<VirtualModel[]>([]);
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

  // 从 columnFilters 提取 API 参数
  const modelTypeFilter = extractFilterValue(columnFilters, 'model_type');
  const routingStrategyFilter = extractFilterValue(columnFilters, 'routing_strategy');
  const isActiveFilter = extractFilterValue(columnFilters, 'is_active');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const offset = pagination.pageIndex * pagination.pageSize;
      const payload: Parameters<typeof listVirtualModels>[0] = { limit: pagination.pageSize };
      if (offset > 0) {
        payload.offset = offset;
      }
      if (search) {
        payload.search = search;
      }
      if (modelTypeFilter !== undefined) {
        payload.model_type = modelTypeFilter;
      }
      if (routingStrategyFilter !== undefined) {
        payload.routing_strategy = routingStrategyFilter;
      }
      if (isActiveFilter !== undefined) {
        payload.is_active = isActiveFilter === 'true';
      }

      const res = await listVirtualModels(payload);
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }
      setVirtualModels(res.data.data);
      setHasMore(res.data.has_more);
      setTotal(res.data.total);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [t, pagination.pageSize, pagination.pageIndex, search, modelTypeFilter, routingStrategyFilter, isActiveFilter]);

  // Reset to first page on search/filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search/filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, modelTypeFilter, routingStrategyFilter, isActiveFilter, pagination.pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <VirtualModelsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedIds,
        setSelectedIds,
        virtualModels,
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
        loadVirtualModels: load,
      }}
    >
      {children}
    </VirtualModelsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVirtualModels = (): VirtualModelsContextType => {
  const ctx = React.useContext(VirtualModelsContext);
  if (!ctx) {
    throw new Error('useVirtualModels must be used within <VirtualModelsProvider>');
  }
  return ctx;
};
