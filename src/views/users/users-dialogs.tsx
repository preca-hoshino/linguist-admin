/* eslint-disable sonarjs/no-selector-parameter */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteUserApi } from '@/api/users';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuthStore } from '@/stores/auth-store';
import { UserMutateDialog } from './components/UserMutateDialog';
import { type UsersDialogType, useUsers } from './users-context';

export function UsersDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadData, setCurrentRow, selectedIds, setSelectedIds } = useUsers();
  const currentUserId = useAuthStore((s) => s.auth.user?.id);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (type: UsersDialogType, isOpen: boolean): void => {
    if (isOpen) {
      setOpen(type);
    } else {
      setOpen(null);
      setTimeout(() => {
        setCurrentRow(null);
      }, 200);
    }
  };

  const row = currentRow;

  const handleDelete = async (): Promise<void> => {
    if (row === null || row.id === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteUserApi(row.id);
      await loadData();
      handleOpenChange('delete', false);
    } catch {
      // error handled by interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchDelete = async (): Promise<void> => {
    const idsToDelete = selectedIds.filter((id) => id !== currentUserId);
    if (idsToDelete.length === 0) {
      return;
    }
    const total = idsToDelete.length;

    const deletePromise = (async (): Promise<number> => {
      let count = 0;
      for (const id of idsToDelete) {
        await deleteUserApi(id);
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
      void loadData();
    } catch {
      // 错误被 toast.promise 捕获
    }
  };

  return (
    <>
      <UserMutateDialog
        key={row?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => {
          handleOpenChange(open as UsersDialogType, isOpen);
        }}
        currentRow={row}
        onSuccess={() => {
          void loadData();
        }}
      />

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          handleOpenChange('delete', v);
        }}
        title={t('users.deleteConfirmTitle', 'Delete User?')}
        desc={t('users.deleteConfirmDesc', 'Are you sure you want to delete this user? This action cannot be undone.')}
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          void handleDelete();
        }}
        confirmText={isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
      />

      {selectedIds.length > 0 && (
        <ConfirmDialog
          key="users-batch-delete"
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
          desc={t('common.batchDeleteDesc', {
            count: selectedIds.length,
            defaultValue: `Are you sure you want to delete ${selectedIds.length} selected items? This action cannot be undone.`,
          })}
          destructive
          isLoading={false}
          handleConfirm={() => {
            void handleBatchDelete();
          }}
          confirmText={t('common.delete', 'Delete')}
        />
      )}
    </>
  );
}
