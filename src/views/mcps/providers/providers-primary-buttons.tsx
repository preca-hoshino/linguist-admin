import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useProviders } from './providers-context';

export function ProvidersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setDialogState } = useProviders();

  return (
    <PermissionGuard module="mcp" level="edit">
      <Button
        onClick={() => {
          setDialogState((prev) => ({ ...prev, createOpen: true }));
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('mcpsPage.providers.create', 'Add MCP Provider')}
      </Button>
    </PermissionGuard>
  );
}
