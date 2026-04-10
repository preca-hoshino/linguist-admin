import type { PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { listApps } from '@/api/apps';
import { useDialogState } from '@/composables/use-dialog-state';
import type { App } from '@/types/app';

export type AppsDialogType = 'create' | 'update' | 'delete';

interface AppsContextType {
  open: AppsDialogType | null;
  setOpen: (str: AppsDialogType | null) => void;
  currentRow: App | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<App | null>>;
  apps: App[];
  total: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  loadApps: () => Promise<void>;
  hasMore: boolean;
}

const AppsContext = React.createContext<AppsContextType | null>(null);

export function AppsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<AppsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<App | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // For cursor-based pagination with pageIndex map
  const cursorsRef = useRef<(string | undefined)[]>([undefined]);

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

      const payload: Parameters<typeof listApps>[0] = { limit: pagination.pageSize, search };
      if (startingAfter !== undefined) {
        payload.starting_after = startingAfter;
      }

      const res = await listApps(payload);

      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }

      setApps(res.data.data);
      setTotal(res.data.total);
      setHasMore(res.data.has_more);

      // Record next cursor if available
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

  // Handle data load when pagination changes
  useEffect(() => {
    void load();
  }, [load]);

  // Reset pagination and cursors when search changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search change
  useEffect(() => {
    cursorsRef.current = [undefined];
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  return (
    <AppsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        apps,
        total,
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
        loadApps: load,
        hasMore,
      }}
    >
      {children}
    </AppsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApps = (): AppsContextType => {
  const ctx = React.useContext(AppsContext);
  if (!ctx) {
    throw new Error('useApps must be used within <AppsProvider>');
  }
  return ctx;
};
