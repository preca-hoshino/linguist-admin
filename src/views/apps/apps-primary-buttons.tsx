import { useTranslation } from 'react-i18next';
import { CreateButton } from '@/components/crud-table';
import { useApps } from './apps-context';

export function AppsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useApps();

  return (
    <div className="flex gap-2">
      <CreateButton
        module="apps"
        label={t('apps.create', 'Create App')}
        onClick={() => {
          setCurrentRow(null);
          setOpen('create');
        }}
      />
    </div>
  );
}
