/* eslint-disable sonarjs/no-selector-parameter */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteApp } from '@/api/apps';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApps, type AppsDialogType } from './apps-context';
import { AppsMutateDialog } from './apps-mutate-dialog';

export function AppsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadApps, setCurrentRow } = useApps();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (type: AppsDialogType, isOpen: boolean): void => {
    if (isOpen) {
      setOpen(type);
    } else {
      setOpen(null);
      setTimeout(() => {
        setCurrentRow(null);
      }, 200); // Wait for animation to finish
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (currentRow?.id === undefined || currentRow.id === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteApp(currentRow.id);
      await loadApps();
      handleOpenChange('delete', false);
    } catch {
      // Ignored here, assume interceptors or toast handled the error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AppsMutateDialog
        key={currentRow?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => {
          handleOpenChange(open as AppsDialogType, isOpen);
        }}
        currentRow={currentRow}
        onSuccess={loadApps}
      />

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          handleOpenChange('delete', v);
        }}
        title={t('apps.deleteConfirmTitle', 'Delete App?')}
        desc={t(
          'apps.deleteConfirmDesc',
          'Are you sure you want to delete this application? All API Keys associated with it will be immediately DELETED and any integrations using these keys will fail.',
        )}
        destructive={true}
        isLoading={isDeleting}
        handleConfirm={() => {
          void handleDelete();
        }}
        confirmText={isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
      />
    </>
  );
}
