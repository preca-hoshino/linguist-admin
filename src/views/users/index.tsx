import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteUserApi, fetchUsers, type User } from '@/api/users';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { usePageTitle } from '@/composables/use-page-title';
import { Main } from '@/layouts/Main';
import { UserMutateDialog } from './components/UserMutateDialog';
import { UserTable } from './components/UserTable';

export function UsersPage(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t('users.title', 'User Management'));

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cursorMap, setCursorMap] = useState<Record<number, string | undefined>>({ 0: undefined });
  const [pageIndex, setPageIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Mutate Dialog state
  const [mutateOpen, setMutateOpen] = useState(false);
  const [mutateMode, setMutateMode] = useState<'create' | 'edit'>('create');
  const [editTarget, setEditTarget] = useState<User | null>(null);

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const startingAfter = cursorMap[pageIndex];
      const res = await fetchUsers({ limit, ...(startingAfter == null ? {} : { starting_after: startingAfter }) });
      if (!res.ok) {
        throw new Error(res.error.message);
      }
      setUsers(res.data.data);
      setTotal(res.data.total);

      if (res.data.data.length > 0) {
        const nextCursor = res.data.data.at(-1)?.id;
        setCursorMap((prev) => {
          if (prev[pageIndex + 1] === nextCursor) {
            return prev;
          }
          return {
            ...prev,
            [pageIndex + 1]: nextCursor,
          };
        });
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, cursorMap]);

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

  return (
    <Main>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('users.title', 'User Management')}</h2>
          <p className="text-muted-foreground">{t('users.desc', 'Manage administrator accounts')}</p>
        </div>

        <Button className="space-x-1" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          <span>{t('users.create', 'New User')}</span>
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <UserTable users={users} loading={loading} onEdit={openEditDialog} onDelete={setDeleteTarget} />

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('common.cursorPage', 'Current Page: {{page}}', { page: pageIndex + 1 })}
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
    </Main>
  );
}
