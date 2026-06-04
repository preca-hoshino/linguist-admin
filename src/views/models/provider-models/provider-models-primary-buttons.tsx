import { useTranslation } from 'react-i18next';
import { CreateButton } from '@/components/crud-table';
import { useProviderModels } from './provider-models-context';

export function ProviderModelsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useProviderModels();

  return (
    <CreateButton
      module="models"
      onClick={() => {
        setOpen('create');
      }}
      label={t('modelsPage.providerModels.create', 'New Model')}
    />
  );
}
