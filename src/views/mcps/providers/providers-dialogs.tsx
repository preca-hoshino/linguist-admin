import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createMcpProvider, deleteMcpProvider, updateMcpProvider } from '@/api/mcp/provider-mcps';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { McpProvider, McpProviderCreateInput, McpProviderUpdateInput } from '@/types/mcp';
import { type ProvidersDialogType, useProviders } from './providers-context';
import { MutateProviderDialog } from './providers-mutate-dialog';

export function ProvidersDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, setCurrentRow, selectedIds, setSelectedIds, loadData } = useProviders();

  const [isDeleting, setIsDeleting] = useState(false);

  const row = currentRow as McpProvider | null;

  const handleOpenChange = (type: ProvidersDialogType, isOpen: boolean): void => {
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
    if (row === null || row.id === '') {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteMcpProvider(row.id);
      toast.success(t('mcpsPage.providers.deletedSuccess', 'Provider deleted'));
      await loadData();
      handleOpenChange('delete', false);
    } finally {
      setIsDeleting(false);
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
        await deleteMcpProvider(id);
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

  const isEdit = open === 'update';

  return (
    <>
      <MutateProviderDialog
        key={row?.id ?? 'new'}
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen): void => {
          if (open !== null) {
            handleOpenChange(open, isOpen);
          }
        }}
        mode={isEdit ? 'edit' : 'create'}
        initialData={isEdit ? row : null}
        onSubmit={async (data) => {
          if (isEdit && row) {
            const res = await updateMcpProvider(row.id, data as McpProviderUpdateInput);
            if (res.ok) {
              toast.success(t('mcpsPage.providers.updatedSuccess', 'Provider updated successfully'));
              handleOpenChange('update', false);
              await loadData();
            }
          } else {
            const res = await createMcpProvider(data as McpProviderCreateInput);
            if (res.ok) {
              toast.success(t('mcpsPage.providers.createdSuccess', 'Provider created successfully'));
              handleOpenChange('create', false);
              await loadData();
            }
          }
        }}
      />

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          handleOpenChange('delete', v);
        }}
        title={t('mcpsPage.providers.deleteTitle', 'Delete MCP Provider')}
        desc={
          <>
            {t(
              'mcpsPage.providers.deleteConfirm',
              'Are you sure you want to delete this provider? All associated connections will be terminated.',
            )}
            <br />
            <strong className="text-foreground">{row?.name}</strong>
          </>
        }
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          void handleDelete();
        }}
        confirmText={isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
        className="max-w-md"
      />

      {selectedIds.length > 0 && (
        <ConfirmDialog
          key="mcp-providers-batch-delete"
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
          confirmText={t('common.delete', 'Delete')}
          destructive
          isLoading={false}
          handleConfirm={() => {
            void handleBatchDelete();
          }}
          className="max-w-md"
        />
      )}
    </>
  );
}
