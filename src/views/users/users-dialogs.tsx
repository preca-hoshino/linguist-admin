/* eslint-disable sonarjs/no-selector-parameter */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteUserApi } from '@/api/users';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuthStore } from '@/stores/auth-store';
import { type UsersDialogType, useUsers } from './users-context';
import { UserMutateDialog } from './components/UserMutateDialog';

export function UsersDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, loadUsers, setCurrentRow, selectedIds, setSelectedIds } = useUsers();
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

  const handleDelete = async (): Promise<void> => {
    if (currentRow?.id === undefined || currentRow.id === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteUserApi(currentRow.id);
      await loadUsers();
      handleOpenChange('delete', false);
    } catch {
      // Ignored here, assume interceptors or toast handled the error
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchDelete = async (): Promise<void> => {
    // 排除自己，防止自删除
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
      void loadUsers();
    } catch {
      // 错误被 toast.promise 捕获并提示 Error 状态
    }
  };

  return (
    <>
      <UserMutateDialog
        key={currentRow?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => {
          handleOpenChange(open as UsersDialogType, isOpen);
        }}
        currentRow={open === 'update' ? currentRow : null}
        onSuccess={loadUsers}
      />

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          handleOpenChange('delete', v);
        }}
        title={t('users.deleteConfirmTitle', 'Delete User?')}
        desc={t(
          'users.deleteConfirmDesc',
          'Are you sure you want to delete this user? This action cannot be undone.',
        )}
        destructive={true}
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
