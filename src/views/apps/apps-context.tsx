import { listApps } from '@/api/apps';
import { createCrudContext } from '@/composables/create-crud-context';
import type { App } from '@/types/app';
import { extractFilterValue } from '@/utils/table';

export type AppsDialogType = 'create' | 'update' | 'delete' | 'rotate' | 'batch-delete';

// eslint-disable-next-line react-refresh/only-export-components
export const appsCrud = createCrudContext<App, AppsDialogType>({
  displayName: 'AppsContext',
  fetchList: listApps,
  buildParams: ({ pagination, search, columnFilters }) => {
    const statusFilter = extractFilterValue(columnFilters, 'is_active');
    const params: Record<string, unknown> = {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      search: search || undefined,
    };
    if (statusFilter === 'true' || statusFilter === 'false') {
      params.is_active = statusFilter === 'true';
    }
    return params;
  },
  defaultPageSize: 10,
});

/** 向后兼容：Provider */
export const AppsProvider = appsCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useApps(): ReturnType<typeof appsCrud.useContext> {
  return appsCrud.useContext();
}
