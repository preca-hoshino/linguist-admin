import { useTranslation } from 'react-i18next';
import { CrudTable } from '@/components/crud-table';
import { useUsersColumns } from './users-columns';
import { useUsers } from './users-context';

export function UsersTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useUsersColumns();
  const ctx = useUsers();

  return (
    <CrudTable
      dataState={ctx}
      dialogState={ctx}
      columns={columns}
      searchPlaceholder={t('users.searchPlaceholder', 'Search users...')}
      filters={[
        {
          columnId: 'is_active',
          title: t('common.status', 'Status'),
          options: [
            { label: t('common.active', 'Active'), value: 'true' },
            { label: t('common.inactive', 'Inactive'), value: 'false' },
          ],
        },
      ]}
      permissionModule="users"
      batchDeleteDialogType="batch-delete"
      emptyText={t('users.empty', 'No users found')}
      entityName={t('users.entityName', 'user')}
    />
  );
}
