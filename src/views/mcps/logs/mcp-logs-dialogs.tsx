import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteMcpLog } from '@/api/mcp/logs';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useMcpLogs } from './mcp-logs-context';

export function McpLogsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const { open, setOpen, currentRow, setCurrentRow, selectedIds, setSelectedIds, loadData } = useMcpLogs();

  // ── 单条删除
  const handleDelete = async (): Promise<void> => {
    if (!currentRow) {
      return;
    }
    try {
      await deleteMcpLog(currentRow.id);
      setOpen(null);
      setTimeout(() => {
        setCurrentRow(null);
      }, 500);
      void loadData();
    } catch {
      // 错误由 API client 统一处理
    }
  };

  // ── 批量删除（前端循环逐条调用单条接口）
  const handleBatchDelete = async (): Promise<void> => {
    if (selectedIds.length === 0) {
      return;
    }
    const total = selectedIds.length;

    const deletePromise = (async (): Promise<number> => {
      let count = 0;
      for (const id of selectedIds) {
        await deleteMcpLog(id);
        count++;
      }
      return count;
    })();

    toast.promise(deletePromise, {
      loading: t('mcpsPage.logs.deletingBatch', { count: total, defaultValue: '正在删除 {{count}} 条日志...' }),
      success: t('mcpsPage.logs.deleteBatchSuccess', { count: total, defaultValue: '成功删除 {{count}} 条日志' }),
      error: t('mcpsPage.logs.deleteBatchError', { defaultValue: '批量删除遇到错误' }),
    });

    try {
      await deletePromise;
      setOpen(null);
      setTimeout(() => {
        setSelectedIds([]);
      }, 500);
      void loadData();
    } catch {
      // 错误被 toast.promise 捕获并提示 Error 状态
    }
  };

  return (
    <>
      {currentRow && (
        <ConfirmDialog
          key="mcp-log-delete"
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete');
            setTimeout(() => {
              setCurrentRow(null);
            }, 500);
          }}
          title={t('mcpsPage.logs.deleteTitle', 'Delete MCP Log')}
          desc={t(
            'mcpsPage.logs.deleteConfirm',
            'Are you sure you want to delete this MCP log? This action cannot be undone.',
          )}
          confirmText={t('common.delete', 'Delete')}
          destructive
          handleConfirm={() => void handleDelete()}
          className="max-w-md"
        />
      )}

      {selectedIds.length > 0 && (
        <ConfirmDialog
          key="mcp-logs-batch-delete"
          open={open === 'batch-delete'}
          onOpenChange={(val) => {
            if (!val) {
              setOpen(null);
              setTimeout(() => {
                setSelectedIds([]);
              }, 500);
            }
          }}
          title={t('mcpsPage.logs.batchDeleteTitle', 'Delete Selected Logs')}
          desc={t(
            'mcpsPage.logs.batchDeleteConfirm',
            'Are you sure you want to delete the selected MCP logs? This action cannot be undone.',
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
