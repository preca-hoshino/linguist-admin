import { createFileRoute } from '@tanstack/react-router';
import { getMcpLog } from '@/api/mcp/logs';
import { McpLogDetailPage } from '@/views/mcps/logs/log-detail-page';

export const Route = createFileRoute('/_authenticated/mcps/logs/$id')({
  loader: async ({ params }) => {
    const result = await getMcpLog(params.id);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    return { log: result.data };
  },
  component: McpLogDetailPage,
});
