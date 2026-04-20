import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import type { McpProviderCreateInput, McpProviderUpdateInput } from '@/types/mcp';
import { useProviders } from './providers-context';
import { MutateProviderDialog } from './providers-mutate-dialog';

export function ProvidersDialogs(): React.JSX.Element {
  const { dialogState, setDialogState, createProvider, updateProvider, deleteProvider } = useProviders();
  const { t } = useTranslation();
  const { createOpen, editOpen, deleteOpen, selectedProvider } = dialogState;

  const closeCreate = (): void => {
    setDialogState((p) => ({ ...p, createOpen: false }));
  };
  const closeEdit = (): void => {
    setDialogState((p) => ({ ...p, editOpen: false, selectedProvider: null }));
  };
  const closeDelete = (): void => {
    setDialogState((p) => ({ ...p, deleteOpen: false, selectedProvider: null }));
  };

  return (
    <>
      <MutateProviderDialog
        open={createOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeCreate();
          }
        }}
        mode="create"
        onSubmit={async (data) => {
          const success = await createProvider(data as McpProviderCreateInput);
          if (success) {
            toast.success(t('mcpsPage.providers.createdSuccess', 'Provider created successfully'));
            closeCreate();
          }
        }}
      />

      <MutateProviderDialog
        open={editOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeEdit();
          }
        }}
        mode="edit"
        initialData={selectedProvider}
        onSubmit={async (data) => {
          if (!selectedProvider) {
            return;
          }
          const success = await updateProvider(selectedProvider.id, data as McpProviderUpdateInput);
          if (success) {
            toast.success(t('mcpsPage.providers.updatedSuccess', 'Provider updated successfully'));
            closeEdit();
          }
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={closeDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('mcpsPage.providers.deleteTitle', 'Delete MCP Provider')}</DialogTitle>
            <DialogDescription>{t('common.cannotBeUndone', 'This action cannot be undone.')}</DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            {t(
              'mcpsPage.providers.deleteConfirm',
              'Are you sure you want to delete this provider? All associated connections will be terminated.',
            )}
            <br />
            <strong className="text-foreground">{selectedProvider?.name}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDelete}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedProvider) {
                  return;
                }
                const success = await deleteProvider(selectedProvider.id);
                if (success) {
                  toast.success(t('mcpsPage.providers.deletedSuccess', 'Provider deleted'));
                  closeDelete();
                }
              }}
            >
              {t('common.delete', 'Delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
