import { CrudPageLayout } from '@/components/crud-table';
import { useVirtualMcps, VirtualMcpsProvider } from './virtual-mcps-context';
import { VirtualMcpsDialogs } from './virtual-mcps-dialogs';
import { VirtualMcpsPrimaryButtons } from './virtual-mcps-primary-buttons';
import { VirtualMcpsTable } from './virtual-mcps-table';

function McpVirtualMcpsContent(): React.JSX.Element {
  const { error } = useVirtualMcps();

  return (
    <CrudPageLayout
      titleKey="mcpsPage.virtualMcps.title"
      titleFallback="Virtual MCPs"
      descKey="mcpsPage.virtualMcps.desc"
      descFallback="Manage virtual MCP server aggregation and tool filtering."
      primaryButton={<VirtualMcpsPrimaryButtons />}
      error={error ?? undefined}
    >
      <VirtualMcpsTable />
    </CrudPageLayout>
  );
}

export function McpVirtualMcpsPage(): React.JSX.Element {
  return (
    <VirtualMcpsProvider>
      <McpVirtualMcpsContent />
      <VirtualMcpsDialogs />
    </VirtualMcpsProvider>
  );
}
