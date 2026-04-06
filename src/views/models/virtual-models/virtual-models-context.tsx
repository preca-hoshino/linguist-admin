import type { PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listVirtualModels } from '@/api/virtual-models';
import { useDialogState } from '@/composables/use-dialog-state';
import type { VirtualModel } from '@/types';

export type VirtualModelsDialogType = 'create' | 'update' | 'delete';

interface VirtualModelsContextType {
  open: VirtualModelsDialogType | null;
  setOpen: (str: VirtualModelsDialogType | null) => void;
  currentRow: VirtualModel | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<VirtualModel | null>>;
  virtualModels: VirtualModel[];
  total: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  loadVirtualModels: () => Promise<void>;
}

const VirtualModelsContext = React.createContext<VirtualModelsContextType | null>(null);

export function VirtualModelsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<VirtualModelsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<VirtualModel | null>(null);
  const [virtualModels, setVirtualModels] = useState<VirtualModel[]>([]);
  const [total, setTotal] = useState(0);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const limit = pagination.pageSize;
      const offset = pagination.pageIndex * pagination.pageSize;
      const res = await listVirtualModels({ limit, offset, search });
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }
      setVirtualModels(res.data.data);
      setTotal(res.data.total);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [t, pagination.pageSize, pagination.pageIndex, search]);

  // Reset to first page on search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

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
        virtualModels,
        total,
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
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
