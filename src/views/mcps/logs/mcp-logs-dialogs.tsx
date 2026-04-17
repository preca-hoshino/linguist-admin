import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { useMcpLogs } from './mcp-logs-context';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { batchDeleteMcpLogs } from '@/api/mcp-logs';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/ScrollArea';

export function McpLogsDialogs(): React.JSX.Element {
  const { open, setOpen, currentRow, setCurrentRow, selectedIds, setSelectedIds, loadLogs } = useMcpLogs();
  const { t } = useTranslation();

  const closeDetail = (): void => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  const handleBatchDelete = async (): Promise<void> => {
    try {
      const res = await batchDeleteMcpLogs(selectedIds);
      if (res.ok) {
        toast.success(t('common.deletedSuccess', 'Successfully deleted'));
        setSelectedIds([]);
        setOpen(null);
        void loadLogs();
      } else {
        toast.error(res.error.message);
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <>
      <Dialog
        open={open === 'detail' && currentRow != null}
        onOpenChange={(val) => {
          if (!val) {
            closeDetail();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col pt-8 pb-6 px-6 overflow-hidden">
          <DialogHeader className="shrink-0 mb-4 px-2">
            <DialogTitle>{t('mcpsPage.logs.detailTitle', 'MCP Log Detail')}</DialogTitle>
            <DialogDescription className="sr-only">Detail</DialogDescription>
          </DialogHeader>

          {currentRow != null && (
            <ScrollArea className="flex-1 overflow-y-auto px-2">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">{t('modelsPage.logs.detailBase', 'Base Info')}</h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 bg-muted/30 p-6 rounded-xl border border-border/50">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('common.id', 'ID')}</div>
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                        {currentRow.id}
                      </code>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('mcpsPage.logs.method', 'Method')}</div>
                      <div className="font-medium text-sm">{currentRow.method}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('mcpsPage.logs.direction', 'Direction')}
                      </div>
                      <Badge variant={currentRow.direction === 'inbound' ? 'outline' : 'secondary'}>
                        {currentRow.direction === 'inbound'
                          ? t('mcpsPage.logs.inbound', '↓ IN')
                          : t('mcpsPage.logs.outbound', '↑ OUT')}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('mcpsPage.logs.session', 'Session')}</div>
                      <code className="text-xs font-mono text-muted-foreground">{currentRow.session_id}</code>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">{t('modelsPage.logs.status', 'Status')}:</span>
                  {currentRow.error == null ? (
                    <Badge variant="outline" className="ml-2 border-green-300 text-green-700 bg-green-50">
                      {t('modelsPage.logs.statusCompleted', 'OK')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2 border-red-300 text-red-700 bg-red-50">
                      {t('modelsPage.logs.statusError', 'Error')}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-muted-foreground">{t('mcpsPage.logs.params', 'Parameters')}:</span>
                  <pre className="max-h-[300px] overflow-y-auto overflow-x-auto w-full bg-muted/50 rounded-lg p-4 font-mono text-xs border border-border/50">
                    {JSON.stringify(currentRow.params, null, 2)}
                  </pre>
                </div>

                {Object.keys(currentRow.result).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground">{t('mcpsPage.logs.result', 'Result')}:</span>
                    <pre className="max-h-[400px] overflow-y-auto overflow-x-auto w-full bg-muted/50 rounded-lg p-4 font-mono text-xs border border-border/50">
                      {JSON.stringify(currentRow.result, null, 2)}
                    </pre>
                  </div>
                )}

                {currentRow.error && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-destructive">
                      {t('mcpsPage.logs.error', 'Error Options')}:
                    </span>
                    <pre className="max-h-[300px] overflow-y-auto overflow-x-auto w-full bg-destructive/10 text-destructive border border-destructive/20 p-4 font-mono text-xs rounded-lg">
                      {JSON.stringify(currentRow.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={open === 'batch-delete' && selectedIds.length > 0}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null);
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
    </>
  );
}
