import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/stores/permission-store';
import { useVirtualModels } from './virtual-models-context';

export function VirtualModelsPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen } = useVirtualModels();
  const canEdit = usePermission('models', 'edit');

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => {
          setOpen('create');
        }}
        disabled={!canEdit}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        {t('modelsPage.virtualModels.create', 'New Virtual Model')}
      </Button>
    </div>
  );
}
