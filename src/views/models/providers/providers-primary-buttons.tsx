import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/stores/permission-store';
import { useProviders } from './providers-context';

export function ProvidersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useProviders();
  const canEdit = usePermission('models', 'edit');

  return (
    <Button
      className="space-x-1"
      disabled={!canEdit}
      onClick={() => {
        setOpen('create');
      }}
    >
      <Plus className="h-4 w-4" />
      <span>{t('modelsPage.providers.create', 'New Provider')}</span>
    </Button>
  );
}
