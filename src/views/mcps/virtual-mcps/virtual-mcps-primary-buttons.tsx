import { useTranslation } from 'react-i18next';
import { CreateButton } from '@/components/crud-table';
import { useVirtualMcps } from './virtual-mcps-context';

export function VirtualMcpsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useVirtualMcps();

  return (
    <CreateButton
      module="mcp"
      onClick={() => {
        setOpen('create');
      }}
      label={t('mcpsPage.virtualMcps.create', 'Add Virtual MCP')}
    />
  );
}
