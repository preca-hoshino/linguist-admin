import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { listProviderModels } from '@/api/model/provider-models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ProviderModel } from '@/types';
import { cn } from '@/utils/utils';
import { ModelIdentityBlock } from './ModelIdentityBlock';

interface ModelSearchPaletteProps {
  readonly selectedIds: Set<string>;
  readonly onAdd: (model: ProviderModel) => void;
  readonly t: TFunction<'translation', undefined>;
}

export function ModelSearchPalette({ selectedIds, onAdd, t }: ModelSearchPaletteProps): React.JSX.Element {
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // 防抖 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery);
      if (rawQuery.trim() !== '') {
        setHasSearched(true);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [rawQuery]);

  const handleClear = () => {
    setRawQuery('');
    setDebouncedQuery('');
    setHasSearched(false);
  };

  // 搜索：始终拉取（空 query 时展示前 30 条默认模型，有 query 时按搜索词筛选）
  const {
    data: searchResults = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['provider-models-search', debouncedQuery],
    queryFn: async () => {
      const params: { limit: number; search?: string } = { limit: 30 };
      if (debouncedQuery.trim() !== '') {
        params.search = debouncedQuery.trim();
      }
      const res = await listProviderModels(params);
      if (!res.ok) {
        throw new Error('Failed to search provider models');
      }
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const hasActiveSearch = debouncedQuery.trim() !== '';

  return (
    <div className="flex flex-col">
      {/* 搜索框 */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={rawQuery}
          onChange={(e) => {
            setRawQuery(e.target.value);
          }}
          placeholder={t('modelsPage.virtualModels.backendSearchPlaceholder', 'Search provider models...')}
          className="h-9 pl-9 pr-8 text-sm"
        />
        {rawQuery !== '' && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 结果区域 */}
      <div className="mt-2 max-h-[240px] min-h-[60px] overflow-y-auto rounded-md border border-border/60">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {hasActiveSearch
              ? t('modelsPage.virtualModels.backendSearchLoading', 'Searching...')
              : t('common.loading', 'Loading...')}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
            <span>{t('modelsPage.virtualModels.backendSearchNoResult', 'No matching provider models found')}</span>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              {t('common.retry', 'Retry')}
            </Button>
          </div>
        ) : hasActiveSearch && hasSearched && searchResults.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('modelsPage.virtualModels.backendSearchNoResult', 'No matching provider models found')}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {t('modelsPage.virtualModels.backendSearchNoResult', 'No models available')}
          </div>
        ) : (
          <div className="space-y-0.5 p-1">
            {searchResults.map((model) => {
              const isSelected = selectedIds.has(model.id);
              return (
                <div
                  key={model.id}
                  className={cn(
                    'flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5 shadow-sm transition-all hover:border-border hover:shadow-md',
                    isSelected && 'opacity-60',
                  )}
                >
                  <ModelIdentityBlock
                    modelName={model.name}
                    providerName={model.provider_name ?? model.provider_id}
                    providerKind={model.provider_kind ?? model.provider_id}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? 'secondary' : 'outline'}
                    disabled={isSelected}
                    className="h-7 shrink-0 px-2.5 text-xs"
                    onClick={() => {
                      onAdd(model);
                    }}
                  >
                    <Plus className={cn('mr-1 h-3 w-3', isSelected && 'hidden')} />
                    {isSelected
                      ? t('modelsPage.virtualModels.backendAdded', 'Added')
                      : t('modelsPage.virtualModels.backendAddModel', 'Add')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
