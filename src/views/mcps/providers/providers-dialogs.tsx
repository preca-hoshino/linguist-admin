import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import type { McpProviderCreateInput, McpProviderUpdateInput } from '@/types/mcp';
import { deleteMcpProvider } from '@/api/mcp/provider-mcps';
import { useProviders } from './providers-context';
import { MutateProviderDialog } from './providers-mutate-dialog';

export function ProvidersDialogs(): React.JSX.Element {
  const { dialogState, setDialogState, createProvider, updateProvider, deleteProvider } = useProviders();
  const { t } = useTranslation();
  const { createOpen, editOpen, deleteOpen, batchDeleteOpen, selectedProvider, batchSelectedIds } = dialogState;

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

      <ConfirmDialog
        key="mcp-providers-batch-delete"
        open={batchDeleteOpen}
        onOpenChange={(val) => {
          if (!val) {
            setDialogState((p) => ({ ...p, batchDeleteOpen: false, batchSelectedIds: [] }));
          }
        }}
        title={t('common.batchDeleteTitle', 'Delete Selected Items')}
        desc={t(
          'common.batchDeleteDesc',
          'Are you sure you want to delete the selected items? This action cannot be undone.',
          { count: batchSelectedIds.length },
        )}
        confirmText={t('common.delete', 'Delete')}
        destructive
        handleConfirm={() => {
          void (async (): Promise<void> => {
            if (batchSelectedIds.length === 0) {
              return;
            }
            const total = batchSelectedIds.length;
            const deletePromise = (async (): Promise<number> => {
              let count = 0;
              for (const id of batchSelectedIds) {
                await deleteMcpProvider(id);
                count++;
              }
              return count;
            })();
            toast.promise(deletePromise, {
              loading: t('common.deletingBatch', { count: total, defaultValue: '正在删除 {{count}} 项...' }),
              success: t('common.deleteBatchSuccess', { count: total, defaultValue: '成功删除 {{count}} 项' }),
              error: t('common.deleteBatchError', { defaultValue: '批量删除遇到错误' }),
            });
            try {
              await deletePromise;
              setDialogState((p) => ({ ...p, batchDeleteOpen: false, batchSelectedIds: [] }));
            } catch {
              /* toast 已处理 */
            }
          })();
        }}
        className="max-w-md"
      />
    </>
  );
}
