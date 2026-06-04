import { CrudPageLayout } from '@/components/crud-table';
import { McpLogsProvider, useMcpLogs } from './mcp-logs-context';
import { McpLogsDialogs } from './mcp-logs-dialogs';
import { McpLogsTable } from './mcp-logs-table';

export function McpLogsPage(): React.JSX.Element {
  return (
    <McpLogsProvider>
      <McpLogsContent />
      <McpLogsDialogs />
    </McpLogsProvider>
  );
}

function McpLogsContent(): React.JSX.Element {
  const { error } = useMcpLogs();

  return (
    <CrudPageLayout
      titleKey="mcpsPage.logs.title"
      titleFallback="MCP Logs"
      descKey="mcpsPage.logs.desc"
      descFallback="View all MCP request/response logs processed by the gateway."
      error={error}
    >
      <McpLogsTable />
    </CrudPageLayout>
  );
}
