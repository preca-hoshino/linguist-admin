import { useTranslation } from 'react-i18next';
import { CreateButton } from '@/components/crud-table';
import { useVirtualModels } from './virtual-models-context';

export function VirtualModelsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useVirtualModels();

  return (
    <div className="flex items-center gap-2">
      <CreateButton
        module="models"
        label={t('modelsPage.virtualModels.create', 'New Virtual Model')}
        onClick={() => {
          setCurrentRow(null);
          setOpen('create');
        }}
      />
    </div>
  );
}
