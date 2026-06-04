import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProviderModels } from '@/api/model/provider-models';
import { listProviders } from '@/api/model/providers';
import { CrudTable } from '@/components/crud-table';
import { useProviderModelsColumns } from './provider-models-columns';
import { useProviderModels } from './provider-models-context';

export function ProviderModelsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useProviderModelsColumns();
  const ctx = useProviderModels();

  // 动态生成筛选选项（通过独立请求获取全量列表）
  const [modelTypeOptions, setModelTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [providerOptions, setProviderOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    listProviders({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          setProviderOptions(res.data.data.map((p) => ({ label: p.name, value: p.id })));
        }
      })
      // biome-ignore lint/suspicious/noEmptyBlockStatements: best-effort fetch
      .catch(() => {});
    listProviderModels({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          const types = [...new Set(res.data.data.map((m) => m.model_type))];
          setModelTypeOptions(types.map((k) => ({ label: k, value: k })));
        }
      })
      // biome-ignore lint/suspicious/noEmptyBlockStatements: best-effort fetch
      .catch(() => {});
  }, []);

  return (
    <CrudTable
      dataState={ctx}
      dialogState={ctx}
      columns={columns}
      searchPlaceholder={t('modelsPage.providerModels.searchPlaceholder', 'Filter provider models...')}
      filters={[
        {
          columnId: 'model_type',
          title: t('modelsPage.providerModels.type', 'Type'),
          options: modelTypeOptions,
        },
        {
          columnId: 'provider_id',
          title: t('modelsPage.providerModels.provider', 'Provider'),
          options: providerOptions,
        },
      ]}
      permissionModule="models"
      batchDeleteDialogType="batch-delete"
      emptyText={t('modelsPage.providerModels.empty', 'No provider models found')}
      entityName={t('modelsPage.providerModels.entityName', 'model')}
    />
  );
}
