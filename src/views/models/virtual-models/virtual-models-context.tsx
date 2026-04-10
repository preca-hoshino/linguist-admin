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
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  hasMore: boolean;
  loadVirtualModels: () => Promise<void>;
}

const VirtualModelsContext = React.createContext<VirtualModelsContextType | null>(null);

export function VirtualModelsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<VirtualModelsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<VirtualModel | null>(null);
  const [virtualModels, setVirtualModels] = useState<VirtualModel[]>([]);
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
      const payload: Parameters<typeof listVirtualModels>[0] = { limit: pagination.pageSize };
      if (startingAfter !== undefined) {
        payload.starting_after = startingAfter;
      }
      if (search) {
        payload.search = search;
      }

      const res = await listVirtualModels(payload);
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }
      setVirtualModels(res.data.data);
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
  }, [t, pagination.pageSize, pagination.pageIndex, search]);

  // Reset to first page on search change
  useEffect(() => {
    cursorsRef.current = [undefined];
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

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
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
        hasMore,
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
