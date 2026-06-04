import { listProviders } from '@/api/model/providers';
import { createCrudContext } from '@/composables/create-crud-context';
import type { Provider } from '@/types';
import { extractFilterValue } from '@/utils/table';

export type ProvidersDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

// eslint-disable-next-line react-refresh/only-export-components
export const providersCrud = createCrudContext<Provider, ProvidersDialogType>({
  displayName: 'ProvidersContext',
  fetchList: listProviders,
  buildParams: ({ pagination, search, columnFilters }) => ({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: search || undefined,
    kind: extractFilterValue(columnFilters, 'kind'),
  }),
  defaultPageSize: 10,
});

/** 向后兼容：Provider */
export const ProvidersProvider = providersCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useProviders(): ReturnType<typeof providersCrud.useContext> {
  return providersCrud.useContext();
}
