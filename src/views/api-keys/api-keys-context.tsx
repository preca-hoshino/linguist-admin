import type { PaginationState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listAppKeys } from '@/api/apps';
import { useDialogState } from '@/composables/use-dialog-state';
import type { ApiKey } from '@/types';

export type ApiKeysDialogType = 'create' | 'update' | 'delete' | 'rotate' | 'copy';

interface ApiKeysContextType {
  appId: string;
  open: ApiKeysDialogType | null;
  setOpen: (str: ApiKeysDialogType | null) => void;
  currentRow: ApiKey | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<ApiKey | null>>;
  newKeyText: string | null;
  setNewKeyText: React.Dispatch<React.SetStateAction<string | null>>;
  apiKeys: ApiKey[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  hasMore: boolean;
  loadApiKeys: () => Promise<void>;
}

const ApiKeysContext = React.createContext<ApiKeysContextType | null>(null);

export function ApiKeysProvider({
  appId,
  children,
}: {
  readonly appId: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useDialogState<ApiKeysDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ApiKey | null>(null);
  const [newKeyText, setNewKeyText] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
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
      const limit = pagination.pageSize;
      const offset = pagination.pageIndex * pagination.pageSize;
      const res = await listAppKeys(appId, { limit, offset, search });
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }
      setApiKeys(res.data.data);
      setHasMore(res.data.has_more);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [t, appId, pagination.pageSize, pagination.pageIndex, search]);

  // Reset to first page on search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ApiKeysContext.Provider
      value={{
        appId,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        newKeyText,
        setNewKeyText,
        apiKeys,
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
        hasMore,
        loadApiKeys: load,
      }}
    >
      {children}
    </ApiKeysContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApiKeys = (): ApiKeysContextType => {
  const ctx = React.useContext(ApiKeysContext);
  if (!ctx) {
    throw new Error('useApiKeys must be used within <ApiKeysProvider>');
  }
  return ctx;
};
