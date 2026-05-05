import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteVirtualModel } from '@/api/model/virtual-models';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useVirtualModels, type VirtualModelsDialogType } from './virtual-models-context';
import { VirtualModelsMutateDialog } from './virtual-models-mutate-dialog';

export function VirtualModelsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadVirtualModels, setCurrentRow, selectedIds, setSelectedIds } =
    useVirtualModels();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDialog = (type: VirtualModelsDialogType): void => {
    setOpen(type);
  };

  const handleCloseDialog = (): void => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 200); // 等待动画结束再清空
  };

  const handleDelete = async (): Promise<void> => {
    if ((currentRow?.id ?? '') === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteVirtualModel(currentRow?.id as string);
      await loadVirtualModels();
      handleCloseDialog();
    } catch {
      // 捕获后忽略或通过通用错误处理器处理
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <VirtualModelsMutateDialog
        key={currentRow?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            handleOpenDialog(open as VirtualModelsDialogType);
          } else {
            handleCloseDialog();
          }
        }}
        currentRow={currentRow}
        onSuccess={loadVirtualModels}
      />

      <AlertDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          if (v) {
            handleOpenDialog('delete');
          } else {
            handleCloseDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('modelsPage.virtualModels.deleteConfirmTitle', 'Delete Virtual Model?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'modelsPage.virtualModels.deleteConfirmDesc',
                'Are you sure you want to delete this virtual model? This action cannot be undone and may break applications relying on it.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('common.deleting', 'Deleting...')}
                </span>
              ) : (
                t('common.delete', 'Delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedIds.length > 0 && (
        <ConfirmDialog
          key="virtual-models-batch-delete"
          open={open === 'batch-delete'}
          onOpenChange={(val) => {
            if (!val) {
              setOpen(null);
              setTimeout(() => setSelectedIds([]), 500);
            }
          }}
          title={t('common.batchDeleteTitle', 'Delete Selected Items')}
          desc={t(
            'common.batchDeleteDesc',
            'Are you sure you want to delete the selected items? This action cannot be undone.',
            { count: selectedIds.length },
          )}
          confirmText={t('common.delete', 'Delete')}
          destructive
          handleConfirm={() => {
            void (async (): Promise<void> => {
              if (selectedIds.length === 0) {
                return;
              }
              const total = selectedIds.length;
              const deletePromise = (async (): Promise<number> => {
                let count = 0;
                for (const id of selectedIds) {
                  await deleteVirtualModel(id);
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
                setOpen(null);
                setTimeout(() => setSelectedIds([]), 500);
                void loadVirtualModels();
              } catch {
                /* toast 已处理 */
              }
            })();
          }}
          className="max-w-md"
        />
      )}
    </>
  );
}
