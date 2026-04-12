import { VirtualMcpsProvider, useVirtualMcps } from './virtual-mcps-context';
import { VirtualMcpsDialogs } from './virtual-mcps-dialogs';
import { VirtualMcpsTable } from './virtual-mcps-table';
import { VirtualMcpsPrimaryButtons } from './virtual-mcps-primary-buttons';

export function McpVirtualMcpsPage(): React.JSX.Element {
  return (
    <VirtualMcpsProvider>
      <McpVirtualMcpsContent />
    </VirtualMcpsProvider>
  );
}

function McpVirtualMcpsContent(): React.JSX.Element {
  const { error } = useVirtualMcps();

  return (
    <div className="space-y-6">
      <VirtualMcpsDialogs />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Virtual MCPs</h2>
          <p className="text-muted-foreground">Manage virtual MCP server aggregation and tool filtering.</p>
        </div>
        <VirtualMcpsPrimaryButtons />
      </div>

      {error != null && error !== '' ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <VirtualMcpsTable />
    </div>
  );
}
