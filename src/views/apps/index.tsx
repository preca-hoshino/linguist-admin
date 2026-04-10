import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { AppsProvider, useApps } from './apps-context';
import { AppsDialogs } from './apps-dialogs';
import { AppsPrimaryButtons } from './apps-primary-buttons';
import { AppsTable } from './apps-table';

function AppsContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('apps.title', 'Applications'));
  const { error } = useApps();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('apps.title', 'Applications')}</h2>
          <p className="text-muted-foreground">
            {t('apps.desc', 'Manage your applications and their nested API Keys.')}
          </p>
        </div>
        <AppsPrimaryButtons />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <AppsTable />
    </Main>
  );
}

export function AppsPage(): React.JSX.Element {
  return (
    <AppsProvider>
      <AppsContent />
      <AppsDialogs />
    </AppsProvider>
  );
}
