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
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  hasMore: boolean;
  loadProviders: () => Promise<void>;
}

const ProvidersContext = React.createContext<ProvidersContextType | null>(null);

export function ProvidersProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      const res = await listProviders(payload);
      if (!res.ok) {
        throw new Error(res.error.message || 'Failed to load data');
      }
      setProviders(res.data.data);
      setHasMore(res.data.has_more);

      // Record next cursor
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
  }, [pagination.pageSize, pagination.pageIndex, search]);

  // Reset to first page on search change
  useEffect(() => {
    cursorsRef.current = [undefined];
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

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
