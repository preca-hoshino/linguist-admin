import { useTranslation } from 'react-i18next';
import { CreateButton } from '@/components/crud-table';
import { useProviders } from './providers-context';

export function ProvidersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useProviders();

  return (
    <div className="flex gap-2">
      <CreateButton
        module="models"
        label={t('modelsPage.providers.create', 'New Provider')}
        onClick={() => {
          setCurrentRow(null);
          setOpen('create');
        }}
      />
    </div>
  );
}
