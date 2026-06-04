import { CrudPageLayout } from '@/components/crud-table';
import { ProvidersProvider, useProviders } from './providers-context';
import { ProvidersDialogs } from './providers-dialogs';
import { ProvidersPrimaryButtons } from './providers-primary-buttons';
import { ProvidersTable } from './providers-table';

function ProvidersContent(): React.JSX.Element {
  const { error } = useProviders();

  return (
    <CrudPageLayout
      titleKey="modelsPage.providers.title"
      titleFallback="Model Providers"
      descKey="modelsPage.providers.desc"
      descFallback="Configure and manage LLM model providers."
      primaryButton={<ProvidersPrimaryButtons />}
      error={error}
    >
      <ProvidersTable />
    </CrudPageLayout>
  );
}

export function ModelProvidersPage(): React.JSX.Element {
  return (
    <ProvidersProvider>
      <ProvidersContent />
      <ProvidersDialogs />
    </ProvidersProvider>
  );
}
