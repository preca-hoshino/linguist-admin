import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviders } from '@/api/model/providers';
import { CrudTable } from '@/components/crud-table';
import { useProvidersColumns } from './providers-columns';
import { useProviders } from './providers-context';

export function ProvidersTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useProvidersColumns();
  const ctx = useProviders();

  // 动态生成 kind 筛选选项（通过独立请求获取全量 kind 列表）
  const [kindOptions, setKindOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    listProviders({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          const kinds = [...new Set(res.data.data.map((p) => p.kind))];
          setKindOptions(kinds.map((k) => ({ label: k, value: k })));
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  return (
    <CrudTable
      dataState={ctx}
      dialogState={ctx}
      columns={columns}
      searchPlaceholder={t('modelsPage.providers.searchPlaceholder', 'Search providers...')}
      filters={[
        {
          columnId: 'kind',
          title: t('modelsPage.providers.kind', 'Kind'),
          options: kindOptions,
        },
      ]}
      permissionModule="models"
      batchDeleteDialogType="batch-delete"
      emptyText={t('modelsPage.providers.empty', 'No providers found')}
      entityName={t('modelsPage.providers.entityName', 'provider')}
    />
  );
}
