import { listVirtualModels } from '@/api/model/virtual-models';
import { createCrudContext } from '@/composables/create-crud-context';
import type { VirtualModel } from '@/types';
import { extractFilterValue } from '@/utils/table';

export type VirtualModelsDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

// eslint-disable-next-line react-refresh/only-export-components
export const virtualModelsCrud = createCrudContext<VirtualModel, VirtualModelsDialogType>({
  displayName: 'VirtualModelsContext',
  fetchList: listVirtualModels,
  buildParams: ({ pagination, search, columnFilters }) => ({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: search || undefined,
    model_type: extractFilterValue(columnFilters, 'model_type'),
    routing_strategy: extractFilterValue(columnFilters, 'routing_strategy'),
    is_active: extractFilterValue(columnFilters, 'is_active'),
    expand: 'backends',
  }),
  defaultPageSize: 10,
});

/** 向后兼容：Provider */
export const VirtualModelsProvider = virtualModelsCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useVirtualModels(): ReturnType<typeof virtualModelsCrud.useContext> {
  return virtualModelsCrud.useContext();
}
