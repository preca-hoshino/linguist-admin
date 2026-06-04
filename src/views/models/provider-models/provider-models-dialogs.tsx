import { useTranslation } from 'react-i18next';
import { deleteProviderModel } from '@/api/model/provider-models';
import { CrudDialogs } from '@/components/crud-table';
import { type ProviderModelsDialogType, useProviderModels } from './provider-models-context';
import { ProviderModelsMutateDialog } from './provider-models-mutate-dialog';

export function ProviderModelsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = useProviderModels();

  return (
    <CrudDialogs<ProviderModelsDialogType>
      dialogState={ctx}
      onDelete={async (id) => {
        await deleteProviderModel(id);
        return true;
      }}
      deleteDialogType="delete"
      batchDeleteDialogType="batch-delete"
      onSuccess={ctx.loadData}
      deleteTitle={t('modelsPage.providerModels.deleteConfirmTitle', 'Delete Provider Model?')}
      deleteDescription={t(
        'modelsPage.providerModels.deleteConfirmDesc',
        'Are you sure you want to delete this provider model? This action cannot be undone.',
      )}
      mutateDialog={
        <ProviderModelsMutateDialog
          key={ctx.currentRow?.id ?? 'new'}
          open={ctx.open === 'create' || ctx.open === 'update'}
          onOpenChange={(isOpen) => {
            if (isOpen) {
              ctx.setOpen(ctx.open as ProviderModelsDialogType);
            } else {
              ctx.setOpen(null);
              setTimeout(() => ctx.setCurrentRow(null), 200);
            }
          }}
          currentRow={ctx.currentRow}
          onSuccess={async () => {
            if (!ctx.currentRow) {
              ctx.setColumnFilters((prev) => prev.filter((f) => f.id !== 'is_active'));
            }
            await ctx.loadData();
          }}
        />
      }
    />
  );
}
