import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/stores/permission-store';
import { useVirtualMcps } from './virtual-mcps-context';

export function VirtualMcpsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setDialogState } = useVirtualMcps();
  const canEdit = usePermission('mcp', 'edit');

  return (
    <Button
      disabled={!canEdit}
      onClick={() => {
        setDialogState((prev) => ({ ...prev, createOpen: true }));
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('mcpsPage.virtualMcps.create', 'Add Virtual MCP')}
    </Button>
  );
}
