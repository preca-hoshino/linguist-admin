import { listRequestLogs } from '@/api/model/logs';
import { createCrudContext } from '@/composables/create-crud-context';
import type { RequestLog } from '@/types';
import { extractFilterValue } from '@/utils/table';

export type LogsDialogType = 'delete' | 'batch-delete';

function getIsStreamApiValue(val?: string): string | undefined {
  if (val === 'stream') {
    return 'true';
  }
  if (val === 'unary' || val === 'non-stream') {
    return 'false';
  }
  return undefined;
}

// eslint-disable-next-line react-refresh/only-export-components
export const logsCrud = createCrudContext<RequestLog, LogsDialogType>({
  displayName: 'LogsContext',
  fetchList: listRequestLogs,
  buildParams: ({ pagination, search, columnFilters }) => {
    const statusFilter = extractFilterValue(columnFilters, 'status');
    const providerKindFilter = extractFilterValue(columnFilters, 'provider_kind');
    const providerIdFilter = extractFilterValue(columnFilters, 'provider_id');
    const keyPrefixFilter = extractFilterValue(columnFilters, 'api_key');
    const sourceFilter = extractFilterValue(columnFilters, 'source');
    const isStreamFilter = extractFilterValue(columnFilters, 'mode');
    const appIdFilter = extractFilterValue(columnFilters, 'app_id');

    const raw: Record<string, unknown> = {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      request_model: search || undefined,
      status: statusFilter,
      provider_kind: providerKindFilter,
      provider_id: providerIdFilter,
      api_key_prefix: keyPrefixFilter?.trim(),
      user_format: sourceFilter,
      is_stream: isStreamFilter === undefined ? undefined : getIsStreamApiValue(isStreamFilter),
      app_id: appIdFilter,
    };
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined && v !== ''));
  },
  defaultPageSize: 10,
});

/** 向后兼容：Provider */
export const LogsProvider = logsCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useLogs(): ReturnType<typeof logsCrud.useContext> {
  return logsCrud.useContext();
}
