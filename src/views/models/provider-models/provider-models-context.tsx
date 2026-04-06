import type { PaginationState } from '@tanstack/react-table';
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
  total: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  loadProviderModels: () => Promise<void>;
}

const ProviderModelsContext = React.createContext<ProviderModelsContextType | null>(null);

export function ProviderModelsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<ProviderModelsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ProviderModel | null>(null);
  const [providerModels, setProviderModels] = useState<ProviderModel[]>([]);
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
      const res = await listProviderModels({ limit, offset, search });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      setProviderModels(res.data.data);
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
    <ProviderModelsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        providerModels,
        total,
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
        loadProviderModels: load,
      }}
    >
      {children}
    </ProviderModelsContext>
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
