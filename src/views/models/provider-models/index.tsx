import { CrudPageLayout } from '@/components/crud-table';
import { ProviderModelsProvider, useProviderModels } from './provider-models-context';
import { ProviderModelsDialogs } from './provider-models-dialogs';
import { ProviderModelsPrimaryButtons } from './provider-models-primary-buttons';
import { ProviderModelsTable } from './provider-models-table';

function ProviderModelsContent(): React.JSX.Element {
  const { error } = useProviderModels();

  return (
    <CrudPageLayout
      titleKey="modelsPage.providerModels.title"
      titleFallback="Provider Models"
      descKey="modelsPage.providerModels.desc"
      descFallback="View and manage all models provided by your config API keys."
      primaryButton={<ProviderModelsPrimaryButtons />}
      error={error}
    >
      <ProviderModelsTable />
    </CrudPageLayout>
  );
}

export function ModelProviderModelsPage(): React.JSX.Element {
  return (
    <ProviderModelsProvider>
      <ProviderModelsContent />
      <ProviderModelsDialogs />
    </ProviderModelsProvider>
  );
}
