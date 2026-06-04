import { listProviderModels } from '@/api/model/provider-models';
import { createCrudContext } from '@/composables/create-crud-context';
import type { ProviderModel } from '@/types';
import { extractFilterValue } from '@/utils/table';

export type ProviderModelsDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

// eslint-disable-next-line react-refresh/only-export-components
export const providerModelsCrud = createCrudContext<ProviderModel, ProviderModelsDialogType>({
  displayName: 'ProviderModelsContext',
  fetchList: listProviderModels,
  buildParams: ({ pagination, search, columnFilters }) => {
    const modelType = extractFilterValue(columnFilters, 'model_type');
    const providerId = extractFilterValue(columnFilters, 'provider_id');
    const isActive = extractFilterValue(columnFilters, 'is_active');
    const params: Record<string, unknown> = {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      search: search || undefined,
    };
    if (modelType !== undefined) {
      params.model_type = modelType;
    }
    if (providerId !== undefined) {
      params.provider_id = providerId;
    }
    if (isActive !== undefined) {
      params.is_active = isActive === 'true';
    }
    return params;
  },
  defaultPageSize: 10,
});

/** 向后兼容：Provider */
export const ProviderModelsProvider = providerModelsCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useProviderModels(): ReturnType<typeof providerModelsCrud.useContext> {
  return providerModelsCrud.useContext();
}
