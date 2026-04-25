import React, { useCallback, useEffect, useState } from 'react';
import { listProviderModels } from '@/api/model/provider-models';
import { useDialogState } from '@/composables/use-dialog-state';
import type { ProviderModel } from '@/types';

export type ProviderModelsDialogType = 'create' | 'update' | 'delete';

interface ProviderModelsContextType {
  providerId: string;
  open: ProviderModelsDialogType | null;
  setOpen: (str: ProviderModelsDialogType | null) => void;
  currentRow: ProviderModel | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<ProviderModel | null>>;
  models: ProviderModel[];
  loading: boolean;
  error: string;
  loadModels: () => Promise<void>;
}

const ProviderModelsContext = React.createContext<ProviderModelsContextType | null>(null);

export function ProviderModelsProvider({
  providerId,
  children,
}: {
  readonly providerId: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const [open, setOpen] = useDialogState<ProviderModelsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ProviderModel | null>(null);
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await listProviderModels({ provider_id: providerId });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      setModels(res.data.data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ProviderModelsContext
      value={{
        providerId,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        models,
        loading,
        error,
        loadModels: load,
      }}
    >
      {children}
    </ProviderModelsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProviderModelsContext = (): ProviderModelsContextType => {
  const ctx = React.useContext(ProviderModelsContext);
  if (!ctx) {
    throw new Error('useProviderModelsContext must be used within <ProviderModelsProvider>');
  }
  return ctx;
};
