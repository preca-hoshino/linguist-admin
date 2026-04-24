import { createFileRoute } from '@tanstack/react-router';
import { getVirtualMcp } from '@/api/mcp/virtual-mcps';
import { VirtualMcpDetailPage } from '@/views/mcps/virtual-mcps/virtual-mcp-detail-page';

export const Route = createFileRoute('/_authenticated/mcps/virtual-mcps/$id')({
  loader: async ({ params }) => {
    const result = await getVirtualMcp(params.id);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    return { virtualMcp: result.data };
  },
  component: VirtualMcpDetailPage,
});
