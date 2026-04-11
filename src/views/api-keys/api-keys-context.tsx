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
  total: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
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
  const [total, setTotal] = useState(0);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [cursorMap, setCursorMap] = useState<Record<number, string | undefined>>({ 0: undefined });
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const limit = pagination.pageSize;
      const startingAfter = cursorMap[pagination.pageIndex];
      const res = await listAppKeys(appId, {
        limit,
        ...(startingAfter == null ? {} : { starting_after: startingAfter }),
        search,
      });
      if (!res.ok) {
        throw new Error(res.error.message || t('common.loadFailed', 'Failed to load data'));
      }
      setApiKeys(res.data.data);
      setTotal(res.data.total);

      // Update cursor map for next page
      if (res.data.data.length > 0) {
        setCursorMap((prev) => ({
          ...prev,
          [pagination.pageIndex + 1]: res.data.data.at(-1)?.id,
        }));
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [t, appId, pagination.pageSize, pagination.pageIndex, search, cursorMap]);

  // Reset to first page on search change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run when search string changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setCursorMap({ 0: undefined });
  }, [search]);

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
        total,
        pagination,
        setPagination,
        search,
        setSearch,
        loading,
        error,
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
