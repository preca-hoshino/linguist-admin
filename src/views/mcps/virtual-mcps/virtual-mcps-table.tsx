import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { listMcpProviders } from '@/api/mcp/provider-mcps';
import { updateVirtualMcp } from '@/api/mcp/virtual-mcps';
import { CrudTable } from '@/components/crud-table';
import { getVirtualMcpsColumns } from './virtual-mcps-columns';
import { useVirtualMcps } from './virtual-mcps-context';

export function VirtualMcpsTable(): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = useVirtualMcps();
  const { loadData } = ctx;

  const [providerMap, setProviderMap] = useState<Record<string, string>>({});
  const [providerOptions, setProviderOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    void listMcpProviders({ limit: 100 }).then((res) => {
      if (res.ok) {
        const map: Record<string, string> = {};
        const options: { label: string; value: string }[] = [];
        for (const p of res.data.data) {
          map[p.id] = p.name;
          options.push({ label: p.name || p.id, value: p.id });
        }
        setProviderMap(map);
        setProviderOptions(options);
      }
    });
  }, []);

  const onToggleActive = async (id: string, current: boolean): Promise<void> => {
    const res = await updateVirtualMcp(id, { is_active: !current });
    if (res.ok) {
      toast.success(
        current
          ? t('mcpsPage.virtualMcps.disabledSuccess', 'Virtual MCP disabled')
          : t('mcpsPage.virtualMcps.enabledSuccess', 'Virtual MCP enabled'),
      );
      await loadData();
    }
  };

  const columns = getVirtualMcpsColumns(t, onToggleActive, providerMap);

  return (
    <CrudTable
      dataState={ctx}
      dialogState={ctx}
      columns={columns}
      searchPlaceholder={t('mcpsPage.virtualMcps.searchPlaceholder', 'Search virtual servers...')}
      filters={[
        {
          columnId: 'mcp_provider_id',
          title: t('mcpsPage.virtualMcps.backendProvider', 'Provider'),
          options: providerOptions,
        },
      ]}
      permissionModule="mcp"
      batchDeleteDialogType="batch-delete"
      emptyText={t('mcpsPage.virtualMcps.noData', 'No virtual MCP servers found.')}
      entityName={t('mcpsPage.virtualMcps.entityName', 'server')}
    />
  );
}
