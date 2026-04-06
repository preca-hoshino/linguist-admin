import type { PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
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
  total: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  loadProviders: () => Promise<void>;
}

const ProvidersContext = React.createContext<ProvidersContextType | null>(null);

export function ProvidersProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const [open, setOpen] = useDialogState<ProvidersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
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
      const res = await listProviders({ limit, offset, search });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      setProviders(res.data.data);
      setTotal(res.data.total);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, pagination.pageIndex, search]);

  // Reset to first page on search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ProvidersContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        providers,
        total,
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
        loadProviders: load,
      }}
    >
      {children}
    </ProvidersContext>
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
