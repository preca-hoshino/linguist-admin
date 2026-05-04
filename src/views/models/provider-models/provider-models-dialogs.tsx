import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteProviderModel } from '@/api/model/provider-models';
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
import { type ProviderModelsDialogType, useProviderModels } from './provider-models-context';
import { ProviderModelsMutateDialog } from './provider-models-mutate-dialog';

export function ProviderModelsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadProviderModels, setCurrentRow, setColumnFilters } = useProviderModels();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpen = (type: ProviderModelsDialogType): void => {
    setOpen(type);
  };

  const handleClose = (): void => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 200); // 等待动画结束再清空
  };

  const handleDelete = async (): Promise<void> => {
    if (!currentRow) {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteProviderModel(currentRow.id);
      await loadProviderModels();
      handleClose();
    } catch {
      // 捕获后忽略或通过通用错误处理器处理
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ProviderModelsMutateDialog
        key={currentRow?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            handleOpen(open as ProviderModelsDialogType);
          } else {
            handleClose();
          }
        }}
        currentRow={currentRow}
        onSuccess={async () => {
          // 创建新模型时，后端默认 is_active=false，若用户当前筛选"仅已启用"会导致新模型不可见。
          // 这里创建后自动清除 is_active 筛选，确保新模型立即可见。
          if (!currentRow) {
            setColumnFilters((prev) => prev.filter((f) => f.id !== 'is_active'));
          }
          await loadProviderModels();
        }}
      />

      <AlertDialog
        open={open === 'delete'}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            handleOpen('delete');
          } else {
            handleClose();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('modelsPage.providerModels.deleteConfirmTitle', 'Delete Provider Model?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'modelsPage.providerModels.deleteConfirmDesc',
                'Are you sure you want to delete this provider model? This action cannot be undone.',
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
    </>
  );
}
