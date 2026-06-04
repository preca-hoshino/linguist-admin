import { CrudPageLayout } from '@/components/crud-table';
import { ProvidersProvider, useProviders } from './providers-context';
import { ProvidersDialogs } from './providers-dialogs';
import { ProvidersPrimaryButtons } from './providers-primary-buttons';
import { ProvidersTable } from './providers-table';

function ProvidersContent(): React.JSX.Element {
  const { error } = useProviders();

  return (
    <CrudPageLayout
      titleKey="mcpsPage.providers.title"
      titleFallback="MCP Providers"
      descKey="mcpsPage.providers.desc"
      descFallback="Configure and manage MCP providers like local stdio commands or HTTP SSE endpoints."
      primaryButton={<ProvidersPrimaryButtons />}
      error={error}
    >
      <ProvidersTable />
    </CrudPageLayout>
  );
}

export function McpProvidersPage(): React.JSX.Element {
  return (
    <ProvidersProvider>
      <ProvidersContent />
      <ProvidersDialogs />
    </ProvidersProvider>
  );
}
