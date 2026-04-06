import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useProviderModels } from './provider-models-context';

export function ProviderModelsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useProviderModels();

  return (
    <Button
      className="space-x-1"
      onClick={() => {
        setOpen('create');
      }}
    >
      <Plus className="h-4 w-4" />
      <span>{t('modelsPage.providerModels.create', 'New Model')}</span>
    </Button>
  );
}
