import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useProviders } from './providers-context';

export function ProvidersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useProviders();

  return (
    <PermissionGuard module="models" level="edit">
      <Button
        className="space-x-1"
        onClick={() => {
          setOpen('create');
        }}
      >
        <Plus className="h-4 w-4" />
        <span>{t('modelsPage.providers.create', 'New Provider')}</span>
      </Button>
    </PermissionGuard>
  );
}
