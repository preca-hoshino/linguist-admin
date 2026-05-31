import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useVirtualMcps } from './virtual-mcps-context';

export function VirtualMcpsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setDialogState } = useVirtualMcps();

  return (
    <PermissionGuard module="mcp" level="edit">
      <Button
        onClick={() => {
          setDialogState((prev) => ({ ...prev, createOpen: true }));
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('mcpsPage.virtualMcps.create', 'Add Virtual MCP')}
      </Button>
    </PermissionGuard>
  );
}
