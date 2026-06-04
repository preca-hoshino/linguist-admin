import { CrudPageLayout } from '@/components/crud-table';
import { UsersProvider, useUsers } from './users-context';
import { UsersDialogs } from './users-dialogs';
import { UsersPrimaryButtons } from './users-primary-buttons';
import { UsersTable } from './users-table';

function UsersContent(): React.JSX.Element {
  const { error } = useUsers();

  return (
    <CrudPageLayout
      titleKey="users.title"
      titleFallback="User Management"
      descKey="users.desc"
      descFallback="Manage system users and permissions."
      primaryButton={<UsersPrimaryButtons />}
      error={error}
    >
      <UsersTable />
    </CrudPageLayout>
  );
}

export function UsersPage(): React.JSX.Element {
  return (
    <UsersProvider>
      <UsersContent />
      <UsersDialogs />
    </UsersProvider>
  );
}
