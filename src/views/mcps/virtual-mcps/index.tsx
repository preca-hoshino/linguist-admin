import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { VirtualMcpsProvider, useVirtualMcps } from './virtual-mcps-context';
import { VirtualMcpsDialogs } from './virtual-mcps-dialogs';
import { VirtualMcpsTable } from './virtual-mcps-table';
import { VirtualMcpsPrimaryButtons } from './virtual-mcps-primary-buttons';

function McpVirtualMcpsContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('mcpsPage.virtualMcps.title', 'Virtual MCPs'));
  const { error } = useVirtualMcps();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('mcpsPage.virtualMcps.title', 'Virtual MCPs')}</h2>
          <p className="text-muted-foreground">
            {t('mcpsPage.virtualMcps.desc', 'Manage virtual MCP server aggregation and tool filtering.')}
          </p>
        </div>
        <VirtualMcpsPrimaryButtons />
      </div>

      {error != null && error !== '' ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <VirtualMcpsTable />
    </Main>
  );
}

export function McpVirtualMcpsPage(): React.JSX.Element {
  return (
    <VirtualMcpsProvider>
      <McpVirtualMcpsContent />
      <VirtualMcpsDialogs />
    </VirtualMcpsProvider>
  );
}
