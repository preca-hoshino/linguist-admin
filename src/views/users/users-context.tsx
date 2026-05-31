import type { PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchUsers, type User } from '@/api/users';
import { useDialogState } from '@/composables/use-dialog-state';

export type UsersDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

interface UsersContextType {
  open: UsersDialogType | null;
  setOpen: (str: UsersDialogType | null) => void;
  currentRow: User | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  users: User[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  loadUsers: () => Promise<void>;
  hasMore: boolean;
  total: number;
}

const UsersContext = React.createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<UsersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(false);
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

      const offset = pagination.pageIndex * pagination.pageSize;

      const payload: Parameters<typeof fetchUsers>[0] = { limit: pagination.pageSize };
      if (offset > 0) {
        payload.offset = offset;
      }
      if (search) {
        payload.search = search;
      }

      const res = await fetchUsers(payload);

      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }

      setUsers(res.data.data);
      setHasMore(res.data.has_more);
      setTotal(res.data.total);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [t, pagination.pageSize, pagination.pageIndex, search]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset pagination when search changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  return (
    <UsersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedIds,
        setSelectedIds,
        users,
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
        loadUsers: load,
        hasMore,
        total,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = (): UsersContextType => {
  const ctx = React.useContext(UsersContext);
  if (!ctx) {
    throw new Error('useUsers must be used within <UsersProvider>');
  }
  return ctx;
};
