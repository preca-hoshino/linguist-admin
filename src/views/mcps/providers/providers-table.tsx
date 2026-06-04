import { useTranslation } from 'react-i18next';
import { CrudTable } from '@/components/crud-table';
import { getProvidersColumns } from './providers-columns';
import { useProviders } from './providers-context';

export function ProvidersTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = getProvidersColumns(t);
  const ctx = useProviders();

  return (
    <CrudTable
      dataState={ctx}
      dialogState={ctx}
      columns={columns}
      searchPlaceholder={t('mcpsPage.providers.searchPlaceholder', 'Search providers...')}
      filters={[
        {
          columnId: 'kind',
          title: t('mcpsPage.providers.transportType', 'Transport'),
          options: [
            { label: 'HTTP', value: 'streamable_http' },
            { label: 'STDIO', value: 'stdio' },
          ],
        },
      ]}
      permissionModule="mcp"
      batchDeleteDialogType="batch-delete"
      emptyText={t('mcpsPage.providers.noData', 'No MCP providers found.')}
      entityName={t('mcpsPage.providers.entityName', 'provider')}
    />
  );
}
