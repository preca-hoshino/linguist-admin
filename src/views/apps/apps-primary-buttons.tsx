import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useApps } from './apps-context';

export function AppsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useApps();

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          setCurrentRow(null);
          setOpen('create');
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('apps.create', 'Create App')}
      </Button>
    </div>
  );
}
