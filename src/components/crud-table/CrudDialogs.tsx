import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { CrudDialogState } from '@/composables/create-crud-context';

// ── Props ────────────────────────────────────────────────────────────────────

export interface CrudDialogsProps<D extends string> {
  /** Context 提供的对话框状态 */
  readonly dialogState: CrudDialogState<D>;
  /** 删除单个资源 */
  readonly onDelete: (id: string) => Promise<boolean>;
  /** 批量删除资源 */
  readonly onBatchDelete?: (ids: string[]) => Promise<number>;
  /** 删除对话框类型名 */
  readonly deleteDialogType: D;
  /** 批量删除对话框类型名 */
  readonly batchDeleteDialogType: D;
  /** 删除成功后的回调（通常是重新加载列表） */
  readonly onSuccess: () => Promise<void>;
  /** 自定义 MutateDialog 渲染（创建/编辑对话框） */
  readonly mutateDialog?: React.ReactNode;
  /** 删除操作确认标题 */
  readonly deleteTitle?: string;
  /** 删除操作确认描述 */
  readonly deleteDescription?: string;
  /** 批量删除操作确认标题 */
  readonly batchDeleteTitle?: string;
}

/**
 * 泛型 CRUD Dialogs 组件 — 处理删除确认对话框和批量删除确认对话框。
 * 创建/编辑对话框通过 `mutateDialog` slot 注入。
 */
export function CrudDialogs<D extends string>({
  dialogState,
  onDelete,
  onBatchDelete,
  deleteDialogType,
  batchDeleteDialogType,
  onSuccess,
  mutateDialog,
  deleteTitle,
  deleteDescription,
  batchDeleteTitle,
}: CrudDialogsProps<D>): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, setCurrentRow, selectedIds, setSelectedIds } = dialogState;

  const [isDeleting, setIsDeleting] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // ── 对话框开关控制 ──────────────────────────────────────────────────

  const handleOpenChange = (type: D, isOpen: boolean): void => {
    if (isOpen) {
      setOpen(type);
    } else {
      setOpen(null);
      setTimeout(() => {
        setCurrentRow(null);
      }, 200); // Wait for animation to finish
    }
  };

  // ── 单个删除 ──────────────────────────────────────────────────────

  const handleDelete = async (): Promise<void> => {
    const row = currentRow as { readonly id: string } | null;
    if (!row?.id) {
      return;
    }
    try {
      setIsDeleting(true);
      await onDelete(row.id);
      await onSuccess();
      handleOpenChange(deleteDialogType, false);
    } catch {
      // error handled by interceptor/toast
    } finally {
      setIsDeleting(false);
    }
  };

  // ── 批量删除 ──────────────────────────────────────────────────────

  const handleBatchDelete = async (): Promise<void> => {
    if (!onBatchDelete || selectedIds.length === 0) {
      return;
    }
    const total = selectedIds.length;
    try {
      setIsBatchDeleting(true);
      const deletedCount = await onBatchDelete(selectedIds);
      toast.success(
        t('common.batchDeleteSuccess', { count: deletedCount, defaultValue: `${deletedCount} items deleted` }),
      );
      await onSuccess();
      handleOpenChange(batchDeleteDialogType, false);
      setSelectedIds([]);
    } catch {
      toast.error(t('common.batchDeleteFailed', 'Batch delete failed'));
    } finally {
      setIsBatchDeleting(false);
    }
  };

  // ── 渲染 ──────────────────────────────────────────────────────────

  const currentRowName =
    ((currentRow as Record<string, unknown>)?.name as string | undefined) ??
    ((currentRow as Record<string, unknown>)?.username as string | undefined) ??
    ((currentRow as Record<string, unknown>)?.id as string) ??
    '';

  return (
    <>
      {/* 创建/编辑对话框 slot */}
      {mutateDialog}

      {/* 删除确认 */}
      <ConfirmDialog
        open={open === deleteDialogType}
        onOpenChange={(isOpen) => {
          handleOpenChange(deleteDialogType, isOpen);
        }}
        title={deleteTitle ?? t('common.confirmDelete', 'Confirm Delete')}
        desc={
          deleteDescription ??
          t('common.confirmDeleteDesc', {
            name: currentRowName,
            defaultValue: `Are you sure you want to delete "${currentRowName}"?`,
          })
        }
        destructive
        handleConfirm={() => {
          void handleDelete();
        }}
        isLoading={isDeleting}
        confirmText={isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
      />

      {/* 批量删除确认 */}
      {onBatchDelete && (
        <ConfirmDialog
          open={open === batchDeleteDialogType}
          onOpenChange={(isOpen) => {
            handleOpenChange(batchDeleteDialogType, isOpen);
          }}
          title={batchDeleteTitle ?? t('common.confirmBatchDelete', 'Confirm Batch Delete')}
          desc={t('common.confirmBatchDeleteDesc', {
            count: selectedIds.length,
            defaultValue: `Are you sure you want to delete ${selectedIds.length} items?`,
          })}
          destructive
          handleConfirm={() => {
            void handleBatchDelete();
          }}
          isLoading={isBatchDeleting}
          confirmText={isBatchDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
        />
      )}
    </>
  );
}
