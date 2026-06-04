import { listMcpLogs } from '@/api/mcp/logs';
import { createCrudContext } from '@/composables/create-crud-context';
import type { McpLog } from '@/types/mcp';
import { extractFilterValue } from '@/utils/table';

export type McpLogsDialogType = 'delete' | 'batch-delete' | 'detail';

// eslint-disable-next-line react-refresh/only-export-components
export const mcpLogsCrud = createCrudContext<McpLog, McpLogsDialogType>({
  displayName: 'McpLogsContext',
  fetchList: listMcpLogs,
  buildParams: ({ pagination, search, columnFilters }) => {
    const methodFilter = extractFilterValue(columnFilters, 'method');
    const providerIdFilter = extractFilterValue(columnFilters, 'mcp_provider_id');
    const virtualIdFilter = extractFilterValue(columnFilters, 'virtual_mcp_id');

    const raw: Record<string, unknown> = {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      search: search || undefined,
      method: methodFilter,
      mcp_provider_id: providerIdFilter,
      virtual_mcp_id: virtualIdFilter,
    };
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined && v !== ''));
  },
  defaultPageSize: 20,
});

/** 向后兼容：Provider */
export const McpLogsProvider = mcpLogsCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useMcpLogs(): ReturnType<typeof mcpLogsCrud.useContext> {
  return mcpLogsCrud.useContext();
}
