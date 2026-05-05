/* eslint-disable sonarjs/no-selector-parameter */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteApp, rotateAppKey } from '@/api/apps';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { type AppsDialogType, useApps } from './apps-context';
import { AppsMutateDialog } from './apps-mutate-dialog';

export function AppsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadApps, setCurrentRow, selectedIds, setSelectedIds } = useApps();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

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

  const handleRotateKey = async (): Promise<void> => {
    if (currentRow?.id === undefined || currentRow.id === '') {
      return;
    }
    try {
      setIsRotating(true);
      await rotateAppKey(currentRow.id);
      toast.success(t('apps.rotateSuccess', 'API Key rotated successfully'));
      await loadApps();
      handleOpenChange('rotate', false);
    } catch {
      toast.error(t('apps.rotateFailed', 'Failed to rotate API Key'));
    } finally {
      setIsRotating(false);
    }
  };

  const handleBatchDelete = async (): Promise<void> => {
    if (selectedIds.length === 0) {
      return;
    }
    const total = selectedIds.length;

    const deletePromise = (async (): Promise<number> => {
      let count = 0;
      for (const id of selectedIds) {
        await deleteApp(id);
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
      setTimeout(() => {
        setSelectedIds([]);
      }, 500);
      void loadApps();
    } catch {
      // 错误被 toast.promise 捕获并提示 Error 状态
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

      <ConfirmDialog
        open={open === 'rotate'}
        onOpenChange={(v) => {
          handleOpenChange('rotate', v);
        }}
        title={t('apps.rotateConfirmTitle', 'Rotate API Key?')}
        desc={t(
          'apps.rotateConfirmDesc',
          'Rotating the API key will immediately invalidate the current key. All existing integrations using the old key will stop working until they are updated with the new key. This action cannot be undone.',
        )}
        destructive={true}
        isLoading={isRotating}
        handleConfirm={() => {
          void handleRotateKey();
        }}
        confirmText={isRotating ? t('common.updating', 'Updating...') : t('apps.rotateConfirmBtn', 'Yes, Rotate Key')}
      />

      {selectedIds.length > 0 && (
        <ConfirmDialog
          key="apps-batch-delete"
          open={open === 'batch-delete'}
          onOpenChange={(val) => {
            if (!val) {
              setOpen(null);
              setTimeout(() => {
                setSelectedIds([]);
              }, 500);
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
          handleConfirm={() => void handleBatchDelete()}
          className="max-w-md"
        />
      )}
    </>
  );
}
