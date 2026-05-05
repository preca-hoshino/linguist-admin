import type { PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listApps } from '@/api/apps';
import { useDialogState } from '@/composables/use-dialog-state';
import type { App } from '@/types/app';

export type AppsDialogType = 'create' | 'update' | 'delete' | 'rotate' | 'batch-delete';

interface AppsContextType {
  open: AppsDialogType | null;
  setOpen: (str: AppsDialogType | null) => void;
  currentRow: App | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<App | null>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  apps: App[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  loadApps: () => Promise<void>;
  hasMore: boolean;
  total: number;
}

const AppsContext = React.createContext<AppsContextType | null>(null);

export function AppsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<AppsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<App | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const offset = pagination.pageIndex * pagination.pageSize;

      const payload: Parameters<typeof listApps>[0] = { limit: pagination.pageSize, search };
      if (offset > 0) {
        payload.offset = offset;
      }
      if (statusFilter !== 'all') {
        payload.is_active = statusFilter === 'true';
      }

      const res = await listApps(payload);

      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }

      setApps(res.data.data);
      setHasMore(res.data.has_more);
      setTotal(res.data.total);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [t, pagination.pageSize, pagination.pageIndex, search, statusFilter]);

  // Handle data load when pagination changes
  useEffect(() => {
    void load();
  }, [load]);

  // Reset pagination when search/filter changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, statusFilter]);

  return (
    <AppsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedIds,
        setSelectedIds,
        apps,
        pagination,
        setPagination,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        loading,
        error,
        loadApps: load,
        hasMore,
        total,
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
