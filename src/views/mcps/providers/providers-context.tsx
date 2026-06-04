import { listMcpProviders } from '@/api/mcp/provider-mcps';
import { createCrudContext } from '@/composables/create-crud-context';
import type { McpProvider } from '@/types/mcp';
import { extractFilterValue } from '@/utils/table';

export type ProvidersDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

// eslint-disable-next-line react-refresh/only-export-components
export const providersCrud = createCrudContext<McpProvider, ProvidersDialogType>({
  displayName: 'ProvidersContext',
  fetchList: listMcpProviders,
  buildParams: ({ pagination, search, columnFilters }) => {
    const kindFilter = extractFilterValue(columnFilters, 'kind');
    return {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      search: search || undefined,
      kind: kindFilter,
    };
  },
  defaultPageSize: 10,
});

/** 向后兼容：Provider */
export const ProvidersProvider = providersCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useProviders(): ReturnType<typeof providersCrud.useContext> {
  return providersCrud.useContext();
}
