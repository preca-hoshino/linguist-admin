import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'
import { deleteRequestLog } from '@/api/request-logs'
import { useLogs } from './logs-context'

export function LogsDialogs(): React.JSX.Element {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, setCurrentRow, selectedIds, setSelectedIds, loadLogs } = useLogs()

  const handleDelete = async (): Promise<void> => {
    if (!currentRow) return
    try {
      await deleteRequestLog(currentRow.id)
      setOpen(null)
      setTimeout(() => { setCurrentRow(null); }, 500)
      void loadLogs()
    } catch {
      // 错误由 API client 统一处理
    }
  }

  const handleBatchDelete = async (): Promise<void> => {
    if (selectedIds.length === 0) return
    const total = selectedIds.length
    
    // 逐个删除
    const deletePromise = (async (): Promise<number> => {
      let count = 0
      for (const id of selectedIds) {
        await deleteRequestLog(id)
        count++
      }
      return count
    })()

    toast.promise(deletePromise, {
      loading: t('modelsPage.logs.deletingBatch', { count: total, defaultValue: '正在删除 {{count}} 条日志...' }),
      success: t('modelsPage.logs.deleteBatchSuccess', { count: total, defaultValue: '成功删除 {{count}} 条日志' }),
      error: t('modelsPage.logs.deleteBatchError', { defaultValue: '批量删除遇到错误' }),
    })

    try {
      await deletePromise
      setOpen(null)
      setTimeout(() => { setSelectedIds([]); }, 500)
      void loadLogs()
    } catch {
      // 错误被 toast.promise 捕获并提示 Error 状态
    }
  }

  return (
    <>
      {currentRow && (
        <ConfirmDialog
          key='log-delete'
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => { setCurrentRow(null); }, 500)
          }}
          title={t('modelsPage.logs.deleteTitle', 'Delete Log')}
          desc={t('modelsPage.logs.deleteConfirm', 'Are you sure you want to delete this log? This action cannot be undone.')}
          confirmText={t('common.delete', 'Delete')}
          destructive
          handleConfirm={() => void handleDelete()}
          className='max-w-md'
        />
      )}
      
      {selectedIds.length > 0 && (
        <ConfirmDialog
          key='logs-batch-delete'
          open={open === 'batch-delete'}
          onOpenChange={(val) => {
            if (!val) {
              setOpen(null)
              setTimeout(() => { setSelectedIds([]); }, 500)
            }
          }}
          title={t('modelsPage.logs.batchDeleteTitle', 'Delete Selected Logs')}
          desc={t('modelsPage.logs.batchDeleteConfirm', 'Are you sure you want to delete the selected request logs? This action cannot be undone.')}
          confirmText={t('common.delete', 'Delete')}
          destructive
          handleConfirm={() => void handleBatchDelete()}
          className='max-w-md'
        />
      )}
    </>
  )
}
