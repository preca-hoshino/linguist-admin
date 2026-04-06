import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { ProviderModelsProvider, useProviderModels } from './provider-models-context';
import { ProviderModelsDialogs } from './provider-models-dialogs';
import { ProviderModelsPrimaryButtons } from './provider-models-primary-buttons';
import { ProviderModelsTable } from './provider-models-table';

function ProviderModelsContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('modelsPage.providerModels.title', 'Provider Models'));
  const { error } = useProviderModels();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('modelsPage.providerModels.title', 'Provider Models')}
          </h2>
          <p className="text-muted-foreground">
            {t('modelsPage.providerModels.desc', 'View and manage all models provided by your config API keys.')}
          </p>
        </div>
        <ProviderModelsPrimaryButtons />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <ProviderModelsTable />
    </Main>
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
