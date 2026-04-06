import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteProviderModel } from '@/api/provider-models';
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
import { ProviderModelsMutateDialog } from '@/views/models/provider-models/provider-models-mutate-dialog';
import { type ProviderModelsDialogType, useProviderModelsContext } from './provider-models-context';

export function ProviderModelsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadModels, setCurrentRow, providerId } = useProviderModelsContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const openDialog = (type: ProviderModelsDialogType): void => {
    setOpen(type);
  };

  const closeDialog = (): void => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 200);
  };

  const handleDelete = async (): Promise<void> => {
    if (currentRow?.id == null || currentRow.id === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteProviderModel(currentRow.id);
      await loadModels();
      closeDialog();
    } catch {
      // error handled by global handler
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
            openDialog(open as ProviderModelsDialogType);
          } else {
            closeDialog();
          }
        }}
        currentRow={currentRow}
        onSuccess={loadModels}
        fixedProviderId={providerId}
      />

      <AlertDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          if (v) {
            openDialog('delete');
          } else {
            closeDialog();
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
