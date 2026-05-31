import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/stores/permission-store';
import { useUsers } from './users-context';

export function UsersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useUsers();
  const canEdit = usePermission('users', 'edit');

  return (
    <div className="flex gap-2">
      <Button
        disabled={!canEdit}
        onClick={() => {
          setCurrentRow(null);
          setOpen('create');
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('users.create', 'New User')}
      </Button>
    </div>
  );
}
