import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { useVirtualModels, VirtualModelsProvider } from './virtual-models-context';
import { VirtualModelsDialogs } from './virtual-models-dialogs';
import { VirtualModelsPrimaryButtons } from './virtual-models-primary-buttons';
import { VirtualModelsTable } from './virtual-models-table';

function VirtualModelsContent(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('modelsPage.virtualModels.title', 'Virtual Models'));
  const { error } = useVirtualModels();

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('modelsPage.virtualModels.title', 'Virtual Models')}</h2>
          <p className="text-muted-foreground">
            {t('modelsPage.virtualModels.desc', 'Manage and configure internally mapped virtual models.')}
          </p>
        </div>
        <VirtualModelsPrimaryButtons />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <VirtualModelsTable />
    </Main>
  );
}

export function ModelVirtualModelsPage(): React.JSX.Element {
  return (
    <VirtualModelsProvider>
      <VirtualModelsContent />
      <VirtualModelsDialogs />
    </VirtualModelsProvider>
  );
}
