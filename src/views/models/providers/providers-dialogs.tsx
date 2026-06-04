import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteProvider } from '@/api/model/providers';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useProviders } from './providers-context';
import { ProvidersMutateDialog } from './providers-mutate-dialog';

export function ProvidersDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, setCurrentRow, loadData, selectedIds, setSelectedIds } = useProviders();

  const handleDelete = async (): Promise<void> => {
    if (!currentRow) {
      return;
    }
    try {
      await deleteProvider(currentRow.id);
      setOpen(null);
      setTimeout(() => {
        setCurrentRow(null);
      }, 500);
      void loadData();
    } catch {
      // 错误由 API client 统一处理
    }
  };

  return (
    <>
      {/* 新建 Dialog */}
      <ProvidersMutateDialog
        key="provider-create"
        open={open === 'create'}
        onOpenChange={() => {
          setOpen('create');
        }}
        onSuccess={() => {
          void loadData();
        }}
      />

      {/* 编辑 Dialog & 删除确认 */}
      {currentRow && (
        <>
          <ProvidersMutateDialog
            key={`provider-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update');
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
            onSuccess={() => {
              void loadData();
            }}
          />

          <ConfirmDialog
            key="provider-delete"
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete');
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            title={t('common.delete', 'Delete')}
            desc={t('modelsPage.providers.deleteConfirm', {
              defaultValue: 'Are you sure you want to delete provider "{{name}}"? This action cannot be undone.',
              name: currentRow.name,
            })}
            confirmText={t('common.delete', 'Delete')}
            destructive
            handleConfirm={() => void handleDelete()}
            className="max-w-md"
          />
        </>
      )}

      {selectedIds.length > 0 && (
        <ConfirmDialog
          key="providers-batch-delete"
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
          handleConfirm={() => {
            void (async (): Promise<void> => {
              if (selectedIds.length === 0) {
                return;
              }
              const total = selectedIds.length;
              const deletePromise = (async (): Promise<number> => {
                let count = 0;
                for (const id of selectedIds) {
                  await deleteProvider(id);
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
                setTimeout(() => setSelectedIds([]), 500);
                void loadData();
              } catch {
                /* toast 已处理 */
              }
            })();
          }}
          className="max-w-md"
        />
      )}
    </>
  );
}
