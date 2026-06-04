import { useTranslation } from 'react-i18next';
import { CrudPageLayout } from '@/components/crud-table';
import { AppsProvider, useApps } from './apps-context';
import { AppsDialogs } from './apps-dialogs';
import { AppsPrimaryButtons } from './apps-primary-buttons';
import { AppsTable } from './apps-table';

function AppsContent(): React.JSX.Element {
  const { t } = useTranslation();
  const { error } = useApps();

  return (
    <CrudPageLayout
      titleKey="apps.title"
      titleFallback="Applications"
      descKey="apps.desc"
      descFallback="Manage your applications and their nested API Keys."
      primaryButton={<AppsPrimaryButtons />}
      error={error}
    >
      <AppsTable />
    </CrudPageLayout>
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
