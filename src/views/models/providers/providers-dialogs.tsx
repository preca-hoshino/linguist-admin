import { useTranslation } from 'react-i18next';
import { deleteProvider } from '@/api/model/providers';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useProviders } from './providers-context';
import { ProvidersMutateDialog } from './providers-mutate-dialog';

export function ProvidersDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, setCurrentRow, loadProviders } = useProviders();

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
      void loadProviders();
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
        onSuccess={loadProviders}
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
            onSuccess={loadProviders}
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
    </>
  );
}
