import { McpLogsProvider, useMcpLogs } from './mcp-logs-context';
import { McpLogsDialogs } from './mcp-logs-dialogs';
import { McpLogsTable } from './mcp-logs-table';

export function McpLogsPage(): React.JSX.Element {
  return (
    <McpLogsProvider>
      <McpLogsContent />
    </McpLogsProvider>
  );
}

function McpLogsContent(): React.JSX.Element {
  const { error } = useMcpLogs();

  return (
    <div className="space-y-6">
      <McpLogsDialogs />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">MCP Logs</h2>
          <p className="text-muted-foreground">View all MCP request/response logs processed by the gateway.</p>
        </div>
      </div>

      {error != null && error !== '' ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <McpLogsTable />
    </div>
  );
}
