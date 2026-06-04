import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listVirtualModels } from '@/api/model/virtual-models';
import { CrudTable } from '@/components/crud-table';
import { useVirtualModelsColumns } from './virtual-models-columns';
import { useVirtualModels } from './virtual-models-context';

export function VirtualModelsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const columns = useVirtualModelsColumns();
  const ctx = useVirtualModels();

  const [modelTypeOptions, setModelTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [strategyOptions, setStrategyOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    listVirtualModels({ limit: 500 })
      .then((res) => {
        if (res.ok) {
          const types = [...new Set(res.data.data.map((vm) => vm.model_type))];
          setModelTypeOptions(types.map((k) => ({ label: k, value: k })));
          const strategies = [...new Set(res.data.data.map((vm) => vm.routing_strategy))];
          setStrategyOptions(strategies.map((k) => ({ label: k, value: k })));
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
      searchPlaceholder={t('modelsPage.virtualModels.searchPlaceholder', 'Search virtual models...')}
      filters={[
        {
          columnId: 'model_type',
          title: t('modelsPage.virtualModels.modelType', 'Model Type'),
          options: modelTypeOptions,
        },
        {
          columnId: 'routing_strategy',
          title: t('modelsPage.virtualModels.routingStrategy', 'Routing Strategy'),
          options: strategyOptions,
        },
        {
          columnId: 'is_active',
          title: t('common.status', 'Status'),
          options: [
            { label: t('common.active', 'Active'), value: 'true' },
            { label: t('common.inactive', 'Inactive'), value: 'false' },
          ],
        },
      ]}
      permissionModule="models"
      batchDeleteDialogType="batch-delete"
      emptyText={t('modelsPage.virtualModels.empty', 'No virtual models found')}
      entityName={t('modelsPage.virtualModels.entityName', 'virtual model')}
    />
  );
}
