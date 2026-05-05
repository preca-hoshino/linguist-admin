import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { deleteVirtualMcp } from '@/api/mcp/virtual-mcps';
import { useVirtualMcps } from './virtual-mcps-context';
import type { VirtualMcpCreateInput, VirtualMcpUpdateInput } from '@/types/mcp';
import { MutateVirtualMcpDialog } from './virtual-mcps-mutate-dialog';

export function VirtualMcpsDialogs(): React.JSX.Element {
  const { dialogState, setDialogState, createServer, updateServer, deleteServer } = useVirtualMcps();
  const { t } = useTranslation();
  const { createOpen, editOpen, deleteOpen, batchDeleteOpen, selectedServer, batchSelectedIds } = dialogState;

  const closeCreate = (): void => {
    setDialogState((p) => ({ ...p, createOpen: false }));
  };
  const closeEdit = (): void => {
    setDialogState((p) => ({ ...p, editOpen: false, selectedServer: null }));
  };
  const closeDelete = (): void => {
    setDialogState((p) => ({ ...p, deleteOpen: false, selectedServer: null }));
  };

  return (
    <>
      <MutateVirtualMcpDialog
        open={createOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeCreate();
          }
        }}
        mode="create"
        onSubmit={async (data) => {
          const success = await createServer(data as VirtualMcpCreateInput);
          if (success) {
            toast.success(t('mcpsPage.virtualMcps.createdSuccess', 'Virtual MCP created'));
            closeCreate();
          }
        }}
      />

      <MutateVirtualMcpDialog
        open={editOpen}
        onOpenChange={(open): void => {
          if (!open) {
            closeEdit();
          }
        }}
        mode="edit"
        initialData={selectedServer}
        onSubmit={async (data) => {
          if (!selectedServer) {
            return;
          }
          const success = await updateServer(selectedServer.id, data as VirtualMcpUpdateInput);
          if (success) {
            toast.success(t('mcpsPage.virtualMcps.updatedSuccess', 'Virtual MCP updated'));
            closeEdit();
          }
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={closeDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('mcpsPage.virtualMcps.deleteTitle', 'Delete Virtual MCP')}</DialogTitle>
            <DialogDescription>{t('common.cannotBeUndone', 'This action cannot be undone.')}</DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            {t('mcpsPage.virtualMcps.deleteConfirm', 'Are you sure you want to delete this virtual MCP?')}
            <br />
            <strong className="text-foreground">{selectedServer?.name}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDelete}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedServer) {
                  return;
                }
                const success = await deleteServer(selectedServer.id);
                if (success) {
                  toast.success(t('mcpsPage.virtualMcps.deletedSuccess', 'Virtual MCP deleted'));
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
        key="virtual-mcps-batch-delete"
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
                await deleteVirtualMcp(id);
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
