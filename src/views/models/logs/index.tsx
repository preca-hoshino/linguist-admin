import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { LogsProvider, useLogs } from './logs-context';
import { LogsDialogs } from './logs-dialogs';
import { LogsTable } from './logs-table';

function LogsContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('modelsPage.logs.title', 'Model Logs'));
  const { error } = useLogs();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('modelsPage.logs.title', 'Model Logs')}</h2>
          <p className="text-muted-foreground">
            {t('modelsPage.logs.desc', 'View all LLM request logs processed by the gateway.')}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <LogsTable />
    </Main>
  );
}

export function ModelLogsPage(): React.JSX.Element {
  return (
    <LogsProvider>
      <LogsContent />
      <LogsDialogs />
    </LogsProvider>
  );
}
