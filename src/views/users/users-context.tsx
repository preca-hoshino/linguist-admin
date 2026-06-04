import { fetchUsers, type User } from '@/api/users';
import { createCrudContext } from '@/composables/create-crud-context';
import { extractFilterValue } from '@/utils/table';

export type UsersDialogType = 'create' | 'update' | 'delete' | 'batch-delete';

// eslint-disable-next-line react-refresh/only-export-components
export const usersCrud = createCrudContext<User, UsersDialogType>({
  displayName: 'UsersContext',
  fetchList: fetchUsers,
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
export const UsersProvider = usersCrud.Provider;

/** 向后兼容：Hook */
// eslint-disable-next-line react-refresh/only-export-components
export function useUsers(): ReturnType<typeof usersCrud.useContext> {
  return usersCrud.useContext();
}
