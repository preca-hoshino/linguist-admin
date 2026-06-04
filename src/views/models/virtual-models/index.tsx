import { CrudPageLayout } from '@/components/crud-table';
import { useVirtualModels, VirtualModelsProvider } from './virtual-models-context';
import { VirtualModelsDialogs } from './virtual-models-dialogs';
import { VirtualModelsPrimaryButtons } from './virtual-models-primary-buttons';
import { VirtualModelsTable } from './virtual-models-table';

function VirtualModelsContent(): React.JSX.Element {
  const { error } = useVirtualModels();

  return (
    <CrudPageLayout
      titleKey="modelsPage.virtualModels.title"
      titleFallback="Virtual Models"
      descKey="modelsPage.virtualModels.desc"
      descFallback="Manage and configure internally mapped virtual models."
      primaryButton={<VirtualModelsPrimaryButtons />}
      error={error}
    >
      <VirtualModelsTable />
    </CrudPageLayout>
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
