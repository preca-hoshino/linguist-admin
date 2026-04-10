/* eslint-disable sonarjs/no-selector-parameter */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteAppKey, rotateAppKey } from '@/api/apps';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { type ApiKeysDialogType, useApiKeys } from './api-keys-context';
import { ApiKeysMutateDialog } from './api-keys-mutate-dialog';

export function ApiKeysDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { appId, open, setOpen, currentRow, loadApiKeys, setCurrentRow } = useApiKeys();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleOpenChange = (type: ApiKeysDialogType, isOpen: boolean): void => {
    if (isOpen) {
      setOpen(type);
    } else {
      setOpen(null);
      setTimeout(() => {
        if (type !== 'copy') {
          setCurrentRow(null);
        }
      }, 200); // 等待动画结束再清空
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (currentRow?.id === undefined || currentRow.id === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteAppKey(appId, currentRow.id);
      await loadApiKeys();
      handleOpenChange('delete', false);
    } catch {
      // 忽略，或者由全局拦截器处理弹窗，或者这里增加 toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRotate = async (): Promise<void> => {
    if (currentRow?.id === undefined || currentRow.id === '') {
      return;
    }
    try {
      setIsRotating(true);
      const res = await rotateAppKey(appId, currentRow.id);
      if (res.ok) {
        await loadApiKeys();
        handleOpenChange('rotate', false);
      }
    } catch {
      // 捕获
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <>
      <ApiKeysMutateDialog
        key={currentRow?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => {
          handleOpenChange(open as ApiKeysDialogType, isOpen);
        }}
        currentRow={currentRow}
        onSuccess={loadApiKeys}
      />

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          handleOpenChange('delete', v);
        }}
        title={t('apiKeys.deleteConfirmTitle', 'Delete API Key?')}
        desc={t(
          'apiKeys.deleteConfirmDesc',
          'Are you sure you want to delete this API Key? This action cannot be undone and any integrations using this key will immediately fail.',
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
        title={t('apiKeys.rotateConfirmTitle', 'Rotate API Key?')}
        desc={t(
          'apiKeys.rotateConfirmDesc',
          'Rotating an API key will invalidate the current key immediately and generate a new one. Do you want to proceed?',
        )}
        destructive={false}
        isLoading={isRotating}
        handleConfirm={() => {
          void handleRotate();
        }}
        confirmText={isRotating ? t('common.rotating', 'Rotating...') : t('common.rotate', 'Rotate')}
      />
    </>
  );
}
