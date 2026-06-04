import { CrudPageLayout } from '@/components/crud-table';
import { LogsProvider, useLogs } from './logs-context';
import { LogsDialogs } from './logs-dialogs';
import { LogsTable } from './logs-table';

function LogsContent(): React.JSX.Element {
  const { error } = useLogs();

  return (
    <CrudPageLayout
      titleKey="modelsPage.logs.title"
      titleFallback="Model Logs"
      descKey="modelsPage.logs.desc"
      descFallback="View all LLM request logs processed by the gateway."
      error={error}
    >
      <LogsTable />
    </CrudPageLayout>
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
