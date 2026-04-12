import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { useMcpLogs } from './mcp-logs-context';

export function McpLogsDialogs(): React.JSX.Element {
  const { dialogState, setDialogState } = useMcpLogs();
  const { detailOpen, selectedLog } = dialogState;

  const closeDetail = (): void => {
    setDialogState({ detailOpen: false, selectedLog: null });
  };

  return (
    <Dialog open={detailOpen} onOpenChange={closeDetail}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>MCP Log Detail</DialogTitle>
        </DialogHeader>
        {selectedLog != null && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Method:</span>
                <code className="ml-2 bg-muted px-1.5 py-0.5 rounded text-xs font-semibold">{selectedLog.method}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Direction:</span>
                <Badge className="ml-2" variant={selectedLog.direction === 'inbound' ? 'default' : 'secondary'}>
                  {selectedLog.direction === 'inbound' ? '↓ IN' : '↑ OUT'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Session:</span>
                <code className="ml-2 text-xs">{selectedLog.session_id}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 tabular-nums">{selectedLog.duration_ms}ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <span className="ml-2">{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                {selectedLog.error == null ? (
                  <Badge className="ml-2" variant="outline">
                    OK
                  </Badge>
                ) : (
                  <Badge className="ml-2" variant="destructive">
                    Error
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-1">Params</h4>
              <pre className="bg-muted rounded p-3 text-xs overflow-x-auto max-h-[200px]">
                {JSON.stringify(selectedLog.params, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-1">Result</h4>
              <pre className="bg-muted rounded p-3 text-xs overflow-x-auto max-h-[200px]">
                {JSON.stringify(selectedLog.result, null, 2)}
              </pre>
            </div>

            {selectedLog.error != null && (
              <div>
                <h4 className="text-sm font-semibold mb-1 text-destructive">Error</h4>
                <pre className="bg-destructive/10 border border-destructive/30 rounded p-3 text-xs overflow-x-auto max-h-[200px]">
                  {JSON.stringify(selectedLog.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
