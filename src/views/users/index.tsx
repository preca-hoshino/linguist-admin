import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteUserApi, fetchUsers, type User } from '@/api/users';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/components/ui/Button';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { useAuthStore } from '@/stores/auth-store';
import { usePermission } from '@/stores/permission-store';
import { UserMutateDialog } from './components/UserMutateDialog';
import { UserTable } from './components/UserTable';

export function UsersPage(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('users.title', 'User Management'));

  const canEditUsers = usePermission('users', 'edit');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pageIndex, setPageIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Mutate Dialog state
  const [mutateOpen, setMutateOpen] = useState(false);
  const [mutateMode, setMutateMode] = useState<'create' | 'edit'>('create');
  const [editTarget, setEditTarget] = useState<User | null>(null);

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  const currentUserId = useAuthStore((s) => s.auth.user?.id);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const offset = pageIndex * limit;
      const res = await fetchUsers({ limit, ...(offset > 0 ? { offset } : {}) });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pageIndex]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openCreateDialog = (): void => {
    setMutateMode('create');
    setEditTarget(null);
    setMutateOpen(true);
  };

  const openEditDialog = (user: User): void => {
    setMutateMode('edit');
    setEditTarget(user);
    setMutateOpen(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteUserApi(deleteTarget.id);
      setDeleteTarget(null);
      void loadUsers();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to delete user');
      setDeleteTarget(null);
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
      setBatchDeleteOpen(false);
      setSelectedIds([]);
      void loadUsers();
    } catch {
      /* toast 已处理 */
    }
  };

  return (
    <Main>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('users.title', 'User Management')}</h2>
          <p className="text-muted-foreground">{t('users.desc', 'Manage administrator accounts')}</p>
        </div>

        <Button className="space-x-1" disabled={!canEditUsers} onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          <span>{t('users.create', 'New User')}</span>
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('common.nSelected', { count: selectedIds.length, defaultValue: '{{count}} selected' })}
          </span>
          <PermissionGuard module="users" level="edit">
            <Button
              variant="destructive"
              size="sm"
              className="flex h-7 items-center gap-1.5 px-3 rounded-lg"
              onClick={() => setBatchDeleteOpen(true)}
            >
              <Trash2 size={14} />
              {t('common.delete', 'Delete')}
            </Button>
          </PermissionGuard>
        </div>
      )}

      <UserTable
        users={users}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={setDeleteTarget}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('common.pageInfo', 'Current Page: {{page}}', { page: pageIndex + 1 })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPageIndex((old) => Math.max(old - 1, 0));
            }}
            disabled={pageIndex === 0}
          >
            {t('common.previous', 'Previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPageIndex((old) => old + 1);
            }}
            disabled={pageIndex * limit + users.length >= total}
          >
            {t('common.next', 'Next')}
          </Button>
        </div>
      </div>

      {/* 合并后的 Create/Edit Dialog */}
      <UserMutateDialog
        open={mutateOpen}
        onOpenChange={setMutateOpen}
        mode={mutateMode}
        targetUser={editTarget}
        onSuccess={loadUsers}
      />

      {/* 删除确认 Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title={t('users.delete', 'Delete User')}
        desc={t('users.deleteDesc', {
          defaultValue: `Are you sure you want to delete user "${deleteTarget?.username ?? ''}"? This action cannot be undone.`,
          username: deleteTarget?.username ?? '',
        })}
        confirmText={t('common.delete', 'Delete')}
        destructive
        handleConfirm={() => void handleDelete()}
        className="sm:max-w-sm"
      />

      <ConfirmDialog
        key="users-batch-delete"
        open={batchDeleteOpen}
        onOpenChange={(val) => {
          if (!val) {
            setBatchDeleteOpen(false);
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
    </Main>
  );
}
