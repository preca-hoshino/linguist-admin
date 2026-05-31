import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { UsersProvider, useUsers } from './users-context';
import { UsersDialogs } from './users-dialogs';
import { UsersPrimaryButtons } from './users-primary-buttons';
import { UsersTable } from './users-table';

function UsersContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('users.title', 'User Management'));
  const { error } = useUsers();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('users.title', 'User Management')}</h2>
          <p className="text-muted-foreground">
            {t('users.desc', 'Manage system users and permissions.')}
          </p>
        </div>
        <UsersPrimaryButtons />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <UsersTable />
    </Main>
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
