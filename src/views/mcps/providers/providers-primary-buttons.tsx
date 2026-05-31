import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/stores/permission-store';
import { useProviders } from './providers-context';

export function ProvidersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setDialogState } = useProviders();
  const canEdit = usePermission('mcp', 'edit');

  return (
    <Button
      disabled={!canEdit}
      onClick={() => {
        setDialogState((prev) => ({ ...prev, createOpen: true }));
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('mcpsPage.providers.create', 'Add MCP Provider')}
    </Button>
  );
}
