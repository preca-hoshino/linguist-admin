import { useTranslation } from 'react-i18next';
import { CreateButton } from '@/components/crud-table';
import { useUsers } from './users-context';

export function UsersPrimaryButtons(): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useUsers();

  return (
    <div className="flex gap-2">
      <CreateButton
        module="users"
        label={t('users.create', 'New User')}
        onClick={() => {
          setCurrentRow(null);
          setOpen('create');
        }}
      />
    </div>
  );
}
