import { createFileRoute } from '@tanstack/react-router';
import { getMcpProvider } from '@/api/mcp/provider-mcps';
import { McpProviderDetailPage } from '@/views/mcps/providers/provider-detail-page';

export const Route = createFileRoute('/_authenticated/mcps/providers/$id')({
  loader: async ({ params }) => {
    const result = await getMcpProvider(params.id);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    return { provider: result.data };
  },
  component: McpProviderDetailPage,
});
