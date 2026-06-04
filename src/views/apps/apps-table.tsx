import { useTranslation } from 'react-i18next';
import { CrudTable } from '@/components/crud-table';
import { useAppsColumns } from './apps-columns';
import { useApps } from './apps-context';

export function AppsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useAppsColumns();
  const ctx = useApps();

  return (
    <CrudTable
      dataState={ctx}
      dialogState={ctx}
      columns={columns}
      searchPlaceholder={t('apps.searchPlaceholder', 'Search apps by name...')}
      filters={[
        {
          columnId: 'is_active',
          title: t('common.status', 'Status'),
          options: [
            { label: t('apps.active', 'Active'), value: 'true' },
            { label: t('apps.inactive', 'Inactive'), value: 'false' },
          ],
        },
      ]}
      permissionModule="apps"
      batchDeleteDialogType="batch-delete"
      emptyText={t('apps.empty', 'No applications found')}
      entityName={t('apps.entityName', 'app')}
    />
  );
}
